import uuid

from flask import Blueprint, request, jsonify

from backend.config import supabase
from backend.database.queries import get_user_by_id
from backend.database.upload import upload_document

from backend.rag.parser import extract_text_from_pdf
from backend.security.ingestion import scan_document


documents_bp = Blueprint("documents", __name__)

ALLOWED_EXTENSIONS = {"pdf"}


@documents_bp.route("/api/documents/upload", methods=["POST"])
def upload():

    # --------------------------------
    # 1. CHECK AUTH TOKEN
    # --------------------------------

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({
            "error": "User not authenticated"
        }), 401

    access_token = auth_header.split(" ", 1)[1]

    try:

        auth_user = supabase.auth.get_user(access_token)

        user_id = auth_user.user.id

    except Exception as e:

        print("AUTH ERROR:", repr(e))

        return jsonify({
            "error": "Invalid or expired token"
        }), 401


    # --------------------------------
    # 2. GET USER + COMPANY
    # --------------------------------

    try:

        user = get_user_by_id(user_id)

        if not user:
            return jsonify({
                "error": "User profile not found"
            }), 404

        company = user.get("company", "").strip().lower()

        if company in {"a", "b", "c"}:

            company_folder = f"company_{company}"

        elif company in {
            "company_a",
            "company_b",
            "company_c"
        }:

            company_folder = company

        else:

            return jsonify({
                "error": "Invalid company"
            }), 400

    except Exception as e:

        print("USER LOOKUP ERROR:", repr(e))

        return jsonify({
            "error": "Unable to determine company"
        }), 500


    # --------------------------------
    # 3. GET FILE
    # --------------------------------

    file = request.files.get("file")

    if not file:

        return jsonify({
            "error": "No file uploaded"
        }), 400


    filename = file.filename or ""

    extension = filename.rsplit(".", 1)[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:

        return jsonify({
            "error": "Only PDF files are supported"
        }), 400


    # --------------------------------
    # 4. READ PDF
    # --------------------------------

    try:

        file_bytes = file.read()

        if not file_bytes:

            return jsonify({
                "error": "Uploaded file is empty"
            }), 400

    except Exception as e:

        print("FILE READ ERROR:", repr(e))

        return jsonify({
            "error": "Unable to read uploaded file"
        }), 400


    # --------------------------------
    # 5. PARSE PDF
    # --------------------------------

    try:

        pages = extract_text_from_pdf(file_bytes)

        if not pages:

            return jsonify({
                "error": "No readable text found in PDF"
            }), 400

    except Exception as e:

        print("PDF PARSE ERROR:", repr(e))

        return jsonify({
            "error": "Unable to parse PDF"
        }), 400


    # --------------------------------
    # 6. STAGE 1 SECURITY SCAN
    # --------------------------------

    try:

        security_result = scan_document(pages)

        print("\n========== STAGE 1 SCAN ==========")
        print("File:", filename)
        print("Company:", company_folder)
        print("Status:", security_result["status"])
        print("Threat Score:", security_result["threat_score"])
        print("Threats:", security_result["threats"])
        print("==================================")

    except Exception as e:

        print("SECURITY SCAN ERROR:", repr(e))

        return jsonify({
            "error": "Security scan failed"
        }), 500


    # --------------------------------
    # 7. QUARANTINE MALICIOUS FILE
    # --------------------------------

    if not security_result["safe"]:

        document_id = str(uuid.uuid4())

        try:

            supabase.table("documents").insert({
                "id": document_id,
                "tenant_id": user["tenant_id"],
                "filename": filename,
                "uploaded_by": user_id,
                "status": "quarantined",
                "threat_score": security_result["threat_score"]
            }).execute()

        except Exception as e:

            print("QUARANTINE DB ERROR:", repr(e))


        # Store threat information

        for threat in security_result["threats"]:

            try:

                supabase.table("threats").insert({
                    "document_id": document_id,
                    "tenant_id": user["tenant_id"],
                    "threat_type": threat["threat_type"],
                    "score": threat["score"],
                    "reason": "Potential prompt injection detected during ingestion",
                    "evidence": threat["matched_text"],
                    "status": "detected"
                }).execute()

            except Exception as e:

                print("THREAT DB ERROR:", repr(e))


        # IMPORTANT:
        # DO NOT create chunks
        # DO NOT create embeddings
        # DO NOT add to vector database

        return jsonify({
            "success": False,
            "status": "quarantined",
            "filename": filename,
            "threat_score": security_result["threat_score"],
            "threats": security_result["threats"],
            "message": "Document blocked by RAGShield security controls"
        }), 403




    unique_filename = f"{uuid.uuid4()}_{filename}"

    try:

        upload_document(
            file_bytes,
            company_folder,
            unique_filename,
            file.content_type or "application/pdf"
        )

    except Exception as e:

        print("STORAGE ERROR:", repr(e))

        return jsonify({
            "error": "Unable to store document"
        }), 500


    # --------------------------------
    # 9. CREATE DOCUMENT RECORD
    # --------------------------------

    document_id = str(uuid.uuid4())

    try:

        supabase.table("documents").insert({
            "id": document_id,
            "tenant_id": user["tenant_id"],
            "filename": filename,
            "source": f"{company_folder}/{unique_filename}",
            "uploaded_by": user_id,
            "status": "safe",
            "threat_score": 0
        }).execute()

    except Exception as e:

        print("DOCUMENT DB ERROR:", repr(e))

        return jsonify({
            "error": "Unable to create document record"
        }), 500


    # --------------------------------
    # 10. RETURN SAFE RESULT
    # --------------------------------

    return jsonify({

        "success": True,

        "status": "safe",

        "filename": filename,

        "document_id": document_id,

        "pages": len(pages),

        "threat_score": 0,

        "threats": [],

        "message": "Document passed security scan"

    }), 200