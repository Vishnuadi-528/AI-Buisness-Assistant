import { useState, useRef, useEffect } from 'react';
import { Download, FileText, ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { useExportReport, useRegenerateReport } from '../../hooks/useReport';

interface Props {
  reportId: string;
  businessId: string;
}

export default function ExportMenu({ reportId, businessId }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const exportMutation = useExportReport();
  const regenerate = useRegenerateReport(reportId, businessId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center gap-2 no-print">
      {/* Regenerate */}
      <button
        onClick={() => regenerate.mutate({})}
        disabled={regenerate.isPending}
        className="btn-secondary"
      >
        {regenerate.isPending
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <RefreshCw className="w-4 h-4" />}
        Regenerate
      </button>

      {/* Export dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          disabled={exportMutation.isPending}
          className="btn-primary"
        >
          {exportMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />}
          Export
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 card py-1 z-10 shadow-lg">
            <button
              onClick={() => { exportMutation.mutate({ reportId, format: 'pdf' }); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <FileText className="w-4 h-4 text-red-500" /> Download PDF
            </button>
            <button
              onClick={() => { exportMutation.mutate({ reportId, format: 'docx' }); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <FileText className="w-4 h-4 text-brand-500" /> Download DOCX
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
