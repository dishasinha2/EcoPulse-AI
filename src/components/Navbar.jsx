import { motion } from 'framer-motion';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'admin', label: 'Admin', icon: '🖥️' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Navbar({ user, currentPage, onNavigate, onLogout }) {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar__brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
        <div className="navbar__logo">🌱</div>
        <div>
          <div className="navbar__title">ecoPulse</div>
          <div className="navbar__subtitle">Carbon-Aware AI Training</div>
        </div>
      </div>

      <div className="navbar__nav">
        {navItems.map((item) => (
          <motion.button
            key={item.key}
            className={`navbar__link ${currentPage === item.key ? 'navbar__link--active' : ''}`}
            onClick={() => onNavigate(item.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{item.icon}</span>
            {item.label}
            {currentPage === item.key && (
              <motion.div
                className="navbar__link-indicator"
                layoutId="nav-indicator"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="navbar__user">
        {user && (
          <motion.div
            className="navbar__user-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="navbar__avatar">{user.avatar}</span>
            <span className="navbar__user-name">{user.name}</span>
            <motion.button
              className="navbar__logout"
              onClick={onLogout}
              whileHover={{ scale: 1.05, color: 'var(--accent-red)' }}
            >
              Logout
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
