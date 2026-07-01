import os
import sys
import json
import django

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from ai_document.document_processor import DocumentProcessor
from ai_document.document_to_json import convert_text_to_json

os.environ['GROQ_API_KEY'] = 'gsk_fake_key_for_testing_purposes'

p = DocumentProcessor()
file_path = r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\tmp\DO-1.002.docx'

print("Processing document...")
r = p.process_document(file_path)

print("\n--- EXTRACTED TEXT ---")
print(r['extracted_text'][:1000])

print("\n--- TABLES ---")
for t in r.get('tables', [])[:2]:
    print(t)

print("\n--- GROQ EXTRACTION ---")
j = convert_text_to_json(r['extracted_text'], parsed_tables=r['tables'])
print(json.dumps(j.get('Personal_Details', {}), indent=2))
