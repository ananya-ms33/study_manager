import { useState } from 'react';

export default function CalendarView({ data }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getExamsForDay = (day) => {
    return data.exams.filter(exam => {
      // Parse YYYY-MM-DD manually to avoid timezone shifts
      const [year, month, d] = exam.date.split('-');
      return (
        parseInt(d, 10) === day &&
        parseInt(month, 10) - 1 === currentDate.getMonth() &&
        parseInt(year, 10) === currentDate.getFullYear()
      );
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-view animate-fade-in">
      <header className="view-header">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', fontStyle: 'italic' }}>
          "Since uh, <span style={{ color: 'var(--primary)', borderBottom: '4px solid var(--primary)' }}>when?"</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Visual overview of your upcoming schedule.</p>
      </header>

      <section className="glass-panel compact-panel">
        <div className="calendar-header" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>
            {monthNames[currentDate.getMonth()]} <span style={{ color: 'var(--primary)', fontWeight: '300' }}>{currentDate.getFullYear()}</span>
          </h2>
          <div className="calendar-controls">
            <button className="btn-secondary" onClick={prevMonth} style={{ padding: '8px 16px', borderRadius: '8px' }}>&larr;</button>
            <button className="btn-secondary" onClick={() => setCurrentDate(new Date())} style={{ padding: '8px 16px', borderRadius: '8px' }}>Today</button>
            <button className="btn-secondary" onClick={nextMonth} style={{ padding: '8px 16px', borderRadius: '8px' }}>&rarr;</button>
          </div>
        </div>

        <div className="calendar-grid">
          {daysOfWeek.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}

          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const examsToday = getExamsForDay(day);
            return (
              <div key={day} className={`calendar-day ${isToday(day) ? 'today' : ''}`}>
                <span className="calendar-day-num">{day}</span>
                {examsToday.map(exam => (
                  <div key={exam.id} className="exam-pill" title={exam.subject}>
                    {exam.subject}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
