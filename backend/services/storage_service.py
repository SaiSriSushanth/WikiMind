import os
import tempfile
from supabase import create_client, Client
from config import settings

BUCKET = "documents"

_client: Client = create_client(settings.supabase_url, settings.supabase_service_key)


def upload_file(file_bytes: bytes, storage_path: str, content_type: str) -> str:
    _client.storage.from_(BUCKET).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return storage_path


def download_file(storage_path: str) -> str:
    file_bytes = _client.storage.from_(BUCKET).download(storage_path)
    suffix = "." + storage_path.rsplit(".", 1)[-1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(file_bytes)
    tmp.close()
    return tmp.name


def delete_file(storage_path: str) -> None:
    _client.storage.from_(BUCKET).remove([storage_path])
