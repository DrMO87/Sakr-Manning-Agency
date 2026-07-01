import sys
import os
import django
sys.path.append('d:/M SQUARE (MSQ)/CODE SQUARE/Sakr-Manning-Agency-Backend-main/Sakr-Manning-Agency-Backend-main')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from ai_document.document_to_json import convert_text_to_json

groq_key = os.environ.get("GROQ_API_KEY", "")
api_keys_config = {"groq": [{"key": groq_key, "status": "live", "reset_time": None}], "gemini": ""}

# Load a sample CV
with open("d:/M SQUARE (MSQ)/CODE SQUARE/Sakr-Manning-Agency-Backend-main/Sakr-Manning-Agency-Backend-main/sample_cv.txt", "w", encoding="utf-8") as f:
    f.write("Full Name: Eng. Mahmoud Abbas\nDate of Birth: 01/01/1980\nNationality: Egyptian\n" * 100)

with open("d:/M SQUARE (MSQ)/CODE SQUARE/Sakr-Manning-Agency-Backend-main/Sakr-Manning-Agency-Backend-main/sample_cv.txt", "r", encoding="utf-8") as f:
    text = f.read()

print("Testing convert_text_to_json...")
res, _ = convert_text_to_json(text, [], api_keys_config)
print("Keys in result:", res.keys())
