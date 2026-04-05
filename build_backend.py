import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

BASE_DIR = 'backend'

# ----------------- config.py -----------------
config_py = """
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-fyp-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///customer_churn.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-super-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    ML_MODELS_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ml')
"""

# ----------------- extensions.py -----------------
extensions_py = """
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
"""

# ----------------- models.py (Combined for simplicity) -----------------
models_py = """
from extensions import db
from datetime import datetime

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    datasets = db.relationship('Dataset', backref='admin', lazy=True)
    sessions = db.relationship('Session', backref='admin_session', lazy=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    sessions = db.relationship('Session', backref='user_session', lazy=True)

class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

class Dataset(db.Model):
    __tablename__ = 'datasets'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(150), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Uploaded') # Uploaded, Preprocessed
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=False)
    models = db.relationship('MLModel', backref='dataset', lazy=True)

class MLModel(db.Model):
    __tablename__ = 'ml_models'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    algorithm = db.Column(db.String(50), nullable=False) # LightGBM, XGBoost
    accuracy = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'), nullable=False)
    predictions = db.relationship('PredictionResult', backref='model', lazy=True)

class PredictionResult(db.Model):
    __tablename__ = 'prediction_results'
    id = db.Column(db.Integer, primary_key=True)
    customer_data_summary = db.Column(db.String(500), nullable=False)
    churn_probability = db.Column(db.Float, nullable=False)
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow)
    model_id = db.Column(db.Integer, db.ForeignKey('ml_models.id'), nullable=False)
    risk_classification = db.relationship('RiskClassification', backref='prediction', uselist=False)

class RiskClassification(db.Model):
    __tablename__ = 'risk_classifications'
    id = db.Column(db.Integer, primary_key=True)
    risk_level = db.Column(db.String(20), nullable=False) # High, Medium, Low
    prediction_id = db.Column(db.Integer, db.ForeignKey('prediction_results.id'), nullable=False, unique=True)
    recommendation = db.relationship('Recommendation', backref='risk_class', uselist=False)

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    id = db.Column(db.Integer, primary_key=True)
    strategy_text = db.Column(db.String(500), nullable=False)
    risk_classification_id = db.Column(db.Integer, db.ForeignKey('risk_classifications.id'), nullable=False, unique=True)
"""

# ----------------- routes/auth.py -----------------
auth_py = """
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
        admin = Admin(username=data['username'], password_hash=data['password'])  # Remember to hash in prod!
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
    
    # Optional: Log to sessions table
    new_session = Session(token=access_token)
    if role == 'admin': new_session.admin_id = user_or_admin.id
    else: new_session.user_id = user_or_admin.id
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify(access_token=access_token)
"""

# ----------------- routes/dataset.py -----------------
dataset_py = """
from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from models import Dataset
from extensions import db
from config import Config

bp = Blueprint('dataset', __name__, url_prefix='/api/datasets')

@bp.route('/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
        
    filename = secure_filename(file.filename)
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    new_dataset = Dataset(filename=filename, admin_id=1) # Hardcoded ID for demo
    db.session.add(new_dataset)
    db.session.commit()
    
    return jsonify({"message": "File uploaded", "dataset_id": new_dataset.id}), 200

@bp.route('/', methods=['GET'])
def get_datasets():
    datasets = Dataset.query.all()
    return jsonify([{'id': d.id, 'filename': d.filename, 'status': d.status} for d in datasets])
"""

# ----------------- app.py -----------------
app_py = """
from flask import Flask
from config import Config
from extensions import db, jwt, cors
from routes import auth, dataset

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    
    # Register Blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(dataset.bp)
    # the rest will be registered as implemented
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
"""

if __name__ == "__main__":
    create_file(os.path.join(BASE_DIR, 'config.py'), config_py)
    create_file(os.path.join(BASE_DIR, 'extensions.py'), extensions_py)
    create_file(os.path.join(BASE_DIR, 'models.py'), models_py)
    create_file(os.path.join(BASE_DIR, 'routes/__init__.py'), "")
    create_file(os.path.join(BASE_DIR, 'routes/auth.py'), auth_py)
    create_file(os.path.join(BASE_DIR, 'routes/dataset.py'), dataset_py)
    create_file(os.path.join(BASE_DIR, 'app.py'), app_py)
    print("Backend API scaffolding completed successfully.")
