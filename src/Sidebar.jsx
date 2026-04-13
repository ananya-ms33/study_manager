import { useState } from 'react';

export default function Sidebar({ activeTab, setActiveTab, username }) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'planner', label: 'Exam Planner', icon: '📅' },
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Student <span style={{ color: 'var(--primary)' }}>Hub</span></h2>
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
              <div className="avatar">{(username || 'A')[0].toUpperCase()}</div>
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
