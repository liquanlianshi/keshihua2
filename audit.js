// audit.js — 可视化正确性审计：检查数据越界 / NaN / 空序列 / 轴设置等问题
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  // 触发所有 tab，让隐藏图表也初始化
  await page.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
    for (const b of document.querySelectorAll('.tabs__btn')) { b.click(); await new Promise(r => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1800);

  const report = await page.evaluate(() => {
    const E = window.echarts;
    const out = [];
    const els = [...document.querySelectorAll('.chart')];
    const num = v => typeof v === 'number' && isFinite(v);

    function walkData(d, acc) {
      if (d == null) { acc.nullish++; return acc; }
      if (typeof d === 'number') {
        if (!isFinite(d)) acc.bad.push(String(d));
        acc.nums.push(d);
        return acc;
      }
      if (typeof d === 'string') { acc.strs.push(d); return acc; }
      if (Array.isArray(d)) { d.forEach(x => walkData(x, acc)); return acc; }
      if (typeof d === 'object') {
        if ('value' in d) walkData(d.value, acc);
        return acc;
      }
      return acc;
    }

    for (const el of els) {
      const inst = E.getInstanceByDom(el);
      const item = { id: el.id, issues: [], series: [] };
      if (!inst) { item.issues.push('图表实例不存在'); out.push(item); continue; }
      let opt;
      try { opt = inst.getOption(); } catch (e) { item.issues.push('getOption 失败: ' + e.message); out.push(item); continue; }
      if (!opt) { item.issues.push('getOption 返回空'); out.push(item); continue; }

      const axes = [].concat(opt.xAxis || [], opt.yAxis || []).filter(Boolean);

      (opt.series || []).forEach((s, si) => {
        const acc = { nullish: 0, bad: [], nums: [], strs: [] };
        // 形如 [[x, y], ...] 的成对数据：分别归入 x 与 y，避免把 x 当成 y 检查
        const paired = (s.data || []).length > 0 &&
          (s.data || []).every(d => Array.isArray(d) && d.length === 2 && d.every(num));
        const xAcc = { nullish: 0, bad: [], nums: [], strs: [] };
        if (paired) {
          (s.data || []).forEach(d => { walkData(d[0], xAcc); walkData(d[1], acc); });
        } else {
          (s.data || []).forEach(d => walkData(d, acc));
        }
        // 也检查 series.data 里的嵌套
        const name = s.name || s.type + '#' + si;
        const rec = {
          i: si, name, type: s.type,
          n: (s.data || []).length,
          nullish: acc.nullish,
          nonFinite: acc.bad.slice(0, 5)
        };
        item.series.push(rec);

        if (acc.bad.length) item.issues.push(`序列「${name}」含非有限数值 ${acc.bad.slice(0, 4).join(',')}`);
        if ((s.data || []).length === 0 && !['lines', 'graph', 'sankey', 'map'].includes(s.type))
          item.issues.push(`序列「${name}」数据为空`);

        // 轴越界检查（仅对 value 轴 + 主体为数值的序列）
        if (acc.nums.length) {
          const mn = Math.min(...acc.nums), mx = Math.max(...acc.nums);
          const xi = s.xAxisIndex || 0, yi = s.yAxisIndex || 0;
          const xa = [].concat(opt.xAxis || [])[xi];
          const ya = [].concat(opt.yAxis || [])[yi];
          const check = (ax, lo, hi, tag) => {
            if (!ax || ax.type !== 'value') return;
            if (ax.min != null && lo < ax.min - 1e-9) item.issues.push(`序列「${name}」${tag}最小值 ${lo} 低于轴下限 ${ax.min} → 被裁剪`);
            if (ax.max != null && hi > ax.max + 1e-9) item.issues.push(`序列「${name}」${tag}最大值 ${hi} 超出轴上限 ${ax.max} → 被裁剪`);
          };
          if (paired && xAcc.nums.length) {
            check(xa, Math.min(...xAcc.nums), Math.max(...xAcc.nums), 'X');
          }
          if (s.type === 'bar' && ya && ya.type === 'category') check(xa, mn, mx, 'X');
          else check(ya, mn, mx, 'Y');
        }

        if (s.type === 'pie') {
          const neg = (s.data || []).filter(d => d && typeof d.value === 'number' && d.value < 0);
          if (neg.length) item.issues.push(`饼图「${name}」含负值`);
          const sum = (s.data || []).reduce((a, d) => a + (d && +d.value || 0), 0);
          if (sum <= 0) item.issues.push(`饼图「${name}」总值为 0`);
        }
      });

      // 多值轴范围差异提示
      const valAxes = (opt.yAxis || []).filter(a => a && a.type === 'value');
      if (valAxes.length > 1) {
        // 只有当某条轴不是 0 基时才存在斜率误读风险
        const nonZero = valAxes.filter(a => a.min != null && a.min !== 0);
        if (nonZero.length) {
          const ranges = valAxes.map(a => `${a.min != null ? a.min : 'auto'}~${a.max != null ? a.max : 'auto'}`);
          item.issues.push(`双 Y 轴且存在非 0 基轴，范围 ${ranges.join(' / ')} → 斜率不可直接比较`);
        }
      }

      // 图例与序列名匹配
      const lg = opt.legend && opt.legend[0];
      if (lg && lg.data && lg.data.length) {
        // 雷达图的图例对应 series.data[].name，而非 series.name
        let names = [];
        (opt.series || []).forEach(s => {
          if (s.name) names.push(s.name);
          if (s.type === 'radar') (s.data || []).forEach(d => { if (d && d.name) names.push(d.name); });
        });
        const miss = lg.data.filter(d => !names.includes(typeof d === 'string' ? d : d.name));
        if (miss.length) item.issues.push(`图例项无对应序列: ${miss.join(',')}`);
      }
      out.push(item);
    }
    return out;
  });

  let bad = 0;
  for (const c of report) {
    if (c.issues.length) {
      bad++;
      console.log('\n▸ ' + c.id);
      c.issues.forEach(i => console.log('   ⚠ ' + i));
    }
  }
  console.log(`\n检查 ${report.length} 张图，${bad} 张存在问题`);
  console.log(errs.length ? 'JS ERRORS: ' + errs.join(' | ') : 'JS: no errors');
  await browser.close();
})();
