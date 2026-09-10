from pathlib import Path

from .parser import extract_text_from_pdf
from .chunker import chunk_pages
from ..security.ingestion import scan_document
from .embeddings import create_embeddings, embed_query
from .retriever import store_chunks, search_chunks
from .generator import generate_answer


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def ingest_pdf(pdf_path: str, tenant_id: str = "tenant_a"):

    pdf_path = Path(pdf_path)

    # [1] Parse
    print(f"[1/5] Parsing PDF: {pdf_path.name}")

    with open(pdf_path, "rb") as f:
        pages = extract_text_from_pdf(f)

    print(f"      Extracted {len(pages)} pages")

    print("[2/5] Running Stage 1 security scan...")

    scan_result = scan_document(pages)

    print(f"      Threat score: {scan_result['threat_score']}")
    print(f"      Status: {scan_result['status']}")

    if not scan_result["safe"]:

        print("🚨 Document quarantined!")
        print("   Threats detected:")

        for threat in scan_result["threats"]:
            print(
                f"   Page {threat['page_number']} → "
                f"{threat['threat_type']} → "
                f"{threat['matched_text']}"
            )

        return {
            "success": False,
            "status": "quarantined",
            "threat_score": scan_result["threat_score"],
            "threats": scan_result["threats"],
            "chunks": 0
        }

    print("      ✅ Document passed Stage 1")

    # [3] Chunk
    print("[3/5] Chunking text...")

    chunks = []

    for page in pages:

        page_chunks = chunk_pages([page])

        for c in page_chunks:

            chunks.append({
                "text": c,
                "page": page["page_number"],
                "source": pdf_path.name,
                "tenant_id": tenant_id
            })

    print(f"      Created {len(chunks)} chunks")


    print("[4/5] Generating embeddings...")

    chunks = create_embeddings(chunks)

    print("      ✅ Embeddings generated")

    # [5] Store
    print("[5/5] Storing in vector DB...")

    store_chunks(
        chunks,
        tenant_id=tenant_id
    )

    print(
        f"✅ Ingested {len(chunks)} chunks "
        f"from {pdf_path.name}"
    )

    return {
        "success": True,
        "status": "safe",
        "threat_score": scan_result["threat_score"],
        "threats": [],
        "chunks": len(chunks)
    }


def query(
    question: str,
    tenant_id: str = "tenant_a",
    top_k: int = 5
):

    print(f"[1/3] Embedding question: {question}")

    q_vec = embed_query(question)

    print(
        f"[2/3] Retrieving top {top_k} chunks..."
    )

    results = search_chunks(
        q_vec,
        tenant_id=tenant_id,
        top_k=top_k
    )

    if not results:

        return {
            "answer": "No relevant documents found.",
            "sources": []
        }

    print("[3/3] Generating answer...")

    context = "\n\n".join(
        [r["text"] for r in results]
    )

    answer = generate_answer(
        question,
        context
    )

    return {
        "answer": answer,
        "sources": [
            {
                "source": r["source"],
                "page": r["page"]
            }
            for r in results
        ]
    }


if __name__ == "__main__":

    pdf = (
        PROJECT_ROOT
        / "demo"
        / "tenant_a"
        / "test.pdf"
    )

    # 1. Ingest document
    result = ingest_pdf(
        pdf,
        tenant_id="tenant_a"
    )

    print("\n📄 Ingestion result:")
    print(result)

    # 2. Only query if ingestion succeeded
    if result["success"]:

        result = query(
            "What is this document about?",
            tenant_id="tenant_a"
        )

        print("\n💬 Answer:", result["answer"])
        print("📚 Sources:", result["sources"])