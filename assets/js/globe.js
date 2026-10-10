/* ============================================================
   globe.js — 全球人工智能创新流向 · 点阵地球
   手写 Canvas 2D 正交投影渲染：海岸线点阵 + 大圆航线 + 脉动光点
   无第三方依赖 · 支持拖拽旋转 / 滚轮缩放
   ============================================================ */
(function () {
  'use strict';
  var canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var VZ = window.VZ, C = VZ.C;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, R = 0, ox = 0, oy = 0;
  var yaw = -0.55, pitch = 0.42, dragYaw = 0, dragPitch = 0;
  var zoom = 1, targetZoom = 1;
  var running = true, raf = null, t = 0;
  var dragging = false, lastX = 0, lastY = 0, idle = 0;
  var hover = null;

  /* ---------------------------------------------- 主要创新节点 */
  var NODES = [
    { n: '北京', lat: 39.90, lon: 116.40, c: 'coral', w: 1.0 },
    { n: '深圳', lat: 22.54, lon: 114.06, c: 'rose', w: .7 },
    { n: '上海', lat: 31.23, lon: 121.47, c: 'amber', w: .8 },
    { n: '杭州', lat: 30.27, lon: 120.16, c: 'coral', w: .6 },
    { n: '东京', lat: 35.68, lon: 139.69, c: 'indigo', w: .75 },
    { n: '首尔', lat: 37.57, lon: 126.98, c: 'azure', w: .6 },
    { n: '新加坡', lat: 1.35, lon: 103.82, c: 'jade', w: .6 },
    { n: '班加罗尔', lat: 12.97, lon: 77.59, c: 'olive', w: .6 },
    { n: '迪拜', lat: 25.20, lon: 55.27, c: 'sand', w: .45 },
    { n: '特拉维夫', lat: 32.08, lon: 34.78, c: 'lilac', w: .45 },
    { n: '伦敦', lat: 51.51, lon: -0.13, c: 'azure', w: .8 },
    { n: '巴黎', lat: 48.86, lon: 2.35, c: 'indigo', w: .5 },
    { n: '柏林', lat: 52.52, lon: 13.40, c: 'teal', w: .55 },
    { n: '苏黎世', lat: 47.37, lon: 8.54, c: 'lilac', w: .4 },
    { n: '旧金山', lat: 37.77, lon: -122.42, c: 'amber', w: 1.0 },
    { n: '西雅图', lat: 47.61, lon: -122.33, c: 'sand', w: .55 },
    { n: '纽约', lat: 40.71, lon: -74.01, c: 'azure', w: .8 },
    { n: '波士顿', lat: 42.36, lon: -71.06, c: 'indigo', w: .5 },
    { n: '多伦多', lat: 43.65, lon: -79.38, c: 'teal', w: .45 },
    { n: '圣保罗', lat: -23.55, lon: -46.63, c: 'jade', w: .45 },
    { n: '悉尼', lat: -33.87, lon: 151.21, c: 'olive', w: .45 },
    { n: '开罗', lat: 30.04, lon: 31.24, c: 'sand', w: .4 },
    { n: '内罗毕', lat: -1.29, lon: 36.82, c: 'rose', w: .35 }
  ];

  /* ---------------------------------------------- 技术流动弧线 */
  var ARCS = [
    [0, 14, 'coral'], [0, 10, 'coral'], [0, 4, 'coral'], [0, 6, 'coral'],
    [0, 8, 'amber'], [0, 2, 'amber'], [0, 12, 'jade'], [0, 20, 'jade'],
    [0, 19, 'olive'], [0, 22, 'rose'], [0, 16, 'coral'], [0, 11, 'coral'],
    [14, 10, 'azure'], [10, 12, 'azure'], [16, 10, 'azure'], [4, 5, 'indigo'],
    [6, 7, 'teal'], [20, 6, 'olive'], [14, 15, 'sand'], [13, 12, 'lilac'],
    [8, 9, 'sand'], [18, 22, 'lilac']
  ];

  /* ---------------------------------------------- 地理掩膜 */
  var landTest = null;
  function buildLandMask() {
    var gj = window.WORLD_GEOJSON;
    if (!gj || !gj.features) return function () { return false; };
    var MW = 1200, MH = 600;
    var cv = document.createElement('canvas');
    cv.width = MW; cv.height = MH;
    var c2 = cv.getContext('2d');
    c2.fillStyle = '#000'; c2.fillRect(0, 0, MW, MH);
    c2.fillStyle = '#fff';
    var px = function (lon) { return (lon + 180) / 360 * MW; };
    var py = function (lat) { return (90 - lat) / 180 * MH; };

    gj.features.forEach(function (f) {
      var g = f.geometry;
      if (!g) return;
      var polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      polys.forEach(function (poly) {
        poly.forEach(function (ring) {
          c2.beginPath();
          for (var i = 0; i < ring.length; i++) {
            var x = px(ring[i][0]), y = py(ring[i][1]);
            if (i === 0) c2.moveTo(x, y); else c2.lineTo(x, y);
          }
          c2.closePath();
          c2.fill();
        });
      });
    });
    var data = c2.getImageData(0, 0, MW, MH).data;
    landTest = function (lon, lat) {
      var x = Math.round((lon + 180) / 360 * MW);
      var y = Math.round((90 - lat) / 180 * MH);
      if (x < 0) x = 0; if (x >= MW) x = MW - 1;
      if (y < 0) y = 0; if (y >= MH) y = MH - 1;
      return data[(y * MW + x) * 4] > 127;
    };
  }

  /* ---------------------------------------------- 点阵生成 */
  var DOTS = [];
  function buildDots() {
    if (!landTest) buildLandMask();
    DOTS.length = 0;
    var N = 11000;
    var ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rr = Math.sqrt(Math.max(0, 1 - y * y));
      var th = ga * i;
      var x = Math.cos(th) * rr, z = Math.sin(th) * rr;
      var lat = Math.asin(y) * 180 / Math.PI;
      var lon = Math.atan2(z, x) * 180 / Math.PI;
      if (lat > 84 || lat < -60) continue;
      if (landTest(lon, lat)) {
        DOTS.push({ x: x, y: y, z: z, r: 0.7 + Math.random() * 0.75 });
      }
    }
  }

  /* ---------------------------------------------- 数学 */
  function rot(p) {
    var A = yaw, B = pitch;
    var x1 = p.x * Math.cos(A) + p.z * Math.sin(A);
    var z1 = -p.x * Math.sin(A) + p.z * Math.cos(A);
    var y2 = p.y * Math.cos(B) - z1 * Math.sin(B);
    var z2 = p.y * Math.sin(B) + z1 * Math.cos(B);
    return { x: x1, y: y2, z: z2 };
  }
  function ll2v(lat, lon) {
    var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
    return { x: Math.cos(la) * Math.cos(lo), y: Math.sin(la), z: Math.cos(la) * Math.sin(lo) };
  }
  function project(v) {
    return { x: ox + v.x * R, y: oy - v.y * R, z: v.z };
  }

  /* 大圆插值 */
  function gcPath(a, b, seg) {
    var va = ll2v(a.lat, a.lon), vb = ll2v(b.lat, b.lon);
    var dot = Math.max(-1, Math.min(1, va.x * vb.x + va.y * vb.y + va.z * vb.z));
    var om = Math.acos(dot);
    var out = [];
    if (om < 1e-5) return [va, vb];
    var so = Math.sin(om);
    for (var i = 0; i <= seg; i++) {
      var s = i / seg;
      var k1 = Math.sin((1 - s) * om) / so, k2 = Math.sin(s * om) / so;
      var v = { x: va.x * k1 + vb.x * k2, y: va.y * k1 + vb.y * k2, z: va.z * k1 + vb.z * k2 };
      // 抬升
      var lift = 1 + Math.sin(Math.PI * s) * 0.18;
      var len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
      out.push({ x: v.x / len * lift, y: v.y / len * lift, z: v.z / len * lift });
    }
    return out;
  }

  var ARC_CACHE = [];
  function buildArcs() {
    ARC_CACHE.length = 0;
    ARCS.forEach(function (a) {
      var p1 = NODES[a[0]], p2 = NODES[a[1]];
      ARC_CACHE.push({ path: gcPath(p1, p2, 42), color: a[2], phase: Math.random() });
    });
    NODES.forEach(function (n) { n.v = ll2v(n.lat, n.lon); });
  }

  /* ---------------------------------------------- 尺寸 */
  function resize() {
    var wrap = canvas.parentElement.getBoundingClientRect();
    W = Math.max(280, wrap.width);
    H = Math.max(280, wrap.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ox = W / 2; oy = H / 2;
    R = Math.min(W, H) * 0.40;
  }

  /* ---------------------------------------------- 绘制 */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    var yawT = yaw + dragYaw;
    var pitchT = pitch + dragPitch;
    var A = yawT, B = pitchT;
    var RR = R * zoom;

    /* 外层大气光晕 */
    var atm = ctx.createRadialGradient(ox, oy, RR * 0.86, ox, oy, RR * 1.34);
    atm.addColorStop(0, 'rgba(95,100,148,0.14)');
    atm.addColorStop(0.45, 'rgba(192,90,52,0.055)');
    atm.addColorStop(1, 'rgba(247,244,237,0)');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(ox, oy, RR * 1.34, 0, Math.PI * 2); ctx.fill();

    /* 球体底 */
    var sph = ctx.createRadialGradient(ox - RR * .3, oy - RR * .35, RR * .1, ox, oy, RR);
    sph.addColorStop(0, 'rgba(255,253,248,0.98)');
    sph.addColorStop(0.68, 'rgba(247,243,235,0.94)');
    sph.addColorStop(1, 'rgba(233,226,213,0.92)');
    ctx.fillStyle = sph;
    ctx.beginPath(); ctx.arc(ox, oy, RR, 0, Math.PI * 2); ctx.fill();

    /* 经纬网 */
    ctx.strokeStyle = 'rgba(27,22,17,0.055)';
    ctx.lineWidth = 0.6;
    [-60, -30, 0, 30, 60].forEach(function (lat) {
      ctx.beginPath();
      var started = false;
      for (var lon = -180; lon <= 180; lon += 4) {
        var v = ll2v(lat, lon);
        var x1 = v.x * Math.cos(A) + v.z * Math.sin(A);
        var z1 = -v.x * Math.sin(A) + v.z * Math.cos(A);
        var y2 = v.y * Math.cos(B) - z1 * Math.sin(B);
        var z2 = v.y * Math.sin(B) + z1 * Math.cos(B);
        if (z2 <= 0) { started = false; continue; }
        var sx = ox + x1 * RR, sy = oy - y2 * RR;
        if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    });

    /* 海岸线点阵 */
    var cosA = Math.cos(A), sinA = Math.sin(A), cosB = Math.cos(B), sinB = Math.sin(B);
    for (var i = 0; i < DOTS.length; i++) {
      var d = DOTS[i];
      var x1 = d.x * cosA + d.z * sinA;
      var z1 = -d.x * sinA + d.z * cosA;
      var y2 = d.y * cosB - z1 * sinB;
      var z2 = d.y * sinB + z1 * cosB;
      if (z2 <= 0.02) continue;
      var sx = ox + x1 * RR, sy = oy - y2 * RR;
      var depth = z2;
      var al = 0.10 + depth * 0.60;
      var rad = d.r * (0.55 + depth * 0.85) * (zoom * 0.85 + 0.15);
      // 渐变着色：赤道偏暖，高纬偏冷
      var warm = Math.max(0, 1 - Math.abs(d.y) * 1.5);
      ctx.fillStyle = warm > 0.45
        ? 'rgba(143,52,22,' + (al * 0.72).toFixed(3) + ')'
        : 'rgba(74,79,124,' + (al * 0.80).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2); ctx.fill();
    }

    /* 弧线 */
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ARC_CACHE.forEach(function (arc, ai) {
      var col = C[arc.color];
      var pts = [];
      for (var k = 0; k < arc.path.length; k++) {
        var v = arc.path[k];
        var x1 = v.x * cosA + v.z * sinA;
        var z1 = -v.x * sinA + v.z * cosA;
        var y2 = v.y * cosB - z1 * sinB;
        var z2 = v.y * sinB + z1 * cosB;
        pts.push({ x: ox + x1 * RR, y: oy - y2 * RR, z: z2 });
      }
      // 分段绘制可见部分
      ctx.strokeStyle = VZ.alpha(col, 0.46);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      var started = false;
      for (var m = 0; m < pts.length; m++) {
        if (pts[m].z <= 0.02) { started = false; continue; }
        if (!started) { ctx.moveTo(pts[m].x, pts[m].y); started = true; }
        else ctx.lineTo(pts[m].x, pts[m].y);
      }
      ctx.stroke();

      // 流动光点
      var p = ((t * 0.00016 + arc.phase) % 1);
      var idx = Math.floor(p * (pts.length - 1));
      var head = pts[idx];
      if (head && head.z > 0.05) {
        var g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 9);
        g.addColorStop(0, 'rgba(143,52,22,0.92)');
        g.addColorStop(0.35, VZ.alpha(col, 0.72));
        g.addColorStop(1, VZ.alpha(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(head.x, head.y, 9, 0, Math.PI * 2); ctx.fill();
      }
      // 尾迹
      for (var q = 1; q <= 6; q++) {
        var tq = p - q * 0.012;
        if (tq < 0) continue;
        var hq = pts[Math.floor(tq * (pts.length - 1))];
        if (!hq || hq.z <= 0.05) continue;
        ctx.fillStyle = VZ.alpha(col, 0.62 * (1 - q / 7));
        ctx.beginPath(); ctx.arc(hq.x, hq.y, 2.2 * (1 - q / 9), 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalCompositeOperation = 'source-over';

    /* 节点 */
    NODES.forEach(function (n) {
      var v = n.v;
      var x1 = v.x * cosA + v.z * sinA;
      var z1 = -v.x * sinA + v.z * cosA;
      var y2 = v.y * cosB - z1 * sinB;
      var z2 = v.y * sinB + z1 * cosB;
      if (z2 <= 0.03) return;
      var sx = ox + x1 * RR, sy = oy - y2 * RR;
      var col = C[n.c];
      var pulse = 1 + Math.sin(t * 0.0022 + n.lon) * 0.22;
      var sz = (2.0 + n.w * 3.4) * (0.65 + z2 * 0.5) * pulse * (zoom * 0.5 + 0.5);

      var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sz * 5.5);
      g.addColorStop(0, VZ.alpha(col, 0.34 * z2 + 0.10));
      g.addColorStop(1, VZ.alpha(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, sz * 5.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = VZ.alpha(col, 0.70 + z2 * 0.30);
      ctx.beginPath(); ctx.arc(sx, sy, sz, 0, Math.PI * 2); ctx.fill();

      if (z2 > 0.42 && n.w >= 0.55) {
        ctx.font = '500 11px -apple-system,"PingFang SC",sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = VZ.alpha('#1b1611', 0.40 + z2 * 0.50);
        ctx.fillText(n.n, sx + sz + 6, sy);
      }
    });

    /* 边缘光 */
    ctx.strokeStyle = 'rgba(27,22,17,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ox, oy, RR, 0, Math.PI * 2); ctx.stroke();
  }

  /* ---------------------------------------------- 循环 */
  var last = 0;
  function loop(ts) {
    if (!last) last = ts;
    var dt = Math.min(48, ts - last); last = ts;
    t += dt;
    idle += dt;
    if (!dragging && idle > 1600) {
      yaw -= 0.000055 * dt;
    }
    zoom += (targetZoom - zoom) * 0.08;
    draw();
    if (running) raf = requestAnimationFrame(loop);
  }

  /* ---------------------------------------------- 交互 */
  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; idle = 0;
    lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    if (raf === null) { running = true; last = 0; raf = requestAnimationFrame(loop); }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    yaw += dx * 0.0052;
    pitch = Math.max(-1.0, Math.min(1.0, pitch + dy * 0.0042));
    idle = 0;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    canvas.addEventListener(ev, function () { dragging = false; idle = 0; });
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    targetZoom = Math.max(0.75, Math.min(2.1, targetZoom - e.deltaY * 0.0012));
    idle = 0;
  }, { passive: false });

  window.addEventListener('resize', VZ.debounce(function () { resize(); }, 150));

  /* ---------------------------------------------- 可见性 */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
      if (!en.isIntersecting && running) { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }
    });
  }, { threshold: 0.05 });
  io.observe(canvas.parentElement);

  /* ---------------------------------------------- 启动 */
  function init() {
    buildLandMask();
    buildDots();
    buildArcs();
    resize();
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);

  /* 供外部查询 */
  window.__globeStats = function () { return { dots: DOTS.length, arcs: ARC_CACHE.length, nodes: NODES.length }; };
})();
