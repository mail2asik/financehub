import React from 'react';

interface StatusBadgeProps {
  isActive: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive }) => {
  if (isActive) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
        Active
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
      Inactive
    </span>
  );
};