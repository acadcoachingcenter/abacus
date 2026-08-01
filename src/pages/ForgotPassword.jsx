import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';
import AuthLayout, { FormError, FormNotice, inputClass, primaryButtonClass } from '../components/common/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const data = await api.forgotPassword(email);
      setNotice(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="text-teal font-semibold hover:text-teal-dark">
          Back to log in
        </Link>
      }
    >
      <FormError message={error} />
      <FormNotice message={notice} />
      {!notice && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
