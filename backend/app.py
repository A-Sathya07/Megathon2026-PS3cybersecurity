from flask import Flask
from flask_cors import CORS
from config import Config, supabase
from routes.auth import auth_bp
from routes.documents import documents_bp
# from routes.chat import chat_bp

app = Flask(__name__)
app.config.from_object(Config)   

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# app.register_blueprint(chat_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(documents_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)