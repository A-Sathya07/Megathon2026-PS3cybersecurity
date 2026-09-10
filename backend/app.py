import os
from flask import Flask
from supabase import create_client, Client
from dotenv import load_dotenv
from routes.auth import auth_bp

load_dotenv()

app = Flask(__name__)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

app.register_blueprint(auth_bp)


if __name__ == '__main__':
    app.run(debug=True)