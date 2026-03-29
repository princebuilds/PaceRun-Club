// TimerPage.jsx — Stopwatch + countdown timer
import React, { useState, useEffect, useRef } from 'react';

export default function TimerPage() {
  const [tab, setTab] = useState('stopwatch');  // stopwatch | countdown

  return (
    <div className="timer-page">
      <h1>Timer</h1>

      <div className="timer-tabs">
        <button className={`timer-tab ${tab === 'stopwatch' ? 'active' : ''}`} onClick={() => setTab('stopwatch')}>
          ⏱ Stopwatch
        </button>
        <button className={`timer-tab ${tab === 'countdown' ? 'active' : ''}`} onClick={() => setTab('countdown')}>
          ⏳ Countdown
        </button>
      </div>

      {tab === 'stopwatch' ? <Stopwatch /> : <Countdown />}
    </div>
  );
}

/* ── Stopwatch ─────────────────────────────────────────── */
function Stopwatch() {
  const [running, setRunning]   = useState(false);
  const [elapsed, setElapsed]   = useState(0);  // ms
  const [laps, setLaps]         = useState([]);
  const startTime               = useRef(null);
  const rafRef                  = useRef(null);

  function tick() {
    setElapsed(Date.now() - startTime.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    startTime.current = Date.now() - elapsed;
    rafRef.current = requestAnimationFrame(tick);
    setRunning(true);
  }

  function pause() {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  }

  function lap() {
    setLaps(prev => [...prev, elapsed]);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const { h, m, s, ms } = splitTime(elapsed);

  return (
    <>
      <div className="timer-display">
        {h > 0 && <span>{pad(h)}:</span>}
        <span>{pad(m)}:{pad(s)}</span>
        <span className="ms">.{padMs(ms)}</span>
      </div>

      <div className="timer-controls">
        {!running ? (
          <button className="timer-btn start" onClick={start}>
            {elapsed === 0 ? '▶ Start' : '▶ Resume'}
          </button>
        ) : (
          <button className="timer-btn" onClick={pause}>⏸ Pause</button>
        )}
        {running && (
          <button className="timer-btn" onClick={lap}>🔵 Lap</button>
        )}
        <button className="timer-btn" onClick={reset} disabled={elapsed === 0 && !running}>↺ Reset</button>
      </div>

      {laps.length > 0 && (
        <div style={{ marginTop:24, width:'100%', maxWidth:360 }}>
          <div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.6px', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>LAPS</div>
          {laps.map((l, i) => {
            const { m:lm, s:ls, ms:lms } = splitTime(l);
            const diff = i === 0 ? l : l - laps[i-1];
            const { m:dm, s:ds, ms:dms } = splitTime(diff);
            return (
              <div key={i} style={{
                display:'flex', justifyContent:'space-between',
                padding:'8px 0', borderBottom:'1px solid var(--border)',
                fontSize:13, fontFamily:'var(--font-mono)',
              }}>
                <span style={{ color:'var(--text-muted)' }}>Lap {i+1}</span>
                <span style={{ color:'var(--text-secondary)' }}>+{pad(dm)}:{pad(ds)}.{padMs(dms)}</span>
                <span>{pad(lm)}:{pad(ls)}.{padMs(lms)}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ── Countdown ─────────────────────────────────────────── */
function Countdown() {
  const [hours,   setHours]   = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(null);  // ms or null
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const endTime = useRef(null);
  const rafRef  = useRef(null);

  function getTotalMs() {
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  function tick() {
    const left = endTime.current - Date.now();
    if (left <= 0) {
      setRemaining(0);
      setRunning(false);
      setDone(true);
      return;
    }
    setRemaining(left);
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    const total = remaining !== null ? remaining : getTotalMs();
    if (total <= 0) return;
    endTime.current = Date.now() + total;
    rafRef.current = requestAnimationFrame(tick);
    setRunning(true);
    setDone(false);
  }

  function pause() {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setRemaining(null);
    setDone(false);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const display = remaining !== null ? remaining : getTotalMs();
  const { h, m, s, ms } = splitTime(display);

  return (
    <>
      {!running && remaining === null && (
        <div className="countdown-input-row">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <input type="number" min={0} max={99} value={hours} onChange={e => setHours(+e.target.value)} />
            <span>h</span>
          </div>
          <span style={{ fontSize:24, color:'var(--text-muted)', alignSelf:'flex-start', marginTop:8 }}>:</span>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(+e.target.value)} />
            <span>m</span>
          </div>
          <span style={{ fontSize:24, color:'var(--text-muted)', alignSelf:'flex-start', marginTop:8 }}>:</span>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <input type="number" min={0} max={59} value={seconds} onChange={e => setSeconds(+e.target.value)} />
            <span>s</span>
          </div>
        </div>
      )}

      <div className="timer-display" style={{ color: done ? 'var(--red)' : remaining !== null && remaining < 10000 ? 'var(--amber)' : undefined }}>
        {h > 0 && <span>{pad(h)}:</span>}
        <span>{pad(m)}:{pad(s)}</span>
        <span className="ms">.{padMs(ms)}</span>
      </div>

      {done && <div style={{ color:'var(--red)', fontWeight:600, marginBottom:12 }}>⏰ Time's up!</div>}

      {/* Progress bar for countdown */}
      {remaining !== null && getTotalMs() > 0 && (
        <div style={{ width:300, marginBottom:16 }}>
          <div className="progress-bar" style={{ height:8 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.max(0, (remaining / (getTotalMs() || 1)) * 100)}%`,
                background: done ? 'var(--red)' : remaining < 10000 ? 'var(--amber)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      )}

      <div className="timer-controls">
        {!running ? (
          <button className="timer-btn start" onClick={start} disabled={getTotalMs() === 0 && remaining === null}>
            {remaining !== null ? '▶ Resume' : '▶ Start'}
          </button>
        ) : (
          <button className="timer-btn" onClick={pause}>⏸ Pause</button>
        )}
        <button className="timer-btn" onClick={reset}>↺ Reset</button>
      </div>
    </>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function splitTime(ms) {
  const total = Math.max(0, ms);
  const h  = Math.floor(total / 3600000);
  const m  = Math.floor((total % 3600000) / 60000);
  const s  = Math.floor((total % 60000) / 1000);
  const ms2= total % 1000;
  return { h, m, s, ms: ms2 };
}
function pad(n)   { return String(n).padStart(2, '0'); }
function padMs(n) { return String(Math.floor(n / 10)).padStart(2, '0'); }
