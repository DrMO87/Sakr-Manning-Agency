import sys
import os

file_path = r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\document_to_json.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace _call_llm_with_retry
new_llm_logic = '''
def _get_active_llm(api_keys_config: dict):
    import time
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
                    logger.warning(f"Failed to init Groq key {index}: {e}")
                
    # 2. Try Gemini Fallback
    gemini_key = api_keys_config.get("gemini")
    if gemini_key and not api_keys_config.get("gemini_exhausted"):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=gemini_key,
                temperature=0
            )
            return llm, {"provider": "gemini", "index": 0}
        except Exception as e:
            logger.warning(f"Failed to init Gemini key: {e}")
        
    return None, None

def _parse_groq_reset_time(error_message: str) -> float:
    import time, re
    match = re.search(r"try again in (?:(\\d+)h)?(?:(\\d+)m)?([\\d.]+)s", error_message)
    if match:
        h = float(match.group(1) or 0)
        m = float(match.group(2) or 0)
        s = float(match.group(3) or 0)
        return time.time() + (h * 3600) + (m * 60) + s
    return time.time() + 3600 # Default 1 hour

def _call_llm_with_retry(prompt: str, schema: type, api_keys_config: dict, max_retries: int = 3) -> Any:
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
            if "rate limit" in err or "429" in err or "rate_limit" in err or "quota" in err:
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
'''

import re

# 1. Replace the old _call_llm_with_retry logic
content = re.sub(
    r"def _call_llm_with_retry\(llm, prompt: str, schema: type, max_retries: int = 3\) -> Any:.*?raise last_exc  # All retries exhausted",
    new_llm_logic.strip(),
    content,
    flags=re.DOTALL
)

# 2. Update convert_text_to_json signature
content = content.replace(
    "groq_api_key: str = None,",
    "api_keys_config: dict = None,"
)

# 3. Update the stage 3 logic
new_stage_3 = '''
    # -- 3. Check API Keys -----------------------------------------------------
    if not api_keys_config:
        print("[LLM] CRITICAL ERROR: No API keys available. Refusing to use broken local regex.")
        return {"validation_error": "API KEYS MISSING. Please provide API keys in the Settings."}, api_keys_config

    try:
        # -- Pass 1: COMPREHENSIVE (sections 0-7, 10-12) -----------------------
        print("[Stage 2 / Pass 1] Comprehensive LLM extraction — all non-table sections...")
        try:
            comp_prompt = _build_comprehensive_prompt(text, tables)
            comp_result = _call_llm_with_retry(comp_prompt, _FullCVExtraction, api_keys_config)
            if comp_result:
                local_result = _map_comprehensive_result(comp_result, local_result)
                print("[Stage 2 / Pass 1] Comprehensive extraction successful.")
            else:
                print("[Stage 2 / Pass 1] LLM returned empty — keeping local results.")
        except Exception as exc:
            logger.warning(f"Comprehensive LLM pass failed: {exc}")
            if "exhausted" in str(exc).lower(): raise exc

        import time
        time.sleep(1)

        # -- Pass 2: Marine Courses (Section 8) --------------------------------
        table_sections = _identify_table_sections(tables)
        applicant_name = (local_result.get("1_personal_details") or {}).get("full_name", "")

        print("[Stage 2 / Pass 2] LLM extraction — Marine Courses (Section 8)...")
        try:
            marine_prompt = _build_marine_courses_prompt(text, table_sections["marine_courses"])
            marine_result = _call_llm_with_retry(marine_prompt, _MarineCoursesResult, api_keys_config)
            if marine_result and marine_result.courses:
                local_result["8_marine_courses"] = [
                    {
                        "course_name":  c.course_name,
                        "number":       c.number,
                        "issue_date":   c.issue_date,
                        "expiry_date":  c.expiry_date,
                        "issued_by_at": c.issued_by_at,
                    }
                    for c in marine_result.courses
                ]
                print(f"[Stage 2 / Pass 2] Extracted {len(marine_result.courses)} marine courses via LLM.")
        except Exception as exc:
            logger.warning(f"Marine courses LLM pass failed: {exc}")
            if "exhausted" in str(exc).lower(): raise exc

        time.sleep(1)

        # -- Pass 3: Sea Service (Section 9) -----------------------------------
        print("[Stage 2 / Pass 3] LLM extraction — Sea Service (Section 9)...")
        try:
            service_prompt = _build_sea_service_prompt(
                text, table_sections["sea_service"], applicant_name=applicant_name
            )
            service_result = _call_llm_with_retry(service_prompt, _SeaServiceResult, api_keys_config)
            if service_result and service_result.service_records:
                existing_info = (local_result.get("9_complete_sea_service_details") or {}).get(
                    "applicant_info", {}
                )
                local_result["9_complete_sea_service_details"] = {
                    "applicant_info": existing_info,
                    "service_records": [
                        {
                            "company_name":          r.company_name,
                            "rank":                  r.rank,
                            "vessel_name":           r.vessel_name,
                            "flag":                  "",
                            "signed_on":             r.signed_on,
                            "signed_off":            r.signed_off,
                            "period":                r.period,
                            "vessel_type":           r.vessel_type,
                            "dwt":                   r.dwt,
                            "engine_type":           r.engine_type,
                            "bh":                    r.bh,
                            "kw":                    r.kw,
                            "reason_for_sign_off":   "",
                        }
                        for r in service_result.service_records
                    ],
                    "specialised_experience": [
                        {
                            "name":                  s.name,
                            "type":                  s.type,
                            "from_date":             s.from_date,
                            "to_date":               s.to_date,
                            "comments":              s.comments,
                        }
                        for s in getattr(service_result, "specialised_experience", [])
                    ],
                }
                print(f"[Stage 2 / Pass 3] Extracted {len(service_result.service_records)} sea service records via LLM.")
        except Exception as exc:
            logger.warning(f"Sea service LLM pass failed: {exc}")
            if "exhausted" in str(exc).lower(): raise exc

    except Exception as e:
        if "exhausted" in str(e).lower():
            return {"validation_error": "API Keys exhausted"}, api_keys_config
        return {"validation_error": str(e)}, api_keys_config

    print("[Done] Extraction complete.")
    return local_result, api_keys_config
'''

content = re.sub(
    r"# -- 3\. Resolve Groq API key -----------------------------------------------.*return local_result\s*\n",
    new_stage_3.strip() + "\n",
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated document_to_json.py")
