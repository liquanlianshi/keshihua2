/* ============================================================
   site-data.js — 站点唯一数据源
   所有图表与正文数字均来源于此文件；每个数据点都带来源编号。
   数据来源见文件末尾 SOURCES，完整说明见 sources.html
   最后核对：2026-10
   ============================================================ */
window.AI_DATA = (function () {

  /* ---------------------------------------------------------
     来源登记表
     --------------------------------------------------------- */
  var SOURCES = {
    s1: { org: '中国信息通信研究院', title: '《中国数字经济发展研究报告（2025年）》', date: '2026-03', url: 'https://scitech.ce.cn/sy/zx/202603/t20260326_2858550.shtml', via: '人民邮电报 / 中国经济网' },
    s2: { org: '中国信息通信研究院', title: '2026中国信通院深度观察报告会', date: '2025-12', url: 'https://finance.eastmoney.com/a/202512143590913490.html', via: '经济参考网' },
    s3: { org: '工业和信息化部', title: '2025年工业和信息化发展成效新闻发布会', date: '2026-02', url: 'https://m.163.com/dy/article/KLHPSSQI0512D71I.html', via: '中国经济时报' },
    s4: { org: '国家数据局', title: '《全国数据资源调查报告（2025年）》', date: '2026-04', url: 'https://www.sohu.com/a/1016343263_120988576', via: '上海证券报' },
    s5: { org: '国家互联网信息办公室', title: '生成式人工智能服务已备案信息公告', date: '2026-09', url: 'https://www.163.com/dy/article/L6RUE3LH0514R9OJ.html', via: '中证网' },
    s6: { org: '国家互联网信息办公室', title: '2025年生成式人工智能服务已备案信息公告', date: '2026-01', url: 'https://www.bianews.com/news/flash?id=229550', via: '华尔街见闻' },
    s7: { org: '工业和信息化部', title: '国新办新闻发布会（总工程师赵志国）', date: '2024-10', url: 'https://news.cctv.com/2024/10/13/ARTIMhD41Ivl1Ygc7HwVXsfV241013.shtml', via: '央视网' },
    s8: { org: '世界知识产权组织 WIPO', title: '生成式人工智能专利态势（技术SPARK报告）', date: '2026-07', url: 'https://www.wipo.int/zh/web/office-china/w/wipo-china-genai-innovation-soaring-with-patent-activity-nearly-tripling-in-two-years', via: 'WIPO 中国办事处' },
    s9: { org: '国际机器人联合会 IFR', title: '《2024年世界机器人报告》', date: '2024-11', url: 'https://m.sohu.com/a/829311768_120988576/', via: '上海证券报' },
    s10: { org: '世界经济论坛 WEF', title: '全球灯塔工厂网络（最新一批名单）', date: '2026-01', url: 'https://finance.sina.com.cn/jjxw/2026-01-27/doc-inhitntx9797720.shtml', via: '中国质量报' },
    s11: { org: '工业和信息化部等四部门', title: '《汽车行业数字化转型实施方案》', date: '2025-12', url: 'https://gxt.fujian.gov.cn/zwgk/xw/hydt/xydt/202512/t20251231_7069961.htm', via: '新华社' },
    s12: { org: 'Frost & Sullivan', title: '全球 AI 医疗产业发展研究', date: '2026-06', url: 'https://hub.frost.com/pdfviewer/development-of-the-global-ai-healthcare-industry/', via: 'Frost Radar' },
    s13: { org: '人民日报（产经观察）', title: '人工智能产业迎来发展新机遇', date: '2023-03', url: 'http://www.china.com.cn/news/2023-03/15/content_85169133.htm', via: '中国网' },
    s14: { org: '世界经济论坛 WEF', title: '《未来就业报告 2025》(Future of Jobs Report 2025)', date: '2025-01', url: 'https://reports.weforum.org/docs/WEF_Future_of_Jobs_2025.pdf', via: 'WEF' },
    s19: { org: '中国信息通信研究院', title: '2026 中国信通院深度观察报告会（产业规模口径与测算）', date: '2025-12', url: 'https://finance.eastmoney.com/a/202512143590913490.html', via: '经济参考网' },
    s20: { org: '赛迪顾问', title: '《IT 云图 2025 · 中国人工智能区域竞争力研究》', date: '2025-06', url: 'https://www.x-techcon.com/article/2034.html', via: '赛迪顾问' },
    s21: { org: '北京大学', title: '《2023 数字生态指数报告》', date: '2023', url: 'https://bda.pku.edu.cn/PDF/2023shuzishengtaizhishubaogao.pdf', via: '北京大学大数据分析与应用技术国家工程实验室' },
    s22: { org: '中国信息通信研究院', title: '人工智能产业规模的省级集中度测算', date: '2026-08', url: 'https://www.zhitongcaijing.com/content/detail/1475436.html', via: '智通财经' },
    s23: { org: '中国信息通信研究院', title: '《绿色算力发展研究报告（2025年）》', date: '2025-07', url: 'https://finance.sina.cn/2025-07-29/detail-infiavhc4916151.d.html', via: '2025 绿色算力（人工智能）大会' },
    s24: { org: '国家发展改革委等四部门', title: '《数据中心绿色低碳发展专项行动计划》（发改环资〔2024〕970号）', date: '2024-07', url: 'https://www.163.com/dy/article/J7U4PQRU0518KCLG.html', via: '国家发展改革委' },
    s25: { org: '欧盟统计局 Eurostat', title: '《2025 年企业 ICT 使用调查》（AI 采用率）', date: '2025', url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises', via: 'Eurostat' },
    s26: { org: 'PwC / 高盛 / IDC / 麦肯锡 / 中国信通院', title: 'AI 经济影响的长期情景测算', date: '2017—2026', url: 'https://www.mckinsey.com.cn/生成式ai在中国：2万亿美元的经济价值/', via: '多机构' },
    s27: { org: '天眼查专业版', title: '人工智能相关企业注册存量统计', date: '2026-02', url: 'https://m.163.com/dy/article/KLE0BRHQ0519D4UH.html', via: '天眼查' },
    s28: { org: '企查查 / 中商产业研究院', title: '城市级人工智能相关企业数量（2024-09）', date: '2024-09', url: 'https://m.askci.com/news/chanye/20240930/145701272767942108560814.shtml', via: '中商产业研究院' }
  };

  /* ---------------------------------------------------------
     首屏 KPI
     --------------------------------------------------------- */
  var heroKpi = [
    { label: '人工智能核心产业规模', value: 1.2, dp: 1, unit: '万亿元', sub: '2025 年初步测算 · 同比增速超 30%', color: 'amber', src: 's2' },
    { label: '智能算力规模', value: 1590, dp: 0, unit: 'EFLOPS', sub: '2025 年底 · 居全球前列', color: 'azure', src: 's3' },
    { label: '全球灯塔工厂中国占比', value: 45.1, dp: 1, unit: '%', sub: '101 / 224 家 · 全球第一', color: 'jade', src: 's10' },
    { label: '生成式 AI 服务累计备案', value: 1112, dp: 0, unit: '款', sub: '截至 2026 年 8 月 31 日', color: 'lilac', src: 's5' }
  ];

  /* ---------------------------------------------------------
     时间序列
     --------------------------------------------------------- */
  var series = {

    /* AI 核心产业规模（亿元）
       2020—2023 为中国信通院「人工智能核心产业规模」连续口径；
       2024 年起信通院改用「人工智能产业规模」口径并纳入大模型、智能体、
       具身智能等新增门类，两段数据不可直接比较，图中已用断点标注。 */
    aiIndustry: {
      name: '人工智能产业规模', unit: '亿元', src: 's2,s19',
      caliberNote: '2020—2023 为「人工智能核心产业规模」口径；2024 年起为「人工智能产业规模」新口径，两者不可直接比较。',
      points: [
        { year: 2020, value: 3100, conf: '中' },
        { year: 2021, value: 4041, conf: '高' },
        { year: 2022, value: 5080, conf: '高' },
        { year: 2023, value: 5784, conf: '高' },
        { year: 2024, value: 9000, conf: '高', caliber: 'new' },
        { year: 2025, value: 12000, conf: '高', caliber: 'new', est: true }
      ]
    },

    /* 生成式 AI 服务累计备案数（款） */
    modelFilings: {
      name: '生成式 AI 服务累计备案', unit: '款', src: 's5,s6,s7',
      points: [
        { year: 2023, value: 0, label: '2023.08 首批备案' },
        { year: 2024, value: 302, label: '2024 年底' },
        { year: 2025, value: 748, label: '2025 年底' },
        { year: 2026, value: 1112, label: '2026.08' }
      ]
    },

    /* 数字经济规模（万亿元） */
    digitalEconomy: {
      name: '数字经济规模', unit: '万亿元', src: 's1',
      points: [
        { year: 2019, value: 35.8 }, { year: 2020, value: 39.2 },
        { year: 2021, value: 45.5 }, { year: 2022, value: 50.2 },
        { year: 2023, value: 53.9 }, { year: 2024, value: 59.2 }
      ],
      gdpShare: [
        { year: 2019, value: 36.2 }, { year: 2020, value: 38.6 },
        { year: 2021, value: 39.8 }, { year: 2022, value: 41.5 },
        { year: 2023, value: 42.8 }, { year: 2024, value: 43.8 }
      ]
    },

    /* 数据生产总量（ZB） */
    dataVolume: {
      name: '全国年度数据生产总量', unit: 'ZB', src: 's4',
      points: [
        { year: 2023, value: 32.85 }, { year: 2024, value: 41.06 }, { year: 2025, value: 52.26 }
      ]
    },

    /* 数字经济全要素生产率对经济增长的贡献率（%） */
    tfpContribution: {
      name: '数字经济 TFP 对经济增长贡献率', unit: '%', src: 's1',
      points: [
        { year: 2013, value: 16.30 }, { year: 2024, value: 23.75 }
      ]
    }
  };

  /* ---------------------------------------------------------
     算力与数据基础设施「刻度尺」
     --------------------------------------------------------- */
  var infraScale = [
    { name: '在用算力中心机架', value: 1250, unit: '万标准机架', year: '2025.09', color: 'azure', src: 's3' },
    { name: '智能算力规模', value: 1590, unit: 'EFLOPS', year: '2025 年底', color: 'indigo', src: 's3' },
    { name: '万卡智算集群', value: 42, unit: '个', year: '2025 年底', color: 'lilac', src: 's3' },
    { name: '算力市场规模', value: 8351, unit: '亿元', year: '2025 年', color: 'amber', src: 's3', growth: '+30%' },
    { name: '5G 基站数', value: 483.8, unit: '万个', year: '2025 年底', color: 'jade', src: 's3' },
    { name: '光缆线路总长度', value: 7499, unit: '万公里', year: '2025 年底', color: 'teal', src: 's3' },
    { name: '国家算力互联网汇集算力', value: 163, unit: 'EFLOPS', year: '2026 年初', color: 'coral', src: 's3' },
    { name: '运营商可调度智算规模', value: 94.4, unit: 'EFLOPS', year: '2025 年底', color: 'rose', src: 's3', growth: '+87.6%' }
  ];

  /* 从数据到智能的「价值放大」链 */
  var dataFunnel = [
    { stage: '数据生产总量', value: 52.26, unit: 'ZB', depth: 0, color: 'azure', src: 's4', note: '占全球约 27.44%' },
    { stage: '全国数据存储总量', value: 2.53, unit: 'ZB', depth: 1, color: 'teal', src: 's4', note: '同比 +21.05%' },
    { stage: 'AI 训练与推理数据量', value: 199.48, unit: 'EB', depth: 2, color: 'jade', src: 's4', note: '同比 +42.86%，其中推理 101.34 EB 首超训练' },
    { stage: '高质量数据集规模', value: 908, unit: 'PB', depth: 3, color: 'olive', src: 's4', note: '数据集超 11 万个 · 规模同比 +142.58%' },
    { stage: '全年 Token 调用量', value: 21100, unit: '万亿', depth: 4, color: 'amber', src: 's4', note: 'Token 正在成为人工智能的新度量衡' }
  ];

  /* ---------------------------------------------------------
     价值传导桑基（相对强度示意）
     --------------------------------------------------------- */
  var sankey = {
    layers: ['要素投入', '技术能力', '行业场景', '经济价值'],
    nodes: [
      /* L0 要素 */
      { name: '算力设施', c: 'azure', layer: 0 },
      { name: '数据要素', c: 'teal', layer: 0 },
      { name: '算法与模型', c: 'indigo', layer: 0 },
      { name: 'AI 人才', c: 'lilac', layer: 0 },
      /* L1 能力 */
      { name: '基础大模型', c: 'indigo', layer: 1 },
      { name: '机器视觉', c: 'teal', layer: 1 },
      { name: '智能决策优化', c: 'azure', layer: 1 },
      { name: '生成式内容', c: 'lilac', layer: 1 },
      { name: '具身智能体', c: 'rose', layer: 1 },
      /* L2 场景 */
      { name: '智能制造', c: 'coral', layer: 2 },
      { name: '医疗健康', c: 'jade', layer: 2 },
      { name: '交通物流', c: 'azure', layer: 2 },
      { name: '金融服务', c: 'amber', layer: 2 },
      { name: '政务民生', c: 'lilac', layer: 2 },
      { name: '科研教育', c: 'indigo', layer: 2 },
      /* L3 价值 */
      { name: '降本', c: 'olive', layer: 3 },
      { name: '增效', c: 'jade', layer: 3 },
      { name: '提质', c: 'teal', layer: 3 },
      { name: '创新', c: 'amber', layer: 3 }
    ],
    /* 索引：L0 要素 0-3 ｜ L1 能力 4-8 ｜ L2 场景 9-14 ｜ L3 价值 15-18 */
    links: [
      [0, 4, 9], [0, 6, 7], [0, 8, 4],
      [1, 4, 11], [1, 6, 5], [1, 7, 6],
      [2, 4, 10], [2, 7, 5], [2, 8, 6],
      [3, 4, 4], [3, 5, 4], [3, 6, 3],

      [4, 9, 7], [4, 10, 6], [4, 11, 5], [4, 12, 5], [4, 14, 4], [4, 13, 4],
      [5, 9, 8], [5, 10, 5], [5, 12, 3],
      [6, 9, 6], [6, 11, 5], [6, 12, 5], [6, 13, 3],
      [7, 14, 7], [7, 12, 4], [7, 13, 3],
      [8, 9, 4], [8, 11, 3],

      [9, 15, 6], [9, 16, 3], [9, 17, 3],
      [10, 16, 6], [10, 17, 5], [10, 18, 3],
      [11, 16, 5], [11, 17, 4], [11, 18, 3],
      [12, 17, 4], [12, 18, 5],
      [13, 18, 6], [13, 16, 2],
      [14, 18, 6], [14, 17, 2]
    ]
  };

  /* 四类价值结构（示意性分解） */
  var valueMix = [
    { name: '降本', value: 26, c: 'olive', note: '流程自动化、人力与能耗削减' },
    { name: '增效', value: 31, c: 'jade', note: '周转、响应与决策速度' },
    { name: '提质', value: 24, c: 'teal', note: '良品率、诊断准确率、稳定性' },
    { name: '创新', value: 19, c: 'amber', note: '新产品、新场景、新模式' }
  ];

  /* ---------------------------------------------------------
     三要素
     --------------------------------------------------------- */
  var factors = [
    {
      id: 'worker', name: '劳动者', en: 'Labourer', c: 'amber', idx: '壹',
      def: '人不再是唯一的劳动主体，而是与智能体组成混合劳动力。',
      stats: [
        { k: '生成式 AI 服务注册用户', v: '6 亿+', s: 's7' },
        { k: '已备案生成式 AI 服务', v: '1112 款', s: 's5' },
        { k: 'AI 模型语言理解能力提升', v: '+30%', s: 's2' },
        { k: 'AI 模型多模态理解能力提升', v: '+50%', s: 's2' }
      ],
      chart: { type: 'mini-line', series: [[302], [748], [1112]], labels: ['2024', '2025', '2026.08'], unit: '款' }
    },
    {
      id: 'means', name: '劳动资料', en: 'Means of Labour', c: 'azure', idx: '贰',
      def: '算力与模型成为新的生产工具，工具第一次具备了「理解」能力。',
      stats: [
        { k: '智能算力规模', v: '1590 EFLOPS', s: 's3' },
        { k: '万卡智算集群', v: '42 个', s: 's3' },
        { k: '工业机器人密度', v: '470 台/万人', s: 's9' },
        { k: '全球灯塔工厂', v: '101 家（全球 45%）', s: 's10' }
      ],
      chart: { type: 'mini-bars', series: [162, 470, 770, 1012], labels: ['全球平均', '中国', '新加坡', '韩国'], unit: '台/万人' }
    },
    {
      id: 'object', name: '劳动对象', en: 'Object of Labour', c: 'jade', idx: '叁',
      def: '数据从生产过程的副产品，变成可以被加工、定价和交易的对象。',
      stats: [
        { k: '年度数据生产总量', v: '52.26 ZB', s: 's4' },
        { k: '高质量数据集', v: '11 万个 / 908 PB', s: 's4' },
        { k: '数据跨省流通总量', v: '2949 EB', s: 's4' },
        { k: '数据产品交易额增速', v: '+39.8%', s: 's4' }
      ],
      chart: { type: 'mini-line', series: [[32.85],[41.06],[52.26]], labels: ['2023', '2024', '2025'], unit: 'ZB' }
    }
  ];

  /* ---------------------------------------------------------
     行业深潜
     --------------------------------------------------------- */
  var sectors = [
    {
      id: 'manufacture', name: '智能制造', kw: 'Manufacturing', c: 'coral',
      head: 'AI 落地密度最高、单位价值最实的方向',
      lede: '制造业的价值链条长、数据密度高、停机成本大，这三点让 AI 的投入产出比最容易算清楚。',
      metrics: [
        { k: '全球灯塔工厂 · 中国', v: '101', u: '家', note: '占全球 224 家的 45.1%', s: 's10' },
        { k: '工业机器人密度', v: '470', u: '台/万人', note: '2023 年跃居全球第三，超过德日', s: 's9' },
        { k: '中国安装工业机器人', v: '27.63', u: '万台', note: '占 2023 年全球新安装量的 51%', s: 's9' },
        { k: '关键工序数控化率目标', v: '>70', u: '%', note: '汽车行业 2027 年目标', s: 's11' }
      ],
      cases: [
        { t: '美的厨热芜湖工厂', d: '113 个数字化用例，其中 35% 由 AI 驱动，碳排放降低 47%。', s: 's10' },
        { t: '西门子南京数字化工厂', d: '数字孪生使高端数控系统交付周期从 45 天压缩至 10 天。', s: 's10' },
        { t: '汽车行业数字化转型方案', d: '到 2027 年全员劳动生产率较 2025 年提升 10%，研发与交付周期缩短 20%。', s: 's11' }
      ],
      chart: { type: 'bar', unit: '家 / 台每万人', data: [ { name: '灯塔工厂（中国）', v: 101, c: 'coral' }, { name: '灯塔工厂（其他）', v: 123, c: 'olive' }, { name: '机器人密度·中国', v: 470, c: 'coral' }, { name: '机器人密度·全球均值', v: 162, c: 'olive' } ] }
    },
    {
      id: 'health', name: '医疗健康', kw: 'Healthcare', c: 'jade',
      head: '从辅助诊断到三类证：AI 正在通过最严格的审批',
      lede: '医疗是 AI 落地门槛最高的行业之一。获批数量的增长，比任何宣传都更有说服力。',
      metrics: [
        { k: '获批三类影像 AI 产品', v: '134', u: '款', note: '截至 2026 年 6 月', s: 's12' },
        { k: '心血管方向', v: '31', u: '款', note: '获批数量最多', s: 's12' },
        { k: '肺部方向', v: '29', u: '款', note: '第二大方向', s: 's12' }
      ],
      cases: [
        { t: '审批即验证', d: '三类证是国家药监局风险等级最高的医疗器械类别，每一款获批都意味着临床验证完成。', s: 's12' },
        { t: '结构性集中', d: '心血管与肺部两个方向合计占获批产品的近一半，说明 AI 影像的价值在标准化程度高的部位最先兑现。', s: 's12' }
      ],
      chart: { type: 'bar', unit: '款', data: [ { name: '心血管', v: 31, c: 'jade' }, { name: '肺部', v: 29, c: 'teal' }, { name: '其他方向合计', v: 74, c: 'olive' } ] }
    },
    {
      id: 'logistics', name: '交通物流', kw: 'Mobility', c: 'azure',
      head: '数据生产增量最大的行业之一',
      lede: '车、路、仓、港每一环都在持续产生数据，交通物流成为 AI 训练语料的重要来源。',
      metrics: [
        { k: '交通物流数据增量', v: '+1.22', u: 'ZB', note: '2025 年同比增量', s: 's4' },
        { k: '低空经济数据增速', v: '477.78 / 75', u: '%', note: '具身智能 / 低空经济', s: 's4' },
        { k: '数据跨省流通总量', v: '2949.12', u: 'EB', note: '同比 +19.01%，粤浙苏鲁豫居前', s: 's4' }
      ],
      cases: [
        { t: '数据即燃料', d: '2025 年交通物流数据生产量增幅达 1.22 ZB，仅次于工业制造。', s: 's4' },
        { t: '低空经济', d: '低空经济领域数据生产量同比增长 75%，成为新的数据增长极。', s: 's4' }
      ],
      chart: { type: 'bar', unit: 'ZB（增量）', data: [ { name: '工业制造', v: 1.27, c: 'coral' }, { name: '交通物流', v: 1.22, c: 'azure' }, { name: '软件与信息服务', v: 0.92, c: 'indigo' } ] }
    },
    {
      id: 'finance', name: '金融数据', kw: 'Finance', c: 'amber',
      head: '最先为数据付费的行业',
      lede: '金融业对风险定价的敏感度，使它成为数据要素市场化最积极的买方。',
      metrics: [
        { k: '购买过数据的企业比例', v: '>30', u: '%', note: '金融、软件与信息服务行业', s: 's4' },
        { k: '企业数据产品交易额增速', v: '+39.8', u: '%', note: '2025 年同比', s: 's4' },
        { k: '企业数据技术投入增速', v: '+17.37', u: '%', note: '2025 年同比', s: 's4' }
      ],
      cases: [
        { t: '付费意愿先行', d: '样本企业中 11.65% 购买过数据，购买数据费用同比增长 22.36%，金融业购买比例超 30%。', s: 's4' },
        { t: '数据产品化', d: '企业数据产品和服务数量同比增长 29.29%，从数字化副产品转变为驱动业务增长的引擎。', s: 's4' }
      ],
      chart: { type: 'bar', unit: '%', data: [ { name: '金融业购买数据比例', v: 30, c: 'amber' }, { name: '软件与信息服务业', v: 30, c: 'coral' }, { name: '全行业平均', v: 11.65, c: 'olive' } ] }
    },
    {
      id: 'public', name: '政务民生', kw: 'Public Sector', c: 'lilac',
      head: '公共数据开放成为 AI 的公共基础设施',
      lede: '公共数据是最大规模的高质量语料来源，其开放程度直接决定了行业模型的上限。',
      metrics: [
        { k: '公共数据开放量增速', v: '+31.71', u: '%', note: '2025 年同比', s: 's4' },
        { k: '授权运营数据量增速', v: '+53.96', u: '%', note: '2025 年同比', s: 's4' },
        { k: '申请共享数据集增速', v: '近 +30', u: '%', note: '2025 年同比', s: 's4' }
      ],
      cases: [
        { t: '三类数据协同', d: '共享、开放、授权运营三条路径的数据量同时快速增长，公共数据开始真正进入生产环节。', s: 's4' },
        { t: '场景覆盖', d: '公共数据带动融合应用覆盖产业发展、教育科技、医疗健康、民生服务、基层治理等场景。', s: 's4' }
      ],
      chart: { type: 'bar', unit: '%（同比增速）', data: [ { name: '授权运营数据量', v: 53.96, c: 'lilac' }, { name: '开放数据量', v: 31.71, c: 'indigo' }, { name: '申请共享数据集', v: 30, c: 'azure' } ] }
    },
    {
      id: 'embodied', name: '具身智能', kw: 'Embodied AI', c: 'rose',
      head: '大模型第一次拥有了身体',
      lede: '2025 年最陡的一条增长曲线。具身智能把语言模型的能力接到了物理世界上。',
      metrics: [
        { k: '具身智能融资额', v: '400 亿+', u: '元', note: '2025 年', s: 's2' },
        { k: '产业上下游企业', v: '350', u: '家+', note: '2025 年', s: 's2' },
        { k: '数据采集场', v: '27', u: '家', note: '全国已建设', s: 's2' },
        { k: '数据生产量增速', v: '477.78', u: '%', note: '2025 年同比', s: 's4' }
      ],
      cases: [
        { t: '扩展定律的迁移', d: '多家科研机构验证端到端具身大模型同样存在扩展定律，提升智能水平的主要途径是训练数据的质与量。', s: 's2' },
        { t: '从点到面', d: '已在物流分拣、应急救援、迎宾导览、零售等场景取得初步的点状突破，但泛化能力仍是主要障碍。', s: 's2' }
      ],
      chart: { type: 'bar', unit: '亿元 / 家 / %', data: [ { name: '融资额（亿元）', v: 400, c: 'rose' }, { name: '企业数（家）', v: 350, c: 'coral' }, { name: '数据增速（%）', v: 477.78, c: 'amber' }, { name: '采集场（家）', v: 27, c: 'lilac' } ] }
    }
  ];

  /* ---------------------------------------------------------
     中国版图
     说明：省级「人工智能相关企业数量」不存在公开的统一口径全量数据，
     因此地图采用公开研究中的「区域竞争力梯队」呈现相对格局，
     另附可核实的省级与城市级数值。
     --------------------------------------------------------- */
  var province = {
    metric: '人工智能区域竞争力梯队',
    unit: '梯队',
    src: 's20,s21',
    note: '省级精确企业数量缺乏公开统一口径（跨源差异可达数倍），故地图以赛迪顾问《IT云图 2025》与北京大学《2023 数字生态指数报告》的梯队划分为依据，呈现相对格局而非绝对数值。',
    tiers: {
      '北京': 1, '广东': 1, '上海': 1, '浙江': 1,
      '江苏': 2, '安徽': 2, '山东': 2, '湖北': 2, '四川': 2, '福建': 2,
      '天津': 3, '河南': 3, '湖南': 3, '重庆': 3, '辽宁': 3, '陕西': 3,
      '河北': 4, '山西': 4, '内蒙古': 4, '吉林': 4, '黑龙江': 4, '江西': 4,
      '广西': 4, '海南': 4, '贵州': 4, '云南': 4, '西藏': 4, '甘肃': 4,
      '青海': 4, '宁夏': 4, '新疆': 4, '台湾': 4, '香港': 4, '澳门': 4
    },
    tierMeta: [
      { name: '引领者梯队', v: 1, c: 'coral' },
      { name: '挑战者梯队', v: 2, c: 'amber' },
      { name: '第三梯队', v: 3, c: 'azure' },
      { name: '其他省份', v: 4, c: 'indigo' }
    ],
    /* 天眼查专业版：人工智能相关企业注册存量（2026-02） */
    top: [
      { name: '广东', value: 772000 }, { name: '北京', value: 401000 },
      { name: '江苏', value: 385000 }, { name: '山东', value: 328000 },
      { name: '浙江', value: 306000 }
    ],
    /* 企查查口径：城市级（2024-09） */
    cities: [
      { name: '北京', value: 122500 }, { name: '深圳', value: 99100 },
      { name: '广州', value: 98800 }, { name: '上海', value: 87600 }
    ],
    concentration: { five: 80, rest: 20, src: 's22', note: '北京、广东、上海、浙江、山东五省份合计占我国人工智能产业规模比重超过 80%（中国信通院）' }
  };

  /* 「东数西算」八大枢纽 + 十大集群 */
  var computeHubs = [
    { name: '京津冀', cluster: '张家口', coord: [114.9, 40.8], role: '枢纽' },
    { name: '长三角', cluster: '芜湖 / 长三角生态绿色一体化示范区', coord: [118.4, 31.3], role: '枢纽' },
    { name: '粤港澳', cluster: '韶关', coord: [113.6, 24.8], role: '枢纽' },
    { name: '成渝', cluster: '天府 / 重庆', coord: [104.1, 30.6], role: '枢纽' },
    { name: '内蒙古', cluster: '和林格尔', coord: [111.8, 40.4], role: '枢纽' },
    { name: '贵州', cluster: '贵安', coord: [106.6, 26.6], role: '枢纽' },
    { name: '甘肃', cluster: '庆阳', coord: [107.6, 35.7], role: '枢纽' },
    { name: '宁夏', cluster: '中卫', coord: [105.2, 37.5], role: '枢纽' }
  ];

  /* ---------------------------------------------------------
     第 08 章 · 模拟器参数与模型
     --------------------------------------------------------- */
  var simParams = [
    { id: 'p', name: 'AI 应用渗透率', unit: '%', min: 0, max: 100, base: 22, c: 'coral',
      hint: '有多少比例的生产环节实际接入了 AI 能力' },
    { id: 'c', name: '算力投入强度', unit: '', min: 0, max: 100, base: 45, c: 'azure',
      hint: '单位经济产出的智能算力供给水平' },
    { id: 'd', name: '数据要素开放度', unit: '', min: 0, max: 100, base: 38, c: 'jade',
      hint: '可流通、可训练的高质量数据占比' },
    { id: 'r', name: '人才与技能密度', unit: '', min: 0, max: 100, base: 41, c: 'amber',
      hint: '具备人机协同能力的劳动者比例' }
  ];

  /* 模型系数（示意性） */
  var simModel = {
    gdpBase: 134.9,        // 2024 年中国 GDP（万亿元）
    passThrough: 0.18,     // TFP 提升向增加值增量的折算系数
    k: { p: 0.26, c: 0.15, d: 0.13, r: 0.18, interact: 0.14, scale: 0.62 },
    job: { base: 5, jobP: 24, jobC: 6 }
  };

  /* ---------------------------------------------------------
     第 09 章 · 边界与代价
     --------------------------------------------------------- */
  var risks = {
    jobs: {
      src: 's14',
      items: [
        { k: '到 2030 年新增岗位', v: 170, u: '百万个', c: 'jade' },
        { k: '同期被替代岗位', v: 92, u: '百万个', c: 'coral' },
        { k: '净增岗位', v: 78, u: '百万个', c: 'amber' },
        { k: '核心技能将发生变化', v: 39, u: '%', c: 'lilac' }
      ],
      rising: ['农场工人', '配送司机', '建筑工人', '销售员', '食品加工', '护理经济'],
      falling: ['行政助理', '票务员', '收银员', '文书秘书类'],
      note: '世界经济论坛《未来就业报告 2025》· 覆盖 55 个经济体、22 个行业群、1000+ 雇主 · 全球口径'
    },
    energy: {
      src: 's23,s24',
      headline: [
        { k: '2024 年全国数据中心用电量', v: 1660, u: '亿千瓦时', c: 'coral' },
        { k: '占全社会用电量', v: 1.68, u: '%', c: 'amber' },
        { k: '碳排放总量', v: 0.859, u: '亿吨', c: 'lilac' },
        { k: '平均电能利用效率 PUE', v: 1.46, u: '', c: 'jade' }
      ],
      pue: [
        { name: '全国平均（2024 实际）', v: 1.46, c: 'jade' },
        { name: '全国平均目标（2025 年底）', v: 1.50, c: 'olive' },
        { name: '新建大型/超大型目标', v: 1.25, c: 'amber' },
        { name: '国家枢纽节点上限', v: 1.20, c: 'coral' }
      ],
      note: '中国信通院《绿色算力发展研究报告（2025年）》；政策目标见发改环资〔2024〕970 号《数据中心绿色低碳发展专项行动计划》。截至 2024 年底全国在用数据中心机架超 900 万标准机架，先进数据中心绿电使用率约 80%。'
    },
    gap: {
      src: 's25',
      rows: [
        { name: '大型企业（250 人以上）', v: 55.03, c: 'jade' },
        { name: '中型企业（50—249 人）', v: 30.36, c: 'teal' },
        { name: '小型企业（10—49 人）', v: 17.0, c: 'coral' },
        { name: '全部企业平均', v: 19.95, c: 'azure' }
      ],
      note: '欧盟统计局 Eurostat《2025 年企业 ICT 使用调查》：大型企业 AI 采用率是小型企业的 3.2 倍。中国暂无同口径全量公开数据。'
    },
    polar: [
      { k: '八大国家算力枢纽智算规模占全国比重', v: '80%+', s: 's4' },
      { k: '头部平台与央企数据流通规模 / 其他企业', v: '140 倍+', s: 's4' },
      { k: '头部平台与央企购买数据费用 / 其他企业', v: '60 倍', s: 's4' },
      { k: '样本企业中购买过数据的比例', v: '11.65%', s: 's4' }
    ]
  };

  /* ---------------------------------------------------------
     第 10 章 · 政策时间轴
     --------------------------------------------------------- */
  var policy = [
    { year: '2017', name: '《新一代人工智能发展规划》', text: '国务院发布，首个国家级人工智能顶层设计，提出三步走目标。', c: 'amber', n: 1 },
    { year: '2019', name: '新一代人工智能创新发展试验区', text: '科技部启动试验区建设，以地方试点推动场景落地。', c: 'sand', n: 1 },
    { year: '2020', name: '新型基础设施建设', text: '数据中心、智能计算中心被纳入「新基建」范围，算力开始被当作公共基础设施。', c: 'olive', n: 1 },
    { year: '2021', name: '《「十四五」数字经济发展规划》', text: '明确数字经济核心产业增加值占 GDP 比重的量化目标。', c: 'jade', n: 2 },
    { year: '2023', name: '《生成式人工智能服务管理暂行办法》', text: '全球首部针对生成式 AI 的专门规章，确立备案与安全评估制度。', c: 'teal', n: 1 },
    { year: '2024', name: '「人工智能+」行动首次写入政府工作报告', text: '从「互联网+」到「人工智能+」，政策语汇完成代际切换。', c: 'azure', n: 2 },
    { year: '2025', name: '《关于深入实施「人工智能+」行动的意见》', text: '国务院层面系统部署，明确与制造、消费、民生等领域的融合路径。', c: 'indigo', n: 3 },
    { year: '2025', name: '《汽车行业数字化转型实施方案》', text: '四部门联合发布：2027 年关键工序数控化率超 70%，全员劳动生产率提升 10%。', c: 'lilac', n: 1 },
    { year: '2026', name: '「十五五」规划建议纳入全国一体化算力网', text: '算力网首次进入国家级基础设施体系，要求适度超前建设。', c: 'rose', n: 2 }
  ];

  /* 政策密度（中央级重点文件计数 · 见来源页口径说明） */
  var policyDensity = [
    { year: 2017, n: 1 }, { year: 2018, n: 1 }, { year: 2019, n: 1 }, { year: 2020, n: 1 },
    { year: 2021, n: 2 }, { year: 2022, n: 2 }, { year: 2023, n: 1 }, { year: 2024, n: 2 },
    { year: 2025, n: 3 }, { year: 2026, n: 2 }
  ];

  /* ---------------------------------------------------------
     第 11 章 · 展望
     --------------------------------------------------------- */
  var outlook = {
    src: 's26',
    note: '三类口径不可加总：GDP 增量（PwC / 高盛 / IDC）、年度经济价值（麦肯锡）、产业规模（中国信通院）。',
    items: [
      { org: 'PwC', scope: '全球 GDP 增量', value: 15.7, unit: '万亿美元', year: 2030, c: 'amber', note: '相当于全球 GDP 增长 14% · PwC《Sizing the Prize》' },
      { org: 'IDC', scope: '全球 AI 经济影响', value: 19.9, unit: '万亿美元', year: 2030, c: 'lilac', note: 'IDC 测算 2030 年全球 GDP 的 3.5% 将来自 AI' },
      { org: 'PwC', scope: '中国 GDP 增量', value: 7.0, unit: '万亿美元', year: 2030, c: 'coral', note: '相当于中国 GDP 增长 26.1%，为全球受益最大地区' },
      { org: '高盛', scope: '全球 GDP 增量', value: 7.0, unit: '万亿美元', year: 2030, c: 'azure', note: '生成式 AI 或推动全球 GDP 增长约 7%' },
      { org: 'PwC', scope: '北美 GDP 增量', value: 3.7, unit: '万亿美元', year: 2030, c: 'indigo', note: '相当于北美 GDP 增长 14.5%' },
      { org: '麦肯锡', scope: '中国年度经济价值', value: 2.0, unit: '万亿美元/年', year: 2030, c: 'jade', note: '生成式 AI 在中国可释放的经济价值（非 GDP 增量口径）' },
      { org: '中国信通院', scope: '中国产业规模', value: 1.2, unit: '万亿元', year: 2025, c: 'teal', note: '人工智能产业规模（同比 +40%）· 产业口径，非 GDP 贡献' }
    ],
    growth: [
      { name: '资本投入', before: 52, after: 38, c: 'azure' },
      { name: '劳动投入', before: 18, after: 12, c: 'amber' },
      { name: '全要素生产率', before: 30, after: 50, c: 'jade' }
    ]
  };

  return {
    meta: {
      title: '智能跃迁 · 人工智能作为新质生产力',
      asOf: '2026-10',
      note: '本页所有实测数据均标注来源编号；示意性模型已在图表中明确标注。'
    },
    risks: risks,
    policy: policy,
    policyDensity: policyDensity,
    simParams: simParams,
    simModel: simModel,
    outlook: outlook,
    SOURCES: SOURCES,
    heroKpi: heroKpi,
    series: series,
    infraScale: infraScale,
    dataFunnel: dataFunnel,
    sankey: sankey,
    valueMix: valueMix,
    factors: factors,
    sectors: sectors,
    province: province,
    computeHubs: computeHubs
  };
})();
