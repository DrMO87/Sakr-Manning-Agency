import os

NEW_FILE = r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\document_to_json.py'

# Read current content to get everything before convert_text_to_json
with open(NEW_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("def convert_text_to_json(")
if start_idx == -1:
    print("Could not find convert_text_to_json")
    import sys; sys.exit(1)

content_before = content[:start_idx]

new_function = '''def convert_text_to_json(
    extracted_text: str,
    parsed_tables: list = None,
    api_keys_config: dict = None,
) -> dict:
    """
    Convert extracted CV text into a structured numbered dict.
    Uses multi-stage LLM extraction with api_keys_config router.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    tables = parsed_tables or []
    text   = extracted_text or ""

    # -- 1. Maritime CV validation ---------------------------------------------
    maritime_keywords = [
        'passport', 'seaman', 'coc', 'goc', 'rank', 'vessel', 'ship',
        'marine', 'maritime', 'stcw', 'certificate', 'sea service',
        'nationality', 'date of birth', 'personal details', 'marital status',
        'next of kin', 'emergency contact', 'vaccination', 'health certificate',
        'fire fighting', 'survival', 'sailor', 'officer', 'engineer',
        'captain', 'chief', 'deck', 'engine', 'flag state', 'imo',
        'dwt', 'grt', 'signed on', 'signed off', 'full name', 'port',
    ]
    text_lower = text.lower()
    keyword_count = sum(1 for kw in maritime_keywords if kw in text_lower)
    print(f"[CV Validation] {keyword_count} maritime keywords found | text length: {len(text.strip())} chars")

    if keyword_count < 3 or len(text.strip()) < 100:
        print("[CV Validation] REJECTED - not a valid maritime CV")
        return {"validation_error": "Document is not a valid maritime CV or contains too little text"}, api_keys_config

    local_result = {}

    # -- 2. Check API Keys -----------------------------------------------------
    if not api_keys_config:
        print("[LLM] CRITICAL ERROR: No API keys available.")
        return {"validation_error": "API KEYS MISSING. Please provide API keys in the Settings."}, api_keys_config

    try:
        # -- Pass 1: COMPREHENSIVE (sections 0-7, 10-12) -----------------------
        print("[Stage 2 / Pass 1] Comprehensive LLM extraction - all non-table sections...")
        try:
            comp_prompt = _build_comprehensive_prompt(text, tables)
            comp_result = _call_llm_with_retry(comp_prompt, _FullCVExtraction, api_keys_config)
            if comp_result:
                local_result = _map_comprehensive_result(comp_result, local_result)
                print("[Stage 2 / Pass 1] Comprehensive extraction successful.")
            else:
                print("[Stage 2 / Pass 1] LLM returned empty.")
        except Exception as exc:
            logger.warning(f"Comprehensive LLM pass failed: {exc}")
            if "exhausted" in str(exc).lower(): raise exc

        import time
        time.sleep(1)

        # -- Pass 2: Marine Courses (Section 8) --------------------------------
        table_sections = _identify_table_sections(tables)
        applicant_name = (local_result.get("1_personal_details") or {}).get("full_name", "")

        print("[Stage 2 / Pass 2] LLM extraction - Marine Courses (Section 8)...")
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
        print("[Stage 2 / Pass 3] LLM extraction - Sea Service (Section 9)...")
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

final_content = content_before + new_function

with open(NEW_FILE, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("document_to_json.py completely restored with proper router logic and 3 passes!")
