from flask import Blueprint, request, jsonify
from extensions import db
from models import Admin, User, Session
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    role = data.get('role', 'user')
    if role == 'admin':
        admin = Admin(username=data['username'], password_hash=data['password'])
        db.session.add(admin)
    else:
        user = User(username=data['username'], email=data['email'], password_hash=data['password'])
        db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Successfully registered"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    role = data.get('role', 'user')
    user_or_admin = None
    
    if role == 'admin':
        user_or_admin = Admin.query.filter_by(username=data.get('username'), password_hash=data.get('password')).first()
    else:
        user_or_admin = User.query.filter_by(username=data.get('username'), password_hash=data.get('password')).first()
        
    if not user_or_admin:
        return jsonify({"message": "Invalid credentials"}), 401
        
    access_token = create_access_token(identity={'id': user_or_admin.id, 'role': role})
    
    new_session = Session(token=access_token)
    if role == 'admin': new_session.admin_id = user_or_admin.id
    else: new_session.user_id = user_or_admin.id
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify(access_token=access_token)
