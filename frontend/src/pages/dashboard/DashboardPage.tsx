import { Link } from 'react-router-dom';
import { Plus, Brain, TrendingUp, FileText, Building2 } from 'lucide-react';
import { useBusinessList } from '../../hooks/useBusiness';
import { useAuthStore } from '../../store/authStore';
import BusinessCard from '../../components/dashboard/BusinessCard';
import { CardSkeleton } from '../../components/shared/Skeleton';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: businesses, isLoading, isError } = useBusinessList();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your business ideas and AI-generated reports.
          </p>
        </div>
        <Link to="/new-business" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> New Business Report
        </Link>
      </div>

      {/* Stats row */}
      {businesses && businesses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Businesses', value: businesses.length, icon: Building2, color: 'brand' },
            { label: 'Total Reports', value: businesses.reduce((s, b) => s + (b.reportCount ?? 0), 0), icon: FileText, color: 'emerald' },
            { label: 'Active Ideas', value: businesses.filter(b => b.stage === 'idea').length, icon: Brain, color: 'violet' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Business list */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Businesses</h2>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="card p-8 text-center text-slate-500">
            Failed to load businesses. Please refresh.
          </div>
        )}

        {!isLoading && businesses?.length === 0 && <EmptyState />}

        {businesses && businesses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map(b => <BusinessCard key={b._id} business={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-8 h-8 text-brand-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No businesses yet</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
        Create your first business report. Just enter a name and idea — the AI handles the rest.
      </p>
      <Link to="/new-business" className="btn-primary inline-flex">
        <Plus className="w-4 h-4" /> Create Your First Report
      </Link>
    </div>
  );
}
