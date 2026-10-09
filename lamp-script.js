/**
 * COZY ANIMATED LAMP LOGIN - INTERACTIVE SCRIPT
 * Features:
 * 1. Realistic Pull-Switch with Damped Harmonic Spring Physics
 * 2. Multi-Color Light Cycling on Each Pull (Warm -> Cyber -> Sunset -> Aurora -> Violet -> OFF)
 * 3. Web Audio API Procedural Sound Synthesizer (Click, Snap, Hum)
 * 4. 3D Parallax Lamp Head & Mouse-Tracking Spotlight
 * 5. Dynamic Atmospheric Floating Fireflies / Dust Motes
 * 6. Sign In / Sign Up Mode Switching
 * 7. Live Password Strength Analyzer & Visibility Toggle
 */

// DOM Elements
const room = document.getElementById('room');
const lampContainer = document.getElementById('lampContainer');
const lampHead = document.getElementById('lampHead');
const lightBeam = document.getElementById('lightBeam');
const deskSurface = document.getElementById('deskSurface');
const handle = document.getElementById('stringHandle');
const path = document.getElementById('stringPath');
const fireflies = document.getElementById('fireflies');
const loginCard = document.getElementById('loginCard');
const loginForm = document.getElementById('loginForm');
const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');
const tabContainer = document.querySelector('.form-tabs');
const headingTitle = document.getElementById('headingTitle');
const headingSub = document.getElementById('headingSub');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordMeter = document.getElementById('passwordMeter');
const meterFill = document.getElementById('meterFill');
const meterText = document.getElementById('meterText');
const soundToggle = document.getElementById('soundToggle');
const soundOnIcon = document.querySelector('.sound-on');
const soundOffIcon = document.querySelector('.sound-off');
const feedbackToast = document.getElementById('feedbackToast');
const toastText = document.getElementById('toastText');
const cardGlow = document.getElementById('cardGlow');

// Color Theme Cycle List (3 Core Colors)
const THEMES = ['warm', 'cream', 'white', 'parrot', 'green', 'darkgreen', 'navy', 'violet', 'pink', 'red', 'sunset', 'orange', 'cyber'];
let currentThemeIndex = -1; // -1 means lamp is OFF

// State Variables
let isOn = false;
let isDragging = false;
let startX = 0;
let startY = 0;
let curX = 0;
let curY = 0;
let springAnimationId = null;
let soundEnabled = true;
let currentMode = 'signin'; // 'signin' or 'signup'

// ===================================================
// PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
// ===================================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  if (type === 'pull') {
    // Mechanical spring tension click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'switch') {
    // Sharp metal click / snap toggle
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isOn ? 1200 : 700, now);
    osc.frequency.exponentialRampToValueAtTime(isOn ? 300 : 200, now + 0.06);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.07);

    // Warm electrical filament hum
    if (isOn) {
      const humOsc = audioCtx.createOscillator();
      const humGain = audioCtx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(120, now);
      humGain.gain.setValueAtTime(0.12, now);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      humOsc.connect(humGain);
      humGain.connect(audioCtx.destination);
      humOsc.start(now);
      humOsc.stop(now + 0.25);
    }
  } else if (type === 'tap') {
    // Subtle UI tap sound
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } else if (type === 'success') {
    // Pleasant success chime
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }
}

// Sound FX Button Toggle
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundOnIcon.classList.toggle('hidden', !soundEnabled);
  soundOffIcon.classList.toggle('hidden', soundEnabled);
  if (soundEnabled) playSound('tap');
});

// ===================================================
// DYNAMIC COLOR THEME APPLY & LAMP STATE
// ===================================================
function applyTheme(themeName) {
  if (themeName === 'warm') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
}

function setLamp(on) {
  isOn = on;
  room.classList.toggle('on', isOn);
  playSound('switch');

  if (isOn) {
    createFireflies();
  } else {
    fireflies.innerHTML = '';
  }
}

// Cycle light color / state on every string pull
function triggerPullAction() {
  currentThemeIndex = (currentThemeIndex + 1) % (THEMES.length + 1);

  if (currentThemeIndex === THEMES.length) {
    // Turn OFF after cycling all colors
    setLamp(false);
    currentThemeIndex = -1;
  } else {
    // Set corresponding theme color and turn ON
    const activeTheme = THEMES[currentThemeIndex];
    applyTheme(activeTheme);

    if (!isOn) {
      setLamp(true);
    } else {
      // If already ON, keep existing particles alive and just play click
      playSound('switch');
    }
  }
}

function createFireflies() {
  fireflies.innerHTML = '';
  const count = 30;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    dot.className = 'firefly';

    const size = Math.random() * 4 + 3;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.setProperty('--duration', `${Math.random() * 25 + 25}s`);
    dot.style.setProperty('--delay', `-${Math.random() * 20}s`);

    for (let n = 1; n <= 4; n++) {
      dot.style.setProperty(`--x${n}`, `${Math.random() * 100}vw`);
      dot.style.setProperty(`--y${n}`, `${Math.random() * 100}vh`);
    }

    fireflies.appendChild(dot);
  }
}

// ===================================================
// PULL-STRING INTERACTION & SPRING HARMONIC PHYSICS
// ===================================================
const defaultLength = 95;

function updateStringVisual(x, y) {
  path.setAttribute('d', `M 0 0 Q ${x * 0.3} ${(defaultLength + y) * 0.5} ${x} ${defaultLength + y}`);
  handle.style.transform = `translate(${x}px, ${y}px)`;
}

function startSpringPhysics(initialX, initialY) {
  cancelAnimationFrame(springAnimationId);
  
  let x = initialX;
  let y = initialY;
  let vx = 0;
  let vy = 0;
  const stiffness = 0.16;
  const damping = 0.78;

  function step() {
    const ax = -stiffness * x;
    const ay = -stiffness * y;
    
    vx = (vx + ax) * damping;
    vy = (vy + ay) * damping;
    
    x += vx;
    y += vy;

    updateStringVisual(x, y);

    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1 || Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
      springAnimationId = requestAnimationFrame(step);
    } else {
      updateStringVisual(0, 0);
    }
  }

  springAnimationId = requestAnimationFrame(step);
}

function onPointerDown(e) {
  isDragging = true;
  cancelAnimationFrame(springAnimationId);
  handle.classList.add('dragging');
  startX = e.clientX;
  startY = e.clientY;
  curX = 0;
  curY = 0;
  handle.setPointerCapture?.(e.pointerId);
  playSound('pull');
}

function onPointerMove(e) {
  if (!isDragging) return;

  const rawDx = (e.clientX - startX) * 0.35;
  const rawDy = Math.max(0, e.clientY - startY) * 0.75;

  curX = Math.max(-40, Math.min(40, rawDx));
  curY = Math.min(180, rawDy);

  updateStringVisual(curX, curY);
}

function onPointerUp() {
  if (!isDragging) return;
  isDragging = false;
  handle.classList.remove('dragging');

  const triggered = curY > 35;
  if (triggered) {
    triggerPullAction();
  }

  startSpringPhysics(curX, curY);
}

handle.addEventListener('pointerdown', onPointerDown);
handle.addEventListener('pointermove', onPointerMove);
handle.addEventListener('pointerup', onPointerUp);
handle.addEventListener('pointercancel', onPointerUp);

// Keyboard Accessibility (Space / Enter on string handle)
handle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    triggerPullAction();
    startSpringPhysics(0, 45);
  }
});

// ===================================================
// 3D PARALLAX & MOUSE TRACKING SPOTLIGHT
// ===================================================
window.addEventListener('mousemove', (e) => {
  const { innerWidth, innerHeight } = window;
  const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
  const normY = (e.clientY / innerHeight - 0.5) * 2;

  // Gentle 3D Tilt on Lamp Head
  if (lampHead && lightBeam) {
    const rotateZ = normX * 4.5;
    const skewX = normX * 2;
    lampHead.style.transform = `rotate(${rotateZ}deg) skewX(${skewX}deg)`;
    lightBeam.style.transform = `rotate(${rotateZ * 0.7}deg) translateX(${normX * 12}px)`;
  }

  // Specular Card Reflection Coordinate
  if (loginCard) {
    const rect = loginCard.getBoundingClientRect();
    const cardX = ((e.clientX - rect.left) / rect.width) * 100;
    const cardY = ((e.clientY - rect.top) / rect.height) * 100;
    loginCard.style.setProperty('--mouse-x', `${cardX}%`);
    loginCard.style.setProperty('--mouse-y', `${cardY}%`);
  }
});

// ===================================================
// FORM SWITCHER (Sign In <--> Sign Up)
// ===================================================
function switchTab(mode) {
  currentMode = mode;
  playSound('tap');

  if (mode === 'signin') {
    tabSignIn.classList.add('active');
    tabSignIn.setAttribute('aria-selected', 'true');
    tabSignUp.classList.remove('active');
    tabSignUp.setAttribute('aria-selected', 'false');
    tabContainer.classList.remove('signup-active');
    loginForm.classList.remove('mode-signup');

    headingTitle.textContent = 'Welcome Back';
    headingSub.textContent = 'Enter your details to access your Admin Portal';
    emailInput.placeholder = 'User Name / Email';
    emailInput.type = 'text';
    emailInput.autocomplete = 'username';
    btnText.textContent = 'Sign In';
  } else {
    tabSignUp.classList.add('active');
    tabSignUp.setAttribute('aria-selected', 'true');
    tabSignIn.classList.remove('active');
    tabSignIn.setAttribute('aria-selected', 'false');
    tabContainer.classList.add('signup-active');
    loginForm.classList.add('mode-signup');

    headingTitle.textContent = 'Create Account';
    headingSub.textContent = 'Join thousands of creators building the future';
    emailInput.placeholder = 'Email Address / Username';
    emailInput.type = 'email';
    emailInput.autocomplete = 'email';
    btnText.textContent = 'Get Started';
  }
}

tabSignIn.addEventListener('click', () => switchTab('signin'));
tabSignUp.addEventListener('click', () => switchTab('signup'));

// ===================================================
// PASSWORD TOGGLE & STRENGTH ANALYZER
// ===================================================
togglePasswordBtn.addEventListener('click', () => {
  const isPass = passwordInput.type === 'password';
  passwordInput.type = isPass ? 'text' : 'password';
  togglePasswordBtn.querySelector('.eye-show').classList.toggle('hidden', isPass);
  togglePasswordBtn.querySelector('.eye-hide').classList.toggle('hidden', !isPass);
  playSound('tap');
});

passwordInput.addEventListener('input', () => {
  const val = passwordInput.value;
  if (!val) {
    passwordMeter.classList.remove('active');
    return;
  }

  passwordMeter.classList.add('active');
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (score <= 2) {
    meterFill.style.width = '33%';
    meterFill.style.backgroundColor = '#f85149';
    meterText.textContent = 'Weak password';
    meterText.style.color = '#f85149';
  } else if (score <= 4) {
    meterFill.style.width = '66%';
    meterFill.style.backgroundColor = '#e3b341';
    meterText.textContent = 'Moderate password';
    meterText.style.color = '#e3b341';
  } else {
    meterFill.style.width = '100%';
    meterFill.style.backgroundColor = '#3fb950';
    meterText.textContent = 'Strong password';
    meterText.style.color = '#3fb950';
  }
});

// ===================================================
// FORM SUBMISSION & FEEDBACK
// ===================================================
function showToast(msg, type = 'success') {
  toastText.textContent = msg;
  feedbackToast.className = `feedback-toast ${type} show`;

  setTimeout(() => {
    feedbackToast.classList.remove('show');
  }, 3500);
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('emailInput').value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    loginCard.classList.add('shake');
    showToast('Please fill in all required fields', 'error');
    setTimeout(() => loginCard.classList.remove('shake'), 500);
    return;
  }

  // Loading State
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    btnText.classList.remove('hidden');

    // Check if 2FA is required
    if (data.requiresTwoFactor) {
      // Show 2FA input modal
      const totpCode = prompt('Enter your 2FA code from authenticator app:');
      if (!totpCode) {
        showToast('2FA code required', 'error');
        return;
      }

      // Retry login with TOTP code
      const response2FA = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password, totpCode }),
        credentials: 'include'
      });

      const data2FA = await response2FA.json();

      if (data2FA.success) {
        showToast('Login successful!');
        setTimeout(() => {
          window.location.href = '/admin/admin-dashboard.html';
        }, 1000);
      } else {
        showToast(data2FA.error || 'Invalid 2FA code', 'error');
        btnLoader.classList.add('hidden');
        submitBtn.disabled = false;
      }
      return;
    }
    btnLoader.classList.add('hidden');
    submitBtn.disabled = false;

    if (response.ok) {
      playSound('success');
      showToast('Welcome back! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        window.location.href = '/admin/admin-dashboard.html';
      }, 1500);
    } else {
      loginCard.classList.add('shake');
      showToast(data.message || 'Login failed. Please check your credentials.', 'error');
      setTimeout(() => loginCard.classList.remove('shake'), 500);
    }
  } catch (error) {
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
    submitBtn.disabled = false;
    loginCard.classList.add('shake');
    showToast('Network error. Please try again.', 'error');
    setTimeout(() => loginCard.classList.remove('shake'), 500);
  }
});

// Social Buttons Feedback
document.getElementById('googleBtn').addEventListener('click', () => {
  playSound('tap');
  showToast('Connecting to Google...', 'success');
});

document.getElementById('githubBtn').addEventListener('click', () => {
  playSound('tap');
  showToast('Connecting to GitHub...', 'success');
});

// Initialize in Off State
setLamp(false);
