// Sidebar.jsx and MobileSidebar.jsx

import React from "react";
import { COLORS } from "./Constants";
import { X, Bot, ChevronLeft, ChevronRight, Briefcase, CircleDollarSign } from "lucide-react";
import { ASSETS } from "../../utils/constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  { id: "management", label: "Principals & Vessels", icon: ASSETS.DASHBOARD_Sidebar_ICONS[2] || "🏢", theme: THEMES.purple },
  { id: "vacancies", label: "Job Vacancies", icon: <Briefcase size={20} />, theme: THEMES.orange },
  { id: "cvs", label: "Applicants", icon: ASSETS.DASHBOARD_Sidebar_ICONS[1] || "📄", theme: THEMES.emerald },
  { id: "interviews", label: "Interviews", icon: ASSETS.DASHBOARD_Sidebar_ICONS[3] || "📝", theme: THEMES.amber },
  { id: "documents", label: "Contracts", icon: ASSETS.DASHBOARD_Sidebar_ICONS[4] || "📋", theme: THEMES.indigo },
  { id: "cvSubmissions", label: "Crew Management", icon: ASSETS.DASHBOARD_Sidebar_ICONS[1] || "📥", theme: THEMES.teal },
  { id: "users", label: "Users", icon: ASSETS.DASHBOARD_Sidebar_ICONS[5] || "👥", theme: THEMES.pink },
  { id: "finance", label: "Finance Record", icon: <CircleDollarSign size={20} />, theme: THEMES.blue },
  { id: "AI", label: "AI Assistant", icon: <Bot size={20} />, theme: THEMES.cyan },
];


export const Sidebar = ({ currentPage, onPageChange, isCollapsed, onToggle }) => {
  const menuItems = SHARED_MENU_ITEMS;
  const sidebarRef = React.useRef(null);
  gsap.registerPlugin(useGSAP);

  useGSAP(() => {
    gsap.fromTo(".sidebar-menu-item", 
      { opacity: 0, x: -30 }, 
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)", delay: 0.4 }
    );
  }, { scope: sidebarRef });

  return (
    <>
      <style>{`
        .hide-sidebar-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <aside
        ref={sidebarRef}
        className={`hide-sidebar-scrollbar h-full bg-slate-900 flex flex-col py-6 z-50 text-white shadow-xl border-r border-slate-800 transition-all duration-300 relative ${
          isCollapsed ? "w-[80px]" : "w-[240px]"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute top-6 -right-3 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-sm z-50"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`flex flex-col items-center justify-center text-center transition-all duration-300 ${isCollapsed ? "px-2 mb-8" : "px-6 mb-8"}`}>
          <div className={`bg-white/10 rounded-full flex items-center justify-center mb-4 flex-shrink-0 shadow-inner border border-white/5 transition-all duration-300 overflow-hidden ${isCollapsed ? "w-14 h-14" : "w-20 h-20"}`}>
            <img src={ASSETS.LOGO} alt="Sidebar-Logo" className={`object-cover rounded-full transition-all duration-300 w-full h-full`} />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "max-h-0 opacity-0" : "max-h-20 opacity-100"}`}>
            <p className="font-heading font-semibold text-xs leading-4 tracking-widest text-slate-200 whitespace-nowrap">
              SAKR MANNING<br/>AGENCY
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-sidebar-scrollbar">
          <nav className="flex flex-col gap-2 px-3">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <div key={item.id} className="sidebar-menu-item relative group opacity-0">
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full h-12 flex items-center rounded-xl transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? `${item.theme.activeBg} ${item.theme.activeText}`
                      : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  } ${isCollapsed ? "justify-center px-0" : "justify-start px-4 gap-4"}`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md ${item.theme.indicator}`} />
                  )}

                  {/* Icon */}
                  <span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? `scale-110 font-bold ${item.theme.iconActive}` : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-300'}`}>
                    {React.isValidElement(item.icon) ? (
                      item.icon
                    ) : typeof item.icon === "string" && !item.icon.startsWith("/") && !item.icon.startsWith("data:") && !item.icon.endsWith(".svg") && !item.icon.endsWith(".png") ? (
                      item.icon
                    ) : (
                      <div className={`w-5 h-5 transition-colors duration-300 bg-current opacity-90 group-hover:opacity-100`} style={{ WebkitMask: `url(${item.icon}) center/contain no-repeat`, mask: `url(${item.icon}) center/contain no-repeat` }} />
                    )}
                  </span>

                  {/* Label */}
                  <span className={`font-sans text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100 font-medium"}`}>
                    {item.label}
                  </span>
                </button>

                {/* Tooltip (Only visible when collapsed) */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-slate-700 whitespace-nowrap z-[100]">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export const MobileSidebar = ({
  isOpen,
  onClose,
  currentPage,
  onPageChange,
}) => {
  const menuItems = SHARED_MENU_ITEMS;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 w-[280px] h-screen bg-slate-900 z-[1000] flex flex-col p-6 gap-8 overflow-y-auto text-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-3 flex-shrink-0 shadow-inner border border-white/5 overflow-hidden">
              <img src={ASSETS.LOGO} alt="Sidebar-Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <p className="font-heading font-semibold text-xs leading-4 tracking-widest text-slate-200">
              SAKR MANNING<br />AGENCY
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 flex items-center justify-center bg-transparent border-none text-slate-400 cursor-pointer hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  onClose();
                }}
                className={`w-full h-12 px-4 rounded-xl flex items-center gap-4 text-[15px] font-medium transition-all duration-300 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                    : "bg-transparent text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {React.isValidElement(item.icon) ? (
                    item.icon
                  ) : typeof item.icon === "string" && !item.icon.startsWith("/") && !item.icon.startsWith("data:") && !item.icon.endsWith(".svg") && !item.icon.endsWith(".png") ? (
                    item.icon
                  ) : (
                    <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain filter drop-shadow-sm" />
                  )}
                </span>
                <span className="font-sans tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
