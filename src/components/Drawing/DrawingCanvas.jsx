// DrawingCanvas.jsx — Canvas drawing with pen, eraser, colors
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Save, Minus, Circle } from 'lucide-react';

const COLORS = ['#1a1714','#6366f1','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#ffffff'];
const SIZES  = [2, 5, 10, 20];

export default function DrawingCanvas({ onSave, onClose }) {
  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef(null);

  const [tool,  setTool]  = useState('pen');  // pen | eraser
  const [color, setColor] = useState('#1a1714');
  const [size,  setSize]  = useState(5);

  // Resize canvas to its container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || 700;
    canvas.height = canvas.offsetHeight || 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth  = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap    = 'round';
    ctx.lineJoin   = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.stroke();

    lastPos.current = pos;
  }

  function stopDraw() { isDrawing.current = false; }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function handleSave() {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  }

  return (
    <div className="drawing-block">
      {/* Toolbar */}
      <div className="drawing-toolbar">
        {/* Tool buttons */}
        <button
          className="btn"
          style={{
            padding: '4px 10px', fontSize: 12,
            background: tool === 'pen' ? 'var(--accent)' : 'var(--bg-surface)',
            color: tool === 'pen' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
          onClick={() => setTool('pen')}
        >✏️ Pen</button>
        <button
          className="btn"
          style={{
            padding: '4px 10px', fontSize: 12,
            background: tool === 'eraser' ? 'var(--accent)' : 'var(--bg-surface)',
            color: tool === 'eraser' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
          onClick={() => setTool('eraser')}
        >⬜ Eraser</button>

        {/* Size */}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:6 }}>
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              style={{
                width: Math.max(s * 2 + 6, 18), height: Math.max(s * 2 + 6, 18),
                borderRadius: '50%',
                background: size === s ? 'var(--accent)' : 'var(--bg-surface)',
                border: `1.5px solid ${size === s ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >
              <div style={{ width: s, height: s, borderRadius:'50%', background: size === s ? '#fff' : 'var(--text-muted)' }} />
            </button>
          ))}
        </div>

        {/* Colors */}
        <div style={{ display:'flex', gap:4, marginLeft:6, flexWrap:'wrap' }}>
          {COLORS.map(c => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c, border: c === '#ffffff' ? '1.5px solid var(--border)' : undefined }}
              onClick={() => { setColor(c); setTool('pen'); }}
            />
          ))}
        </div>

        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <button className="btn btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={clearCanvas}>Clear</button>
          <button className="btn btn-primary" style={{ padding:'4px 10px', fontSize:12 }} onClick={handleSave}>
            <Save size={12} /> Save
          </button>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={{ width: '100%', height: 300, display: 'block' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  );
}
