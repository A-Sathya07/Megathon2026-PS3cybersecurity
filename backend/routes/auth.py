from flask import Blueprint, request, jsonify, session
from config import supabase

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "")
    selected_role = data.get("role", "").lower().strip()

    if not email or not password or not selected_role:
        return jsonify({
            "error": "Email, password and role are required."
        }), 400

    try:

        # 1. Authenticate using Supabase Auth
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        user = result.user

        if not user:
            return jsonify({
                "error": "Invalid email or password."
            }), 401

        # 2. Get the REAL role from public.users
        user_result = (
            supabase
            .table("users")
            .select("id, email, role, tenant_id")
            .eq("id", user.id)
            .single()
            .execute()
        )

        db_user = user_result.data

        if not db_user:
            return jsonify({
                "error": "User profile not found."
            }), 403

        actual_role = str(db_user["role"]).lower().strip()

        # 3. VERY IMPORTANT ROLE CHECK
        if actual_role != selected_role:

            # Sign the user out
            supabase.auth.sign_out()

            return jsonify({
                "error": f"This account is registered as {actual_role.title()}. "
                         f"Please select {actual_role.title()} login."
            }), 403

        # 4. Save authenticated information
        session["user_id"] = user.id
        session["email"] = db_user["email"]
        session["role"] = actual_role
        session["tenant_id"] = db_user["tenant_id"]

        # 5. Return verified role
        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "email": db_user["email"],
            "role": actual_role,
            "tenant_id": db_user["tenant_id"]
        }), 200

    except Exception as e:

        print("LOGIN ERROR:", e)

        return jsonify({
            "error": "Invalid email or password."
        }), 401