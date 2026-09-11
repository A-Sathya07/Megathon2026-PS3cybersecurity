from flask import Blueprint, request, jsonify

from config import supabase
from database.queries import get_user_by_id

from rag.embeddings import embed_query
from rag.retriever import search_chunks
from rag.generator import generate_answer

from security.output import scan_output


chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def chat():

    # -----------------------------------
    # 1. CHECK AUTH TOKEN
    # -----------------------------------

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


    # -----------------------------------
    # 2. GET QUESTION
    # -----------------------------------

    data = request.get_json() or {}

    question = data.get("question", "").strip()

    if not question:
        return jsonify({
            "error": "Question is required"
        }), 400


    try:

        # -----------------------------------
        # 3. GET TRUSTED USER INFORMATION
        # -----------------------------------

        user = get_user_by_id(authenticated_user_id)

        if not user:
            return jsonify({
                "error": "User profile not found"
            }), 404

        user_id = user["id"]
        company = user["company"]
        tenant_id = user["tenant_id"]


        # -----------------------------------
        # CHAT REQUEST DEBUG
        # -----------------------------------

        print("\n========== CHAT REQUEST ==========")

        print("USER ID:", user_id)
        print("COMPANY:", company)
        print("TENANT ID:", tenant_id)
        print("QUESTION:", question)


        # -----------------------------------
        # STEP 1: EMBED USER QUESTION
        # -----------------------------------

        query_embedding = embed_query(question)

        print(
            "QUERY EMBEDDING DIMENSION:",
            len(query_embedding)
        )


        # -----------------------------------
        # STEP 2: TENANT-SCOPED VECTOR SEARCH
        # -----------------------------------

        chunks = search_chunks(
            query_embedding,
            tenant_id,
            top_k=5
        )

        print("CHUNKS FOUND:", len(chunks))

        for i, chunk in enumerate(chunks, start=1):

            print(f"\n--- CHUNK {i} ---")

            print(
                "Similarity:",
                chunk.get("similarity")
            )

            print(
                "Content:",
                chunk.get("content")
            )

        print("==================================")


        # -----------------------------------
        # STEP 3: NO RELEVANT DOCUMENTS
        # -----------------------------------

        if not chunks:

            return jsonify({
                "success": True,
                "question": question,
                "answer": (
                    "I couldn't find that information "
                    "in your organization's documents."
                ),
                "chunks_found": 0,
                "blocked": False,
                "security_status": "safe"
            }), 200


        # -----------------------------------
        # STEP 4: COMBINE RETRIEVED CHUNKS
        # -----------------------------------

        context = "\n\n".join(
            chunk["content"]
            for chunk in chunks
        )

        print("========== RAG CONTEXT ==========")

        print(context)

        print("=================================")


        # -----------------------------------
        # STEP 5: SEND CONTEXT + QUESTION
        # TO LLM
        # -----------------------------------

        answer = generate_answer(
            question,
            context
        )

        print("========== GENERATED ANSWER ==========")

        print(answer)

        print("======================================")


        # -----------------------------------
        # STEP 6: STAGE 3 OUTPUT SECURITY
        # -----------------------------------

        output_security = scan_output(
            answer,
            user=user
        )

        print(
            "\n========== STAGE 3 OUTPUT SECURITY =========="
        )

        print(
            "STATUS:",
            output_security["status"]
        )

        print(
            "THREATS:",
            output_security["threats"]
        )

        print(
            "=============================================="
        )


        # -----------------------------------
        # STEP 7: BLOCK UNSAFE OUTPUT
        # -----------------------------------

        if not output_security["safe"]:

            print("❌ STAGE 3 BLOCKED LLM OUTPUT")

            return jsonify({
                "success": False,
                "blocked": True,
                "security_status": "blocked",
                "answer": (
                    "The response was blocked by "
                    "RAGShield security controls."
                ),
                "chunks_found": len(chunks)
            }), 200


        # -----------------------------------
        # STEP 8: RETURN SAFE ANSWER
        # -----------------------------------

        print("✅ STAGE 3 APPROVED LLM OUTPUT")

        return jsonify({
            "success": True,
            "question": question,
            "answer": answer,
            "chunks_found": len(chunks),
            "blocked": False,
            "security_status": "safe"
        }), 200


    except Exception as e:

        print("CHAT ERROR:", repr(e))

        return jsonify({
            "error": "Unable to process chat request"
        }), 500