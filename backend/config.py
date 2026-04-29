import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'churnsense-secret-key-2025')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'churnsense-jwt-secret-2025')
    JWT_ACCESS_TOKEN_EXPIRES = 86400          # 24 hours in seconds
    JWT_REMEMBER_ME_EXPIRES  = 86400 * 30     # 30 days in seconds
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024     # 50 MB
    ML_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'lgbm_model.pkl')
