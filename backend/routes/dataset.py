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
