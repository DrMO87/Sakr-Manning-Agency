import sys
import os
sys.path.append('.')
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from ai_document.views import process_document
print("Import successful!")
