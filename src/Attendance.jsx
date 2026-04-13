import { useState } from 'react';

export default function Attendance({ data, saveData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    isLab: false,
    labDuration: '2',
    totalSemHours: '',
    totalLabHours: '',
    credits: ''
  });

  const addSubject = () => {
    if (!formData.subject || !formData.totalSemHours) return;
    const item = {
      id: crypto.randomUUID(),
      ...formData,
      totalSemHours: parseInt(formData.totalSemHours),
      totalLabHours: formData.isLab ? parseInt(formData.totalLabHours) : 0,
      labDuration: formData.isLab ? parseInt(formData.labDuration) : 2,
      conducted: 0,
      absent: 0,
      labConducted: 0,
      labAbsent: 0
    };
    const updated = {
      ...data,
      attendance: [...data.attendance, item]
    };
    saveData(updated);
    setShowAdd(false);
    setFormData({ subject: '', isLab: false, labDuration: '2', totalSemHours: '', totalLabHours: '', credits: '' });
  };

  const updateAttendance = (id, type, val) => {
    const updated = {
      ...data,
      attendance: data.attendance.map(a => {
        if (a.id === id) {
          // Find if we are incrementing/decrementing hours vs lab sessions
          const isLabAction = type.startsWith('lab');
          const multiplier = isLabAction ? a.labDuration : 1;
          const delta = val * multiplier;
          
          const newVal = Math.max(0, a[type] + delta);
          
          // Validation: Absences can't exceed conducted hours
          if (type === 'absent' && newVal > a.conducted) return a;
          if (type === 'labAbsent' && newVal > a.labConducted) return a;
          
          return { ...a, [type]: newVal };
        }
        return a;
      })
    };
    saveData(updated);
  };

  const calculateStats = (conducted, absent, total, isLab = false, labDuration = 2) => {
    const present = conducted - absent;
    const currentPercent = conducted > 0 ? ((present / conducted) * 100).toFixed(1) : 100;
    
    const maxAbsentTotal = Math.floor(total * 0.25);
    const leavesAllowedHours = maxAbsentTotal - absent;
    const leavesAllowedSessions = isLab ? Math.floor(leavesAllowedHours / labDuration) : leavesAllowedHours;
    
    return { currentPercent, leavesAllowedHours, leavesAllowedSessions, maxAbsentTotal };
  };

  const deleteCourse = (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      const updated = { ...data, attendance: data.attendance.filter(a => a.id !== id) };
      saveData(updated);
    }
  };

  return (
    <div className="attendance-view animate-fade-in">
      <header className="view-header">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
          Attendance <span style={{ color: 'var(--accent)', borderBottom: '4px solid var(--accent)' }}>Tracker</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Separate tracking for Theory and Labs.</p>
      </header>

      <section style={{ marginBottom: '40px' }}>
        {!showAdd ? (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add New Course</button>
        ) : (
          <div className="glass-panel compact-panel animate-fade-in">
            <h2 className="section-title">Course Entry</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="input-group">
                <label className="input-label">Subject</label>
                <input className="glass-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. DAA" />
              </div>
              <div className="input-group">
                <label className="input-label">Theory Total Hrs</label>
                <input type="number" className="glass-input" value={formData.totalSemHours} onChange={e => setFormData({...formData, totalSemHours: e.target.value})} placeholder="e.g. 45" />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '32px' }}>
                <input type="checkbox" className="round-checkbox" id="isLab" checked={formData.isLab} onChange={e => setFormData({...formData, isLab: e.target.checked})} />
                <label htmlFor="isLab" className="input-label" style={{ marginBottom: 0 }}>Has Lab?</label>
              </div>
              {formData.isLab && (
                <>
                  <div className="input-group">
                    <label className="input-label">Lab Total Hrs</label>
                    <input type="number" className="glass-input" value={formData.totalLabHours} onChange={e => setFormData({...formData, totalLabHours: e.target.value})} placeholder="e.g. 30" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Hrs per Lab</label>
                    <input type="number" className="glass-input" value={formData.labDuration} onChange={e => setFormData({...formData, labDuration: e.target.value})} />
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={addSubject}>Add Subject</button>
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <div className="attendance-grid">
        {data.attendance.map(a => {
          const theoryStats = calculateStats(a.conducted, a.absent, a.totalSemHours);
          const labStats = a.isLab ? calculateStats(a.labConducted, a.labAbsent, a.totalLabHours, true, a.labDuration) : null;

          return (
            <div key={a.id} className="glass-panel attendance-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>{a.subject}</h3>
                <button onClick={() => deleteCourse(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
              </div>

              <div className="attendance-sections" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* THEORY SECTION */}
                <div className="theory-box">
                  <div className="box-header">
                    <span className="label">Theory Progress</span>
                    <span className={`badge ${theoryStats.currentPercent < 75 ? 'danger' : 'success'}`}>{theoryStats.currentPercent}%</span>
                  </div>
                  <div className="stats-dashboard">
                    <div className="dash-item">
                      <label>Conducted</label>
                      <div className="h-counter">
                        <button onClick={() => updateAttendance(a.id, 'conducted', -1)}>-</button>
                        <span>{a.conducted}h</span>
                        <button onClick={() => updateAttendance(a.id, 'conducted', 1)}>+</button>
                      </div>
                    </div>
                    <div className="dash-item">
                      <label>Absent</label>
                      <div className="h-counter danger">
                        <button onClick={() => updateAttendance(a.id, 'absent', -1)}>-</button>
                        <span>{a.absent}h</span>
                        <button onClick={() => updateAttendance(a.id, 'absent', 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="leaves-info">
                    <div className="leaves-bar">
                      <div className="fill" style={{ 
                        width: `${Math.min(100, (a.absent / theoryStats.maxAbsentTotal) * 100)}%`,
                        background: theoryStats.leavesAllowedHours < 3 ? '#ef4444' : 'var(--primary)'
                      }} />
                    </div>
                    <p>Leaves Left: <strong>{theoryStats.leavesAllowedHours} hours</strong></p>
                  </div>
                </div>

                {/* LAB SECTION */}
                {a.isLab && (
                  <div className="lab-box" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                    <div className="box-header">
                      <span className="label">Lab Progress ({a.labDuration}h sessions)</span>
                      <span className={`badge ${labStats.currentPercent < 75 ? 'danger' : 'success'}`}>{labStats.currentPercent}%</span>
                    </div>
                    <div className="stats-dashboard">
                      <div className="dash-item">
                        <label>Labs Conducted</label>
                        <div className="h-counter">
                          <button onClick={() => updateAttendance(a.id, 'labConducted', -1)}>-</button>
                          <span>{a.labConducted / a.labDuration} sessions</span>
                          <button onClick={() => updateAttendance(a.id, 'labConducted', 1)}>+</button>
                        </div>
                      </div>
                      <div className="dash-item">
                        <label>Labs Absent</label>
                        <div className="h-counter danger">
                          <button onClick={() => updateAttendance(a.id, 'labAbsent', -1)}>-</button>
                          <span>{a.labAbsent / a.labDuration} sessions</span>
                          <button onClick={() => updateAttendance(a.id, 'labAbsent', 1)}>+</button>
                        </div>
                      </div>
                    </div>
                    <div className="leaves-info">
                      <div className="leaves-bar">
                        <div className="fill" style={{ 
                          width: `${Math.min(100, (a.labAbsent / labStats.maxAbsentTotal) * 100)}%`,
                          background: labStats.leavesAllowedSessions < 2 ? '#ef4444' : 'var(--accent)'
                        }} />
                      </div>
                      <p>Leaves Left: <strong>{labStats.leavesAllowedHours}h / {labStats.leavesAllowedSessions} sessions</strong></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
