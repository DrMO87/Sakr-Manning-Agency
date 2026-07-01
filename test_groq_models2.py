import os
import django
import sys
import traceback

sys.path.append(r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saker.settings")
django.setup()

from ai_document.document_processor import DocumentProcessor

os.environ["GROQ_API_KEY"] = "gsk_fake_key_for_testing_purposes"

processor = DocumentProcessor()
res = processor.process_document(r"D:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\source_documents\WIBER__MAHMOUD_FATHY_AWAD_ELGENDY.docx")

text = res.get('extracted_text', '')
tables = res.get('tables', [])

from langchain_groq import ChatGroq
from ai_document.confidence_schemas import SeafarerApplicationWithConfidence

try:
    print("Testing llama-3.3-70b-versatile with truncated text...")
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key="gsk_fake_key_for_testing_purposes", temperature=0)
    structured_llm = llm.with_structured_output(SeafarerApplicationWithConfidence)
    prompt = f"Extract this CV:\\n{text[:12000]}"
    res = structured_llm.invoke(prompt)
    print("SUCCESS with llama-3.3-70b-versatile!")
except Exception as e:
    print("FAILED llama-3.3-70b-versatile:", str(e))
