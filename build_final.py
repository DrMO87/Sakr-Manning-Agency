import os

NEW_FILE = r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\document_to_json.py'

content = """import os
import re
import json
import time
import traceback
from typing import List, Optional, Any
from pydantic import BaseModel, Field

# --- LLM ROUTER ---
def _get_active_llm(api_keys_config: dict):
    if not api_keys_config:
        return None, None
        
    now = time.time()
    
    # 1. Try Groq keys
    if "groq" in api_keys_config:
        for index, key_data in enumerate(api_keys_config["groq"]):
            if not key_data.get("key"): continue
            if key_data.get("status") == "live" or (key_data.get("reset_time") and now > key_data["reset_time"]):
                try:
                    from langchain_groq import ChatGroq
                    llm = ChatGroq(
                        model="llama-3.3-70b-versatile",
                        groq_api_key=key_data["key"],
                        temperature=0,
                        max_tokens=4096,
                    )
                    return llm, {"provider": "groq", "index": index}
                except Exception as e:
                    print(f"Failed to init Groq key {index}: {e}")
                
    # 2. Try Gemini Fallback
    gemini_key = api_keys_config.get("gemini")
    if gemini_key and not api_keys_config.get("gemini_exhausted"):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=gemini_key,
                temperature=0
            )
            return llm, {"provider": "gemini", "index": 0}
        except Exception as e:
            print(f"Failed to init Gemini key: {e}")
        
    return None, None

def _parse_groq_reset_time(error_message: str) -> float:
    match = re.search(r"try again in (?:(\\d+)h)?(?:(\\d+)m)?([\\d.]+)s", error_message)
    if match:
        h = float(match.group(1) or 0)
        m = float(match.group(2) or 0)
        s = float(match.group(3) or 0)
        return time.time() + (h * 3600) + (m * 60) + s
    return time.time() + 3600

def _call_llm_with_retry(prompt: str, schema: type, api_keys_config: dict, max_retries: int = 3):
    last_exc = None
    
    while True:
        llm, source = _get_active_llm(api_keys_config)
        if not llm:
            if last_exc:
                raise Exception("exhausted") from last_exc
            raise Exception("exhausted")
            
        try:
            structured_llm = llm.with_structured_output(schema)
            return structured_llm.invoke(prompt)
        except Exception as exc:
            err = str(exc).lower()
            last_exc = exc
            if "rate limit" in err or "429" in err or "rate_limit" in err or "quota" in err or "exhausted" in err:
                if source["provider"] == "groq":
                    reset_time = _parse_groq_reset_time(str(exc))
                    api_keys_config["groq"][source["index"]]["status"] = "exhausted"
                    api_keys_config["groq"][source["index"]]["reset_time"] = reset_time
                    print(f"[Rate-limit] Groq key {source['index']} exhausted. Resets at {reset_time}.")
                    continue 
                else:
                    print("[Rate-limit] Gemini key exhausted.")
                    api_keys_config["gemini_exhausted"] = True
                    continue 
            else:
                print(f"[LLM Error] {exc}")
                raise exc

def _int_or_none(val: str) -> int:
    try:
        import re
        return int(re.sub(r'\\D', '', val))
    except:
        return None
"""

SCRATCH = r'C:\Users\dell\.gemini\antigravity\brain\4aab20b5-398a-49fe-97ff-0a03795f4a77\scratch'

with open(os.path.join(SCRATCH, 'new_models_code.py'), 'r', encoding='utf-8') as f:
    content += f.read()

content += """
# --- MARINE COURSES AND SEA SERVICE MODELS ---
class _MarineCourse(BaseModel):
    course_name: str = Field(default="")
    number: str = Field(default="")
    issue_date: str = Field(default="")
    expiry_date: str = Field(default="")
    issued_by_at: str = Field(default="")

class _MarineCoursesResult(BaseModel):
    courses: List[_MarineCourse] = Field(default_factory=list)

class _SpecialisedExperience(BaseModel):
    name: str = Field(default="")
    type: str = Field(default="")
    from_date: str = Field(default="")
    to_date: str = Field(default="")
    comments: str = Field(default="")

class _SeaServiceRecord(BaseModel):
    company_name: str = Field(default="")
    rank: str = Field(default="")
    vessel_name: str = Field(default="")
    signed_on: str = Field(default="")
    signed_off: str = Field(default="")
    period: str = Field(default="")
    vessel_type: str = Field(default="")
    dwt: str = Field(default="")
    engine_type: str = Field(default="")
    bh: str = Field(default="")
    kw: str = Field(default="")

class _SeaServiceResult(BaseModel):
    service_records: List[_SeaServiceRecord] = Field(default_factory=list)
    specialised_experience: List[_SpecialisedExperience] = Field(default_factory=list)

def _build_marine_courses_prompt(text: str, table_text: str) -> str:
    return f\"\"\"Extract Marine Courses from the text and tables.
TEXT: {text[:4000]}
TABLES: {table_text}
Extract course_name, number, issue_date, expiry_date, issued_by_at.\"\"\"

def _build_sea_service_prompt(text: str, table_text: str, applicant_name: str) -> str:
    return f\"\"\"Extract Sea Service records from the text and tables. Applicant: {applicant_name}.
TEXT: {text[:8000]}
TABLES: {table_text}
Extract company_name, rank, vessel_name, signed_on, signed_off, period, vessel_type, dwt, engine_type, bh, kw.\"\"\"

def _identify_table_sections(tables: list) -> dict:
    tables_str = _format_tables_readable(tables)
    return {
        "marine_courses": tables_str,
        "sea_service": tables_str
    }
"""

with open(os.path.join(SCRATCH, 'new_main_code.py'), 'r', encoding='utf-8') as f:
    main_code = f.read()

# Replace the signature to accept api_keys_config
main_code = main_code.replace("groq_api_key: str = None,", "api_keys_config: dict = None,")
main_code = main_code.replace("groq_api_key=groq_api_key", "api_keys_config=api_keys_config")
# Wait! new_main_code already has some LLM calls but they might use groq_api_key instead of api_keys_config.
main_code = main_code.replace("_call_llm_with_retry(comp_prompt, _FullCVExtraction)", "_call_llm_with_retry(comp_prompt, _FullCVExtraction, api_keys_config)")
main_code = main_code.replace("_call_llm_with_retry(marine_prompt, _MarineCoursesResult)", "_call_llm_with_retry(marine_prompt, _MarineCoursesResult, api_keys_config)")
main_code = main_code.replace("_call_llm_with_retry(service_prompt, _SeaServiceResult)", "_call_llm_with_retry(service_prompt, _SeaServiceResult, api_keys_config)")

# Remove the fallback `local_result = _run_local_extraction(text, tables)`
# Because _run_local_extraction no longer exists
main_code = main_code.replace("local_result = _run_local_extraction(text, tables)", "local_result = {}")

content += main_code

with open(NEW_FILE, 'w', encoding='utf-8') as f:
    f.write(content)
print("document_to_json.py completely restored to improved logic!")
