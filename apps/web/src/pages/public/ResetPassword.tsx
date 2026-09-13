import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, parseApiError } from '../../services/api';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];
    if (!email.trim()) validationErrors.push('Email is required');
    if (!code.trim()) validationErrors.push('Reset code is required');
    if (password.length < 6) {
      validationErrors.push('Password must be at least 6 characters long');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        code,
        password,
      });

      if (response.data.success) {
        const message = response.data.data?.message || response.data.message;
        setSuccessMessage(message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrors(parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Set New Password</h2>
          <p className="text-xs text-slate-500">
            Enter your reset code and choose a new password.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            {errors.map((err, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage} Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono tracking-widest text-center"
              placeholder="890294"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Return to{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;