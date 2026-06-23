import re

filepath = r'src/components/dashboard/Sidebar.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the second const menuItems block with const menuItems = SHARED_MENU_ITEMS;
# We will match `const menuItems = [\n...\n  ];` that occurs inside `MobileSidebar`
new_content = re.sub(r'(export const MobileSidebar.*?const menuItems = )\[\s*\{.*?\}\s*\];', r'\1SHARED_MENU_ITEMS;', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed MobileSidebar menuItems!")
