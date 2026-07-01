import os
import django
import sys
import json
import traceback

sys.path.append(r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saker.settings")
django.setup()

from ai_document.document_to_json import convert_text_to_json

text = '''
1. PERSONAL DETAILS
Full Name: Mohmed EL Gendy
Date Of Birth: 15/10/1983
Nationality: Egyptian
Marital Status: Married
'''
print("Running convert_text_to_json...")
try:
    res = convert_text_to_json(text)
    print("Success!")
    # print(json.dumps(res, indent=2))
except Exception as e:
    print("FAILED!")
    traceback.print_exc()
