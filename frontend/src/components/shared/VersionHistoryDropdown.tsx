import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { useBusinessReports } from '../../hooks/useBusiness';
import type { ReportSummary } from '../../types';

interface Props {
  businessId: string;
  currentReportId: string;
}

export default function VersionHistoryDropdown({ businessId, currentReportId }: Props) {
  const { data: reports } = useBusinessReports(businessId);
  const navigate = useNavigate();

  if (!reports || reports.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 no-print">
      <History className="w-4 h-4 text-slate-400" />
      <select
        className="input py-1.5 text-sm w-auto"
        value={currentReportId}
        onChange={e => navigate(`/reports/${e.target.value}`)}
        aria-label="Report version history"
      >
        {reports.map((r: ReportSummary) => (
          <option key={r._id} value={r._id}>
            Version {r.version} — {new Date(r.createdAt).toLocaleDateString()}
          </option>
        ))}
      </select>
    </div>
  );
}
