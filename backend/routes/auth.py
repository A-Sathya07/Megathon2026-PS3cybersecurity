from flask import Blueprint, request, jsonify
from app import supabase   # reuse the client from app.py

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": res.user.id,
                "email": res.user.email
            }
        })
    except Exception:
        return jsonify({"error": "Invalid email or password"}), 401