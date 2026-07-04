import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  businessName: string;
  summary: string;
  viabilityScore?: number;
  overallRisk?: string;
  version: number;
  createdAt: string;
}

export default function ReportSummaryBanner({ businessName, summary, viabilityScore, overallRisk, version, createdAt }: Props) {
  const scoreColor =
    !viabilityScore ? 'text-slate-400' :
    viabilityScore >= 7 ? 'text-emerald-600' :
    viabilityScore >= 4 ? 'text-yellow-600' : 'text-red-600';

  const riskColor =
    overallRisk === 'low' ? 'bg-green-100 text-green-800' :
    overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
    overallRisk === 'high' ? 'bg-red-100 text-red-800' :
    overallRisk === 'very_high' ? 'bg-red-200 text-red-900' :
    'bg-slate-100 text-slate-600';

  return (
    <div className="card overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-brand-500 to-brand-700" />

      <div className="p-6 sm:p-8">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={clsx('badge', riskColor)}>
            <AlertCircle className="w-3 h-3 mr-1" />
            {(overallRisk ?? 'unknown').replace('_', ' ')} risk
          </span>
          {viabilityScore && (
            <span className={clsx('badge bg-slate-100 font-semibold', scoreColor)}>
              <TrendingUp className="w-3 h-3 mr-1" />
              Viability {viabilityScore}/10
            </span>
          )}
          <span className="badge bg-brand-50 text-brand-700">
            <Clock className="w-3 h-3 mr-1" />
            v{version} · {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{businessName}</h1>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Executive Summary
        </h2>
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{summary}</p>
      </div>
    </div>
  );
}
