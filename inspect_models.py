import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from django.apps import apps

target_models = ['Users', 'Company', 'CVSubmission', 'Interview', 'Rank']
output = {}

for model_name in target_models:
    model = None
    try:
        model = apps.get_model('api', model_name)
    except LookupError:
        for app_config in apps.get_app_configs():
            try:
                model = app_config.get_model(model_name)
                break
            except LookupError:
                continue
    
    if not model:
        continue
        
    model_info = {}
    for field in model._meta.get_fields():
        if field.is_relation and (field.auto_created or not getattr(field, 'concrete', False)):
            continue
        field_info = {
            'type': field.get_internal_type(),
            'null': getattr(field, 'null', False),
            'blank': getattr(field, 'blank', False),
            'choices': getattr(field, 'choices', None),
            'has_default': field.has_default(),
        }
        if field.is_relation:
            field_info['related_model'] = field.related_model.__name__ if field.related_model else None
            
        model_info[field.name] = field_info
        
    output[model_name] = model_info

print(json.dumps(output, indent=2))
