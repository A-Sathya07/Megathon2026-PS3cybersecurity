from ..database.supabase import supabase


def store_chunks(chunks, document_id, tenant_id):
    rows = []

    for chunk in chunks:
        rows.append({
            "document_id": document_id,
            "tenant_id": tenant_id,
            "content": chunk["text"],
            "embedding": chunk["embedding"],
            "chunk_index": chunk["chunk_index"]
        })

    response = (
        supabase
        .table("document_chunks")
        .insert(rows)
        .execute()
    )

    return response.data


def search_chunks(query_embedding, tenant_id, top_k=5):
    response = (
        supabase
        .rpc(
            "match_document_chunks",
            {
                "query_embedding": query_embedding,
                "match_tenant_id": tenant_id,
                "match_count": top_k
            }
        )
        .execute()
    )

    return response.data or []