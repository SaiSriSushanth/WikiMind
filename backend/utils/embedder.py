from openai import OpenAI
from config import settings

_client = OpenAI(api_key=settings.openai_api_key)
MODEL = "text-embedding-3-small"
BATCH_SIZE = 100


def embed_texts(texts: list[str]) -> list[list[float]]:
    all_embeddings = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        response = _client.embeddings.create(model=MODEL, input=batch)
        all_embeddings.extend([item.embedding for item in response.data])
    return all_embeddings
