import { useState } from 'react';

export default function Reminders({ data, saveData }) {
  const [newReminder, setNewReminder] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState([]);

  // Normalize subjects for grouping (case-insensitive)
  const grouped = data.reminders.reduce((acc, r) => {
    const key = r.subject.trim().toLowerCase();
    if (!acc[key]) acc[key] = { displayName: r.subject.trim(), tasks: [] };
    acc[key].tasks.push(r);
    return acc;
  }, {});

  const addReminder = (subjectToUse) => {
    const sub = subjectToUse || newSubject;
    if (!newReminder || !sub) return;
    
    const item = {
      id: crypto.randomUUID(),
      subject: sub,
      text: newReminder,
      completed: false
    };
    const updated = {
      ...data,
      reminders: [...data.reminders, item]
    };
    saveData(updated);
    setNewReminder('');
    if (!subjectToUse) setNewSubject('');
  };

  const toggleReminder = (id) => {
    const updated = {
      ...data,
      reminders: data.reminders.map(r => 
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    };
    saveData(updated);
  };

  const toggleSelectDelete = (id) => {
    setSelectedForDelete(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    const updated = {
      ...data,
      reminders: data.reminders.filter(r => !selectedForDelete.includes(r.id))
    };
    saveData(updated);
    setSelectedForDelete([]);
    setIsDeleteMode(false);
  };

  const deleteEntireGroup = (subjectKey) => {
    const updated = {
      ...data,
      reminders: data.reminders.filter(r => r.subject.toLowerCase() !== subjectKey)
    };
    saveData(updated);
  };

  return (
    <div className="reminders-view animate-fade-in">
      <header className="view-header">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
          My <span style={{ color: 'var(--primary)', borderBottom: '4px solid var(--primary)' }}>Reminders</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Stay on top of your tasks.</p>
      </header>

      <section className="glass-panel compact-panel" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Add Task
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); addReminder(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label className="input-label">New Subject</label>
              <input 
                className="glass-input" 
                placeholder="e.g. Maths" 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label">Task Details</label>
              <input 
                className="glass-input" 
                placeholder="What needs to be done?" 
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Task List</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isDeleteMode ? (
            <>
              <button className="btn-secondary" onClick={() => { setIsDeleteMode(false); setSelectedForDelete([]); }}>Cancel</button>
              <button 
                className="btn-primary" 
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                onClick={deleteSelected}
                disabled={selectedForDelete.length === 0}
              >
                Delete Selected ({selectedForDelete.length})
              </button>
            </>
          ) : (
            <button className="btn-secondary" onClick={() => setIsDeleteMode(true)}>Manage Tasks</button>
          )}
        </div>
      </div>

      <div className="reminder-groups">
        {Object.entries(grouped).map(([key, group]) => (
          <div key={key} className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {group.displayName}
                </h3>
                {!isDeleteMode && (
                  <button 
                    onClick={() => {
                      const text = prompt(`Add another task for ${group.displayName}:`);
                      if (text) {
                        const item = { id: crypto.randomUUID(), subject: group.displayName, text, completed: false };
                        const updated = { ...data, reminders: [...data.reminders, item] };
                        saveData(updated);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    +
                  </button>
                )}
              </div>
              {isDeleteMode && (
                <button 
                  className="btn-secondary" 
                  style={{ color: '#ef4444', fontSize: '0.7rem', padding: '4px 8px' }}
                  onClick={() => {
                    if (confirm(`Delete entire subject "${group.displayName}"?`)) {
                      deleteEntireGroup(key);
                    }
                  }}
                >
                  Delete Subject
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {group.tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                  style={{ 
                    cursor: 'pointer',
                    background: selectedForDelete.includes(task.id) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedForDelete.includes(task.id) ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent'
                  }}
                  onClick={() => isDeleteMode ? toggleSelectDelete(task.id) : toggleReminder(task.id)}
                >
                  <input 
                    type="checkbox" 
                    className="round-checkbox" 
                    readOnly
                    checked={isDeleteMode ? selectedForDelete.includes(task.id) : task.completed}
                    style={{ borderColor: isDeleteMode ? '#ef4444' : 'var(--primary)' }}
                  />
                  <span className={`task-text ${task.completed ? 'striked' : ''}`} style={{ fontSize: '1rem' }}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
            <p>No tasks found. Start by adding one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
