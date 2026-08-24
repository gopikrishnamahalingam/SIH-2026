import React from 'react';
import { Check } from 'lucide-react';

interface LifecycleTrackerProps {
  currentStage: 'CHALLENGE' | 'DISCOVERY' | 'ELIGIBILITY' | 'EVALUATION' | 'PILOT' | 'VALIDATION' | 'SCALE';
}

const STAGES = [
  { key: 'CHALLENGE', label: 'Challenge' },
  { key: 'DISCOVERY', label: 'Discovery' },
  { key: 'ELIGIBILITY', label: 'Eligibility' },
  { key: 'EVALUATION', label: 'Evaluation' },
  { key: 'PILOT', label: 'Pilot' },
  { key: 'VALIDATION', label: 'Validation' },
  { key: 'SCALE', label: 'Scale' },
];

export const LifecycleTracker: React.FC<LifecycleTrackerProps> = ({ currentStage }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Procurement Lifecycle Progress
      </h3>
      <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0">
        {/* Horizontal Connector Line for Desktop */}
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-100 hidden md:block z-0" />
        
        {/* Active Connector Progress Line */}
        {currentIndex > 0 && (
          <div 
            className="absolute top-5 left-10 h-0.5 bg-blue-900 hidden md:block z-0 transition-all duration-500" 
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 82}%` }}
          />
        )}

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div key={stage.key} className="flex md:flex-col items-center flex-1 w-full md:w-auto z-10">
              {/* Step indicator node */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500 shadow-emerald-100 shadow-md'
                    : isActive
                    ? 'bg-blue-900 text-white border-2 border-blue-900 ring-4 ring-blue-100 shadow-blue-100 shadow-md scale-115'
                    : 'bg-slate-50 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
              </div>

              {/* Step Label */}
              <div className="ml-4 md:ml-0 md:mt-3 flex flex-col items-start md:items-center text-left md:text-center">
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
