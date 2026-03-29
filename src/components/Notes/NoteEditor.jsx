// NoteEditor.jsx — Full-featured rich text editor
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pen, Image, X, Plus } from 'lucide-react';
import DrawingCanvas from '../Drawing/DrawingCanvas.jsx';

// Quill toolbar config
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header','bold','italic','underline','strike',
  'color','background',
  'list','bullet',
  'blockquote','code-block',
  'link',
];

export default function NoteEditor({ note, onUpdate }) {
  const [title, setTitle]       = useState(note.title || '');
  const [content, setContent]   = useState(note.content || '');
  const [tags, setTags]         = useState(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages]     = useState(note.images || []);
  const [drawings, setDrawings] = useState(note.drawings || []);
  const [showDrawing, setShowDrawing] = useState(false);

  const autoSaveTimer = useRef(null);
  const fileInputRef  = useRef(null);

  // Debounced auto-save
  const schedulesSave = useCallback((patch) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      onUpdate(note.id, patch);
    }, 600);
  }, [note.id, onUpdate]);

  useEffect(() => {
    schedulesSave({ title, content, tags, images, drawings });
  }, [title, content, tags, images, drawings]);

  // Ctrl+S immediate save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        onUpdate(note.id, { title, content, tags, images, drawings });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [title, content, tags, images, drawings, note.id, onUpdate]);

  // Paste image from clipboard
  useEffect(() => {
    const handler = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          readImageFile(file);
        }
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [images]);

  function readImageFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages(prev => [...prev, { id: Date.now(), src: ev.target.result, name: file.name }]);
    };
    reader.readAsDataURL(file);
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    files.forEach(readImageFile);
    e.target.value = '';
  }

  // Drag & drop
  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(readImageFile);
  }

  function addTag(value) {
    const tag = value.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  function removeImage(id) {
    setImages(prev => prev.filter(img => img.id !== id));
  }

  function saveDrawing(dataUrl) {
    setDrawings(prev => [...prev, { id: Date.now(), src: dataUrl }]);
    setShowDrawing(false);
  }

  return (
    <div
      className="flex flex-col h-full"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Title */}
      <div className="editor-header">
        <input
          className="editor-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Untitled Note"
        />
        <button
          className="btn-icon"
          onClick={() => fileInputRef.current?.click()}
          title="Upload image"
        >
          <Image size={16} />
        </button>
        <button
          className="btn-icon"
          onClick={() => setShowDrawing(v => !v)}
          title="Add drawing"
          style={{ color: showDrawing ? 'var(--accent)' : undefined }}
        >
          <Pen size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      {/* Tags */}
      <div className="tag-row">
        {tags.map(tag => (
          <span key={tag} className="tag-pill">
            #{tag}
            <button onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
        <input
          className="tag-input"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
            if (e.key === 'Backspace' && !tagInput && tags.length) removeTag(tags[tags.length - 1]);
          }}
          placeholder="Add tag..."
        />
      </div>

      {/* Editor */}
      <div className="editor-body flex-1">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          placeholder="Start writing..."
          style={{ height: 'calc(100% - 44px)' }}
        />
      </div>

      {/* Drawing canvas */}
      {showDrawing && (
        <DrawingCanvas
          onSave={saveDrawing}
          onClose={() => setShowDrawing(false)}
        />
      )}

      {/* Images */}
      {(images.length > 0 || drawings.length > 0) && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          maxHeight: 200,
          overflowY: 'auto',
        }}>
          {drawings.map(d => (
            <div key={d.id} className="relative" style={{ display: 'inline-block' }}>
              <img src={d.src} style={{ height: 100, borderRadius: 6, border: '1px solid var(--border)' }} alt="drawing" />
              <button
                className="btn-icon"
                style={{ position:'absolute', top:2, right:2, background:'rgba(0,0,0,0.5)', color:'#fff', width:18, height:18, borderRadius:'50%' }}
                onClick={() => setDrawings(prev => prev.filter(x => x.id !== d.id))}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {images.map(img => (
            <div key={img.id} className="relative" style={{ display: 'inline-block' }}>
              <img src={img.src} style={{ height: 100, borderRadius: 6, border: '1px solid var(--border)', maxWidth: 180, objectFit: 'cover' }} alt={img.name} />
              <button
                className="btn-icon"
                style={{ position:'absolute', top:2, right:2, background:'rgba(0,0,0,0.5)', color:'#fff', width:18, height:18, borderRadius:'50%' }}
                onClick={() => removeImage(img.id)}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
