/* ============================================================
   utils.js — 全局工具：调色板 / 格式化 / 提示框 / 动效 / 显现
   依赖：无（纯原生）
   ============================================================ */
window.VZ = (function () {
  'use strict';

  /* ---------------------------------------------------- 调色板 */
  var C = {
    coral:  '#C05A34',   /* 朱砂 */
    amber:  '#B98A2E',   /* 赭石 */
    sand:   '#C9A75E',   /* 浅赭 */
    olive:  '#75873F',   /* 橄榄 */
    jade:   '#4F8163',   /* 铜绿 */
    teal:   '#4C7D72',   /* 铜绿·冷 */
    azure:  '#5F6494',   /* 靛青 */
    indigo: '#4A4F7C',   /* 靛青·深 */
    lilac:  '#8C7A93',   /* 紫灰 */
    rose:   '#A86A5A'    /* 陶土 */
  };

  var SEQ = [C.coral, C.amber, C.sand, C.olive, C.jade, C.teal, C.azure, C.indigo, C.lilac, C.rose];

  var INK = {
    text1: '#1b1611',
    text2: '#574d42',
    text3: '#786d5f',
    text4: '#9a8f80',
    line:  '#ddd4c5',
    hair:  '#e7dfd2',
    panel: '#fffdf8',
    paper: '#f7f4ed'
  };

  /* 半透明变体 */
  function alpha(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* 线性渐变（用于面积填充） */
  function fade(hex, from, to) {
    return new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: alpha(hex, from === undefined ? 0.5 : from) },
      { offset: 1, color: alpha(hex, to === undefined ? 0.02 : to) }
    ]);
  }
  function fadeX(hex, from, to) {
    return new window.echarts.graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: alpha(hex, from === undefined ? 0.05 : from) },
      { offset: 1, color: alpha(hex, to === undefined ? 0.6 : to) }
    ]);
  }

  /* ---------------------------------------------------- 数字格式化 */
  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  /** 千分位 */
  function group(v, dp) {
    if (!isNum(v)) return '—';
    var d = dp === undefined ? 0 : dp;
    var s = Math.abs(v).toFixed(d);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (v < 0 ? '-' : '') + parts.join('.');
  }

  /** 中文单位：万 / 亿 */
  function cn(v, dp) {
    if (!isNum(v)) return '—';
    var a = Math.abs(v), sign = v < 0 ? '-' : '';
    var d = dp === undefined ? 1 : dp;
    if (a >= 1e12) return sign + (a / 1e12).toFixed(d) + '万亿';
    if (a >= 1e8)  return sign + (a / 1e8).toFixed(d) + '亿';
    if (a >= 1e4)  return sign + (a / 1e4).toFixed(d) + '万';
    return sign + group(a, a < 10 && a % 1 !== 0 ? 1 : 0);
  }

  /** 自动精度 */
  function auto(v) {
    if (!isNum(v)) return '—';
    var a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1000) return group(v, 0);
    if (a >= 100) return group(v, a % 1 ? 1 : 0);
    if (a >= 10) return group(v, a % 1 ? 1 : 0);
    if (a >= 1) return group(v, a % 1 ? 2 : 0);
    return String(+v.toFixed(3));
  }

  /** 百分比 */
  function pct(v, dp) {
    if (!isNum(v)) return '—';
    return (v > 0 && arguments[2] === 'sign' ? '+' : '') + v.toFixed(dp === undefined ? 1 : dp) + '%';
  }

  function withUnit(v, unit) {
    if (!isNum(v)) return '—';
    if (unit === '%') return pct(v);
    if (unit === '亿元' || unit === '万元') return cn(v, 0) + unit.replace('元', '元');
    return auto(v) + (unit || '');
  }

  /* ---------------------------------------------------- 提示框 */
  /**
   * 生成统一风格的 tooltip HTML
   * @param {string} title 标题
   * @param {Array} rows [{name, value, unit, color}]
   * @param {string} foot 脚注
   */
  function tip(title, rows, foot) {
    var h = '<div class="ech-tip">';
    if (title) h += '<div class="ech-tip__t">' + title + '</div>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h += '<div class="ech-tip__r">';
      if (r.color) h += '<span class="ech-tip__d" style="background:' + r.color + '"></span>';
      h += '<span>' + r.name + '</span>';
      h += '<span class="ech-tip__v" style="color:' + (r.color || INK.text1) + '">' + r.value +
           (r.unit ? '<span class="ech-tip__u"> ' + r.unit + '</span>' : '') + '</span>';
      h += '</div>';
    }
    if (foot) h += '<div class="ech-tip__u" style="margin-top:6px">' + foot + '</div>';
    return h + '</div>';
  }

  /* ---------------------------------------------------- ECharts 通用配置 */
  var axisBase = function (opt) {
    opt = opt || {};
    return {
      axisLine: { show: opt.line !== false, lineStyle: { color: INK.line } },
      axisTick: { show: false },
      axisLabel: {
        color: INK.text3,
        fontSize: 11,
        fontFamily: '-apple-system, PingFang SC, sans-serif',
        margin: 12,
        hideOverlap: true
      },
      splitLine: {
        show: !!opt.split,
        lineStyle: { color: INK.hair, type: opt.dash || 'solid' }
      },
      nameTextStyle: { color: INK.text4, fontSize: 10, padding: [0, 0, 6, 0] }
    };
  };

  var TOOLTIP_BASE = {
    backgroundColor: 'rgba(255,253,248,0.98)',
    borderColor: '#ddd4c5',
    borderWidth: 1,
    padding: [10, 13],
    textStyle: { color: INK.text1, fontSize: 12.5 },
    extraCssText: 'border-radius:6px;box-shadow:0 14px 32px -14px rgba(27,22,17,.42);',
    confine: true
  };

  /* ---------------------------------------------------- 动效 */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /** 数字滚动 */
  function countUp(el, to, opt) {
    opt = opt || {};
    var from = opt.from === undefined ? 0 : opt.from;
    var dur = opt.dur || 1500;
    var dp = opt.dp === undefined ? 0 : opt.dp;
    var fmt = opt.fmt || group;
    var delay = opt.delay || 0;
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var v = from + (to - from) * easeOutCubic(p);
      el.textContent = fmt(v, dp);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(to, dp);
    }
    setTimeout(function () { requestAnimationFrame(step); }, delay);
  }

  /** 元素进入视口显现 */
  function observeReveal(root) {
    var els = (root || document).querySelectorAll('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /** 相对亮度，用于选择文字颜色 */
  function isLight(hex) {
    var h = hex.replace('#', '');
    var n = parseInt(h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h, 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.68;
  }

  /* ---------------------------------------------------- 小工具 */
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /** 防抖 */
  function debounce(fn, wait) {
    var t; return function () {
      var a = arguments, s = this;
      clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, wait || 160);
    };
  }

  /** 简易线性插值序列生成（用于示意趋势，不用于真实数据） */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /** 简易伪随机（可复现） */
  function rng(seed) {
    var s = seed || 1;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  /** 数值夹取 */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /** ECharts 实例注册表（供 resize 统一处理） */
  var charts = [];
  function reg(chart) { if (chart) charts.push(chart); return chart; }
  function resizeAll() { charts.forEach(function (c) { try { c.resize(); } catch (e) {} }); }
  window.addEventListener('resize', debounce(resizeAll, 180));

  /* ---------------------------------------------------- 数据集辅助 */
  function seriesOf(id) {
    var d = window.AI_DATA && window.AI_DATA.series && window.AI_DATA.series[id];
    return d || null;
  }

  return {
    C: C, SEQ: SEQ, INK: INK, alpha: alpha, fade: fade, fadeX: fadeX,
    group: group, cn: cn, auto: auto, pct: pct, withUnit: withUnit, isNum: isNum,
    tip: tip, axisBase: axisBase, TOOLTIP_BASE: TOOLTIP_BASE,
    countUp: countUp, observeReveal: observeReveal, isLight: isLight,
    q: q, qa: qa, debounce: debounce, lerp: lerp, rng: rng, clamp: clamp,
    reg: reg, resizeAll: resizeAll, seriesOf: seriesOf,
    easeOutCubic: easeOutCubic
  };
})();
