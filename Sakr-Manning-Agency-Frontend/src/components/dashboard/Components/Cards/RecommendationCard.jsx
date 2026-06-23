// RecommendationCard.jsx - Tailwind Refactored
import React from "react";
import { COLORS } from "../../Constants";
import { Calendar } from "lucide-react";

export const RecommendationCard = ({
  name,
  position,
  company,
  status,
  submittedDate,
  interviewDate,
  onClick,
}) => {
  const getStatusStyles = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      case "interview":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
      case "accepted":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
      case "rejected":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 rounded-xl transition-all duration-200 gap-4 ${
        onClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:shadow-sm" : ""
      }`}
    >
      {/* Left Column: Details */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="font-heading font-semibold text-slate-800 dark:text-slate-200 text-base m-0 truncate">
            {name}
          </h4>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="font-sans font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
            {position}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-sans text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            {company}
          </span>
        </div>
      </div>

      {/* Right Column: Dates */}
      <div className="flex flex-col items-start md:items-end gap-1.5 flex-shrink-0">
        {submittedDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={13} className="opacity-70" />
            <span>Submitted: {submittedDate}</span>
          </div>
        )}
        {interviewDate && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${status === 'interview' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
            <Calendar size={13} className="opacity-70" />
            <span>Interview: {interviewDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};


