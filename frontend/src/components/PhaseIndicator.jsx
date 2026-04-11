import { motion } from 'framer-motion';

const PHASES = [
  { label: 'Data Collection', key: 0 },
  { label: 'Carbon Analysis', key: 1 },
  { label: 'Decision Engine', key: 2 },
  { label: 'AI Training', key: 3 },
  { label: 'Results', key: 4 },
];

export default function PhaseIndicator({ status, progress }) {
  const getActivePhase = () => {
    if (status === 'PAUSED') return 2; // Stuck at decision
    if (progress >= 1) return 4;
    if (progress > 0) return 3;
    return 1;
  };

  const activePhase = getActivePhase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginTop: 'var(--space-2xl)' }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        flexWrap: 'wrap',
      }}>
        {PHASES.map((phase, i) => {
          const isActive = i === activePhase;
          const isCompleted = i < activePhase;

          return (
            <motion.div
              key={phase.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.04em',
                background: isActive
                  ? status === 'PAUSED' ? 'var(--accent-amber-dim)' : 'var(--accent-green-dim)'
                  : isCompleted
                    ? 'rgba(16, 185, 129, 0.06)'
                    : 'rgba(148, 163, 184, 0.04)',
                color: isActive
                  ? status === 'PAUSED' ? 'var(--accent-amber)' : 'var(--accent-green-light)'
                  : isCompleted
                    ? 'var(--accent-emerald)'
                    : 'var(--text-muted)',
                border: `1px solid ${isActive
                  ? status === 'PAUSED' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-accent)'
                  : 'var(--border-default)'}`,
              }}
              animate={isActive ? {
                scale: [1, 1.02, 1],
              } : {}}
              transition={{
                repeat: isActive ? Infinity : 0,
                duration: 2,
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isActive
                  ? status === 'PAUSED' ? 'var(--accent-amber)' : 'var(--accent-green)'
                  : isCompleted
                    ? 'var(--accent-emerald)'
                    : 'var(--text-muted)',
              }} />
              {phase.label}
            </motion.div>
          );
        })}
      </div>

      {/* Phase progress bar */}
      <div className="phases" style={{ maxWidth: '600px', margin: 'var(--space-md) auto 0' }}>
        {PHASES.map((phase, i) => (
          <div
            key={phase.key}
            className={`phase ${i < activePhase ? 'phase--completed' : ''} ${i === activePhase ? 'phase--active' : ''}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
