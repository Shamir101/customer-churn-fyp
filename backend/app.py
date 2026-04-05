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
    
    from routes import training, prediction, results, retention
    app.register_blueprint(training.bp)
    app.register_blueprint(prediction.bp)
    app.register_blueprint(results.bp)
    app.register_blueprint(retention.bp)
    
    with app.app_context():
        db.create_all()
        
    @app.route('/')
    def index():
        return {"status": "success", "message": "Customer Churn API is running!"}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
