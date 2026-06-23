// StatusBadge.jsx - Tailwind Refactored
import React from "react";
import { COLORS } from "../../Constants";

export const StatusBadge = ({ status, count, icon }) => {
  const getStyles = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case "pending":
        return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
      case "interview":
        return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
      case "accepted":
        return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
      case "rejected":
        return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
      default:
        return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" };
    }
  };

  const statusLabels = {
    pending: "Interview Scheduled",
    interview: "Total Interviews",
    accepted: "Accepted CVs",
    rejected: "Rejected CVs",
  };

  const styles = getStyles(status);

  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm w-full md:w-[200px] flex-shrink-0 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300`}>
      <div className="flex flex-col gap-1">
        <h5 className={`font-heading font-semibold text-sm ${styles.text} m-0 leading-tight`}>
          {statusLabels[status] || "Status"}
        </h5>
        <span className="font-sans font-bold text-2xl text-slate-800 leading-tight">
          {count}
        </span>
      </div>

      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${styles.bg} ${styles.border} border`}>
        {typeof icon === 'string' && !icon.includes('/') && !icon.includes('.') ? (
          <span className={`text-xl ${styles.text}`}>{icon}</span>
        ) : (
          <img
            src={icon}
            alt="icon"
            className="w-5 h-5 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
};

