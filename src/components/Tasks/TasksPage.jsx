// TasksPage.jsx — Task management with priorities, deadlines, progress
import React, { useState } from 'react';
import { useApp } from '../../App.jsx';
import { Plus, Trash2, ChevronDown, Check, Flag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

export default function TasksPage() {
  const { tasks, createTask, updateTask, deleteTask } = useApp();
  const [filter, setFilter] = useState('all');  // all | active | done | today
  const [newTitle, setNewTitle] = useState('');

  function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask({ title: newTitle.trim() });
    setNewTitle('');
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done')   return t.completed;
    if (filter === 'today')  return t.deadline && isToday(new Date(t.deadline));
    return true;
  });

  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="tasks-page overflow-auto h-full">
      <h1>Tasks</h1>

      {/* Progress summary */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: 20,
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13 }}>
          <span style={{ fontWeight:500 }}>{done} of {total} completed</span>
          <span style={{ color:'var(--accent)', fontWeight:600 }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* New task input */}
      <form onSubmit={handleCreate} style={{ display:'flex', gap:8, marginBottom:16 }}>
        <input
          className="input"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new task…"
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {['all','active','done','today'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--radius-sm)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: '1.5px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'var(--bg-surface)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ height:'auto', paddingTop:40 }}>
          <div className="empty-state-icon">✓</div>
          <h3>No tasks here</h3>
        </div>
      ) : (
        filtered.map(task => <TaskItem key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />)
      )}
    </div>
  );
}

function TaskItem({ task, onUpdate, onDelete }) {
  const [showOpts, setShowOpts] = useState(false);

  const isOverdue = task.deadline && !task.completed && isPast(new Date(task.deadline));

  return (
    <div className={`task-item ${task.completed ? 'done' : ''}`}>
      {/* Priority dot */}
      <div
        className="priority-dot"
        style={{ background: PRIORITY_COLORS[task.priority] }}
        title={PRIORITY_LABELS[task.priority] + ' priority'}
      />

      {/* Checkbox */}
      <div
        className={`task-check ${task.completed ? 'checked' : ''}`}
        onClick={() => onUpdate(task.id, { completed: !task.completed })}
      >
        {task.completed && <Check size={11} strokeWidth={3} />}
      </div>

      {/* Title */}
      <input
        className="task-title-input"
        value={task.title}
        onChange={e => onUpdate(task.id, { title: e.target.value })}
        placeholder="Task title…"
      />

      {/* Deadline */}
      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
        {task.deadline && (
          <span style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 'var(--radius-sm)',
            background: isOverdue ? '#fff0f0' : 'var(--bg-elevated)',
            color: isOverdue ? 'var(--red)' : 'var(--text-muted)',
            fontWeight: 500,
          }}>
            {format(new Date(task.deadline), 'MMM d')}
          </span>
        )}
        <input
          type="date"
          value={task.deadline || ''}
          onChange={e => onUpdate(task.id, { deadline: e.target.value })}
          style={{
            opacity: 0, width: 16, height: 16, cursor: 'pointer',
            position: 'absolute', right: 0,
          }}
        />
      </div>

      {/* Priority selector */}
      <div className="relative">
        <button
          className="btn-icon"
          style={{ color: PRIORITY_COLORS[task.priority] }}
          onClick={() => setShowOpts(v => !v)}
          title="Priority"
        >
          <Flag size={13} />
        </button>
        {showOpts && (
          <div className="dropdown" style={{ right:0 }}>
            {Object.entries(PRIORITY_LABELS).map(([k,v]) => (
              <button
                key={k}
                className="dropdown-item"
                onClick={() => { onUpdate(task.id, { priority: k }); setShowOpts(false); }}
              >
                <div style={{ width:8, height:8, borderRadius:'50%', background: PRIORITY_COLORS[k] }} />
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Deadline picker */}
      <div className="relative" style={{ fontSize: 11 }}>
        <button
          className="btn-icon"
          title="Set deadline"
          onClick={() => {
            const d = prompt('Set deadline (YYYY-MM-DD):', task.deadline || '');
            if (d !== null) onUpdate(task.id, { deadline: d || null });
          }}
        >
          📅
        </button>
      </div>

      {/* Delete */}
      <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete">
        <Trash2 size={13} />
      </button>
    </div>
  );
}
