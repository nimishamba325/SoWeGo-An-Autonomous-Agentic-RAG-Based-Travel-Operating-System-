import React, { useState } from 'react';

export default function PrepChecklistCard({ checklist }) {
  if (!checklist) return null;

  // Track checked items locally in state
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalItems = checklist.items?.length || 0;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="my-4 w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      {/* Header & Progress */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Travel Readiness
          </span>
          <h3 className="text-lg font-bold text-white">
            🎒 {checklist.destination || "Trip"} Essentials
          </h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-teal-400">{progressPercent}% Ready</span>
          <p className="text-xs text-slate-400">{completedCount}/{totalItems} items packed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.items?.map((item, index) => {
          const isDone = !!checkedItems[index];

          return (
            <div
              key={index}
              onClick={() => toggleCheck(index)}
              className={`group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-950/20 opacity-75'
                  : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              {/* Checkbox */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-900 text-teal-400 transition-colors group-hover:border-teal-500">
                {isDone && (
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <span className="text-xs font-bold tracking-wide text-teal-300">
                  {item.category}
                </span>
                <p className={`mt-0.5 text-sm leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                  {item.advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}