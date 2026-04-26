from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User, Session
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import re

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email_format(email):
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password):
    """Validate password strength: min 8 chars, at least 1 letter and 1 number"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, "Valid"

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        print(f"DEBUG: Received registration request: {data}")
        
        # Validate required fields
        if not all(k in data for k in ['name', 'email', 'password', 'confirmPassword']):
            missing = [k for k in ['name', 'email', 'password', 'confirmPassword'] if k not in data]
            print(f"DEBUG: Missing fields: {missing}")
            return jsonify({"error": f"Missing required fields: {missing}"}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        
        print(f"DEBUG: name='{name}', email='{email}', password='***', confirmPassword='***'")
        
        # Validate name
        if len(name) < 2:
            print(f"DEBUG: Name too short: {len(name)}")
            return jsonify({"error": "Name must be at least 2 characters"}), 400
        
        # Validate email format
        if not validate_email_format(email):
            print(f"DEBUG: Email invalid format: {email}")
            return jsonify({"error": "Invalid email format"}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            print(f"DEBUG: Email already exists: {email}")
            return jsonify({"error": "Email already registered"}), 409
        
        # Validate password match
        if password != confirm_password:
            print(f"DEBUG: Passwords don't match")
            return jsonify({"error": "Passwords do not match"}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            print(f"DEBUG: Password validation failed: {message}")
            return jsonify({"error": message}), 400
        
        print(f"DEBUG: All validation passed, creating user")
        
        # Create new user
        user = User(
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
            created_at=datetime.utcnow()
        )
        db.session.add(user)
        db.session.commit()
        
        print(f"DEBUG: User created successfully: {user.id}")
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 201
        
    except Exception as e:
        print(f"DEBUG: Exception during registration: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        remember_me = data.get('rememberMe', False)
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Create JWT token with extended expiry if remember_me is true
        if remember_me:
            # 30 days
            expires = timedelta(days=30)
        else:
            # 24 hours
            expires = timedelta(hours=24)
        
        access_token = create_access_token(
            identity={'id': user.id, 'email': user.email},
            expires_delta=expires
        )
        
        # Store session
        session = Session(
            token=access_token,
            user_id=user.id,
            created_at=datetime.utcnow()
        )
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user by invalidating session"""
    try:
        current_user = get_jwt_identity()
        
        # Delete session from database
        Session.query.filter_by(user_id=current_user['id']).delete()
        db.session.commit()
        
        return jsonify({"message": "Logout successful"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user['id'])
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Handle forgot password request"""
    try:
        data = request.json
        email = data.get('email', '').strip()
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # For security, always return same message whether email exists or not
        user = User.query.filter_by(email=email).first()
        
        # TODO: Send password reset email
        # In production, generate a reset token, store in database with expiry,
        # and send email with reset link
        
        return jsonify({
            "message": "If an account exists with this email, a reset link has been sent"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
