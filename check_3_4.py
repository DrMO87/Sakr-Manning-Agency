import json
data = json.load(open('found_logic.json', encoding='utf-8'))
print("Item 3 keys:", json.loads(data[3]).keys() if data[3].startswith('{') else "not json")
if data[3].startswith('{'): print(json.loads(data[3]).get("CodeContent", "")[:100])
print("Item 4 keys:", json.loads(data[4]).keys() if data[4].startswith('{') else "not json")
if data[4].startswith('{'): print(json.loads(data[4]).get("CodeContent", "")[:100])
