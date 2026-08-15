import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryMedium,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Flag,
  History,
  Languages,
  MapPin,
  Mic2,
  Moon,
  Navigation,
  PhoneCall,
  Play,
  Route,
  Settings,
  Shield,
  Square,
  Target,
  Trophy,
  UserPlus,
  Users,
  Volume2,
  WifiOff,
  Zap,
} from 'lucide-react';

const goals = [
  { id: '1600m', label: '1600 m', distance: 1.6, passPace: 5.5, note: 'Police / army test' },
  { id: '3k', label: '3 km', distance: 3, passPace: 6.25, note: 'Ground endurance' },
  { id: '5k', label: '5 km', distance: 5, passPace: 7.25, note: 'Highway practice' },
  { id: '10k', label: '10 km', distance: 10, passPace: 8.1, note: 'Long run base' },
];

const demoPoints = [
  { lat: 28.6129, lng: 77.2295 },
  { lat: 28.6134, lng: 77.2312 },
  { lat: 28.6141, lng: 77.2333 },
  { lat: 28.6135, lng: 77.2356 },
  { lat: 28.6121, lng: 77.2368 },
  { lat: 28.6112, lng: 77.2351 },
  { lat: 28.6108, lng: 77.2328 },
  { lat: 28.6117, lng: 77.2305 },
];

const seedRuns = [
  { id: 1, date: 'Today', distance: 4.82, time: 1684, pace: 5.82, speed: 10.3, result: 'Strong finish', goal: '5 km', community: 'Highway Circle' },
  { id: 2, date: 'Yesterday', distance: 1.62, time: 503, pace: 5.18, speed: 11.6, result: 'Physical test pass', goal: '1600 m', community: 'Police Ground Batch' },
  { id: 3, date: '12 Aug', distance: 7.1, time: 2865, pace: 6.72, speed: 8.9, result: 'Highway endurance', goal: '10 km', community: 'Canal Road Runners' },
];

const communities = [
  { name: 'Canal Road Runners', area: 'Near canal road', distance: '1.2 km away', members: 38, time: '5:30 AM', route: '3 km easy group run' },
  { name: 'Police Ground Batch', area: 'Govt school ground', distance: '2.4 km away', members: 64, time: '6:00 PM', route: '1600 m mock test' },
  { name: 'Highway Safety Circle', area: 'Main highway service lane', distance: '4.1 km away', members: 27, time: '5:15 AM', route: '5 km supervised road run' },
];

const members = [
  { name: 'Amit', event: '1600 m', pace: 5.18, status: 'Training now' },
  { name: 'Pooja', event: '5 km', pace: 6.02, status: 'Synced 12 min ago' },
  { name: 'Ravi', event: '3 km', pace: 5.74, status: 'Evening road run' },
  { name: 'Neha', event: 'Army test', pace: 6.28, status: 'Coach approved' },
];

function loadRuns() {
  try {
    const stored = localStorage.getItem('runcred-history');
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : seedRuns;
  } catch {
    localStorage.removeItem('runcred-history');
    return seedRuns;
  }
}

function haversine(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPace(pace) {
  if (!Number.isFinite(pace) || pace <= 0) return '--';
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function speak(message, enabled) {
  if (!enabled || !('speechSynthesis' in window)) return;
  const voice = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voice);
}

function BrandMark() {
  return <div className="brand-mark"><span>R</span></div>;
}

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <article className="stat-card">
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

function RouteMap({ points, active }) {
  const routePath = useMemo(() => {
    const source = points.length ? points : demoPoints.slice(0, 5);
    const minLat = Math.min(...source.map((point) => point.lat));
    const maxLat = Math.max(...source.map((point) => point.lat));
    const minLng = Math.min(...source.map((point) => point.lng));
    const maxLng = Math.max(...source.map((point) => point.lng));
    const width = Math.max(maxLng - minLng, 0.0008);
    const height = Math.max(maxLat - minLat, 0.0008);
    return source.map((point, index) => {
      const x = 34 + ((point.lng - minLng) / width) * 248;
      const y = 190 - ((point.lat - minLat) / height) * 150;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [points]);

  return (
    <section className="route-panel">
      <div className="map-label"><MapPin size={14} /> trusted route proof</div>
      <svg viewBox="0 0 320 220" aria-label="Route map">
        <path className="map-road" d="M 0 146 C 72 110 130 138 181 90 C 226 48 262 70 320 36" />
        <path className="map-road muted" d="M 28 220 C 62 174 96 158 144 143 C 205 124 232 96 278 0" />
        <path className="map-route" d={routePath} />
        <circle className="start-dot" cx="34" cy="190" r="7" />
        <g className={active ? 'runner-dot active' : 'runner-dot'}>
          <circle cx="258" cy="72" r="12" />
          <Navigation x="250" y="64" size="16" />
        </g>
      </svg>
    </section>
  );
}

function App() {
  const [tab, setTab] = useState('run');
  const [selectedGoal, setSelectedGoal] = useState(goals[0]);
  const [customGoal, setCustomGoal] = useState(2.4);
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [points, setPoints] = useState([]);
  const [runs, setRuns] = useState(loadRuns);
  const [community, setCommunity] = useState('Highway Circle');
  const [areaStatus, setAreaStatus] = useState('tap near me to find runners around your location');
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [batterySaver, setBatterySaver] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [liveShare, setLiveShare] = useState(true);
  const [language, setLanguage] = useState('English');
  const trackerRef = useRef(null);
  const demoIndexRef = useRef(0);
  const lastVoiceKmRef = useRef(0);

  const goalDistance = selectedGoal.id === 'custom' ? Number(customGoal) || 1 : selectedGoal.distance;
  const distance = useMemo(() => points.reduce((sum, point, index) => index ? sum + haversine(points[index - 1], point) : 0, 0), [points]);
  const pace = distance > 0 ? elapsed / 60 / distance : 0;
  const speed = elapsed > 0 ? distance / (elapsed / 3600) : 0;
  const progress = Math.min(100, (distance / goalDistance) * 100 || 0);

  useEffect(() => {
    localStorage.setItem('runcred-history', JSON.stringify(runs));
  }, [runs]);

  useEffect(() => {
    if (!isTracking || countdown > 0) return undefined;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [isTracking, countdown]);

  useEffect(() => {
    if (!countdown) return undefined;
    const id = setInterval(() => setCountdown((value) => value - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  useEffect(() => {
    if (!isTracking || countdown > 0) return;
    const doneKm = Math.floor(distance);
    if (doneKm > lastVoiceKmRef.current) {
      lastVoiceKmRef.current = doneKm;
      speak(`${doneKm} kilometer complete`, voiceAlerts);
    }
  }, [distance, isTracking, countdown, voiceAlerts]);

  const pushPoint = (point) => setPoints((current) => [...current, { ...point, at: Date.now() }]);

  const startDemo = () => {
    pushPoint(demoPoints[0]);
    trackerRef.current = { type: 'demo', id: window.setInterval(() => {
      demoIndexRef.current = (demoIndexRef.current + 1) % demoPoints.length;
      const point = demoPoints[demoIndexRef.current];
      pushPoint({ lat: point.lat + demoIndexRef.current * 0.00008, lng: point.lng + demoIndexRef.current * 0.00005 });
    }, batterySaver ? 2400 : 1400) };
  };

  const startRun = () => {
    setElapsed(0);
    setPoints([]);
    setCountdown(3);
    setIsTracking(true);
    lastVoiceKmRef.current = 0;
    speak('Run starts in 3 seconds', voiceAlerts);

    window.setTimeout(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            pushPoint({ lat: position.coords.latitude, lng: position.coords.longitude });
            trackerRef.current = { type: 'gps', id: navigator.geolocation.watchPosition(
              (update) => pushPoint({ lat: update.coords.latitude, lng: update.coords.longitude }),
              () => startDemo(),
              { enableHighAccuracy: !batterySaver, maximumAge: batterySaver ? 8000 : 1000, timeout: 9000 }
            ) };
          },
          () => startDemo(),
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        startDemo();
      }
    }, 3000);
  };

  const stopRun = () => {
    if (trackerRef.current?.type === 'demo') window.clearInterval(trackerRef.current.id);
    if (trackerRef.current?.type === 'gps') navigator.geolocation.clearWatch(trackerRef.current.id);
    trackerRef.current = null;
    setIsTracking(false);
    setCountdown(0);
    const result = {
      id: Date.now(),
      date: 'Just now',
      distance: Number(distance.toFixed(2)),
      time: elapsed,
      pace: Number((pace || 0).toFixed(2)),
      speed: Number((speed || 0).toFixed(1)),
      result: distance >= goalDistance ? 'Goal complete' : 'Training saved',
      goal: selectedGoal.label,
      community,
    };
    setRuns((current) => [result, ...current]);
    setTab('history');
  };

  const findNearMe = () => {
    setAreaStatus('searching nearby running communities...');
    if (!('geolocation' in navigator)) {
      setAreaStatus('GPS unavailable. Showing sample communities.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setAreaStatus('nearby communities found. choose a group and run together.'),
      () => setAreaStatus('location permission not allowed. showing sample communities.')
    );
  };

  const nav = [
    { id: 'run', label: 'run', icon: Play },
    { id: 'area', label: 'area', icon: MapPin },
    { id: 'goals', label: 'goals', icon: Target },
    { id: 'history', label: 'proof', icon: History },
    { id: 'settings', label: 'more', icon: Settings },
  ];

  return (
    <div className={nightMode ? 'app night' : 'app'}>
      <header className="topbar">
        <div className="brand"><BrandMark /><strong>RUNCRED</strong></div>
        <button className="top-card" onClick={() => setLiveShare((value) => !value)}>
          <span>AREA RUN CARD</span>
          <i />
        </button>
      </header>

      <main>
        {tab === 'run' && (
          <section className="screen run-screen">
            <section className="hero">
              <div className="city-lines" />
              <div className="hero-copy">
                <p>members-only running club</p>
                <h1>crafted for the committed runner</h1>
                <span>GPS route proof, trusted local runs, and physical-test preparation from only your mobile phone.</span>
              </div>
              <div className="hero-card"><strong>{community}</strong><small>{liveShare ? 'trusted live share on' : 'private run'}</small></div>
            </section>

            <div className="pill-row">
              <span><MapPin size={14} /> GPS starts only on tap</span>
              <span><BatteryMedium size={14} /> {batterySaver ? 'battery saver' : 'high accuracy'}</span>
              <span><WifiOff size={14} /> offline route recording</span>
            </div>

            <RouteMap points={points} active={isTracking && countdown === 0} />
            {countdown > 0 && <div className="countdown">{countdown}</div>}

            <div className="stats-grid">
              <Stat icon={Route} label="distance" value={`${distance.toFixed(2)} km`} hint={`${Math.round(progress)}% goal`} />
              <Stat icon={Clock} label="time" value={formatTime(elapsed)} hint="live timer" />
              <Stat icon={Activity} label="pace" value={`${formatPace(pace)} /km`} hint="average" />
              <Stat icon={Zap} label="speed" value={`${speed.toFixed(1)} km/h`} hint="current" />
            </div>

            <section className="progress-card">
              <div><span>active target</span><strong>{selectedGoal.label}</strong></div>
              <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            </section>

            <div className="actions">
              {!isTracking ? <button className="primary" onClick={startRun}><Play size={24} fill="currentColor" /> Start run</button> : <button className="danger" onClick={stopRun}><Square size={22} fill="currentColor" /> Stop & save</button>}
              <button className="sos"><PhoneCall size={20} /> SOS</button>
            </div>
          </section>
        )}

        {tab === 'area' && (
          <section className="screen">
            <div className="section-title"><p>near me</p><h2>trusted runners in your area</h2><span>{areaStatus}</span></div>
            <button className="wide-button" onClick={findNearMe}><MapPin size={18} /> Find runners near me</button>
            <div className="card-grid">
              {communities.map((item) => (
                <article className="community-card" key={item.name}>
                  <div><strong>{item.name}</strong><span>{item.area} - {item.distance}</span></div>
                  <div className="mini-tags"><span><Users size={13} /> {item.members}</span><span><CalendarDays size={13} /> {item.time}</span><span><Route size={13} /> {item.route}</span></div>
                  <button onClick={() => setCommunity(item.name)}>{community === item.name ? 'Joined' : 'Join area'}</button>
                </article>
              ))}
            </div>
            <div className="section-title small"><h2>{community} ranking</h2></div>
            {members.map((member, index) => <article className="rank-row" key={member.name}><b>#{index + 1}</b><div><strong>{member.name}</strong><span>{member.event} - {member.status}</span></div><em>{formatPace(member.pace)}/km</em></article>)}
          </section>
        )}

        {tab === 'goals' && (
          <section className="screen">
            <div className="section-title"><p>training pass</p><h2>physical test mode</h2><span>Choose a distance and get live progress, route proof, and final result.</span></div>
            <div className="card-grid">
              {goals.map((goal) => <button className={selectedGoal.id === goal.id ? 'goal-card active' : 'goal-card'} key={goal.id} onClick={() => setSelectedGoal(goal)}><Flag size={22} /><div><strong>{goal.label}</strong><span>{goal.note}</span></div></button>)}
              <button className={selectedGoal.id === 'custom' ? 'goal-card active' : 'goal-card'} onClick={() => setSelectedGoal({ id: 'custom', label: `${customGoal} km`, distance: Number(customGoal), passPace: 99 })}><Target size={22} /><div><strong>custom route</strong><span>village, canal, ground, or highway</span></div><input value={customGoal} type="number" min="0.4" step="0.1" onChange={(event) => setCustomGoal(event.target.value)} /></button>
            </div>
          </section>
        )}

        {tab === 'history' && (
          <section className="screen">
            <div className="section-title"><p>route proof</p><h2>verified run history</h2><span>Saved run proof for athletes, coaches, and local communities.</span></div>
            {runs.map((run) => <article className="history-card" key={run.id}><div><strong>{run.goal}</strong><span>{run.date} - {run.result} - {run.community}</span></div><div className="mini-tags"><span>{run.distance} km</span><span>{formatTime(run.time)}</span><span>{formatPace(run.pace)}/km</span></div></article>)}
            <section className="success-card"><CheckCircle2 size={34} /><h2>premium result cards</h2><p>Create shareable proof with route, distance, time, pace, and local ranking.</p></section>
          </section>
        )}

        {tab === 'settings' && (
          <section className="screen">
            <div className="section-title"><p>control room</p><h2>privacy-first settings</h2><span>No silent tracking. GPS runs only after Start and stops on Stop.</span></div>
            <div className="settings-list">
              <label><span><Mic2 size={19} /> Voice alerts</span><input type="checkbox" checked={voiceAlerts} onChange={(event) => setVoiceAlerts(event.target.checked)} /></label>
              <label><span><BatteryMedium size={19} /> Low battery mode</span><input type="checkbox" checked={batterySaver} onChange={(event) => setBatterySaver(event.target.checked)} /></label>
              <label><span><Moon size={19} /> Night highway mode</span><input type="checkbox" checked={nightMode} onChange={(event) => setNightMode(event.target.checked)} /></label>
              <label><span><Shield size={19} /> Trusted live location</span><input type="checkbox" checked={liveShare} onChange={(event) => setLiveShare(event.target.checked)} /></label>
              <label><span><Languages size={19} /> Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>Hindi</option></select></label>
            </div>
            <div className="warning"><AlertTriangle size={20} /> Location sharing works only during an active run and can be turned off anytime.</div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        {nav.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><Icon size={20} /><span>{item.label}</span></button>;
        })}
      </nav>
    </div>
  );
}

export default App;
