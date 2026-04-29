from flask import Blueprint, jsonify
bp = Blueprint('training', __name__, url_prefix='/api/models')

MODEL_METRICS = [
    {'name': 'LightGBM',           'algorithm': 'LightGBM',            'accuracy': 78.39, 'auc': 82.98, 'status': 'Production'},
    {'name': 'XGBoost',            'algorithm': 'XGBoost',             'accuracy': 77.83, 'auc': 81.97, 'status': 'Evaluated'},
    {'name': 'Logistic Regression','algorithm': 'Logistic Regression', 'accuracy': 74.20, 'auc': 78.50, 'status': 'Baseline'},
    {'name': 'Random Forest',      'algorithm': 'Random Forest',       'accuracy': 76.80, 'auc': 80.10, 'status': 'Evaluated'},
]

@bp.route('/', methods=['GET'])
def list_models():
    return jsonify({'models': MODEL_METRICS}), 200
