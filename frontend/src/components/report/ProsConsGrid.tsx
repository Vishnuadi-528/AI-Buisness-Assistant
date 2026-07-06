import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import type { ProsAndCons } from '../../types';

interface Props { data: ProsAndCons; }

export default function ProsConsGrid({ data }: Props) {
  const score = data.overall_viability_score ?? 0;
  const bars = Array.from({ length: 10 }, (_, i) => i < score);

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0 flex items-center gap-2">
          <Star className="w-5 h-5 text-brand-600" /> Pros & Cons
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {bars.map((filled, i) => (
              <div key={i} className={`w-3 h-5 rounded-sm ${filled ? 'bg-brand-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">{score}/10</span>
        </div>
      </div>

      {data.viability_justification && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 italic">
          {data.viability_justification}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 space-y-2">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 text-sm">
            <ThumbsUp className="w-4 h-4" /> Pros
          </h3>
          <ul className="space-y-2">
            {data.pros?.map((pro: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span className="text-green-400 mt-0.5 shrink-0">✓</span>{pro}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-2">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 text-sm">
            <ThumbsDown className="w-4 h-4" /> Cons
          </h3>
          <ul className="space-y-2">
            {data.cons?.map((con: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>{con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
