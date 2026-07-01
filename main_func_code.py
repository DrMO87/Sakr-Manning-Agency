# =============================================================================
# MAIN FUNCTION — comprehensive LLM extraction with Groq
# =============================================================================

def convert_text_to_json(
    extracted_text: str,
    parsed_tables: list = None,
    groq_api_key: str = None,
) -> dict:
    """
    Convert extracted CV text into a structured numbered dict.

    Strategy (redesigned for accuracy):
    ────────────────────────────────────
    1. Validate document is a maritime CV (>=3 keywords).
    2. Run LOCAL regex extraction as baseline (zero LLM tokens).
    3. LLM Pass 1 — COMPREHENSIVE: sections 0-7, 10-12 (single call with full context).
    4. LLM Pass 2 — Marine courses (Section 8) with table data.
    5. LLM Pass 3 — Sea service (Section 9) with table data.
    6. Merge: LLM results override local for non-empty fields.
    """
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
        print("[CV Validation] REJECTED — not a valid maritime CV")
        return {"validation_error": "Document is not a valid maritime CV or contains too little text"}

    # -- 2. Local extraction (baseline, zero LLM tokens) -----------------------
    print("[Stage 1] Running local regex extraction...")
    try:
        local_result = _run_local_extraction(text, tables)
    except Exception as exc:
        logger.error(f"Local extraction failed: {exc}")
        local_result = _run_local_extraction("", [])

    # -- 3. Resolve Groq API key -----------------------------------------------
    resolved_api_key = groq_api_key or os.environ.get("GROQ_API_KEY")
    if resolved_api_key in ("null", "undefined", "", None):
        resolved_api_key = None

    # -- 4. LLM extraction (Groq only) -----------------------------------------
    llm = None
    if resolved_api_key:
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=resolved_api_key,
                temperature=0,
                max_tokens=4096,
            )
            print("[LLM] Using Groq llama-3.3-70b-versatile (max_tokens=4096)")
        except Exception as exc:
            logger.warning(f"Failed to initialise Groq client: {exc}")
    else:
        print("[LLM] No Groq API key available — using local regex results only.")

    if llm is not None:
        # -- Pass 1: COMPREHENSIVE (sections 0-7, 10-12) -----------------------
        print("[Stage 2 / Pass 1] Comprehensive LLM extraction — all non-table sections...")
        try:
            comp_prompt = _build_comprehensive_prompt(text, tables)
            comp_result = _call_llm_with_retry(llm, comp_prompt, _FullCVExtraction)
            if comp_result:
                local_result = _map_comprehensive_result(comp_result, local_result)
                print("[Stage 2 / Pass 1] Comprehensive extraction successful.")
            else:
                print("[Stage 2 / Pass 1] LLM returned empty — keeping local results.")
        except Exception as exc:
            logger.warning(f"Comprehensive LLM pass failed: {exc}\n{traceback.format_exc()}")
            print("[Stage 2 / Pass 1] Comprehensive extraction failed — keeping local regex results.")

        time.sleep(5)  # Respect Groq TPM limits

        # -- Pass 2: Marine Courses (Section 8) --------------------------------
        table_sections = _identify_table_sections(tables)
        applicant_name = (local_result.get("1_personal_details") or {}).get("full_name", "")

        print("[Stage 2 / Pass 2] LLM extraction — Marine Courses (Section 8)...")
        try:
            marine_prompt = _build_marine_courses_prompt(text, table_sections["marine_courses"])
            marine_result = _call_llm_with_retry(llm, marine_prompt, _MarineCoursesResult)
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
            else:
                print("[Stage 2 / Pass 2] LLM returned empty courses — keeping local results.")
        except Exception as exc:
            logger.warning(f"Marine courses LLM pass failed: {exc}\n{traceback.format_exc()}")
            print("[Stage 2 / Pass 2] Falling back to local regex for marine courses.")

        time.sleep(5)

        # -- Pass 3: Sea Service (Section 9) -----------------------------------
        print("[Stage 2 / Pass 3] LLM extraction — Sea Service (Section 9)...")
        try:
            service_prompt = _build_sea_service_prompt(
                text, table_sections["sea_service"], applicant_name=applicant_name
            )
            service_result = _call_llm_with_retry(llm, service_prompt, _SeaServiceResult)
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
                        for s in service_result.specialised_experience
                    ] if hasattr(service_result, "specialised_experience") else [],
                }
                print(f"[Stage 2 / Pass 3] Extracted {len(service_result.service_records)} sea service records via LLM.")
            else:
                print("[Stage 2 / Pass 3] LLM returned empty records — keeping local results.")
        except Exception as exc:
            logger.warning(f"Sea service LLM pass failed: {exc}\n{traceback.format_exc()}")
            print("[Stage 2 / Pass 3] Falling back to local regex for sea service.")
    else:
        print("[Stage 2] No LLM available — using local regex results for all sections.")

    print("[Done] Extraction complete.")
    return local_result
