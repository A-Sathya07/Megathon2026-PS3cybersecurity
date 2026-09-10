from flask import Blueprint, request, jsonify

from config import supabase
from database.queries import get_user_by_id
from rag.embeddings import embed_query
from rag.retriever import search_chunks

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def chat():

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({
            "error": "User not authenticated"
        }), 401

    access_token = auth_header.split(" ", 1)[1]

    try:
        auth_user = supabase.auth.get_user(access_token)
        authenticated_user_id = auth_user.user.id

    except Exception as e:
        print("AUTH ERROR:", repr(e))

        return jsonify({
            "error": "Invalid or expired token"
        }), 401

    data = request.get_json() or {}

    question = data.get("question", "").strip()

    if not question:
        return jsonify({
            "error": "Question is required"
        }), 400

    try:
        user = get_user_by_id(authenticated_user_id)

        if not user:
            return jsonify({
                "error": "User profile not found"
            }), 404

        user_id = user["id"]
        company = user["company"]
        tenant_id = user["tenant_id"]

        query_embedding = embed_query(question)

        chunks = search_chunks(
            query_embedding,
            tenant_id,
            top_k=5
        )
        print("========== CHAT REQUEST ==========")
        print("USER ID:", user_id)
        print("COMPANY:", company)
        print("TENANT ID:", tenant_id)
        print("QUESTION:", question)
        print("CHUNKS FOUND:", len(chunks))
        print("embedded query:", query_embedding[:5], "...")
        print("==================================")

        for i, chunk in enumerate(chunks, start=1):
            print(f"\n--- CHUNK {i} ---")
            print("Similarity:", chunk.get("similarity"))
            print("Content:", chunk.get("content"))

            print("==================================")

            context = "\n\n".join(
                chunk["content"]
                for chunk in chunks
            )

            return jsonify({
                "success": True,
                "question": question,
                "chunks_found": len(chunks),
                "context": context,
                "chunks": chunks
            }), 200
    except Exception as e:
        print("CHAT ERROR:", repr(e))

        return jsonify({
            "error": "Unable to process chat request"
        }), 500

