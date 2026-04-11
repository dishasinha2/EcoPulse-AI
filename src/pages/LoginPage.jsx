import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export default function LoginPage({ onLogin, onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetNotice, setResetNotice] = useState('');
  const formRef = useRef(null);

  // GSAP entrance
  useEffect(() => {
    if (formRef.current) {
      gsap.from(formRef.current.querySelectorAll('.login-field'), {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        delay: 0.3,
        duration: 0.6,
        ease: 'power3.out',
      });
    }
  }, [isSignUp]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setResetNotice('');
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: name || 'Alex',
        email: email || 'alex@ecopulse.dev',
        role: 'admin',
        avatar: '🧑‍💻',
      });
    }, 1200);
  };

  const handleForgotPassword = () => {
    const accountEmail = email || 'alex@ecopulse.dev';
    setResetNotice(`Password reset link sent to ${accountEmail}.`);
  };

  return (
    <div className="login-page">
      <motion.button
        className="login-back"
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
      >
        ← Back
      </motion.button>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-card">
          <div className="login-card__glow" />

          <div className="login-header">
            <div className="navbar__logo" style={{ width: 44, height: 44, fontSize: '1.4rem', margin: '0 auto var(--space-md)' }}>
              🌱
            </div>
            <h1 className="login-title">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="login-subtitle">
              {isSignUp
                ? 'Join the green AI revolution'
                : 'Sign in to your ecoPulse dashboard'}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="login-field">
                <label className="login-label">Full Name</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">👤</span>
                  <input
                    type="text"
                    className="login-input"
                    placeholder="Alex Green"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="login-field">
              <label className="login-label">Email or Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">📧</span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="alex@ecopulse.dev or alex.green"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isSignUp && (
                <div className="login-meta">
                  <button
                    type="button"
                    className="login-forgot"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {resetNotice && <div className="login-notice">{resetNotice}</div>}

            <motion.button
              type="submit"
              className="login-submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </motion.button>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <div className="login-social">
              {['Google', 'GitHub', 'SSO'].map((provider) => (
                <motion.button
                  key={provider}
                  type="button"
                  className="login-social__btn"
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.05, borderColor: 'var(--accent-green)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {provider === 'Google' && '🌐'}
                  {provider === 'GitHub' && '⚡'}
                  {provider === 'SSO' && '🔑'}
                  {' '}{provider}
                </motion.button>
              ))}
            </div>

            <div className="login-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                className="login-switch__link"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
