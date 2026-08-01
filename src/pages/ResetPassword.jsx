import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/apiClient';
import AuthLayout, { FormError, FormNotice, inputClass, primaryButtonClass } from '../components/common/AuthLayout';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This password reset link is missing its token.">
        <Link to="/forgot-password" className="text-teal font-semibold hover:text-teal-dark">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.resetPassword(token, password);
      setNotice(data.message);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a new password for your account.">
      <FormError message={error} />
      <FormNotice message={notice} />
      {!notice && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Confirm password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
