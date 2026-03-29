// CalendarPage.jsx — Monthly calendar with events/tasks
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useApp } from '../../App.jsx';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

export default function CalendarPage() {
  const { events, tasks, notes, createEvent, updateEvent, deleteEvent } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedStr = format(selectedDate, 'yyyy-MM-dd');

  const dayEvents = events.filter(e => e.date === selectedStr);
  const dayTasks  = tasks.filter(t => t.deadline === selectedStr);

  function tileContent({ date }) {
    const ds = format(date, 'yyyy-MM-dd');
    const hasEvent = events.some(e => e.date === ds);
    const hasTask  = tasks.some(t => t.deadline === ds);
    return (hasEvent || hasTask) ? (
      <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:2 }}>
        {hasEvent && <div className="event-dot" style={{ position:'static', background:'var(--accent)' }} />}
        {hasTask  && <div className="event-dot" style={{ position:'static', background:'var(--green)' }} />}
      </div>
    ) : null;
  }

  function addEvent() {
    createEvent({ date: selectedStr, title: '' });
  }

  return (
    <div className="calendar-page">
      <h1>Calendar</h1>

      <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
        {/* Calendar */}
        <div style={{ flex:'0 0 auto', minWidth:300 }}>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            locale="en-US"
          />
        </div>

        {/* Events for selected day */}
        <div style={{ flex:1, minWidth:260 }}>
          <div className="calendar-events-panel">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h3>
                📅 {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <button className="btn btn-primary" style={{ padding:'5px 12px', fontSize:12 }} onClick={addEvent}>
                <Plus size={12} /> Event
              </button>
            </div>

            {dayEvents.length === 0 && dayTasks.length === 0 && (
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>Nothing on this day.</p>
            )}

            {dayTasks.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.6px', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:6 }}>TASKS</div>
                {dayTasks.map(task => (
                  <div key={task.id} className="event-item">
                    <div className="event-color-bar" style={{ background: task.completed ? '#10b981' : '#f59e0b' }} />
                    <span style={{ fontSize:13.5, flex:1, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {task.title || 'Untitled task'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {dayEvents.map(event => (
              <EventItem key={event.id} event={event} onUpdate={updateEvent} onDelete={deleteEvent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventItem({ event, onUpdate, onDelete }) {
  const [colorIdx, setColorIdx] = useState(EVENT_COLORS.indexOf(event.color) ?? 0);

  function cycleColor() {
    const next = (EVENT_COLORS.indexOf(event.color) + 1) % EVENT_COLORS.length;
    onUpdate(event.id, { color: EVENT_COLORS[next] });
  }

  return (
    <div className="event-item">
      <div
        className="event-color-bar"
        style={{ background: event.color, cursor:'pointer' }}
        onClick={cycleColor}
        title="Click to change color"
      />
      <input
        className="event-title-input"
        value={event.title}
        onChange={e => onUpdate(event.id, { title: e.target.value })}
        placeholder="Event title…"
      />
      <button className="btn-icon" onClick={() => onDelete(event.id)} title="Delete">
        <Trash2 size={13} />
      </button>
    </div>
  );
}
