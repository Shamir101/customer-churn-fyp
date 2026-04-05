from flask import Blueprint, request, jsonify
from extensions import db
from models import MLModel, PredictionResult, RiskClassification, Recommendation

bp = Blueprint('prediction', __name__, url_prefix='/api/predictions')

@bp.route('/batch', methods=['POST'])
def predict_batch():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    model_id = request.form.get('model_id')
    if not model_id:
        return jsonify({"message": "Model ID required"}), 400
        
    # Process file with predicting service...
    # return predictions
    return jsonify({"message": "Batch prediction complete", "predictions": []}), 200

@bp.route('/single', methods=['POST'])
def predict_single():
    data = request.json
    model_id = data.get('model_id')
    
    # Mock prediction flow
    churn_prob = 0.75 
    
    new_pred = PredictionResult(
        customer_data_summary=str(data.get('features', {})),
        churn_probability=churn_prob,
        model_id=model_id
    )
    db.session.add(new_pred)
    db.session.flush() # get ID
    
    risk_level = "High" if churn_prob > 0.7 else "Medium" if churn_prob > 0.3 else "Low"
    new_risk = RiskClassification(risk_level=risk_level, prediction_id=new_pred.id)
    db.session.add(new_risk)
    db.session.flush()
    
    rec = Recommendation(strategy_text="Immediate outreach", risk_classification_id=new_risk.id)
    db.session.add(rec)
    db.session.commit()
    
    return jsonify({"message": "Prediction complete", "churn_probability": churn_prob, "risk_level": risk_level}), 200
