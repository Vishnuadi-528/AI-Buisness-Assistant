import api from './axios';
import type {
  ApiResponse, AuthResponse, Business, Report, ReportSummary,
  LoginRequest, RegisterRequest, CreateBusinessRequest,
  GenerateReportRequest, User,
} from '../types';

// ─── Auth ────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then(r => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then(r => r.data),
};

// ─── Business ────────────────────────────────────────────

export const businessApi = {
  list: () =>
    api.get<ApiResponse<Business[]>>('/business').then(r => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<Business>>(`/business/${id}`).then(r => r.data.data),

  create: (data: CreateBusinessRequest) =>
    api.post<ApiResponse<Business>>('/business', data).then(r => r.data.data),

  update: (id: string, data: Partial<CreateBusinessRequest>) =>
    api.put<ApiResponse<Business>>(`/business/${id}`, data).then(r => r.data.data),

  delete: (id: string) =>
    api.delete(`/business/${id}`).then(r => r.data),

  generateReport: (id: string, data: GenerateReportRequest = {}) =>
    api.post<ApiResponse<Report | { reportType: string; clarifyingQuestions: unknown[] }>>(
      `/business/${id}/generate-report`, data
    ).then(r => r.data),

  clarify: (id: string, answers: Record<string, string>) =>
    api.post(`/business/${id}/clarify`, { answers }).then(r => r.data),

  listReports: (id: string) =>
    api.get<ApiResponse<ReportSummary[]>>(`/business/${id}/reports`).then(r => r.data.data),
};

// ─── Reports ─────────────────────────────────────────────

export const reportApi = {
  get: (reportId: string) =>
    api.get<ApiResponse<Report>>(`/reports/${reportId}`).then(r => r.data.data),

  regenerate: (reportId: string, data: GenerateReportRequest = {}) =>
    api.put<ApiResponse<Report>>(`/reports/${reportId}/regenerate`, data).then(r => r.data),

  export: async (reportId: string, format: 'pdf' | 'docx') => {
    const res = await api.get(`/reports/${reportId}/export?format=${format}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ─── User ────────────────────────────────────────────────

export const userApi = {
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put<ApiResponse<User>>('/user/profile', data).then(r => r.data.data),
};
