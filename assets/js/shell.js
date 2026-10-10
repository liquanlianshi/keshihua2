/* ============================================================
   shell.js — 站点外壳交互
   载入动画 / 顶部进度 / 章节导航 / 滚动显现 / 数字滚动 / 标签页
   ============================================================ */
(function () {
  'use strict';
  var VZ = window.VZ;

  /* -------------------------------------------- 载入动画 */
  function boot() {
    var el = document.getElementById('boot');
    var bar = document.getElementById('bootBar');
    var pct = document.getElementById('bootPct');
    if (!el) return;
    var v = 0;
    var iv = setInterval(function () {
      v = Math.min(100, v + (v < 60 ? 9 : v < 88 ? 4 : 1.4));
      if (bar) bar.style.width = v + '%';
      if (pct) pct.textContent = String(Math.round(v)).padStart(3, '0');
      if (v >= 100) {
        clearInterval(iv);
        setTimeout(function () {
          el.classList.add('is-done');
          document.body.classList.add('is-ready');
          // 淡出结束后彻底移出渲染树，避免任何残留
          setTimeout(function () { el.style.display = 'none'; }, 1100);
        }, 220);
      }
    }, 46);
  }

  /* -------------------------------------------- 顶部滚动进度 + 顶栏状态 */
  function progress() {
    var bar = document.getElementById('topProgress');
    var topbar = document.getElementById('topbar');
    function upd() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
      if (topbar) topbar.classList.toggle('is-stuck', window.scrollY > 40);
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* -------------------------------------------- 章节图版编号（右上角书眉） */
  function folios() {
    var secs = VZ.qa('[data-chapter]');
    var total = secs.length - 1;             // 首屏不计入章序
    secs.forEach(function (sec) {
      var head = sec.querySelector('.chapter__head');
      if (!head) return;
      var panels = sec.querySelectorAll('.panel').length;
      if (!panels) return;
      var no = parseInt(sec.id.replace('ch-', ''), 10);
      if (!no) return;
      var f = document.createElement('span');
      f.className = 'chapter__folio';
      f.setAttribute('aria-hidden', 'true');
      f.textContent = 'CHAPTER ' + String(no).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')
        + ' · PLATES 01–' + String(panels).padStart(2, '0');
      head.appendChild(f);
    });
  }

  /* -------------------------------------------- 章节导航高亮 */
  function chapters() {
    var secs = VZ.qa('[data-chapter]');
    var railItems = VZ.qa('.rail__item');
    var navLinks = VZ.qa('.topnav a');
    if (!secs.length) return;

    function setActive(id) {
      railItems.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-target') === id); });
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
    }

    var io = new IntersectionObserver(function (es) {
      var best = null;
      es.forEach(function (en) {
        if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en;
      });
      if (best) setActive(best.target.id);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.05, 0.2, 0.5] });

    secs.forEach(function (s) { io.observe(s); });

    railItems.forEach(function (r) {
      r.addEventListener('click', function () {
        var t = document.getElementById(r.getAttribute('data-target'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* -------------------------------------------- KPI 数字滚动 */
  function counters() {
    var els = VZ.qa('[data-count]');
    if (!els.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var to = parseFloat(el.getAttribute('data-count'));
        var dp = parseInt(el.getAttribute('data-dp') || '0', 10);
        var mode = el.getAttribute('data-fmt') || 'group';
        var fmt = mode === 'cn' ? VZ.cn : VZ.group;
        VZ.countUp(el, to, { dp: dp, fmt: fmt, dur: 1600 });
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* -------------------------------------------- 标签页 */
  function tabs() {
    VZ.qa('[data-tabs]').forEach(function (group) {
      var btns = VZ.qa('.tabs__btn', group);
      var wrap = group.closest('[data-tab-scope]') || document;
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () {
          btns.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
          b.classList.add('is-active');
          b.setAttribute('aria-selected', 'true');
          var panes = VZ.qa('.tabpane', wrap);
          panes.forEach(function (p) { p.classList.remove('is-active'); });
          var target = document.getElementById(b.getAttribute('data-pane'));
          if (target) {
            target.classList.add('is-active');
            // 重新计算内部图表尺寸
            setTimeout(function () {
              VZ.qa('.chart', target).forEach(function (c) {
                var inst = window.echarts && window.echarts.getInstanceByDom(c);
                if (inst) inst.resize();
              });
            }, 60);
          }
          var c = b.getAttribute('data-tab-c');
          if (c) group.style.setProperty('--tab-c', c);
        });
      });
    });
  }

  /* -------------------------------------------- 锚点平滑滚动补偿顶栏 */
  function anchors() {
    VZ.qa('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        var y = t.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', '#' + id);
      });
    });
  }

  /* -------------------------------------------- 鼠标光斑 */
  function glow() {
    if (window.matchMedia('(hover: none)').matches) return;
    var g = document.getElementById('cursorGlow');
    if (!g) return;
    var x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function tick() {
      cx += (x - cx) * 0.075; cy += (y - cy) * 0.075;
      g.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    })();
  }

  /* -------------------------------------------- 时间轴滚动显现 */
  function timeline() {
    VZ.qa('.tl__item').forEach(function (item, i) {
      item.classList.add('reveal');
      item.setAttribute('data-delay', String(Math.min(5, i)));
    });
  }

  /* -------------------------------------------- 启动 */
  function init() {
    boot();
    progress();
    folios();
    chapters();
    counters();
    tabs();
    anchors();
    glow();
    timeline();
    VZ.observeReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('load', function () { setTimeout(function () { VZ.observeReveal(); }, 100); });

  /* 兜底：某些情况下（快速跳转 / IO 未触发）确保已进入或越过视口的元素可见 */
  function revealFallback() {
    var vh = window.innerHeight;
    VZ.qa('.reveal:not(.is-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 1.05 && r.bottom > -vh) el.classList.add('is-in');
    });
  }
  window.addEventListener('scroll', VZ.debounce(revealFallback, 220), { passive: true });
  window.addEventListener('hashchange', function () { setTimeout(revealFallback, 420); });
  setTimeout(revealFallback, 1800);
})();
