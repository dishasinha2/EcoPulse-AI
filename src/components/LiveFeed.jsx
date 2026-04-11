import { motion, AnimatePresence } from 'framer-motion';

export default function LiveFeed({ logs }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getMsgClass = (type) => {
    switch (type) {
      case 'success': return 'feed-msg--highlight';
      case 'warn': return 'feed-msg--warn';
      case 'error': return 'feed-msg--error';
      default: return '';
    }
  };

  return (
    <div className="live-feed">
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            className="feed-item"
            initial={{ opacity: 0, height: 0, x: -20 }}
            animate={{ opacity: 1, height: 'auto', x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="feed-time">{log.time}</span>
            <span className="feed-icon">{getIcon(log.type)}</span>
            <span className={`feed-msg ${getMsgClass(log.type)}`}>
              {log.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      {logs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2xl)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          No activity yet. Start a training job to see live updates.
        </div>
      )}
    </div>
  );
}
