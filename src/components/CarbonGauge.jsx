import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CarbonGauge({ value, max, thresholds }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const dashOffset = circumference * (1 - percentage);
  const gaugeRef = useRef(null);
  const prevValueRef = useRef(0);

  const getColor = () => {
    if (value < thresholds.LOW) return '#10b981';
    if (value < thresholds.HIGH) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = () => {
    if (value < thresholds.LOW) return 'LOW';
    if (value < thresholds.HIGH) return 'MODERATE';
    return 'HIGH';
  };

  const getLabelColor = () => {
    if (value < thresholds.LOW) return 'var(--accent-green)';
    if (value < thresholds.HIGH) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  // Animate value change with GSAP
  useEffect(() => {
    if (gaugeRef.current) {
      const obj = { val: prevValueRef.current };
      gsap.to(obj, {
        val: value,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          if (gaugeRef.current) {
            gaugeRef.current.textContent = Math.round(obj.val);
          }
        },
      });
      prevValueRef.current = value;
    }
  }, [value]);

  return (
    <div className="gauge-container" style={{ position: 'relative' }}>
      <svg className="gauge-svg" viewBox="0 0 200 200">
        <circle
          className="gauge-bg"
          cx="100"
          cy="100"
          r={radius}
        />
        <motion.circle
          className="gauge-fill"
          cx="100"
          cy="100"
          r={radius}
          stroke={getColor()}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="gauge-center" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div
          className="gauge-value"
          ref={gaugeRef}
          style={{ color: getColor() }}
        >
          {value}
        </div>
        <div className="gauge-label">gCO₂/kWh</div>
        <motion.div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: getLabelColor(),
            marginTop: '4px',
            letterSpacing: '0.1em',
          }}
          key={getLabel()}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {getLabel()}
        </motion.div>
      </div>
    </div>
  );
}
