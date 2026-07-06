import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateBusiness } from '../../hooks/useBusiness';
import { businessApi } from '../../lib/api';
import ClarificationWizard from './ClarificationWizard';
import type { ClarifyingQuestion } from '../../types';

const INDUSTRIES = [
  'Not sure',
  'Food & Beverage',
  'Retail & E-commerce',
  'Technology & Software',
  'Healthcare & Wellness',
  'Education & EdTech',
  'Finance & FinTech',
  'Manufacturing',
  'Real Estate & Construction',
  'Agriculture & Farming',
  'Media & Entertainment',
  'Logistics & Supply Chain',
  'Consulting & Services',
  'Fashion & Apparel',
  'Travel & Hospitality',
  'Automotive',
  'Other',
];

const PROGRESS_MESSAGES = [
  'Analysing business model…',
  'Checking investment requirements…',
  'Evaluating market conditions…',
  'Assessing employee needs…',
  'Researching government schemes…',
  'Evaluating bank loan options…',
  'Identifying risks…',
  'Building action plan…',
  'Finalising report…',
];

const schema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  investmentAmount: z.coerce.number().positive('Must be a positive number').optional().or(z.literal('')),
  industry: z.string().optional(),
  country: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  stage: z.enum(['idea', 'early', 'growth']),
  teamSize: z.string().optional(),
  timeline: z.string().optional(),
  additionalContext: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewBusinessForm() {
  const navigate = useNavigate();
  const createBusiness = useCreateBusiness();

  // Local state — businessId is set after creation so we can pass it to ClarificationWizard
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyingQuestion[] | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  // Cycle progress messages while generating
  useEffect(() => {
    if (!isGenerating) return;
    const t = setInterval(() => {
      setProgressIdx(i => (i + 1) % PROGRESS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(t);
  }, [isGenerating]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { stage: 'idea' },
  });

  // Helper — calls the API directly with a known ID (avoids stale-closure problem)
  const runGenerate = async (bizId: string, data: FormData) => {
    setIsGenerating(true);
    try {
      const res = await businessApi.generateReport(bizId, {
        teamSize: data.teamSize || undefined,
        timeline: data.timeline || undefined,
        additionalContext: data.additionalContext || undefined,
      });

      const d = res.data as { reportType: string; clarifyingQuestions?: ClarifyingQuestion[]; _id?: string };

      if (d.reportType === 'clarification_needed' && d.clarifyingQuestions) {
        setClarifyQuestions(d.clarifyingQuestions);
        return;
      }

      if (d._id) {
        toast.success('Report generated!');
        navigate(`/reports/${d._id}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to generate report.';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setPendingFormData(data);
    setProgressIdx(0);

    try {
      // Step 1 — create the business entry
      const biz = await createBusiness.mutateAsync({
        businessName: data.businessName,
        industry: data.industry === 'Not sure' ? undefined : data.industry,
        investmentAmount: data.investmentAmount ? Number(data.investmentAmount) : undefined,
        country: data.country || undefined,
        location: data.location || undefined,
        stage: data.stage,
      });

      setBusinessId(biz._id);

      // Step 2 — generate report using biz._id directly (not state)
      await runGenerate(biz._id, data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong.';
      toast.error(msg);
    }
  };

  // Called after the clarification wizard collects answers
  const onClarifyDone = async () => {
    if (!businessId || !pendingFormData) return;
    setClarifyQuestions(null);
    await runGenerate(businessId, pendingFormData);
  };

  if (clarifyQuestions && businessId) {
    return (
      <ClarificationWizard
        businessId={businessId}
        questions={clarifyQuestions}
        onComplete={onClarifyDone}
      />
    );
  }

  const isBusy = createBusiness.isPending || isGenerating;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Business Report</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Enter your idea — the AI generates a complete master report.
          </p>
        </div>
      </div>

      {/* Generating overlay */}
      {isGenerating && (
        <div className="card p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-brand-600 animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Generating Your Report</h2>
          <p className="text-brand-600 font-medium text-sm animate-pulse">
            {PROGRESS_MESSAGES[progressIdx]}
          </p>
          <p className="text-xs text-slate-400">This can take 20–60 seconds. Please wait.</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{
                width: `${((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100}%`,
                transition: 'width 2.5s ease',
              }}
            />
          </div>
        </div>
      )}

      {!isGenerating && (
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">

          {/* Business Name */}
          <div>
            <label className="label">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('businessName')}
              className="input"
              placeholder="e.g. Green Leaf Cafe, AI-powered HR tool…"
            />
            {errors.businessName && <p className="error-msg">{errors.businessName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Investment */}
            <div>
              <label className="label">Investment Amount (₹ / $)</label>
              <input
                {...register('investmentAmount')}
                type="number"
                className="input"
                placeholder="e.g. 500000"
                min={0}
              />
              {errors.investmentAmount && <p className="error-msg">{errors.investmentAmount.message}</p>}
            </div>

            {/* Industry */}
            <div>
              <label className="label">Industry</label>
              <select {...register('industry')} className="input">
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="label">Country</label>
              <input {...register('country')} className="input" placeholder="e.g. India, USA" />
            </div>

            {/* Location */}
            <div>
              <label className="label">City / Region</label>
              <input {...register('location')} className="input" placeholder="e.g. Bangalore, Mumbai" />
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="label">Business Stage</label>
            <div className="flex gap-3">
              {(['idea', 'early', 'growth'] as const).map(s => (
                <label key={s} className="flex-1">
                  <input {...register('stage')} type="radio" value={s} className="sr-only peer" />
                  <div className="cursor-pointer rounded-lg border-2 border-slate-200 p-3 text-center text-sm font-medium text-slate-600 transition-all peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700 hover:border-slate-300">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optional extras */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-brand-600 select-none list-none flex items-center gap-1 hover:text-brand-700">
              <span className="group-open:rotate-90 transition-transform inline-block">›</span>
              Additional context (optional)
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Team Size</label>
                <input
                  {...register('teamSize')}
                  className="input"
                  placeholder="e.g. 2 co-founders, no employees yet"
                />
              </div>
              <div>
                <label className="label">Timeline</label>
                <input
                  {...register('timeline')}
                  className="input"
                  placeholder="e.g. Launch in 6 months"
                />
              </div>
              <div>
                <label className="label">Additional Context</label>
                <textarea
                  {...register('additionalContext')}
                  className="input resize-none h-24"
                  placeholder="Any specific goals, constraints, or market insights…"
                />
              </div>
            </div>
          </details>

          <button type="submit" disabled={isBusy} className="btn-primary w-full py-3 text-base">
            {isBusy
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Working…</>
              : <><Sparkles className="w-5 h-5" /> Generate Master Report</>
            }
          </button>
        </form>
      )}
    </div>
  );
}
