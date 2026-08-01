import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { FormError, inputClass, primaryButtonClass } from '../components/common/AuthLayout';

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', grade: '', level: 'beginner' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your abacus journey with ACAD."
      footer={
        <span className="text-rosewood/60">
          Already have an account?{' '}
          <Link to="/login" className="text-teal font-semibold hover:text-teal-dark">
            Log in
          </Link>
        </span>
      }
    >
      <FormError message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Name</label>
          <input required value={form.name} onChange={update('name')} className={inputClass} autoComplete="name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className={inputClass}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={update('password')}
            className={inputClass}
            autoComplete="new-password"
          />
          <p className="text-xs text-rosewood/40 mt-1 font-body">At least 8 characters.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Age</label>
            <input
              type="number"
              min="3"
              max="99"
              value={form.age}
              onChange={update('age')}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Class / Grade</label>
            <input value={form.grade} onChange={update('grade')} className={inputClass} placeholder="e.g. Grade 4" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">Starting level</label>
          <select value={form.level} onChange={update('level')} className={inputClass}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
