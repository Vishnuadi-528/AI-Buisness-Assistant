import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HelpCircle, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useClarify } from '../../hooks/useBusiness';
import type { ClarifyingQuestion } from '../../types';

interface Props {
  businessId: string;
  questions: ClarifyingQuestion[];
  onComplete: () => void;
}

export default function ClarificationWizard({ businessId, questions, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const clarify = useClarify(businessId);

  const current = questions[step];
  const isLast = step === questions.length - 1;
  const progress = ((step + 1) / questions.length) * 100;

  const { register, handleSubmit, formState: { errors }, reset } =
    useForm<{ answer: string }>();

  const onNext = async ({ answer }: { answer: string }) => {
    const updated = { ...answers, [current.field]: answer };
    setAnswers(updated);
    reset();

    if (isLast) {
      await clarify.mutateAsync(updated);
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="card p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">A few more details</h2>
          <p className="text-slate-500 text-sm mt-1">
            These answers help the AI generate a more accurate report.
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Question {step + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
          <div>
            <label className="label text-base">{current.question}</label>
            {current.why_needed && (
              <p className="text-xs text-slate-400 mb-2 italic">{current.why_needed}</p>
            )}
            <input
              {...register('answer', { required: 'Please provide an answer' })}
              className="input"
              placeholder={current.example_answer ? `e.g. ${current.example_answer}` : 'Your answer…'}
              autoFocus
            />
            {errors.answer && <p className="error-msg">{errors.answer.message}</p>}
          </div>

          {/* Previously answered */}
          {Object.keys(answers).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              {Object.entries(answers).map(([field, value]) => (
                <div key={field} className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="font-medium capitalize">{field}:</span>
                  <span className="truncate">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="btn-secondary flex-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              type="submit"
              disabled={clarify.isPending}
              className="btn-primary flex-1"
            >
              {clarify.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : isLast
                  ? <><CheckCircle className="w-4 h-4" /> Generate Report</>
                  : <>Next <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
