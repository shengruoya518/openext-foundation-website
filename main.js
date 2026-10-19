(function () {
  var root = document.documentElement;

  /* ---------- Language ---------- */
  var META = {
    zh: {
      title: 'OpeNext Foundation · 打破边界，无界赋能',
      desc: 'OpeNext Foundation 是一家 501(c)(3) 非营利组织，以教育、导师陪伴与资源共享，培育全球下一代创新者与创业领袖。',
      htmlLang: 'zh-Hans'
    },
    en: {
      title: 'OpeNext Foundation · Breaking Boundaries, Empowering Growth',
      desc: 'OpeNext Foundation is a 501(c)(3) non-profit nurturing tomorrow’s global innovators and entrepreneurial leaders through education, mentorship, and resource sharing.',
      htmlLang: 'en'
    }
  };

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', META[lang].htmlLang);
    document.title = META[lang].title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', META[lang].desc);
    document.querySelectorAll('option[data-' + lang + ']').forEach(function (o) {
      o.textContent = o.getAttribute('data-' + lang);
    });
    try { localStorage.setItem('openext-lang', lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem('openext-lang'); } catch (e) {}
  var param = new URLSearchParams(location.search).get('lang');
  var initial = param || saved || ((navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');
  setLang(META[initial] ? initial : 'en');

  document.querySelector('.lang-toggle').addEventListener('click', function () {
    setLang(root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
  });

  /* ---------- Hub local clocks ---------- */
  var hubs = document.querySelectorAll('.hubs li[data-tz]');
  function tick() {
    var now = new Date();
    hubs.forEach(function (li) {
      li.querySelector('.hub-time').textContent = now.toLocaleTimeString('en-GB', {
        timeZone: li.getAttribute('data-tz'), hour: '2-digit', minute: '2-digit'
      });
    });
  }
  tick();
  setInterval(tick, 30000);

  /* ---------- Header state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 20); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  var targets = document.querySelectorAll('.section-head, .prose, .quote-card, .belief-intro, .pillar, .stats > div, .program, .contact-copy, .contact-form');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  /* ---------- Contact form (posted to Web3Forms, delivered to the foundation inbox) ---------- */
  var MSG = {
    sending: { zh: '发送中…', en: 'Sending…' },
    ok: { zh: '感谢您的留言！我们已收到，会尽快与您联系。', en: 'Thank you! Your message has been received — we’ll be in touch soon.' },
    err: { zh: '抱歉，发送失败，请稍后再试。', en: 'Sorry, something went wrong. Please try again later.' }
  };
  var form = document.querySelector('.contact-form');
  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  function showStatus(kind) {
    var lang = root.getAttribute('data-lang');
    status.hidden = false;
    status.className = 'form-status' + (kind === 'sending' ? '' : ' ' + kind);
    status.textContent = MSG[kind][lang];
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form));
    data.subject = 'OpeNext 网站留言 / Website message — ' + data.name;
    data.replyto = data.email;
    submitBtn.disabled = true;
    showStatus('sending');
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message);
        form.reset();
        showStatus('ok');
      })
      .catch(function () { showStatus('err'); })
      .finally(function () { submitBtn.disabled = false; });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
