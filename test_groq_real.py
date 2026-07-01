import os
import django
import sys
import json
import traceback

sys.path.append(r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saker.settings")
django.setup()

from ai_document.document_processor import DocumentProcessor
from ai_document.document_to_json import convert_text_to_json

os.environ["GROQ_API_KEY"] = "gsk_fake_key_for_testing_purposes"
print("Testing Groq extraction...")

processor = DocumentProcessor()
res = processor.process_document(r"D:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\source_documents\WIBER__MAHMOUD_FATHY_AWAD_ELGENDY.docx")

text = res.get('extracted_text', '')
tables = res.get('tables', [])
print(f"Text length: {len(text)}")
try:
    json_result = convert_text_to_json(text, parsed_tables=tables)
    print("Conversion success. Number of keys:", len(json_result.keys()))
    if 'error' in json_result:
        print("Error in JSON result:", json_result['error'])
    else:
        print("Successfully extracted data.")
except Exception as e:
    print("FAILED!")
    traceback.print_exc()
