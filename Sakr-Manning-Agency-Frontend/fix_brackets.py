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
            
            # The previous script replaced >...< with >>...<<
            # We will revert >> to > and << to < 
            # Note: We should be careful. >> is a valid JS operator.
            # But the bug specifically created `>>` followed by text that doesn't contain `<` and then `<<`.
            # Actually, `>>{children}<<` is what happened.
            # So let's match `>>([^<]+)<<` and replace with `>\1<`.
            
            new_content = re.sub(r'>>([^<]+)<<', r'>\1<', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_files += 1

print(f"Fixed {changed_files} files.")
