import uuid
from django.conf import settings
from supabase import create_client 

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

def upload_receipt(file):
    ext = file.name.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = filename

    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        path,
        file.read()
    )

    url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(path)

    return url