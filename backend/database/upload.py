import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

file_path = "../../demo/tenant_a/test.pdf"

storage_path = "tenant-a/test.pdf"

with open(file_path, "rb") as file:
    result = supabase.storage.from_("documents").upload(
        storage_path,
        file,
        {
            "content-type": "application/pdf",
            "upsert": "true"
        }
    )

print("Upload successful")
print(result)