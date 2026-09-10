import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag.parser import extract_text_from_pdf
from security.ingestion import scan_document

file_path = "../attack-scenarios/poisoned_rag.pdf"

with open(file_path, "rb") as file:
    pages = extract_text_from_pdf(file)

result = scan_document(pages)

print("\n===== STAGE 1 SECURITY SCAN =====")
print("Safe:", result["safe"])
print("Status:", result["status"])
print("Threat Score:", result["threat_score"])

if result["threats"]:
    print("\nThreats detected:")

    for threat in result["threats"]:
        print(f"Page: {threat['page_number']}")
        print(f"Type: {threat['threat_type']}")
        print(f"Matched: {threat['matched_text']}")
        print("--------------------")
else:
    print("\nNo threats detected.")