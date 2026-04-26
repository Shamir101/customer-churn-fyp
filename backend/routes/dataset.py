from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from models import Dataset
from extensions import db
from config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
from datetime import datetime

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json', 'parquet'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

bp = Blueprint('dataset', __name__, url_prefix='/api/datasets')

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_dataset():
    """Upload a dataset file with validation"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        
        # Check file in request
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            allowed_types = ', '.join(ALLOWED_EXTENSIONS)
            return jsonify({"error": f"File type not allowed. Allowed types: {allowed_types}"}), 400
        
        # Get file size (limit to 50MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 50 * 1024 * 1024:  # 50MB limit
            return jsonify({"error": "File too large. Maximum size is 50MB"}), 400
        
        # Read file to validate it's a proper data file
        try:
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            
            if file_ext == 'csv':
                df = pd.read_csv(file)
            elif file_ext in ('xlsx', 'xls'):
                df = pd.read_excel(file)
            elif file_ext == 'json':
                df = pd.read_json(file)
            elif file_ext == 'parquet':
                df = pd.read_parquet(file)
            else:
                return jsonify({"error": "Unsupported file format"}), 400
            
            # Validate data
            if df.empty:
                return jsonify({"error": "File is empty"}), 400
            
            if len(df) == 0:
                return jsonify({"error": "No rows in file"}), 400
            
            # Reset file pointer
            file.seek(0)
            
        except Exception as e:
            return jsonify({"error": f"Failed to read file: {str(e)}"}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        # Add timestamp to avoid filename conflicts
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Create database entry
        new_dataset = Dataset(
            filename=filename, 
            user_id=user_id,
            upload_date=datetime.utcnow(),
            status='Uploaded'
        )
        db.session.add(new_dataset)
        db.session.commit()
        
        # Get file preview (first 5 rows)
        try:
            if file_ext == 'csv':
                preview_df = pd.read_csv(file_path, nrows=5)
            elif file_ext in ('xlsx', 'xls'):
                preview_df = pd.read_excel(file_path, nrows=5)
            elif file_ext == 'json':
                preview_df = pd.read_json(file_path).head(5)
            elif file_ext == 'parquet':
                preview_df = pd.read_parquet(file_path).head(5)
            
            preview_data = preview_df.to_dict(orient='records')
            columns = list(preview_df.columns)
        except:
            preview_data = []
            columns = []
        
        return jsonify({
            "message": "File uploaded successfully",
            "dataset_id": new_dataset.id,
            "filename": new_dataset.filename,
            "upload_date": new_dataset.upload_date.isoformat(),
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "preview": preview_data,
            "status": "Uploaded"
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

@bp.route('/', methods=['GET'])
@jwt_required()
def get_datasets():
    """Get all datasets for current user"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        
        datasets = Dataset.query.filter_by(user_id=user_id).all()
        
        result = [{
            'id': d.id,
            'filename': d.filename,
            'status': d.status,
            'upload_date': d.upload_date.isoformat() if d.upload_date else None
        } for d in datasets]
        
        return jsonify({"datasets": result}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:dataset_id>', methods=['GET'])
@jwt_required()
def get_dataset(dataset_id):
    """Get specific dataset details"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        
        dataset = Dataset.query.filter_by(id=dataset_id, user_id=user_id).first()
        
        if not dataset:
            return jsonify({"error": "Dataset not found"}), 404
        
        # Try to read file for details
        file_path = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
        try:
            file_ext = dataset.filename.rsplit('.', 1)[1].lower()
            
            if file_ext == 'csv':
                df = pd.read_csv(file_path)
            elif file_ext in ('xlsx', 'xls'):
                df = pd.read_excel(file_path)
            elif file_ext == 'json':
                df = pd.read_json(file_path)
            elif file_ext == 'parquet':
                df = pd.read_parquet(file_path)
            
            rows = len(df)
            columns = len(df.columns)
            column_names = list(df.columns)
        except:
            rows = 0
            columns = 0
            column_names = []
        
        return jsonify({
            "id": dataset.id,
            "filename": dataset.filename,
            "status": dataset.status,
            "upload_date": dataset.upload_date.isoformat() if dataset.upload_date else None,
            "rows": rows,
            "columns": columns,
            "column_names": column_names
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:dataset_id>/preprocess', methods=['POST'])
@jwt_required()
def preprocess_dataset(dataset_id):
    """Preprocess a dataset"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        
        dataset = Dataset.query.filter_by(id=dataset_id, user_id=user_id).first()
        if not dataset:
            return jsonify({"error": "Dataset not found"}), 404
        
        # Mark as preprocessed
        dataset.status = 'Preprocessed'
        db.session.commit()
        
        return jsonify({
            "message": f"Dataset {dataset.filename} preprocessed successfully",
            "status": "Preprocessed"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:dataset_id>', methods=['DELETE'])
@jwt_required()
def delete_dataset(dataset_id):
    """Delete a dataset"""
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        
        dataset = Dataset.query.filter_by(id=dataset_id, user_id=user_id).first()
        if not dataset:
            return jsonify({"error": "Dataset not found"}), 404
        
        # Delete file from storage
        file_path = os.path.join(Config.UPLOAD_FOLDER, dataset.filename)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass
        
        db.session.delete(dataset)
        db.session.commit()
        
        return jsonify({"message": "Dataset deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500