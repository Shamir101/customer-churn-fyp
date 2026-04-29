from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from database import init_db
from routes.auth       import bp as auth_bp
from routes.prediction import bp as prediction_bp
from routes.dataset    import bp as dataset_bp
from routes.results    import bp as results_bp
from routes.retention  import bp as retention_bp
from routes.training   import bp as training_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY

    CORS(app)

    # Initialise SQLite database (creates tables if not exist)
    with app.app_context():
        init_db()

    # ── API Blueprints ────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(dataset_bp)
    app.register_blueprint(results_bp)
    app.register_blueprint(retention_bp)
    app.register_blueprint(training_bp)

    # ── Page Routes (serve HTML templates) ───────────────────────────────
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/login')
    def login_page():
        return render_template('login.html')

    @app.route('/register')
    def register_page():
        return render_template('register.html')

    @app.route('/forgot-password')
    def forgot_password_page():
        return render_template('forgot_password.html')

    @app.route('/dashboard')
    def dashboard_page():
        return render_template('dashboard.html')

    @app.route('/predict')
    def predict_page():
        return render_template('predict.html')

    @app.route('/admin')
    def admin_page():
        return render_template('admin.html')

    @app.route('/batch-results/<int:dataset_id>')
    def batch_results_page(dataset_id):
        return render_template('batch_results.html', dataset_id=dataset_id)

    @app.route('/strategies')
    def strategies_page():
        return render_template('strategies.html')

    @app.route('/models')
    def models_page():
        return render_template('models.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
