import json
import re

transcript_path = r"C:\Users\dell\.gemini\antigravity\brain\4aab20b5-398a-49fe-97ff-0a03795f4a77\.system_generated\logs\transcript_full.jsonl"

found_content = []

with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
for line in lines:
    try:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE' and data.get('source') == 'MODEL':
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] in ['write_to_file', 'replace_file_content']:
                        args_str = json.dumps(call['args'])
                        if 'def _build_comprehensive_prompt' in args_str or '_FullCVExtraction' in args_str:
                            found_content.append(args_str)
            if 'content' in data:
                if 'def _build_comprehensive_prompt' in data['content'] or '_FullCVExtraction' in data['content']:
                    found_content.append(data['content'])
    except Exception as e:
        continue

with open('found_logic.json', 'w', encoding='utf-8') as out:
    json.dump(found_content, out, indent=2)

print(f"Found {len(found_content)} occurrences. Saved to found_logic.json")
