import os
import django
import sys
import traceback

sys.path.append(r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saker.settings")
django.setup()

from ai_document.document_to_json import convert_text_to_json

os.environ["GROQ_API_KEY"] = "gsk_fake_key_for_testing_purposes"
print("Testing Groq extraction...")
text = "1. PERSONAL DETAILS\nFull Name: John Doe\n" * 100 + " passport seaman coc goc rank vessel ship marine maritime stcw"
try:
    convert_text_to_json(text, [])
    print("Success?")
except Exception as e:
    print("FAILED!")
    traceback.print_exc()
