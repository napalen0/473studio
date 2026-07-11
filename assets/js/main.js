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
    if (instant) {
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
