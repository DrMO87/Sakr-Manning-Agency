import json
data = json.load(open('found_logic.json', encoding='utf-8'))
for item in data:
    if "def _build_comprehensive_prompt" in item and "def convert_text_to_json" in item:
        if len(item) > 10000:
            with open('recovered_document_to_json.py', 'w', encoding='utf-8') as f:
                f.write(item)
            print("Recovered file saved to recovered_document_to_json.py")
            break
