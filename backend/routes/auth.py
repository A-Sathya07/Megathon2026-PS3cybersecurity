import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from flask import Blueprint, request, jsonify, session
from config import supabase

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")
    selected_role = data.get("role")

    if not email or not password or not selected_role:
        return jsonify({
            "error": "Email, password and role are required"
        }), 400

    try:
        # 1. Check email + password using Supabase Auth
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        user_id = res.user.id

        # 2. Get actual role from public.users
        profile = (
            supabase
            .table("users")
            .select("id, email, role")
            .eq("id", user_id)
            .single()
            .execute()
        )

        actual_role = profile.data.get("role")

        # 3. Compare selected role with database role
        if actual_role.lower() != selected_role.lower():
            return jsonify({
                "error": "This account does not have the selected role"
            }), 403

        # 4. Save session
        session["user_id"] = user_id
        session["email"] = email
        session["role"] = actual_role

        # 5. Send role to frontend
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user_id,
                "email": email,
                "role": actual_role
            }
        })

    except Exception as e:
        print("LOGIN ERROR:", repr(e))

        return jsonify({
            "error": "Invalid email or password"
        }), 401