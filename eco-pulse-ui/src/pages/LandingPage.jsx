import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InteractiveGlobe from '../components/InteractiveGlobe';
import Aurora from '../components/Aurora';
import FlowDiagram from '../components/FlowDiagram';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: '📡',
    title: 'Real-Time Carbon Data',
    desc: 'Live grid carbon intensity from 30+ regions worldwide with sub-second WebSocket updates.',
    color: '#10b981',
    tag: 'MONITORING',
  },
  {
    icon: '🧠',
    title: 'Smart Scheduling',
    desc: 'Automatically pauses training during high-carbon periods and resumes when the grid is clean.',
    color: '#22d3ee',
    tag: 'AI ENGINE',
  },
  {
    icon: '📈',
    title: 'Zero Accuracy Loss',
    desc: 'Checkpoint-and-resume keeps model quality identical — just greener.',
    color: '#a78bfa',
    tag: 'PERFORMANCE',
  },
  {
    icon: '🌍',
    title: 'Impact Dashboard',
    desc: 'Track every gram of CO₂ saved. Export reports for ESG compliance.',
    color: '#f59e0b',
    tag: 'ANALYTICS',
  },
];

const navLinks = [
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Carbon Map', id: 'carbon-map' },
];

export default function LandingPage({ onGetStarted, onNavigate }) {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const globeScale = useTransform(scrollYProgress, [0, 0.12], [1, 1.2]);
  const globeOpacity = useTransform(scrollYProgress, [0.08, 0.2], [1, 0]);

  // Counter animation state
  const [counters, setCounters] = useState({ carbon: 0, models: 0, uptime: 0 });
  const countersStarted = useRef(false);

  // Scroll handler for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x * 15);
      mouseY.set(y * 15);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // GSAP scroll-triggered animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Feature cards stagger
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // How it works section
      gsap.from('.flow-section__title', {
        scrollTrigger: { trigger: '.flow-section', start: 'top 80%' },
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      });

      // Carbon map preview
      gsap.from('.carbon-map-preview', {
        scrollTrigger: { trigger: '.carbon-map-preview', start: 'top 85%' },
        y: 50, opacity: 0, duration: 1, ease: 'power3.out',
      });

      // Animate counters when metrics section comes into view
      ScrollTrigger.create({
        trigger: '.hero-metrics',
        start: 'top 90%',
        onEnter: () => {
          if (!countersStarted.current) {
            countersStarted.current = true;
            gsap.to({}, {
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                const p = this.progress();
                setCounters({
                  carbon: Math.round(p * 40),
                  models: Math.round(p * 150),
                  uptime: Math.min(99.7, +(p * 99.7).toFixed(1)),
                });
              },
            });
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="landing-page">
      <div className="landing-page__ether" aria-hidden="true">
        <Aurora
          colorStops={['#10b981', '#14b8a6', '#22d3ee']}
          amplitude={0.7}
          speed={0.28}
        />
      </div>

      {/* ═══════════ LANDING NAVBAR ═══════════ */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav__inner">
          <div className="landing-nav__brand">
            <span className="landing-nav__logo">🌱</span>
            <span className="landing-nav__name">Eco Pulse</span>
            <span className="landing-nav__dot-green">🟢</span>
          </div>
          <div className="landing-nav__links">
            {navLinks.map((link) => (
              <button
                key={link.id}
                className="landing-nav__link"
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="landing-nav__actions">
            <button
              className="landing-nav__signin"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </button>
            <motion.button
              className="landing-nav__cta"
              onClick={onGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ═══════════ CINEMATIC HERO ═══════════ */}
      <motion.section
        className="landing-hero"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Two-column hero layout */}
        <div className="hero-split">
          {/* Left — Text Content */}
          <motion.div
            className="hero-split__left"
            style={{ x: springX, y: springY }}
          >
            <motion.div
              className="hero__badge"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="hero__badge-dot" />
              Carbon-Aware AI Infrastructure
            </motion.div>

            <motion.h1
              className="hero-headline"
              initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="hero-headline__line">Run AI When</span>
              <span className="hero-headline__line">the Planet is</span>
              <span className="hero-headline__line hero-headline__accent">Ready</span>
            </motion.h1>

            <motion.p
              className="hero-subtext"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Automatically schedule AI workloads when carbon emissions are lowest across the globe.
            </motion.p>

            <motion.div
              className="hero-cta-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <motion.button
                className="btn-hero"
                onClick={onGetStarted}
                whileHover={{ scale: 1.04, boxShadow: '0 0 80px rgba(16,185,129,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="btn-hero__shimmer" />
                Start Scheduling
                <span className="btn-hero__arrow">→</span>
              </motion.button>

              <motion.button
                className="btn-outline"
                onClick={() => scrollToSection('carbon-map')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="btn-outline__icon">📊</span>
                View Live Grid Status
              </motion.button>
            </motion.div>

            {/* Metrics strip */}
            <motion.div
              className="hero-metrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
            >
              <div className="hero-metric">
                <span className="hero-metric__value">40%</span>
                <span className="hero-metric__label">Carbon Reduction</span>
              </div>
              <div className="hero-metric__sep" />
              <div className="hero-metric">
                <span className="hero-metric__value">150+</span>
                <span className="hero-metric__label">Teams Using</span>
              </div>
              <div className="hero-metric__sep" />
              <div className="hero-metric">
                <span className="hero-metric__value">30+</span>
                <span className="hero-metric__label">Regions Covered</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-split__right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="scheduler-board">
              <div className="scheduler-board__header">
                <div className="scheduler-board__title">LIVE REGIONAL SCHEDULER</div>
                <div className="scheduler-board__status">
                  <span className="status-dot"></span>
                  LIVE FEED
                </div>
              </div>
              <div className="scheduler-grid">
                {[
                  { region: 'US-EAST', carbon: '242', status: 'OPTIMAL', trend: 'down' },
                  { region: 'EU-WEST', carbon: '118', status: 'OPTIMAL', trend: 'stable' },
                  { region: 'ASIA-SOUTHEAST', carbon: '482', status: 'STANDBY', trend: 'up' },
                  { region: 'US-WEST', carbon: '156', status: 'OPTIMAL', trend: 'down' },
                ].map((item, idx) => (
                  <div key={idx} className="scheduler-item">
                    <div className="scheduler-item__info">
                      <span className="scheduler-item__region">{item.region}</span>
                      <span className={`scheduler-item__status scheduler-item__status--${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="scheduler-item__data">
                      <div className="scheduler-item__value">
                        {item.carbon} <span className="unit">gCO2/kWh</span>
                      </div>
                      <div className={`scheduler-item__trend scheduler-item__trend--${item.trend}`}>
                        {item.trend === 'down' ? '↓' : item.trend === 'up' ? '↑' : '→'}
                      </div>
                    </div>
                    <div className="scheduler-item__bar-bg">
                      <motion.div 
                        className="scheduler-item__bar" 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.carbon / 600) * 100}%` }}
                        transition={{ delay: 1 + idx * 0.1, duration: 1.5 }}
                        style={{ background: item.status === 'OPTIMAL' ? 'var(--accent-green)' : 'var(--accent-amber)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="scheduler-board__footer">
                <span>Active Nodes: 1,242</span>
                <span>Uptime: 99.9%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="scroll-indicator__mouse">
            <div className="scroll-indicator__wheel" />
          </div>
          <span>Scroll to explore</span>
        </motion.div>
      </motion.section>

      {/* ═══════════ LIVE CARBON MAP PREVIEW ═══════════ */}
      <section className="carbon-map-preview" id="carbon-map">
        <div className="section-header">
          <span className="section-label">Live Carbon Map</span>
          <h2 className="section-title">
            Global Carbon Intensity <span className="text-gradient">In Real-Time</span>
          </h2>
          <p className="section-desc">
            Monitor carbon emissions across 30+ regions. Green zones 
            indicate optimal scheduling windows for your AI workloads.
          </p>
        </div>
        <div className="carbon-map-card">
          <div className="carbon-grid-viz">
            <div className="carbon-map-card__globe">
              <InteractiveGlobe mousePos={{ x: 0, y: 0 }} />
            </div>
            <div className="carbon-map-card__stats">
              <div className="carbon-map-stat">
                <span className="carbon-map-stat__label">Cleanest Region</span>
                <strong className="carbon-map-stat__value">Nordic Grid</strong>
                <span className="carbon-map-stat__meta">41 gCO2/kWh</span>
              </div>
              <div className="carbon-map-stat">
                <span className="carbon-map-stat__label">Best Window</span>
                <strong className="carbon-map-stat__value">02:00 - 05:00 UTC</strong>
                <span className="carbon-map-stat__meta">Wind-heavy availability</span>
              </div>
              <div className="carbon-map-stat">
                <span className="carbon-map-stat__label">Live Regions</span>
                <strong className="carbon-map-stat__value">30+</strong>
                <span className="carbon-map-stat__meta">Updated continuously</span>
              </div>
            </div>
          </div>
          <div className="carbon-map-card__overlay">
            <div className="carbon-map-card__legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#10b981' }} />
                <span>Low Carbon (Optimal)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }} />
                <span>Moderate Carbon</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ef4444' }} />
                <span>High Carbon (Avoid)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">
            Everything to <span className="text-gradient">Go Green</span>
          </h2>
          <p className="section-desc">
            From real-time carbon monitoring to smart job scheduling — Eco Pulse handles it all.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              className="feature-card"
              key={feature.title}
              whileHover={{
                y: -8,
                boxShadow: `0 20px 50px ${feature.color}15`,
                borderColor: `${feature.color}30`,
              }}
            >
              <div className="feature-card__head">
                <div className="feature-card__icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                  {feature.icon}
                </div>
                <span className="feature-card__tag" style={{ color: feature.color, borderColor: `${feature.color}40` }}>{feature.tag}</span>
              </div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__desc">{feature.desc}</p>
              <div className="feature-card__line" style={{ background: feature.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="flow-section" id="how-it-works">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2 className="flow-section__title section-title">
            Five Steps to <span className="text-gradient">Carbon-Smart AI</span>
          </h2>
          <p className="section-desc">
            From data collection to dashboard insights — here's how Eco Pulse
            makes your training pipeline planet-friendly.
          </p>
        </div>
        <FlowDiagram />
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-card__glow" />
          <div className="cta-card__content">
            <motion.h2
              className="cta-card__title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Start reducing your AI's <span className="text-gradient">carbon footprint</span> today
            </motion.h2>
            <motion.p
              className="cta-card__desc"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              Join 150+ teams already using Eco Pulse to schedule smarter.
              Free tier — no credit card required.
            </motion.p>
            <motion.div
              className="cta-card__actions"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button
                className="btn-hero"
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="btn-hero__shimmer" />
                Get Started Free
                <span className="btn-hero__arrow">→</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <span className="landing-nav__logo" style={{ width: 28, height: 28, fontSize: '0.9rem' }}>🌱</span>
            <span className="text-gradient" style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>Eco Pulse</span>
            <span>🟢</span>
          </div>
          <div className="landing-footer__links">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Sign In</a>
            <a href="#">Documentation</a>
            <a href="#">GitHub</a>
            <a href="#">API Reference</a>
          </div>
          <div className="landing-footer__copy">
            © 2026 Eco Pulse. Making AI sustainable, one epoch at a time.
          </div>
        </div>
      </footer>
    </div>
  );
}
