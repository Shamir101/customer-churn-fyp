from flask import Blueprint, jsonify
from models import PredictionResult

bp = Blueprint('results', __name__, url_prefix='/api/results')

@bp.route('/', methods=['GET'])
def get_results():
    results = PredictionResult.query.all()
    data = []
    for r in results:
        data.append({
            "id": r.id,
            "churn_probability": r.churn_probability,
            "prediction_date": r.prediction_date
        })
    return jsonify(data), 200

@bp.route('/export', methods=['GET'])
def export_results():
    fmt = request.args.get('format', 'csv')
    return jsonify({"message": f"Export in {fmt} coming soon"}), 200
