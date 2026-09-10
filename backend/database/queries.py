from config import supabase


def get_user_by_id(user_id):
    response = (
        supabase
        .table("users")
        .select("id, tenant_id, email, role, company")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return response.data