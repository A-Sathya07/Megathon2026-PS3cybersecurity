import uuid

from flask import Blueprint, request, jsonify

from database.upload import upload_document


documents_bp = Blueprint("documents", __name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


@documents_bp.route("/api/documents/upload", methods=["POST"])
def upload():

    if "file" not in request.files:
        return jsonify({
            "error": "No file provided"
        }), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({
            "error": "No file selected"
        }), 400

    filename = file.filename

    extension = filename.rsplit(".", 1)[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({
            "error": "Only PDF, DOCX and TXT files are allowed"
        }), 400

    unique_name = f"{uuid.uuid4()}-{filename}"

    storage_path = f"Documents"

    content_type = file.content_type or "application/octet-stream"

    try:

        file_bytes = file.read()

        result = upload_document(
            file_bytes,
            storage_path,
            content_type
        )

        print("Upload result:", result)

        return jsonify({
            "message": "Document uploaded successfully",
            "filename": filename,
            "storage_path": storage_path
        }), 200

    except Exception as e:

        print("Upload error:", e)

        return jsonify({
            "error": "Failed to upload document",
            "details": str(e)
        }), 500