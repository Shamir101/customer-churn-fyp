from flask import Blueprint, request, jsonify
from extensions import db
from models import Dataset, MLModel
# from services.training import train_models

bp = Blueprint('training', __name__, url_prefix='/api/models')

@bp.route('/train', methods=['POST'])
def train_model():
    data = request.json
    dataset_id = data.get('dataset_id')
    dataset = Dataset.query.get(dataset_id)
    if not dataset:
        return jsonify({"message": "Dataset not found"}), 404
        
    # Example integration:
    # metrics, best_model_path = train_models(dataset.filename)
    # mock metrics for structure:
    accuracy = 0.85
    algo = 'LightGBM'
    
    new_model = MLModel(name="Churn_Predictor_v1", algorithm=algo, accuracy=accuracy, dataset_id=dataset.id)
    db.session.add(new_model)
    db.session.commit()
    
    return jsonify({"message": "Model trained successfully", "model_id": new_model.id, "accuracy": accuracy}), 200
