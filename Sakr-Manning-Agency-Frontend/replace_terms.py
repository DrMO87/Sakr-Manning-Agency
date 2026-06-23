import os
import re

dir_path = r'src'

# Words to replace (case-sensitive to avoid matching lowercase variables like `contract.company`)
replacements = {
    'Company': 'Principal',
    'Companies': 'Principals',
    'COMPANY': 'PRINCIPAL',
    'COMPANIES': 'PRINCIPALS',
    'Ship': 'Vessel',
    'Ships': 'Vessels',
    'SHIP': 'VESSEL',
    'SHIPS': 'VESSELS',
}

def replace_in_string(match):
    text = match.group(0)
    # Skip paths
    if '/' in text or '\\' in text or 'import' in text:
        return text
    
    # Apply replacements
    for old, new in replacements.items():
        text = re.sub(rf'\b{old}\b', new, text)
    return text

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        # Skip lines that are purely imports, exports, or class names
        if line.strip().startswith('import ') or line.strip().startswith('export default '):
            new_lines.append(line)
            continue
            
        # We will target specific attribute patterns and JSX text
        # 1. label="...", placeholder="...", title="..."
        line = re.sub(r'(label|placeholder|title|tooltip|Header)=([\'"])(.*?)\2', 
                      lambda m: f'{m.group(1)}={m.group(2)}{replace_in_string(m)}{m.group(2)}', line)
        
        # 2. JSX text nodes: >...<
        line = re.sub(r'>([^<]+)<', lambda m: f'>{replace_in_string(m)}<', line)
        
        # 3. Inside strings that contain spaces (likely sentences or display text)
        def string_repl(m):
            s = m.group(0)
            if ' ' in s and not '/' in s: # likely a sentence/display string
                return replace_in_string(m)
            return s
            
        line = re.sub(r'["\'`][^"\'`]*["\'`]', string_repl, line)
        
        # 4. In case there are standalone words like Companies (e.g. in config objects)
        # We'll just do a raw replace IF it's not a variable assignment
        if not re.search(r'(const|let|var|class|function)\s+(Company|Companies|Ship|Ships)', line):
            # Also avoid api.get('/companies')
            if 'api.' not in line and 'className=' not in line:
                for old, new in replacements.items():
                    line = re.sub(rf'\b{old}\b', new, line)
                    
        new_lines.append(line)

    new_content = '\n'.join(new_lines)
    
    if original != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

changed_files = 0
for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            if process_file(filepath):
                changed_files += 1

print(f"Updated {changed_files} files.")
