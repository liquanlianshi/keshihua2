/* ============================================================
   charts-c.js — 第 08—11 章图表
   生产力实验室（模拟器） / 边界与代价 / 政策时间轴 / 展望
   ============================================================ */
(function () {
  'use strict';
  var VZ = window.VZ, D = window.AI_DATA, E = window.echarts;
  if (!E || !D) return;
  var C = VZ.C, INK = VZ.INK;
  var mk = function (id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var inst = E.init(el, null, { renderer: 'canvas' });
    VZ.reg(inst);
    return inst;
  };
  var base = function (o) { return VZ.axisBase(o); };
  var TT = function () { return JSON.parse(JSON.stringify(VZ.TOOLTIP_BASE)); };

  /* ══════════════════════════════════════════════════
     第 08 章 · 生产力实验室
     ══════════════════════════════════════════════════ */
  var SIM = (function () {
    var P = D.simParams, M = D.simModel;
    var state = {};
    P.forEach(function (p) { state[p.id] = p.base; });

    function tfp(s) {
      var k = M.k;
      var f = k.p * Math.pow(s.p / 100, 0.72) +
              k.c * Math.pow(s.c / 100, 0.55) +
              k.d * Math.pow(s.d / 100, 0.50) +
              k.r * Math.pow(s.r / 100, 0.60) +
              k.interact * (s.p / 100) * (s.d / 100);
      return 100 + f * k.scale * 100;
    }
    function gdpDelta(s) {
      return (tfp(s) - 100) / 100 * M.gdpBase * M.passThrough;
    }
    function jobShift(s) {
      return M.job.base + M.job.jobP * (s.p / 100) + M.job.jobC * (s.c / 100);
    }
    function intensity(s) {
      return 0.30 * s.p + 0.26 * s.c + 0.20 * s.d + 0.24 * s.r;
    }
    return {
      state: state, params: P, model: M,
      tfp: tfp, gdpDelta: gdpDelta, jobShift: jobShift, intensity: intensity,
      base: { tfp: tfp(state), gdp: gdpDelta(state), job: jobShift(state), inten: intensity(state) }
    };
  })();

  (function sim() {
    var box = document.getElementById('simControls');
    if (!box) return;

    box.innerHTML = SIM.params.map(function (p) {
      return '' +
        '<div class="sim__row" style="--sim-c:var(--c-' + p.c + ')">' +
          '<div class="sim__top">' +
            '<span class="sim__name">' + p.name + '</span>' +
            '<span class="sim__val"><span id="simv-' + p.id + '">' + p.base + '</span><small>' + (p.unit || '') + '</small></span>' +
          '</div>' +
          '<input type="range" id="simr-' + p.id + '" min="' + p.min + '" max="' + p.max + '" value="' + p.base + '" step="1">' +
          '<span class="t-micro">' + p.hint + '</span>' +
        '</div>';
    }).join('');

    var chSim = mk('c-sim'), chJob = mk('c-sim-job');
    var elTfp = document.getElementById('simTfp');
    var elGdp = document.getElementById('simGdp');
    var elJob = document.getElementById('simJob');

    /* 主曲线：TFP 综合投入强度响应 */
    var XS = [], YS = [];
    for (var i = 0; i <= 50; i++) {
      var t = i / 50;
      // 沿「综合投入强度」方向等比例缩放其余参数
      var s = {
        p: Math.min(100, 0.30 * t * 100 / 0.30 * 0.30 * 100 / 100 * 3.33),
        c: 0, d: 0, r: 0
      };
      XS.push(+(t * 100).toFixed(1));
    }
    // 重新构造：固定其余参数为当前值，仅让 p 变化 → 展示边际
    function curveFor(s0) {
      var ys = [];
      for (var j = 0; j <= 50; j++) {
        var s = Object.assign({}, s0, { p: j / 50 * 100 });
        ys.push(+SIM.tfp(s).toFixed(2));
      }
      return ys;
    }

    function render() {
      var s = SIM.state;
      var t = SIM.tfp(s), g = SIM.gdpDelta(s), j = SIM.jobShift(s), inten = SIM.intensity(s);

      if (elTfp) elTfp.textContent = t.toFixed(1);
      if (elGdp) elGdp.innerHTML = g.toFixed(1) + '<small>万亿元</small>';
      if (elJob) elJob.innerHTML = j.toFixed(1) + '<small>%</small>';

      SIM.params.forEach(function (p) {
        var v = document.getElementById('simv-' + p.id);
        if (v) v.textContent = s[p.id];
        var r = document.getElementById('simr-' + p.id);
        if (r) r.style.setProperty('--fill', (s[p.id] - p.min) / (p.max - p.min) * 100 + '%');
      });

      if (chSim) {
        var ys = curveFor(s);
        var baseYn = SIM.tfp(Object.assign({}, s, { p: SIM.params[0].base }));
        chSim.setOption({
          animationDuration: 420,
          grid: { left: 6, right: 18, top: 34, bottom: 8, containLabel: true },
          tooltip: Object.assign(TT(), {
            trigger: 'axis',
            formatter: function (ps) {
              return VZ.tip('AI 渗透率 ' + ps[0].axisValue + '%', [
                { name: '全要素生产率指数', value: ps[0].value.toFixed(1), color: C.amber }
              ], '其余参数固定在当前取值');
            }
          }),
          xAxis: Object.assign(base({ line: true }), {
            type: 'category', data: XS, boundaryGap: false,
            axisLabel: { color: INK.text4, fontSize: 10, interval: 9, formatter: '{value}%' },
            name: 'AI 渗透率', nameLocation: 'end', nameGap: 6,
            nameTextStyle: { color: INK.text4, fontSize: 10 }
          }),
          yAxis: Object.assign(base({ split: true, dash: 'dashed' }), {
            type: 'value', scale: true, axisLabel: { color: INK.text4, fontSize: 10 }
          }),
          series: [
            {
              type: 'line', data: ys, smooth: true, symbol: 'none',
              lineStyle: { width: 2.6, color: C.amber, shadowBlur: 18, shadowColor: VZ.alpha(C.amber, .5) },
              areaStyle: { color: VZ.fade(C.amber, .24, 0) },
              markLine: {
                silent: true, symbol: 'none',
                lineStyle: { color: VZ.alpha(C.azure, .45), type: 'dashed' },
                label: { color: C.azure, fontSize: 10, formatter: '基准年 ' + baseYn.toFixed(1), position: 'insideEndTop' },
                data: [{ yAxis: +baseYn.toFixed(2) }]
              },
              markPoint: {
                symbol: 'circle', symbolSize: 13,
                itemStyle: { color: C.amber, borderColor: '#fffdf8', borderWidth: 3, shadowBlur: 20, shadowColor: C.amber },
                label: {
                  show: true, position: 'top', distance: 12, color: INK.text1, fontSize: 12, fontWeight: 600,
                  formatter: t.toFixed(1)
                },
                data: [{ coord: [Math.round(s.p), +t.toFixed(2)] }]
              }
            }
          ]
        });
      }

      if (chJob) {
        // 岗位结构：稳定 / 转岗 / 新增 / 被替代（示意）
        var pRate = s.p / 100;
        var displaced = 4 + 14 * pRate;
        var reskill = 5 + 13 * pRate;
        var created = 3 + 11 * pRate + 5 * (s.r / 100);
        var stable = Math.max(20, 100 - displaced - reskill - created);
        var arr = [
          { n: '岗位稳定', v: +stable.toFixed(1), c: 'olive' },
          { n: '技能转岗', v: +reskill.toFixed(1), c: 'amber' },
          { n: '新增岗位', v: +created.toFixed(1), c: 'jade' },
          { n: '被替代', v: +displaced.toFixed(1), c: 'coral' }
        ];
        chJob.setOption({
          animationDuration: 500,
          grid: [
            { left: 6, right: 10, top: 56, bottom: 8, containLabel: true }
          ],
          legend: {
            top: 30, left: 0, itemWidth: 10, itemHeight: 10, itemGap: 16,
            textStyle: { color: INK.text3, fontSize: 11 },
            data: ['岗位稳定', '技能转岗', '新增岗位', '被替代']
          },
          tooltip: Object.assign(TT(), {
            trigger: 'axis',
            axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.045)' } },
            formatter: function (ps) {
              var rows = ps.map(function (p) { return { name: p.seriesName, value: p.value.toFixed(1), unit: '%', color: p.color }; });
              var net = created - displaced;
              rows.push({ name: '净效应', value: (net > 0 ? '+' : '') + net.toFixed(1), unit: '%', color: net >= 0 ? C.jade : C.coral });
              return VZ.tip('劳动力结构（占存量岗位比例）', rows, '示意性推演，非预测');
            }
          }),
          xAxis: Object.assign(base({ line: true }), {
            type: 'category', data: ['当前参数'],
            axisLabel: { color: INK.text4, fontSize: 11 }
          }),
          yAxis: Object.assign(base({ split: true, dash: 'dashed' }), {
            type: 'value', max: 100, axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}%' }
          }),
          series: arr.map(function (a, i) {
            return {
              name: a.n, type: 'bar', stack: 'job', barWidth: 64,
              data: [a.v],
              itemStyle: {
                color: VZ.alpha(C[a.c], .88),
                borderRadius: i === 0 ? [6, 0, 0, 6] : (i === arr.length - 1 ? [0, 6, 6, 0] : 0)
              },
              label: {
                show: true, position: 'inside', color: '#fffdf8', fontSize: 11, fontWeight: 600,
                formatter: function (p) { return p.value > 6 ? p.value.toFixed(0) + '%' : ''; }
              }
            };
          }),
          graphic: [{
            type: 'text', left: 0, top: 6,
            style: {
              text: '被替代 ' + displaced.toFixed(1) + '%　·　新增 ' + created.toFixed(1) + '%　·　净效应 ' +
                ((created - displaced) >= 0 ? '+' : '') + (created - displaced).toFixed(1) + '%',
              fill: INK.text2, font: '600 12px -apple-system,"PingFang SC",sans-serif'
            }
          }]
        });
      }
    }

    SIM.params.forEach(function (p) {
      var r = document.getElementById('simr-' + p.id);
      if (r) r.addEventListener('input', function () { SIM.state[p.id] = +r.value; render(); });
    });

    var reset = document.getElementById('simReset');
    if (reset) reset.addEventListener('click', function () {
      SIM.params.forEach(function (p) {
        SIM.state[p.id] = p.base;
        var r = document.getElementById('simr-' + p.id);
        if (r) r.value = p.base;
      });
      render();
    });
    var maxBtn = document.getElementById('simMax');
    if (maxBtn) maxBtn.addEventListener('click', function () {
      SIM.params.forEach(function (p) {
        SIM.state[p.id] = p.max;
        var r = document.getElementById('simr-' + p.id);
        if (r) r.value = p.max;
      });
      render();
    });

    render();
  })();

  /* ══════════════════════════════════════════════════
     第 09 章 · 边界与代价
     ══════════════════════════════════════════════════ */
  (function jobs() {
    var ch = mk('c-jobs');
    if (!ch) return;
    var r = D.risks.jobs;
    var cats = ['新增岗位', '被替代岗位', '净增岗位'];
    var wfBase = [0, 78, 0];      // 瀑布的起跳高度
    var val  = [170, 92, 78];   // 各段长度
    var cols = [C.jade, C.coral, C.amber];
    var kinds = ['up', 'down', 'total'];

    ch.setOption({
      animationDuration: 1000, animationDelay: function (i) { return i * 140; },
      grid: { left: 6, right: 30, top: 46, bottom: 8, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.04)' } },
        formatter: function (ps) {
          var i = cats.indexOf(ps[0].axisValue);
          var rows = [];
          if (i === 0) rows = [{ name: '到 2030 年新增岗位', value: 170, unit: '百万个', color: C.jade }];
          if (i === 1) rows = [{ name: '同期被替代岗位', value: 92, unit: '百万个', color: C.coral }];
          if (i === 2) rows = [
            { name: '新增 − 替代 = 净增', value: 78, unit: '百万个', color: C.amber },
            { name: '净变化幅度', value: '+8.5', unit: '%', color: INK.text3 }
          ];
          return VZ.tip(ps[0].axisValue, rows, r.note);
        }
      }),
      xAxis: Object.assign(base({ line: true }), {
        type: 'category', data: cats,
        axisLabel: { color: INK.text2, fontSize: 12 }
      }),
      yAxis: Object.assign(base({ split: true, dash: 'dashed' }), {
        type: 'value', max: 200,
        axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}' }
      }),
      series: [
        { // 隐形托底
          name: 'base', type: 'bar', stack: 'wf', silent: true, barWidth: '44%',
          itemStyle: { color: 'transparent' }, data: wfBase, tooltip: { show: false }
        },
        { // 可见段
          name: '规模', type: 'bar', stack: 'wf', barWidth: '44%',
          data: val.map(function (v, i) {
            return {
              value: v,
              itemStyle: {
                color: VZ.alpha(cols[i], kinds[i] === 'total' ? .95 : .82),
                borderRadius: kinds[i] === 'down' ? [0, 0, 3, 3] : [3, 3, 0, 0]
              }
            };
          }),
          label: {
            show: true, position: 'top', distance: 8,
            color: INK.text1, fontSize: 15, fontWeight: 600,
            fontFamily: '-apple-system, PingFang SC, sans-serif',
            formatter: function (p) {
              return (kinds[p.dataIndex] === 'down' ? '−' : (kinds[p.dataIndex] === 'total' ? '=' : '+')) + p.value;
            }
          }
        }
      ],
      // 瀑布连接线：把三段的首尾连起来
      graphic: (function () {
        var gs = [];
        return gs;
      })(),
      markLine: undefined
    });

    // 用 graphic 画连接虚线不方便，改用 series.markLine 于最后一根柱标注水位
    ch.setOption({
      series: [
        { name: 'base' },
        {
          name: '规模',
          markLine: {
            silent: true, symbol: 'none',
            lineStyle: { color: 'rgba(27,22,17,.35)', type: 'dashed', width: 1 },
            label: {
              show: true, position: 'insideEndTop', color: INK.text3, fontSize: 10,
              formatter: '新增后峰值 170'
            },
            data: [{ yAxis: 170 }]
          }
        }
      ]
    });

    // 增长 / 下降最快的职业类别
    var el = document.getElementById('c-jobs');
    if (el && el.parentElement) {
      var extra = document.createElement('div');
      extra.className = 'jobs-extra';
      extra.innerHTML =
        '<div class="jobs-col">' +
          '<span class="jobs-col__h" style="color:' + C.jade + '">增长最快的职业类别</span>' +
          r.rising.map(function (x) { return '<span class="jobs-chip" style="--jc:' + C.jade + '">' + x + '</span>'; }).join('') +
        '</div>' +
        '<div class="jobs-col">' +
          '<span class="jobs-col__h" style="color:' + C.coral + '">下降最快的职业类别</span>' +
          r.falling.map(function (x) { return '<span class="jobs-chip" style="--jc:' + C.coral + '">' + x + '</span>'; }).join('') +
        '</div>';
      el.parentElement.appendChild(extra);
    }
  })();

  (function energy() {
    var ch = mk('c-energy');
    if (!ch) return;
    var E2 = D.risks.energy;
    var rows = E2.pue.slice().sort(function (a, b) { return a.v - b.v; });

    ch.setOption({
      animationDuration: 1000, animationDelay: function (i) { return i * 110; },
      grid: { left: 6, right: 92, top: 112, bottom: 10, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var r = rows[p.dataIndex];
          return VZ.tip(r.name, [
            { name: 'PUE', value: r.v.toFixed(2), color: C[r.c] }
          ], 'PUE 越接近 1 表示电能利用效率越高');
        }
      }),
      xAxis: Object.assign(base({}), { type: 'value', show: false, min: 0, max: 0.62 }),
      yAxis: Object.assign(base({ line: false }), {
        type: 'category', data: rows.map(function (r) { return r.name; }),
        axisLabel: { color: INK.text2, fontSize: 11.5 }
      }),
      series: [{
        type: 'bar', barWidth: 13,
        data: rows.map(function (r) {
          return { value: r.v - 1, itemStyle: { color: VZ.fadeX(C[r.c], .3, .95), borderRadius: 7 } };
        }),
        showBackground: true, backgroundStyle: { color: 'rgba(27,22,17,.038)', borderRadius: 7 },
        label: {
          show: true, position: 'right', distance: 11,
          color: INK.text1, fontSize: 13, fontWeight: 600,
          fontFamily: '-apple-system, PingFang SC, sans-serif',
          formatter: function (p) { return (p.value + 1).toFixed(2); }
        }
      }],
      graphic: [
        { type: 'text', left: 0, top: 0, style: { text: '2024 年中国数据中心用电量', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 0, top: 16, style: { text: '1,660', fill: C.coral, font: '700 30px -apple-system, PingFang SC, sans-serif' } },
        { type: 'text', left: 100, top: 28, style: { text: '亿千瓦时', fill: INK.text3, font: '11px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 172, top: 16, style: { text: '1.68%', fill: C.amber, font: '700 22px -apple-system, PingFang SC, sans-serif' } },
        { type: 'text', left: 172, top: 44, style: { text: '占全社会用电量', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 262, top: 16, style: { text: '0.859', fill: C.lilac, font: '700 22px -apple-system, PingFang SC, sans-serif' } },
        { type: 'text', left: 262, top: 44, style: { text: '亿吨碳排放', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 0, top: 100, style: { text: '电能利用效率 PUE · 实际值与政策目标', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif' } }
      ]
    });
  })();

  (function gap() {
    var ch = mk('c-gap');
    if (!ch) return;
    var rows = D.risks.gap;
    var sorted = rows.rows.slice().sort(function (a, b) { return a.v - b.v; });
    ch.setOption({
      animationDuration: 1000, animationDelay: function (i) { return i * 110; },
      grid: { left: 6, right: 120, top: 40, bottom: 8, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.045)' } },
        formatter: function (ps) {
          var i = sorted.findIndex(function (r) { return r.name === ps[0].axisValue; });
          return VZ.tip(ps[0].axisValue, [{ name: 'AI 应用率', value: sorted[i].v, unit: '%', color: C[sorted[i].c] }], rows.note);
        }
      }),
      xAxis: Object.assign(base({ line: false }), {
        type: 'value', max: 60, splitLine: { show: true, lineStyle: { color: INK.hair, type: 'dashed' } },
        axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}%' }
      }),
      yAxis: Object.assign(base({ line: false }), {
        type: 'category', data: sorted.map(function (r) { return r.name; }),
        axisLabel: { color: INK.text2, fontSize: 12.5 }
      }),
      series: [
        {
          name: '应用率', type: 'bar', barWidth: 14, z: 3,
          data: sorted.map(function (r) {
            return {
              value: r.v,
              itemStyle: { color: VZ.alpha(C[r.c], .95), borderRadius: 7, shadowBlur: 14, shadowColor: VZ.alpha(C[r.c], .45) }
            };
          }),
          label: {
            show: true, position: 'right', distance: 10,
            color: INK.text1, fontSize: 13, fontWeight: 600,
            fontFamily: '-apple-system, PingFang SC, sans-serif',
            formatter: function (p) { return p.value + '%'; }
          },
          // 参考线取代原来那条名为「连线」的恒定值柱（无信息量）
          markLine: {
            silent: true, symbol: 'none',
            lineStyle: { color: VZ.alpha(C.azure, .8), type: 'dashed', width: 1.2 },
            label: {
              show: true, rotate: 0, position: 'insideEndTop', distance: 6,
              color: C.azure, fontSize: 10.5,
              formatter: '全部企业平均 19.95%'
            },
            data: [{ xAxis: 19.95 }]
          }
        }
      ],
      graphic: [{
        type: 'text', left: 0, top: 4,
        style: { text: '不同规模经营主体的 AI 应用率落差', fill: INK.text2, font: '600 12px -apple-system,"PingFang SC",sans-serif' }
      }]
    });
  })();

  /* ══════════════════════════════════════════════════
     第 10 章 · 政策时间轴 + 政策密度
     ══════════════════════════════════════════════════ */
  (function timeline() {
    var box = document.getElementById('policyTl');
    if (!box) return;
    box.innerHTML = D.policy.map(function (p) {
      return '' +
        '<div class="tl__item" style="--tl-c:' + C[p.c] + '">' +
          '<div class="tl__yr">' + p.year + '</div>' +
          '<span class="tl__dot"></span>' +
          '<div class="tl__body">' +
            '<div class="tl__name">' + p.name + '</div>' +
            '<div class="tl__txt">' + p.text + '</div>' +
          '</div>' +
        '</div>';
    }).join('');
    if (window.VZ.observeReveal) window.VZ.observeReveal();
  })();

  (function policyChart() {
    var ch = mk('c-policy');
    if (!ch) return;
    var pd = D.policyDensity;
    var ind = D.series.aiIndustry.points.filter(function (p) { return p.year >= 2017 && p.year <= 2026; });
    var map = {};
    ind.forEach(function (p) { map[p.year] = p.value; });
    var years = pd.map(function (p) { return p.year + ''; });

    ch.setOption({
      animationDuration: 1000,
      grid: { left: 6, right: 12, top: 50, bottom: 8, containLabel: true },
      legend: {
        top: 4, right: 0, itemWidth: 10, itemHeight: 10, itemGap: 18,
        textStyle: { color: INK.text3, fontSize: 11 },
        data: ['重点政策数量', '人工智能产业规模']
      },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.045)' } },
        formatter: function (ps) {
          var y = +ps[0].axisValue;
          var rows = [{ name: '重点政策数量', value: ps[0].value, unit: '项', color: C.lilac }];
          if (map[y]) rows.push({ name: '人工智能产业规模', value: VZ.group(map[y]), unit: '亿元', color: C.amber });
          return VZ.tip(y + ' 年', rows, '政策计数口径见来源页');
        }
      }),
      xAxis: Object.assign(base({ line: true }), {
        type: 'category', data: years, axisLabel: { color: INK.text3, fontSize: 11 }
      }),
      yAxis: [
        Object.assign(base({ split: true, dash: 'dashed' }), {
          type: 'value', max: 4, axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value} 项' }
        }),
        Object.assign(base({}), {
          type: 'value', splitLine: { show: false },
          axisLabel: { color: INK.text4, fontSize: 10, formatter: function (v) { return v >= 10000 ? v / 10000 + '万' : v; } }
        })
      ],
      series: [
        {
          name: '重点政策数量', type: 'bar', barWidth: '46%',
          data: pd.map(function (p) {
            return {
              value: p.n,
              itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: new E.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: VZ.alpha(C.lilac, .95) },
                  { offset: 1, color: VZ.alpha(C.lilac, .12) }
                ])
              }
            };
          })
        },
        {
          name: '人工智能产业规模', type: 'line', yAxisIndex: 1, smooth: true,
          data: years.map(function (y) { return map[+y] || null; }),
          symbol: 'circle', symbolSize: 7, connectNulls: true,
          lineStyle: { width: 2.4, color: C.amber, shadowBlur: 16, shadowColor: VZ.alpha(C.amber, .5) },
          itemStyle: { color: C.amber, borderColor: '#fffdf8', borderWidth: 2 }
        }
      ]
    });
  })();

  /* ══════════════════════════════════════════════════
     第 11 章 · 展望
     ══════════════════════════════════════════════════ */
  (function outlook() {
    var ch = mk('c-outlook');
    if (!ch) return;
    var items = D.outlook.items.slice().sort(function (a, b) { return a.value - b.value; });
    ch.setOption({
      animationDuration: 1000, animationDelay: function (i) { return i * 120; },
      grid: { left: 6, right: 130, top: 22, bottom: 6, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var r = items[p.dataIndex];
          return VZ.tip(r.org + ' · ' + r.scope, [
            { name: '估算值', value: VZ.auto(r.value), unit: r.unit, color: C[r.c] },
            { name: '目标年份', value: r.year, color: INK.text3 }
          ], r.note);
        }
      }),
      xAxis: Object.assign(base({}), {
        type: 'value', show: false, max: 21
      }),
      yAxis: Object.assign(base({ line: false }), {
        type: 'category',
        data: items.map(function (r) { return r.org.replace(/ .*/, '') + ' · ' + r.scope; }),
        axisLabel: { color: INK.text2, fontSize: 11.5 }
      }),
      series: [{
        type: 'bar', barWidth: 15,
        data: items.map(function (r) {
          return {
            value: r.value,
            itemStyle: { color: VZ.fadeX(C[r.c], .25, .95), borderRadius: 8 }
          };
        }),
        showBackground: true, backgroundStyle: { color: 'rgba(27,22,17,.038)', borderRadius: 8 },
        label: {
          show: true, position: 'right', distance: 12,
          rich: {
            v: { color: INK.text1, fontSize: 14, fontWeight: 600, fontFamily: '-apple-system, PingFang SC, sans-serif' },
            u: { color: INK.text4, fontSize: 10.5 },
            y: { color: INK.text4, fontSize: 10, padding: [0, 0, 0, 6] }
          },
          formatter: function (p) {
            var r = items[p.dataIndex];
            return '{v|' + VZ.auto(r.value) + '}{u| ' + r.unit + '}{y|' + r.year + '}';
          }
        }
      }],
      graphic: [{
        type: 'text', left: 0, top: 2,
        style: { text: '横轴为原始数值 · 三类口径不可加总，条形长度仅在同一口径内部可比', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' }
      }]
    });
  })();

  (function growth() {
    var ch = mk('c-growth');
    if (!ch) return;
    var g = D.outlook.growth;
    ch.setOption({
      animationDuration: 1000, animationDelay: function (i) { return i * 130; },
      grid: { left: 6, right: 12, top: 40, bottom: 6, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,22,17,.045)' } },
        formatter: function (ps) {
          var rows = ps.map(function (p) {
            var i = g.findIndex(function (x) { return x.name === p.seriesName; });
            return { name: p.seriesName, value: p.value, unit: '%', color: C[g[i].c] };
          });
          return VZ.tip('增长动能结构（示意）', rows, '结构分解为示意性，用于表达相对关系');
        }
      }),
      legend: {
        top: 2, right: 0, itemWidth: 10, itemHeight: 10, itemGap: 16,
        textStyle: { color: INK.text3, fontSize: 11 },
        data: ['传统模式', 'AI 深化后']
      },
      xAxis: Object.assign(base({ line: true }), {
        type: 'category', data: g.map(function (x) { return x.name; }),
        axisLabel: { color: INK.text2, fontSize: 11.5 }
      }),
      yAxis: Object.assign(base({ split: true, dash: 'dashed' }), {
        type: 'value', max: 60, axisLabel: { color: INK.text4, fontSize: 10, formatter: '{value}%' }
      }),
      series: [
        {
          name: '传统模式', type: 'bar', barWidth: '28%',
          data: g.map(function (x) { return { value: x.before, itemStyle: { color: '#d5cabb', borderRadius: [5, 5, 0, 0] } }; })
        },
        {
          name: 'AI 深化后', type: 'bar', barWidth: '28%',
          data: g.map(function (x) {
            return { value: x.after, itemStyle: { color: VZ.alpha(C[x.c], .92), borderRadius: [5, 5, 0, 0], shadowBlur: 14, shadowColor: VZ.alpha(C[x.c], .4) } };
          }),
          label: {
            show: true, position: 'top', color: INK.text2, fontSize: 10.5,
            formatter: '{c}%'
          }
        }
      ]
    });
  })();

})();
