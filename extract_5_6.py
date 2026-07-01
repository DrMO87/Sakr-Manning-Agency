import json
data = json.load(open('found_logic.json', encoding='utf-8'))
for i in [5, 6]:
    d = json.loads(data[i])
    with open(f"item_code_{i}.py", "w", encoding="utf-8") as f:
        f.write(d['CodeContent'])
