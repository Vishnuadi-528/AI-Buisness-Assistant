import { Landmark, ExternalLink, AlertTriangle } from 'lucide-react';
import type { GovernmentSchemes, GovernmentScheme } from '../../types';

interface Props { data: GovernmentSchemes; }

export default function SchemeCard({ data }: Props) {
  if (!data?.schemes?.length) return null;

  return (
    <div className="card p-6 space-y-5">
      <h2 className="section-title flex items-center gap-2">
        <Landmark className="w-5 h-5 text-brand-600" /> Government Schemes
      </h2>

      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{data.disclaimer}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.schemes.map((scheme: GovernmentScheme, i: number) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-brand-200 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">{scheme.name}</h3>
              <span className="badge bg-slate-100 text-slate-600 shrink-0">{scheme.type?.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-slate-500"><strong>For:</strong> {scheme.target_beneficiary}</p>
            <p className="text-xs text-slate-500"><strong>Benefit:</strong> {scheme.potential_benefit}</p>
            <p className="text-xs text-slate-500"><strong>How to apply:</strong> {scheme.how_to_apply}</p>
            {scheme.official_source_hint && (
              <p className="text-xs text-brand-600 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {scheme.official_source_hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
