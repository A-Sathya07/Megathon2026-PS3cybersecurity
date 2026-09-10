from pathlib import Path
from .parser import extract_text_from_pdf
from .chunker import chunk_pages
from .embeddings import create_embeddings, embed_query
from .retriever import store_chunks, search_chunks
from .generator import generate_answer

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def ingest_pdf(pdf_path: str, tenant_id: str = "tenant_a"):

    pdf_path = Path(pdf_path)
    print(f"[1/4] Parsing PDF: {pdf_path.name}")

    with open(pdf_path, "rb") as f:
        pages = extract_text_from_pdf(f)

    print(f"      Extracted {len(pages)} pages")

  
    print("[2/4] Chunking text...")
    chunks = []
    for page in pages:
        page_chunks = chunk_pages([page])
        for c in page_chunks:
            chunks.append({
                "text": c,
                "page": page["page_number"],
                "source": pdf_path.name,
                "tenant_id": tenant_id,
            })

    print(f"      Created {len(chunks)} chunks")

    # [3] Embed
    print("[3/4] Generating embeddings...")
    chunks = create_embeddings(chunks)

    # [4] Store
    print("[4/4] Storing in vector DB...")
    store_chunks(chunks, tenant_id=tenant_id)

    print(f"✅ Ingested {len(chunks)} chunks from {pdf_path.name}")
    return len(chunks)


def query(question: str, tenant_id: str = "tenant_a", top_k: int = 5):

    print(f"[1/3] Embedding question: {question}")
    q_vec = embed_query(question)

    print(f"[2/3] Retrieving top {top_k} chunks...")
    results = search_chunks(q_vec, tenant_id=tenant_id, top_k=top_k)

    if not results:
        return {"answer": "No relevant documents found.", "sources": []}

    print(f"[3/3] Generating answer...")
    context = "\n\n".join([r["text"] for r in results])
    answer = generate_answer(question, context)

    return {
        "answer": answer,
        "sources": [
            {"source": r["source"], "page": r["page"]}
            for r in results
        ],
    }



if __name__ == "__main__":
    pdf = PROJECT_ROOT / "demo" / "tenant_a" / "test.pdf"

    # 1. Ingest
    ingest_pdf(pdf, tenant_id="tenant_a")

    # 2. Ask a question
    result = query("What is this document about?", tenant_id="tenant_a")
    print("\n💬 Answer:", result["answer"])
    print("📚 Sources:", result["sources"])