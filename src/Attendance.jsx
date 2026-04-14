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
      labAbsent: 0,
      absentDates: [], // For Theory
      labAbsentDates: [] // For Lab
    };
    const updated = {
      ...data,
      attendance: [...data.attendance, item]
    };
    saveData(updated);
    setShowAdd(false);
    setFormData({ subject: '', isLab: false, labDuration: '2', totalSemHours: '', totalLabHours: '', credits: '' });
  };

  const updateAttendance = (id, type, val, isManual = false) => {
    const updated = {
      ...data,
      attendance: data.attendance.map(a => {
        if (a.id === id) {
          if (isManual) {
            return { ...a, [type]: parseInt(val) || 0 };
          }
          // Find if we are incrementing/decrementing hours vs lab sessions
          const isLabAction = type.startsWith('lab');
          const multiplier = isLabAction ? a.labDuration : 1;
          const delta = val * multiplier;
          
          const newVal = Math.max(0, (a[type] || 0) + delta);
          
          // Validation: Absences can't exceed conducted hours
          // Note: for dates, we'll handle this in the modal
          if (type === 'absent' || type === 'labAbsent') return a; // Controlled by dates now
          
          return { ...a, [type]: newVal };
        }
        return a;
      })
    };
    saveData(updated);
  };

  const [dateModal, setDateModal] = useState({ show: false, subjectId: null, type: null, isAdd: true });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAbsenceDate = (subjectId, type, date, isAdd) => {
    const updated = {
      ...data,
      attendance: data.attendance.map(a => {
        if (a.id === subjectId) {
          const field = type === 'absent' ? 'absentDates' : 'labAbsentDates';
          const currentDates = a[field] || [];
          if (isAdd) {
            return { ...a, [field]: [...currentDates, date] };
          } else {
            const index = currentDates.indexOf(date);
            if (index > -1) {
              const newDates = [...currentDates];
              newDates.splice(index, 1);
              return { ...a, [field]: newDates };
            }
          }
        }
        return a;
      })
    };
    saveData(updated);
    setDateModal({ show: false, subjectId: null, type: null, isAdd: true });
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
      <header className="view-header" style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Attendance <span style={{ color: 'var(--accent)', borderBottom: '4px solid var(--accent)', paddingBottom: '6px' }}>Tracker</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '24px' }}>Separate tracking for Theory and Labs. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>"Time to make the chimichangas!"</span></p>
      </header>

      <section style={{ marginBottom: '40px' }}>
        {!showAdd ? (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add New Course</button>
        ) : (
          <div className="glass-panel compact-panel animate-fade-in">
            <h2 className="section-title">Course Entry</h2>
            <form onSubmit={(e) => { e.preventDefault(); addSubject(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <input className="glass-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. DAA" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Theory Total Hrs</label>
                  <input type="number" className="glass-input" value={formData.totalSemHours} onChange={e => setFormData({...formData, totalSemHours: e.target.value})} placeholder="e.g. 45" required />
                </div>
                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '32px' }}>
                  <input type="checkbox" className="round-checkbox" id="isLab" checked={formData.isLab} onChange={e => setFormData({...formData, isLab: e.target.checked})} />
                  <label htmlFor="isLab" className="input-label" style={{ marginBottom: 0 }}>Has Lab?</label>
                </div>
                {formData.isLab && (
                  <>
                    <div className="input-group">
                      <label className="input-label">Lab Total Hrs</label>
                      <input type="number" className="glass-input" value={formData.totalLabHours} onChange={e => setFormData({...formData, totalLabHours: e.target.value})} placeholder="e.g. 30" required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Hrs per Lab</label>
                      <input type="number" className="glass-input" value={formData.labDuration} onChange={e => setFormData({...formData, labDuration: e.target.value})} required />
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary">Add Subject</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </section>

      <div className="attendance-grid">
        {data.attendance.map(a => {
          const tAbsent = a.absentDates?.length || a.absent || 0;
          const lAbsent = a.labAbsentDates?.length || a.labAbsent || 0;
          const theoryStats = calculateStats(a.conducted, tAbsent, a.totalSemHours);
          const labStats = a.isLab ? calculateStats(a.labConducted, lAbsent, a.totalLabHours, true, a.labDuration) : null;

          const combinedPercent = a.isLab && labStats
            ? ((parseFloat(theoryStats.currentPercent) + parseFloat(labStats.currentPercent)) / 2).toFixed(1)
            : null;

          return (
            <div key={a.id} className="glass-panel attendance-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: combinedPercent ? '8px' : 0 }}>{a.subject}</h3>
                  {combinedPercent && (
                    <div className="overall-badge-container">
                      <span className="overall-label">Overall</span>
                      <span className={`badge ${parseFloat(combinedPercent) < 75 ? 'danger' : 'success'} overall-badge`}>
                        {combinedPercent}%
                      </span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => deleteCourse(a.id)} 
                  style={{ 
                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                    border: 'none', 
                    color: '#ffffff', 
                    cursor: 'pointer', 
                    fontSize: '0.75rem', 
                    fontWeight: '800',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Delete
                </button>
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
                        <input 
                          type="number" 
                          className="invisible-input" 
                          value={a.conducted} 
                          onChange={(e) => updateAttendance(a.id, 'conducted', e.target.value, true)}
                        />
                        <button onClick={() => updateAttendance(a.id, 'conducted', 1)}>+</button>
                      </div>
                    </div>
                    <div className="dash-item">
                      <label>Absent</label>
                      <div className="h-counter danger">
                        <button onClick={() => setDateModal({ show: true, subjectId: a.id, type: 'absent', isAdd: false })}>-</button>
                        <span>{tAbsent}h</span>
                        <button onClick={() => setDateModal({ show: true, subjectId: a.id, type: 'absent', isAdd: true })}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="leaves-info">
                    <div className="leaves-bar">
                      <div className="fill" style={{ 
                        width: `${Math.min(100, (a.absent / theoryStats.maxAbsentTotal) * 100)}%`,
                        background: theoryStats.leavesAllowedHours < 3 ? '#ef4444' : 'var(--accent)'
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
                          <input 
                            type="number" 
                            className="invisible-input" 
                            value={a.labConducted} 
                            onChange={(e) => updateAttendance(a.id, 'labConducted', e.target.value, true)}
                          />
                          <button onClick={() => updateAttendance(a.id, 'labConducted', 1)}>+</button>
                        </div>
                      </div>
                      <div className="dash-item">
                        <label>Labs Absent</label>
                        <div className="h-counter danger">
                          <button onClick={() => setDateModal({ show: true, subjectId: a.id, type: 'labAbsent', isAdd: false })}>-</button>
                          <span>{lAbsent / a.labDuration} labs</span>
                          <button onClick={() => setDateModal({ show: true, subjectId: a.id, type: 'labAbsent', isAdd: true })}>+</button>
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

      {dateModal.show && (
        <div className="modal-overlay" onClick={() => setDateModal({ show: false })}>
          <div className="glass-panel modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>
              {dateModal.isAdd ? 'Add Absence' : 'Remove Absence'} 
              <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '10px' }}>
                ({data.attendance.find(s => s.id === dateModal.subjectId)?.subject} {dateModal.type === 'labAbsent' ? 'LAB' : 'Theory'})
              </span>
            </h3>
            
            {dateModal.isAdd ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Select Date</label>
                  <input 
                    type="date" 
                    className="glass-input" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => handleAbsenceDate(dateModal.subjectId, dateModal.type, selectedDate, true)}
                >
                  Record Absence
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {(() => {
                  const subject = data.attendance.find(s => s.id === dateModal.subjectId);
                  const field = dateModal.type === 'absent' ? 'absentDates' : 'labAbsentDates';
                  const dates = subject?.[field] || [];
                  
                  if (dates.length === 0) return <p style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No recorded absences</p>;
                  
                  return dates.map((d, i) => (
                    <div key={i} className="date-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <span style={{ fontWeight: '600' }}>{new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 12px', fontSize: '0.7rem', color: '#ef4444' }}
                        onClick={() => handleAbsenceDate(dateModal.subjectId, dateModal.type, d, false)}
                      >
                        Delete
                      </button>
                    </div>
                  ));
                })()}
              </div>
            )}
            
            <button 
              className="btn-secondary" 
              style={{ width: '100%', marginTop: '20px' }} 
              onClick={() => setDateModal({ show: false })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
