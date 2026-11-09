/* CH.02 · 支付的业务模式
   五个坐标 / 场景对照 / 工具时间轴 / 四象限 / 八种来源 / 卡组织拓扑 / 服务商分层 / 地理关卡 */

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 进度 + 进场 */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const REVEAL = '.sec-head, .axis-grid, .scene-grid, .tl, .quad-grid, .src-grid, .topo-scroll, .psp, .geo-grid, .map-grid, .three-law, .quiz';
  $$(REVEAL).forEach((el) => el.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── 01 五个坐标 ─────────────────────────────────── */
  const AXES = {
    scene: {
      letter: 'A',
      title: '按场景：钱在哪儿交接',
      lead: '先看付款人与收款人有没有面对面。',
      cats: [
        { n: 'A01', name: '线下支付', desc: '面对面物理接触。POS 联网、二维码在线，只要人在现场，仍算线下。', metric: '身份易认证 · 回款快' },
        { n: 'A02', name: '线上支付', desc: '发生在互联网上。无接触，需要第三方担保与更强的身份验证。', metric: '身份难验证 · T+N 结算' },
        { n: 'A03', name: 'O2O', desc: '线上下单、线下履约。线上与线下的边界正在模糊。', metric: '线上引流 · 线下交付' }
      ]
    },
    tool: {
      letter: 'B',
      title: '按工具：授权信息怎么传',
      lead: '支付总要通过一种工具，传递授权、指令与结果。',
      cats: [
        { n: 'B01', name: '信函支付', desc: '邮政信汇：汇款单寄到邮局，收款人凭身份领取。速度以天计。', metric: '数天 · 成本低' },
        { n: 'B02', name: '电报支付', desc: '电汇：以电磁波传递指令，约 30 万公里/秒；按字与金额收费。', metric: '30 万 km/s · 成本高' },
        { n: 'B03', name: 'IVR 支付', desc: '固定电话按键输入卡号、有效期、验证码；适合不熟智能手机的人。', metric: '实时 · 覆盖固定电话' },
        { n: 'B04', name: '电视支付', desc: '有线电视封闭网络 + 遥控器。输入困难，普及低，已被手机替代。', metric: '实时 · 已被冷落' },
        { n: 'B05', name: '浏览器支付', desc: '电脑浏览器完成支付；非对称加密，但 Cookie 会留下隐私痕迹。', metric: '光速 · 轻量 · Cookie 风险' },
        { n: 'B06', name: '手机支付', desc: 'App / QR / NFC；安全通道 + 生物识别，电子钱包逐步替代实体钱包。', metric: '实时 · 覆盖最广' }
      ]
    },
    role: {
      letter: 'C',
      title: '按角色：谁付给谁',
      lead: 'B 是商户，C 是消费者。看资金的流向，不看谁在收钱。',
      cats: [
        { n: 'C01', name: 'C2C', desc: '消费者付给消费者：AA 分账、二手交易、朋友小额借贷。', metric: '中国金额占比约 10%' },
        { n: 'C02', name: 'C2B', desc: '消费者付给商户：买咖啡、点外卖、逛超市。最常用。', metric: '中国金额占比约 20%' },
        { n: 'C03', name: 'B2B', desc: '商户付给商户：采购、房租、云服务。单笔大、频率低。', metric: '中国金额占比约 50%' },
        { n: 'C04', name: 'B2C', desc: '商户付给消费者：工资、补贴、助学金。包含政府的 G2C。', metric: '中国金额占比约 20%' }
      ]
    },
    source: {
      letter: 'D',
      title: '按资金来源：钱从哪来',
      lead: '最接近支付本质的分类：钱在不在账上，谁承担信用风险。',
      cats: [
        { n: 'D01', name: '现金', desc: '纸币硬币直接交付。不依赖电与网络，广泛可接受。', metric: '即时 · 离线可用' },
        { n: 'D02', name: '支票', desc: '出票人签发，收款人入账。出票不等于到账，可能跳票。', metric: '延迟 · 依赖银行' },
        { n: 'D03', name: '银行账户', desc: '授权银行从账户扣款；以账面余额为限，不能透支。', metric: '即时 · 账面为限' },
        { n: 'D04', name: '互联网账户', desc: '邮箱、IM、手机号、会员账户与金融账户绑定后支付。', metric: '即时 · 高频小额' },
        { n: 'D05', name: '信用卡', desc: '先透支后还款，五方分工；欺诈与拒付风险高。', metric: '信用 · 先花后还' },
        { n: 'D06', name: '借记卡', desc: '银行账户的卡片形态；余额不足即失败，丢失损失大。', metric: '即时 · 余额为限' },
        { n: 'D07', name: '预付费卡', desc: '先存后用，额度固定；适合申请不到信用卡的人群。', metric: '预付 · 额度固定' },
        { n: 'D08', name: '先买后付', desc: 'BNPL：按月分期，用坏账概率定价；年轻人偏爱。', metric: '信用 · 分期偿还' }
      ]
    },
    geo: {
      letter: 'E',
      title: '按地理范围：跨了几道关',
      lead: '境内、跨境、入境，差的是流程与接口，不是支付本身。',
      cats: [
        { n: 'E01', name: '境内支付', desc: '付款人、收款人、账户都在同一国家或地区。', metric: '一套规则 · 一种货币' },
        { n: 'E02', name: '跨境支付', desc: '消费者在境内、商户在境外；过海关、商检、外汇、物流。', metric: '四道关 · 汇率风险' },
        { n: 'E03', name: '入境支付', desc: '外国游客在本地消费；涉及外币兑换、钱包受理、退税、语言。', metric: '四种兼容 · 本地收单' }
      ]
    }
  };

  const axisBar = $('#axisBar'), axisCards = $('#axisCards');
  function renderAxis(key) {
    const a = AXES[key];
    $('#axisTitle').textContent = a.title;
    $('#axisLead').textContent = a.lead;
    $('#axisCount').textContent = `AXIS ${a.letter} / 05 · ${a.cats.length} 类`;
    axisCards.innerHTML = a.cats.map((c, i) => `
      <div class="axis-card${i === 0 ? ' is-hot' : ''}">
        <div class="ac-n mono">${c.n}</div>
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
        <div class="ac-m mono">${c.metric}</div>
      </div>`).join('');
    $$('.axis-btn', axisBar).forEach((b) => b.classList.toggle('is-on', b.dataset.axis === key));
  }
  axisBar.addEventListener('click', (e) => {
    const b = e.target.closest('.axis-btn');
    if (b) renderAxis(b.dataset.axis);
  });
  renderAxis('scene');

  /* ── 02 场景对照 ─────────────────────────────────── */
  const sceneOff = $('#sceneOff'), sceneOn = $('#sceneOn');
  function setScene(online) {
    sceneOff.classList.toggle('is-on', !online);
    sceneOn.classList.toggle('is-on', online);
    const v = online
      ? { id: 40, step: 4, days: 3, idW: '40%', stepW: '80%', daysW: '60%' }
      : { id: 90, step: 2, days: 0, idW: '90%', stepW: '40%', daysW: '10%' };
    $('#smId').style.width = v.idW; $('#smIdV').textContent = v.id;
    $('#smStep').style.width = v.stepW; $('#smStepV').textContent = v.step;
    $('#smDays').style.width = v.daysW; $('#smDaysV').textContent = v.days;
    $('#sceneNote').innerHTML = online
      ? '线上支付未必「无线」：钱走银行网络，信息走互联网。真正的差别是<b>没有面对面，信任必须由第三方补</b>。'
      : '线下支付未必离线：POS 联网、二维码在线，只要人面对面，仍算线下。<b>「线」指通信网络，不指有没有人。</b>';
  }
  sceneOff.addEventListener('click', () => setScene(false));
  sceneOn.addEventListener('click', () => setScene(true));

  /* ── 03 工具时间轴 ───────────────────────────────── */
  const STOPS = {
    letter: { year: '19 世纪', name: '信函支付', desc: '通过邮政系统寄送汇款单，收款人到邮局验明正身领款。信息与资金都慢，但覆盖到没有银行网点的地区。', speed: '数天–数周', cost: '低', sec: '低 / 邮政可达' },
    telegraph: { year: '150 年前', name: '电报支付', desc: '用电报传递支付授权与指令，约 30 万公里/秒。比信函快几个数量级，按字与汇款金额收费。', speed: '30 万 km/s', cost: '高', sec: '中 / 加密传输' },
    ivr: { year: '1990s', name: 'IVR 支付', desc: '打银行电话，按语音提示用电话键盘输入卡号、有效期、验证码。对不熟智能手机的人友好。', speed: '实时', cost: '低', sec: '中 / 固定电话网' },
    tv: { year: '2000s', name: '电视支付', desc: '在有线电视封闭网络上传递支付信息。遥控器输入困难、机顶盒能力有限，普及度很低。', speed: '实时', cost: '中', sec: '中 / 封闭网络' },
    browser: { year: '1995–', name: '浏览器支付', desc: '在电脑浏览器完成支付，配合电商爆发。非对称加密保障传输，但 Cookie 会留下隐私痕迹。', speed: '光速', cost: '低', sec: '中 / Cookie 风险' },
    phone: { year: '2008– 现在', name: '手机支付', desc: '智能手机解决空中传递的加密问题，电子钱包把现金、卡、会员卡装进手机。扫码与 NFC 只是入口。', speed: '实时', cost: '低', sec: '高 / 覆盖最广' }
  };
  const tlStops = $('#tlStops');
  function setStop(key) {
    const s = STOPS[key];
    $('#tlYear').textContent = s.year;
    $('#tlName').textContent = s.name;
    $('#tlDesc').textContent = s.desc;
    $('#tlSpeed').textContent = s.speed;
    $('#tlCost').textContent = s.cost;
    $('#tlSec').textContent = s.sec;
    $$('.tl-stop', tlStops).forEach((b) => b.classList.toggle('is-on', b.dataset.t === key));
  }
  tlStops.addEventListener('click', (e) => {
    const b = e.target.closest('.tl-stop');
    if (b) setStop(b.dataset.t);
  });
  setStop('phone');

  /* ── 04 四象限 ───────────────────────────────────── */
  const QUADS = {
    c2c: { k: 'C2C', t: '消费者付给消费者', d: 'AA 分账、二手交易、朋友小额借贷。单笔小、频率低，中国支付金额占比约 <b>10%</b>。', share: '10%', freq: '最低', ticket: '小' },
    c2b: { k: 'C2B', t: '消费者付给商户', d: '最常见的支付：买咖啡、点外卖、逛超市。单笔小、笔数多，是钱包与收单机构的主战场。中国支付金额占比约 <b>20%</b>。', share: '20%', freq: '最高', ticket: '小' },
    b2b: { k: 'B2B', t: '商户付给商户', d: '采购生产资料、付房租、买云服务。单笔大、频率低，但金额占比最大，约 <b>50%</b>。', share: '50%', freq: '低', ticket: '大' },
    b2c: { k: 'B2C', t: '商户付给消费者', d: '工资、奖金、社保、助学金、政府补贴。总额不小，但分到每个人不多；多数走银行转账。占比约 <b>20%</b>。', share: '20%', freq: '定期', ticket: '小' }
  };
  const quadGrid = $('#quadGrid');
  function setQuad(key) {
    const q = QUADS[key];
    $('#qReadK').textContent = `SELECTED / ${q.k}`;
    $('#qReadT').textContent = q.t;
    $('#qReadD').innerHTML = q.d;
    $('#qShare').textContent = q.share;
    $('#qFreq').textContent = q.freq;
    $('#qTicket').textContent = q.ticket;
    $$('.quad-cell', quadGrid).forEach((b) => b.classList.toggle('is-on', b.dataset.q === key));
  }
  quadGrid.addEventListener('click', (e) => {
    const b = e.target.closest('.quad-cell');
    if (b) setQuad(b.dataset.q);
  });
  setQuad('c2b');

  /* ── 05 资金来源 ─────────────────────────────────── */
  const SOURCES = {
    cash: { n: 'SRC 01', name: '现金', type: '即时 · 离线', d: '纸币或硬币直接交付。最大好处是广泛可接受：没电、没信号也能完成。问题是流通成本高——金库、安防、消毒、销毁都要钱。', risk: '谁持有谁付' },
    cheque: { n: 'SRC 02', name: '支票', type: '延迟 · 银行信用', d: '出票人填写收款人与金额并签字。方便大额，但出票不等于到账：可能跳票，也有工本费。美国仍是基础支付方式，中国主要公司用。', risk: '出票人信用' },
    bank: { n: 'SRC 03', name: '银行账户', type: '即时 · 账面为限', d: '付款人把收款人、金额、时间等指令发给开户行；银行查余额后转账。跨行与跨境都能走，但账户暴露有风险，且收处理费。', risk: '银行与账户安全' },
    internet: { n: 'SRC 04', name: '互联网账户', type: '即时 · 高频小额', d: '把邮箱、IM、手机号或电商会员账户与金融账户绑定，支付时从信息账户发起。好处是不直接暴露银行卡；问题是账户天天在网上，容易被盗，必须设限额与强授权。', risk: '账户盗用' },
    credit: { n: 'SRC 05', name: '信用卡', type: '信用 · 先花后还', d: '二战后快速发展，涉及卡组织、发卡行、收单行、持卡人、商户五方；规则成熟、系统复杂、费用高，也是欺诈与拒付的重灾区。', risk: '发卡行承担信用风险' },
    debit: { n: 'SRC 06', name: '借记卡', type: '即时 · 余额为限', d: '本质是银行账户支付：直接扣款，余额不足即失败。环节比信用卡少、欺诈风险低，但卡丢失损失大，跨境受理不如信用卡广。', risk: '持卡人承担损失' },
    prepaid: { n: 'SRC 07', name: '预付费卡', type: '预付 · 额度固定', d: '购卡时先存入资金，消费时从卡内扣，周期末结算给商户。适合申请不到信用卡的人；额度有限，但独立于银行账户，被盗损失有限。', risk: '预付余额' },
    bnpl: { n: 'SRC 08', name: '先买后付', type: '信用 · 分期偿还', d: 'BNPL 把消费欠款打包成金融产品，按坏账概率定价。实质是守信用的人替不守信用的人分担损失，和保险同一逻辑。', risk: 'BNPL 公司承担坏账' }
  };
  const srcGrid = $('#srcGrid');
  function setSource(key) {
    const s = SOURCES[key];
    $('#srL').textContent = `SELECTED / ${s.n}`;
    $('#srName').textContent = s.name;
    $('#srType').textContent = s.type;
    $('#srD').innerHTML = s.d;
    $$('.src-card', srcGrid).forEach((b) => b.classList.toggle('is-on', b.dataset.s === key));
  }
  srcGrid.addEventListener('click', (e) => {
    const b = e.target.closest('.src-card');
    if (b) setSource(b.dataset.s);
  });
  setSource('internet');

  /* ── 06 卡组织拓扑 ───────────────────────────────── */
  const topo = $('#topo'), edges = $('#topoEdges'), svg = $('#topoSvg');
  const NODES = {
    holder: $('#nHolder'), issuer: $('#nIssuer'), network: $('#nNetwork'),
    acquirer: $('#nAcquirer'), merchant: $('#nMerchant')
  };
  let topoMode = 'five';

  function center(el) {
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
  }
  function drawEdges(list, dashed = false) {
    edges.innerHTML = '';
    for (const [a, b] of list) {
      if (!a || !b) continue;
      const A = center(a), B = center(b);
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', A.x); l.setAttribute('y1', A.y);
      l.setAttribute('x2', B.x); l.setAttribute('y2', B.y);
      if (dashed) l.setAttribute('class', 'gold');
      edges.appendChild(l);
    }
  }
  function setTopo(mode) {
    topoMode = mode;
    const three = mode === 'three';
    $('#topoFive').classList.toggle('is-on', !three);
    $('#topoThree').classList.toggle('is-on', three);

    NODES.holder.style.left = '26px';
    NODES.holder.style.top = '54px';
    NODES.merchant.style.left = '648px';
    NODES.merchant.style.top = '54px';

    NODES.network.style.left = three ? '280px' : '337px';
    NODES.network.style.top = '134px';
    NODES.network.style.width = three ? '220px' : '146px';
    NODES.network.querySelector('h4').textContent = three ? '卡组织 / 发卡 / 收单' : '卡组织';
    NODES.network.querySelector('p').textContent = three ? '三者合并：规则、发卡、收单一体' : '规则、清算、品牌网络';
    NODES.network.classList.toggle('is-merged', three);

    NODES.issuer.style.opacity = three ? '0' : '1';
    NODES.acquirer.style.opacity = three ? '0' : '1';
    NODES.issuer.style.pointerEvents = three ? 'none' : 'auto';
    NODES.acquirer.style.pointerEvents = three ? 'none' : 'auto';

    $('#tpParties').textContent = three ? '3' : '5';
    $('#tpSteps').textContent = three ? '2' : '4';
    $('#tpTrade').textContent = three ? '窄 / 低' : '广 / 高';

    const draw = () => {
      if (three) drawEdges([[NODES.holder, NODES.network], [NODES.network, NODES.merchant]], true);
      else drawEdges([[NODES.holder, NODES.issuer], [NODES.issuer, NODES.network], [NODES.network, NODES.acquirer], [NODES.acquirer, NODES.merchant]]);
    };
    draw();
    setTimeout(draw, 480); // 等节点位移动画结束再对齐一次
  }
  $('#topoFive').addEventListener('click', () => setTopo('five'));
  $('#topoThree').addEventListener('click', () => setTopo('three'));
  setTopo('five');
  addEventListener('resize', () => setTopo(topoMode));

  /* ── 07 服务商分层 ───────────────────────────────── */
  const devices = $$('#devices .device');
  function setPsp(mode) {
    const agg = mode === 'agg';
    $('#pspThird').classList.toggle('is-on', !agg);
    $('#pspAgg').classList.toggle('is-on', agg);
    $('#pspAggBox').style.display = agg ? '' : 'none';
    $('#pspArrow1').style.display = agg ? '' : 'none';
    devices.forEach((d) => d.classList.add('is-merged'));
    $('#pspA').classList.add('is-on');
    $('#pspB').classList.toggle('is-dim', !agg);
    $('#pspC').classList.toggle('is-dim', !agg);
    $('#pspB').style.display = agg ? '' : 'none';
    $('#pspC').style.display = agg ? '' : 'none';
    $('#pspNote').innerHTML = agg
      ? '聚合支付：商户只接<b>一个聚合柜台</b>，聚合再对接 3 家第三方。它只服务商户，出款要等第三方结算周期，但更靠近场景，掌握消费数据。'
      : '第三方支付：商户只接<b>一条线</b>，品牌与银行由它整合；它既服务消费者，也服务商户，更快拿到备付金，也更靠近资金。';
  }
  $('#pspThird').addEventListener('click', () => setPsp('third'));
  $('#pspAgg').addEventListener('click', () => setPsp('agg'));
  setPsp('third');

  /* ── 08 地理 ─────────────────────────────────────── */
  const GEO = {
    out: {
      k: 'OUTBOUND / 跨境购买',
      title: '消费者在境内，商户在境外',
      route: [['付款人', 1], ['海关', 0], ['商检', 0], ['外汇', 0], ['国际物流', 0], ['境外商户', 1]],
      listK: 'FOUR GATES / 跨境四关',
      list: [
        ['海关', '报关、税号、商品归类；支付金额要与报关单一致。'],
        ['商检', '品类准入与检验；不合规会被扣货。'],
        ['外汇', '币种、额度、申报；汇率在途就是敞口。'],
        ['物流', '跨境时效长；签收与支付确认不同步。']
      ],
      read: '环节多、汇率波动大、纠纷难解决；每一道关都可能把「支付成功」拖成「货没到」。'
    },
    in: {
      k: 'INBOUND / 入境购买',
      title: '境外游客在本地，商户在境内',
      route: [['境外游客', 1], ['币种兑换', 0], ['钱包受理', 0], ['海关退税', 0], ['语言本地化', 0], ['本地商户', 1]],
      listK: 'FOUR GATES / 入境四问',
      list: [
        ['币种', '外币与本币兑换；汇率与手续费谁承担。'],
        ['受理', '商户认不认这个境外电子钱包；需要本地收单改造。'],
        ['退税', '游客离境退税；支付凭证要与退税单对齐。'],
        ['语言', '界面、票据、客服的本地化；不是翻译，是可用性。']
      ],
      read: '不是「能不能付」，是「商户认不认这个钱包」；多的是接口与兼容，不是清算环节。'
    }
  };
  function setGeo(mode) {
    const g = GEO[mode];
    $('#geoK').textContent = g.k;
    $('#geoTitle').textContent = g.title;
    $('#geoOutBtn').classList.toggle('is-on', mode === 'out');
    $('#geoInBtn').classList.toggle('is-on', mode === 'in');
    $('#geoRoute').innerHTML = g.route.map(([t, on]) => `<span class="geo-stop${on ? ' is-on' : ''}">${t}</span>`).join('<span class="geo-gate">→</span>');
    $('#geoRead').textContent = g.read;
    $('#geoListK').textContent = g.listK;
    $('#geoList').innerHTML = g.list.map(([k, v]) => `<li><b>${k}</b>${v}</li>`).join('');
  }
  $('#geoOutBtn').addEventListener('click', () => setGeo('out'));
  $('#geoInBtn').addEventListener('click', () => setGeo('in'));
  setGeo('out');

  /* ── 折叠问答 ───────────────────────────────────── */
  $$('.q-item').forEach((q) => q.addEventListener('click', () => {
    const open = q.classList.contains('is-open');
    $$('.q-item').forEach((x) => x.classList.remove('is-open'));
    if (!open) q.classList.add('is-open');
  }));

  /* ── 自检 ───────────────────────────────────────── */
  window.__selfCheck = async () => {
    const checks = [];
    const ok = (name, cond, detail = '') => checks.push({ name, ok: !!cond, detail });

    renderAxis('tool');
    ok('坐标切换：工具轴 6 类', $$('#axisCards .axis-card').length === 6);
    renderAxis('scene');

    setScene(true);
    ok('场景切换：线上身份 40', $('#smIdV').textContent === '40');
    setScene(false);

    setStop('letter');
    ok('时间轴切换：信函', $('#tlName').textContent === '信函支付');
    setStop('phone');

    setQuad('b2c');
    ok('四象限切换：B2C 20%', $('#qShare').textContent === '20%');
    setQuad('c2b');

    setSource('credit');
    ok('资金来源切换：信用卡', $('#srName').textContent === '信用卡');
    setSource('internet');

    setTopo('three');
    ok('拓扑切换：三要素 3 参与方', $('#tpParties').textContent === '3');
    setTopo('five');

    setPsp('agg');
    ok('服务商切换：聚合显示 B/C', $('#pspB').style.display !== 'none');
    setPsp('third');

    setGeo('in');
    ok('地理切换：入境标题', $('#geoTitle').textContent.includes('境外游客'));
    setGeo('out');

    ok('无横向溢出', document.documentElement.scrollWidth <= innerWidth + 1,
       `scrollWidth=${document.documentElement.scrollWidth} innerWidth=${innerWidth}`);

    return checks;
  };
})();
