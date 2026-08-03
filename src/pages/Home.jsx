import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SorobanAbacus from '../components/abacus/SorobanAbacus';
import AbacusDemoPanel from '../components/abacus/AbacusDemoPanel';
import branding from '../data/branding';

const roadmap = [
  { level: 'Beginner', items: ['Parts of the abacus', 'Bead values', 'Numbers 0–999', 'Simple addition & subtraction'] },
  { level: 'Intermediate', items: ['Complement of 5 & 10', 'Carrying & borrowing', 'Multiplication', 'Division'] },
  { level: 'Advanced', items: ['Speed calculation', 'Mental visualization', 'Flash Anzan', 'Timed challenges'] },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-14 grid lg:grid-cols-[1.1fr,1fr] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-teal/10 text-teal-dark text-xs font-bold tracking-wide uppercase font-display mb-4">
            {branding.parentBrand} Abacus
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-extrabold text-rosewood">
            Learn Abacus.
            <br />
            Calculate Faster.
            <br />
            <span className="text-teal">Think Smarter.</span>
          </h1>
          <p className="mt-5 text-lg text-rosewood/70 font-body max-w-md">
            A real, tactile soroban your child can touch on a tablet or click
            with a mouse — structured lessons from first bead to mental Anzan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#try-it"
              className="px-6 py-3.5 rounded-2xl bg-saffron text-rosewood-dark font-bold font-display shadow-lg shadow-saffron/30 hover:bg-saffron-dark transition-colors"
            >
              Start Learning
            </a>
            <Link
              to="/learn"
              className="px-6 py-3.5 rounded-2xl bg-transparent text-rosewood font-bold font-display border-2 border-rosewood/15 hover:border-rosewood/30 transition-colors"
            >
              See the curriculum
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SorobanAbacus rodCount={7} size="lg" label="Try moving the beads" />
        </motion.div>
      </section>

      {/* TRY IT */}
      <section id="try-it" className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-rosewood">
            Practice right now
          </h2>
          <p className="text-rosewood/60 font-body mt-2">
            Type a number, then move the beads to match it.
          </p>
        </div>
        <AbacusDemoPanel rodCount={4} />
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="bg-rosewood/[0.03] py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-rosewood text-center mb-10">
            A complete path, beginner to advanced
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {roadmap.map((stage) => (
              <Link
                to={`/learn#${stage.level.toLowerCase()}`}
                key={stage.level}
                className="bg-white rounded-3xl p-6 border border-sandalwood/25 shadow-sm hover:border-saffron/60 hover:shadow-md transition-all block"
              >
                <h3 className="font-display font-bold text-lg text-teal-dark mb-3">
                  {stage.level}
                </h3>
                <ul className="space-y-2">
                  {stage.items.map((item) => (
                    <li key={item} className="text-rosewood/70 font-body text-sm flex gap-2">
                      <span className="text-saffron-dark">●</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="inline-block mt-4 text-xs font-bold text-teal font-display">
                  Start {stage.level.toLowerCase()} lessons →
                </span>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link to="/flash" className="px-5 py-2.5 rounded-xl bg-white border border-sandalwood/30 text-rosewood font-semibold font-display text-sm hover:border-saffron/60">
              ⚡ Flash Anzan
            </Link>
            <Link to="/challenge" className="px-5 py-2.5 rounded-xl bg-white border border-sandalwood/30 text-rosewood font-semibold font-display text-sm hover:border-saffron/60">
              ⏱ Speed Challenge
            </Link>
            <Link to="/practice" className="px-5 py-2.5 rounded-xl bg-white border border-sandalwood/30 text-rosewood font-semibold font-display text-sm hover:border-saffron/60">
              🧮 Free Practice
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-ivory font-display font-bold">
          A
        </div>
        <span className="font-display font-bold text-rosewood text-lg">{branding.productName}</span>
      </div>
      <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold font-body text-rosewood/70">
        <Link to="/learn" className="hover:text-rosewood">Curriculum</Link>
        <Link to="/practice" className="hover:text-rosewood">Practice</Link>
        <Link to="/flash" className="hover:text-rosewood">Flash Anzan</Link>
        <Link to="/challenge" className="hover:text-rosewood">Challenge</Link>
        <Link to="/login" className="hover:text-rosewood">Log in</Link>
      </nav>
      <Link
        to="/register"
        className="px-4 py-2 rounded-xl bg-rosewood text-ivory text-sm font-bold font-display hover:bg-rosewood-light transition-colors"
      >
        Get started
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-rosewood/50 font-body">
      {branding.footerLine}
    </footer>
  );
}
