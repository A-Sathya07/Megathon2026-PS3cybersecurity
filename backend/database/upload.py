import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


def upload_document(file, storage_path, content_type):
    result = supabase.storage.from_("documents").upload(
        storage_path,
        file,
        {
            "content-type": content_type,
            "upsert": "false"
        }
    )

    return result