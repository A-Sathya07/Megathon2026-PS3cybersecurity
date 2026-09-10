def chunk_pages(pages, chunk_size=1000, overlap=200):
    chunks = []

    for page in pages:
        text = page["text"]
        page_number = page["page_number"]

        words = text.split()

        start = 0

        while start < len(words):
            end = start + chunk_size

            chunk_text = " ".join(words[start:end])

            chunks.append({
                "page_number": page_number,
                "chunk_index": len(chunks),
                "text": chunk_text
            })

            if end >= len(words):
                break

            start = end - overlap

    return chunks

if __name__ == "__main__":
    from parser import extract_text_from_pdf

    parsed = extract_text_from_pdf(open("demo/tenant_a/test.pdf", "rb"))


    chunks = chunk_pages(parsed, chunk_size=50, overlap=10)

    for chunk in chunks:
        print(f"Page: {chunk['page_number']}, Chunk Index: {chunk['chunk_index']}, Text: {chunk['text']}...")