import { motion } from 'framer-motion';

const SOURCES = [
  { key: 'solar', label: 'Solar', color: '#f59e0b', icon: '☀️' },
  { key: 'wind', label: 'Wind', color: '#22d3ee', icon: '💨' },
  { key: 'nuclear', label: 'Nuclear', color: '#a78bfa', icon: '⚛️' },
  { key: 'gas', label: 'Gas', color: '#fb923c', icon: '🔥' },
  { key: 'coal', label: 'Coal', color: '#6b7280', icon: '🏭' },
];

export default function EnergyMix({ source }) {
  if (!source) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-2xl)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        Waiting for data...
      </div>
    );
  }

  const total = Object.values(source).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Stacked bar */}
      <div style={{
        display: 'flex',
        height: '12px',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        marginBottom: 'var(--space-lg)',
        background: 'rgba(148, 163, 184, 0.05)',
      }}>
        {SOURCES.map((s, i) => {
          const pct = (source[s.key] / total) * 100;
          return (
            <motion.div
              key={s.key}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                background: s.color,
                minWidth: pct > 0 ? '4px' : 0,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      {SOURCES.map((s) => {
        const pct = Math.round((source[s.key] / total) * 100);
        return (
          <motion.div
            key={s.key}
            className="metric-row"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="metric-row__label">
              <span>{s.icon}</span>
              {s.label}
            </span>
            <span className="metric-row__value" style={{ color: s.color }}>
              {pct}%
            </span>
          </motion.div>
        );
      })}

      {/* Renewable percentage */}
      <div style={{
        marginTop: 'var(--space-md)',
        padding: 'var(--space-sm) var(--space-md)',
        background: 'var(--accent-green-dim)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-accent)',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--accent-green-light)',
          fontWeight: 600,
        }}>
          🌿 {Math.round(((source.solar + source.wind + source.nuclear) / total) * 100)}% Clean Energy
        </span>
      </div>
    </div>
  );
}
