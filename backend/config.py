import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-fyp-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///customer_churn.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-super-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    ML_MODELS_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ml')
