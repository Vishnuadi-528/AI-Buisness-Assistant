import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { User, Lock, Trash2, Loader2, CheckCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useBusinessList, useDeleteBusiness } from '../../hooks/useBusiness';
import { useLogout } from '../../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { Business } from '../../types';

// ── Schemas ───────────────────────────────────────────────

const profileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Component ─────────────────────────────────────────────

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const logout = useLogout();
  const { data: businesses } = useBusinessList();
  const deleteBiz = useDeleteBusiness();
  const [profileSaved, setProfileSaved] = useState(false);

  // Profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => api.put('/user/profile', data).then(r => r.data),
    onSuccess: (res) => {
      updateUser(res.data);
      setProfileSaved(true);
      toast.success('Profile updated.');
      setTimeout(() => setProfileSaved(false), 3000);
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  // Password mutation
  const updatePassword = useMutation({
    mutationFn: (data: PasswordForm) =>
      api.put('/user/password', { currentPassword: data.currentPassword, newPassword: data.newPassword }).then(r => r.data),
    onSuccess: () => { toast.success('Password updated.'); passwordForm.reset(); },
    onError: () => toast.error('Failed to update password. Check your current password.'),
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and saved businesses.</p>
      </div>

      {/* ── Profile ──────────────────────────────────────── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" /> Profile
        </h2>
        <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...profileForm.register('name')} className="input" />
            {profileForm.formState.errors.name && (
              <p className="error-msg">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Email Address</label>
            <input {...profileForm.register('email')} type="email" className="input" />
            {profileForm.formState.errors.email && (
              <p className="error-msg">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
            {updateProfile.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : profileSaved
                ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                : 'Save Changes'
            }
          </button>
        </form>
      </section>

      {/* ── Password ──────────────────────────────────────── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" /> Change Password
        </h2>
        <form onSubmit={passwordForm.handleSubmit(d => updatePassword.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input {...passwordForm.register('currentPassword')} type="password" className="input" autoComplete="current-password" />
            {passwordForm.formState.errors.currentPassword && (
              <p className="error-msg">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">New Password</label>
            <input {...passwordForm.register('newPassword')} type="password" className="input" autoComplete="new-password" />
            {passwordForm.formState.errors.newPassword && (
              <p className="error-msg">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input {...passwordForm.register('confirmPassword')} type="password" className="input" autoComplete="new-password" />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="error-msg">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" disabled={updatePassword.isPending} className="btn-primary">
            {updatePassword.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
              : 'Update Password'
            }
          </button>
        </form>
      </section>

      {/* ── Manage Businesses ────────────────────────────── */}
      <section className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-600" /> Saved Businesses
        </h2>
        {!businesses?.length && (
          <p className="text-sm text-slate-400">No businesses saved yet.</p>
        )}
        <div className="space-y-2">
          {businesses?.map((b: Business) => (
            <div key={b._id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">{b.businessName}</p>
                <p className="text-xs text-slate-400">{b.industry ?? 'No industry'} · {b.stage}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete "${b.businessName}"? This will also delete all its reports.`)) {
                    deleteBiz.mutate(b._id);
                  }
                }}
                disabled={deleteBiz.isPending}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Danger Zone ──────────────────────────────────── */}
      <section className="card p-6 border-red-100 space-y-3">
        <h2 className="text-base font-semibold text-red-700">Sign Out</h2>
        <p className="text-sm text-slate-500">Sign out of your account on this device.</p>
        <button onClick={logout} className="btn-danger">Sign Out</button>
      </section>
    </div>
  );
}
