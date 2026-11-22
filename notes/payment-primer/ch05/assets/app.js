/* CH.05 · 支付的技术架构
   六方诉求 / 前中后功能 / 四指标 / OSI→五层 /
   请求旅程 / CAS 日志流水线 / 整体架构 / 11 子系统 */

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 进度 + 进场 ─────────────────────────────────────── */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const REVEAL = '.sec-head, .hero-stack, .party-wrap, .stage-lab, .ind-block, .stack-lab, .req-lab, .cas-services, .cas-lab, .arch-lab, .sub-lab, .three-law, .quiz';
  $$(REVEAL).forEach((el) => el.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── 01 六方生态 ─────────────────────────────────────── */
  const PARTY = {
    payee: {
      k: 'SELECTED / P01', name: '收款人', role: '卖方 · 商户：发起交易，提供商品或服务',
      want: '在合约规定的时间内，收到买方支付的约定数额资金',
      duty: '按时、按质、按量发货；提供发票和发货信息',
      need: '收单要覆盖 App / POS / 扫码；查询统计要能按日对账；接入要快、要稳',
      flow: 4
    },
    payer: {
      k: 'SELECTED / P02', name: '付款人', role: '买方 · 消费者：为商品或服务付款',
      want: '按合约在规定时间收到约定数量与质量的货物或服务',
      duty: '按时、按量完成与货物或服务对应的资金支付',
      need: '支付要快、状态可查；钱包覆盖在线 / 扫码 / 余额；大额要能加验',
      flow: 1
    },
    bank: {
      k: 'SELECTED / P03', name: '银行', role: '开户 · 资金存放与转移',
      want: '按客户支付指令，按时按量完成资金转移，赚取服务费用',
      duty: '按约定时间与支付机构对账；帮助完成结算后的出款',
      need: '专线 + 硬件加密机；金融机构接口参数解析与转译；对账子系统；企业网银对接',
      flow: 3
    },
    cardorg: {
      k: 'SELECTED / P04', name: '银行卡组织', role: '连接发卡行与收单行',
      want: '高效且安全地提供银行卡服务，赚取支付处理费',
      duty: '通过发卡行提供基础网络与授权认证；连接收单行与开户行完成信息交换与资金结算',
      need: '卡组织报文规范；授权 / 清算两步；跨行交换与差错处理',
      flow: 3
    },
    psp: {
      k: 'SELECTED / P05', name: '支付机构', role: '买卖双方的中间人 / 受卖方委托的代收方',
      want: '准确、准时、安全地完成交易资金交割',
      duty: '帮助卖方向买方银行发扣款指令；管理信用卡风险；配合反洗钱与反恐融资调查',
      need: '商户接入 + 银行接入；风控与合规；备付金管理与报告',
      flow: 2
    },
    reg: {
      k: 'SELECTED / P06', name: '监管机构', role: '规则制定与合规检查',
      want: '确保支付活动符合法律与规范，例如外汇管制与信贷管理',
      duty: '要求支付机构定期上报支付请求；核查可疑交易',
      need: '反洗钱系统；备付金报告与集中；对接公安、外汇局、央行反洗钱中心与支付结算部门',
      flow: 5
    }
  };
  function setParty(key) {
    const p = PARTY[key];
    $('#partyK').textContent = p.k;
    $('#partyName').textContent = p.name;
    $('#partyRole').textContent = p.role;
    $('#partyWant').textContent = p.want;
    $('#partyDuty').textContent = p.duty;
    $('#partyNeed').textContent = p.need;
    $$('#partyGrid .party-card').forEach((b) => b.classList.toggle('is-on', b.dataset.p === key));
    $$('#partyFlow span[data-f]').forEach((s) => s.classList.toggle('is-on', s.dataset.f === String(p.flow)));
  }
  $('#partyGrid').addEventListener('click', (e) => {
    const b = e.target.closest('.party-card');
    if (b) setParty(b.dataset.p);
  });
  setParty('payer');

  /* ── 02 支付前 / 中 / 后 ─────────────────────────────── */
  const STAGE = {
    pre: {
      k: 'STAGE 01 / BEFORE', title: '支付前 · 先把人验清楚',
      desc: 'KYC 的目的不是收集资料，是保证这笔业务不会被用来洗钱或资助恐怖主义。六步走完，商户才真正具备收款资格。',
      who: ['支付机构', '商户', '银行'],
      fns: [
        ['合约', '签协议、定费率与结算周期'],
        ['申请', '商户提交资质与业务材料'],
        ['审核', '材料审核与真实性检查'],
        ['批准', '风险与额度审批'],
        ['接入', 'API / SDK 联调'],
        ['开通', '商户号生效，可以收款'],
        ['银行接入', '通道参数、专线与加密机'],
        ['商户接入', '网关、验签与限流']
      ],
      out: ['已签约商户', '可用的商户号', '已连通的银行通道'],
      count: 6, countLabel: '6 步 KYC + 2 类接入'
    },
    during: {
      k: 'STAGE 02 / DURING', title: '支付中 · 把请求翻译成指令',
      desc: '支付中的核心不是「扣钱」，是「把商户的请求变成银行能执行的指令」，再拿回结果。这一段既连接商户，也连接银行与其他金融机构。',
      who: ['付款人', '收款人', '支付机构', '银行 / 卡组织'],
      fns: [
        ['接收请求', '收到商户发来的支付请求'],
        ['解析请求', '校验要素、识别商户与通道'],
        ['风险管理', '欺诈、盗刷、限额与名单'],
        ['形成指令', '转成银行可执行的支付指令'],
        ['发送指令', '专线发往银行或卡组织'],
        ['结果通知', '把成功 / 失败回传商户'],
        ['分账计费', '算手续费、分润与待结算'],
        ['账户账务', '记待结算、手续费与流水'],
        ['客户服务', '查询、差错与投诉处理']
      ],
      out: ['银行返回的支付结果', '待结算的商户余额', '手续费与分账记录'],
      count: 9, countLabel: '9 项支付中功能'
    },
    post: {
      k: 'STAGE 03 / AFTER', title: '支付后 · 把钱真正给商户',
      desc: '支付中完成的是银行间的资金交割；真正把消费者付的钱转给商户，是支付后完成的。先确认结果，算出代收的备付金，再按约定时间和方式结算出款。',
      who: ['支付机构', '收款人', '监管'],
      fns: [
        ['账务', '把支付结果记成可对账的账'],
        ['账户', '维护商户与内部账户余额'],
        ['对账', '与银行、卡组织逐笔核对'],
        ['结算', '按周期计算应收应付净额'],
        ['出款', '把净额打给商户'],
        ['报告', '备付金与监管报表']
      ],
      out: ['对平的对账单', '结算单', '出款流水', '监管报告'],
      count: 6, countLabel: '6 项支付后功能'
    }
  };
  function setStage(key) {
    const s = STAGE[key];
    $('#stageK').textContent = s.k;
    $('#stageTitle').textContent = s.title;
    $('#stageDesc').textContent = s.desc;
    $('#stageWho').innerHTML = s.who.map((w) => `<span>${w}</span>`).join('');
    $('#stageFns').innerHTML = s.fns.map(([n, d], i) =>
      `<div class="fn${key === 'during' && i === 3 ? ' core' : ''}"><b>${n}</b><em>${d}</em></div>`
    ).join('');
    $('#stageOut').innerHTML = s.out.map((o) => `<li>${o}</li>`).join('');
    $('#stageCount').textContent = s.count;
    $('#stageCount').nextElementSibling.textContent = s.countLabel;
    $$('#stageTabs .stage-tab').forEach((b) => b.classList.toggle('is-on', b.dataset.s === key));
  }
  $('#stageTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.stage-tab');
    if (b) setStage(b.dataset.s);
  });
  setStage('pre');

  /* ── 03 可用性 ───────────────────────────────────────── */
  const AVAIL = {
    3: { pct: '99.9%', min: 525.6, down: '8.76 小时 / 年', w: '14%',
      note: '一年 525,600 分钟，允许停 525.6 分钟。这是「三个九」，很多内部系统就停在这里；对支付核心来说，不够。' },
    4: { pct: '99.99%', min: 52.56, down: '52.6 分钟 / 年', w: '55%',
      note: '一年 525,600 分钟，允许停 52.6 分钟。这不是「尽量不停」，是把停机预算写进了架构。' },
    5: { pct: '99.999%', min: 5.256, down: '5.26 分钟 / 年', w: '100%',
      note: '一年只允许停 5.26 分钟，已经接近 IBM 主机系统的水准。每多一个 9，冗余、演练、变更管控的成本都要上一个台阶。' }
  };
  function setAvail(n) {
    const a = AVAIL[n];
    $('#availPct').textContent = a.pct;
    $('#availDown').textContent = a.down;
    $('#availBar').style.width = a.w;
    $('#availScale').textContent = '停机预算 0 — ' + a.down.replace(' / 年', '');
    $('#availNote').textContent = a.note;
    $$('#availBtns .av-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.a === String(n)));
  }
  $('#availBtns').addEventListener('click', (e) => {
    const b = e.target.closest('.av-btn');
    if (b) setAvail(b.dataset.a);
  });
  setAvail(4);

  /* ── 03 效率 ─────────────────────────────────────────── */
  const VOLS = [10000, 100000, 1000000, 10000000, 100000000];
  const VOL_LABEL = ['1 万', '10 万', '100 万', '1,000 万', '1 亿'];
  const ANNUAL_COST = 36000000;
  function setEff(i) {
    const vol = VOLS[i];
    const cost = ANNUAL_COST / (vol * 365);
    const ratio = cost * 100;
    $('#effVol').textContent = VOL_LABEL[i];
    $('#effCost').textContent = cost.toPrecision(3) + ' 元';
    $('#effRatio').textContent = ratio.toPrecision(3) + '%';
    $('#effNote').textContent = ratio > 100
      ? '单笔成本已经高于单笔收入（1 元）：这个规模做支付，越做越亏。规模不上来，效率就是生死线。'
      : '成本占收入 ' + ratio.toPrecision(3) + '%。年运维成本按 3,600 万元示例；单笔成本的意义不在绝对值，而在同一条时间轴上的自我对比。';
    $('#effRange').value = String(i);
  }
  $('#effRange').addEventListener('input', (e) => setEff(Number(e.target.value)));
  setEff(2);

  /* ── 03 并发冲击 ─────────────────────────────────────── */
  function setBurst(tps) {
    const total = tps * 10;
    const served = Math.min(tps, 300) * 10;
    const backlog = Math.max(0, total - served);
    const q = Math.min(100, (total / 20000) * 100);
    $('#burstTps').textContent = tps.toLocaleString('en-US') + ' TPS';
    $('#burstTotal').textContent = total.toLocaleString('en-US') + ' 笔';
    $('#burstBacklog').textContent = backlog.toLocaleString('en-US') + ' 笔';
    $('#burstQueue').style.width = q + '%';
    $('#burstQueue').classList.toggle('ok', backlog === 0);
    const st = $('#burstState');
    if (backlog === 0) {
      st.textContent = '扛得住 · 无积压';
      st.className = 'is-good';
    } else if (tps <= 600) {
      st.textContent = '轻微排队 · 响应变慢';
      st.className = 'is-bad';
    } else {
      st.textContent = '请求排队 · 锁表冲突';
      st.className = 'is-bad';
    }
    $('#burstNote').textContent = backlog === 0
      ? '并发低于示例单库容量 300 TPS：请求能及时消化，系统保持可用。'
      : `10 秒涌入 ${total.toLocaleString('en-US')} 笔，单库只能处理 ${served.toLocaleString('en-US')} 笔，积压 ${backlog.toLocaleString('en-US')} 笔。每笔都要锁商户账户，排队会迅速变成超时与雪崩。`;
  }
  $('#burstRange').addEventListener('input', (e) => setBurst(Number(e.target.value)));
  setBurst(1000);

  /* ── 04 分层 ─────────────────────────────────────────── */
  const PAY_LAYERS = [
    { code: 'L05', name: '前端应用层', en: 'FRONT-END',
      desc: '把支付能力放到用户面前：商户的收银台、消费者的电子钱包、店员的 POS App。用户看到和点到的，都是这一层。',
      items: 'iOS / Android App、Web、收银台、电子钱包、POS App',
      who: '付款人 · 收款人',
      fail: '用户点不下去，后面全白搭',
      why: '前端只负责交互与展示；支付逻辑不在这里，换一个前端不应该改一次账。' },
    { code: 'L04', name: '接入网关层', en: 'GATEWAY',
      desc: '把外部请求安全、标准化地接进来，再把内部指令翻译出去。商户与银行两边，都是通过网关与支付机构对话。',
      items: 'API 网关、商户接入网关、金融系统 / 银行网关',
      who: '商户 · 银行 · 其他机构',
      fail: '请求进不来，或者指令出不去',
      why: '接入即适配：验签、限流、幂等、参数转译都放在这一层，核心层不必认识每种外部报文。' },
    { code: 'L03', name: '核心业务层', en: 'CORE',
      desc: '整个支付系统的心脏：接收请求、转成支付指令、取回结果，再完成分账计费、账户账务、对账结算与出款报告。',
      items: '客户信息、业务管理、支付费率、支付请求、分账计费、账户账务、对账结算、出款报告',
      who: '全链路',
      fail: '支付失败，或者账对不平',
      why: '核心只认内部模型；它决定一笔支付「成不成立、记到哪、算多少」，也承担最重的数据一致性。' },
    { code: 'L02', name: '通用服务层', en: 'COMMON',
      desc: '把大家都需要的能力抽出来：日志、数据、通知、鉴权、认证、GUID、风控。它们不是业务，但每个业务都要用。',
      items: '日志、数据、通知、鉴权、认证、GUID、风控',
      who: '所有上层应用',
      fail: '局部故障扩散成全局故障',
      why: '通用服务越标准化，行为越一致，治理越容易；CAS、CNS、CKS 就是这一层的样板。' },
    { code: 'L01', name: '基础设施层', en: 'INFRA',
      desc: '地基：网络、计算、存储、安全、域名、时间，以及数据库、备份、灾备和多套环境。上面所有层都踩在它上面。',
      items: '网络、计算、存储、安全、域名、时间、数据库、备份、灾备、多环境',
      who: '所有服务',
      fail: '地基塌了，上面全停',
      why: '基础设施负责生产、集成、发布、性能测试、功能测试、演示等环境；环境隔离本身就是架构能力。' }
  ];
  const OSI_LAYERS = [
    { code: 'L7', name: '应用层', en: 'APPLICATION', desc: '为不同应用软件之间相互通信而设计的接口。', items: 'HTTP、HTTPS、FTP、SSH、Telnet、SMTP、POP3', who: '应用软件', fail: '应用之间无法通信', why: 'OSI 把服务、接口、协议三个概念分开；支付五层借的是这个思路，不是照搬七层。' },
    { code: 'L6', name: '表示层', en: 'PRESENTATION', desc: '对接收的数据做加密、解密、解析与编码转换。', items: '加密 / 解密、编码转换、数据表示', who: '应用层', fail: '数据格式读不懂', why: '让不同系统的数据变成网络通用的标准表示方式。' },
    { code: 'L5', name: '会话层', en: 'SESSION', desc: '建立、管理和终止不同主机上进程之间的会话。', items: '会话建立、会话管理、会话终止', who: '表示层 / 传输层', fail: '会话断不开、管不住', why: '这一层在支付架构里没有直接对应，能力被并入了网关与通用服务。' },
    { code: 'L4', name: '传输层', en: 'TRANSPORT', desc: '为上层提供端到端、可靠、透明的数据传输，处理差错与流量控制。', items: '端到端传输、差错控制、流量控制', who: '会话层', fail: '丢包、乱序、拥塞', why: '支付的「可靠送达」诉求，最终落在这里与基础设施层。' },
    { code: 'L3', name: '网络层', en: 'NETWORK', desc: '解决数据包如何通过各节点传送的问题。', items: '寻址、路由、数据包转发', who: '传输层', fail: '包到不了目的地', why: '跨机构、跨机房、跨云的连接，都依赖这一层。' },
    { code: 'L2', name: '链路层', en: 'DATA LINK', desc: '负责数据链路的建立、维护、拆除，指定拓扑并提供硬件寻址。', items: '链路建立、拓扑、硬件寻址', who: '网络层', fail: '相邻节点传不过去', why: '专线、交换机、网卡这些「看得见」的连接，在这一层。' },
    { code: 'L1', name: '物理层', en: 'PHYSICAL', desc: '提供传输数据的物理通路，传输比特。', items: '物理介质、比特流', who: '链路层', fail: '没有物理通路，一切为空', why: '再好的架构，也要落在光纤、机柜与电力上。' }
  ];
  let stackMode = 'pay';
  function stackData() { return stackMode === 'pay' ? PAY_LAYERS : OSI_LAYERS; }
  function setStack(i) {
    const d = stackData()[i];
    if (!d) return;
    $('#stackK').textContent = 'SELECTED / ' + d.code;
    $('#stackName').textContent = d.name;
    $('#stackDesc').textContent = d.desc;
    $('#stackItems').textContent = d.items;
    $('#stackWho').textContent = d.who;
    $('#stackFail').textContent = d.fail;
    $('#stackWhy').textContent = d.why;
    $$('#stackList .sl').forEach((b, j) => b.classList.toggle('is-on', j === i));
  }
  function renderStack() {
    const list = stackData();
    $('#stackList').innerHTML = list.map((d, i) =>
      `<button class="sl${i === 0 ? ' is-on' : ''}" data-i="${i}"><span class="code">${d.code}</span><span class="nm">${d.name}</span></button>`
    ).join('');
    $('#stackK').textContent = 'SELECTED / ' + list[0].code;
    setStack(0);
  }
  $('#stackTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.stack-tab');
    if (!b) return;
    stackMode = b.dataset.s;
    $$('#stackTabs .stack-tab').forEach((x) => x.classList.toggle('is-on', x === b));
    renderStack();
  });
  $('#stackList').addEventListener('click', (e) => {
    const b = e.target.closest('.sl');
    if (b) setStack(Number(b.dataset.i));
  });
  renderStack();

  /* ── 05 请求旅程 ─────────────────────────────────────── */
  const REQ = [
    { k: 'STEP 00 / IDLE', name: '待发：一笔 100 元的订单', desc: '点「播放」，看请求从 L05 走到 L01，再带着结果走回来。时延为示意，用来区分层次，不代表真实系统指标。', layer: 5, log: null },
    { k: 'STEP 01 / FRONT', name: '前端：收银台发起请求', desc: '商户 App / 钱包 / 收银台把订单号、金额、商户号打包，向支付机构发起请求。', layer: 5, log: ['T+0 ms', '<b>前端应用层</b> 收银台提交订单 ORD-20261122-001，金额 100.00 元'] },
    { k: 'STEP 02 / GATEWAY', name: '商户网关：验签、限流、幂等', desc: '先证明请求来自合法商户，再挡住超量流量，最后用幂等键防止重复提交。', layer: 4, log: ['T+15 ms', '<b>接入网关层</b> 验签通过；限流 1,200 TPS；幂等键 ord-…-001 首次出现'] },
    { k: 'STEP 03 / CORE', name: '核心：风控、指令、分账', desc: '解析请求，跑风控规则，形成银行能执行的支付指令，同时算出商户手续费与分账。', layer: 3, log: ['T+45 ms', '<b>核心业务层</b> 风控通过；生成扣款指令 PAY-8842；计费 1.00 元，分账 99.00 元'] },
    { k: 'STEP 04 / BANK GW', name: '银行网关：参数转译', desc: '把内部指令翻译成银行报文，走专线，用硬件加密机签名。', layer: 4, log: ['T+90 ms', '<b>接入网关层</b> 指令转译为银行报文；专线发送；加密机签名完成'] },
    { k: 'STEP 05 / BANK', name: '银行：扣款并返回结果', desc: '银行执行扣款，返回成功或失败。这一段不在支付机构内部，但决定了整笔交易的成败。', layer: 0, log: ['T+220 ms', '<b>银行</b> 扣款成功，返回 RC=00；授权码 661208'] },
    { k: 'STEP 06 / LEDGER', name: '核心：账务记账', desc: '拿到银行结果后，核心层记账：商户待结算 +99.00，手续费 +1.00；幂等键标记完成。', layer: 3, log: ['T+260 ms', '<b>核心业务层</b> 记账完成：商户待结算 +99.00，手续费 +1.00；幂等键置为 done'] },
    { k: 'STEP 07 / NOTIFY', name: '通用服务：通知与日志', desc: '通知服务把结果推给商户后台与用户；日志服务留下一条可追溯的链路。', layer: 2, log: ['T+300 ms', '<b>通用服务层</b> 通知已推送；日志 trace_id=…-001 落盘'] },
    { k: 'STEP 08 / DONE', name: '前端：结果上屏', desc: '收银台显示「支付成功」，商户后台出现一笔待结算订单。回程结束。', layer: 5, log: ['T+320 ms', '<b>前端应用层</b> 显示支付成功；订单状态 → PAID'] }
  ];
  let reqState = 0;
  let reqTimers = [];
  function reqTokenTo(layer) {
    const tok = $('#reqToken');
    const ladder = $('#reqLadder');
    let el;
    if (layer === 0) el = $('#bankNode');
    else el = $(`#reqLadder .rl[data-l="${layer}"]`);
    if (!el) return;
    tok.style.top = (el.offsetTop + el.offsetHeight / 2 - 5) + 'px';
  }
  function reqRender(i, animate) {
    reqState = i;
    const s = REQ[i];
    $('#reqK').textContent = s.k;
    $('#reqName').textContent = s.name;
    $('#reqDesc').textContent = s.desc;
    $$('#reqLadder .rl').forEach((el) => {
      el.classList.toggle('is-on', Number(el.dataset.l) === s.layer && s.layer !== 0);
      el.classList.toggle('is-done', i > 0 && Number(el.dataset.l) < (s.layer || 0));
    });
    $('#bankNode').classList.toggle('is-on', s.layer === 0);
    reqTokenTo(s.layer);
    const log = $('#reqLog');
    if (i === 0) {
      log.innerHTML = '<div class="rl-empty mono">等待请求 / STANDBY</div>';
      return;
    }
    log.innerHTML = REQ.slice(1, i + 1).map((x, j) => {
      const [t, p] = x.log || ['', ''];
      return `<div class="ev2${j === i - 1 ? ' key' : ''}"><span class="t">${t}</span><p>${p}</p></div>`;
    }).join('');
    log.scrollTop = log.scrollHeight;
  }
  function clearReqTimers() { reqTimers.forEach(clearTimeout); reqTimers = []; }
  $('#reqReset').addEventListener('click', () => {
    clearReqTimers();
    $('#reqPlay').disabled = false;
    reqRender(0);
  });
  $('#reqPlay').addEventListener('click', () => {
    clearReqTimers();
    reqRender(0);
    $('#reqPlay').disabled = true;
    const step = reduced ? 120 : 900;
    for (let i = 1; i < REQ.length; i++) {
      reqTimers.push(setTimeout(() => {
        reqRender(i);
        if (i === REQ.length - 1) {
          $('#reqPlay').disabled = false;
          reqTimers = [];
        }
      }, i * step));
    }
  });
  reqRender(0);

  /* ── 06 CAS ──────────────────────────────────────────── */
  const CAS = [
    { k: 'STAGE 01 / NORMALIZE', name: '标准化日志结构',
      desc: '把所有应用的日志收成同一个结构：谁（app_id）、什么级别（level）、什么时候（ts）、哪条链路（trace_id）、做了什么（sql / event）、花了多久（duration_ms）。',
      points: ['格式不统一，下游每接一个应用就要写一套解析', '字段缺一个 trace_id，跨应用排障就断链', '标准化是通用服务的第一道门槛'] },
    { k: 'STAGE 02 / ENQUEUE', name: '生产者送日志入消息队列',
      desc: '应用只负责格式化并投递到消息队列，写日志从同步变成异步。海量日志不会直接冲击应用的 I/O 与网络。',
      points: ['生产者不关心谁消费，只负责投递', '队列削峰，避免日志洪峰拖死业务', '投递失败要有本地兜底，不能把日志丢了就算完'] },
    { k: 'STAGE 03 / CONSUME', name: '消费者处理日志',
      desc: '消费者从队列取日志，按规则做深度处理。比如一条 SQL 日志，可以算出执行时长，再和同一语句的历史分布比，看它落在 P90 的什么位置。',
      points: ['提交时间与返回时间相减 = 执行时长', '同语句历史 P90 是更公平的基线', '处理规则可版本化，便于回归与复现'] },
    { k: 'STAGE 04 / CLASSIFY', name: '按级别做事件处理',
      desc: '按级别分流：Info 计数后存储；Critical 做具体分析与判别；Exception 做更深入的分析或直接告警。',
      points: ['不是所有日志都值得告警', '级别要能改，但不能被应用随便改', '告警要带回 trace_id，才能追到根因'] },
    { k: 'STAGE 05 / STATS', name: '动态近实时统计',
      desc: '按 app_id 等标志做流式聚合，近实时统计。给前端熔断提供流量参考，也给支付关键业务提供事实数据。',
      points: ['流式统计窗口要短，否则熔断永远慢半拍', '统计口径要固定，否则数字对不上', '指标要能下钻到单条日志'] }
  ];
  const CAS_LOGS = [
    ['S1', '标准化：app_id=checkout level=WARN trace_id=…-001 sql=UPDATE account … duration_ms=860'],
    ['S2', '入队：topic=log.v2 partition=3 offset=88,421'],
    ['S3', '消费：同语句历史 P90=320 ms；本次 860 ms → 2.69 倍'],
    ['S4', '分级：WARN → 慢查询；异常率未超阈值，暂不告警'],
    ['S5', '统计：checkout 慢查询率 0.7%；熔断阈值 1%，提前一个窗口预警']
  ];
  let casTimers = [];
  function clearCasTimers() { casTimers.forEach(clearTimeout); casTimers = []; }
  function setCas(i) {
    const c = CAS[i];
    $('#casK').textContent = c.k;
    $('#casName').textContent = c.name;
    $('#casDesc').textContent = c.desc;
    $('#casPoints').innerHTML = c.points.map((p) => `<li>${p}</li>`).join('');
    $$('#casPipe .cas-stage').forEach((b, j) => b.classList.toggle('is-on', j === i));
  }
  $('#casPipe').addEventListener('click', (e) => {
    const b = e.target.closest('.cas-stage');
    if (b) { clearCasTimers(); setCas(Number(b.dataset.c)); }
  });
  setCas(0);
  $('#casReset').addEventListener('click', () => {
    clearCasTimers();
    $('#casLog').innerHTML = '<div class="rl-empty mono">等待日志 / STANDBY</div>';
    $('#casRun').disabled = false;
    setCas(0);
  });
  $('#casRun').addEventListener('click', () => {
    clearCasTimers();
    $('#casLog').innerHTML = '';
    $('#casRun').disabled = true;
    const step = reduced ? 100 : 700;
    CAS_LOGS.forEach(([k, p], i) => {
      casTimers.push(setTimeout(() => {
        setCas(i);
        const row = document.createElement('div');
        row.className = 'ev2' + (i === CAS_LOGS.length - 1 ? ' key' : '');
        row.innerHTML = `<span class="t">${k}</span><p>${p}</p>`;
        $('#casLog').appendChild(row);
        $('#casLog').scrollTop = $('#casLog').scrollHeight;
        if (i === CAS_LOGS.length - 1) {
          $('#casRun').disabled = false;
          casTimers = [];
        }
      }, i * step));
    });
  });

  /* ── 07 整体架构 ─────────────────────────────────────── */
  const ARCH = {
    front: { k: 'SELECTED / Z01', name: '前端接入',
      desc: 'Web、App、POS、电话接入，是支付的入口。它们通过标准化 API 与 SDK 接入主系统，而不是各自直连核心。',
      items: 'Web / App / POS / 电话接入；标准化 API、SDK',
      who: '付款人 · 商户店员',
      point: '入口可替换，接口要稳定；前端不做账务' },
    left: { k: 'SELECTED / Z02', name: '接入区',
      desc: '商户、PSP、银行、机构、监管五类接入。标准化接入服务既提高效率，也统一支付请求处理过程。',
      items: '商户接入、PSP 接入、银行接入、机构接入、监管接入',
      who: '商户 / PSP / 银行 / 监管',
      point: '接入即适配：参数转译、验签、限流、幂等' },
    core: { k: 'SELECTED / Z03', name: '核心应用',
      desc: '订单、支付、计费、结算、对账、出款、账户、账务。支付请求在这里变成指令，结果在这里变成账。',
      items: '订单 · 支付 · 计费 · 结算 · 对账 · 出款 · 账户 · 账务',
      who: '全链路',
      point: '核心不碰银行报文；账务只追加不修改' },
    right: { k: 'SELECTED / Z04', name: '运营管理平台',
      desc: '支付机构内部业务运营与商户自助。签约、申请、审核、批准、接入、开通、费率、对账、结算、出款，都在这里操作与审核。',
      items: '运营后台 + 商户后台（支付结果、结算报告）',
      who: '运营人员 / 商户店主',
      point: '运营动作要留痕；权限与账务分离' },
    base: { k: 'SELECTED / Z05', name: '通用与基础',
      desc: '日志、鉴权、认证、通知、ID、证书、密钥、数据，再往下是网络、计算、存储。它们托住上面所有区域。',
      items: '日志 · 鉴权 · 认证 · 通知 · ID · 证书 · 密钥 · 数据',
      who: '所有应用',
      point: '通用服务标准化；基础设施多环境隔离' }
  };
  function setArch(key) {
    const a = ARCH[key];
    $('#archK').textContent = a.k;
    $('#archName').textContent = a.name;
    $('#archDesc').textContent = a.desc;
    $('#archItems').textContent = a.items;
    $('#archWho').textContent = a.who;
    $('#archPoint').textContent = a.point;
    $$('.arch-zone').forEach((b) => b.classList.toggle('is-on', b.dataset.z === key));
  }
  $$('.arch-zone').forEach((b) => b.addEventListener('click', () => setArch(b.dataset.z)));
  setArch('core');

  /* ── 08 十一个子系统 ─────────────────────────────────── */
  const SUBS = [
    { id: 's01', code: 'S01', name: '商户收单子系统', user: '店员收单用', phase: '支付中', party: 'merchant', note: 'App 或 POS 机：把付款请求收进来', core: false },
    { id: 's02', code: 'S02', name: '商户后台子系统', user: '店主管理用', phase: '支付后', party: 'merchant', note: '商户 BOSS：查订单、对账、看结算', core: false },
    { id: 's03', code: 'S03', name: '电子钱包子系统', user: '付款者支付用', phase: '支付中', party: 'consumer', note: '钱包 App：绑卡、扫码、余额', core: false },
    { id: 's04', code: 'S04', name: '支付报告子系统', user: '监管机构用', phase: '支付后', party: 'regulator', note: '反洗钱与反恐融资报告', core: false },
    { id: 's05', code: 'S05', name: '入网开通子系统', user: '业务管理用', phase: '支付前', party: 'psp', note: 'KYC 六步：合约到开通', core: false },
    { id: 's06', code: 'S06', name: '支付处理子系统', user: '核心', phase: '支付中', party: 'psp', note: '接收、解析、风控、发指令', core: true },
    { id: 's07', code: 'S07', name: '银行接入子系统', user: '技术支持用', phase: '支付前', party: 'psp', note: '专线、加密机与参数转译', core: false },
    { id: 's08', code: 'S08', name: '商户接入子系统', user: '技术支持用', phase: '支付前', party: 'psp', note: 'API / SDK：验签、限流、幂等', core: false },
    { id: 's09', code: 'S09', name: '运营后台子系统', user: '对账结算用', phase: '支付后', party: 'psp', note: '对账、结算、出款、费率', core: false },
    { id: 's10', code: 'S10', name: '风险管理子系统', user: '风控管理用', phase: '支付中', party: 'psp', note: '欺诈、盗刷、洗钱与名单', core: false },
    { id: 's11', code: 'S11', name: '数据管理子系统', user: '经营管理用', phase: '支付后', party: 'psp', note: '经营分析与决策数据', core: false }
  ];
  const PARTY_GROUPS = [
    { key: 'merchant', name: '商户', test: (s) => s.party === 'merchant' },
    { key: 'consumer', name: '消费者', test: (s) => s.party === 'consumer' },
    { key: 'regulator', name: '监管机构', test: (s) => s.party === 'regulator' },
    { key: 'psp', name: '支付机构', test: (s) => s.party === 'psp' }
  ];
  const STAGE_GROUPS = [
    { key: 'pre', name: '支付前', test: (s) => s.phase === '支付前' },
    { key: 'during', name: '支付中', test: (s) => s.phase === '支付中' },
    { key: 'post', name: '支付后', test: (s) => s.phase === '支付后' }
  ];
  function cardHTML(s) {
    return `<div class="sub-card${s.core ? ' core' : ''}"><span class="sc-n">${s.code} / ${s.phase}</span><b>${s.name}</b><em>${s.user} · ${s.note}</em></div>`;
  }
  function renderSubs(mode) {
    const groups = mode === 'party' ? PARTY_GROUPS : STAGE_GROUPS;
    $('#subGroups').innerHTML = groups.map((g, gi) => {
      const items = SUBS.filter(g.test);
      return `<div class="sub-group">
        <div class="sg-head${g.key === 'psp' || g.key === 'during' ? ' hi' : ''}"><span class="mono">GROUP 0${gi + 1}</span><h4>${g.name}</h4><b>${items.length} 个</b></div>
        <div class="sg-cards">${items.map(cardHTML).join('')}</div>
      </div>`;
    }).join('');
    $('#subNote').textContent = mode === 'party'
      ? '按利益相关方：商户 2 · 消费者 1 · 监管 1 · 支付机构 7 = 11 个子系统。'
      : '按支付流程：支付前 3 · 支付中 4 · 支付后 4 = 11 个子系统。';
    $$('#subToggle .sub-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.m === mode));
  }
  $('#subToggle').addEventListener('click', (e) => {
    const b = e.target.closest('.sub-btn');
    if (b) renderSubs(b.dataset.m);
  });
  renderSubs('party');

  /* ── 09 自测题 ───────────────────────────────────────── */
  $('#quiz').addEventListener('click', (e) => {
    const q = e.target.closest('.q-item');
    if (!q) return;
    $$('#quiz .q-item').forEach((x) => { if (x !== q) x.classList.remove('is-open'); });
    q.classList.toggle('is-open');
  });

  /* ── 自检 ────────────────────────────────────────────── */
  window.__selfCheck = () => {
    const checks = [];
    const ok = (name, cond, detail = '') => { checks.push({ name, ok: !!cond, detail: String(detail) }); };

    ok('六方：默认付款人', $('#partyName').textContent === '付款人');
    setParty('payee');
    ok('六方：收款人诉求 = 收到约定资金', $('#partyWant').textContent.includes('收到'));
    ok('六方：收款人链路高亮第 4 站', $('#partyFlow span[data-f="4"]').classList.contains('is-on'));
    setParty('payer');

    ok('前中后：默认支付前', $('#stageTitle').textContent.includes('支付前') && $('#stageCount').textContent === '6');
    setStage('during');
    ok('前中后：支付中 9 项', $('#stageCount').textContent === '9' && $('#stageFns').children.length === 9);
    setStage('post');
    ok('前中后：支付后 6 项', $('#stageCount').textContent === '6' && $('#stageFns').children.length === 6);
    setStage('pre');

    ok('可用性：99.99% = 52.6 分钟', $('#availDown').textContent.includes('52.6'));
    setAvail(5);
    ok('可用性：99.999% = 5.26 分钟', $('#availDown').textContent.includes('5.26'));
    setAvail(3);
    ok('可用性：99.9% = 8.76 小时', $('#availDown').textContent.includes('8.76'));
    setAvail(4);

    $('#effRange').value = '0';
    $('#effRange').dispatchEvent(new Event('input', { bubbles: true }));
    ok('效率：1 万笔/日 → 成本 9.86 元', $('#effCost').textContent === '9.86 元');
    setEff(2);
    ok('效率：100 万笔/日 → 0.0986 元', $('#effCost').textContent === '0.0986 元');

    setBurst(1000);
    ok('并发：1,000 TPS → 积压 7,000 笔', $('#burstBacklog').textContent.includes('7,000'));
    setBurst(200);
    ok('并发：200 TPS → 扛得住', $('#burstState').textContent.includes('扛得住'));
    setBurst(1000);

    ok('五层：默认前端层', $('#stackName').textContent === '前端应用层');
    setStack(2);
    ok('五层：L03 核心业务层', $('#stackName').textContent === '核心业务层');
    $('#stackTabs .stack-tab[data-s="osi"]').click();
    ok('OSI：七层', $('#stackList').children.length === 7 && $('#stackName').textContent === '应用层');
    $('#stackTabs .stack-tab[data-s="pay"]').click();
    ok('切回支付五层', $('#stackList').children.length === 5 && $('#stackName').textContent === '前端应用层');

    reqRender(3);
    ok('请求：第 3 站 = 核心', $('#reqName').textContent.includes('核心') && $('#reqLadder .rl[data-l="3"]').classList.contains('is-on'));
    reqRender(5);
    ok('请求：银行节点高亮', $('#bankNode').classList.contains('is-on'));
    reqRender(0);

    setCas(2);
    ok('CAS：第 3 站 = 消费', $('#casName').textContent.includes('消费者'));
    setCas(0);

    ok('总图：默认核心应用', $('#archName').textContent === '核心应用');
    setArch('left');
    ok('总图：接入区 5 类', $('#archItems').textContent.includes('监管接入'));
    setArch('core');

    ok('子系统：默认按利益相关方', $('#subGroups').children.length === 4);
    renderSubs('stage');
    ok('子系统：按流程分 3 组', $('#subGroups').children.length === 3 && $('#subNote').textContent.includes('11 个子系统'));
    ok('子系统：11 张卡', $$('#subGroups .sub-card').length === 11);
    renderSubs('party');

    ok('自测题：4 道', $$('#quiz .q-item').length === 4);
    ok('无横向溢出', document.documentElement.scrollWidth <= innerWidth + 1,
      `scrollWidth=${document.documentElement.scrollWidth} innerWidth=${innerWidth}`);

    return checks;
  };
})();
