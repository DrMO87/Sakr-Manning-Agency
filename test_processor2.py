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

processor = DocumentProcessor()
res = processor.process_document(r"D:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\source_documents\WIBER__MAHMOUD_FATHY_AWAD_ELGENDY.docx")

text = res.get('extracted_text', '')
tables = res.get('tables', [])
print(f"Text length: {len(text)}")
try:
    json_result = convert_text_to_json(text, parsed_tables=tables)
    print("Conversion success. Number of keys:", len(json_result.keys()))
    print("Does it contain error or validation_error?", 'error' in json_result or 'validation_error' in json_result)
    if 'validation_error' in json_result:
        print("Validation error:", json_result['validation_error'])
except Exception as e:
    print("Exception!")
    traceback.print_exc()

