// 473studio — behavior: i18n apply, hero typewriter, theme, language dropdown, scroll
// Depends on window.translations (translations.js must load first)

const translations = window.translations;


const langs = ['ru', 'en', 'sr', 'de', 'fr', 'es'];
const zoneMap = { ru: '.ru', en: '.com', sr: '.rs', de: '.de', fr: '.fr', es: '.es' };

// Tokenize HTML string into typed chunks: text chars, <br>, <em>...</em>
function tokenizeHTML(html) {
    const tokens = [];
    const re = /(<br\s*\/?>)|(<em>)([\s\S]*?)(<\/em>)/gi;
    let last = 0, m;
    while ((m = re.exec(html)) !== null) {
        if (m.index > last) {
            const txt = html.slice(last, m.index);
            for (const ch of txt) tokens.push({ type: 'char', val: ch });
        }
        if (m[1]) {
            tokens.push({ type: 'br' });
        } else {
            tokens.push({ type: 'open-em' });
            for (const ch of m[3]) tokens.push({ type: 'char', val: ch, em: true });
            tokens.push({ type: 'close-em' });
        }
        last = re.lastIndex;
    }
    for (const ch of html.slice(last)) tokens.push({ type: 'char', val: ch });
    return tokens;
}

let typewriterTimer = null;

// Build the title with every char pre-laid-out (opacity 0). Line breaks and
// widths are final from the start, so nothing shifts while chars fade in.
function typewrite(htmlStr, instant) {
    const el = document.getElementById('heroTitle');
    if (typewriterTimer) { clearTimeout(typewriterTimer); typewriterTimer = null; }

    const tokens = tokenizeHTML(htmlStr);
    el.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'hero-cursor';

    const chars = [];
    let emEl = null;
    for (const t of tokens) {
        if (t.type === 'br') {
            el.appendChild(document.createElement('br'));
            emEl = null;
        } else if (t.type === 'open-em') {
            emEl = document.createElement('em');
            el.appendChild(emEl);
        } else if (t.type === 'close-em') {
            emEl = null;
        } else {
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = t.val;
            (emEl || el).appendChild(s);
            chars.push(s);
        }
    }
    // Respect prefers-reduced-motion: skip the typewriter reveal entirely,
    // show the full title at once (no per-char fade, no trailing cursor).
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (instant || prefersReducedMotion) {
        chars.forEach(s => s.classList.add('on'));
        el.appendChild(cursor);
        return;
    }

    // Cursor starts at the very beginning, then trails each revealed char.
    el.insertBefore(cursor, el.firstChild);

    let i = 0;
    function tick() {
        if (i >= chars.length) return;
        const s = chars[i++];
        s.classList.add('on');
        s.after(cursor); // keep cursor right after last revealed char
        typewriterTimer = setTimeout(tick, 42);
    }
    setTimeout(tick, 250);
}

function setLang(lang, instant) {
    document.documentElement.lang = translations[lang].html_lang || lang;
    localStorage.setItem('lang', lang);

    document.querySelector('.domain-zone').textContent = zoneMap[lang] || '.ru';
    document.querySelector('.lang-code').textContent = lang.toUpperCase();

    document.querySelectorAll('.lang-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });

    // hero title handled separately via typewriter
    typewrite(translations[lang].hero_title, instant);
}

function detectLang() {
    const saved = localStorage.getItem('lang');
    if (saved && translations[saved]) return saved;
    const browserLangs = navigator.languages || [navigator.language || 'ru'];
    for (const tag of browserLangs) {
        const code = tag.split('-')[0].toLowerCase();
        if (translations[code]) return code;
    }
    return 'en';
}
setLang(detectLang(), false);

// Dropdown toggle
const langSelector = document.getElementById('langSelector');
langSelector.addEventListener('click', e => {
    langSelector.classList.toggle('open');
    e.stopPropagation();
});
document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.addEventListener('click', e => {
        setLang(btn.dataset.lang, true);
        langSelector.classList.remove('open');
        e.stopPropagation();
    });
});
document.addEventListener('click', () => langSelector.classList.remove('open'));

// Theme
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? null : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next || 'dark');
}
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

// Header scroll behavior
let lastScroll = 0;
const headerEl = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) headerEl.classList.add('scrolled');
    else headerEl.classList.remove('scrolled');
    lastScroll = currentScroll;
});

// ── Scroll reveal: elements with .reveal rise+fade in as they enter the viewport.
// Within a group (children of the same parent), a short stagger cascades them.
// Respects prefers-reduced-motion via CSS (.reveal is forced visible there).
(function setupReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Group siblings so the stagger applies within each section, not globally.
    const groups = new Map();
    reveals.forEach(el => {
        const parent = el.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(el);
    });
    // Assign a per-group stagger delay (50ms) via CSS custom property.
    groups.forEach(items => items.forEach((el, i) => {
        el.style.transitionDelay = `${i * 50}ms`;
    }));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        reveals.forEach(el => el.classList.add('in-view'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => io.observe(el));
})();

// ── Number ticker: .meta-value[data-count] counts up from 0 to its target once
// it scrolls into view. Suffix (+/%) lives in .meta-suffix and stays put.
// Uses tabular-nums (CSS) so digits don't shift width while counting.
(function setupNumberTicker() {
    const targets = document.querySelectorAll('.meta-value[data-count]');
    if (!targets.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el, to) {
        const num = el.querySelector('.meta-num');
        if (!num) return;
        if (prefersReducedMotion) { num.textContent = to; return; }
        const duration = 1200; // ms — rare/first-time motion, delight budget allows a slower count
        const start = performance.now();
        function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            // ease-out cubic — fast start, gentle settle
            const eased = 1 - Math.pow(1 - t, 3);
            num.textContent = Math.round(to * eased);
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target, parseInt(entry.target.dataset.count, 10));
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    targets.forEach(el => io.observe(el));
})();

// ── RUNA hero video — pause it under prefers-reduced-motion (video is vestibular
//    stimulus) and when the mockup scrolls off-screen (don't burn CPU off-viewport).
(function setupRunaVideo() {
    const video = document.querySelector('video.runa-video');
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { video.pause(); video.currentTime = 0; return; }
    // Pause when off-screen, resume when visible
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) video.play().catch(() => {});
            else video.pause();
        });
    }, { threshold: 0.1 });
    io.observe(video);
})();

// ── Live snake canvas for the SlitherCash project mockup — a faithful port of the
// real slithercash.fun BackgroundSnakes component (src/components/BackgroundSnakes.tsx).
// 7 snakes, trail-following segments with taper, wandering + mutual avoidance +
// boundary steering, perpendicular wiggle, eyes. Runs only while on screen and
// not under prefers-reduced-motion (paused via IntersectionObserver otherwise).
(function setupLiveSnakes() {
    const canvas = document.querySelector('canvas.live-snakes[data-snakes="slither"]');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Config (mirrors the source component; scale radii to the canvas size) ──
    const SKINS = [
        { c1: '#059669', c2: '#10b981' },
        { c1: '#dc2626', c2: '#ef4444' },
        { c1: '#2563eb', c2: '#3b82f6' },
        { c1: '#d97706', c2: '#f59e0b' },
        { c1: '#7c3aed', c2: '#a855f7' },
        { c1: '#0891b2', c2: '#06b6d4' },
        { c1: '#8b5cf6', c2: '#ec4899' },
    ];
    const SNAKE_COUNT = 7;
    const SEG_COUNT = 30;
    const SEG_SPACING = 4;
    const TRAIL_LEN = SEG_COUNT * SEG_SPACING + 20; // 140
    const SPEED = 0.85;
    const BASE_TURN = 0.025;
    const OPACITY = 0.55; // matches the source canvas style

    let w = 0, h = 0, dpr = 1, scale = 1; // scale = radii multiplier vs the 7px base
    let snakes = [];
    let raf = 0;
    let running = false;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        w = Math.max(1, rect.width);
        h = Math.max(1, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Radii scale with the canvas width vs the source's ~1280px field,
        // clamped so tiny mockups still show something and big ones don't overflow.
        scale = Math.max(0.32, Math.min(1, w / 1280));
    }

    function initSnakes() {
        snakes = [];
        for (let i = 0; i < SNAKE_COUNT; i++) {
            const angle = (i / SNAKE_COUNT) * Math.PI * 2;
            const startX = w / 2 + Math.cos(angle) * w * 0.28;
            const startY = h / 2 + Math.sin(angle) * h * 0.28;
            const trail = [];
            for (let j = 0; j < TRAIL_LEN; j++) trail.push({ x: startX, y: startY });
            snakes.push({
                id: i,
                skin: SKINS[i],
                trail, trailIdx: 0, trailFilled: 0,
                headDir: angle + Math.PI,
                targetDir: angle + Math.PI,
                dirTimer: 0,
                dirInterval: 3 + Math.random() * 3,
            });
        }
    }

    function getSegPos(snake, seg) {
        const trailLen = Math.min(snake.trailFilled, TRAIL_LEN);
        const offset = seg * SEG_SPACING;
        if (offset >= trailLen) return snake.trail[(snake.trailIdx - trailLen + TRAIL_LEN) % TRAIL_LEN];
        return snake.trail[(snake.trailIdx - 1 - offset + TRAIL_LEN) % TRAIL_LEN];
    }

    function update(snake) {
        const head = snake.trail[(snake.trailIdx - 1 + TRAIL_LEN) % TRAIL_LEN];
        const hx = head.x, hy = head.y;

        snake.dirTimer += 1 / 60;
        if (snake.dirTimer >= snake.dirInterval) {
            snake.targetDir = Math.random() * Math.PI * 2;
            snake.dirTimer = 0;
            snake.dirInterval = 2.5 + Math.random() * 3;
        }

        let turnRate = BASE_TURN;
        let avoidX = 0, avoidY = 0, avoidStrength = 0;

        const HARD = 80 * scale, SOFT = 200 * scale;
        const dL = hx - HARD, dR = (w - HARD) - hx;
        const dT = hy - HARD, dB = (h - HARD) - hy;
        const dMin = Math.min(dL, dR, dT, dB);
        if (dMin <= 0) {
            snake.targetDir = Math.atan2(h / 2 - hy, w / 2 - hx);
            turnRate = 0.18;
        } else if (dMin < SOFT - HARD) {
            const toCenter = Math.atan2(h / 2 - hy, w / 2 - hx);
            const t = 1 - dMin / (SOFT - HARD);
            const da2 = toCenter - snake.targetDir;
            snake.targetDir += Math.atan2(Math.sin(da2), Math.cos(da2)) * t * 0.5;
            turnRate = BASE_TURN + 0.08 * t;
        }

        for (const other of snakes) {
            if (other.id === snake.id) continue;
            for (let si = 0; si < SEG_COUNT; si++) {
                const op = getSegPos(other, si);
                const dx = hx - op.x, dy = hy - op.y;
                const dist2 = dx * dx + dy * dy;
                const R = (si === 0 ? 120 : 70) * scale;
                if (dist2 < R * R && dist2 > 0.01) {
                    const dist = Math.sqrt(dist2);
                    const force = (1 - dist / R) * (si === 0 ? 1.2 : 0.7);
                    avoidX += (dx / dist) * force;
                    avoidY += (dy / dist) * force;
                    avoidStrength += force;
                }
            }
        }
        if (avoidStrength > 0) {
            const awayAngle = Math.atan2(avoidY, avoidX);
            const da2 = awayAngle - snake.targetDir;
            const blend = Math.min(0.9, avoidStrength * 0.4);
            snake.targetDir += Math.atan2(Math.sin(da2), Math.cos(da2)) * blend;
            turnRate = Math.max(turnRate, 0.08 + avoidStrength * 0.06);
        }

        const da = snake.targetDir - snake.headDir;
        snake.headDir += Math.atan2(Math.sin(da), Math.cos(da)) * turnRate;

        const perp = snake.headDir + Math.PI / 2;
        // Speed + wiggle scale with `scale` so the spacing between beads scales
        // with bead radius — otherwise small mockups keep 4.25px spacing on ~2px
        // beads and gaps open up between segments (and in tapered tails on desktop).
        const spd = SPEED * scale;
        const sine = Math.sin(Date.now() * 0.0018 + snake.id * 1.7) * 0.35 * scale;
        const nx = hx + Math.cos(snake.headDir) * spd + Math.cos(perp) * sine;
        const ny = hy + Math.sin(snake.headDir) * spd + Math.sin(perp) * sine;
        const HARD2 = 80 * scale;
        const cx = Math.max(HARD2, Math.min(w - HARD2, nx));
        const cy = Math.max(HARD2, Math.min(h - HARD2, ny));

        snake.trail[snake.trailIdx] = { x: cx, y: cy };
        snake.trailIdx = (snake.trailIdx + 1) % TRAIL_LEN;
        if (snake.trailFilled < TRAIL_LEN) snake.trailFilled++;
    }

    function drawBead(x, y, r, c1, c2) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = c1; ctx.fill();
        const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r * 0.85);
        g.addColorStop(0, c2); g.addColorStop(0.5, c2); g.addColorStop(1, c1);
        ctx.beginPath(); ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
    }

    function drawEyes(hx, hy, hR, angle) {
        const eyeD = hR * 0.6, spread = 0.55;
        const sR = hR * 0.38, pR = sR * 0.55;
        for (const s of [-1, 1]) {
            const ex = hx + Math.cos(angle - spread * s) * eyeD;
            const ey = hy + Math.sin(angle - spread * s) * eyeD;
            ctx.beginPath(); ctx.arc(ex, ey, sR, 0, Math.PI * 2);
            ctx.fillStyle = '#f0f0f0'; ctx.fill();
            const px = ex + Math.cos(angle) * sR * 0.25;
            const py = ey + Math.sin(angle) * sR * 0.25;
            ctx.beginPath(); ctx.arc(px, py, pR, 0, Math.PI * 2);
            ctx.fillStyle = '#111'; ctx.fill();
            ctx.beginPath(); ctx.arc(px - pR * 0.3, py - pR * 0.3, pR * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = '#fff'; ctx.fill();
        }
    }

    function draw(snake) {
        const baseR = 7 * scale, headR = baseR * 1.25;
        const taperStart = SEG_COUNT - 5;
        for (let i = SEG_COUNT - 1; i >= 1; i--) {
            const p = getSegPos(snake, i);
            // Taper the last 5 tail beads down to 0.7 (was 0.4). A thinner taper
            // keeps tail beads wide enough to overlap their neighbours at the
            // scaled spacing, so no gaps open up in the tail.
            const taper = i >= taperStart ? 1 - ((i - taperStart) / (SEG_COUNT - taperStart)) * 0.3 : 1;
            drawBead(p.x, p.y, baseR * taper, snake.skin.c1, snake.skin.c2);
        }
        const head = getSegPos(snake, 0);
        drawBead(head.x, head.y, headR, snake.skin.c1, snake.skin.c2);
        drawEyes(head.x, head.y, headR, snake.headDir);
    }

    function step() {
        if (!running) { raf = 0; return; }
        ctx.clearRect(0, 0, w, h);
        for (const s of snakes) update(s);
        // match the source's opacity by painting onto a translucent layer
        ctx.globalAlpha = OPACITY;
        for (const s of snakes) draw(s);
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(step);
    }

    function start() {
        if (running) return;
        // Ensure sizing is current — on first visible the layout may just have settled.
        resize();
        if (w < 2 || h < 2) return; // not laid out yet; IntersectionObserver will retry
        if (snakes.length === 0) initSnakes();
        running = true;
        if (!raf) raf = requestAnimationFrame(step);
    }
    function stop() {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    // Resize handling — the macbook mockup is responsive, so watch the canvas size.
    const ro = new ResizeObserver(() => {
        if (w < 2 || h < 2) { resize(); return; }
        const wasRunning = running;
        resize();
        if (w < 2 || h < 2) return;
        initSnakes(); // re-seed at the new size so snakes stay in-bounds
        ctx.clearRect(0, 0, w, h);
        if (wasRunning) start();
    });
    ro.observe(canvas);

    // Start/pause with viewport visibility — don't burn CPU when off-screen.
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: 0.1 });
    io.observe(canvas);
})();
