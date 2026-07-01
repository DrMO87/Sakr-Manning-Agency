import json

transcript_path = r"C:\Users\dell\.gemini\antigravity\brain\6bc5fadd-7d1e-4665-95e6-577f114f3719\.system_generated\logs\transcript_full.jsonl"

found = None

try:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'write_to_file':
                        args = call['args']
                        if 'document_to_json.py' in args.get('TargetFile', ''):
                            found = args.get('CodeContent', '')
except FileNotFoundError:
    print("Transcript not found")

if found:
    with open("recovered_old_document_to_json.py", "w", encoding="utf-8") as f:
        f.write(found)
    print("Recovered file saved!")
else:
    print("Could not find write_to_file for document_to_json.py in previous conversation.")
