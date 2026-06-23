// StatCard.jsx - Tailwind Refactored
import React, { useState } from "react";
import { COLORS } from "../../Constants";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const StatCard = ({
  title,
  value,
  trend,
  trendDirection,
  icon,
  accentColor,
  onClick,
  isActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isUp = trendDirection === "up";
  const hasTrendArrow = trendDirection === "up" || trendDirection === "down";

  // Compute dynamic border and shadow for active/hover states
  const borderStyle = isActive || isHovered 
    ? `1px solid ${accentColor}` 
    : '1px solid transparent';
    
  const shadowStyle = isActive 
    ? `0 4px 20px -5px ${accentColor}40` 
    : undefined;

  return (
    <div 
      className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-[22px] p-6 w-full h-[160px] flex flex-col justify-between shadow-sm border-slate-100 dark:border-slate-800 transition-all duration-300 group ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      style={{
        border: borderStyle,
        boxShadow: shadowStyle,
        // Fallback for border when not active/hovered
        ...( (!isActive && !isHovered) ? {} : { borderColor: accentColor } )
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {/* Decorative Accent Background */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] transition-opacity duration-300 pointer-events-none"
        style={{ 
          backgroundColor: accentColor || COLORS.primary,
          opacity: isActive ? 0.08 : (isHovered ? 0.06 : 0.03)
        }}
      />
      
      {/* Header: Title & Icon */}
      <div className="flex items-start justify-between relative z-10">
        <h3 className={`font-heading font-medium text-sm tracking-wide break-words max-w-[140px] leading-snug transition-colors ${isActive ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
          {title}
        </h3>
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-sm filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
          style={{ 
            backgroundColor: isActive ? `${accentColor}25` : `${accentColor}15`, 
            color: accentColor 
          }}
        >
          {React.isValidElement(icon) ? (
            icon
          ) : typeof icon === 'string' && !icon.includes('/') && !icon.includes('.') ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <img src={icon} alt="" className="w-6 h-6 object-contain" />
          )}
        </div>
      </div>

      {/* Body: Value */}
      <div className="relative z-10">
        <p className="font-sans font-bold text-4xl text-slate-900 dark:text-white tracking-tight m-0">
          {value || "0"}
        </p>
      </div>

      {/* Footer: Trend */}
      <div className="flex items-center gap-2 relative z-10">
        {hasTrendArrow ? (
          <span className={`flex items-center justify-center text-xs font-bold w-6 h-6 rounded-md ${isUp ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'}`}>
            {isUp ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
          </span>
        ) : (
          <span 
            className="flex items-center justify-center w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        )}
        <span className={`text-xs font-medium truncate ${isActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};

