from flask import Blueprint, jsonify
bp = Blueprint('retention', __name__, url_prefix='/api/retention')

STRATEGIES = {
    'High':   [
        'Assign a dedicated account manager for immediate personal outreach.',
        'Offer a time-limited exclusive discount (15–25%) on current plan.',
        'Enrol customer in a priority loyalty programme with bonus rewards.',
        'Schedule a service quality review call within 24 hours.',
        'Provide a free service upgrade for the next billing cycle.',
    ],
    'Medium': [
        'Send a personalised satisfaction survey via email.',
        'Offer a loyalty reward (bonus data or service add-on).',
        'Conduct a proactive service quality check.',
        'Present an optional contract upgrade with a small incentive.',
        'Invite to premium customer engagement events or webinars.',
    ],
    'Low':    [
        'Include customer in standard email newsletter campaigns.',
        'Invite to refer-a-friend programme for mutual rewards.',
        'Provide educational content about underused service features.',
        'Send a periodic satisfaction check-in every 90 days.',
        'Offer optional service bundles at competitive pricing.',
    ],
}

@bp.route('/<string:risk_level>', methods=['GET'])
def get_strategies(risk_level):
    risk_level = risk_level.capitalize()
    if risk_level not in STRATEGIES:
        return jsonify({'error': 'Invalid risk level. Use High, Medium, or Low.'}), 400
    return jsonify({'risk_level': risk_level, 'strategies': STRATEGIES[risk_level]}), 200
