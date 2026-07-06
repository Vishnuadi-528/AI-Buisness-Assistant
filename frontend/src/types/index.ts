// ─── Auth ────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Business ────────────────────────────────────────────

export type BusinessStage = 'idea' | 'early' | 'growth';

export interface Business {
  _id: string;
  userId: string;
  businessName: string;
  industry: string | null;
  investmentAmount: number | null;
  country: string | null;
  location: string | null;
  stage: BusinessStage;
  reportCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessRequest {
  businessName: string;
  industry?: string;
  investmentAmount?: number;
  country?: string;
  location?: string;
  stage?: BusinessStage;
}

export interface GenerateReportRequest {
  teamSize?: string;
  timeline?: string;
  additionalContext?: string;
}

// ─── Clarification ───────────────────────────────────────

export interface ClarifyingQuestion {
  field: string;
  question: string;
  why_needed: string;
  example_answer?: string;
}

export interface ClarificationResponse {
  reportType: 'clarification_needed';
  clarifyingQuestions: ClarifyingQuestion[];
}

// ─── Report ──────────────────────────────────────────────

export type ReportType = 'full' | 'clarification_needed';

export interface ReportSummary {
  _id: string;
  version: number;
  generationStatus: string;
  createdAt: string;
  inputSnapshot: Record<string, unknown> | null;
}

export interface CapitalAllocationItem {
  category: string;
  percentage: number;
  notes: string;
}

export interface InvestmentAnalysis {
  provided_amount: string | null;
  sufficiency_verdict: 'sufficient' | 'insufficient' | 'borderline';
  estimated_minimum_required: string;
  estimated_ideal_budget: string;
  shortfall_or_surplus: string;
  capital_allocation_breakdown: CapitalAllocationItem[];
  burn_rate_estimate: string;
  runway_estimate: string;
  disclaimer: string;
}

export interface EmployeeRole {
  title: string;
  count: number;
  responsibilities: string;
  estimated_salary_range: string;
  hire_priority: 'immediate' | '3-months' | '6-months';
}

export interface EmployeeRequirement {
  total_headcount_estimate: number;
  phase: string;
  roles: EmployeeRole[];
  org_structure_note: string;
  outsource_vs_hire_recommendation: string;
}

export interface GovernmentScheme {
  name: string;
  type: string;
  target_beneficiary: string;
  potential_benefit: string;
  how_to_apply: string;
  official_source_hint: string;
}

export interface GovernmentSchemes {
  disclaimer: string;
  schemes: GovernmentScheme[];
}

export interface LoanType {
  type: string;
  typical_use_case: string;
  general_eligibility_factors: string[];
  documents_typically_required: string[];
  suggested_institutions: string;
}

export interface BankLoanGuidance {
  disclaimer: string;
  suitable_loan_types: LoanType[];
  collateral_note: string;
  credit_score_note: string;
}

export type RiskCategory =
  | 'operational'
  | 'financial'
  | 'market'
  | 'legal_compliance'
  | 'technology'
  | 'reputational';

export type Severity = 'low' | 'medium' | 'high';

export interface RiskItem {
  category: RiskCategory;
  risk: string;
  likelihood: Severity;
  impact: Severity;
  mitigation: string;
}

export interface Risks {
  overall_risk_rating: Severity | 'very_high';
  risk_items: RiskItem[];
}

export interface ProsAndCons {
  pros: string[];
  cons: string[];
  overall_viability_score: number;
  viability_justification: string;
}

export interface ActionTask {
  step: number;
  action: string;
  owner: string;
  deadline: string;
  success_metric: string;
}

export interface ActionPhase {
  phase_name: string;
  objective: string;
  tasks: ActionTask[];
}

export interface ActionPlan {
  framework_used: string;
  phases: ActionPhase[];
  key_milestones: string[];
  tools_and_automation: string[];
}

export interface ReportJson {
  report_type: ReportType;
  executive_summary: string;
  investment_analysis: InvestmentAnalysis;
  employee_requirement: EmployeeRequirement;
  government_schemes: GovernmentSchemes;
  bank_loan_guidance: BankLoanGuidance;
  risks: Risks;
  pros_and_cons: ProsAndCons;
  action_plan: ActionPlan;
  next_steps: string[];
  report_markdown: string;
  _warnings?: string;
}

export interface Report {
  _id: string;
  businessId: string | { _id: string; businessName: string; userId: string };
  version: number;
  reportJson: ReportJson;
  reportMarkdown: string;
  generationStatus: string;
  inputSnapshot: Record<string, unknown> | null;
  sections: Array<{ sectionKey: string; content: unknown }>;
  createdAt: string;
}

// ─── API wrapper ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
