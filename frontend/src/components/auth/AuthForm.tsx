import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Brain } from 'lucide-react';
import { useState } from 'react';
import { useLogin, useRegister } from '../../hooks/useAuth';

// ─── Schemas ─────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Component ───────────────────────────────────────────

interface Props { mode: 'login' | 'register'; }

export default function AuthForm({ mode }: Props) {
  const [showPw, setShowPw] = useState(false);
  const login = useLogin();
  const register = useRegister();

  const isLogin = mode === 'login';
  const schema = isLogin ? loginSchema : registerSchema;

  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm & RegisterForm>({ resolver: zodResolver(schema) });

  const onSubmit = (data: LoginForm & RegisterForm) => {
    if (isLogin) {
      login.mutate({ email: data.email, password: data.password });
    } else {
      register.mutate({ name: data.name, email: data.email, password: data.password });
    }
  };

  const isPending = login.isPending || register.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg mb-4">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI Business Assistant</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <input
                  {...reg('name')}
                  type="text"
                  placeholder="Jane Doe"
                  className="input"
                  autoComplete="name"
                />
                {errors.name && <p className="error-msg">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input
                {...reg('email')}
                type="email"
                placeholder="jane@example.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...reg('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-11"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="label">Confirm Password</label>
                <input
                  {...reg('confirmPassword')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="error-msg">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || isSubmitting}
              className="btn-primary w-full py-3 text-base"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {isLogin ? 'Signing in…' : 'Creating account…'}</>
                : isLogin ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          AI-generated reports are for informational purposes only. Not financial/legal advice.
        </p>
      </div>
    </div>
  );
}
