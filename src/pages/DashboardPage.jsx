import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSimulatedWebSocket } from '../hooks/useSimulatedWebSocket';
import CarbonGauge from '../components/CarbonGauge';
import CarbonChart from '../components/CarbonChart';
import LiveFeed from '../components/LiveFeed';
import MetricCard from '../components/MetricCard';
import EnergyMix from '../components/EnergyMix';
import PhaseIndicator from '../components/PhaseIndicator';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function DashboardPage({ user }) {
  const {
    connected, carbonData, history, status, jobMetrics, logs,
    startJob, stopJob, THRESHOLDS,
  } = useSimulatedWebSocket();

  const dashRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
          y: 50, opacity: 0, duration: 0.7, delay: i * 0.05, ease: 'power3.out',
        });
      });
    }, dashRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="main-content" ref={dashRef}>
      {/* Dashboard Header */}
      <div className="dash-header">
        <div>
          <motion.h1
            className="dash-header__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Dashboard
          </motion.h1>
          <p className="dash-header__sub">
            {connected ? '🟢 Live carbon monitoring active' : '🔴 Connecting...'}
          </p>
        </div>
        <div className="dash-header__actions">
          <AnimatePresence mode="wait">
            {status === 'IDLE' ? (
              <motion.button
                key="start"
                className="start-btn start-btn--start"
                onClick={startJob}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="start-btn__ripple" />
                <span className="start-btn__icon">▶</span>
                Start Training
              </motion.button>
            ) : (
              <motion.button
                key="stop"
                className="start-btn start-btn--stop"
                onClick={stopJob}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="start-btn__ripple" />
                <span className="start-btn__icon">⏹</span>
                Stop Training
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {status !== 'IDLE' && (
        <PhaseIndicator status={status} progress={jobMetrics.epochsCompleted / jobMetrics.totalEpochs} />
      )}

      {/* Dashboard Grid */}
      <section className="dashboard" style={{ marginTop: 'var(--space-xl)' }}>
        {/* Status */}
        <motion.div className="card card--span-4 card--glow" variants={scaleIn} initial="hidden" animate="visible" custom={0}>
          <div className="card__header">
            <span className="card__title">System Status</span>
            <span className="card__icon">📡</span>
          </div>
          <div className="status-display">
            <motion.div
              className={`status-indicator status-indicator--${status.toLowerCase()}`}
              animate={{ scale: status === 'RUNNING' ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: status === 'RUNNING' ? Infinity : 0, duration: 2 }}
            >
              {status === 'RUNNING' ? '⚡' : status === 'PAUSED' ? '⏸' : '💤'}
            </motion.div>
            <div>
              <motion.div
                className={`status-text__label status-text__label--${status.toLowerCase()}`}
                key={status}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {status}
              </motion.div>
              <div className="status-text__sub">
                {status === 'RUNNING' && 'Model training in progress'}
                {status === 'PAUSED' && 'Waiting for clean energy'}
                {status === 'IDLE' && 'No active training job'}
              </div>
            </div>
          </div>
          {status !== 'IDLE' && (
            <>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  animate={{ width: `${(jobMetrics.epochsCompleted / jobMetrics.totalEpochs) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Epoch {jobMetrics.epochsCompleted}/{jobMetrics.totalEpochs}</span>
                <span>{Math.round((jobMetrics.epochsCompleted / jobMetrics.totalEpochs) * 100)}%</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Carbon Gauge */}
        <motion.div className="card card--span-4 card--glow" variants={scaleIn} initial="hidden" animate="visible" custom={1}>
          <div className="card__header">
            <span className="card__title">Carbon Intensity</span>
            <span className="card__icon">🌍</span>
          </div>
          <CarbonGauge value={carbonData?.intensity || 0} max={600} thresholds={THRESHOLDS} />
        </motion.div>

        {/* Environmental Impact */}
        <motion.div className="card card--span-4 card--glow" variants={scaleIn} initial="hidden" animate="visible" custom={2}>
          <div className="card__header">
            <span className="card__title">Environmental Impact</span>
            <span className="card__icon">🌿</span>
          </div>
          <MetricCard value={jobMetrics.co2Saved} unit="g CO₂" label="Carbon Saved" type="green" icon="🍃" />
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div className="metric-row">
              <span className="metric-row__label">🕐 Training Time</span>
              <span className="metric-row__value">{formatTime(jobMetrics.trainingTime)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-row__label">⏸ Paused Time</span>
              <span className="metric-row__value">{formatTime(jobMetrics.pausedTime)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-row__label">📊 Efficiency</span>
              <span className="metric-row__value" style={{ color: 'var(--accent-green-light)' }}>
                {jobMetrics.trainingTime > 0 ? Math.round((jobMetrics.trainingTime / (jobMetrics.trainingTime + jobMetrics.pausedTime)) * 100) : 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div className="card card--span-8" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <div className="card__header">
            <span className="card__title">Carbon Intensity Over Time</span>
            <span className="card__icon">📈</span>
          </div>
          <CarbonChart data={history} thresholds={THRESHOLDS} />
        </motion.div>

        {/* Energy Mix */}
        <motion.div className="card card--span-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <div className="card__header">
            <span className="card__title">Energy Mix</span>
            <span className="card__icon">⚡</span>
          </div>
          <EnergyMix source={carbonData?.source} />
        </motion.div>

        {/* Model Performance */}
        <motion.div className="card card--span-4" variants={fadeUp} initial="hidden" animate="visible" custom={5}>
          <div className="card__header">
            <span className="card__title">Model Performance</span>
            <span className="card__icon">🤖</span>
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loss</div>
            <motion.div className="metric-value metric-value--cyan" style={{ fontSize: '2rem' }} key={jobMetrics.loss.toFixed(4)} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
              {jobMetrics.loss.toFixed(4)}
            </motion.div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Accuracy</div>
            <motion.div className="metric-value metric-value--green" style={{ fontSize: '2rem' }} key={jobMetrics.accuracy.toFixed(1)} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
              {jobMetrics.accuracy.toFixed(1)}<span className="metric-unit">%</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Live Feed */}
        <motion.div className="card card--span-8" variants={fadeUp} initial="hidden" animate="visible" custom={6}>
          <div className="card__header">
            <span className="card__title">Live System Log</span>
            <span className="card__icon">📋</span>
          </div>
          <LiveFeed logs={logs} />
        </motion.div>
      </section>
    </main>
  );
}
