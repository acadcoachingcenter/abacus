import { Link } from 'react-router-dom';
import branding from '../../data/branding';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="px-5 sm:px-8 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-ivory font-display font-bold">
            A
          </div>
          <span className="font-display font-bold text-rosewood text-lg">{branding.productName}</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-sandalwood/25 shadow-sm p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-rosewood mb-1">{title}</h1>
          {subtitle && <p className="text-rosewood/60 font-body text-sm mb-6">{subtitle}</p>}
          {children}
          {footer && <div className="mt-6 text-center text-sm font-body">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-body border border-red-100">
      {message}
    </div>
  );
}

export function FormNotice({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-4 py-2.5 rounded-xl bg-teal/10 text-teal-dark text-sm font-body border border-teal/20">
      {message}
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-sandalwood/50 px-4 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-saffron';

export const primaryButtonClass =
  'w-full py-3 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
