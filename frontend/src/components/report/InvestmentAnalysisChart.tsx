import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';
import type { InvestmentAnalysis, CapitalAllocationItem } from '../../types';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

interface Props { data: InvestmentAnalysis; }

export default function InvestmentAnalysisChart({ data }: Props) {
  const chartData = data.capital_allocation_breakdown?.map((item: CapitalAllocationItem) => ({
    name: item.category,
    value: item.percentage,
    notes: item.notes,
  })) ?? [];

  const verdictConfig = {
    sufficient: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Sufficient' },
    borderline:  { icon: Minus,     color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200',  label: 'Borderline' },
    insufficient:{ icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50',     border: 'border-red-200',     label: 'Insufficient' },
  };
  const v = verdictConfig[data.sufficiency_verdict] ?? verdictConfig.borderline;
  const VIcon = v.icon;

  return (
    <div className="card p-6 space-y-6">
      <h2 className="section-title flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-brand-600" /> Investment Analysis
      </h2>

      {/* Verdict banner */}
      <div className={clsx('rounded-lg border p-4 flex items-start gap-3', v.bg, v.border)}>
        <VIcon className={clsx('w-5 h-5 mt-0.5 shrink-0', v.color)} />
        <div>
          <p className={clsx('font-semibold', v.color)}>Investment: {v.label}</p>
          <p className="text-sm text-slate-600 mt-1">{data.shortfall_or_surplus}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {[
              { label: 'Amount Provided',    value: data.provided_amount ?? 'Not specified' },
              { label: 'Minimum Required',   value: data.estimated_minimum_required },
              { label: 'Ideal Budget',        value: data.estimated_ideal_budget },
              { label: 'Burn Rate Estimate',  value: data.burn_rate_estimate },
              { label: 'Runway Estimate',     value: data.runway_estimate },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="py-2.5 pr-4 font-medium text-slate-600 w-48">{label}</td>
                <td className="py-2.5 text-slate-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Donut chart */}
      {chartData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Capital Allocation Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={2} dataKey="value">
                  {chartData.map((_: unknown, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Notes */}
          <div className="mt-3 space-y-1.5">
            {chartData.map((item: { name: string; value: number; notes: string }, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span><strong>{item.name}</strong> ({item.value}%) — {item.notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 italic">{data.disclaimer}</p>
    </div>
  );
}
