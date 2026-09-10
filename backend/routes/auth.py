from flask import Blueprint, request, jsonify
from backend.config import supabase

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
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        user_id = res.user.id
        access_token = res.session.access_token

        profile = (
            supabase
            .table("users")
            .select("id, email, role, company")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not profile.data:
            return jsonify({
                "error": "User profile not found"
            }), 404

        actual_role = profile.data.get("role")
        company = profile.data.get("company")

        if not actual_role or actual_role.lower() != selected_role.lower():
            return jsonify({
                "error": "This account does not have the selected role"
            }), 403

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user_id,
                "email": email,
                "role": actual_role,
                "company": company
            }
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", repr(e))
        return jsonify({
            "error": "Invalid email or password"
        }), 401