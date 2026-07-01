import json
data = json.load(open('found_logic.json', encoding='utf-8'))
d = json.loads(data[1])
with open("main_func_code.py", "w", encoding="utf-8") as f:
    f.write(d['CodeContent'])
