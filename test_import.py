import sys
sys.path.append('.')
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
import ai_document.document_to_json
print("Import successful!")
