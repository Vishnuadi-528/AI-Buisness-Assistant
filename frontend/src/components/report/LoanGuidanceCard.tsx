import { Banknote, AlertTriangle, CheckCircle } from 'lucide-react';
import type { BankLoanGuidance, LoanType } from '../../types';

interface Props { data: BankLoanGuidance; }

export default function LoanGuidanceCard({ data }: Props) {
  if (!data?.suitable_loan_types?.length) return null;

  return (
    <div className="card p-6 space-y-5">
      <h2 className="section-title flex items-center gap-2">
        <Banknote className="w-5 h-5 text-brand-600" /> Bank Loan Guidance
      </h2>

      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{data.disclaimer}</p>
      </div>

      <div className="space-y-4">
        {data.suitable_loan_types.map((loan: LoanType, i: number) => (
          <div key={i} className="rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-slate-900">{loan.type}</h3>
            <p className="text-sm text-slate-500">{loan.typical_use_case}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Eligibility Factors</p>
                <ul className="space-y-1">
                  {loan.general_eligibility_factors?.map((f: string, j: number) => (
                    <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Documents Typically Needed</p>
                <ul className="space-y-1">
                  {loan.documents_typically_required?.map((d: string, j: number) => (
                    <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-brand-400 shrink-0">›</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {loan.suggested_institutions && (
              <p className="text-xs text-slate-400 italic">Institutions: {loan.suggested_institutions}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {data.collateral_note && (
          <p className="bg-slate-50 rounded-lg p-3 text-slate-500"><strong>Collateral:</strong> {data.collateral_note}</p>
        )}
        {data.credit_score_note && (
          <p className="bg-slate-50 rounded-lg p-3 text-slate-500"><strong>Credit Score:</strong> {data.credit_score_note}</p>
        )}
      </div>
    </div>
  );
}
