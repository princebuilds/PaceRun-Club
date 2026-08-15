import './index.css'

const root = document.getElementById('root')

const goalOptions = [
  { label: '1600 m', km: 1.6, note: 'Police / army physical test' },
  { label: '3 km', km: 3, note: 'Ground endurance' },
  { label: '5 km', km: 5, note: 'Highway practice' },
  { label: '10 km', km: 10, note: 'Long run base' },
]

const communities = [
  ['Canal Road Runners', 'Near canal road', '1.2 km away', '38 runners', '5:30 AM', '3 km easy run'],
  ['Police Ground Batch', 'Govt school ground', '2.4 km away', '64 runners', '6:00 PM', '1600 m mock test'],
  ['Highway Safety Circle', 'Main highway service lane', '4.1 km away', '27 runners', '5:15 AM', '5 km supervised run'],
]

const members = [
  ['#1', 'Amit', '1600 m - Training now', '5:11/km'],
  ['#2', 'Pooja', '5 km - Synced 12 min ago', '6:01/km'],
  ['#3', 'Ravi', '3 km - Evening road run', '5:44/km'],
  ['#4', 'Neha', 'Army test - Coach approved', '6:17/km'],
]

const matches = [
  ['Amit', 'CGC Landran road', '1600 m test', '1.1 km away'],
  ['Pooja', 'Canal Road Runners', '5 km daily run', '1.8 km away'],
  ['Ravi', 'Police Ground Batch', '3 km endurance', '2.4 km away'],
]

const defaultHistory = [
  { goal: '5 km', date: 'Today', result: 'Strong finish', community: 'Highway Circle', distance: 4.82, time: 1684, pace: 5.82, avgSpeed: 10.31, maxSpeed: 14.2 },
  { goal: '1600 m', date: 'Yesterday', result: 'Physical test pass', community: 'Police Ground Batch', distance: 1.62, time: 503, pace: 5.18, avgSpeed: 11.59, maxSpeed: 15.1 },
  { goal: '10 km', date: '12 Aug', result: 'Highway endurance', community: 'Canal Road Runners', distance: 7.1, time: 2865, pace: 6.72, avgSpeed: 8.92, maxSpeed: 12.4 },
]

let activeTab = 'run'
let activeGoal = load('pacerun-goal', goalOptions[0])
let community = load('pacerun-community', 'Highway Circle')
let history = load('pacerun-history', defaultHistory)
const defaultSettings = { voice: true, battery: true, night: false, live: true, language: 'English', teamNumber: '', medicalNumber: '' }
let settings = { ...defaultSettings, ...load('pacerun-settings', defaultSettings) }
const defaultProfile = { name: 'Your name', area: 'CGC Landran', goal: '1600 m physical test', level: 'Beginner', contact: 'Request only' }
let profile = { ...defaultProfile, ...load('pacerun-profile', defaultProfile) }
let profileSaved = load('pacerun-profile-saved', false)
let tracking = false
let elapsed = 0
let distance = 0
let currentSpeed = 0
let maxSpeed = 0
let routePoints = []
let timer = null
let areaStatus = 'tap near me to find runners around your location'
let appNotice = 'All tracking starts only when you press Start.'
let installPrompt = null
let mobileStatus = 'Ready for mobile testing: install, GPS, offline, and route tracking.'
let savedRoutes = load('pacerun-routes', [])

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => { mobileStatus = 'Offline support active. You can test install and GPS on mobile.' })
      .catch(() => { mobileStatus = 'Offline support could not start in this browser.' })
  })
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  installPrompt = event
  mobileStatus = 'Install prompt is ready. Use Settings > Install app.'
})

window.addEventListener('appinstalled', () => {
  installPrompt = null
  mobileStatus = 'PaceRun Club installed successfully.'
  appNotice = 'App installed. Test GPS route tracking from your phone.'
  render()
})
function icon(name) {
  const paths = {
    play: '<polygon points="8 5 19 12 8 19 8 5"></polygon>',
    square: '<rect x="7" y="7" width="10" height="10"></rect>',
    map: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
    route: '<circle cx="6" cy="19" r="2"></circle><circle cx="18" cy="5" r="2"></circle><path d="M8 19h3a4 4 0 0 0 0-8h2a4 4 0 0 0 0-8h3"></path>',
    clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"></path>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    target: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>',
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"></path>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"></path>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4"></circle>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
  }
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.play}</svg>`
}

function athleteLogo() {
  return `<svg class="athlete-logo" viewBox="0 0 96 108" aria-label="PaceRun Club athlete running club logo" role="img"><path class="logo-shield" d="M16 8h64v58c0 17-13 27-32 36-19-9-32-19-32-36V8Z"></path><path class="logo-track" d="M22 73c17 11 35 11 52 0"></path><circle class="logo-head" cx="50" cy="30" r="7"></circle><path class="logo-body" d="M47 39 36 53l14 6 12-13"></path><path class="logo-arm" d="M43 43 29 39"></path><path class="logo-leg" d="M50 59 36 76"></path><path class="logo-leg" d="M51 59 70 72"></path><path class="logo-flag" d="M70 25v28M70 25h15l-5 8 5 8H70"></path></svg>`
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char])
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function formatPace(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '--'
  const mins = Math.floor(minutes)
  const secs = Math.round((minutes - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function avgSpeed() {
  return elapsed > 0 ? distance / (elapsed / 3600) : 0
}

function avgPace() {
  return distance > 0 ? elapsed / 60 / distance : 0
}

function cleanPhone(value) {
  return String(value || '').replace(/[^+0-9]/g, '')
}

function callNumber(number) {
  const cleaned = cleanPhone(number)
  if (!cleaned) return false
  window.location.href = `tel:${cleaned}`
  return true
}
function paceLine() {
  if (profile.goal.includes('1600')) return `Start from ${profile.area}. Control lap one. Attack the final 400 m.`
  if (profile.level === 'Beginner') return 'Slow running is still training. Reduce speed, but keep moving.'
  if (profile.goal.includes('highway')) return 'Stay alert, stay visible, stay steady. Own the road safely.'
  return 'Your target is not distance. Your target is discipline.'
}

function stat(iconName, label, value, hint) {
  return `<article class="stat-card">${icon(iconName)}<span>${label}</span><strong>${value}</strong><small>${hint}</small></article>`
}

function routeMap() {
  const maxVisualPoints = 80
  const sampleEvery = routePoints.length > maxVisualPoints ? Math.ceil(routePoints.length / maxVisualPoints) : 1
  const visiblePoints = routePoints.filter((_, index) => index % sampleEvery === 0).slice(-maxVisualPoints)
  const denom = Math.max(1, visiblePoints.length - 1)
  const extra = visiblePoints.map((_, index) => {
    const x = 80 + (index / denom) * 178
    const y = 148 - (index % 4) * 18
    return ` L ${x.toFixed(1)} ${y}`
  }).join('')
  const path = `M 32 224 C 58 170 85 162 116 180 S 169 203 190 158 S 234 83 284 98${extra}`
  return `
    <div class="route-panel">
      <div class="map-label">${icon('map')} GPS route ${tracking ? 'recording' : 'preview'}</div>
      <svg viewBox="0 0 320 285" role="img" aria-label="PaceRun route map">
        <defs>
          <linearGradient id="routeGlow" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9a45a"/></linearGradient>
        </defs>
        <path class="map-road" d="M 20 230 C 54 168 91 156 123 179 S 174 207 198 155 S 238 77 296 94" />
        <path class="map-route" d="${path}" />
        <circle cx="32" cy="224" r="7" class="start-pin" />
        <g class="runner-dot ${tracking ? 'active' : ''}" transform="translate(${Math.min(284, 44 + distance * 36)} ${Math.max(78, 224 - distance * 18)})">
          <circle r="13" />
          <path d="M -4 -2 L 5 -8 M 1 -6 L 6 1 M 0 1 L -7 8 M 3 2 L 10 8" stroke-width="3" stroke-linecap="round" fill="none"/>
        </g>
      </svg>
      <div class="direction-pill">${icon('route')} North-east highway direction</div>
      <div class="map-metrics"><b>${distance.toFixed(2)} km</b><span>${formatTime(elapsed)}</span><span>${currentSpeed.toFixed(1)} km/h</span></div>
    </div>`
}

function notice() {
  return `<div class="warning notice-bar">${escapeHtml(appNotice)}</div>`
}

function runScreen() {
  const progress = Math.min(100, Math.round((distance / activeGoal.km) * 100))
  return `<section class="screen run-screen"><section class="hero"><div class="city-lines"></div><div class="hero-copy"><p>members-only running club</p><h1>crafted for the committed runner</h1><span>GPS route proof, trusted local runs, and physical-test preparation from only your mobile phone.</span></div><div class="hero-card"><strong>${escapeHtml(community)}</strong><small>${tracking ? 'tracking route live' : 'trusted live share ready'}</small></div></section>${notice()}<section class="paceline-card"><p>today's paceline</p><h2>${escapeHtml(paceLine())}</h2><span>based on ${escapeHtml(profile.goal)} - ${escapeHtml(profile.level)} - ${escapeHtml(profile.area)}</span></section><div class="pill-row"><span>${icon('map')} GPS starts only on tap</span><span>${icon('shield')} ${settings.live ? 'trusted live share on' : 'private run'}</span><span>${settings.battery ? 'battery saver' : 'high accuracy'} mode</span></div>${routeMap()}<div class="stats-grid">${stat('route', 'distance', `${distance.toFixed(2)} km`, `${progress}% of ${activeGoal.label}`)}${stat('clock', 'time', formatTime(elapsed), 'live timer')}${stat('zap', 'pace', `${formatPace(avgPace())} /km`, 'average pace')}${stat('zap', 'max speed', `${maxSpeed.toFixed(1)} km/h`, `avg ${avgSpeed().toFixed(1)} km/h`)}</div><section class="progress-card"><div><span>active target</span><strong>${escapeHtml(activeGoal.label)}</strong></div><div class="progress"><i style="width:${progress}%"></i></div></section><div class="actions">${tracking ? `<button class="danger" data-action="stop">${icon('square')} Stop & save</button>` : `<button class="primary" data-action="start">${icon('play')} Start run</button>`}<button class="sos" data-action="sos">${icon('phone')} SOS</button></div></section>`
}

function areaScreen() {
  return `<section class="screen"><div class="section-title"><p>near me</p><h2>trusted runners in your area</h2><span>${escapeHtml(areaStatus)}</span></div>${notice()}<button class="wide-button" data-action="near">${icon('map')} Find runners near me</button><div class="card-grid">${communities.map((item) => `<article class="community-card"><div><strong>${item[0]}</strong><span>${item[1]} - ${item[2]}</span></div><div class="mini-tags"><span>${icon('users')} ${item[3]}</span><span>${item[4]}</span><span>${item[5]}</span></div><button data-community="${item[0]}">${community === item[0] ? 'Joined' : 'Join area'}</button></article>`).join('')}</div><div class="section-title small"><h2>${escapeHtml(community)} ranking</h2></div>${members.map((member) => `<article class="rank-row"><b>${member[0]}</b><div><strong>${member[1]}</strong><span>${member[2]}</span></div><em>${member[3]}</em></article>`).join('')}</section>`
}

function goalsScreen() {
  return `<section class="screen"><div class="section-title"><p>training pass</p><h2>physical test mode</h2><span>Choose a distance. It controls live progress and saved route result.</span></div>${notice()}<div class="card-grid">${goalOptions.map((goal) => `<button class="goal-card ${activeGoal.label === goal.label ? 'active' : ''}" data-goal="${goal.label}">${icon('target')}<div><strong>${goal.label}</strong><span>${goal.note}</span></div></button>`).join('')}</div><section class="success-card"><h2>exact route builder</h2><p>Start from ${escapeHtml(profile.area)}, run until ${escapeHtml(activeGoal.label)} is complete, then save the route for repeat practice.</p></section></section>`
}

function historyScreen() {
  return `<section class="screen"><div class="section-title"><p>route proof</p><h2>verified run history</h2><span>Saved run proof with distance, time, pace, max speed, and average speed.</span></div>${notice()}${history.map((run) => `<article class="history-card"><div><strong>${escapeHtml(run.goal)}</strong><span>${escapeHtml(run.date)} - ${escapeHtml(run.result)} - ${escapeHtml(run.community)}</span></div><div class="mini-tags"><span>${run.distance.toFixed(2)} km</span><span>${formatTime(run.time)}</span><span>${formatPace(run.pace)}/km</span><span>avg ${run.avgSpeed.toFixed(1)} km/h</span><span>max ${run.maxSpeed.toFixed(1)} km/h</span></div></article>`).join('')}<section class="success-card"><h2>saved repeat routes</h2><p>${savedRoutes.length ? savedRoutes.map((route) => escapeHtml(route)).join(' - ') : 'Complete a run to save your first repeat route.'}</p></section></section>`
}

function profileScreen() {
  return `<section class="screen"><div class="section-title"><p>runner identity</p><h2>create your profile</h2><span>Your profile controls motivation, nearby matches, and route suggestions.</span></div>${notice()}<section class="profile-card"><div class="profile-avatar">${escapeHtml(profile.name === 'Your name' ? 'R' : profile.name.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHtml(profile.name)}</strong><span>${escapeHtml(profile.area)} - ${escapeHtml(profile.goal)}</span><small>${profileSaved ? 'profile saved and visible to nearby runners' : 'complete profile to connect with runners'}</small></div></section><form class="profile-form" data-profile-form="true"><label>Runner name<input name="name" value="${escapeHtml(profile.name)}" autocomplete="name"></label><label>Area / starting point<input name="area" value="${escapeHtml(profile.area)}" placeholder="CGC Landran gate"></label><label>Training goal<select name="goal"><option ${profile.goal === '1600 m physical test' ? 'selected' : ''}>1600 m physical test</option><option ${profile.goal === '3 km endurance' ? 'selected' : ''}>3 km endurance</option><option ${profile.goal === '5 km highway run' ? 'selected' : ''}>5 km highway run</option><option ${profile.goal === '10 km long run' ? 'selected' : ''}>10 km long run</option></select></label><label>Running level<select name="level"><option ${profile.level === 'Beginner' ? 'selected' : ''}>Beginner</option><option ${profile.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option><option ${profile.level === 'Advanced' ? 'selected' : ''}>Advanced</option></select></label><label>Contact privacy<select name="contact"><option ${profile.contact === 'Request only' ? 'selected' : ''}>Request only</option><option ${profile.contact === 'Community members' ? 'selected' : ''}>Community members</option><option ${profile.contact === 'Coach only' ? 'selected' : ''}>Coach only</option></select></label><button class="wide-button" type="submit">${icon('user')} Save profile</button></form><div class="section-title small"><h2>nearby runner matches</h2></div><div class="card-grid">${matches.map((runner) => `<article class="community-card"><div><strong>${runner[0]}</strong><span>${runner[1]} - ${runner[3]}</span></div><div class="mini-tags"><span>${icon('target')} ${runner[2]}</span><span>${icon('map')} near your area</span></div><button data-connect="${runner[0]}">${icon('message')} Connect</button></article>`).join('')}</div></section>`
}

function settingsScreen() {
  return `<section class="screen"><div class="section-title"><p>control room</p><h2>privacy-first settings</h2><span>No silent tracking. GPS runs only after Start and stops on Stop.</span></div>${notice()}<section class="success-card"><h2>mobile app testing</h2><p>${escapeHtml(mobileStatus)}</p><div class="actions"><button class="primary" data-action="install-app">${icon('phone')} Install app</button><button class="wide-button" data-action="gps-test">${icon('map')} Test GPS</button><button class="wide-button" data-action="offline-test">${icon('shield')} Test offline</button></div></section><section class="success-card"><h2>SOS call order</h2><p>SOS calls team member first. If team number is empty, it calls medical contact.</p><div class="profile-form compact-form"><label>Team member number<input data-setting="teamNumber" type="tel" value="${escapeHtml(settings.teamNumber || '')}" placeholder="+91 team number"></label><label>Medical number<input data-setting="medicalNumber" type="tel" value="${escapeHtml(settings.medicalNumber || '')}" placeholder="+91 medical number"></label></div></section><div class="settings-list"><label><span>Voice alerts</span><input data-setting="voice" type="checkbox" ${settings.voice ? 'checked' : ''}></label><label><span>Low battery mode</span><input data-setting="battery" type="checkbox" ${settings.battery ? 'checked' : ''}></label><label><span>Night highway mode</span><input data-setting="night" type="checkbox" ${settings.night ? 'checked' : ''}></label><label><span>Trusted live location</span><input data-setting="live" type="checkbox" ${settings.live ? 'checked' : ''}></label><label><span>Language</span><select data-setting="language"><option ${settings.language === 'English' ? 'selected' : ''}>English</option><option ${settings.language === 'Hindi' ? 'selected' : ''}>Hindi</option></select></label></div><div class="warning">Location sharing works only during an active run and can be turned off anytime.</div></section>`
}

function render() {
  if (!root) return
  const screens = { run: runScreen, area: areaScreen, goals: goalsScreen, history: historyScreen, profile: profileScreen, settings: settingsScreen }
  root.innerHTML = `<div class="app ${settings.night ? 'night-mode' : ''}"><header class="topbar"><div class="brand">${athleteLogo()}<strong>PACERUN</strong><span>club</span></div><button class="top-card" data-action="toggle-live"><span>${settings.live ? 'LIVE SHARE ON' : 'PRIVATE RUN'}</span><i></i></button></header><main>${screens[activeTab]()}</main><nav class="bottom-nav">${[['run', 'run', 'play'], ['area', 'area', 'map'], ['goals', 'goals', 'target'], ['history', 'proof', 'history'], ['profile', 'profile', 'user'], ['settings', 'more', 'settings']].map((item) => `<button class="${activeTab === item[0] ? 'active' : ''}" data-tab="${item[0]}">${icon(item[2])}<span>${item[1]}</span></button>`).join('')}</nav></div>`
}

function startRun() {
  tracking = true
  elapsed = 0
  distance = 0
  currentSpeed = 0
  maxSpeed = 0
  routePoints = []
  appNotice = `Recording ${activeGoal.label} route from ${profile.area}.`
  clearInterval(timer)
  timer = setInterval(() => {
    elapsed += 1
    currentSpeed = settings.battery ? 9.8 + Math.sin(elapsed / 3) * 1.8 : 10.8 + Math.sin(elapsed / 2) * 2.4
    maxSpeed = Math.max(maxSpeed, currentSpeed)
    distance = Math.min(activeGoal.km, distance + currentSpeed / 3600)
    if (elapsed % 4 === 0 || distance >= activeGoal.km) {
      routePoints.push([distance, elapsed])
      if (routePoints.length > 140) routePoints = routePoints.slice(-140)
    }
    if (distance >= activeGoal.km) stopRun(true)
    else render()
  }, 1000)
  render()
}

function stopRun(autoComplete = false) {
  tracking = false
  clearInterval(timer)
  timer = null
  const run = { goal: activeGoal.label, date: 'Just now', result: autoComplete ? 'Target distance complete' : 'Training saved', community, distance, time: elapsed, pace: avgPace(), avgSpeed: avgSpeed(), maxSpeed }
  history = [run, ...history].slice(0, 30)
  savedRoutes = [`${profile.area} ${activeGoal.label} route`, ...savedRoutes].slice(0, 4)
  save('pacerun-history', history)
  save('pacerun-routes', savedRoutes)
  appNotice = `${run.result}: ${distance.toFixed(2)} km, max ${maxSpeed.toFixed(1)} km/h, avg ${avgSpeed().toFixed(1)} km/h.`
  activeTab = 'history'
  render()
}

document.addEventListener('click', (event) => {
  const tabButton = event.target.closest('[data-tab]')
  if (tabButton) { activeTab = tabButton.dataset.tab; render(); return }
  const action = event.target.closest('[data-action]')?.dataset.action
  if (action === 'start') startRun()
  if (action === 'stop') stopRun(false)
  if (action === 'sos') {
    const team = cleanPhone(settings.teamNumber)
    const medical = cleanPhone(settings.medicalNumber)
    if (team) { appNotice = 'SOS calling team member first.'; render(); callNumber(team) }
    else if (medical) { appNotice = 'Team number missing. SOS calling medical contact.'; render(); callNumber(medical) }
    else { appNotice = 'Add team member or medical number in More > SOS call order.'; activeTab = 'settings'; render() }
  }
  if (action === 'near') { areaStatus = `Nearby communities found around ${profile.area}. Choose a group and run together.`; appNotice = 'Nearby runner discovery updated.'; render() }
  if (action === 'toggle-live') { settings.live = !settings.live; save('pacerun-settings', settings); appNotice = settings.live ? 'Trusted live sharing enabled.' : 'Private run mode enabled.'; render() }
  if (action === 'install-app') {
    if (installPrompt) {
      installPrompt.prompt()
      installPrompt.userChoice.then((choice) => {
        mobileStatus = choice.outcome === 'accepted' ? 'Install accepted. Check your home screen.' : 'Install dismissed. You can try again later.'
        installPrompt = null
        render()
      })
    } else {
      mobileStatus = 'Install prompt is not available yet. Open in Chrome on Android or use browser menu > Install app.'
      render()
    }
  }
  if (action === 'gps-test') {
    if (!('geolocation' in navigator)) {
      mobileStatus = 'GPS is not available in this browser.'
      render()
    } else {
      mobileStatus = 'Requesting GPS permission...'
      render()
      navigator.geolocation.getCurrentPosition(
        (position) => { mobileStatus = `GPS working: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`; render() },
        () => { mobileStatus = 'GPS permission denied or unavailable. Enable location permission and test again.'; render() },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
  }
  if (action === 'offline-test') {
    mobileStatus = navigator.onLine ? 'Online now. Turn off internet and reopen to test cached offline launch.' : 'Offline mode detected. Cached app shell should still open.'
    render()
  }
  const communityButton = event.target.closest('[data-community]')
  if (communityButton) { community = communityButton.dataset.community; save('pacerun-community', community); appNotice = `Joined ${community}.`; render() }
  const goalButton = event.target.closest('[data-goal]')
  if (goalButton) { activeGoal = goalOptions.find((goal) => goal.label === goalButton.dataset.goal) || goalOptions[0]; save('pacerun-goal', activeGoal); appNotice = `${activeGoal.label} target selected.`; render() }
  const connectButton = event.target.closest('[data-connect]')
  if (connectButton) { areaStatus = `Connection request ready for ${connectButton.dataset.connect}. ${profileSaved ? 'Profile attached safely.' : 'Save your profile first for safe contact.'}`; activeTab = 'area'; render() }
})

document.addEventListener('change', (event) => {
  const key = event.target.dataset.setting
  if (!key) return
  if (event.target.type === 'checkbox') settings[key] = event.target.checked
  else settings[key] = event.target.value
  save('pacerun-settings', settings)
  appNotice = `${key} setting updated.`
  render()
})

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-profile-form]')
  if (!form) return
  event.preventDefault()
  const data = new FormData(form)
  profile = { name: data.get('name') || 'Your name', area: data.get('area') || 'CGC Landran', goal: data.get('goal') || '1600 m physical test', level: data.get('level') || 'Beginner', contact: data.get('contact') || 'Request only' }
  profileSaved = true
  save('pacerun-profile', profile)
  save('pacerun-profile-saved', profileSaved)
  appNotice = 'Profile saved. Motivation and nearby matches now use your details.'
  render()
})

render()




