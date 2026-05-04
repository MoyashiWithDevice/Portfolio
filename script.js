/* ===== LOADER ===== */
(function () {
  var loader = document.getElementById('loader');
  var logEl  = document.getElementById('loaderLog');
  var fillEl = document.getElementById('loaderFill');
  var pctEl  = document.getElementById('loaderPct');

  var logs = [
    '[SYS]  Initializing portfolio kernel...',
    '[NET]  Establishing secure connection...',
    '[DB]   Loading profile data...',
    '[FS]   Mounting assets...',
    '[UI]   Rendering interface components...',
    '[OK]   All systems operational.',
  ];
  var progress = 0, logIdx = 0;

  function addLog(txt) {
    var line = document.createElement('div');
    line.className = 'loader-log-line';
    line.textContent = txt;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function dismiss() {
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(function () {
      loader.style.display = 'none';
      startNavTyping();
      runHeroTerminal();
    }, 520);
  }

  function step() {
    if (progress >= 100) { setTimeout(dismiss, 250); return; }
    var inc = Math.random() * 6 + 2;
    progress = Math.min(100, progress + inc);
    fillEl.style.width = progress + '%';
    pctEl.textContent  = Math.floor(progress) + '%';
    if (logIdx < logs.length && progress >= (logIdx + 1) * (100 / logs.length)) addLog(logs[logIdx++]);
    setTimeout(step, 60 + Math.random() * 60);
  }
  step();
})();

/* ===== NAV TYPING ===== */
function startNavTyping() {
  var el = document.getElementById('navTyping');
  if (!el) return;
  var words = ['portfolio', 'projects', 'skills', 'about'];
  var wi = 0;
  function typeWord(w, cb) {
    var i = 0; el.textContent = '';
    var t = setInterval(function () { el.textContent += w[i++]; if (i >= w.length) { clearInterval(t); setTimeout(cb, 1400); } }, 90);
  }
  function eraseWord(cb) {
    var t = setInterval(function () { el.textContent = el.textContent.slice(0, -1); if (!el.textContent) { clearInterval(t); cb(); } }, 50);
  }
  function loop() { typeWord(words[wi % words.length], function () { eraseWord(function () { wi++; loop(); }); }); }
  loop();
}

/* ===== HERO TERMINAL ===== */
function runHeroTerminal() {
  var body  = document.getElementById('termBody');
  var input = document.getElementById('termInput');
  var sugg  = document.getElementById('ntSuggestions');
  var cursor = document.getElementById('termCursor');

  if (!body || !input || !sugg) return;

  // 入力文字幅を測るミラーspanを生成
  var mirror = document.createElement('span');
  mirror.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:0.82rem "Share Tech Mono","Courier New",monospace;';
  document.body.appendChild(mirror);

  function updateCursor() {
    mirror.textContent = input.value;
    var w = mirror.getBoundingClientRect().width;
    if (cursor) cursor.style.left = w + 'px';
  }
  input.addEventListener('input',   updateCursor);
  input.addEventListener('keydown', function(){ setTimeout(updateCursor, 0); });
  updateCursor();

  var COMMANDS = {
    'cd about'    : { target: '#about',    label: 'About Me'  },
    'cd skills'   : { target: '#skills',   label: 'Skills'    },
    'cd timeline' : { target: '#timeline', label: 'Timeline'  },
    'cd contact'  : { target: '#contact',  label: 'Contact'   },
    'cd home'     : { target: '#hero',     label: 'Home'      },
    'help'        : { target: null },
    'clear'       : { target: null },
  };

  var boot = [
    { type: 'prompt', text: 'whoami' },
    { type: 'out',    text: 'visitor — welcome to my portfolio', cls: 'nt-success' },
    { type: 'prompt', text: 'cat nav_hint.txt' },
    { type: 'out',    text: 'Type "help" to see commands. Tab to autocomplete.', cls: 'nt-dim' },
    { type: 'blank' },
  ];
  var bi = 0;

  function bootNext() {
    if (bi >= boot.length) { input.focus(); return; }
    var s = boot[bi++];
    if (s.type === 'prompt') {
      var line = document.createElement('div');
      line.className = 'nt-line nt-echoed';
      line.innerHTML = '<span class="t-prompt">visitor@portfolio:~$</span> <span class="t-cmd"></span>';
      body.appendChild(line);
      typeText(line.querySelector('.t-cmd'), s.text, function () { setTimeout(bootNext, 200); });
    } else if (s.type === 'out') {
      var el = document.createElement('div');
      el.className = 'nt-line ' + (s.cls || '');
      el.textContent = s.text;
      body.appendChild(el);
      setTimeout(bootNext, 60);
    } else {
      body.appendChild(document.createElement('div'));
      setTimeout(bootNext, 60);
    }
    body.scrollTop = body.scrollHeight;
  }
  bootNext();

  function updateSugg(val) {
    sugg.innerHTML = '';
    if (!val) return;
    Object.keys(COMMANDS).filter(function (k) { return k.indexOf(val) === 0 && k !== val; }).forEach(function (m) {
      var s = document.createElement('span');
      s.className = 'nt-sugg-item';
      s.textContent = m;
      s.addEventListener('mousedown', function (e) { e.preventDefault(); input.value = m; sugg.innerHTML = ''; input.focus(); });
      sugg.appendChild(s);
    });
  }

  input.addEventListener('input', function () { updateSugg(input.value.trim()); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var val = input.value.trim();
      var m = Object.keys(COMMANDS).filter(function (k) { return k.indexOf(val) === 0; });
      if (m.length === 1) { input.value = m[0]; sugg.innerHTML = ''; }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      var cmd = input.value.trim().toLowerCase();
      input.value = ''; sugg.innerHTML = '';
      handleCmd(cmd);
    }
  });

  document.getElementById('heroTermWin').addEventListener('click', function () { input.focus(); });

  function printLine(text, cls) {
    var el = document.createElement('div');
    el.className = 'nt-line ' + (cls || '');
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function printPrompt(cmd) {
    var el = document.createElement('div');
    el.className = 'nt-line nt-echoed';
    el.innerHTML = '<span class="t-prompt">visitor@portfolio:~$</span> <span>' + cmd.replace(/</g, '&lt;') + '</span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function handleCmd(cmd) {
    if (!cmd) return;
    printPrompt(cmd);
    if (cmd === 'help') {
      printLine('');
      printLine('Available commands:', 'nt-info');
      printLine('  cd about      →  自己紹介', 'nt-dim');
      printLine('  cd skills     →  スキル', 'nt-dim');
      printLine('  cd timeline   →  タイムライン', 'nt-dim');
      printLine('  cd contact    →  連絡先', 'nt-dim');
      printLine('  cd home       →  トップへ戻る', 'nt-dim');
      printLine('  clear         →  画面をクリア', 'nt-dim');
      printLine('');
      return;
    }
    if (cmd === 'clear') { body.innerHTML = ''; return; }
    var found = COMMANDS[cmd];
    if (found && found.target) {
      printLine('Navigating to ' + found.label + '...', 'nt-success');
      setTimeout(function () { document.querySelector(found.target).scrollIntoView({ behavior: 'smooth' }); }, 500);
      return;
    }
    printLine('command not found: ' + cmd, 'nt-error');
    printLine('Type "help" for available commands.', 'nt-dim');
  }
}

function typeText(el, text, cb) {
  var i = 0;
  var t = setInterval(function () {
    el.textContent += text[i++];
    if (i >= text.length) { clearInterval(t); if (cb) cb(); }
  }, 40);
}

/* ===== REVEAL ===== */
document.querySelectorAll('section, .skill-card, .about-grid, .contact-wrap').forEach(function (el) {
  el.classList.add('reveal');
});
var revObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    if (e.target.classList.contains('skill-card')) {
      var fill = e.target.querySelector('.skill-fill');
      if (fill) fill.style.width = fill.dataset.w + '%';
    }
    revObs.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });

/* ===== TIMELINE DRAG ===== */
(function () {
  var outer = document.getElementById('timelineOuter');
  var thumb = document.getElementById('tlThumb');
  if (!outer || !thumb) return;
  var dragging = false, startX, scrollStart;

  outer.addEventListener('mousedown', function (e) { dragging = true; startX = e.pageX; scrollStart = outer.scrollLeft; outer.classList.add('grabbing'); });
  document.addEventListener('mousemove', function (e) { if (!dragging) return; outer.scrollLeft = scrollStart - (e.pageX - startX) * 1.5; updateThumb(); });
  document.addEventListener('mouseup',  function ()  { dragging = false; outer.classList.remove('grabbing'); });
  outer.addEventListener('touchstart', function (e) { startX = e.touches[0].pageX; scrollStart = outer.scrollLeft; }, { passive: true });
  outer.addEventListener('touchmove',  function (e) { outer.scrollLeft = scrollStart - (e.touches[0].pageX - startX) * 1.2; updateThumb(); }, { passive: true });
  outer.addEventListener('scroll', updateThumb);

  function updateThumb() {
    var ratio = outer.scrollLeft / (outer.scrollWidth - outer.clientWidth);
    var tw = Math.max(40, (outer.clientWidth / outer.scrollWidth) * outer.clientWidth);
    thumb.style.width = tw + 'px';
    thumb.style.left  = ratio * (outer.clientWidth - tw) + 'px';
  }
  updateThumb();
})();

/* ===== NAV HIGHLIGHT ===== */
var navLinks = document.querySelectorAll('.nav-link');
new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (!e.isIntersecting) return;
    navLinks.forEach(function (a) { a.style.cssText = ''; });
    var a = document.querySelector('.nav-link[href="#' + e.target.id + '"]');
    if (a) { a.style.color = 'var(--accent)'; a.style.borderColor = 'var(--accent)'; a.style.background = 'rgba(0,212,255,0.06)'; }
  });
}, { threshold: 0.4 }).observe && document.querySelectorAll('section[id]').forEach(function (s) {
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.style.cssText = ''; });
      var a = document.querySelector('.nav-link[href="#' + e.target.id + '"]');
      if (a) { a.style.color = 'var(--accent)'; a.style.borderColor = 'var(--accent)'; a.style.background = 'rgba(0,212,255,0.06)'; }
    });
  }, { threshold: 0.4 }).observe(s);
});