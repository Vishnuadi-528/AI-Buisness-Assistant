import { Link } from 'react-router-dom';
import { Building2, Calendar, FileText, Trash2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Business } from '../../types';
import { useDeleteBusiness } from '../../hooks/useBusiness';

const stageLabel: Record<string, string> = { idea: 'Idea', early: 'Early Stage', growth: 'Growth' };

interface Props { business: Business; }

export default function BusinessCard({ business }: Props) {
  const deleteBiz = useDeleteBusiness();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Delete "${business.businessName}" and all its reports?`)) {
      deleteBiz.mutate(business._id);
    }
  };

  return (
    <div className="card p-6 hover:shadow-card-hover transition-shadow group relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{business.businessName}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {business.industry ?? 'Industry not set'}
            </p>
          </div>
        </div>
        <span className={clsx(
          'badge shrink-0',
          business.stage === 'idea' ? 'badge-idea' :
          business.stage === 'early' ? 'badge-early' : 'badge-growth'
        )}>
          {stageLabel[business.stage]}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        {business.country && (
          <span>📍 {business.location ?? business.country}</span>
        )}
        {business.investmentAmount && (
          <span>💰 ₹{business.investmentAmount.toLocaleString()}</span>
        )}
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          {business.reportCount ?? 0} report{(business.reportCount ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <Calendar className="w-3.5 h-3.5" />
        {new Date(business.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2">
        <Link
          to={`/business/${business._id}`}
          className="btn-primary py-2 px-4 text-xs flex-1 justify-center"
        >
          View Reports <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleteBiz.isPending}
          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
          aria-label="Delete business"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
