// ==========================================================================
// Year
// ==========================================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ==========================================================================
// Nav scroll state
// ==========================================================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ==========================================================================
// Mobile nav burger (simple toggle -> reveals links stacked)
// ==========================================================================
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
burger?.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.display = open ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'fixed';
  navLinks.style.top = '70px';
  navLinks.style.right = '5vw';
  navLinks.style.background = '#10182B';
  navLinks.style.border = '1px solid rgba(232,236,244,0.09)';
  navLinks.style.borderRadius = '14px';
  navLinks.style.padding = '20px 28px';
  navLinks.style.gap = '18px';
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth <= 640) navLinks.style.display = 'none';
  });
});

// ==========================================================================
// Cursor glow (desktop only, respects reduced motion)
// ==========================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const glow = document.getElementById('cursorGlow');
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('mousemove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });
} else if (glow) {
  glow.style.display = 'none';
}

// ==========================================================================
// Terminal typing sequence — real snippets from Najeeb's projects
// ==========================================================================
const terminalLines = [
  { text: '$ whoami', cls: 'term-blue' },
  { text: 'najeeb — full-stack engineer, AI-augmented systems', cls: '' },
  { text: '', cls: '' },
  { text: '$ cat current_focus.txt', cls: 'term-blue' },
  { text: '> Scribe AI: FastAPI backend + Whisper transcription', cls: '' },
  { text: '> mapping frontend endpoints for full API coverage', cls: 'term-comment' },
  { text: '', cls: '' },
  { text: '$ git status', cls: 'term-blue' },
  { text: 'On branch main — building systems that ship.', cls: '' },
];

const terminalBody = document.getElementById('terminalBody');

function typeTerminal() {
  if (prefersReducedMotion) {
    terminalBody.innerHTML = terminalLines
      .map(l => `<div class="${l.cls}">${l.text}</div>`)
      .join('');
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;
  let currentDiv = null;

  function step() {
    if (lineIndex >= terminalLines.length) return;
    const line = terminalLines[lineIndex];

    if (charIndex === 0) {
      currentDiv = document.createElement('div');
      if (line.cls) currentDiv.className = line.cls;
      terminalBody.appendChild(currentDiv);
    }

    if (charIndex < line.text.length) {
      currentDiv.textContent += line.text[charIndex];
      charIndex++;
      setTimeout(step, line.text.startsWith('$') ? 45 : 18);
    } else {
      lineIndex++;
      charIndex = 0;
      setTimeout(step, line.text === '' ? 100 : 220);
    }
  }
  step();
}

// Start typing once hero is in view
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeTerminal();
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
heroObserver.observe(document.querySelector('.terminal'));

// ==========================================================================
// Circuit-grid canvas background (ambient, calm, deliberate)
// ==========================================================================
const canvas = document.getElementById('circuitCanvas');
const ctx = canvas.getContext('2d');
let width, height, nodes = [];
const GRID = 64;

function resizeCanvas() {
  width = canvas.width = canvas.offsetWidth * devicePixelRatio;
  height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  buildNodes();
}

function buildNodes() {
  nodes = [];
  const cols = Math.ceil(width / GRID) + 1;
  const rows = Math.ceil(height / GRID) + 1;
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      if (Math.random() > 0.86) {
        nodes.push({
          x: x * GRID,
          y: y * GRID,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.6,
          size: 1.5 + Math.random() * 2
        });
      }
    }
  }
}

function drawGrid(t) {
  ctx.clearRect(0, 0, width, height);

  // static faint grid lines
  ctx.strokeStyle = 'rgba(232,236,244,0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += GRID) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += GRID) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // pulsing nodes
  nodes.forEach(n => {
    const pulse = (Math.sin(t * 0.001 * n.speed + n.phase) + 1) / 2;
    const alpha = 0.15 + pulse * 0.5;
    const r = n.size + pulse * 2;

    ctx.beginPath();
    ctx.arc(n.x, n.y, r * devicePixelRatio, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 160, ${alpha * 0.7})`;
    ctx.fill();

    // connecting tick marks
    if (pulse > 0.7) {
      ctx.strokeStyle = `rgba(61, 90, 254, ${(pulse - 0.7) * 1.2})`;
      ctx.lineWidth = 1.5 * devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(n.x - GRID / 2, n.y);
      ctx.lineTo(n.x + GRID / 2, n.y);
      ctx.stroke();
    }
  });
}

let rafId;
function animate(t) {
  drawGrid(t);
  rafId = requestAnimationFrame(animate);
}

if (canvas) {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  if (!prefersReducedMotion) {
    animate(0);
  } else {
    drawGrid(0);
  }
}

// ==========================================================================
// Scroll-reveal for sections
// ==========================================================================
const revealTargets = document.querySelectorAll('.skill-card, .project-card, .about-grid, .contact-inner');
revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s var(--ease, ease), transform 0.7s var(--ease, ease)';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => revealObserver.observe(el));

if (prefersReducedMotion) {
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}
