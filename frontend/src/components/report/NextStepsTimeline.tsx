import { ArrowRight } from 'lucide-react';

interface Props { steps: string[]; }

export default function NextStepsTimeline({ steps }: Props) {
  if (!steps?.length) return null;

  return (
    <div className="card p-6 space-y-4">
      <h2 className="section-title flex items-center gap-2">
        <ArrowRight className="w-5 h-5 text-brand-600" /> Next Steps
      </h2>
      <p className="text-sm text-slate-500">Take these concrete actions in the next 7–30 days:</p>

      <ol className="space-y-3">
        {steps.map((step: string, i: number) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-brand-700 transition-colors">
              {i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-slate-700">{step}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
