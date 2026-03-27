/* ============================================================
   TASKFLOW — pomodoro.js
   Temporizador Pomodoro: 25/5 min, anillo SVG, sesiones
   ============================================================ */

'use strict';

// ── Config ────────────────────────────────────────────────────
const MODES = {
  work:  { label: 'Foco',      duration: 25 * 60, seconds: 25 * 60 },
  break: { label: 'Descanso',  duration:  5 * 60, seconds:  5 * 60 },
};

const CIRCUMFERENCE = 2 * Math.PI * 85; // 534.07…

// ── State ─────────────────────────────────────────────────────
let pState = {
  mode:      'work',
  remaining: MODES.work.duration,
  running:   false,
  sessions:  0,
  interval:  null,
};

// ── Load persistence ──────────────────────────────────────────
(function loadPomState() {
  try {
    const saved = JSON.parse(localStorage.getItem('tf_pom'));
    if (saved) {
      pState.sessions = saved.sessions || 0;
    }
  } catch {}
})();

function savePomState() {
  localStorage.setItem('tf_pom', JSON.stringify({ sessions: pState.sessions }));
}

// ── DOM Refs ──────────────────────────────────────────────────
const pomModal      = document.getElementById('pomodoro-modal');
const btnOpenPom    = document.getElementById('btn-open-pomodoro');
const btnClosePom   = document.getElementById('btn-close-pomodoro');
const btnStartStop  = document.getElementById('btn-startstop');
const btnReset      = document.getElementById('btn-reset');
const btnSkip       = document.getElementById('btn-skip');
const timerDisplay  = document.getElementById('timer-display');
const timerStatus   = document.getElementById('timer-status');
const ringFill      = document.getElementById('ring-fill');
const progressBar   = document.getElementById('progress-bar');
const sessionDots   = document.getElementById('session-dots');
const sessionNum    = document.getElementById('session-num');
const playIcon      = document.getElementById('play-icon');
const pauseIcon     = document.getElementById('pause-icon');
const modeBtns      = document.querySelectorAll('.mode-btn');

// ── Formatting ────────────────────────────────────────────────
function formatTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ── Render ────────────────────────────────────────────────────
function updateUI() {
  const total = MODES[pState.mode].duration;
  const ratio = pState.remaining / total;

  timerDisplay.textContent = formatTimer(pState.remaining);
  timerStatus.textContent  = pState.running
    ? (pState.mode === 'work' ? 'En foco' : 'Descansando')
    : (pState.remaining === total ? 'Listo' : 'Pausado');

  // SVG ring — offset = circumference * (1 - ratio)
  ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);

  // Break mode color
  ringFill.classList.toggle('break-mode', pState.mode === 'break');

  // Linear bar
  progressBar.style.width = `${(1 - ratio) * 100}%`;
  progressBar.style.background = pState.mode === 'break'
    ? 'var(--cat-personal)' : 'var(--accent)';

  // Play/Pause icons
  playIcon.style.display  = pState.running ? 'none'  : 'block';
  pauseIcon.style.display = pState.running ? 'block' : 'none';

  // Sessions
  sessionNum.textContent = pState.sessions;
  sessionDots.innerHTML  = '';
  const dots = Math.min(pState.sessions, 8);
  for (let i = 0; i < dots; i++) {
    const d = document.createElement('span');
    d.className = 'session-dot';
    sessionDots.appendChild(d);
  }

  // Mode btns
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === pState.mode));

  // Tab title when running
  document.title = pState.running
    ? `${formatTimer(pState.remaining)} — TaskFlow`
    : 'TaskFlow';
}

// ── Timer Logic ───────────────────────────────────────────────
function tick() {
  if (pState.remaining <= 0) {
    clearInterval(pState.interval);
    pState.running   = false;
    pState.interval  = null;

    if (pState.mode === 'work') {
      pState.sessions++;
      savePomState();
      notify('🍅 ¡Pomodoro completado! Toma un descanso.');
      switchMode('break');
    } else {
      notify('⚡ ¡Descanso terminado! A trabajar.');
      switchMode('work');
    }
    updateUI();
    return;
  }
  pState.remaining--;
  updateUI();
}

function startTimer() {
  if (pState.running) return;
  pState.running  = true;
  pState.interval = setInterval(tick, 1000);
  updateUI();
}

function pauseTimer() {
  pState.running = false;
  clearInterval(pState.interval);
  pState.interval = null;
  updateUI();
}

function resetTimer() {
  pauseTimer();
  pState.remaining = MODES[pState.mode].duration;
  updateUI();
}

function switchMode(mode) {
  pauseTimer();
  pState.mode      = mode;
  pState.remaining = MODES[mode].duration;
  updateUI();
}

function skipSession() {
  if (pState.mode === 'work') {
    pState.sessions++;
    savePomState();
    switchMode('break');
  } else {
    switchMode('work');
  }
  window.TaskApp && window.TaskApp.showToast('Sesión saltada');
}

// ── Browser Notification ─────────────────────────────────────
function notify(msg) {
  window.TaskApp && window.TaskApp.showToast(msg);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('TaskFlow', { body: msg, icon: '' });
  }
}

function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── Modal ─────────────────────────────────────────────────────
function openPomodoroModal() {
  pomModal.classList.add('open');
  requestNotifPermission();
  updateUI();
}

function closePomodoroModal() {
  pomModal.classList.remove('open');
}

// ── Event Bindings ────────────────────────────────────────────
btnOpenPom.addEventListener('click', openPomodoroModal);
btnClosePom.addEventListener('click', closePomodoroModal);

btnStartStop.addEventListener('click', () => {
  pState.running ? pauseTimer() : startTimer();
});

btnReset.addEventListener('click', resetTimer);
btnSkip.addEventListener('click',  skipSession);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// Keyboard shortcut: Space to start/pause when modal open
document.addEventListener('keydown', e => {
  if (!pomModal.classList.contains('open')) return;
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') {
    e.preventDefault();
    pState.running ? pauseTimer() : startTimer();
  }
  if (e.key === 'Escape') closePomodoroModal();
});

// ── Initial render ────────────────────────────────────────────
ringFill.style.strokeDasharray  = CIRCUMFERENCE;
ringFill.style.strokeDashoffset = 0;
updateUI();
