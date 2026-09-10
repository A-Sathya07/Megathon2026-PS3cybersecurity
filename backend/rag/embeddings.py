from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embeddings(chunks):

    texts = [chunk["text"] for chunk in chunks]

    embeddings = model.encode(
        texts,
        normalize_embeddings=True
    )

    for chunk, embedding in zip(chunks, embeddings):
        chunk["embedding"] = embedding.tolist()

    return chunks


if __name__ == "__main__":

    from parser import extract_text_from_pdf
    from chunker import chunk_pages

    with open("demo/tenant_a/test.pdf", "rb") as f:
        pages = extract_text_from_pdf(f)

    chunks = chunk_pages(pages)

    chunks_with_embeddings = create_embeddings(chunks)

    for chunk in chunks_with_embeddings:
        print(
            f"Text: {chunk['text'][:100]}...\n"
            f"Embedding: {chunk['embedding'][:5]}...\n"
        )