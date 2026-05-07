import tiktoken

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
ENCODING = "cl100k_base"


def chunk_text(text: str) -> list[str]:
    enc = tiktoken.get_encoding(ENCODING)
    tokens = enc.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + CHUNK_SIZE, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        if end == len(tokens):
            break
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks
