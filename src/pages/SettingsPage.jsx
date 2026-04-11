import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage({ user, onSave }) {
  const [settings, setSettings] = useState({
    region: 'EU-WEST',
    threshold: 300,
    notifications: true,
    emailAlerts: true,
    autoResume: true,
    darkMode: true,
    updateInterval: 2,
    maxPauseDuration: 30,
  });

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const sections = [
    {
      title: 'Carbon Monitoring',
      icon: '🌍',
      fields: [
        {
          label: 'Grid Region',
          type: 'select',
          key: 'region',
          options: ['EU-WEST', 'US-WEST', 'NORDIC', 'ASIA-EAST'],
          desc: 'Primary electricity grid region for carbon monitoring',
        },
        {
          label: 'Carbon Threshold (gCO₂/kWh)',
          type: 'range',
          key: 'threshold',
          min: 50,
          max: 600,
          desc: 'Training pauses when intensity exceeds this threshold',
        },
        {
          label: 'Update Interval (seconds)',
          type: 'range',
          key: 'updateInterval',
          min: 1,
          max: 10,
          desc: 'How often to poll carbon intensity data',
        },
      ],
    },
    {
      title: 'Training Behavior',
      icon: '⚡',
      fields: [
        {
          label: 'Auto-Resume on Clean Grid',
          type: 'toggle',
          key: 'autoResume',
          desc: 'Automatically resume training when carbon intensity drops below threshold',
        },
        {
          label: 'Max Pause Duration (minutes)',
          type: 'range',
          key: 'maxPauseDuration',
          min: 5,
          max: 120,
          desc: 'Force-resume training after this duration regardless of carbon levels',
        },
      ],
    },
    {
      title: 'Notifications',
      icon: '🔔',
      fields: [
        {
          label: 'In-App Notifications',
          type: 'toggle',
          key: 'notifications',
          desc: 'Show notifications for status changes and alerts',
        },
        {
          label: 'Email Alerts',
          type: 'toggle',
          key: 'emailAlerts',
          desc: 'Receive email notifications for critical events',
        },
      ],
    },
    {
      title: 'Appearance',
      icon: '🎨',
      fields: [
        {
          label: 'Dark Mode',
          type: 'toggle',
          key: 'darkMode',
          desc: 'Toggle between dark and light interface themes',
        },
      ],
    },
  ];

  return (
    <main className="main-content">
      <div className="dash-header">
        <div>
          <motion.h1
            className="dash-header__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Settings
          </motion.h1>
          <p className="dash-header__sub">Configure carbon monitoring and training behavior</p>
        </div>
        <motion.button
          className="btn-primary"
          onClick={onSave}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Save Changes
        </motion.button>
      </div>

      <div className="settings-grid">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            className="settings-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1, duration: 0.6 }}
          >
            <div className="settings-section__header">
              <span className="settings-section__icon">{section.icon}</span>
              <h2 className="settings-section__title">{section.title}</h2>
            </div>

            {section.fields.map((field) => (
              <div key={field.key} className="settings-field">
                <div className="settings-field__info">
                  <label className="settings-field__label">{field.label}</label>
                  <span className="settings-field__desc">{field.desc}</span>
                </div>
                <div className="settings-field__control">
                  {field.type === 'select' && (
                    <select
                      className="settings-select"
                      value={settings[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'range' && (
                    <div className="settings-range">
                      <input
                        type="range"
                        className="settings-range__input"
                        min={field.min}
                        max={field.max}
                        value={settings[field.key]}
                        onChange={(e) => update(field.key, parseInt(e.target.value))}
                      />
                      <span className="settings-range__value">{settings[field.key]}</span>
                    </div>
                  )}

                  {field.type === 'toggle' && (
                    <motion.button
                      className={`settings-toggle ${settings[field.key] ? 'settings-toggle--on' : ''}`}
                      onClick={() => update(field.key, !settings[field.key])}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="settings-toggle__knob"
                        animate={{ x: settings[field.key] ? 22 : 2 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Danger Zone */}
      <motion.div
        className="settings-section settings-section--danger"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="settings-section__header">
          <span className="settings-section__icon">⚠️</span>
          <h2 className="settings-section__title" style={{ color: 'var(--accent-red)' }}>Danger Zone</h2>
        </div>
        <div className="settings-field">
          <div className="settings-field__info">
            <label className="settings-field__label">Reset All Settings</label>
            <span className="settings-field__desc">This will reset all settings to their default values</span>
          </div>
          <motion.button
            className="btn-danger"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Reset
          </motion.button>
        </div>
        <div className="settings-field">
          <div className="settings-field__info">
            <label className="settings-field__label">Delete All Training Data</label>
            <span className="settings-field__desc">Permanently delete all training history and metrics</span>
          </div>
          <motion.button
            className="btn-danger"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
