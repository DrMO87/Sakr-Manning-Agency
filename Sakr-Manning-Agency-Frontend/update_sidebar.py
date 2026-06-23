import os
import re

filepath = r'src/components/dashboard/Sidebar.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. We'll define the THEMES and MENU_ITEMS right after the imports
themes_and_items = """
const THEMES = {
  blue: { activeBg: "bg-blue-600/10", activeText: "text-blue-400", indicator: "bg-blue-500", iconActive: "text-blue-500" },
  emerald: { activeBg: "bg-emerald-600/10", activeText: "text-emerald-400", indicator: "bg-emerald-500", iconActive: "text-emerald-500" },
  purple: { activeBg: "bg-purple-600/10", activeText: "text-purple-400", indicator: "bg-purple-500", iconActive: "text-purple-500" },
  orange: { activeBg: "bg-orange-600/10", activeText: "text-orange-400", indicator: "bg-orange-500", iconActive: "text-orange-500" },
  teal: { activeBg: "bg-teal-600/10", activeText: "text-teal-400", indicator: "bg-teal-500", iconActive: "text-teal-500" },
  amber: { activeBg: "bg-amber-600/10", activeText: "text-amber-400", indicator: "bg-amber-500", iconActive: "text-amber-500" },
  indigo: { activeBg: "bg-indigo-600/10", activeText: "text-indigo-400", indicator: "bg-indigo-500", iconActive: "text-indigo-500" },
  pink: { activeBg: "bg-pink-600/10", activeText: "text-pink-400", indicator: "bg-pink-500", iconActive: "text-pink-500" },
  cyan: { activeBg: "bg-cyan-600/10", activeText: "text-cyan-400", indicator: "bg-cyan-500", iconActive: "text-cyan-500" },
};

const SHARED_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: ASSETS.DASHBOARD_Sidebar_ICONS[0] || "🏠", theme: THEMES.blue },
  { id: "cvs", label: "Applicants", icon: ASSETS.DASHBOARD_Sidebar_ICONS[1] || "📄", theme: THEMES.emerald },
  { id: "management", label: "Principals & Vessels", icon: ASSETS.DASHBOARD_Sidebar_ICONS[2] || "🏢", theme: THEMES.purple },
  { id: "vacancies", label: "Job Vacancies", icon: <Briefcase size={20} />, theme: THEMES.orange },
  { id: "cvSubmissions", label: "Crew Management", icon: ASSETS.DASHBOARD_Sidebar_ICONS[1] || "📥", theme: THEMES.teal },
  { id: "interviews", label: "Interviews", icon: ASSETS.DASHBOARD_Sidebar_ICONS[3] || "📝", theme: THEMES.amber },
  { id: "documents", label: "Contracts", icon: ASSETS.DASHBOARD_Sidebar_ICONS[4] || "📋", theme: THEMES.indigo },
  { id: "users", label: "Users", icon: ASSETS.DASHBOARD_Sidebar_ICONS[5] || "👥", theme: THEMES.pink },
  { id: "AI", label: "AI Assistant", icon: <Bot size={20} />, theme: THEMES.cyan },
];
"""

# Insert right after `import { ASSETS } from "../../utils/constants";`
content = content.replace('import { ASSETS } from "../../utils/constants";', 'import { ASSETS } from "../../utils/constants";\n' + themes_and_items)

# Now, in `export const Sidebar = ({ ... }) => {`
# We replace the local `const menuItems = [ ... ];` with `const menuItems = SHARED_MENU_ITEMS;`
# We'll use regex to remove the `const menuItems = [\n ... \n  ];` block.
import re

content = re.sub(r'const menuItems = \[\s*\{.*?\}\s*\];', 'const menuItems = SHARED_MENU_ITEMS;', content, flags=re.DOTALL)

# Now for the styling classes inside Sidebar map
# button styling:
content = content.replace(
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
content = content.replace(
    '''<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-md" />''',
    '''<div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md ${item.theme.indicator}`} />'''
)

# Icon span wrapper:
content = content.replace(
    '''<span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 font-bold text-blue-500' : 'group-hover:scale-110'}`}>''',
    '''<span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? `scale-110 font-bold ${item.theme.iconActive}` : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-300'}`}>'''
)

# The icon rendering:
old_img = '''<img src={item.icon} alt={item.label} className="w-5 h-5 object-contain filter drop-shadow-sm opacity-80 group-hover:opacity-100" />'''
new_img = '''<div className={`w-5 h-5 transition-colors duration-300 bg-current opacity-90 group-hover:opacity-100`} style={{ WebkitMask: `url(${item.icon}) center/contain no-repeat`, mask: `url(${item.icon}) center/contain no-repeat` }} />'''
content = content.replace(old_img, new_img)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Sidebar.jsx!")
