// SearchModal.jsx — Global search across notes, tasks
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../App.jsx';
import { Search, FileText, CheckSquare, X } from 'lucide-react';

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || '';
}

export default function SearchModal() {
  const { notes, tasks, folders, setSearchOpen, setActiveNote, setView } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase().trim();

  const noteResults = q ? notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    stripHtml(n.content).toLowerCase().includes(q) ||
    n.tags?.some(t => t.toLowerCase().includes(q))
  ).slice(0, 8) : [];

  const taskResults = q ? tasks.filter(t =>
    t.title.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  function selectNote(note) {
    setActiveNote(note);
    setView('notes');
    setSearchOpen(false);
  }

  function selectTask() {
    setView('tasks');
    setSearchOpen(false);
  }

  const hasResults = noteResults.length > 0 || taskResults.length > 0;

  return (
    <div className="search-overlay" onClick={() => setSearchOpen(false)}>
      <div className="search-modal fade-in" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="search-input-row">
          <Search size={16} style={{ color:'var(--text-muted)', flexShrink:0 }} />
          <input
            ref={inputRef}
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes, tasks, tags…"
          />
          <button className="btn-icon" onClick={() => setSearchOpen(false)}>
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="search-results">
          {q && !hasResults && (
            <div style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
              No results for "{query}"
            </div>
          )}

          {noteResults.length > 0 && (
            <>
              <div style={{
                padding:'8px 16px 4px',
                fontSize:10, fontWeight:600, letterSpacing:'0.7px',
                textTransform:'uppercase', color:'var(--text-muted)',
              }}>NOTES</div>
              {noteResults.map(note => {
                const folder = folders.find(f => f.id === note.folderId);
                const preview = stripHtml(note.content);
                return (
                  <div key={note.id} className="search-result-item" onClick={() => selectNote(note)}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <FileText size={13} style={{ color:'var(--accent)', flexShrink:0 }} />
                      <span className="search-result-title">{note.title || 'Untitled'}</span>
                    </div>
                    <span className="search-result-sub">
                      {folder?.name} · {preview.slice(0, 60) || 'No content'}
                    </span>
                  </div>
                );
              })}
            </>
          )}

          {taskResults.length > 0 && (
            <>
              <div style={{
                padding:'8px 16px 4px',
                fontSize:10, fontWeight:600, letterSpacing:'0.7px',
                textTransform:'uppercase', color:'var(--text-muted)',
              }}>TASKS</div>
              {taskResults.map(task => (
                <div key={task.id} className="search-result-item" onClick={selectTask}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <CheckSquare size={13} style={{ color:'var(--green)', flexShrink:0 }} />
                    <span className="search-result-title">{task.title || 'Untitled task'}</span>
                  </div>
                  <span className="search-result-sub">
                    {task.completed ? 'Completed' : 'Active'}{task.deadline ? ` · Due ${task.deadline}` : ''}
                  </span>
                </div>
              ))}
            </>
          )}

          {!q && (
            <div style={{ padding:'20px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
              Type to search across all your notes and tasks
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          padding:'8px 16px', borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:12,
          fontSize:11, color:'var(--text-muted)',
        }}>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}
