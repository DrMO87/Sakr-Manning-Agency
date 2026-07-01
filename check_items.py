import json
data = json.load(open('found_logic.json', encoding='utf-8'))
for i in [1, 2, 5, 6]:
    if data[i].startswith('{'):
        d = json.loads(data[i])
        print(f"Item {i}: {list(d.keys())}")
        if 'CodeContent' in d:
            print(d['CodeContent'][:100])
