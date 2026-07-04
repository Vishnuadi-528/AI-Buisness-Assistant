import { useState } from 'react';
import { ClipboardList, Wrench } from 'lucide-react';
import clsx from 'clsx';
import type { ActionPlan, ActionPhase, ActionTask } from '../../types';

interface Props { data: ActionPlan; }

export default function ActionChecklist({ data }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const totalTasks = data.phases?.reduce((s: number, p: ActionPhase) => s + (p.tasks?.length ?? 0), 0) ?? 0;
  const doneCount = checked.size;
  const progress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-brand-600" /> Action Plan
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{doneCount}/{totalTasks} tasks</span>
          <div className="w-24 bg-slate-100 rounded-full h-2">
            <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-brand-600">{progress}%</span>
        </div>
      </div>

      {data.framework_used && (
        <p className="text-xs text-slate-400 italic">Framework: {data.framework_used}</p>
      )}

      <div className="space-y-5">
        {data.phases?.map((phase: ActionPhase, pi: number) => (
          <div key={pi} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                {pi + 1}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{phase.phase_name}</h3>
                {phase.objective && <p className="text-xs text-slate-500">{phase.objective}</p>}
              </div>
            </div>

            <div className="ml-8 space-y-2">
              {phase.tasks?.map((task: ActionTask) => {
                const key = `${pi}-${task.step}`;
                const done = checked.has(key);
                return (
                  <label key={key}
                    className={clsx(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none',
                      done ? 'bg-green-50 border-green-200' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <input type="checkbox" checked={done} onChange={() => toggle(key)} className="mt-0.5 accent-brand-600" />
                    <div className="min-w-0">
                      <p className={clsx('text-sm font-medium', done && 'line-through text-slate-400')}>
                        Step {task.step}: {task.action}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                        {task.owner && <span>👤 {task.owner}</span>}
                        {task.deadline && <span>⏱ {task.deadline}</span>}
                        {task.success_metric && <span>🎯 {task.success_metric}</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {data.key_milestones?.length > 0 && (
        <div className="mt-4 bg-brand-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-brand-800 mb-2">Key Milestones</h3>
          <ul className="space-y-1">
            {data.key_milestones.map((m: string, i: number) => (
              <li key={i} className="text-sm text-brand-700 flex items-start gap-2">
                <span className="text-brand-400 shrink-0">🏆</span>{m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.tools_and_automation?.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Wrench className="w-4 h-4" /> Recommended Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.tools_and_automation.map((t: string, i: number) => (
              <span key={i} className="badge bg-white border border-slate-200 text-slate-600">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
