import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportApi } from '../lib/api';
import { BUSINESS_KEYS } from './useBusiness';
import type { GenerateReportRequest } from '../types';

export const REPORT_KEYS = {
  detail: (id: string) => ['reports', id] as const,
};

export function useReport(reportId: string) {
  return useQuery({
    queryKey: REPORT_KEYS.detail(reportId),
    queryFn: () => reportApi.get(reportId),
    enabled: !!reportId,
  });
}

export function useRegenerateReport(reportId: string, businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateReportRequest) => reportApi.regenerate(reportId, data),
    onSuccess: (res) => {
      const newReport = res.data as { _id: string };
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.reports(businessId) });
      if (newReport?._id) {
        qc.invalidateQueries({ queryKey: REPORT_KEYS.detail(newReport._id) });
      }
      toast.success('Report regenerated!');
    },
    onError: () => toast.error('Regeneration failed.'),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: 'pdf' | 'docx' }) =>
      reportApi.export(reportId, format),
    onSuccess: (_, { format }) => toast.success(`${format.toUpperCase()} download started.`),
    onError: () => toast.error('Export failed.'),
  });
}
