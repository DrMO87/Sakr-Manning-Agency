import json

transcript_path = r"C:\Users\dell\.gemini\antigravity\brain\6bc5fadd-7d1e-4665-95e6-577f114f3719\.system_generated\logs\transcript_full.jsonl"

found_replacements = []

try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] in ['replace_file_content', 'multi_replace_file_content', 'write_to_file']:
                        args = call['args']
                        if 'document_to_json.py' in args.get('TargetFile', ''):
                            found_replacements.append(args)
except FileNotFoundError:
    print("Transcript not found")

with open("found_replacements.json", "w", encoding="utf-8") as f:
    json.dump(found_replacements, f, indent=2)
print(f"Found {len(found_replacements)} replacements")
