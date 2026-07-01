import json
data = json.load(open('found_replacements.json', encoding='utf-8'))
for i, d in enumerate(data):
    keys = list(d.keys())
    desc = d.get('Description', d.get('Instruction', 'No description'))
    print(f"{i}: {keys} - {desc}")
    if 'CodeContent' in d:
        with open(f"repl_{i}.py", "w", encoding="utf-8") as f:
            f.write(d['CodeContent'])
    elif 'ReplacementChunks' in d:
        for j, c in enumerate(d['ReplacementChunks']):
            with open(f"repl_{i}_chunk_{j}.py", "w", encoding="utf-8") as f:
                f.write(c.get('ReplacementContent', ''))
    elif 'ReplacementContent' in d:
        with open(f"repl_{i}.py", "w", encoding="utf-8") as f:
            f.write(d['ReplacementContent'])
