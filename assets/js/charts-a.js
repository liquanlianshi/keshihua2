/* ============================================================
   charts-a.js — 第 01—04 章图表
   c-eq / heroKpi / c-scale-a,b,c / c-models / c-digital
   c-sankey / c-value / factor cards / c-factor-line / c-factor-radar
   ============================================================ */
(function () {
  'use strict';
  var VZ = window.VZ, D = window.AI_DATA, E = window.echarts;
  if (!E || !D) return;

  var C = VZ.C, INK = VZ.INK, SRC = D.SOURCES;
  var mk = function (id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var inst = E.init(el, null, { renderer: 'canvas' });
    VZ.reg(inst);
    return inst;
  };
  var base = function (o) { return VZ.axisBase(o); };
  var TT = function () { return JSON.parse(JSON.stringify(VZ.TOOLTIP_BASE)); };

  function srcLine(ids, extra) {
    var arr = ids.split(',').map(function (k) {
      var s = SRC[k.trim()];
      return s ? s.org + s.title : k;
    });
    return '数据来源：' + arr.join('；') + (extra ? ' · ' + extra : '');
  }

  /* ══════════════════════════════════════════════════
     首屏 KPI
     ══════════════════════════════════════════════════ */
  (function heroKpis() {
    var box = document.getElementById('heroKpis');
    if (!box) return;
    box.innerHTML = D.heroKpi.map(function (k) {
      var col = 'var(--c-' + k.color + ')';
      return '' +
        '<div class="kpi kpi--hero reveal" style="--kpi-c:' + col + '" data-delay="1">' +
          '<span class="kpi__label">' + k.label + '</span>' +
          '<span class="kpi__val"><span data-count="' + k.value + '" data-dp="' + k.dp + '">0</span>' +
            '<small>' + k.unit + '</small></span>' +
          '<span class="kpi__sub">' + k.sub + '</span>' +
        '</div>';
    }).join('');
  })();

  /* ══════════════════════════════════════════════════
     图 01-1 · 生产函数的三次改写
     ══════════════════════════════════════════════════ */
  (function eqChart() {
    var ch = mk('c-eq');
    if (!ch) return;
    var X = [], base_ = [], tool = [], engine = [];
    for (var x = 0; x <= 100; x += 2) {
      X.push(x);
      base_.push([x, +(100 + 0.30 * x).toFixed(1)]);
      tool.push([x, +(100 + 0.55 * x + 0.0045 * x * x).toFixed(1)]);
      engine.push([x, +(100 + 0.75 * x + 0.014 * x * x).toFixed(1)]);
    }
    var yAt = function (arr, v) { return arr[Math.min(arr.length - 1, Math.max(0, Math.round(v / 2)))][1]; };

    var STAGES = [
      { max: 33, name: '阶段一 · AI 作为辅助工具', desc: 'AI 独立于生产函数之外，只提升个别环节的速度。', active: 0 },
      { max: 66, name: '阶段二 · AI 成为新型劳动资料', desc: '算力与模型进入资本项，成为可积累的生产工具。', active: 1 },
      { max: 100, name: '阶段三 · AI 重塑全部要素', desc: '人、工具与对象同时被改写，生产函数形式发生变化。', active: 2 }
    ];

    function render(v) {
      var st = STAGES[0];
      for (var i = 0; i < STAGES.length; i++) if (v <= STAGES[i].max) { st = STAGES[i]; break; }
      var series = [
        { name: '要素投入驱动', data: base_, color: C.olive, idx: 0 },
        { name: 'AI 作为工具', data: tool, color: C.azure, idx: 1 },
        { name: 'AI 重塑生产函数', data: engine, color: C.amber, idx: 2 }
      ];
      var yv = [yAt(base_, v), yAt(tool, v), yAt(engine, v)][st.active];

      ch.setOption({
        animationDuration: 520,
        grid: { left: 8, right: 26, top: 46, bottom: 30, containLabel: true },
        tooltip: Object.assign(TT(), {
          trigger: 'axis',
          axisPointer: { type: 'line', lineStyle: { color: '#cfc4b2', type: 'dashed' } },
          formatter: function (ps) {
            var r = ps.map(function (p) {
              var v = p.value && p.value.length ? p.value[1] : p.value;
              return { name: p.seriesName, value: Number(v).toFixed(0), color: p.color };
            });
            return VZ.tip('AI 渗透强度 ' + ps[0].axisValue, r, '纵轴：单位产出指数（示意）');
          }
        }),
        xAxis: Object.assign(base({ line: true }), {
          type: 'value', min: 0, max: 100, name: 'AI 渗透强度 →',
          nameLocation: 'end', nameGap: 10, nameTextStyle: { color: INK.text4, fontSize: 10, align: 'right' },
          splitLine: { show: false }
        }),
        yAxis: Object.assign(base({ split: true, dash: 'dashed' }), {
          type: 'value', min: 100, max: 340,
          axisLabel: { color: INK.text4, fontSize: 10 }
        }),
        series: series.map(function (s) {
          var on = s.idx === st.active;
          return {
            name: s.name, type: 'line', data: s.data, smooth: true, symbol: 'none',
            lineStyle: { width: on ? 2.6 : 1.2, color: VZ.alpha(s.color, on ? 1 : 0.28), shadowBlur: on ? 16 : 0, shadowColor: VZ.alpha(s.color, .5) },
            areaStyle: on ? { color: VZ.fade(s.color, .26, 0) } : undefined,
            z: on ? 5 : 2,
            markLine: on ? {
              silent: true, symbol: 'none',
              lineStyle: { color: VZ.alpha(s.color, .55), type: 'dashed', width: 1 },
              label: { show: true, rotate: 0, formatter: '当前 ' + yv.toFixed(0), color: s.color, fontSize: 11, position: 'end' },
              data: [{ xAxis: v }]
            } : undefined,
            markPoint: on ? {
              symbol: 'circle', symbolSize: 11,
              itemStyle: { color: s.color, borderColor: '#fffdf8', borderWidth: 2, shadowBlur: 18, shadowColor: s.color },
              label: { show: false },
              data: [{ coord: [v, yv] }]
            } : undefined
          };
        }),
        graphic: [
          { type: 'text', left: 0, top: 0, style: { text: 'Y = A · f( K , L , D , AI )', fill: VZ.alpha(INK.text1, .55), font: '600 13px "SF Mono", Menlo, monospace' } },
          { type: 'text', left: 0, top: 20, style: { text: '产出 = 技术 × 函数( 资本 , 劳动 , 数据 , 智能 )', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' } }
        ]
      });
      ch.__v = v; ch.__st = st;
    }

    var range = document.getElementById('eqRange');
    var label = document.getElementById('eqLabel');
    var stageBox = document.querySelector('.eq__stage');

    function update(v) {
      render(v);
      if (label) label.textContent = ch.__st.name;
      if (range) range.style.setProperty('--fill', v + '%');
      if (stageBox) {
        Array.prototype.forEach.call(stageBox.children, function (el, i) {
          el.classList.toggle('on', i === ch.__st.active);
        });
      }
    }

    if (range) range.addEventListener('input', function () { update(+range.value); });

    // 自动演示：进入视口后缓动推进
    render(12);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.disconnect();
        var v = 12, target = 74, t0 = null;
        (function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 2200);
          v = 12 + (target - 12) * VZ.easeOutCubic(p);
          update(v);
          if (range) range.value = v;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.25 });
    io.observe(document.getElementById('c-eq'));
  })();

  /* ══════════════════════════════════════════════════
     图 02-1A · 产业规模 × 增速
     ══════════════════════════════════════════════════ */
  (function scaleA() {
    var ch = mk('c-scale-a');
    if (!ch) return;
    var s = D.series.aiIndustry.points;
    var years = s.map(function (p) { return p.year + ''; });
    var vals = s.map(function (p) { return p.value; });
    var growth = s.map(function (p, i) {
      if (i === 0) return null;
      // 口径切换处不计算同比（两段数据不可比）
      if (p.caliber === 'new' && s[i - 1].caliber !== 'new') return null;
      return +(((p.value / s[i - 1].value) - 1) * 100).toFixed(1);
    });

    ch.setOption({
      animationDuration: 900, animationEasing: 'cubicOut',
      grid: { left: 6, right: 10, top: 56, bottom: 8, containLabel: true },
      legend: {
        top: 6, right: 0, itemWidth: 10, itemHeight: 10, itemGap: 18,
        textStyle: { color: INK.text3, fontSize: 11 },
        data: ['人工智能产业规模', '同比增速']
      },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.045)' } },
        formatter: function (ps) {
          var y = +ps[0].axisValue, i = years.indexOf(ps[0].axisValue);
          var rows = [{ name: '人工智能产业规模', value: VZ.group(vals[i]), unit: '亿元', color: C.amber }];
          if (growth[i] !== null) rows.push({ name: '同比增速', value: growth[i].toFixed(1), unit: '%', color: C.jade });
          var p = s[i];
          return VZ.tip(y + ' 年' + (p.caliber === 'new' ? '（新口径）' : '') + (p.est ? ' · 初步测算' : ''), rows,
            p.caliber === 'new' ? '⚠ 2024 年起统计口径调整，与此前年份不可直接比较' : '');
        }
      }),
      xAxis: Object.assign(base({ line: true }), {
        type: 'category', data: years, axisLabel: { color: INK.text3, fontSize: 11.5, margin: 12 }
      }),
      yAxis: [
        Object.assign(base({ split: true, dash: 'dashed' }), {
          type: 'value', name: '亿元', nameTextStyle: { color: INK.text4, fontSize: 10, align: 'left' },
          axisLabel: { color: INK.text4, fontSize: 10, formatter: function (v) { return v >= 10000 ? (v / 10000) + '万' : v; } }
        }),
        Object.assign(base({}), {
          type: 'value', name: '%', min: 0, max: 60, nameTextStyle: { color: INK.text4, fontSize: 10, align: 'right' },
          axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}%' },
          splitLine: { show: false }
        })
      ],
      series: [
        {
          name: '人工智能产业规模', type: 'bar', data: vals, barWidth: '46%', yAxisIndex: 0,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: function (p) {
              var newCal = s[p.dataIndex].caliber === 'new';
              var c1 = newCal ? C.amber : C.azure;
              return new E.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: VZ.alpha(c1, .95) },
                { offset: 1, color: VZ.alpha(c1, .16) }
              ]);
            }
          },
          label: {
            show: true, position: 'top', distance: 7,
            color: INK.text2, fontSize: 10.5, fontFamily: '-apple-system, PingFang SC, sans-serif',
            formatter: function (p) { return VZ.group(p.value); }
          },
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(221,174,115,.055)' },
            label: {
              show: true, position: 'insideTop', offset: [0, 6],
              color: VZ.alpha(C.amber, .75), fontSize: 10,
              formatter: '统计口径调整 →'
            },
            data: [[{ xAxis: '2024' }, { xAxis: '2025' }]]
          }
        },
        {
          name: '同比增速', type: 'line', data: growth, yAxisIndex: 1,
          smooth: true, symbol: 'circle', symbolSize: 7, connectNulls: false,
          lineStyle: { width: 2, color: C.jade, shadowBlur: 14, shadowColor: VZ.alpha(C.jade, .5) },
          itemStyle: { color: C.jade, borderColor: '#fffdf8', borderWidth: 2 }
        }
      ]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 02-1B · 算力供给刻度（对数条形）
     ══════════════════════════════════════════════════ */
  (function scaleB() {
    var ch = mk('c-scale-b');
    if (!ch) return;
    var rows = D.infraScale.slice().reverse();
    var logs = rows.map(function (r) { return +Math.log10(r.value).toFixed(3); });

    ch.setOption({
      animationDuration: 900, animationDelay: function (i) { return i * 70; },
      grid: { left: 6, right: 120, top: 18, bottom: 8, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var r = rows[p.dataIndex];
          return VZ.tip(r.name, [{ name: '数值', value: VZ.auto(r.value), unit: r.unit, color: VZ.C[r.color] }],
            r.year + (r.growth ? ' · 同比 ' + r.growth : ''));
        }
      }),
      xAxis: Object.assign(base({}), { type: 'value', show: false, max: 4.15 }),
      yAxis: Object.assign(base({ line: false }), {
        type: 'category', data: rows.map(function (r) { return r.name; }),
        axisLabel: { color: INK.text2, fontSize: 12, margin: 14 }
      }),
      series: [{
        type: 'bar', data: logs, barWidth: 11,
        showBackground: true,
        backgroundStyle: { color: 'rgba(27,22,17,.040)', borderRadius: 6 },
        itemStyle: {
          borderRadius: 6,
          color: function (p) {
            var c = C[rows[p.dataIndex].color];
            return new E.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: VZ.alpha(c, .35) },
              { offset: 1, color: VZ.alpha(c, 1) }
            ]);
          }
        },
        label: {
          show: true, position: 'right', distance: 12,
          formatter: function (p) {
            var r = rows[p.dataIndex];
            return '{v|' + VZ.auto(r.value) + '}{u| ' + r.unit + '}';
          },
          rich: {
            v: { color: INK.text1, fontSize: 13, fontFamily: '-apple-system, PingFang SC, sans-serif', fontWeight: 600 },
            u: { color: INK.text4, fontSize: 10.5 }
          }
        }
      }]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 02-1C · 从数据到智能的价值放大链
     ══════════════════════════════════════════════════ */
  (function scaleC() {
    var ch = mk('c-scale-c');
    if (!ch) return;
    // 只保留字节量纲的四级，Token 调用量单独作为注记（不同量纲不可同轴）
    var rows = D.dataFunnel.filter(function (r) { return r.unit !== '万亿'; });
    var tokenRow = D.dataFunnel.filter(function (r) { return r.unit === '万亿'; })[0];
    var toEB = function (r) {
      if (r.unit === 'ZB') return r.value * 1024;
      if (r.unit === 'EB') return r.value;
      if (r.unit === 'PB') return r.value / 1024;
      return null;
    };
    var names = rows.map(function (r) { return r.stage; });
    var vals = rows.map(function (r) { return +Math.log10(toEB(r)).toFixed(3); });
    var ebVals = rows.map(toEB);

    ch.setOption({
      animationDuration: 900, animationDelay: function (i) { return i * 110; },
      grid: { left: 6, right: 150, top: 34, bottom: 52, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var r = rows[p.dataIndex];
          return VZ.tip(r.stage, [
            { name: '数值', value: VZ.auto(r.value), unit: r.unit, color: C[r.color] },
            { name: '折算', value: VZ.auto(+ebVals[p.dataIndex].toFixed(2)), unit: 'EB', color: INK.text3 }
          ], r.note);
        }
      }),
      xAxis: Object.assign(base({}), { type: 'value', show: false, max: 5.6, min: -0.6 }),
      yAxis: Object.assign(base({ line: false }), {
        type: 'category', data: names, inverse: true,
        axisLabel: { color: INK.text2, fontSize: 12, margin: 14 }
      }),
      series: [{
        type: 'bar', data: vals, barWidth: 26,
        showBackground: true, backgroundStyle: { color: 'rgba(27,22,17,.045)', borderRadius: 4 },
        itemStyle: {
          borderRadius: 4,
          color: function (p) {
            var c = C[rows[p.dataIndex].color];
            return new E.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: VZ.alpha(c, .30) },
              { offset: 1, color: VZ.alpha(c, .95) }
            ]);
          }
        },
        label: {
          show: true, position: 'right', distance: 14,
          formatter: function (p) {
            var r = rows[p.dataIndex];
            return '{v|' + VZ.auto(r.value) + '}{u| ' + r.unit + '}';
          },
          rich: {
            v: { color: INK.text1, fontSize: 15, fontWeight: 600, fontFamily: '-apple-system, PingFang SC, sans-serif' },
            u: { color: INK.text4, fontSize: 11 }
          }
        }
      }],
      graphic: [
        { type: 'text', left: 0, top: 2,
          style: { text: '横轴为对数刻度 · 四项均已折算为 EB 以便同轴比较', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' } },
        // Token 量纲不同，单列注记，避免与字节量并置
        { type: 'rect', left: 0, bottom: 4, shape: { width: 360, height: 38 }, style: { fill: 'rgba(185,138,46,.07)', stroke: 'rgba(185,138,46,.30)', lineWidth: 1 } },
        { type: 'text', left: 12, bottom: 28,
          style: { text: '另一把尺子 · 全年 Token 调用量', fill: INK.text3, font: '10px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 12, bottom: 10,
          style: { text: VZ.group(tokenRow.value) + ' 万亿次', fill: C.amber, font: '700 17px -apple-system, PingFang SC, sans-serif' } },
        { type: 'text', left: 210, bottom: 14,
          style: { text: 'Token 是调用量而非数据量，不与上表同轴', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' } }
      ]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 02-2 · 备案数的阶梯
     ══════════════════════════════════════════════════ */
  (function models() {
    var ch = mk('c-models');
    if (!ch) return;
    var pts = [
      { label: '2024 年底', v: 302 },
      { label: '2025 年底', v: 748 },
      { label: '2026.08', v: 1112 }
    ];
    ch.setOption({
      animationDuration: 1000,
      grid: { left: 6, right: 18, top: 30, bottom: 6, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: '#c6b9a6', type: 'dashed' } },
        formatter: function (ps) {
          var i = ps[0].dataIndex;
          var prev = i === 0 ? 0 : pts[i - 1].v;
          return VZ.tip(pts[i].label, [
            { name: '累计备案', value: VZ.group(pts[i].v), unit: '款', color: C.lilac },
            { name: '本期新增', value: '+' + VZ.group(pts[i].v - prev), unit: '款', color: C.amber }
          ]);
        }
      }),
      xAxis: Object.assign(base({ line: true }), {
        type: 'category', data: pts.map(function (p) { return p.label; }),
        boundaryGap: false
      }),
      yAxis: Object.assign(base({ split: true, dash: 'dashed' }), { type: 'value', max: 1250 }),
      series: [
        {
          name: '累计备案', type: 'line', step: 'end', data: pts.map(function (p) { return p.v; }),
          symbol: 'circle', symbolSize: 9,
          lineStyle: { width: 2.4, color: C.lilac, shadowBlur: 18, shadowColor: VZ.alpha(C.lilac, .55) },
          itemStyle: { color: C.lilac, borderColor: '#fffdf8', borderWidth: 2 },
          areaStyle: { color: VZ.fade(C.lilac, .30, 0) },
          label: {
            show: true, position: 'top', distance: 10,
            color: INK.text1, fontSize: 12, fontWeight: 600,
            fontFamily: '-apple-system, PingFang SC, sans-serif',
            formatter: function (p) { return VZ.group(p.value); }
          }
        },
        {
          name: '本期新增', type: 'bar', barWidth: 22, data: pts.map(function (p, i) {
            return i === 0 ? 302 : p.v - pts[i - 1].v;
          }),
          itemStyle: {
            borderRadius: [4, 4, 0, 0], color: VZ.alpha(C.amber, .30)
          },
          label: {
            show: true, position: 'top', color: VZ.alpha(C.amber, .85), fontSize: 10.5,
            formatter: function (p) { return '+' + p.value; }
          }
        }
      ]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 02-3 · 数字经济占 GDP 比重
     ══════════════════════════════════════════════════ */
  (function digital() {
    var ch = mk('c-digital');
    if (!ch) return;
    var d = D.series.digitalEconomy;
    var years = d.gdpShare.map(function (p) { return p.year + ''; });
    var share = d.gdpShare.map(function (p) { return p.value; });
    var scale = d.points.map(function (p) { return p.value; });

    ch.setOption({
      animationDuration: 900,
      grid: { left: 6, right: 14, top: 46, bottom: 6, containLabel: true },
      legend: {
        top: 4, left: 0, itemWidth: 10, itemHeight: 10, itemGap: 18,
        textStyle: { color: INK.text3, fontSize: 11 },
        data: ['数字经济规模', '占 GDP 比重']
      },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.04)' } },
        formatter: function (ps) {
          var i = years.indexOf(ps[0].axisValue);
          return VZ.tip(ps[0].axisValue + ' 年', [
            { name: '数字经济规模', value: scale[i].toFixed(1), unit: '万亿元', color: C.jade },
            { name: '占 GDP 比重', value: share[i].toFixed(1), unit: '%', color: C.amber }
          ], '两条轴均自 0 起，斜率可直接比较');
        }
      }),
      xAxis: Object.assign(base({ line: true }), { type: 'category', data: years }),
      yAxis: [
        Object.assign(base({ split: true, dash: 'dashed' }), {
          type: 'value', min: 0, max: 70,
          axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value} 万亿' }
        }),
        Object.assign(base({}), {
          type: 'value', min: 0, max: 70, splitLine: { show: false },
          axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}%' }
        })
      ],
      series: [
        {
          name: '数字经济规模', type: 'bar', data: scale, barWidth: '46%', yAxisIndex: 0,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: new E.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: VZ.alpha(C.jade, .85) },
              { offset: 1, color: VZ.alpha(C.jade, .22) }
            ])
          },
          label: {
            show: true, position: 'top', distance: 6, color: INK.text3, fontSize: 10.5,
            formatter: function (p) { return p.value.toFixed(1); }
          }
        },
        {
          name: '占 GDP 比重', type: 'line', data: share, yAxisIndex: 1,
          smooth: true, symbol: 'circle', symbolSize: 7,
          lineStyle: { width: 2.4, color: C.amber },
          itemStyle: { color: C.amber, borderColor: '#fffdf8', borderWidth: 2 },
          label: {
            show: true, position: 'bottom', distance: 8, color: C.amber,
            fontSize: 11, fontWeight: 600, formatter: '{c}%'
          }
        }
      ],
      graphic: [{
        type: 'text', left: 0, top: 24,
        style: { text: '两条轴均为 0 基，避免双轴范围不同造成的斜率误读', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' }
      }]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 03-1 · 价值传导桑基图
     ══════════════════════════════════════════════════ */
  (function sankey() {
    var ch = mk('c-sankey');
    if (!ch) return;
    var sd = D.sankey;
    var nodes = sd.nodes.map(function (n) {
      return {
        name: n.name,
        itemStyle: {
          color: VZ.alpha(C[n.c], .88),
          borderColor: VZ.alpha(C[n.c], 1),
          borderWidth: 1,
          shadowBlur: 12,
          shadowColor: VZ.alpha(C[n.c], .35)
        }
      };
    });
    var links = sd.links.map(function (l) {
      var from = sd.nodes[l[0]], to = sd.nodes[l[1]];
      var c = C[from.c];
      return {
        source: from.name, target: to.name, value: l[2],
        lineStyle: { color: VZ.alpha(c, .26), curveness: .55 }
      };
    });

    var layerOf = {};
    sd.nodes.forEach(function (n) { layerOf[n.name] = n.layer; });

    ch.setOption({
      animationDuration: 1100,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          if (p.dataType === 'edge') {
            var f = sd.nodes.find(function (n) { return n.name === p.data.source; });
            var t = sd.nodes.find(function (n) { return n.name === p.data.target; });
            return VZ.tip('传导路径', [
              { name: f.name + ' → ' + t.name, value: p.data.value, unit: ' 强度', color: C[f.c] }
            ], '相对强度示意，非绝对金额');
          }
          return VZ.tip(p.name, [{ name: '层级', value: ['要素投入', '技术能力', '行业场景', '经济价值'][layerOf[p.name]], color: C.azure }]);
        }
      }),
      series: [{
        type: 'sankey',
        left: 12, right: 108, top: 16, bottom: 16,
        nodeWidth: 13, nodeGap: 13,
        nodeAlign: 'justify',
        draggable: false,
        emphasis: { focus: 'adjacency', lineStyle: { opacity: .75 } },
        lineStyle: { opacity: .55, curveness: .55 },
        label: {
          color: INK.text2, fontSize: 12.5, fontFamily: '-apple-system,"PingFang SC",sans-serif',
          distance: 8
        },
        levels: [
          { depth: 0, itemStyle: { borderWidth: 0 }, lineStyle: { color: 'source', opacity: .34 } },
          { depth: 1, itemStyle: { borderWidth: 0 }, lineStyle: { color: 'source', opacity: .30 } },
          { depth: 2, itemStyle: { borderWidth: 0 }, lineStyle: { color: 'source', opacity: .26 } },
          { depth: 3, itemStyle: { borderWidth: 0 }, lineStyle: { color: 'source', opacity: .34 } }
        ],
        data: nodes,
        links: links
      }],
      graphic: [
        { type: 'text', left: 'center', top: 0, style: { text: '', fill: 'transparent' } }
      ]
    });

    // 层级标题
    var els = document.getElementById('c-sankey');
    els.style.position = 'relative';
    var titles = ['要素投入', '技术能力', '行业场景', '经济价值'];
    var holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;padding:0 96px 0 10px;pointer-events:none;font-family:"SF Mono",Menlo,monospace;font-size:10px;letter-spacing:.22em;color:#524B5E';
    holder.innerHTML = titles.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    els.appendChild(holder);

    els.addEventListener('click', function () { ch.dispatchAction({ type: 'downplay' }); });
  })();

  /* ══════════════════════════════════════════════════
     图 03-2 · 四类价值结构
     ══════════════════════════════════════════════════ */
  (function valueMix() {
    var ch = mk('c-value');
    if (!ch) return;
    var rows = D.valueMix;
    ch.setOption({
      animationDuration: 900,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var r = rows[p.dataIndex];
          return VZ.tip(r.name, [{ name: '结构占比', value: r.value, unit: '%', color: C[r.c] }], r.note);
        }
      }),
      series: [
        {
          type: 'pie', radius: ['52%', '80%'], center: ['30%', '52%'],
          startAngle: 100, avoidLabelOverlap: true, padAngle: 2,
          itemStyle: { borderRadius: 6, borderColor: '#fffdf8', borderWidth: 2 },
          label: { show: false }, labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 6 },
          data: rows.map(function (r) {
            return { name: r.name, value: r.value, itemStyle: { color: VZ.alpha(C[r.c], .9), shadowBlur: 18, shadowColor: VZ.alpha(C[r.c], .4) } };
          })
        }
      ],
      graphic: [
        { type: 'text', left: '30%', top: '44%', style: { text: '价值结构', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } },
        { type: 'text', left: '30%', top: '52%', style: { text: '示意分解', fill: INK.text2, font: '600 14px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } }
      ]
    });
    // 图例（HTML）
    var el = document.getElementById('c-value');
    var lg = document.createElement('div');
    lg.style.cssText = 'position:absolute;right:0;top:50%;transform:translateY(-50%);display:grid;gap:10px;width:52%';
    lg.innerHTML = rows.map(function (r) {
      return '<div style="display:flex;align-items:baseline;gap:9px">' +
        '<i style="width:8px;height:8px;border-radius:3px;background:' + C[r.c] + ';flex:0 0 auto;margin-top:5px"></i>' +
        '<div><div style="font-size:13px;color:var(--text-1)">' + r.name +
        '<b style="font-family:var(--font-num);margin-left:8px;color:' + C[r.c] + '">' + r.value + '%</b></div>' +
        '<div style="font-size:11px;color:var(--text-4);line-height:1.5">' + r.note + '</div></div></div>';
    }).join('');
    el.style.position = 'relative';
    el.appendChild(lg);
  })();

  /* ══════════════════════════════════════════════════
     第 04 章 · 三要素卡
     ══════════════════════════════════════════════════ */
  (function factorCards() {
    var box = document.getElementById('factorCards');
    if (!box) return;
    box.innerHTML = D.factors.map(function (f, i) {
      return '' +
        '<article class="factor sp-4 reveal" data-delay="' + (i + 1) + '" style="--factor-c:var(--c-' + f.c + ')">' +
          '<span class="factor__idx">' + f.idx + '</span>' +
          '<header>' +
            '<div class="factor__en">' + f.en + '</div>' +
            '<h3 class="factor__name">' + f.name + '</h3>' +
          '</header>' +
          '<p class="factor__def">' + f.def + '</p>' +
          '<div class="factor__mini chart--auto" id="mini-' + f.id + '"></div>' +
          '<ul class="factor__stats">' +
            f.stats.map(function (s) { return '<li class="factor__stat"><span>' + s.k + '</span><b>' + s.v + '</b></li>'; }).join('') +
          '</ul>' +
        '</article>';
    }).join('');

    D.factors.forEach(function (f) {
      var el = document.getElementById('mini-' + f.id);
      if (!el) return;
      el.style.height = '88px';
      var ch = E.init(el, null, { renderer: 'canvas' });
      VZ.reg(ch);
      var c = C[f.c];
      var opt;
      if (f.chart.type === 'mini-line') {
        opt = {
          animationDuration: 1100,
          grid: { left: 4, right: 4, top: 16, bottom: 16 },
          xAxis: { type: 'category', data: f.chart.labels, show: true, axisLine: { lineStyle: { color: '#ddd4c5' } }, axisTick: { show: false }, axisLabel: { color: INK.text4, fontSize: 9.5, margin: 6 } },
          yAxis: { type: 'value', show: false, min: 0 },
          series: [{
            type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
            data: f.chart.series.map(function (p) { return p[0]; }),
            lineStyle: { width: 2, color: c, shadowBlur: 14, shadowColor: VZ.alpha(c, .55) },
            itemStyle: { color: c, borderColor: '#fffdf8', borderWidth: 2 },
            areaStyle: { color: VZ.fade(c, .28, 0) }
          }]
        };
      } else {
        opt = {
          animationDuration: 1100,
          grid: { left: 4, right: 4, top: 14, bottom: 18 },
          xAxis: { type: 'category', data: f.chart.labels, axisLine: { lineStyle: { color: '#ddd4c5' } }, axisTick: { show: false }, axisLabel: { color: INK.text4, fontSize: 9.5, margin: 6 } },
          yAxis: { type: 'value', show: false, min: 0 },
          series: [{
            type: 'bar', barWidth: '52%',
            data: f.chart.series.map(function (v, i) {
              return { value: v, itemStyle: { color: VZ.alpha(c, i === 1 ? .95 : .34), borderRadius: [4, 4, 0, 0] } };
            })
          }]
        };
      }
      ch.setOption(opt);
    });
  })();

  /* ══════════════════════════════════════════════════
     图 04-1 · 数字化如何作用于全要素生产率
     ══════════════════════════════════════════════════ */
  (function factorLine() {
    var ch = mk('c-factor-line');
    if (!ch) return;
    var tfp = [{ y: 2013, v: 16.30 }, { y: 2024, v: 23.75 }];
    // 逐年平滑插值（仅用于视觉过渡，标注首尾为实测值）
    var years = [], vals = [];
    for (var y = 2013; y <= 2024; y++) {
      years.push(y + '');
      vals.push(+(16.30 + (23.75 - 16.30) * Math.pow((y - 2013) / 11, 1.18)).toFixed(2));
    }
    var micro = [
      { name: '主营业务成本率', v: -9.17, c: 'coral' },
      { name: '成本费用利润率', v: 6.71, c: 'jade' }
    ];

    ch.setOption({
      animationDuration: 1000,
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        formatter: function (ps) {
          var i = years.indexOf(ps[0].axisValue);
          var real = (years[i] === '2013' || years[i] === '2024');
          return VZ.tip(ps[0].axisValue + ' 年', [
            { name: '数字经济 TFP 贡献率', value: vals[i].toFixed(2), unit: '%', color: C.amber }
          ], real ? '实测值（中国信通院）' : '首尾实测值之间的平滑插值，仅作趋势示意');
        }
      }),
      grid: [
        { left: 6, right: '52%', top: 46, bottom: 10, containLabel: true },
        { left: '56%', right: 8, top: 46, bottom: 10, containLabel: true }
      ],
      xAxis: [
        Object.assign(base({ line: true }), {
          type: 'category', data: years, boundaryGap: false, gridIndex: 0,
          axisLabel: { color: INK.text4, fontSize: 10, interval: 2 }
        }),
        Object.assign(base({ line: false }), {
          type: 'value', show: false, min: -14, max: 12, gridIndex: 1
        })
      ],
      yAxis: [
        Object.assign(base({ split: true, dash: 'dashed' }), {
          type: 'value', min: 12, max: 28, gridIndex: 0,
          axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}%' }
        }),
        Object.assign(base({ line: false }), { type: 'category', data: micro.map(function (m) { return m.name; }), gridIndex: 1, axisLabel: { color: INK.text3, fontSize: 11.5 } })
      ],
      series: [
        {
          name: 'TFP 贡献率', type: 'line', data: vals, smooth: true, symbol: 'circle', symbolSize: 0,
          lineStyle: { width: 2.6, color: C.amber, shadowBlur: 16, shadowColor: VZ.alpha(C.amber, .45) },
          areaStyle: { color: VZ.fade(C.amber, .26, 0) },
          markPoint: {
            symbol: 'circle', symbolSize: 10,
            itemStyle: { color: C.amber, borderColor: '#fffdf8', borderWidth: 2 },
            label: {
              show: true, position: 'top', distance: 9, color: INK.text1, fontSize: 11, fontWeight: 600,
              formatter: function (p) {
                var v = (p && p.value != null && p.value.toFixed) ? p.value : (p.data && p.data.coord ? p.data.coord[1] : 0);
                return Number(v).toFixed(2) + '%';
              }
            },
            data: [{ coord: ['2013', 16.30] }, { coord: ['2024', 23.75] }]
          }
        },
        {
          name: '数字化投入每提升 1%', type: 'bar', xAxisIndex: 1, yAxisIndex: 1,
          data: micro.map(function (m) {
            return { value: m.v, itemStyle: { color: VZ.alpha(C[m.c], .85), borderRadius: [0, 5, 5, 0] } };
          }),
          barWidth: 22,
          label: {
            show: true, position: 'right', distance: 8,
            color: INK.text1, fontSize: 13, fontWeight: 600,
            fontFamily: '-apple-system, PingFang SC, sans-serif',
            formatter: function (p) { return (p.value > 0 ? '+' : '') + p.value + '%'; }
          },
          markLine: { silent: true, symbol: 'none', lineStyle: { color: '#cfc4b2' }, data: [{ xAxis: 0 }], label: { show: false } }
        }
      ],
      graphic: [
        { type: 'text', left: 0, top: 6, style: { text: '数字经济全要素生产率对经济增长的贡献率', fill: INK.text2, font: '600 12px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 0, top: 24, style: { text: '2013 → 2024，提升 7.45 个百分点', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: '56%', top: 6, style: { text: '数字化投入的微观传导', fill: INK.text2, font: '600 12px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: '56%', top: 24, style: { text: '投入每提升 1%，对成本与利润的影响', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif' } }
      ]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 04-2 · 三要素贡献权重（示意）
     ══════════════════════════════════════════════════ */
  (function factorRadar() {
    var ch = mk('c-factor-radar');
    if (!ch) return;
    ch.setOption({
      animationDuration: 1000,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var ind = ['短期贡献', '中长期贡献', '可复制性', '政策依赖度', '数据依赖度', '降本直接性'];
          var rows = ind.map(function (n, i) {
            return { name: n, value: p.value[i], color: C.amber };
          });
          return VZ.tip(p.name, rows, '示意性权重，非实测');
        }
      }),
      radar: {
        center: ['50%', '54%'], radius: '66%',
        indicator: [
          { name: '短期贡献', max: 100 }, { name: '中长期贡献', max: 100 },
          { name: '可复制性', max: 100 }, { name: '政策依赖度', max: 100 },
          { name: '数据依赖度', max: 100 }, { name: '降本直接性', max: 100 }
        ],
        axisName: { color: INK.text3, fontSize: 11 },
        axisLine: { lineStyle: { color: '#ddd4c5' } },
        splitLine: { lineStyle: { color: 'rgba(27,22,17,.09)' } },
        splitArea: { areaStyle: { color: ['rgba(27,22,17,.012)', 'rgba(27,22,17,.030)'] } }
      },
      series: [{
        type: 'radar', symbolSize: 5,
        data: [
          { value: [88, 62, 74, 55, 60, 90], name: '劳动资料（算力与模型）', itemStyle: { color: C.azure }, lineStyle: { width: 2, color: C.azure }, areaStyle: { color: VZ.alpha(C.azure, .22) } },
          { value: [56, 92, 48, 78, 82, 44], name: '劳动者（人与智能体）', itemStyle: { color: C.amber }, lineStyle: { width: 2, color: C.amber }, areaStyle: { color: VZ.alpha(C.amber, .20) } },
          { value: [40, 86, 66, 70, 95, 30], name: '劳动对象（数据要素）', itemStyle: { color: C.jade }, lineStyle: { width: 2, color: C.jade }, areaStyle: { color: VZ.alpha(C.jade, .18) } }
        ]
      }],
      legend: {
        bottom: 0, itemWidth: 9, itemHeight: 9, itemGap: 14,
        textStyle: { color: INK.text3, fontSize: 10.5 },
        data: ['劳动资料（算力与模型）', '劳动者（人与智能体）', '劳动对象（数据要素）']
      }
    });
  })();

})();
