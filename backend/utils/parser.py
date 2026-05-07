import fitz  # PyMuPDF
from docx import Document


def parse_file(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        return _parse_pdf(file_path)
    elif file_type == "docx":
        return _parse_docx(file_path)
    elif file_type == "txt":
        return _parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _parse_pdf(path: str) -> str:
    doc = fitz.open(path)
    return "\n".join(page.get_text() for page in doc)


def _parse_docx(path: str) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _parse_txt(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()
