/* ==========================================================
   ROMANTIC BIRTHDAY SURPRISE - CLEAN JAVASCRIPT ENGINE
   ========================================================== */

// ----------------------------------------------------------
// 1. CONFIGURATION
// ----------------------------------------------------------
const BIRTHDAY_DATE = new Date("2026-09-13T00:00:00");
const TYPEWRITER_TEXT = "Happy Birthday, Khyatea! 💖";


// ----------------------------------------------------------
// 2. CONFETTI ENGINE (Global Vanilla Canvas Cannon)
// ----------------------------------------------------------
const ConfettiEngine = (() => {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let particles = [];
  let animationId = null;

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  const confettiColors = [
    "#ff548e", "#ff2a73", "#ff7597", "#f472b6",
    "#ffd166", "#ffffff", "#ffb3c6", "#e056fd"
  ];

  class ConfettiPiece {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const velocity = 8 + Math.random() * 18;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - 7;
      this.size = 6 + Math.random() * 7;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      this.gravity = 0.38;
      this.drag = 0.94;
      this.opacity = 1;
      this.fadeSpeed = 0.007 + Math.random() * 0.008;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 14;
      this.isCircle = Math.random() > 0.65;
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.fadeSpeed;
    }

    draw() {
      if (!ctx || this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.6);
      }

      ctx.restore();
    }
  }

  function loop() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.opacity > 0);

    for (let p of particles) {
      p.update();
      p.draw();
    }

    if (particles.length > 0) {
      animationId = requestAnimationFrame(loop);
    } else {
      animationId = null;
    }
  }

  function blast(x, y, count = 80) {
    if (!canvas) return;
    for (let i = 0; i < count; i++) {
      particles.push(new ConfettiPiece(x, y));
    }
    if (!animationId) {
      loop();
    }
  }

  return { blast };
})();


// ----------------------------------------------------------
// 3. CURSOR SPARKLE TRAIL
// ----------------------------------------------------------
function initCursorSparkles() {
  const canvas = document.getElementById("cursor-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const sparkles = [];
  const sparkleColors = ["#ff5e86", "#fbbf24", "#d8b4fe", "#ffffff", "#ff477e"];

  class Sparkle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = 2 + Math.random() * 4;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5 - 0.5;
      this.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      this.life = 1;
      this.decay = 0.025 + Math.random() * 0.02;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
      if (this.size > 0.3) this.size -= 0.05;
    }

    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(this.x, this.y - s * 2);
      ctx.quadraticCurveTo(this.x, this.y, this.x + s * 2, this.y);
      ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + s * 2);
      ctx.quadraticCurveTo(this.x, this.y, this.x - s * 2, this.y);
      ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - s * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function addSparkles(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      sparkles.push(new Sparkle(x, y));
    }
  }

  window.addEventListener("mousemove", (e) => {
    addSparkles(e.clientX, e.clientY, 2);
  });

  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      addSparkles(e.touches[0].clientX, e.touches[0].clientY, 2);
    }
  }, { passive: true });

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = sparkles.length - 1; i >= 0; i--) {
      sparkles[i].update();
      sparkles[i].draw();
      if (sparkles[i].life <= 0) {
        sparkles.splice(i, 1);
      }
    }
    requestAnimationFrame(render);
  }

  render();
}


// ----------------------------------------------------------
// 4. MUSIC PLAYER
// ----------------------------------------------------------
function initMusicPlayer() {
  const musicToggle = document.getElementById("music-toggle");
  const bgMusic = document.getElementById("bg-music");
  if (!musicToggle || !bgMusic) return;

  let isPlaying = false;

  musicToggle.addEventListener("click", () => {
    if (isPlaying) {
      bgMusic.pause();
      musicToggle.classList.remove("playing");
      isPlaying = false;
    } else {
      bgMusic.play().then(() => {
        musicToggle.classList.add("playing");
        isPlaying = true;
      }).catch((err) => {
        console.warn("Audio playback issue:", err);
      });
    }
  });
}


// ----------------------------------------------------------
// 5. 3D MEMORY SHOWCASE & FLIP CARDS
// ----------------------------------------------------------
function initMemoryShowcase() {
  const frames = document.querySelectorAll(".memory-frame");

  frames.forEach((frame) => {
    // 3D Perspective Tilt on Hover
    frame.addEventListener("mousemove", (e) => {
      if (frame.classList.contains("flipped")) return;
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.05)`;
    });

    frame.addEventListener("mouseleave", () => {
      frame.style.transform = "";
    });

    // Tap/Click to Flip
    frame.addEventListener("click", () => {
      frame.classList.toggle("flipped");
      if (frame.classList.contains("flipped")) {
        frame.style.transform = "";
        const rect = frame.getBoundingClientRect();
        ConfettiEngine.blast(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      }
    });
  });
}


// ----------------------------------------------------------
// 6. 3D INTERACTIVE UNLISTED ENVELOPE / LETTER
// ----------------------------------------------------------
function initEnvelopeLetter() {
  const sealBtn = document.getElementById("seal-btn");
  const envelope = document.getElementById("envelope");

  if (!sealBtn || !envelope) return;

  sealBtn.addEventListener("click", () => {
    envelope.classList.add("open");
    const rect = sealBtn.getBoundingClientRect();
    ConfettiEngine.blast(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
  });
}


// ----------------------------------------------------------
// 7. TYPEWRITER EFFECT
// ----------------------------------------------------------
function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;
  
  el.textContent = "";
  let i = 0;
  
  function typeChar() {
    if (i < TYPEWRITER_TEXT.length) {
      el.textContent += TYPEWRITER_TEXT.charAt(i);
      i++;
      setTimeout(typeChar, 85);
    }
  }
  
  setTimeout(typeChar, 300);
}


// ----------------------------------------------------------
// 8. LIVE COUNTDOWN TIMER
// ----------------------------------------------------------
function initCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const statusEl = document.getElementById("countdown-status");

  function updateTimer() {
    const now = new Date().getTime();
    const diff = BIRTHDAY_DATE.getTime() - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      if (statusEl) statusEl.innerHTML = "<span class='pulse-dot'></span> 🎉 Happy Birthday, My Queen! 🎂✨";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(d).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}


// ----------------------------------------------------------
// 9. FLOATING BALLOONS
// ----------------------------------------------------------
function initBalloons() {
  const container = document.getElementById("balloon-container");
  if (!container) return;

  const colors = [
    "radial-gradient(circle at 30% 30%, #ff9ebb, #ff2a73)",
    "radial-gradient(circle at 30% 30%, #ffd6e0, #ff548e)",
    "radial-gradient(circle at 30% 30%, #ffe4ec, #f472b6)",
    "radial-gradient(circle at 30% 30%, #ffd166, #ff7597)",
    "radial-gradient(circle at 30% 30%, #fbcfe8, #e056fd)"
  ];

  function createBalloon() {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.left = `${Math.random() * 92}vw`;
    balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = `${11 + Math.random() * 7}s`;
    
    const scale = 0.8 + Math.random() * 0.45;
    balloon.style.transform = `scale(${scale})`;

    container.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, 18000);
  }

  for (let i = 0; i < 6; i++) {
    setTimeout(createBalloon, i * 1400);
  }
  setInterval(createBalloon, 3200);
}


// ----------------------------------------------------------
// 10. AMBIENT FLOATING HEARTS (CANVAS)
// ----------------------------------------------------------
function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 22;

  class HeartParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = 10 + Math.random() * 14;
      this.speedY = 0.5 + Math.random() * 0.8;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = 0.15 + Math.random() * 0.35;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.color = Math.random() > 0.4 ? "rgba(255, 94, 134," : "rgba(251, 191, 36,";
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = `${this.color} ${this.opacity})`;
      ctx.beginPath();
      const s = this.size / 15;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-10 * s, -10 * s, -20 * s, 5 * s, 0, 20 * s);
      ctx.bezierCurveTo(20 * s, 5 * s, 10 * s, -10 * s, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y -= this.speedY;
      this.x += Math.sin(this.y * 0.01) * 0.6 + this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y < -30 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new HeartParticle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(render);
  }

  render();
}


// ----------------------------------------------------------
// 11. INTERACTIVE "FORGIVE ME" CARD & DODGING BUTTON
// ----------------------------------------------------------
function initInteractiveCard() {
  const btnNo = document.getElementById("btn-no");
  const btnYes = document.getElementById("btn-yes");
  const playground = document.getElementById("playground");
  const dodgeHint = document.getElementById("dodge-hint");
  const successMessage = document.getElementById("success-message");

  if (!btnNo || !btnYes || !playground) return;

  let dodgeCount = 0;
  const maxDodges = 5;
  let yesScale = 1;

  const dodgeTexts = [
    "Wait, think again! 🥺",
    "Are you sure? 💔",
    "Can't catch me! 🏃‍♀️💨",
    "One more chance? 🌹",
    "Okay fine, I surrender! 🙈"
  ];

  function dodgeButton(e) {
    if (e) e.preventDefault();
    dodgeCount++;

    if (dodgeCount <= maxDodges) {
      btnNo.textContent = dodgeTexts[dodgeCount - 1];
    }

    const playRect = playground.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    const maxOffsetX = Math.max(15, (playRect.width - btnRect.width) / 2 - 10);
    const maxOffsetY = Math.max(20, Math.min(45, (playRect.height - btnRect.height) / 2));

    const randomX = (Math.random() * 2 - 1) * maxOffsetX;
    const randomY = (Math.random() * 2 - 1) * maxOffsetY;

    btnNo.style.transform = `translate(${randomX}px, ${randomY}px) scale(${Math.max(0.4, 1 - dodgeCount * 0.12)})`;

    yesScale += 0.12;
    btnYes.style.transform = `scale(${yesScale})`;

    if (dodgeHint) {
      if (dodgeCount === 1) dodgeHint.textContent = "Nice try! The button is shy! 😜";
      if (dodgeCount === 3) dodgeHint.textContent = "Look how big the Yes button is! Resistance is futile! 💕";
      if (dodgeCount >= maxDodges) {
        dodgeHint.textContent = "Okay, there's truly only one right answer now! 🥰";
        btnNo.style.opacity = "0.15";
        btnNo.style.pointerEvents = "none";
      }
    }
  }

  btnNo.addEventListener("mouseenter", dodgeButton);
  btnNo.addEventListener("touchstart", dodgeButton, { passive: false });

  btnYes.addEventListener("click", () => {
    playground.style.display = "none";
    if (dodgeHint) dodgeHint.style.display = "none";

    if (successMessage) {
      successMessage.style.display = "flex";
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    ConfettiEngine.blast(centerX, centerY, 160);
    setTimeout(() => ConfettiEngine.blast(centerX - 240, centerY + 80, 120), 250);
    setTimeout(() => ConfettiEngine.blast(centerX + 240, centerY + 80, 120), 500);
    setTimeout(() => ConfettiEngine.blast(centerX, centerY - 120, 140), 800);
  });
}


// ----------------------------------------------------------
// 12. SCROLL REVEALS
// ----------------------------------------------------------
function initScrollObserver() {
  if (!("IntersectionObserver" in window)) return;

  const elements = document.querySelectorAll(".reveal-on-scroll");
  elements.forEach((el) => el.classList.add("animate-reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((el) => observer.observe(el));
}


// ----------------------------------------------------------
// 13. OPENING SURPRISE INTRO ANIMATION
// ----------------------------------------------------------
function initIntroOverlay() {
  const overlay = document.getElementById("intro-overlay");
  const introBtn = document.getElementById("intro-btn");
  const introGift = document.getElementById("intro-gift");
  const bgMusic = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  if (!overlay) return;

  function openSurprise() {
    overlay.classList.add("hidden");

    // Play music automatically upon user click
    if (bgMusic) {
      bgMusic.play().then(() => {
        if (musicToggle) musicToggle.classList.add("playing");
      }).catch(() => {});
    }

    // Celebrate with confetti bursts
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    ConfettiEngine.blast(centerX, centerY, 120);
    setTimeout(() => ConfettiEngine.blast(centerX - 200, centerY - 100, 80), 200);
    setTimeout(() => ConfettiEngine.blast(centerX + 200, centerY - 100, 80), 400);

    // Trigger typewriter heading
    initTypewriter();
  }

  if (introBtn) introBtn.addEventListener("click", openSurprise);
  if (introGift) introGift.addEventListener("click", openSurprise);
}


// ----------------------------------------------------------
// 14. BOOTSTRAP INITIALIZATION
// ----------------------------------------------------------
function bootstrap() {
  try { initCursorSparkles(); } catch (e) { console.error(e); }
  try { initMusicPlayer(); } catch (e) { console.error(e); }
  try { initMemoryShowcase(); } catch (e) { console.error(e); }
  try { initEnvelopeLetter(); } catch (e) { console.error(e); }
  try { initCountdown(); } catch (e) { console.error(e); }
  try { initBalloons(); } catch (e) { console.error(e); }
  try { initAmbientCanvas(); } catch (e) { console.error(e); }
  try { initInteractiveCard(); } catch (e) { console.error(e); }
  try { initScrollObserver(); } catch (e) { console.error(e); }
  try { initIntroOverlay(); } catch (e) { console.error(e); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
