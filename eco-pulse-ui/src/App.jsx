import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import ParticleField from './components/ParticleField';

const pageTransition = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  // Lenis smooth scrolling
  useEffect(() => {
    const isTouchDevice =
      window.matchMedia?.('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Scroll to top on page change
    lenis.scrollTo(0, { immediate: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [currentPage]);

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('landing');
  };

  const showNavbar = !['landing', 'login'].includes(currentPage);

  return (
    <div className="app-container">
      <ParticleField active={['login', 'dashboard', 'admin', 'settings'].includes(currentPage)} />

      {showNavbar && (
        <Navbar
          user={user}
          currentPage={currentPage}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentPage} {...pageTransition}>
          {currentPage === 'landing' && (
            <LandingPage onGetStarted={() => navigate('login')} onNavigate={navigate} />
          )}
          {currentPage === 'login' && (
            <LoginPage onLogin={handleLogin} onBack={() => navigate('landing')} />
          )}
          {currentPage === 'dashboard' && (
            <DashboardPage user={user} />
          )}
          {currentPage === 'admin' && (
            <AdminPage user={user} />
          )}
          {currentPage === 'settings' && (
            <SettingsPage user={user} onSave={() => navigate('dashboard')} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
