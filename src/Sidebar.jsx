import { useState } from 'react';

export default function Sidebar({ activeTab, setActiveTab, username }) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'planner', label: 'Mission Planner', icon: '📝' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'reminders', label: 'Reminders', icon: '🔔' },
    { id: 'attendance', label: 'Attendance', icon: '📊' }
  ];

  return (
    <>
      <button className="menu-trigger" onClick={() => setIsOpen(true)}>
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Avengers <span style={{ color: 'var(--primary)' }}>HQ</span></h2>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsOpen(false);
                }}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="avatar" style={{ background: 'transparent', boxShadow: 'none' }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
                  <polygon points="12,2 22,20 2,20" stroke="#38bdf8" strokeWidth="2" fill="rgba(56, 189, 248, 0.2)"/>
                  <circle cx="12" cy="14" r="3" fill="#38bdf8" filter="drop-shadow(0 0 4px #0284c7)"/>
                  <path d="M12 2 L12 14 M2 20 L12 14 M22 20 L12 14" stroke="#38bdf8" strokeWidth="0.5" opacity="0.5"/>
                </svg>
              </div>
              <div className="user-info">
                <span className="username">{(username || 'Ananya').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
