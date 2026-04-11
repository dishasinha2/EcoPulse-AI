import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MetricCard({ value, unit, label, type = 'green', icon }) {
  const valueRef = useRef(null);
  const prevRef = useRef(0);

  const colorClass = {
    green: 'metric-value--green',
    amber: 'metric-value--amber',
    red: 'metric-value--red',
    cyan: 'metric-value--cyan',
  }[type] || 'metric-value--green';

  useEffect(() => {
    if (valueRef.current) {
      const obj = { val: prevRef.current };
      gsap.to(obj, {
        val: value,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.textContent = Math.round(obj.val);
          }
        },
      });
      prevRef.current = value;
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        marginBottom: '4px',
      }}>
        {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
        <div>
          <div className={`metric-value ${colorClass}`}>
            <span ref={valueRef}>{value}</span>
            <span className="metric-unit">{unit}</span>
          </div>
        </div>
      </div>
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginTop: '4px',
      }}>
        {label}
      </div>
    </motion.div>
  );
}
