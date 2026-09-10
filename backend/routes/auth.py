import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from flask import Blueprint, request, jsonify, session
from config import supabase   

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
            "password": password,
            "role" : role
        })
        session["user_id"] = res.user.id
        session["email"] = res.user.email
        return jsonify({"message": "Login successful", "user": {"id": res.user.id, "email": res.user.email}})
    except Exception as e:
        print("LOGIN ERROR:", repr(e))   # ⬅️ this shows the real reason
        return jsonify({"error": "Invalid email or password"}), 401