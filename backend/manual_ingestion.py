import os
import uuid
import hashlib

from config import supabase
from rag.parser import extract_text_from_pdf
from rag.chunker import chunk_pages
from rag.embeddings import create_embeddings
from security.ingestion import scan_document


TENANTS = {
    "A": "5a8a40d4-1a71-44b5-a63e-fa9b66613481",
    "B": "9c82f54d-77ab-4ea4-a6c5-08ec606b1667"
}

USER_ID = "094f076f-56ae-4486-bcf8-64e8fc93051a"


def ingest(company, folder):

    tenant_id = TENANTS[company]

    for filename in os.listdir(folder):

        if not filename.lower().endswith(".pdf"):
            continue

        print("\nProcessing:", filename)

        with open(os.path.join(folder, filename), "rb") as f:
            pdf_bytes = f.read()

        pages = extract_text_from_pdf(pdf_bytes)

        security = scan_document(pages)

        if not security["safe"]:
            print("❌ QUARANTINED:", filename)
            continue

        chunks = chunk_pages(pages, 300, 50)
        chunks = create_embeddings(chunks)

        document_id = str(uuid.uuid4())

        supabase.table("documents").insert({
            "id": document_id,
            "tenant_id": tenant_id,
            "filename": filename,
            "source": f"{company}/{filename}",
            "uploaded_by": USER_ID,
            "file_hash": hashlib.sha256(pdf_bytes).hexdigest(),
            "status": "safe",
            "threat_score": 0,
            "company": company
        }).execute()

        rows = [
            {
                "id": str(uuid.uuid4()),
                "document_id": document_id,
                "tenant_id": tenant_id,
                "content": c["text"],
                "embedding": c["embedding"],
                "chunk_index": c["chunk_index"]
            }
            for c in chunks
        ]

        supabase.table("document_chunks").insert(rows).execute()

        print("✅", company, filename, "→", len(rows), "chunks")


ingest("A", "backend/company_a")
ingest("B", "backend/company_b")