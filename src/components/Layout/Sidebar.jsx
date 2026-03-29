// Sidebar.jsx — Navigation sidebar with folders
import React, { useState } from 'react';
import { useApp } from '../../App.jsx';
import {
  FileText, CheckSquare, Calendar, Clock, Moon, Sun,
  Plus, Folder, Trash2, Edit2, Search, X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'notes',    label: 'Notes',    Icon: FileText  },
  { id: 'tasks',    label: 'Tasks',    Icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', Icon: Calendar  },
  { id: 'timer',    label: 'Timer',    Icon: Clock     },
];

const FOLDER_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

export default function Sidebar() {
  const {
    view, setView, folders, activeFolder, setActiveFolder,
    createFolder, deleteFolder, updateFolder,
    settings, updateSettings, notes, setSearchOpen,
  } = useApp();

  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName]  = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [tempName, setTempName] = useState('');

  function handleCreateFolder() {
    if (!tempName.trim()) return;
    createFolder(tempName.trim());
    setTempName('');
    setCreatingFolder(false);
  }

  function handleFolderClick(folderId) {
    setActiveFolder(folderId === activeFolder ? null : folderId);
    setView('notes');
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✦</div>
        <span className="sidebar-logo-text">NoteFlow</span>
      </div>

      {/* Search shortcut */}
      <div style={{ padding: '10px 8px 4px' }}>
        <button
          className="sidebar-nav-item"
          style={{ width:'100%', opacity: 0.7 }}
          onClick={() => setSearchOpen(true)}
        >
          <Search size={15} className="nav-icon" />
          <span>Search</span>
          <span style={{ marginLeft:'auto', fontSize:'10px', opacity:0.5, fontFamily:'var(--font-mono)' }}>⌃F</span>
        </button>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sidebar-nav-item ${view === id ? 'active' : ''}`}
            onClick={() => setView(id)}
          >
            <Icon size={15} className="nav-icon" />
            <span>{label}</span>
            {id === 'notes' && (
              <span style={{
                marginLeft: 'auto', fontSize: '11px', background: 'rgba(255,255,255,0.08)',
                padding: '1px 6px', borderRadius: '99px', color: '#a09b96'
              }}>
                {notes.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Folders */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-section-title" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight: 8 }}>
          <span>Folders</span>
          <button
            className="btn-icon"
            style={{ width: 20, height: 20, color: '#4a4844' }}
            onClick={() => setCreatingFolder(true)}
            title="New folder"
          >
            <Plus size={12} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '2px 8px 8px' }}>
          {creatingFolder && (
            <div style={{ padding: '4px 10px 8px' }}>
              <input
                autoFocus
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') { setCreatingFolder(false); setTempName(''); }
                }}
                onBlur={handleCreateFolder}
                placeholder="Folder name..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4, padding: '5px 8px', color: '#f0ede8', fontSize: 13,
                  outline: 'none', fontFamily: 'var(--font-sans)'
                }}
              />
            </div>
          )}

          {folders.map(folder => {
            const noteCount = notes.filter(n => n.folderId === folder.id).length;
            return (
              <div key={folder.id} className="relative">
                {editingFolder === folder.id ? (
                  <input
                    autoFocus
                    defaultValue={folder.name}
                    onBlur={e => { updateFolder(folder.id, { name: e.target.value }); setEditingFolder(null); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        updateFolder(folder.id, { name: e.target.value });
                        setEditingFolder(null);
                      }
                    }}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4, padding: '5px 8px', color: '#f0ede8', fontSize: 13,
                      outline: 'none', fontFamily: 'var(--font-sans)', margin: '2px 0'
                    }}
                  />
                ) : (
                  <button
                    className={`sidebar-folder-item ${activeFolder === folder.id ? 'active' : ''}`}
                    onClick={() => handleFolderClick(folder.id)}
                    onDoubleClick={() => setEditingFolder(folder.id)}
                  >
                    <div className="folder-dot" style={{ background: folder.color }} />
                    <span className="truncate flex-1">{folder.name}</span>
                    <span style={{ fontSize: 11, opacity: 0.4, flexShrink: 0 }}>{noteCount}</span>
                    {folder.id !== 'default' && folder.id !== 'work' && (
                      <button
                        className="btn-icon"
                        style={{ width: 18, height: 18, opacity: 0, transition: 'opacity 0.15s' }}
                        onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Dark mode toggle */}
      <div className="sidebar-bottom">
        <button
          className="btn-icon"
          style={{ color: '#a09b96' }}
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          title="Toggle dark mode"
        >
          {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span style={{ fontSize: 12, color: '#4a4844' }}>
          {settings.darkMode ? 'Light mode' : 'Dark mode'}
        </span>
      </div>
    </aside>
  );
}
