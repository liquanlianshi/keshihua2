/* ============================================================
   charts-b.js — 第 05—07 章图表
   行业深潜 / 中国地图与算力流 / 全球对比
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

  /* ══════════════════════════════════════════════════
     第 05 章 · 行业深潜
     ══════════════════════════════════════════════════ */
  (function sectors() {
    var tabBox = document.getElementById('sectorTabs');
    var paneBox = document.getElementById('sectorPanes');
    if (!tabBox || !paneBox) return;
    var list = D.sectors;

    tabBox.innerHTML = list.map(function (s, i) {
      return '<button class="tabs__btn' + (i === 0 ? ' is-active' : '') + '" data-pane="sec-' + s.id +
        '" data-tab-c="' + C[s.c] + '" role="tab" aria-selected="' + (i === 0) + '">' +
        '<i style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + C[s.c] + ';margin-right:7px;vertical-align:middle"></i>' +
        s.name + '</button>';
    }).join('');

    paneBox.innerHTML = list.map(function (s, i) {
      return '' +
      '<div class="tabpane' + (i === 0 ? ' is-active' : '') + '" id="sec-' + s.id + '" style="--sector-c:' + C[s.c] + '">' +
        '<div class="panel" data-glow="' + s.c + '">' +
          '<div class="sector__hero">' +
            '<div>' +
              '<span class="panel__no">' + s.kw + '</span>' +
              '<h3 class="sector__headline" style="margin-top:8px">' + s.head.replace(/([0-9][0-9.,%+]*\s*[^，。；]*)/g, '<em>$1</em>') + '</h3>' +
              '<p class="t-body" style="max-width:640px">' + s.lede + '</p>' +
              '<div class="stack" style="margin-top:20px">' +
                s.cases.map(function (c) {
                  return '<div class="case"><h4>' + c.t + '</h4><p>' + c.d + ' <span style="color:var(--text-4)">[' + c.s + ']</span></p></div>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="sector__kpi">' +
              s.metrics.map(function (m) {
                return '<div class="metric">' +
                  '<div class="metric__k">' + m.k + '</div>' +
                  '<div class="metric__v">' + m.v + '<small>' + m.u + '</small></div>' +
                  '<div class="metric__n">' + m.note + '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="panel__body" style="margin-top:26px">' +
            '<div class="row row--sb" style="margin-bottom:12px">' +
              '<span class="section-label" style="margin:0">' + s.name + ' · 关键指标量级</span>' +
              '<span class="t-micro">' + (s.chart.unit || '') + ' · 对数刻度</span>' +
            '</div>' +
            '<div class="chart chart--s" id="secchart-' + s.id + '"></div>' +
          '</div>' +
          '<div class="panel__foot">' +
            '<span>数据来源：' + s.metrics.concat(s.cases).map(function (x) { return '[' + x.s + '] ' + (SRC[x.s] ? SRC[x.s].org : x.s); }).filter(function (v, i2, a) { return a.indexOf(v) === i2; }).join(' · ') + '</span>' +
            '<span>数值为原始口径</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // 渲染每个行业的小条形图
    list.forEach(function (s) {
      var el = document.getElementById('secchart-' + s.id);
      if (!el) return;
      var ch = E.init(el, null, { renderer: 'canvas' });
      VZ.reg(ch);
      var data = s.chart.data.slice().sort(function (a, b) { return a.v - b.v; });
      ch.setOption({
        animationDuration: 800,
        grid: { left: 6, right: 90, top: 8, bottom: 6, containLabel: true },
        tooltip: Object.assign(TT(), {
          trigger: 'item',
          formatter: function (p) {
            var r = data[p.dataIndex];
            return VZ.tip(r.name, [{ name: '数值', value: VZ.auto(r.v), unit: s.chart.unit, color: C[r.c] }], '对数刻度仅用于同图比较');
          }
        }),
        xAxis: { type: 'value', show: false, min: 0 },
        yAxis: Object.assign(base({ line: false }), {
          type: 'category', data: data.map(function (r) { return r.name; }),
          axisLabel: { color: INK.text3, fontSize: 11.5 }
        }),
        series: [{
          type: 'bar', barWidth: 12,
          data: data.map(function (r) {
            return { value: +Math.log10(r.v + 1).toFixed(3), itemStyle: { color: VZ.alpha(C[r.c], .9), borderRadius: 6 } };
          }),
          showBackground: true, backgroundStyle: { color: 'rgba(27,22,17,.040)', borderRadius: 6 },
          label: {
            show: true, position: 'right', distance: 12,
            color: INK.text1, fontSize: 12.5, fontWeight: 600,
            fontFamily: '-apple-system, PingFang SC, sans-serif',
            formatter: function (p) { return VZ.auto(data[p.dataIndex].v); }
          }
        }]
      });
    });
  })();

  /* ══════════════════════════════════════════════════
     第 06 章 · 中国地图（区域竞争力梯队 + 东数西算）
     ══════════════════════════════════════════════════ */
  (function chinaMap() {
    var el = document.getElementById('c-map');
    if (!el) return;
    if (window.CHINA_GEOJSON) E.registerMap('china-viz', window.CHINA_GEOJSON);
    var ch = E.init(el, null, { renderer: 'canvas' });
    VZ.reg(ch);

    var PV = D.province;
    var tierColor = {};
    PV.tierMeta.forEach(function (t) { tierColor[t.v] = C[t.c]; });

    var TIER_ALPHA = { 1: 0.62, 2: 0.34, 3: 0.20, 4: 0.085 };
    var mapData = Object.keys(PV.tiers).map(function (name) {
      var t = PV.tiers[name];
      return { name: name, value: t, tier: t };
    });
    var regions = Object.keys(PV.tiers).map(function (name) {
      var t = PV.tiers[name];
      return {
        name: name,
        itemStyle: { areaColor: VZ.alpha(tierColor[t], TIER_ALPHA[t]), borderColor: VZ.alpha(tierColor[t], 0.30), borderWidth: 0.5 },
        emphasis: { itemStyle: { areaColor: VZ.alpha(tierColor[t], Math.min(1, TIER_ALPHA[t] + 0.30)) } }
      };
    });

    var hubs = D.computeHubs;
    var geoCoord = {
      '北京': [116.40, 39.90], '上海': [121.47, 31.23], '广东': [113.28, 23.13],
      '浙江': [120.15, 30.27], '江苏': [118.78, 32.06], '宁夏': [106.28, 38.47],
      '内蒙古': [111.65, 40.82], '甘肃': [103.82, 36.06], '贵州': [106.71, 26.57],
      '四川': [104.07, 30.67], '河北': [114.50, 38.05], '湖北': [114.31, 30.60],
      '安徽': [117.28, 31.86], '重庆': [106.55, 29.56], '山东': [117.00, 36.65],
      '福建': [119.30, 26.08], '陕西': [108.95, 34.27], '湖南': [112.98, 28.19]
    };
    var flows = [
      { from: '宁夏', to: '北京', c: 'azure' }, { from: '内蒙古', to: '北京', c: 'azure' },
      { from: '甘肃', to: '上海', c: 'teal' }, { from: '贵州', to: '广东', c: 'jade' },
      { from: '贵州', to: '上海', c: 'teal' }, { from: '内蒙古', to: '江苏', c: 'azure' },
      { from: '宁夏', to: '浙江', c: 'indigo' }, { from: '甘肃', to: '广东', c: 'jade' },
      { from: '四川', to: '广东', c: 'jade' }, { from: '贵州', to: '浙江', c: 'indigo' }
    ];

    ch.setOption({
      animationDuration: 1100,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          if (p.seriesType === 'lines') return '';
          if (p.seriesType === 'effectScatter') {
            var h = hubs.filter(function (x) { return x.name === p.name; })[0];
            return VZ.tip(p.name + ' 枢纽', [{ name: '集群', value: h ? h.cluster : '—', color: C.amber }],
              '「东数西算」国家算力枢纽节点');
          }
          var t = PV.tiers[p.name];
          if (!t) return VZ.tip(p.name, [{ name: '梯队', value: '未纳入评定', color: INK.text4 }]);
          var meta = PV.tierMeta.filter(function (m) { return m.v === t; })[0];
          return VZ.tip(p.name, [
            { name: '区域竞争力梯队', value: meta.name, color: C[meta.c] }
          ], '赛迪顾问《IT 云图 2025》与北京大学《2023 数字生态指数报告》');
        }
      }),
      geo: {
        map: 'china-viz', roam: false, zoom: 1.16,
        left: 30, right: 30, top: 14, bottom: 14,
        itemStyle: { areaColor: 'rgba(27,22,17,.030)', borderColor: '#ddd4c5', borderWidth: 0.6 },
        emphasis: { itemStyle: { areaColor: '#ddd4c5' }, label: { show: true, color: '#1b1611', fontSize: 11 } },
        label: { show: false },
        regions: regions
      },
      series: [
        {
          name: '竞争力梯队', type: 'map', map: 'china-viz', geoIndex: 0, data: mapData,
          emphasis: { label: { show: true, color: '#1b1611', fontSize: 11.5 } },
          select: { disabled: true }
        },
        {
          name: '数据调度流', type: 'lines', coordinateSystem: 'geo', zlevel: 2,
          effect: { show: true, period: 5.2, trailLength: 0.32, symbol: 'circle', symbolSize: 4.2, color: '#FFF6E8' },
          lineStyle: {
            color: function (p) { return VZ.alpha(C[flows[p.dataIndex % flows.length].c], .42); },
            width: 1.1, curveness: 0.28, opacity: .8
          },
          data: flows.map(function (f) { return { coords: [geoCoord[f.from], geoCoord[f.to]] }; })
        },
        {
          name: '算力枢纽', type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3,
          rippleEffect: { brushType: 'stroke', scale: 3.4, period: 4.2 },
          symbolSize: 9,
          itemStyle: { color: C.amber, shadowBlur: 14, shadowColor: VZ.alpha(C.amber, .8) },
          label: { show: true, position: 'right', formatter: '{b}', color: VZ.alpha('#1b1611', .78), fontSize: 11, distance: 6 },
          data: hubs.map(function (h) { return { name: h.name, value: h.coord.concat([100]) }; })
        }
      ]
    });

    // HTML 梯队图例
    var lg = document.createElement('div');
    lg.className = 'map-legend';
    lg.innerHTML = PV.tierMeta.map(function (t) {
      var names = Object.keys(PV.tiers).filter(function (n) { return PV.tiers[n] === t.v; });
      return '<div class="map-legend__i"><i style="background:' + VZ.alpha(C[t.c], t.v === 1 ? .8 : t.v === 2 ? .55 : t.v === 3 ? .34 : .18) + '"></i>' +
        '<span>' + t.name + '</span><em>' + names.join('、') + '</em></div>';
    }).join('');
    el.style.position = 'relative';
    el.appendChild(lg);
  })();

  /* ══════════════════════════════════════════════════
     图 06-2 · 五省集中度
     ══════════════════════════════════════════════════ */
  (function mapRatio() {
    var ch = mk('c-map-ratio');
    if (!ch) return;
    var con = D.province.concentration;
    var top = D.province.top;
    var maxTop = top[0].value;

    ch.setOption({
      animationDuration: 1000,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          return VZ.tip(p.name, [{ name: '占全国 AI 产业规模', value: p.value, unit: '%', color: p.color }],
            p.name === '前五省份' ? '北京、广东、上海、浙江、山东' : '其余 26 个省级行政区');
        }
      }),
      series: [{
        type: 'pie', radius: ['56%', '80%'], center: ['50%', '36%'], startAngle: 90,
        padAngle: 2.5, avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: '#fffdf8', borderWidth: 2 },
        label: { show: false }, labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 7 },
        data: [
          { name: '前五省份', value: con.five, itemStyle: { color: VZ.alpha(C.coral, .95), shadowBlur: 20, shadowColor: VZ.alpha(C.coral, .45) } },
          { name: '其余省份', value: con.rest, itemStyle: { color: '#ddd4c5' } }
        ]
      }],
      graphic: [
        { type: 'text', left: 'center', top: '27%', style: { text: con.five + '%', fill: C.coral, font: '700 32px -apple-system, PingFang SC, sans-serif', textAlign: 'center' } },
        { type: 'text', left: 'center', top: '42%', style: { text: '前五省份合计', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } },
        { type: 'text', left: 'center', top: '48%', style: { text: '占全国 AI 产业规模', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } }
      ]
    });

    // HTML 补充：五省注册存量
    var el = document.getElementById('c-map-ratio');
    el.style.position = 'relative';
    var list = document.createElement('div');
    list.className = 'ratio-list';
    list.innerHTML = top.map(function (t) {
      var w = (t.value / maxTop * 100).toFixed(1);
      return '<div class="ratio-list__r">' +
        '<span class="ratio-list__n">' + t.name + '</span>' +
        '<span class="ratio-list__bar"><i style="width:' + w + '%"></i></span>' +
        '<span class="ratio-list__v">' + (t.value / 10000).toFixed(1) + ' 万</span>' +
        '</div>';
    }).join('');
    el.appendChild(list);
  })();

  /* ══════════════════════════════════════════════════
     图 06-3 · 城市级头部排行
     ══════════════════════════════════════════════════ */
  (function mapRank() {
    var ch = mk('c-map-rank');
    if (!ch) return;
    var rows = D.province.cities.slice().sort(function (a, b) { return a.value - b.value; });

    ch.setOption({
      animationDuration: 900, animationDelay: function (i) { return i * 70; },
      grid: { left: 6, right: 74, top: 26, bottom: 6, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          return VZ.tip(rows[p.dataIndex].name, [
            { name: 'AI 相关企业', value: VZ.cn(rows[p.dataIndex].value, 2), unit: '家', color: C.amber }
          ], '企查查口径 · 截至 2024-09 · 城市级，不可与省级值混用');
        }
      }),
      xAxis: { type: 'value', show: false },
      yAxis: Object.assign(base({ line: false }), {
        type: 'category', data: rows.map(function (r) { return r.name; }),
        axisLabel: { color: INK.text2, fontSize: 12.5 }
      }),
      series: [{
        type: 'bar', barWidth: 14,
        data: rows.map(function (r) {
          return { value: r.value, itemStyle: { color: VZ.fadeX(C.amber, .25, .95), borderRadius: 7 } };
        }),
        showBackground: true, backgroundStyle: { color: 'rgba(27,22,17,.038)', borderRadius: 7 },
        label: {
          show: true, position: 'right', distance: 11,
          rich: {
            v: { color: INK.text1, fontSize: 13, fontWeight: 600, fontFamily: '-apple-system, PingFang SC, sans-serif' },
            u: { color: INK.text4, fontSize: 10 }
          },
          formatter: function (p) { return '{v|' + (p.value / 10000).toFixed(2) + '}{u| 万家}'; }
        }
      }],
      graphic: [{
        type: 'text', left: 0, top: 2,
        style: { text: '城市级 · 万家（企查查口径 2024-09）', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' }
      }]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 07-2 · 生成式 AI 专利国别结构
     ══════════════════════════════════════════════════ */
  (function patent() {
    var ch = mk('c-patent');
    if (!ch) return;
    var wipo = { cn: 43000, total: 56000 };
    var cnShare = wipo.cn / wipo.total * 100;
    var trend = [
      { y: '2023', v: 14000 }, { y: '2024', v: 26000 }, { y: '2025', v: 37800 }
    ];

    ch.setOption({
      animationDuration: 1000,
      grid: { left: 6, right: 30, top: 62, bottom: 6, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'axis',
        formatter: function (ps) {
          var i = ['2023', '2024', '2025'].indexOf(ps[0].axisValue);
          return VZ.tip(ps[0].axisValue + ' 年', [
            { name: '全球公布 GenAI 专利族', value: VZ.group(trend[i].v), unit: '个', color: C.lilac }
          ], i === 2 ? '2024 与 2025 两年合计公布量超过此前十年总和' : '2025 年为 WIPO 报告披露值');
        }
      }),
      xAxis: Object.assign(base({ line: true }), {
        type: 'category', data: trend.map(function (p) { return p.y; }), boundaryGap: false
      }),
      yAxis: Object.assign(base({ split: true, dash: 'dashed' }), {
        type: 'value', axisLabel: { color: INK.text4, fontSize: 10, formatter: function (v) { return v / 1000 + 'k'; } }
      }),
      series: [
        {
          type: 'line', data: trend.map(function (p) { return p.v; }),
          smooth: true, symbol: 'circle', symbolSize: 8,
          lineStyle: { width: 2.6, color: C.lilac, shadowBlur: 16, shadowColor: VZ.alpha(C.lilac, .5) },
          itemStyle: { color: C.lilac, borderColor: '#fffdf8', borderWidth: 2 },
          areaStyle: { color: VZ.fade(C.lilac, .28, 0) },
          label: {
            show: true, distance: 9, color: INK.text1, fontSize: 11, fontWeight: 600,
            position: 'top',
            formatter: function (p) { return VZ.group(p.value); }
          },
          labelLayout: { hideOverlap: false, moveOverlap: 'shiftX' }
        },
      ],
      graphic: [
        { type: 'text', left: 0, top: 4,
          style: { text: '中国占同期全球公布量的', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif' } },
        { type: 'text', left: 0, top: 18,
          style: { text: cnShare.toFixed(1) + '%', fill: C.coral, font: '700 26px -apple-system, "PingFang SC", sans-serif' } },
        { type: 'text', right: 0, top: 6,
          style: { text: '2024—2025 年，中国发明人公布 43,000+ 个专利族', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif', textAlign: 'right' } },
        { type: 'text', right: 0, top: 22,
          style: { text: '全球同期合计约 56,000 个', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif', textAlign: 'right' } }
      ]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 07-3 · 工业机器人密度国际对比
     ══════════════════════════════════════════════════ */
  (function robot() {
    var ch = mk('c-robot');
    if (!ch) return;
    var rows = [
      { n: '韩国', v: 1012, c: 'lilac' },
      { n: '新加坡', v: 770, c: 'indigo' },
      { n: '中国', v: 470, c: 'coral' },
      { n: '德国', v: 429, c: 'azure', approx: true },
      { n: '日本', v: 419, c: 'teal', approx: true },
      { n: '全球平均', v: 162, c: 'olive' }
    ];
    ch.setOption({
      animationDuration: 900, animationDelay: function (i) { return i * 70; },
      grid: { left: 6, right: 60, top: 24, bottom: 6, containLabel: true },
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          var r = rows[p.dataIndex];
          return VZ.tip(r.n, [{ name: '机器人密度', value: VZ.group(r.v), unit: '台/万人', color: C[r.c] }],
            r.approx ? '约值 · IFR 2023 年口径' : 'IFR《2024 年世界机器人报告》');
        }
      }),
      xAxis: { type: 'value', show: false },
      yAxis: Object.assign(base({ line: false }), {
        type: 'category', data: rows.map(function (r) { return r.n; }).reverse(),
        axisLabel: {
          color: INK.text2, fontSize: 12,
          formatter: function (v, i) { return v; }
        }
      }),
      series: [{
        type: 'bar', barWidth: 14,
        data: rows.map(function (r) {
          return {
            value: r.v,
            itemStyle: r.approx
              // 约值：空心 + 虚线描边，与实测值在视觉上区分
              ? { color: '#fffdf8', borderColor: C[r.c], borderWidth: 1.4, borderType: 'dashed', borderRadius: 3 }
              : { color: VZ.fadeX(C[r.c], .22, .95), borderRadius: 3 }
          };
        }).reverse(),
        showBackground: true, backgroundStyle: { color: 'rgba(27,22,17,.038)', borderRadius: 7 },
        label: {
          show: true, position: 'right', distance: 11,
          color: INK.text1, fontSize: 12, fontWeight: 600,
          fontFamily: '-apple-system, PingFang SC, sans-serif',
          formatter: function (p) {
            var r = rows.slice().reverse()[p.dataIndex];
            return (r.approx ? '约 ' : '') + VZ.group(p.value);
          }
        }
      }],
      graphic: [{
        type: 'text', left: 0, top: 4,
        style: { text: '2023 年 · 台/万名制造业员工　·　虚线空心条为约值', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif' }
      }]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 07-4 · 全球 AI 综合能力雷达
     ══════════════════════════════════════════════════ */
  (function radarGlobal() {
    var ch = mk('c-radar-global');
    if (!ch) return;
    var ind = ['专利产出', '算力规模', '模型数量', '论文影响力', '机器人密度', '产业生态'];
    var sets = [
      { name: '中国', v: [96, 78, 88, 84, 82, 86], c: 'coral' },
      { name: '美国', v: [72, 100, 95, 96, 62, 94], c: 'azure' },
      { name: '欧洲', v: [52, 62, 66, 78, 70, 68], c: 'indigo' },
      { name: '其他地区', v: [30, 34, 40, 44, 58, 38], c: 'jade' }
    ];
    ch.setOption({
      animationDuration: 1000,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          return VZ.tip(p.name, ind.map(function (n, i) {
            return { name: n, value: p.value[i], color: C[sets.find(function (s) { return s.name === p.name; }).c] };
          }), '归一化指数（0—100）· 综合多源数据构建，示意性');
        }
      }),
      radar: {
        center: ['50%', '52%'], radius: '62%',
        indicator: ind.map(function (n) { return { name: n, max: 100 }; }),
        axisName: { color: INK.text3, fontSize: 10.5 },
        axisLine: { lineStyle: { color: 'rgba(27,22,17,.10)' } },
        splitLine: { lineStyle: { color: 'rgba(27,22,17,.085)' } },
        splitArea: { areaStyle: { color: ['rgba(27,22,17,.010)', 'rgba(27,22,17,.026)'] } }
      },
      legend: {
        bottom: 0, itemWidth: 9, itemHeight: 9, itemGap: 12,
        textStyle: { color: INK.text3, fontSize: 10.5 },
        data: ['中国', '美国', '欧洲', '其他地区']
      },
      series: [{
        type: 'radar', symbolSize: 4,
        data: sets.map(function (s) {
          var c = C[s.c];
          return {
            value: s.v, name: s.name,
            itemStyle: { color: c },
            lineStyle: { width: s.name === '中国' ? 2.4 : 1.4, color: VZ.alpha(c, s.name === '中国' ? 1 : .7) },
            areaStyle: { color: VZ.alpha(c, s.name === '中国' ? .22 : .06) }
          };
        })
      }]
    });
  })();

  /* ══════════════════════════════════════════════════
     图 07-5 · 灯塔工厂国别分布
     ══════════════════════════════════════════════════ */
  (function lighthouse() {
    var ch = mk('c-lighthouse');
    if (!ch) return;
    var total = 224, cn = 101, fresh = 23, freshCn = 16;

    ch.setOption({
      animationDuration: 1000,
      tooltip: Object.assign(TT(), {
        trigger: 'item',
        formatter: function (p) {
          return VZ.tip(p.name, [{ name: '数量', value: VZ.group(p.value), unit: '家', color: p.color }],
            p.name === '中国' ? '占全球 ' + (cn / total * 100).toFixed(1) + '%' : '');
        }
      }),
      series: [
        {
          type: 'pie', radius: ['58%', '84%'], center: ['33%', '54%'], startAngle: 90,
          padAngle: 2.4, avoidLabelOverlap: true,
          itemStyle: { borderRadius: 8, borderColor: '#fffdf8', borderWidth: 2 },
          label: { show: false }, labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 8 },
          data: [
            { name: '中国', value: cn, itemStyle: { color: VZ.alpha(C.coral, .95), shadowBlur: 22, shadowColor: VZ.alpha(C.coral, .5) } },
            { name: '其他经济体', value: total - cn, itemStyle: { color: '#e0d7c8' } }
          ]
        },
        {
          type: 'pie', radius: ['58%', '84%'], center: ['76%', '54%'], startAngle: 90,
          padAngle: 2.4,
          itemStyle: { borderRadius: 8, borderColor: '#fffdf8', borderWidth: 2 },
          label: { show: false }, labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 8 },
          data: [
            { name: '中国', value: freshCn, itemStyle: { color: VZ.alpha(C.amber, .95), shadowBlur: 22, shadowColor: VZ.alpha(C.amber, .5) } },
            { name: '其他经济体', value: fresh - freshCn, itemStyle: { color: '#e0d7c8' } }
          ]
        }
      ],
      graphic: [
        { type: 'text', left: '33%', top: '42%', style: { text: cn, fill: C.coral, font: '700 30px -apple-system,PingFang SC,sans-serif', textAlign: 'center' } },
        { type: 'text', left: '33%', top: '58%', style: { text: '累计 · 全部 ' + total + ' 家', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } },
        { type: 'text', left: '76%', top: '42%', style: { text: freshCn, fill: C.amber, font: '700 30px -apple-system,PingFang SC,sans-serif', textAlign: 'center' } },
        { type: 'text', left: '76%', top: '58%', style: { text: '最新一批 ' + fresh + ' 家', fill: INK.text4, font: '10.5px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } },
        { type: 'text', left: 'center', bottom: 4, style: { text: '世界经济论坛全球灯塔工厂网络 · 2026 年 1 月', fill: INK.text4, font: '10px -apple-system,"PingFang SC",sans-serif', textAlign: 'center' } }
      ]
    });
  })();

})();
