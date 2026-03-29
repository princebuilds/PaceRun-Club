// TopBar.jsx — Topbar with breadcrumb and actions
import React from 'react';
import { useApp } from '../../App.jsx';
import { Search, Download } from 'lucide-react';
import { exportNoteAsPDF, exportNoteAsMarkdown } from '../../utils/export.js';

export default function TopBar() {
  const { view, activeFolder, activeNote, folders, setSearchOpen } = useApp();

  const folder = folders.find(f => f.id === activeFolder);

  const breadcrumb = () => {
    if (view === 'tasks')    return 'Tasks';
    if (view === 'calendar') return 'Calendar';
    if (view === 'timer')    return 'Timer';
    if (folder) return `Notes / ${folder.name}`;
    return 'Notes';
  };

  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        <span>{breadcrumb()}</span>
      </div>
      <div className="topbar-actions">
        <button
          className="btn btn-ghost"
          style={{ padding: '6px 10px', fontSize: 13 }}
          onClick={() => setSearchOpen(true)}
          title="Search (Ctrl+F)"
        >
          <Search size={14} /> Search
        </button>
        {activeNote && view === 'notes' && (
          <div className="relative" style={{ display:'flex', gap:4 }}>
            <button
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: 13 }}
              onClick={() => exportNoteAsPDF(activeNote)}
              title="Export as PDF"
            >
              <Download size={14} /> PDF
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: 13 }}
              onClick={() => exportNoteAsMarkdown(activeNote)}
              title="Export as Markdown"
            >
              <Download size={14} /> MD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
