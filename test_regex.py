import os
import sys
import json
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from ai_document.document_processor import DocumentProcessor
from ai_document.document_to_json import _run_local_extraction

p = DocumentProcessor()
file_path = r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\tmp\DO-1.002.docx'

print("Processing document...")
r = p.process_document(file_path)

print("\n--- LOCAL REGEX EXTRACTION ---")
local_result = _run_local_extraction(r['extracted_text'], r['tables'])
print(json.dumps(local_result.get('Personal_Details', {}), indent=2))
