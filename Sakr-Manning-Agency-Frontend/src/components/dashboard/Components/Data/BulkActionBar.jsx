import React from "react";
import { X } from "lucide-react";

export function BulkActionBar({
  selectedCount = 0,
  onClearSelection,
  actions = []
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-slate-900 dark:bg-slate-800 text-white shadow-2xl rounded-2xl p-2.5 flex items-center gap-6 border border-slate-700/50 backdrop-blur-md">
        
        {/* Count & Clear */}
        <div className="flex items-center gap-3 pl-3 border-r border-slate-700/50 pr-6">
          <span className="flex items-center justify-center bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-slate-200">
            {selectedCount === 1 ? "Item Selected" : "Items Selected"}
          </span>
          <button
            onClick={onClearSelection}
            className="ml-2 p-1.5 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Clear Selection"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pr-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                action.variant === 'danger'
                  ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                  : action.variant === 'primary'
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-transparent text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-700 hover:text-white"
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
