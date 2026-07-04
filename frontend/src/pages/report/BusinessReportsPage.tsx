import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Clock } from 'lucide-react';
import { useBusiness, useBusinessReports } from '../../hooks/useBusiness';
import { CardSkeleton } from '../../components/shared/Skeleton';
import type { ReportSummary } from '../../types';

export default function BusinessReportsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: business, isLoading: bizLoading } = useBusiness(id ?? '');
  const { data: reports, isLoading: rLoading } = useBusinessReports(id ?? '');
  const navigate = useNavigate();

  const isLoading = bizLoading || rLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {business?.businessName ?? 'Business Reports'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">All report versions</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link to="/new-business" className="btn-primary">
          <Plus className="w-4 h-4" /> New Report
        </Link>
      </div>

      {isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>}

      {!isLoading && (!reports || reports.length === 0) && (
        <div className="card p-10 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No reports yet for this business.</p>
          <Link to="/new-business" className="btn-primary inline-flex mt-4">Generate First Report</Link>
        </div>
      )}

      {reports && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((r: ReportSummary) => (
            <button
              key={r._id}
              onClick={() => navigate(`/reports/${r._id}`)}
              className="card p-5 w-full text-left hover:shadow-card-hover transition-shadow flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Version {r.version}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <span className={`badge ${r.generationStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {r.generationStatus}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
