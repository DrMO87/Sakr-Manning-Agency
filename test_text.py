import os
import sys

sys.path.append(r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main")
from ai_document.document_processor import DocumentProcessor

processor = DocumentProcessor()
res = processor.process_document(r"D:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\source_documents\WIBER__MAHMOUD_FATHY_AWAD_ELGENDY.docx")

text = res.get('extracted_text', '')
print(f"Total length: {len(text)}")
print("--- FIRST 1000 CHARS ---")
print(text[:1000])
print("--- LAST 1000 CHARS ---")
print(text[-1000:])

