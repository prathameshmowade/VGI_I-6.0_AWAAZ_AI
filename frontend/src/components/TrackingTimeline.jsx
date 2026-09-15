import React from 'react';
import { FileCheck2, Brain, UserCheck, Wrench, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { label: 'Submitted', icon: FileCheck2 },
  { label: 'AI Analyzed', icon: Brain },
  { label: 'Assigned', icon: UserCheck },
  { label: 'In Progress', icon: Wrench },
  { label: 'Resolved', icon: CheckCircle2 }
];

export default function TrackingTimeline({ currentStep = 2 }) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 py-4">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isCompleted = i <= currentStep;
        const isCurrent = i === currentStep;

        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-xs font-semibold ${
                  isCompleted ? 'text-emerald-950 font-bold' : 'text-emerald-700'
                }`}
              >
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`hidden sm:block flex-1 h-0.5 min-w-[20px] rounded ${
                  i < currentStep ? 'bg-emerald-500' : 'bg-emerald-100'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
