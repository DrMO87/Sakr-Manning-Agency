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

            new_content = content
            
            # If the file imports 'lucide-react' and contains 'Vessel'
            if 'lucide-react' in content and 'Vessel' in content:
                # Replace 'Vessel' with 'Ship' inside the import block
                # A bit tricky to parse the import block safely, so we will do:
                # 1. Replace `Vessel,` -> `Ship,`
                # 2. Replace `icon={Vessel}` -> `icon={Ship}`
                # 3. Replace `<Vessel ` -> `<Ship `
                # 4. Replace `<Vessel/>` -> `<Ship/>`
                # 5. Replace `{ Vessel }` -> `{ Ship }`
                # 6. Replace `Vessel }` -> `Ship }`
                
                # Import statements specifically
                new_content = re.sub(r'import\s+{([^}]*)\bVessel\b([^}]*)}\s+from\s+["\']lucide-react["\']', 
                                     r'import {\1Ship\2} from "lucide-react"', new_content)
                
                # JSX usages
                new_content = re.sub(r'<Vessel\b', r'<Ship', new_content)
                new_content = re.sub(r'icon=\{Vessel\}', r'icon={Ship}', new_content)
                new_content = re.sub(r'icon:\s*Vessel\b', r'icon: Ship', new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_files += 1

print(f"Fixed {changed_files} files with broken lucide-react imports.")
