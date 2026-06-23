import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()
from django.apps import apps

try:
    model = apps.get_model('ships', 'Ship')
    fields = [f.name for f in model._meta.get_fields() if not f.is_relation or f.many_to_one]
    print(json.dumps({'Ship': fields}, indent=2))
except Exception as e:
    print(f"Error: {e}")
