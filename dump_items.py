import json
data = json.load(open('found_logic.json', encoding='utf-8'))
for i, item in enumerate(data):
    print(f"Item {i}: len {len(item)}")
    with open(f"item_{i}.txt", "w", encoding="utf-8") as f:
        f.write(item)
