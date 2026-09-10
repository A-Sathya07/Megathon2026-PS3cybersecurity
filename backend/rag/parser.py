import pymupdf as fitz


def extract_text_from_pdf(pdf_bytes):
    pages = []

    pdf = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )

    for page_number, page in enumerate(pdf, start=1):

        text = page.get_text("text").strip()

        if text:
            pages.append({
                "page_number": page_number,
                "text": text
            })

    pdf.close()

    return pages