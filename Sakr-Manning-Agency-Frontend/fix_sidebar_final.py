import re

filepath = r'src/components/dashboard/Sidebar.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find `const menuItems = [` and remove it until `];\n\n  return (`
# In both Sidebar and MobileSidebar.

# Let's just find the start and end indices of `const menuItems = [` and replace it.

def replace_menu_items(text):
    while True:
        start_idx = text.find('const menuItems = [')
        if start_idx == -1:
            break
        
        # find the next `];`
        end_idx = text.find('  ];', start_idx)
        if end_idx == -1:
            end_idx = text.find('];', start_idx)
            
        if end_idx != -1:
            # Replace the whole block with `const menuItems = SHARED_MENU_ITEMS;`
            text = text[:start_idx] + 'const menuItems = SHARED_MENU_ITEMS;' + text[end_idx + 4:]
        else:
            break
    return text

new_content = replace_menu_items(content)

# In MobileSidebar, we also need to apply the styling changes!
# Wait, the styling changes were applied globally! Let's check if MobileSidebar has `${item.theme.activeBg}`.
# If not, let's just re-apply the global style replacements on the whole file just to be sure.

# button styling:
new_content = new_content.replace(
    '''${
                    isActive
                      ? "bg-blue-600/10 text-blue-400"
                      : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }''',
    '''${
                    isActive
                      ? `${item.theme.activeBg} ${item.theme.activeText}`
                      : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }'''
)

# Active indicator bar:
new_content = new_content.replace(
    '''<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-md" />''',
    '''<div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md ${item.theme.indicator}`} />'''
)

# Icon span wrapper:
new_content = new_content.replace(
    '''<span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 font-bold text-blue-500' : 'group-hover:scale-110'}`}>''',
    '''<span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? `scale-110 font-bold ${item.theme.iconActive}` : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-300'}`}>'''
)

old_img = '''<img src={item.icon} alt={item.label} className="w-5 h-5 object-contain filter drop-shadow-sm opacity-80 group-hover:opacity-100" />'''
new_img = '''<div className={`w-5 h-5 transition-colors duration-300 bg-current opacity-90 group-hover:opacity-100`} style={{ WebkitMask: `url(${item.icon}) center/contain no-repeat`, mask: `url(${item.icon}) center/contain no-repeat` }} />'''
new_content = new_content.replace(old_img, new_img)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed Sidebar completely!")
