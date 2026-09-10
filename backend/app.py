from flask import Flask
from flask_cors import CORS

from backend.config import Config, supabase
from backend.routes.auth import auth_bp
from backend.routes.documents import documents_bp

app = Flask(__name__)

app.config.from_object(Config)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)

app.register_blueprint(auth_bp)
app.register_blueprint(documents_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)