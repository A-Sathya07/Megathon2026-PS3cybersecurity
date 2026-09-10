from flask import Blueprint, request, jsonify, session
from config import supabase
from database.queries import get_user_by_id

auth_bp = Blueprint("auth", __name__)
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")
    selected_role = data.get("role", "").strip().lower()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not result.session:
            return jsonify({"error": "Login failed"}), 401

        access_token = result.session.access_token
        user_id = result.user.id

        user = get_user_by_id(user_id)

        if not user:
            return jsonify({"error": "User profile not found"}), 404

        actual_role = str(user.get("role", "")).lower()

        if selected_role != actual_role:
            return jsonify({"error": "Invalid role for this account"}), 403

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "company": user["company"],
                "tenant_id": user["tenant_id"]
            }
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", repr(e))
        return jsonify({"error": "Invalid email or password"}), 401