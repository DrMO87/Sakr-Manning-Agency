import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()
from django.apps import apps

result = {}
for model_name in ['Company', 'Ship', 'Users', 'CVSubmission', 'Rank', 'CompanyType', 'Flag', 'VesselType']:
    try:
        model = apps.get_model('api', model_name)
    except LookupError:
        try:
            model = apps.get_model('companies', model_name)
        except LookupError:
            try:
                model = apps.get_model('core', model_name)
            except LookupError:
                model = None
    
    if model:
        fields = [f.name for f in model._meta.get_fields() if not f.is_relation or f.many_to_one]
        result[model_name] = fields

print(json.dumps(result, indent=2))
