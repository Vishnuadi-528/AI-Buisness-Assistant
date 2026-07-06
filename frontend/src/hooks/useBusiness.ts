import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { businessApi } from '../lib/api';
import type { CreateBusinessRequest, GenerateReportRequest, ClarifyingQuestion } from '../types';

export const BUSINESS_KEYS = {
  all: ['businesses'] as const,
  detail: (id: string) => ['businesses', id] as const,
  reports: (id: string) => ['businesses', id, 'reports'] as const,
};

export function useBusinessList() {
  return useQuery({
    queryKey: BUSINESS_KEYS.all,
    queryFn: businessApi.list,
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: BUSINESS_KEYS.detail(id),
    queryFn: () => businessApi.get(id),
    enabled: !!id,
  });
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusinessRequest) => businessApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BUSINESS_KEYS.all }); },
  });
}

export function useUpdateBusiness(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateBusinessRequest>) => businessApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.all });
      toast.success('Business updated.');
    },
  });
}

export function useDeleteBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.all });
      toast.success('Business deleted.');
    },
  });
}

export function useGenerateReport(businessId: string) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      businessApi.generateReport(businessId, data),
    onSuccess: (res) => {
      const d = res.data as { reportType: string; clarifyingQuestions?: ClarifyingQuestion[]; _id?: string };
      if (d.reportType === 'clarification_needed') return; // caller handles this
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.reports(businessId) });
      toast.success('Report generated!');
      if (d._id) navigate(`/reports/${d._id}`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to generate report.';
      toast.error(msg);
    },
  });
}

export function useClarify(businessId: string) {
  return useMutation({
    mutationFn: (answers: Record<string, string>) =>
      businessApi.clarify(businessId, answers),
  });
}

export function useBusinessReports(businessId: string) {
  return useQuery({
    queryKey: BUSINESS_KEYS.reports(businessId),
    queryFn: () => businessApi.listReports(businessId),
    enabled: !!businessId,
  });
}
