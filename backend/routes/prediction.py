from flask import Blueprint, request, jsonify, Response
from database import get_db
from routes.auth import verify_token
import joblib, os, json, io
import pandas as pd

bp = Blueprint('prediction', __name__, url_prefix='/api/predictions')

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'lgbm_model.pkl')

# Load model once at import time
try:
    _model = joblib.load(MODEL_PATH)
    print("[SUCCESS] LightGBM model loaded successfully.")
except Exception as e:
    _model = None
    print(f"[WARNING] Could not load LightGBM model: {e}")

def _get_recommendation(risk_level):
    recommendations = {
        'High':   'Immediate personal outreach, exclusive discount offer, priority loyalty program enrolment, and dedicated account manager assignment.',
        'Medium': 'Proactive service quality check, personalised loyalty rewards, satisfaction survey, and optional service upgrade offer.',
        'Low':    'Standard email engagement, educational newsletter, referral programme invitation, no urgent action required.'
    }
    return recommendations.get(risk_level, 'No recommendation available.')

def _require_auth(request):
    """Return payload dict if token valid, else None."""
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()
    return verify_token(token)


@bp.route('/single', methods=['POST'])
def predict_single():
    payload = _require_auth(request)
    if not payload:
        return jsonify({'error': 'Unauthorised'}), 401

    data     = request.json or {}
    features = data.get('features', {})

    # ── Real inference ──────────────────────────────────────────────────────
    churn_prob = 0.75   # fallback
    if _model is not None:
        try:
            # Build a one-row DataFrame that matches the training schema
            tenure          = float(features.get('tenure', 12))
            monthly_charges = float(features.get('monthly_charges', 65))
            total_charges   = float(features.get('total_charges', tenure * monthly_charges))

            # Contract type one-hot (Month-to-month, One year, Two year)
            contract = features.get('contract_type', 'Month-to-month')
            contract_one_year = 1 if contract == 'One year'  else 0
            contract_two_year = 1 if contract == 'Two year'  else 0

            # Internet service one-hot (DSL, Fiber optic, No)
            internet = features.get('internet_service', 'Fiber optic')
            internet_no       = 1 if internet == 'No'           else 0
            internet_fiber    = 1 if internet == 'Fiber optic'  else 0

            # Payment method one-hot
            payment = features.get('payment_method', 'Electronic check')
            pay_credit     = 1 if payment == 'Credit card (automatic)'   else 0
            pay_echeck     = 1 if payment == 'Electronic check'          else 0
            pay_mcheck     = 1 if payment == 'Mailed check'              else 0

            # Binary flags
            def _bin(key): return 1 if str(features.get(key, 'No')).lower() in ('yes','1','true') else 0

            row = {
                'tenure':                            tenure,
                'MonthlyCharges':                    monthly_charges,
                'TotalCharges':                      total_charges,
                'SeniorCitizen':                     _bin('senior_citizen'),
                'Partner_Yes':                       _bin('partner'),
                'Dependents_Yes':                    _bin('dependents'),
                'PhoneService_Yes':                  _bin('phone_service'),
                'PaperlessBilling_Yes':              _bin('paperless_billing'),
                'MultipleLines_No phone service':    0,
                'MultipleLines_Yes':                 _bin('multiple_lines'),
                'InternetService_No':                internet_no,
                'InternetService_Fiber optic':       internet_fiber,
                'OnlineSecurity_No internet service':0,
                'OnlineSecurity_Yes':                _bin('online_security'),
                'OnlineBackup_No internet service':  0,
                'OnlineBackup_Yes':                  _bin('online_backup'),
                'DeviceProtection_No internet service':0,
                'DeviceProtection_Yes':              _bin('device_protection'),
                'TechSupport_No internet service':   0,
                'TechSupport_Yes':                   _bin('tech_support'),
                'StreamingTV_No internet service':   0,
                'StreamingTV_Yes':                   _bin('streaming_tv'),
                'StreamingMovies_No internet service':0,
                'StreamingMovies_Yes':               _bin('streaming_movies'),
                'Contract_One year':                 contract_one_year,
                'Contract_Two year':                 contract_two_year,
                'PaymentMethod_Credit card (automatic)': pay_credit,
                'PaymentMethod_Electronic check':    pay_echeck,
                'PaymentMethod_Mailed check':        pay_mcheck,
            }

            df = pd.DataFrame([row])
            
            # Align columns
            col_file = os.path.join(os.path.dirname(__file__), '..', 'ml', 'feature_columns.json')
            with open(col_file, 'r') as f:
                expected_cols = json.load(f)
            
            for col in expected_cols:
                if col not in df.columns:
                    df[col] = 0
            df = df[expected_cols]

            churn_prob = float(_model.predict_proba(df)[:, 1][0])
        except Exception as ex:
            print(f"Inference error: {ex} — using fallback probability")

    risk_level     = 'High' if churn_prob >= 0.70 else ('Medium' if churn_prob >= 0.40 else 'Low')
    recommendation = _get_recommendation(risk_level)

    # ── Persist to DB ───────────────────────────────────────────────────────
    conn = get_db()
    try:
        conn.execute(
            '''INSERT INTO prediction_results
               (user_id, customer_data_summary, churn_probability, risk_level, recommendation)
               VALUES (?, ?, ?, ?, ?)''',
            (payload['id'], json.dumps(features), churn_prob, risk_level, recommendation)
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({
        'churn_probability': round(churn_prob * 100, 1),
        'risk_level':        risk_level,
        'recommendation':    recommendation
    }), 200

from config import Config

def _process_batch(dataset_id, user_id):
    conn = get_db()
    try:
        row = conn.execute(
            'SELECT filename FROM datasets WHERE id = ? AND user_id = ?',
            (dataset_id, user_id)
        ).fetchone()
        if not row: return None, ({'error': 'Dataset not found'}, 404)
        filename = row['filename']
    finally:
        conn.close()

    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return None, ({'error': 'File missing on server'}, 404)

    try:
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'csv'
        if ext == 'csv':    df = pd.read_csv(filepath)
        elif ext == 'json': df = pd.read_json(filepath)
        else:               df = pd.read_excel(filepath)
    except Exception as e:
        return None, ({'error': f'Cannot read file: {e}'}, 400)

    if _model is None:
        return None, ({'error': 'Model not loaded.'}, 500)

    col_file = os.path.join(os.path.dirname(__file__), '..', 'ml', 'feature_columns.json')
    try:
        with open(col_file, 'r') as f:
            expected_cols = json.load(f)
    except Exception as e:
        return None, ({'error': f'Cannot load feature mapping: {e}'}, 500)

    df_clean = df.copy()
    if 'TotalCharges' in df_clean.columns:
        df_clean['TotalCharges'] = pd.to_numeric(df_clean['TotalCharges'], errors='coerce').fillna(0)
    if 'customerID' in df_clean.columns:
        df_clean.drop(columns=['customerID'], inplace=True)
    if 'Churn' in df_clean.columns:
        df_clean.drop(columns=['Churn'], inplace=True)

    df_encoded = pd.get_dummies(df_clean, drop_first=True)
    for col in expected_cols:
        if col not in df_encoded.columns:
            df_encoded[col] = 0
    df_encoded = df_encoded[expected_cols]

    try:
        probs = _model.predict_proba(df_encoded)[:, 1]
    except Exception as e:
        return None, ({'error': f'Inference failed: {e}'}, 500)
    
    df['Churn Probability (%)'] = (probs * 100).round(1)
    df['Risk Level'] = pd.cut(probs, bins=[-0.1, 0.4, 0.7, 1.1], labels=['Low', 'Medium', 'High'])
    df['Recommendation'] = df['Risk Level'].apply(_get_recommendation)

    return df, filename

@bp.route('/batch/<int:dataset_id>/download', methods=['GET'])
def predict_batch_download(dataset_id):
    payload = _require_auth(request)
    if not payload: return jsonify({'error': 'Unauthorised'}), 401
    
    df, err = _process_batch(dataset_id, payload['id'])
    if df is None: return jsonify(err[0]), err[1]

    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_buf.seek(0)
    
    out_filename = "predictions_" + err  # err is filename here
    return Response(
        csv_buf.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={out_filename}"}
    )

@bp.route('/batch/<int:dataset_id>/json', methods=['GET'])
def predict_batch_json(dataset_id):
    payload = _require_auth(request)
    if not payload: return jsonify({'error': 'Unauthorised'}), 401
    
    df, err = _process_batch(dataset_id, payload['id'])
    if df is None: return jsonify(err[0]), err[1]

    # Calculate summaries
    total = int(len(df))
    high = int(len(df[df['Risk Level'] == 'High']))
    medium = int(len(df[df['Risk Level'] == 'Medium']))
    low = int(len(df[df['Risk Level'] == 'Low']))
    avg_churn = float(round(df['Churn Probability (%)'].mean(), 1))

    # Return top 100 rows for the table
    records = df.head(100).fillna('').to_dict(orient='records')

    return jsonify({
        'summary': {
            'total': total,
            'high': high,
            'medium': medium,
            'low': low,
            'avg_churn': avg_churn
        },
        'filename': err,
        'records': records
    }), 200


@bp.route('/history', methods=['GET'])
def history():
    payload = _require_auth(request)
    if not payload:
        return jsonify({'error': 'Unauthorised'}), 401

    conn = get_db()
    try:
        rows = conn.execute(
            '''SELECT id, churn_probability, risk_level, recommendation, prediction_date
               FROM prediction_results WHERE user_id = ?
               ORDER BY prediction_date DESC LIMIT 20''',
            (payload['id'],)
        ).fetchall()
        return jsonify({'history': [dict(r) for r in rows]}), 200
    finally:
        conn.close()
