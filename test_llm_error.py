import sys
import os
import django
sys.path.append('d:/M SQUARE (MSQ)/CODE SQUARE/Sakr-Manning-Agency-Backend-main/Sakr-Manning-Agency-Backend-main')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from ai_document.document_to_json import _call_llm_with_retry, _FullCVExtraction, _get_active_llm

groq_key = os.environ.get("GROQ_API_KEY", "")
print("Key:", groq_key[:10] + "..." if groq_key else "None")

api_keys_config = {"groq": [{"key": groq_key, "status": "live", "reset_time": None}], "gemini": ""}

try:
    print("Testing LLM...")
    res = _call_llm_with_retry("Hello this is a test cv. My name is John Doe.", _FullCVExtraction, api_keys_config)
    print("Success!")
except Exception as e:
    print("FAILED:", type(e))
    print(str(e))
