'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertOctagon } from 'lucide-react';
import { apiFetch, apiUrl } from '@/lib/api';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errParam = searchParams.get('error') || searchParams.get('auth_error');
    const emailParam = searchParams.get('email');

    if (errParam === 'unauthorized_admin') {
      setError(
        emailParam
          ? `Access Denied: The Google account "${emailParam}" is not an authorized administrator. Only explicitly approved atelier administrators may access this portal.`
          : 'Access Denied: This Google account is not an authorized administrator.'
      );
    } else if (errParam) {
      setError(`Authentication failed: ${decodeURIComponent(errParam)}`);
    }
  }, [searchParams]);

  const handleGoogleAdminLogin = () => {
    setIsLoading(true);
    window.location.href = apiUrl('/api/auth/google?admin=true&redirect=/admin');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data?.success && data?.token) {
        localStorage.setItem('zimor_admin_token', data.token);
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error(data?.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your administrator credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191715] text-[#E8E1DA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#24211F] border border-[#36312C] rounded-lg p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#B44220]/15 border border-[#B44220]/35 flex items-center justify-center mx-auto text-[#E07A5F]">
            <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h1 className="font-primary text-2xl font-bold tracking-widest text-[#E8E1DA]">ZIMOR</h1>
          <p className="text-xs uppercase tracking-wider text-[#B4B4B4]">Atelier Control Portal</p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#B9382C]/15 border border-[#B9382C]/35 text-[#F28B82] text-xs rounded flex items-start gap-2.5 leading-relaxed">
            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-[#F28B82]" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Method: Google Sign-In for Administrators */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#FFFFFF] hover:bg-[#F2ECE4] text-[#191715] font-semibold text-xs rounded flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google (Admin)</span>
          </button>
          <p className="text-[10px] text-center text-[#8A837C]">
            Strict access control: only pre-approved atelier administrative Google accounts are granted entry.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#36312C] w-full" />
          <span className="bg-[#24211F] px-3 text-[10px] uppercase font-mono tracking-widest text-[#8A837C] absolute">
            Or Password Authentication
          </span>
        </div>

        {/* Alternative: Standard Admin Credentials */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#B4B4B4] mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A837C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-[#1E1C1A] border border-[#36312C] rounded text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#B44220] transition-colors"
                placeholder="admin@zimor.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B4B4B4] mb-1.5">Master Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A837C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-[#1E1C1A] border border-[#36312C] rounded text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#B44220] transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] font-semibold text-xs rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access with Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#191715] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#B44220] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
