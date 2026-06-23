import os
import re

dir_path = r'src'
matches = []

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if re.search(r'>\s*Companies\s*<|>\s*Company\s*<|>\s*Ships\s*<|>\s*Ship\s*<', line, re.IGNORECASE) or \
                   re.search(r'label=[\'\"](?:.*?)(Company|Companies|Ship|Ships).*?[\'\"]', line, re.IGNORECASE) or \
                   re.search(r'placeholder=[\'\"](?:.*?)(Company|Companies|Ship|Ships).*?[\'\"]', line, re.IGNORECASE) or \
                   re.search(r'title=[\'\"](?:.*?)(Company|Companies|Ship|Ships).*?[\'\"]', line, re.IGNORECASE) or \
                   re.search(r'[\'\"](?:.*?)(Company|Companies|Ship|Ships)(?:.*?)[\'\"]', line, re.IGNORECASE):
                    
                    if 'import ' in line or 'require(' in line or 'className=' in line or 'api.get' in line or 'api.post' in line:
                        continue
                    matches.append(f'{filepath}:{i+1}: {line.strip()}')

with open('text_matches.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(matches))
print(f'Found {len(matches)} matches. Wrote to text_matches.txt')
