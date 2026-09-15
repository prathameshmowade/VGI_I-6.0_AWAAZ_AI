import React from 'react';

const C = {
  New: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Assigned: 'bg-amber-50 text-amber-800 border-amber-200',
  'In Progress': 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
  Resolved: 'bg-emerald-600 text-white border-emerald-600 font-bold'
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
        C[status] || 'bg-emerald-50 text-emerald-800 border-emerald-200'
      }`}
    >
      {status}
    </span>
  );
}
