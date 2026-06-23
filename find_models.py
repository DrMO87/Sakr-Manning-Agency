import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()
from django.apps import apps
for model in apps.get_models():
    if model.__name__ in ['Flag', 'VesselType', 'Rank', 'CompanyType']:
        print(f"{model.__name__} is in {model._meta.app_label}")
