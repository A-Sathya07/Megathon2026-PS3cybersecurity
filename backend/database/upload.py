from config import supabase


def upload_document(file_bytes, company_folder, filename, content_type):

    company_folder = str(company_folder).strip().lower()

    if company_folder.startswith("company_company_"):
        company_folder = company_folder.replace(
            "company_company_",
            "company_",
            1
        )

    if company_folder in {"a", "b", "c"}:
        company_folder = f"company_{company_folder}"

    if company_folder not in {
        "company_a",
        "company_b",
        "company_c"
    }:
        raise ValueError(f"Invalid company folder: {company_folder}")

    storage_path = f"{company_folder}/{filename}"

    print("========== STORAGE UPLOAD ==========")
    print("Company folder:", company_folder)
    print("Storage path:", storage_path)
    print("====================================")

    result = (
        supabase
        .storage
        .from_("Documents")
        .upload(
            storage_path,
            file_bytes,
            {
                "content-type": content_type,
                "upsert": False
            }
        )
    )

    return result