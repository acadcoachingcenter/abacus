import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SorobanAbacus from '../components/abacus/SorobanAbacus';
import branding from '../data/branding';

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl border border-sandalwood/25 p-4 sm:p-5">
      <div className="text-xs uppercase tracking-wide font-display font-bold text-rosewood/40 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono text-teal-dark">{value}</div>
      {hint && <div className="text-xs text-rosewood/40 font-body mt-1">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const formatMinutes = (seconds) => {
    const mins = Math.round((seconds || 0) / 60);
    return mins > 0 ? `${mins} min` : '0 min';
  };

  return (
    <div className="min-h-screen bg-ivory">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-ivory font-display font-bold">
            A
          </div>
          <span className="font-display font-bold text-rosewood text-lg">{branding.productName}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-sm font-semibold font-display text-rosewood/60 hover:text-rosewood"
        >
          Log out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-rosewood mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-rosewood/60 font-body mb-8">
          {user?.current_level ? `Currently on the ${user.current_level} track.` : 'Ready to practice?'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <StatCard label="Current level" value={user?.current_level || 'beginner'} />
          <StatCard label="Current streak" value={`${user?.streak_days ?? 0} days`} />
          <StatCard label="Best score" value={user?.best_score ?? 0} />
          <StatCard label="Practice time" value={formatMinutes(user?.total_practice_seconds)} />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-rosewood">Continue practicing</h2>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-3xl border border-sandalwood/30 p-4 sm:p-6 shadow-sm mb-10">
          <SorobanAbacus rodCount={6} size="md" label="Your abacus" />
        </div>

        <div className="rounded-2xl border border-dashed border-sandalwood/40 p-6 text-center">
          <p className="text-rosewood/60 font-body text-sm">
            Structured lessons, practice tracking, and achievements land in the next build phase.
            Your stats above will start filling in automatically once that's wired up.
          </p>
        </div>
      </main>
    </div>
  );
}
