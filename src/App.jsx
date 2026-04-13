import { useState, useEffect } from "react";
import Login from "./Login";

const API_URL = "/api/data";

export default function App() {
  const [exams, setExams] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [openSegments, setOpenSegments] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    if (isLoggedIn) {
      fetchExams();
    }
  }, [isLoggedIn]);

  const fetchExams = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setExams(data.exams || []);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  const saveData = async (updatedExams) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exams: updatedExams }),
      });
      setExams(updatedExams);
    } catch (err) {
      console.error("Failed to save exams:", err);
    }
  };

  const addExam = () => {
    if (!subject || !date) return;
    const newExam = {
      id: crypto.randomUUID(),
      subject,
      date,
      tasks: [],
    };
    const updated = [...exams, newExam];
    saveData(updated);
    setSubject("");
    setDate("");
  };

  const addTask = (examId, taskText) => {
    if (!taskText) return;
    const updated = exams.map((exam) => {
      if (exam.id === examId) {
        return {
          ...exam,
          tasks: [...exam.tasks, { id: crypto.randomUUID(), text: taskText, completed: false }],
        };
      }
      return exam;
    });
    saveData(updated);
  };

  const toggleTask = (examId, taskId) => {
    const updated = exams.map((exam) => {
      if (exam.id === examId) {
        return {
          ...exam,
          tasks: exam.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      }
      return exam;
    });
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

  const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
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
      <div className="main-wrapper animate-fade-in">
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Exam <span style={{ color: 'var(--primary)', textDecoration: 'underline', textDecorationThickness: '4px', textUnderlineOffset: '6px' }}>Planner</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Efficient tracking for academic success.</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="planner-layout">

        {/* LEFT COLUMN: Input & Segments */}
        <div className="left-column">

          {/* Add Exam Section */}
          <section className="glass-panel compact-panel">
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--primary)' }}>✦</span> Add Exam
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Subject</label>
                <input
                  type="text"
                  placeholder="e.g. DBMS"
                  className="glass-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</label>
                <input
                  type="date"
                  className="glass-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <button onClick={addExam} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Add to Schedule
            </button>
          </section>

          {/* Study Segments Section */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.01em' }}>Study Segments</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exams.length === 0 && (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed', opacity: '0.4' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No active segments</p>
                </div>
              )}
              {exams.map((exam) => (
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
                      <input
                        type="text"
                        placeholder="Study Chapter..."
                        className="glass-input"
                        style={{ fontSize: '0.85rem' }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addTask(exam.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
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

        {/* RIGHT COLUMN: Timeline Table */}
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
                    let isSpecial = false;

                    if (index === 0) {
                      gapText = getDaysLeft(exam.date);
                      isSpecial = gapText.includes("Today") || gapText.includes("Tomorrow");
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
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '900',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            background: index === 0 && gapText.includes("Passed") ? 'rgba(239, 68, 68, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                            color: index === 0 && gapText.includes("Passed") ? '#ef4444' : 'var(--primary)',
                            border: '1px solid rgba(168, 85, 247, 0.2)'
                          }}>
                            {gapText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedExams.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', padding: '30px 0', fontStyle: 'italic' }}>Timeline empty</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

      </main>

      <footer style={{ marginTop: '80px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        Exam Planner &bull; Focus &bull; Succeed
      </footer>
    </div >
    </>
  );
}
