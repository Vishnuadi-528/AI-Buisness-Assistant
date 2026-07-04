import { Users } from 'lucide-react';
import clsx from 'clsx';
import type { EmployeeRequirement, EmployeeRole } from '../../types';

const priorityBadge = {
  immediate: 'bg-red-100 text-red-700',
  '3-months': 'bg-yellow-100 text-yellow-700',
  '6-months': 'bg-green-100 text-green-700',
};

interface Props { data: EmployeeRequirement; }

export default function EmployeeTable({ data }: Props) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600" /> Employee Requirements
        </h2>
        <span className="badge bg-brand-50 text-brand-700 text-sm font-semibold">
          {data.total_headcount_estimate} people · {data.phase}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Count</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Est. Salary Range</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.roles?.map((role: EmployeeRole, i: number) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{role.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{role.responsibilities}</p>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-slate-900">{role.count}</td>
                <td className="px-4 py-3 text-slate-600">{role.estimated_salary_range}</td>
                <td className="px-4 py-3">
                  <span className={clsx('badge', priorityBadge[role.hire_priority] ?? 'bg-slate-100 text-slate-600')}>
                    {role.hire_priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.org_structure_note && (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">{data.org_structure_note}</p>
      )}
      {data.outsource_vs_hire_recommendation && (
        <p className="text-sm text-slate-600"><strong>Outsource vs Hire:</strong> {data.outsource_vs_hire_recommendation}</p>
      )}
    </div>
  );
}
