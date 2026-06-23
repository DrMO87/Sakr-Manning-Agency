import os
import re

dir_path = r'src'

changed_files = 0
for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fix label="label="...""
            new_content = re.sub(r'(label|placeholder|title|tooltip|Header)=([\'"])\1=\2(.*?)\2\2', r'\1=\2\3\2', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_files += 1

print(f"Fixed {changed_files} files.")
