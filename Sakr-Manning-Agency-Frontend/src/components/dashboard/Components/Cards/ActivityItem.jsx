// ActivityItem.jsx - Tailwind Refactored
import React from "react";
import { COLORS } from "../../Constants";
import { Clock } from "lucide-react";

export const ActivityItem = ({ title, name, timestamp, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`group flex flex-col items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 rounded-xl transition-all duration-200 ${
        onClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 -mx-3 border-transparent" : ""
      }`}
    >
      <h4 className="font-heading font-medium text-slate-800 dark:text-slate-200 text-sm leading-tight m-0">
        {title}
      </h4>
      <div className="flex justify-between items-center w-full gap-3 flex-wrap">
        <p className="font-sans font-normal text-slate-600 dark:text-slate-400 text-[15px] m-0 flex-1 truncate">
          {name}
        </p>
        <span className="flex items-center gap-1.5 font-sans font-medium text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md">
          <Clock size={12} strokeWidth={2.5} />
          {timestamp}
        </span>
      </div>
    </div>
  );
};

