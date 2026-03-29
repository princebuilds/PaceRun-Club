// NotesPanel.jsx — Notes list + editor split view
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../App.jsx';
import { Plus, Trash2, MoreHorizontal, Image, Pen } from 'lucide-react';
import { format } from 'date-fns';
import NoteEditor from './NoteEditor.jsx';

export default function NotesPanel() {
  const {
    notes, folders, activeFolder, activeNote, setActiveNote,
    createNote, deleteNote, updateNote,
  } = useApp();

  // Filter notes by active folder
  const filteredNotes = activeFolder
    ? notes.filter(n => n.folderId === activeFolder)
    : notes;

  function handleNewNote() {
    const note = createNote(activeFolder || 'default');
    setActiveNote(note);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    if (activeNote?.id === id) setActiveNote(null);
    deleteNote(id);
  }

  // Strip HTML for preview
  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || '';
  }

  return (
    <div className="notes-panel">
      {/* Notes list */}
      <div className="notes-list">
        <div className="notes-list-header">
          <h2>{activeFolder ? folders.find(f => f.id === activeFolder)?.name || 'Notes' : 'All Notes'}</h2>
          <button className="btn-icon" onClick={handleNewNote} title="New note (Ctrl+N)">
            <Plus size={16} />
          </button>
        </div>
        <div className="notes-list-body">
          {filteredNotes.length === 0 ? (
            <div className="empty-state" style={{ height: 'auto', padding: 24 }}>
              <p style={{ fontSize: 13 }}>No notes yet</p>
              <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={handleNewNote}>
                <Plus size={13} /> New Note
              </button>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-card ${activeNote?.id === note.id ? 'active' : ''}`}
                onClick={() => setActiveNote(note)}
              >
                <div className="note-card-title">{note.title || 'Untitled'}</div>
                <div className="note-card-preview">{stripHtml(note.content).slice(0, 60) || 'No content'}</div>
                <div className="note-card-meta">
                  <span className="badge">{format(note.updatedAt, 'MMM d')}</span>
                  {note.tags?.slice(0,2).map(tag => (
                    <span key={tag} className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                      #{tag}
                    </span>
                  ))}
                  <button
                    className="btn-icon"
                    style={{ marginLeft: 'auto', width: 22, height: 22 }}
                    onClick={e => handleDelete(e, note.id)}
                    title="Delete note"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="editor-area">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={notes.find(n => n.id === activeNote.id) || activeNote}
            onUpdate={updateNote}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✦</div>
            <h3>Select a note to edit</h3>
            <p>Or create a new one with the + button</p>
          </div>
        )}
      </div>
    </div>
  );
}
