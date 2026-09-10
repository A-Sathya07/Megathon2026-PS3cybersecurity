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
