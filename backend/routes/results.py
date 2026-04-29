from flask import Blueprint, jsonify
bp = Blueprint('results',   __name__, url_prefix='/api/results')

@bp.route('/', methods=['GET'])
def results():
    return jsonify({'message': 'Results endpoint ready'}), 200
