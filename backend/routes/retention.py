from flask import Blueprint, request, jsonify
from extensions import db
from models import Recommendation

bp = Blueprint('retention', __name__, url_prefix='/api/retention')

@bp.route('/', methods=['GET'])
def get_retention_strategies():
    recommendations = Recommendation.query.all()
    data = [{"id": r.id, "strategy": r.strategy_text} for r in recommendations]
    return jsonify(data), 200
