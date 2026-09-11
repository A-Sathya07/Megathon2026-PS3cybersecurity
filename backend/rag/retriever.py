# from config import supabase


# def store_chunks(chunks, document_id, tenant_id):
#     rows = []

#     for chunk in chunks:
#         rows.append({
#             "document_id": document_id,
#             "tenant_id": tenant_id,
#             "content": chunk["text"],
#             "embedding": chunk["embedding"],
#             "chunk_index": chunk["chunk_index"]
#         })

#     response = (
#         supabase
#         .table("document_chunks")
#         .insert(rows)
#         .execute()
#     )

#     return response.data


# def search_chunks(query_embedding, tenant_id, top_k=5):

#     response = (
#         supabase
#         .rpc(
#             "match_document_chunks",
#             {
#                 "query_embedding": query_embedding,
#                 "match_tenant_id": tenant_id,
#                 "match_count": top_k
#             }
#         )
#         .execute()
#     )

#     chunks = response.data or []

#     print("\n========== VECTOR SEARCH ==========")
#     print("Tenant ID:", tenant_id)
#     print("Chunks found:", len(chunks))

#     for chunk in chunks:
#         print("Similarity:", chunk.get("similarity"))
#         print("Content:", chunk.get("content", "")[:200])
#         print("----------------------------------")

#     return chunks
from config import supabase


def search_chunks(query_embedding, tenant_id, top_k=5):
    print("========== RETRIEVER DEBUG ==========")
    print("TENANT SENT TO RPC:", repr(tenant_id))
    print("TENANT TYPE:", type(tenant_id))

    response = (
        supabase
        .rpc(
            "match_document_chunks",
            {
                "query_embedding": query_embedding,
                "match_tenant_id": str(tenant_id),
                "match_count": top_k
            }
        )
        .execute()
    )

    results = response.data or []

    print("RESULT COUNT:", len(results))

    for i, row in enumerate(results, start=1):
        print(f"RESULT {i}:")
        print("  tenant_id:", repr(row.get("tenant_id")))
        print("  similarity:", row.get("similarity"))
        print("  content:", row.get("content", "")[:100])

    print("======================================")

    return results