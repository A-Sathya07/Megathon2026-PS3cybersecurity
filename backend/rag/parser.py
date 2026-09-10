import pymupdf

def extract_text_from_pdf(pdf_file):
    pages = []

    pdf = pymupdf.open(stream=pdf_file.read(), filetype="pdf")

    for page_number, page in enumerate(pdf, start=1):
        text = page.get_text("text").strip()

        if text:
            pages.append({
                "page_number": page_number,
                "text": text
            })

    pdf.close()

    return pages


 