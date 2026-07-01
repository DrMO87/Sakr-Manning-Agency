import sys
import os

file_path = r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\document_to_json.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find the start of the function definition
start_idx = content.find("def convert_text_to_json(")
if start_idx == -1:
    print("Could not find convert_text_to_json")
    sys.exit(1)

content_before = content[:start_idx]

new_function = '''def convert_text_to_json(extracted_text: str, parsed_tables: list = None, api_keys_config: dict = None) -> dict:
    """
    Convert extracted CV text to structured data using multi-stage LLM extraction with confidence scoring.
    """
    global CURRENT_TABLES
    CURRENT_TABLES = parsed_tables or []
    
    text = extracted_text or ""

    # Maritime CV validation
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
    print(f"CV Validation: Found {keyword_count} maritime keywords, text length: {len(text.strip())}")

    if keyword_count < 5 or len(text.strip()) < 200:
        print("?? DOCUMENT IS NOT A VALID MARITIME CV - RETURNING EMPTY DATA")
        return {"validation_error": "Document is not a valid maritime CV or contains too little text"}, api_keys_config

    prompt = f"""You are an expert Maritime HR Assistant. Your task is to extract all relevant seafarer CV data from the following document into the provided JSON schema.

CRITICAL INSTRUCTIONS:
- You are returning a 'Confidence Schema'. This means every field is an object containing 'value', 'confidence', and 'doubted'.
- 'confidence' must be a float between 0.0 and 1.0.
- Set 'doubted' to true if you are unsure about the extraction, if it might be a hallucination, or if the source text was ambiguous.
- ALWAYS map the applicant's actual name to `full_name`. DO NOT map field labels like "Name:", "Marital Status", or "Nationality" to the `full_name` field.
- If the CV uses a compact layout like "Name / Marital Status: John Doe / Single", split the values correctly.

TEXT:
{text}
"""
    if CURRENT_TABLES:
        prompt += f"\\n\\nNATIVE TABLES (Use this to match exact columns if text is confusing):\\n{CURRENT_TABLES}"

    last_exc = None

    while True:
        try:
            import os
            llm = None
            source = None
            
            if api_keys_config:
                print("Using API Keys Config from frontend...")
                llm, source = _get_active_llm(api_keys_config)
                
            if not llm:
                print("Falling back to local ENV variables...")
                USE_LOCAL_LLM = os.environ.get("USE_LOCAL_LLM", "true").lower() == "true"
                groq_api_key = os.environ.get("GROQ_API_KEY")
                if groq_api_key in ["null", "undefined", "", None]:
                    groq_api_key = None
                    
                google_api_key = os.environ.get("GOOGLE_API_KEY")
                if google_api_key in ["null", "undefined", "", None]:
                    google_api_key = None
                
                if groq_api_key:
                    print("?? Running Confidence LLM Extraction via Groq (llama-3.3-70b-versatile)...")
                    from langchain_groq import ChatGroq
                    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=groq_api_key, temperature=0)
                elif google_api_key:
                    print("?? Running Confidence LLM Extraction via Google Gemini (gemini-1.5-pro)...")
                    from langchain_google_genai import ChatGoogleGenerativeAI
                    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=google_api_key, temperature=0)
                elif USE_LOCAL_LLM:
                    print("?? Running Confidence LLM Extraction via Local Ollama (qwen2.5)...")
                    from langchain_ollama import ChatOllama
                    llm = ChatOllama(model="qwen2.5:latest", temperature=0)

            if not llm:
                if last_exc:
                    raise Exception("exhausted") from last_exc
                raise Exception("exhausted")

            structured_llm = llm.with_structured_output(SeafarerApplicationWithConfidence)
            
            print("Invoking LLM...")
            try:
                result = structured_llm.invoke(prompt)
                print("? LLM Extraction complete.")
                return result.to_numbered_dict(), api_keys_config
            except Exception as exc:
                err = str(exc).lower()
                last_exc = exc
                if "rate limit" in err or "429" in err or "quota" in err or "exhausted" in err:
                    if source and source["provider"] == "groq":
                        reset_time = _parse_groq_reset_time(str(exc))
                        api_keys_config["groq"][source["index"]]["status"] = "exhausted"
                        api_keys_config["groq"][source["index"]]["reset_time"] = reset_time
                        print(f"[Rate-limit] Groq key {source['index']} exhausted. Resets at {reset_time}.")
                        continue
                    elif source and source["provider"] == "gemini":
                        print("[Rate-limit] Gemini key exhausted.")
                        api_keys_config["gemini_exhausted"] = True
                        continue
                raise exc

        except Exception as e:
            if "exhausted" in str(e).lower():
                print(f"?? API Keys exhausted.")
                return {"validation_error": "API Keys exhausted"}, api_keys_config
                
            print(f"?? Local LLM extraction failed: {e}. Falling back to old parser...")
            break

    # Fallback to empty if LLM fails completely
    print("?? LLM Extraction Failed entirely.")
    return SeafarerApplicationWithConfidence().to_numbered_dict(), api_keys_config
'''

final_content = content_before + new_function

with open(file_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print("Updated document_to_json.py")
