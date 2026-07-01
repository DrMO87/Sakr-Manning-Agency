import os
import django
import sys

sys.path.append(r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saker.settings")
django.setup()

from ai_document.document_processor import DocumentProcessor

processor = DocumentProcessor()
res = processor.process_document(r"D:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\source_documents\WIBER__MAHMOUD_FATHY_AWAD_ELGENDY.docx")

tables = res.get('tables', [])
print(f"Number of tables: {len(tables)}")
tables_str = str(tables)
print(f"String length of tables: {len(tables_str)}")
