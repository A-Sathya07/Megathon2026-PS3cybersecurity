from flask import Blueprint, request, jsonify

from ..database.queries import get_user_by_id
from ..rag.embeddings import embed_query
from ..rag.retriever import search_chunks
from ..rag.generator import generate_answer

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    user_id = data.get("user_id")
    question = data.get("question")

    if not user_id:
        return jsonify({
            "error": "User ID is required"
        }), 401

    if not question:
        return jsonify({
            "error": "Question is required"
        }), 400

    user = get_user_by_id(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 401

    tenant_id = user["tenant_id"]

    query_embedding = embed_query(question)

    results = search_chunks(
        query_embedding,
        tenant_id=tenant_id,
        top_k=5
    )

    if not results:
        return jsonify({
            "answer": "No relevant information found.",
            "sources": []
        }), 200

    context = "\n\n".join(
        result["content"]
        for result in results
    )

    answer = generate_answer(
        question,
        context
    )

    sources = []

    for result in results:
        sources.append({
            "document_id": result["document_id"],
            "chunk_index": result["chunk_index"],
            "similarity": result["similarity"]
        })

    return jsonify({
        "answer": answer,
        "sources": sources
    }), 200