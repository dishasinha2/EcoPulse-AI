import { useState } from 'react';
import { motion } from 'framer-motion';

const workers = [
  { id: 'w-001', name: 'GPU-Node-A1', status: 'active', gpu: 'A100 80GB', utilization: 87, region: 'EU-WEST', uptime: '4d 12h' },
  { id: 'w-002', name: 'GPU-Node-A2', status: 'active', gpu: 'A100 80GB', utilization: 92, region: 'EU-WEST', uptime: '4d 12h' },
  { id: 'w-003', name: 'GPU-Node-B1', status: 'paused', gpu: 'H100 80GB', utilization: 0, region: 'US-WEST', uptime: '2d 8h' },
  { id: 'w-004', name: 'GPU-Node-C1', status: 'active', gpu: 'A100 40GB', utilization: 65, region: 'NORDIC', uptime: '6d 3h' },
  { id: 'w-005', name: 'GPU-Node-C2', status: 'offline', gpu: 'V100 32GB', utilization: 0, region: 'ASIA-EAST', uptime: '—' },
];

const jobs = [
  { id: 'j-001', name: 'GPT-Eco-7B', status: 'running', progress: 67, created: '2h ago', co2Saved: '142g' },
  { id: 'j-002', name: 'BERT-Green-Base', status: 'completed', progress: 100, created: '1d ago', co2Saved: '890g' },
  { id: 'j-003', name: 'ViT-Eco-Large', status: 'queued', progress: 0, created: '5m ago', co2Saved: '0g' },
  { id: 'j-004', name: 'LLaMA-Eco-13B', status: 'paused', progress: 34, created: '6h ago', co2Saved: '234g' },
];

const policies = [
  { id: 'p-001', name: 'Strict Green', threshold: 100, action: 'Pause above threshold', active: false },
  { id: 'p-002', name: 'Balanced', threshold: 300, action: 'Pause above threshold', active: true },
  { id: 'p-003', name: 'Performance First', threshold: 500, action: 'Warn only', active: false },
];

export default function AdminPage({ user }) {
  const [activeTab, setActiveTab] = useState('workers');

  const tabs = [
    { key: 'workers', label: 'Workers', icon: '🖥️' },
    { key: 'jobs', label: 'Jobs', icon: '📋' },
    { key: 'policies', label: 'Policies', icon: '⚙️' },
    { key: 'audit', label: 'Audit Log', icon: '📜' },
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
            Admin Panel
          </motion.h1>
          <p className="dash-header__sub">Manage workers, jobs, and carbon policies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === 'workers' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>GPU</th>
                  <th>Status</th>
                  <th>Utilization</th>
                  <th>Region</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w, i) => (
                  <motion.tr
                    key={w.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="admin-table__row"
                  >
                    <td>
                      <div className="admin-table__name">
                        <span className="admin-table__id">{w.id}</span>
                        {w.name}
                      </div>
                    </td>
                    <td><span className="admin-chip">{w.gpu}</span></td>
                    <td>
                      <span className={`admin-status admin-status--${w.status}`}>
                        <span className="admin-status__dot" />
                        {w.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-util">
                        <div className="admin-util__bar">
                          <motion.div
                            className="admin-util__fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${w.utilization}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            style={{
                              background: w.utilization > 80 ? 'var(--accent-amber)' :
                                w.utilization > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                            }}
                          />
                        </div>
                        <span>{w.utilization}%</span>
                      </div>
                    </td>
                    <td>{w.region}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{w.uptime}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Created</th>
                  <th>CO₂ Saved</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j, i) => (
                  <motion.tr
                    key={j.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="admin-table__row"
                  >
                    <td>
                      <div className="admin-table__name">
                        <span className="admin-table__id">{j.id}</span>
                        {j.name}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status admin-status--${j.status}`}>
                        <span className="admin-status__dot" />
                        {j.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-util">
                        <div className="admin-util__bar">
                          <motion.div
                            className="admin-util__fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${j.progress}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                          />
                        </div>
                        <span>{j.progress}%</span>
                      </div>
                    </td>
                    <td>{j.created}</td>
                    <td style={{ color: 'var(--accent-green-light)', fontFamily: 'var(--font-mono)' }}>{j.co2Saved}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="admin-policies">
            {policies.map((p, i) => (
              <motion.div
                key={p.id}
                className={`policy-card ${p.active ? 'policy-card--active' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="policy-card__header">
                  <h3>{p.name}</h3>
                  <div className={`policy-toggle ${p.active ? 'policy-toggle--on' : ''}`}>
                    <div className="policy-toggle__knob" />
                  </div>
                </div>
                <div className="policy-card__detail">
                  <span>Threshold: <strong>{p.threshold} gCO₂/kWh</strong></span>
                  <span>Action: {p.action}</span>
                </div>
                {p.active && (
                  <div className="metric-change metric-change--positive" style={{ marginTop: 'var(--space-sm)' }}>
                    ✓ Currently Active
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="admin-audit">
            {[
              { time: '08:12:34', action: 'Policy changed to "Balanced"', user: 'admin@eco.dev', type: 'config' },
              { time: '07:45:12', action: 'Training paused — carbon spike detected', user: 'system', type: 'auto' },
              { time: '07:30:00', action: 'Worker GPU-Node-B1 paused manually', user: 'admin@eco.dev', type: 'manual' },
              { time: '06:15:22', action: 'Job GPT-Eco-7B started', user: 'admin@eco.dev', type: 'job' },
              { time: '05:00:00', action: 'Daily carbon report generated', user: 'system', type: 'report' },
            ].map((entry, i) => (
              <motion.div
                key={i}
                className="audit-entry"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="audit-entry__time">{entry.time}</span>
                <span className={`audit-entry__type audit-entry__type--${entry.type}`}>
                  {entry.type}
                </span>
                <span className="audit-entry__action">{entry.action}</span>
                <span className="audit-entry__user">{entry.user}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
