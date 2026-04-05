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
