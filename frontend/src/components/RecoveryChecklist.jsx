import { useState } from "react";
import { CheckSquare, Square, ChevronRight } from "lucide-react";

export default function RecoveryChecklist({ steps = [], nearestPoliceStation, recommendedActions = [] }) {
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (idx) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar Card */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between gap-6">
        <div>
          <h3 className="text-sm uppercase tracking-widest text-indigo-400 font-black">Recovery Progress</h3>
          <p className="text-2xl font-black text-white mt-1">{completedCount} of {steps.length} steps completed</p>
        </div>
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r="30" className="stroke-white/10 fill-transparent" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="30"
              className="stroke-emerald-400 fill-transparent transition-all duration-500"
              strokeWidth="6"
              strokeDasharray="188.4"
              strokeDashoffset={188.4 - (188.4 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Checklist Steps */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Step-By-Step Emergency Recovery Workflow</h4>
        <div className="flex flex-col gap-3">
          {steps.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                    : "bg-white/5 border-white/10 hover:border-indigo-500/40"
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-white/20'}`}>
                  {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div>
                  <h4 className={`text-sm font-black text-white ${isDone ? 'line-through text-white/40' : ''}`}>
                    Step {step.stepNumber}: {step.title}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'line-through text-white/20' : 'text-white/60 font-medium'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Police Station Advisory */}
      {nearestPoliceStation && (
        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="text-[10px] uppercase tracking-widest text-indigo-400 font-black mb-2">Nearest Police Authority</h4>
          <p className="text-white font-bold text-sm">{nearestPoliceStation}</p>
        </div>
      )}

      {/* Recommended Tips */}
      {recommendedActions.length > 0 && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">Critical Safety Advisories</h4>
          <ul className="space-y-2">
            {recommendedActions.map((action, idx) => (
              <li key={idx} className="text-xs text-white/75 font-medium flex items-start gap-2">
                <ChevronRight size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
