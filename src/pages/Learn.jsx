import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVELS, lessonsByLevel, UPCOMING_TOPICS } from '../data/curriculum';

export default function Learn() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <Link to="/" className="text-sm text-rosewood/50 hover:text-rosewood font-body">← Home</Link>
        <h1 className="font-display text-3xl font-bold text-rosewood mt-2 mb-1">Curriculum</h1>
        <p className="text-rosewood/60 font-body mb-8">
          Every lesson follows Learn → Watch → Practice → Test.
        </p>

        <div className="space-y-10">
          {LEVELS.map((level) => (
            <section key={level.id} id={level.id}>
              <h2 className="font-display font-bold text-xl text-teal-dark mb-4">{level.name}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessonsByLevel(level.id).map((lesson, i) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/learn/${lesson.id}`}
                      className="block bg-white rounded-2xl p-5 border border-sandalwood/25 shadow-sm hover:border-saffron/60 hover:shadow-md transition-all h-full"
                    >
                      <h3 className="font-display font-bold text-rosewood mb-1">{lesson.title}</h3>
                      <p className="text-sm text-rosewood/60 font-body line-clamp-2">{lesson.learn}</p>
                      <span className="inline-block mt-3 text-xs font-bold text-teal font-display">
                        Start lesson →
                      </span>
                    </Link>
                  </motion.div>
                ))}
                {(UPCOMING_TOPICS[level.id] || []).map((topic) => (
                  <div
                    key={topic}
                    className="rounded-2xl p-5 border border-dashed border-sandalwood/40 text-rosewood/40 font-body text-sm flex items-center"
                  >
                    {topic} — coming soon
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
