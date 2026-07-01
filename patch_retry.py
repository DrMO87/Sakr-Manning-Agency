import sys
file_path = r'd:/M SQUARE (MSQ)/CODE SQUARE/Sakr-Manning-Agency-Backend-main/Sakr-Manning-Agency-Backend-main/ai_document/document_to_json.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_retry_func = """def _call_llm_with_retry(prompt: str, schema: type, api_keys_config: dict, max_retries: int = 3):
    last_exc = None
    retries = 0
    
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
                retries += 1
                if retries > max_retries:
                    print(f"[LLM Error] Max retries ({max_retries}) exceeded: {exc}")
                    raise exc
                else:
                    print(f"[LLM Error] Retry {retries}/{max_retries} for error: {exc}")
                    import time
                    time.sleep(2)
                    continue"""

import re
# Find the definition of _call_llm_with_retry
start_idx = content.find("def _call_llm_with_retry")
# Find the definition of _int_or_none
end_idx = content.find("def _int_or_none")

content = content[:start_idx] + new_retry_func + "\n\n" + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated _call_llm_with_retry to actually retry on parsing errors!")
