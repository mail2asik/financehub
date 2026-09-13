import React, { useState, useEffect, FormEvent } from 'react';
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api, parseApiError } from '../../services/api';
import type { UserProfile, UpdateProfilePayload } from '../../types/profile';

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch user profile on component mount
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const data: UserProfile = response.data.data;
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
      }
    } catch (err) {
      const errors = parseApiError(err);
      setError(errors.join(', '));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  // 2. Form submit handler with validation
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Front-end validation
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!lastName.trim()) {
      setError('Last name is required.');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Construct request payload
    const payload: UpdateProfilePayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    // Include password only if specified
    if (password.trim().length > 0) {
      payload.password = password;
    }

    setSubmitting(true);

    try {
      const response = await api.patch('/auth/update-profile', payload);
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setPassword(''); // Clear password field after successful update
        
        // Update local profile state
        if (response.data.data) {
          setProfile((prev) => prev ? {
            ...prev,
            firstName: response.data.data.firstName,
            lastName: response.data.data.lastName
          } : null);
        }
      }
    } catch (err) {
      const errors = parseApiError(err);
      setError(errors.join(', '));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        {/* <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1> */}
        <p className="text-sm text-slate-500">Manage your account credentials and personal details.</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Read-Only Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <label className="block text-left text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profile?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-left text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Role
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-indigo-600">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-left text-sm font-medium text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="First name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Update Field */}
          <div>
            <label className="block text-left text-sm font-medium text-slate-700 mb-1">
              New Password <span className="text-xs text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter new password (min. 6 characters)"
                minLength={6}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;