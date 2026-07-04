import { useState } from 'react';
import { ShieldAlert, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { Risks, RiskItem, RiskCategory } from '../../types';

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  operational: 'Operational',
  financial: 'Financial',
  market: 'Market',
  legal_compliance: 'Legal & Compliance',
  technology: 'Technology',
  reputational: 'Reputational',
};

const severityBadge: Record<string, string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

interface Props { data: Risks; }

export default function RiskAccordion({ data }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['financial', 'market']));

  const grouped = data.risk_items?.reduce<Record<string, RiskItem[]>>((acc, item) => {
    const cat = item.category ?? 'operational';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {}) ?? {};

  const toggle = (cat: string) =>
    setOpenCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const overallBadge =
    data.overall_risk_rating === 'low' ? 'badge-low' :
    data.overall_risk_rating === 'medium' ? 'badge-medium' :
    'badge-high';

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-600" /> Risk Analysis
        </h2>
        <span className={clsx('badge text-sm font-semibold', overallBadge)}>
          Overall: {data.overall_risk_rating?.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([category, items]) => {
          const isOpen = openCategories.has(category);
          const maxImpact = items.reduce((max, r) =>
            r.impact === 'high' ? 'high' : r.impact === 'medium' && max !== 'high' ? 'medium' : max, 'low' as string);

          return (
            <div key={category} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                onClick={() => toggle(category)}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900 text-sm">
                    {CATEGORY_LABELS[category as RiskCategory] ?? category}
                  </span>
                  <span className={clsx('badge', severityBadge[maxImpact])}>
                    {items.length} risk{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronDown className={clsx('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {items.map((risk, i) => (
                    <div key={i} className="px-4 py-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-slate-800">{risk.risk}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={clsx('badge', severityBadge[risk.likelihood])}>L: {risk.likelihood}</span>
                          <span className={clsx('badge', severityBadge[risk.impact])}>I: {risk.impact}</span>
                        </div>
                      </div>
                      {risk.mitigation && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
