import { useState, useEffect } from "react";
import Login from "./Login";
import Sidebar from "./Sidebar";
import Reminders from "./Reminders";
import Attendance from "./Attendance";
import CalendarView from "./CalendarView";

const API_URL = "/api/data";

export default function App() {
  const [data, setData] = useState({ exams: [], reminders: [], attendance: [] });
  const [activeTab, setActiveTab] = useState('planner');
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [openSegments, setOpenSegments] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [user, setUser] = useState({ username: localStorage.getItem("username") || "" });

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData({
        exams: json.exams || [],
        reminders: json.reminders || [],
        attendance: json.attendance || []
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const saveData = async (updatedData) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      setData(updatedData);
    } catch (err) {
      console.error("Failed to save data:", err);
    }
  };

  // --- EXAM LOGIC ---
  const addExam = () => {
    if (!subject || !date) return;
    const newExam = {
      id: crypto.randomUUID(),
      subject,
      date,
      tasks: [],
    };
    const updated = { ...data, exams: [...data.exams, newExam] };
    saveData(updated);
    setSubject("");
    setDate("");
  };

  const addTask = (examId, taskText) => {
    if (!taskText) return;
    const updated = {
      ...data,
      exams: data.exams.map((exam) => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: [...exam.tasks, { id: crypto.randomUUID(), text: taskText, completed: false }],
          };
        }
        return exam;
      })
    };
    saveData(updated);
  };

  const toggleTask = (examId, taskId) => {
    const updated = {
      ...data,
      exams: data.exams.map((exam) => {
        if (exam.id === examId) {
          return {
            ...exam,
            tasks: exam.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
          };
        }
        return exam;
      })
    };
    saveData(updated);
  };

  const toggleSegment = (id) => {
    setOpenSegments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getDaysLeft = (examDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Passed";
    return `${diffDays} days left`;
  };

  const sortedExams = [...data.exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleLogin = (username) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    setUser({ username });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <div style={{ width: '100%', background: 'linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '6px 0', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.4em', position: 'fixed', top: 0, zIndex: 90, boxShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
        Maximum Effort
      </div>
      <div className="hub-container" style={{ marginTop: '24px' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} username={user.username} />

        <div className="main-wrapper animate-fade-in">
          <header style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Educational Data & Intelligence Tracking Hub
                </p>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                  E.D.I.T.H. <span style={{ color: 'var(--primary)' }}>Network</span>
                </h1>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '8px 16px' }}>
                Logout
              </button>
            </div>
          </header>

          {activeTab === 'planner' && (
            <main className="planner-layout">
              <div className="left-column">
                <section className="glass-panel compact-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--primary)' }}>✦</span> Add Exam
                    </h2>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', maxWidth: '200px', textAlign: 'right' }}>
                      ¿Dónde está la biblioteca? Which literally translates to: I don't bargain mf
                    </span>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); addExam(); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label className="input-label">Subject</label>
                        <input
                          type="text"
                          placeholder="e.g. DBMS"
                          className="glass-input"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="input-label">Date</label>
                        <input
                          type="date"
                          className="glass-input"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                      Add to Schedule
                    </button>
                  </form>
                </section>

                <section>
                  <h2 className="section-title">Study Segments</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.exams.length === 0 && (
                      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed', opacity: '0.4' }}>
                        <p>No active segments</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '10px', fontStyle: 'italic', color: 'var(--accent)' }}>"Maximum Effort!" — Deadpool</p>
                      </div>
                    )}
                    {data.exams.map((exam) => (
                      <div key={exam.id} className={`segment glass-panel ${openSegments[exam.id] ? "open" : ""}`}>
                        <div className="segment-header" onClick={() => toggleSegment(exam.id)}>
                          <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                            {exam.subject} <span style={{ color: 'var(--text-dim)', margin: '0 8px', fontWeight: '400' }}>—</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                              {new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>{exam.tasks.length}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', transform: openSegments[exam.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
                          </div>
                        </div>
                        <div className="segment-content" style={{ padding: '0 24px 20px 24px' }}>
                          <div style={{ marginBottom: '16px' }}>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const input = e.target.elements.taskInput;
                              if (input.value.trim()) {
                                addTask(exam.id, input.value.trim());
                                input.value = "";
                              }
                            }}>
                              <input
                                name="taskInput"
                                type="text"
                                placeholder="Study Chapter..."
                                className="glass-input"
                                style={{ fontSize: '0.85rem' }}
                                autoComplete="off"
                              />
                            </form>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {exam.tasks.map((task) => (
                              <div key={task.id} className="task-item">
                                <input
                                  type="checkbox"
                                  className="round-checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleTask(exam.id, task.id)}
                                />
                                <span className={`task-text ${task.completed ? "striked" : ""}`}>
                                  {task.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="right-column">
                <section className="glass-panel compact-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent)' }}>◈</span> Timeline
                  </h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="exam-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Study Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedExams.map((exam, index) => {
                          let gapText = "";
                          if (index === 0) {
                            gapText = getDaysLeft(exam.date);
                          } else {
                            const prevExamDate = new Date(sortedExams[index - 1].date);
                            const currentExamDate = new Date(exam.date);
                            prevExamDate.setHours(0, 0, 0, 0);
                            currentExamDate.setHours(0, 0, 0, 0);
                            const diffTime = currentExamDate - prevExamDate;
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) - 1;
                            if (diffDays <= 0) gapText = "Back-to-back";
                            else gapText = `${diffDays} day${diffDays > 1 ? 's' : ''} to study`;
                          }

                          return (
                            <tr key={exam.id}>
                              <td style={{ fontWeight: '800', fontSize: '0.9rem' }}>{exam.subject}</td>
                              <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                                {new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span className="badge" style={{
                                  background: index === 0 && gapText.includes("Passed") ? 'rgba(255, 255, 255, 0.05)' : 'rgba(245, 197, 24, 0.1)',
                                  color: index === 0 && gapText.includes("Passed") ? 'var(--text-dim)' : 'var(--accent)'
                                }}>
                                  {gapText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </main>
          )}

          {activeTab === 'reminders' && (
            <Reminders data={data} saveData={saveData} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView data={data} />
          )}

          {activeTab === 'attendance' && (
            <Attendance data={data} saveData={saveData} />
          )}

          <footer style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            J.A.R.V.I.S. // Stark Industries &bull; Authorization Confirmed
            <span style={{ float: 'right', textTransform: 'none', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', letterSpacing: 'normal' }}>"Mjolnir? Is it called Jonathan?"</span>
          </footer>
        </div>
      </div>
    </>
  );
}
