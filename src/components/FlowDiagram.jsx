import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';

const steps = [
  {
    num: '01',
    icon: '📡',
    title: 'Carbon Data Collection',
    desc: 'We tap into real-time electricity grid APIs from 30+ regions. Carbon intensity data flows through WebSocket connections updated every 2 seconds.',
    color: '#10b981',
    detail: 'Sources: UK Carbon Intensity API, WattTime, ElectricityMaps',
  },
  {
    num: '02',
    icon: '🧠',
    title: 'Backend Analysis',
    desc: 'Our engine analyzes current carbon levels against historical patterns, forecasts, and your configured thresholds to make smart decisions.',
    color: '#22d3ee',
    detail: 'ML-powered forecasting with 94% accuracy over 6-hour windows',
  },
  {
    num: '03',
    icon: '⚖️',
    title: 'Decision Engine',
    desc: 'Should training continue or pause? The system weighs carbon cost against training urgency, deadline pressure, and checkpoint state.',
    color: '#a78bfa',
    detail: 'Configurable policies: Strict, Balanced, Performance-first',
  },
  {
    num: '04',
    icon: '⚡',
    title: 'AI Worker Execution',
    desc: 'Training tasks are executed, paused, or rescheduled automatically. Checkpoints ensure zero progress loss during carbon-aware pauses.',
    color: '#f59e0b',
    detail: 'Supports PyTorch, TensorFlow, JAX, and custom frameworks',
  },
  {
    num: '05',
    icon: '📊',
    title: 'Dashboard & Reporting',
    desc: 'Monitor everything in real-time: carbon saved, training progress, energy mix, and model performance — all in one beautiful dashboard.',
    color: '#ec4899',
    detail: 'Export ESG compliance reports with one click',
  },
];

export default function FlowDiagram() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [hoveredStep, setHoveredStep] = useState(null);
  const isInView = useInView(containerRef, { once: false, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    // Sequentially reveal steps
    const timers = steps.map((_, i) =>
      setTimeout(() => setActiveStep(i), 400 + i * 300)
    );

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={containerRef} className="flow-diagram">
      {/* Connecting line */}
      <div className="flow-line">
        <motion.div
          className="flow-line__fill"
          initial={{ height: 0 }}
          animate={{ height: isInView ? '100%' : 0 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {steps.map((step, i) => {
        const isActive = i <= activeStep;
        const isHovered = hoveredStep === i;

        return (
          <motion.div
            key={step.num}
            className={`flow-step ${isActive ? 'flow-step--active' : ''}`}
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHoveredStep(i)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            {/* Step node on the line */}
            <motion.div
              className="flow-step__node"
              style={{
                borderColor: isActive ? step.color : 'var(--border-default)',
                background: isActive ? `${step.color}15` : 'var(--bg-secondary)',
              }}
              animate={isActive ? {
                boxShadow: `0 0 ${isHovered ? 30 : 15}px ${step.color}30`,
              } : {}}
            >
              <span style={{ fontSize: '1.3rem' }}>{step.icon}</span>
            </motion.div>

            {/* Step content */}
            <motion.div
              className="flow-step__content"
              animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flow-step__num" style={{ color: step.color }}>{step.num}</div>
              <h3 className="flow-step__title">{step.title}</h3>
              <p className="flow-step__desc">{step.desc}</p>

              {/* Expand detail on hover */}
              <motion.div
                className="flow-step__detail"
                initial={{ height: 0, opacity: 0 }}
                animate={isHovered ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="flow-step__detail-inner" style={{ borderColor: step.color }}>
                  💡 {step.detail}
                </div>
              </motion.div>

              {/* Animated data bits */}
              {isActive && isHovered && (
                <div className="flow-step__particles">
                  {[...Array(5)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="flow-particle"
                      style={{ background: step.color }}
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 60,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: j * 0.15,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
