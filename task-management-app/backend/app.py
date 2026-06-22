from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=[
        "http://localhost:5173",
        "https://taskyyyyi.netlify.app"
    ])

    db.init_app(app)
    JWTManager(app)

    from routes.auth import auth_bp
    from routes.tasks import tasks_bp
    from routes.ai import ai_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(ai_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    with app.app_context():
        db.create_all()

    return app
