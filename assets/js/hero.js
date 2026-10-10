/* ============================================================
   hero.js — 首屏主视觉：「智能核心 · 要素辐射」
   纯 Canvas 2D 手绘动画，无外部依赖
   构成：① 流场背景粒子 ② 核心光核 ③ 三条要素轨道
        ④ 八大产业辐射弧 ⑤ 脉冲涟漪
   配色：纸面上的墨与水彩 —— 不使用加色混合，靠低透明叠加成色
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var VZ = window.VZ, C = VZ.C;
  var PAPER = [247, 244, 237];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0;
  var t = 0, running = true, raf = null;

  /* 三大要素（对应新质生产力三要素） */
  var RINGS = [
    { label: '劳动者',   color: C.amber,  r: 0.115, tilt: 0.30,  speed:  0.00042, dots: 34 },
    { label: '劳动资料', color: C.azure,  r: 0.155, tilt: -0.22, speed: -0.00031, dots: 46 },
    { label: '劳动对象', color: C.jade,   r: 0.196, tilt: 0.44,  speed:  0.00023, dots: 58 }
  ];

  /* 八大辐射产业 */
  var SECTORS = [
    { name: '智能制造', color: C.coral },
    { name: '医疗健康', color: C.jade },
    { name: '智慧农业', color: C.olive },
    { name: '金融服务', color: C.amber },
    { name: '交通物流', color: C.azure },
    { name: '能源电力', color: C.teal },
    { name: '教育科研', color: C.indigo },
    { name: '政务民生', color: C.lilac }
  ];

  var P = [];
  var PCOUNT = 420;
  var pulses = [];
  var ripples = [];
  var hoverIdx = -1;
  var mouse = { x: -9999, y: -9999 };

  /* ------------------------------------------------ 尺寸 */
  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    W = Math.max(320, rect.width);
    H = Math.max(420, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cx = W > 900 ? W * 0.760 : W * 0.5;
    cy = W > 900 ? H * 0.335 : H * 0.70;
    buildParticles();
  }

  function unit() { return Math.min(W, H); }

  function buildParticles() {
    P.length = 0;
    var n = W < 700 ? Math.round(PCOUNT * 0.34) : PCOUNT;
    var r = VZ.rng(7);
    for (var i = 0; i < n; i++) {
      P.push({
        x: r() * W, y: r() * H, px: 0, py: 0,
        life: r() * 260, max: 200 + r() * 320,
        ci: Math.floor(r() * 10), w: 0.5 + r() * 1.0
      });
      P[i].px = P[i].x; P[i].py = P[i].y;
    }
  }

  /* ------------------------------------------------ 流场 */
  function flowAngle(x, y, tt) {
    var s = 0.0021;
    var a = Math.sin(x * s + tt * 0.00021) * Math.cos(y * s * 1.17 - tt * 0.00029);
    var b = Math.sin((x + y * 0.6) * s * 0.72 + tt * 0.00016);
    var c = Math.cos((x * 0.4 - y) * s * 1.31 - tt * 0.00012);
    var ang = (a + b * 0.8 + c * 0.5) * Math.PI * 0.85;

    var dx = cx - x, dy = cy - y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    var pull = Math.exp(-d / (unit() * 0.30));
    var ta = Math.atan2(dy, dx) + Math.PI * 0.42;
    var ax = Math.cos(ang) * (1 - pull) + (Math.cos(ta) * 0.75 + dx / d * 0.55) * pull;
    var ay = Math.sin(ang) * (1 - pull) + (Math.sin(ta) * 0.75 + dy / d * 0.55) * pull;
    return Math.atan2(ay, ax);
  }

  function sectorPos(i, tt) {
    var u = unit();
    var base = -Math.PI * 0.5 + (i / SECTORS.length) * Math.PI * 2 + tt * 0.000045;
    var rr = u * (W > 900 ? 0.238 : 0.30);
    return { x: cx + Math.cos(base) * rr * 1.06, y: cy + Math.sin(base) * rr * 0.92, a: base };
  }

  /* ------------------------------------------------ 绘制：背景流场 */
  function drawField() {
    // 用 destination-out 把拖尾「擦」淡，让纸面透出来（而不是往上盖深色）
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.055)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      var ang = flowAngle(p.x, p.y, t);
      var sp = 0.55 + (p.w * 0.5);
      p.px = p.x; p.py = p.y;
      p.x += Math.cos(ang) * sp;
      p.y += Math.sin(ang) * sp;
      p.life++;

      var dx = p.x - cx, dy = p.y - cy;
      var d = Math.sqrt(dx * dx + dy * dy);
      var core = Math.exp(-d / (unit() * 0.30));
      var al = (0.05 + core * 0.30) * Math.min(1, p.life / 60);
      if (p.life > p.max - 70) al *= Math.max(0, (p.max - p.life) / 70);

      if (p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30 || p.life > p.max) {
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.px = p.x; p.py = p.y;
        p.life = 0; p.ci = Math.floor(Math.random() * 10);
        continue;
      }
      ctx.strokeStyle = VZ.alpha(VZ.SEQ[p.ci], VZ.clamp(al, 0, 0.42));
      ctx.lineWidth = p.w * (0.6 + core * 1.4);
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  /* ------------------------------------------------ 绘制：核心 */
  function drawCore() {
    var u = unit();
    var base = u * 0.052;
    var pulse = 1 + Math.sin(t * 0.0016) * 0.06 + Math.sin(t * 0.0043) * 0.03;
    ctx.globalCompositeOperation = 'source-over';

    // 外圈淡淡的水彩色晕
    var halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 3.4);
    halo.addColorStop(0, 'rgba(188,74,36,0.11)');
    halo.addColorStop(0.26, 'rgba(185,138,46,0.065)');
    halo.addColorStop(0.58, 'rgba(95,100,148,0.032)');
    halo.addColorStop(1, 'rgba(247,244,237,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, base * 3.4, 0, Math.PI * 2); ctx.fill();

    // 同心细环
    for (var k = 0; k < 4; k++) {
      var rr = base * (1.55 + k * 0.62) * pulse;
      ctx.strokeStyle = VZ.alpha(k % 2 ? C.azure : C.amber, 0.42 - k * 0.07);
      ctx.lineWidth = 0.8;
      var a0 = t * (0.00022 + k * 0.00013) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(cx, cy, rr, a0, a0 + Math.PI * 1.35);
      ctx.stroke();
    }

    // 内芯：浓墨点 + 朱砂外晕
    var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 1.15 * pulse);
    core.addColorStop(0, 'rgba(143,52,22,0.92)');
    core.addColorStop(0.30, 'rgba(188,74,36,0.55)');
    core.addColorStop(0.68, 'rgba(185,138,46,0.16)');
    core.addColorStop(1, 'rgba(185,138,46,0)');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(cx, cy, base * 1.15 * pulse, 0, Math.PI * 2); ctx.fill();

    // 十字光芒
    ctx.strokeStyle = 'rgba(27,22,17,0.20)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - base * 2.6, cy); ctx.lineTo(cx + base * 2.6, cy);
    ctx.moveTo(cx, cy - base * 2.6); ctx.lineTo(cx, cy + base * 2.6);
    ctx.stroke();
  }

  /* ------------------------------------------------ 绘制：三要素轨道 */
  function orbitPoint(ring, phase, tt) {
    var u = unit();
    var rr = u * ring.r;
    var a = phase + tt * ring.speed * 1000;
    var x = Math.cos(a) * rr;
    var y = Math.sin(a) * rr * (1 - Math.abs(ring.tilt));
    var ry = y * Math.cos(ring.tilt);
    var rz = y * Math.sin(ring.tilt);
    return { x: cx + x, y: cy + ry, z: rz, a: a };
  }

  function drawRings() {
    var u = unit();
    ctx.globalCompositeOperation = 'source-over';

    RINGS.forEach(function (ring) {
      var rx = u * ring.r, ry = u * ring.r * (1 - Math.abs(ring.tilt));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.tilt * 0.5);
      ctx.strokeStyle = VZ.alpha(ring.color, 0.26);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      for (var i = 0; i < ring.dots; i++) {
        var ph = (i / ring.dots) * Math.PI * 2;
        var pt = orbitPoint(ring, ph, t);
        var depth = (Math.sin(pt.a + ring.tilt) + 1) / 2;
        var al = 0.22 + depth * 0.58;
        var sz = 0.8 + depth * 1.6;
        ctx.fillStyle = VZ.alpha(ring.color, al);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /* ------------------------------------------------ 绘制：产业辐射 */
  function drawSectors() {
    var u = unit();
    var ringR = u * 0.052 * 1.6;

    SECTORS.forEach(function (sec, i) {
      var s = sectorPos(i, t);
      var dx = s.x - cx, dy = s.y - cy;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / d, uy = dy / d;

      var x0 = cx + ux * ringR, y0 = cy + uy * ringR;
      var x1 = s.x - ux * (u * 0.028), y1 = s.y - uy * (u * 0.028);
      var mx = (x0 + x1) / 2 - uy * u * 0.055;
      var my = (y0 + y1) / 2 + ux * u * 0.055;

      var hot = hoverIdx === i;

      ctx.strokeStyle = VZ.alpha(sec.color, hot ? 0.85 : 0.34);
      ctx.lineWidth = hot ? 1.6 : 0.9;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(mx, my, x1, y1);
      ctx.stroke();

      // 节点外圈淡晕
      var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 20);
      g.addColorStop(0, VZ.alpha(sec.color, hot ? 0.30 : 0.16));
      g.addColorStop(1, VZ.alpha(sec.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, 20, 0, Math.PI * 2); ctx.fill();

      // 节点
      ctx.fillStyle = VZ.alpha(sec.color, hot ? 1 : 0.86);
      ctx.beginPath(); ctx.arc(s.x, s.y, hot ? 4.2 : 2.7, 0, Math.PI * 2); ctx.fill();
      if (hot) {
        ctx.strokeStyle = VZ.alpha(sec.color, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(s.x, s.y, 11, 0, Math.PI * 2); ctx.stroke();
      }

      // 标签：先定方向，再按画布边界收拢，保证永不出血
      ctx.font = (hot ? '600 ' : '400 ') + '11.5px -apple-system, "PingFang SC", sans-serif';
      var gap = u * 0.022;
      var tw = ctx.measureText(sec.name).width;
      var right = s.x > cx;
      if (right && s.x + gap + tw > W - 10) right = false;
      if (!right && s.x - gap - tw < 10) right = true;
      ctx.textAlign = right ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      var tx = s.x + (right ? gap : -gap);
      tx = VZ.clamp(tx, right ? 10 : 10 + tw, right ? W - 10 - tw : W - 10);
      ctx.fillStyle = hot ? sec.color : 'rgba(27,22,17,0.62)';
      ctx.fillText(sec.name, tx, s.y);
    });
  }

  /* ------------------------------------------------ 绘制：脉冲与涟漪 */
  function spawnPulse() {
    var i = Math.floor(Math.random() * SECTORS.length);
    pulses.push({ i: i, p: 0, sp: 0.0075 + Math.random() * 0.006 });
  }

  function drawPulses(dt) {
    var u = unit();
    ctx.globalCompositeOperation = 'source-over';

    function qpOf(i, tt) {
      var sec = SECTORS[i];
      var s2 = sectorPos(i, t);
      var dx = s2.x - cx, dy = s2.y - cy;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / d, uy = dy / d;
      var ringR = u * 0.052 * 1.6;
      var x0 = cx + ux * ringR, y0 = cy + uy * ringR;
      var x1 = s2.x - ux * (u * 0.028), y1 = s2.y - uy * (u * 0.028);
      var mx = (x0 + x1) / 2 - uy * u * 0.055;
      var my = (y0 + y1) / 2 + ux * u * 0.055;
      var a = (1 - tt) * (1 - tt), b = 2 * (1 - tt) * tt, c2 = tt * tt;
      return { x: a * x0 + b * mx + c2 * x1, y: a * y0 + b * my + c2 * y1 };
    }

    for (var k = pulses.length - 1; k >= 0; k--) {
      var pu = pulses[k];
      pu.p += pu.sp * dt * 0.06;
      if (pu.p > 1) {
        var s = sectorPos(pu.i, t);
        ripples.push({ x: s.x, y: s.y, r: 4, a: 0.55, c: SECTORS[pu.i].color });
        pulses.splice(k, 1);
        continue;
      }
      var sec = SECTORS[pu.i];

      ctx.beginPath();
      for (var j = 0; j <= 8; j++) {
        var q = qpOf(pu.i, Math.max(0, pu.p - j * 0.035));
        if (j === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = VZ.alpha(sec.color, 0.8);
      ctx.lineWidth = 1.7;
      ctx.stroke();

      var head = qpOf(pu.i, pu.p);
      var hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
      hg.addColorStop(0, 'rgba(143,52,22,0.90)');
      hg.addColorStop(0.35, VZ.alpha(sec.color, 0.62));
      hg.addColorStop(1, VZ.alpha(sec.color, 0));
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(head.x, head.y, 12, 0, Math.PI * 2); ctx.fill();
    }

    for (var m = ripples.length - 1; m >= 0; m--) {
      var rp = ripples[m];
      rp.r += 1.15; rp.a *= 0.945;
      if (rp.a < 0.02) { ripples.splice(m, 1); continue; }
      ctx.strokeStyle = VZ.alpha(rp.c, rp.a);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  /* ------------------------------------------------ 主循环 */
  var last = 0;
  function loop(ts) {
    if (!last) last = ts;
    var dt = Math.min(48, ts - last);
    last = ts;
    t += dt;

    drawField();
    drawRings();
    drawSectors();
    drawCore();
    drawPulses(dt);

    if (running) raf = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------ 交互 */
  function hitTest(mx, my) {
    var best = -1, bd = unit() * 0.062;
    for (var i = 0; i < SECTORS.length; i++) {
      var s = sectorPos(i, t);
      var d = Math.hypot(s.x - mx, s.y - my);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  window.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    hoverIdx = hitTest(mouse.x, mouse.y);
    canvas.style.cursor = hoverIdx >= 0 ? 'pointer' : 'default';
  }, { passive: true });

  window.addEventListener('pointerleave', function () { hoverIdx = -1; });

  canvas.addEventListener('click', function () {
    for (var i = 0; i < SECTORS.length; i++) {
      pulses.push({ i: i, p: Math.random() * 0.12, sp: 0.008 + Math.random() * 0.007 });
    }
  });

  /* ------------------------------------------------ 可见性控制 */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var vis = en.isIntersecting;
      if (vis && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
      if (!vis && running) { running = false; if (raf) cancelAnimationFrame(raf); }
    });
  }, { threshold: 0.02 });
  io.observe(canvas.parentElement);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; if (raf) cancelAnimationFrame(raf); }
    else if (!running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
  });

  /* ------------------------------------------------ 启动 */
  window.addEventListener('resize', VZ.debounce(resize, 150));
  resize();
  requestAnimationFrame(loop);
  setInterval(function () { if (running && pulses.length < 5) spawnPulse(); }, 900);
})();
