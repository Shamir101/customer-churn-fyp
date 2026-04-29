from flask import Blueprint, request, jsonify
from database import get_db
from routes.auth import verify_token
from werkzeug.utils import secure_filename
from config import Config
import os, pandas as pd
from datetime import datetime

bp = Blueprint('dataset', __name__, url_prefix='/api/datasets')
ALLOWED = {'csv', 'xlsx', 'xls', 'json'}

def _allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED

def _auth(req):
    token = req.headers.get('Authorization', '').replace('Bearer ', '').strip()
    return verify_token(token)


@bp.route('/upload', methods=['POST'])
def upload():
    payload = _auth(request)
    if not payload:
        return jsonify({'error': 'Unauthorised'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '' or not _allowed(file.filename):
        return jsonify({'error': 'Invalid or unsupported file type. Use CSV, XLSX, or JSON.'}), 400

    # Size check
    file.seek(0, os.SEEK_END)
    size = file.tell(); file.seek(0)
    if size > 50 * 1024 * 1024:
        return jsonify({'error': 'File too large (max 50 MB)'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    try:
        if ext == 'csv':    df = pd.read_csv(file)
        elif ext == 'json': df = pd.read_json(file)
        else:               df = pd.read_excel(file)
        if df.empty:
            return jsonify({'error': 'File is empty'}), 400

        # Strict Schema Validation
        required_cols = {'tenure', 'MonthlyCharges', 'Contract', 'InternetService', 'PaymentMethod'}
        missing = required_cols - set(df.columns)
        if missing:
            return jsonify({'error': f'Schema Validation Failed: Missing required columns: {", ".join(missing)}. Please upload a valid Telco Churn dataset.'}), 422

        file.seek(0)
    except Exception as e:
        return jsonify({'error': f'Cannot read file: {e}'}), 400

    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S_')
    filename  = timestamp + secure_filename(file.filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    file.save(os.path.join(Config.UPLOAD_FOLDER, filename))

    conn = get_db()
    try:
        cur = conn.execute(
            'INSERT INTO datasets (filename, user_id) VALUES (?, ?)',
            (filename, payload['id'])
        )
        conn.commit()
        return jsonify({
            'message':    'Dataset uploaded successfully',
            'dataset_id': cur.lastrowid,
            'filename':   filename,
            'rows':       len(df),
            'columns':    len(df.columns)
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@bp.route('/', methods=['GET'])
def list_datasets():
    payload = _auth(request)
    if not payload:
        return jsonify({'error': 'Unauthorised'}), 401

    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT id, filename, status, upload_date FROM datasets WHERE user_id = ? ORDER BY upload_date DESC',
            (payload['id'],)
        ).fetchall()
        return jsonify({'datasets': [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@bp.route('/<int:dataset_id>', methods=['DELETE'])
def delete_dataset(dataset_id):
    payload = _auth(request)
    if not payload:
        return jsonify({'error': 'Unauthorised'}), 401

    conn = get_db()
    try:
        row = conn.execute(
            'SELECT filename FROM datasets WHERE id = ? AND user_id = ?',
            (dataset_id, payload['id'])
        ).fetchone()
        if not row:
            return jsonify({'error': 'Dataset not found'}), 404

        filepath = os.path.join(Config.UPLOAD_FOLDER, row['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)

        conn.execute('DELETE FROM datasets WHERE id = ?', (dataset_id,))
        conn.commit()
        return jsonify({'message': 'Dataset deleted'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
