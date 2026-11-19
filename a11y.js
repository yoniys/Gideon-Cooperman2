/*
 * Accessibility menu (תפריט נגישות)
 * A small, self-contained widget: larger text, high contrast, underlined links,
 * stop animations, and a link to the accessibility statement.
 * Choices are saved only in the visitor's browser (localStorage) and never sent anywhere.
 * Load it in <head> (not deferred) so saved choices apply before the page paints.
 */
(function () {
  var KEY = 'a11y-prefs';
  var TEXT_STEPS = [1, 1.15, 1.3, 1.5];
  var DEFAULTS = { text: 0, contrast: false, links: false, motion: false };
  var prefs = copy(DEFAULTS);
  var root = document.documentElement;

  function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) for (var k in prefs) if (k in saved) prefs[k] = saved[k];
    prefs.text = Math.max(0, Math.min(TEXT_STEPS.length - 1, parseInt(prefs.text, 10) || 0));
  } catch (e) { /* storage unavailable: use defaults */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ }
  }

  function apply() {
    root.style.setProperty('--a11y-zoom', TEXT_STEPS[prefs.text]);
    root.classList.toggle('a11y-text', prefs.text > 0);
    root.classList.toggle('a11y-contrast', !!prefs.contrast);
    root.classList.toggle('a11y-links', !!prefs.links);
    root.classList.toggle('a11y-motion', !!prefs.motion);
  }

  var css = [
    /* ---- page adjustments ---- */
    'html.a11y-text body > *:not(.a11y-widget){zoom:var(--a11y-zoom);}',
    'html.a11y-links a{text-decoration:underline !important; text-underline-offset:3px;}',
    'html.a11y-motion *, html.a11y-motion *::before, html.a11y-motion *::after{animation:none !important; transition:none !important; scroll-behavior:auto !important;}',
    'html.a11y-motion .reveal{opacity:1 !important; transform:none !important;}',
    'html.a11y-contrast{--ink:#000; --ink-soft:#000; --gray:#1f1f1f; --gray-line:#4d4d4d; --field-line:#000; --gold:#5c4510; --gold-deep:#5c4510; --gold-soft:#ffd27a;}',
    'html.a11y-contrast body{color:#000;}',
    'html.a11y-contrast .hero::before{opacity:.12;}',
    'html.a11y-contrast .one-section, html.a11y-contrast .arm-card{background:#000 !important;}',
    'html.a11y-contrast .one-section p, html.a11y-contrast .one-head .sub, html.a11y-contrast .one-body, html.a11y-contrast .arm-card p{color:#fff !important;}',
    'html.a11y-contrast .logo-item img{filter:none;}',

    /* ---- the widget itself (fixed colours so page modes never break it) ---- */
    '.a11y-widget{position:fixed; left:16px; bottom:16px; z-index:1000; direction:rtl; font-family:"Heebo",system-ui,-apple-system,sans-serif; line-height:1.4;}',
    '.a11y-widget *{box-sizing:border-box;}',
    '.a11y-widget :focus-visible{outline:3px solid #c9a355 !important; outline-offset:2px;}',
    '.a11y-toggle{width:52px; height:52px; border-radius:50%; background:#1c1a17; color:#fff; border:2px solid #fff; box-shadow:0 4px 16px rgba(0,0,0,.28); display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0;}',
    '.a11y-toggle:hover{background:#8a6a20;}',
    '.a11y-toggle svg{width:30px; height:30px; display:block;}',
    '.a11y-panel{position:absolute; left:0; bottom:64px; width:min(300px, calc(100vw - 32px)); background:#fff; color:#1c1a17; border:1px solid #8f897d; border-radius:6px; box-shadow:0 12px 40px rgba(0,0,0,.22); padding:18px;}',
    '.a11y-panel[hidden]{display:none;}',
    '.a11y-panel h2{font-size:17px; font-weight:700; margin:0 0 10px; padding:0; border:0; color:#1c1a17;}',
    '.a11y-row{display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 0; border-top:1px solid #e4e0d8; font-size:15px;}',
    '.a11y-size{display:flex; align-items:center; gap:6px;}',
    '.a11y-size output{min-width:44px; text-align:center; font-size:14px; color:#4a463f;}',
    '.a11y-btn{font:inherit; font-size:15px; font-weight:600; background:#faf9f7; color:#1c1a17; border:1px solid #8f897d; border-radius:4px; min-width:40px; min-height:38px; padding:4px 10px; cursor:pointer;}',
    '.a11y-btn:hover:not(:disabled){border-color:#1c1a17;}',
    '.a11y-btn:disabled{opacity:.4; cursor:default;}',
    '.a11y-opt{width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; font:inherit; font-size:15px; background:none; color:#1c1a17; border:0; border-top:1px solid #e4e0d8; padding:11px 0; cursor:pointer; text-align:right;}',
    '.a11y-state{flex-shrink:0; font-size:12.5px; font-weight:600; border:1px solid #8f897d; border-radius:20px; padding:2px 10px; color:#4a463f; background:#fff;}',
    '.a11y-opt[aria-pressed="true"] .a11y-state{background:#1c1a17; border-color:#1c1a17; color:#fff;}',
    '.a11y-foot{display:flex; align-items:center; justify-content:space-between; gap:10px; border-top:1px solid #e4e0d8; padding-top:12px; margin-top:2px; font-size:14px;}',
    '.a11y-foot a{color:#8a6a20; text-decoration:underline; text-underline-offset:3px;}',
    '.a11y-reset{font:inherit; font-size:14px; background:none; border:0; color:#1c1a17; text-decoration:underline; text-underline-offset:3px; cursor:pointer; padding:4px 0;}',
    '@media print{.a11y-widget{display:none;}}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'a11y-style';
  style.textContent = css;
  (document.head || root).appendChild(style);
  apply();

  var ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="4" r="2"/>' +
    '<path d="M19 9.5c0 .55-.45 1-1 1h-3.6v3.1l2.4 6.05a1 1 0 1 1-1.86.74L12.9 15h-1.8l-2.04 5.39a1 1 0 1 1-1.86-.74l2.4-6.05V10.5H6a1 1 0 1 1 0-2h12c.55 0 1 .45 1 1Z"/>' +
    '</svg>';

  var OPTIONS = [
    { key: 'contrast', label: 'ניגודיות גבוהה' },
    { key: 'links', label: 'הדגשת קישורים' },
    { key: 'motion', label: 'עצירת אנימציות' }
  ];

  function build() {
    var statementHref = 'accessibility.html';

    var wrap = document.createElement('div');
    wrap.className = 'a11y-widget';
    wrap.innerHTML =
      '<button type="button" class="a11y-toggle" id="a11yToggle" aria-expanded="false" aria-controls="a11yPanel" aria-label="תפריט נגישות">' + ICON + '</button>' +
      '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-modal="false" aria-labelledby="a11yTitle" hidden>' +
        '<h2 id="a11yTitle">תפריט נגישות</h2>' +
        '<div class="a11y-row">' +
          '<span id="a11ySizeLabel">גודל טקסט</span>' +
          '<div class="a11y-size" role="group" aria-labelledby="a11ySizeLabel">' +
            '<button type="button" class="a11y-btn" data-size="-1" aria-label="הקטנת טקסט">א-</button>' +
            '<output id="a11ySizeValue" aria-live="polite"></output>' +
            '<button type="button" class="a11y-btn" data-size="1" aria-label="הגדלת טקסט">א+</button>' +
          '</div>' +
        '</div>' +
        OPTIONS.map(function (o) {
          return '<button type="button" class="a11y-opt" data-opt="' + o.key + '" aria-pressed="false">' +
                   '<span>' + o.label + '</span><span class="a11y-state" aria-hidden="true"></span>' +
                 '</button>';
        }).join('') +
        '<div class="a11y-foot">' +
          '<a href="' + statementHref + '">הצהרת נגישות</a>' +
          '<button type="button" class="a11y-reset">איפוס הגדרות</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    var toggle = wrap.querySelector('#a11yToggle');
    var panel = wrap.querySelector('#a11yPanel');
    var sizeOut = wrap.querySelector('#a11ySizeValue');
    var minus = wrap.querySelector('[data-size="-1"]');
    var plus = wrap.querySelector('[data-size="1"]');

    function render() {
      sizeOut.textContent = Math.round(TEXT_STEPS[prefs.text] * 100) + '%';
      minus.disabled = prefs.text === 0;
      plus.disabled = prefs.text === TEXT_STEPS.length - 1;
      OPTIONS.forEach(function (o) {
        var b = wrap.querySelector('[data-opt="' + o.key + '"]');
        var on = !!prefs[o.key];
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.querySelector('.a11y-state').textContent = on ? 'פעיל' : 'כבוי';
      });
    }

    function update() { apply(); save(); render(); }

    function open() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      var first = panel.querySelector('button:not(:disabled)');
      if (first) first.focus();
    }
    function close(returnFocus) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () { panel.hidden ? open() : close(false); });

    panel.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.hasAttribute('data-size')) {
        prefs.text = Math.max(0, Math.min(TEXT_STEPS.length - 1, prefs.text + parseInt(t.getAttribute('data-size'), 10)));
        update();
        if (t.disabled) (t === plus ? minus : plus).focus();
      } else if (t.hasAttribute('data-opt')) {
        var key = t.getAttribute('data-opt');
        prefs[key] = !prefs[key];
        update();
      } else if (t.classList.contains('a11y-reset')) {
        prefs = copy(DEFAULTS);
        apply();
        render();
        try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
        minus.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close(true);
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !wrap.contains(e.target)) close(false);
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
