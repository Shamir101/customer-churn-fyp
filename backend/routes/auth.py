from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
import jwt as pyjwt
import re
import os
from datetime import datetime, timedelta
from config import Config

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def _make_token(user_id, email, remember_me=False):
    """Create a signed JWT token."""
    exp_seconds = Config.JWT_REMEMBER_ME_EXPIRES if remember_me else Config.JWT_ACCESS_TOKEN_EXPIRES
    payload = {
        'id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(seconds=exp_seconds)
    }
    return pyjwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def verify_token(token):
    """Decode and verify a JWT token. Returns payload dict or None."""
    try:
        return pyjwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None

def _validate_email(email):
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))

def _validate_password(password):
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    if not re.search(r'[a-zA-Z]', password):
        return False, 'Password must contain at least one letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    return True, 'Valid'


@bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    confirm  = data.get('confirmPassword', '')

    if not all([name, email, password, confirm]):
        return jsonify({'error': 'All fields are required'}), 400
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    if not _validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    if password != confirm:
        return jsonify({'error': 'Passwords do not match'}), 400

    ok, msg = _validate_password(password)
    if not ok:
        return jsonify({'error': msg}), 400

    conn = get_db()
    try:
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            return jsonify({'error': 'Email already registered'}), 409

        password_hash = generate_password_hash(password)
        cur = conn.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            (name, email, password_hash)
        )
        conn.commit()
        return jsonify({'message': 'Registered successfully', 'user_id': cur.lastrowid}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    email       = data.get('email', '').strip()
    password    = data.get('password', '')
    remember_me = data.get('rememberMe', False)

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db()
    try:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401

        token = _make_token(user['id'], user['email'], remember_me)
        conn.execute(
            'INSERT INTO sessions (token, user_id) VALUES (?, ?)',
            (token, user['id'])
        )
        conn.commit()

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@bp.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return jsonify({'error': 'Token required'}), 401

    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    conn = get_db()
    try:
        conn.execute('DELETE FROM sessions WHERE user_id = ?', (payload['id'],))
        conn.commit()
        return jsonify({'message': 'Logout successful'}), 200
    finally:
        conn.close()


@bp.route('/me', methods=['GET'])
def me():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    try:
        user = conn.execute('SELECT id, name, email, created_at FROM users WHERE id = ?',
                            (payload['id'],)).fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': dict(user)}), 200
    finally:
        conn.close()


@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    # Security-neutral: same response whether email exists or not
    return jsonify({
        'message': 'If an account exists with this email, a password reset link has been sent.'
    }), 200
