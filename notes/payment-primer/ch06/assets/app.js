/* CH.06 · 支付前的应用设计
   六步入网 / 申请 vs 审核 / 六条脐带 / 需求实质 /
   流程解耦 / BPM 流程污染 / SSO / Venus 案例 */

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 进度条 + 进场 ─────────────────────────────────── */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const REVEAL = '.sec-head, .kyc-lab, .kyc2, .verify, .umb, .umb-read, .demand, .dec, .bpm, .sso, .venus, .three-law, .quiz';
  $$(REVEAL).forEach((el) => el.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── §01 六站入网 ──────────────────────────────────── */
  const KYC = {
    sign: {
      k: 'STEP 01 / SIGN', name: '签约', who: '商户 ↔ 支付机构',
      in: '合约条款：代收范围、结算周期、支付处理费率、扣费方式。',
      out: '一纸委托收单合约：支付机构代理商户收款，按比例收取支付处理费。',
      risk: '合同一多，手工就管不过来；审查和批准也要流程管控，保证准确、一致、安全。',
      sys: '合同管理系统 + 合约审查 / 批准流程；费率、周期要结构化成字段，不能只躺在 PDF 里。',
      next: '申请要引用合约里的业务范围、费率与结算周期。'
    },
    apply: {
      k: 'STEP 02 / APPLY', name: '申请', who: '商户（业务 + 技术）→ 支付机构',
      in: '法人信息、业务资质、银行账户、对支付业务的具体要求——KYC 的全量资料。',
      out: '一份可追踪的入网申请单：手机 OCR 扫码录入，信息真正进系统。',
      risk: '资料只留在纸上，时间一长就忘、就丢；没有系统化的业务管理流程，和合作伙伴、监管协作就低效。',
      sys: '申请表单 + OCR 识别 + 资料库；KYC 信息要能按商户、按版本查。',
      next: '审核要拿这份申请去核真伪。'
    },
    review: {
      k: 'STEP 03 / REVIEW', name: '审核', who: '支付机构审核员',
      in: '申请材料 + 外部信息：官网、工商、备案、电话、现场。',
      out: '审核结论：形式审查 + 实质审查的结果，作为批准的依据。',
      risk: '只看材料，看不出资质造假、套牌网站、空壳地址；审核不谨慎，会造成数据泄露，甚至生存危机。',
      sys: '审核工作台：材料对照、外部查询记录、实地考察记录、结论留痕。',
      next: '批准要引用审核结论，不能跳过。'
    },
    approve: {
      k: 'STEP 04 / APPROVE', name: '批准', who: '支付机构（业务 + 风控 / 合规）',
      in: 'KYC 结果 + 其他合作机构的审核结论。',
      out: '批准通知：可开始时间、对接细节、POS 配置、后台链接与账号、客服 / 技术支持联系方式。',
      risk: '不仅有效率问题，还有案件审查的过程审计问题；通知里漏一项，接入就会来回返工。',
      sys: '批准流程 + 通知模板 + 账号开通 + 过程审计。',
      next: '接入要按通知里的接口、网络、设备信息施工。'
    },
    connect: {
      k: 'STEP 05 / CONNECT', name: '接入', who: '商户技术 ↔ 支付机构技术',
      in: '接口文档：网络地址、指令、数据格式、安全约定、结果通知安排；网络可选专线 / VPN / 公网 + 证书。',
      out: '联调通过：商户能发支付请求，也能收支付状态通知；移动 App 集成 SDK。',
      risk: '数据格式、安全约定、通知安排对不上，就会「请求发出去了，结果回不来」。',
      sys: '商户接入网关 + 证书 / 密钥管理 + 联调环境 + 通知重发。',
      next: '开通要等接入联调完成。'
    },
    open: {
      k: 'STEP 06 / OPEN', name: '开通', who: '支付机构业务管理',
      in: '合约 + 审核 / 批准结论 + 接入完成状态。',
      out: '商户账户、支付处理费率、正式开通时间、结算周期。',
      risk: '这是商户第一次体验支付机构的服务，第一印象会影响未来合作；费率 / 周期设错，后面计费与出款全错。',
      sys: '入网开通子系统：开户、费率、时间、结算周期——所有字段成为支付中 / 后的主数据。',
      next: '支付中开始读这些参数：计费、风控、结算、出款。'
    }
  };
  const KYC_ORDER = ['sign', 'apply', 'review', 'approve', 'connect', 'open'];
  function setKyc(key) {
    const d = KYC[key];
    $('#kycK').textContent = d.k;
    $('#kycName').textContent = d.name;
    $('#kycWho').textContent = d.who;
    $('#kycIn').textContent = d.in;
    $('#kycOut').textContent = d.out;
    $('#kycRisk').textContent = d.risk;
    $('#kycSys').textContent = d.sys;
    $('#kycNext').textContent = d.next;
    const idx = KYC_ORDER.indexOf(key);
    $('#kycProg').style.width = ((idx + 1) / 6 * 100) + '%';
    $('#kycProgT').textContent = `${idx + 1} / 6`;
    $$('#kycRail .kc').forEach((b) => {
      b.classList.toggle('is-on', b.dataset.k === key);
      b.classList.toggle('is-done', KYC_ORDER.indexOf(b.dataset.k) < idx);
    });
  }
  $$('#kycRail .kc').forEach((b) => b.addEventListener('click', () => setKyc(b.dataset.k)));
  setKyc('apply');

  /* ── §02 申请 vs 审核：核查深度 ──────────────────── */
  const VERIFY = [
    { label: '只看材料', pct: 33, found: 0, desc: '只核对材料齐不齐、填得对不对。四类问题基本靠「相信」——KYC 变成一张表。' },
    { label: '上网核实', pct: 66, found: 2, desc: '查官网、工商、备案、电话，四类问题能交叉验证一部分；套牌与空壳还要再往下走。' },
    { label: '实地考察', pct: 100, found: 4, desc: '到现场看办公、仓库、设备、人，才能确认业务真的在做——这是 KYC 的实质部分。' }
  ];
  const ISSUES = [
    { t: '资质造假', d: ['复印件看不出真假', '工商 / 官网可交叉验证', '现场确认经营与许可'], min: 1 },
    { t: '套牌网站', d: ['材料上看不出来', '域名 / 备案 / 电话可查', '现场看系统与人员'], min: 2 },
    { t: '空壳地址', d: ['注册地址无法判断', '地图 / 照片只能看个大概', '现场确认有没有人干活'], min: 2 },
    { t: '业务与描述不符', d: ['纸面描述总是合理', '网站商品与价格可对', '看仓库 / 设备 / 流水'], min: 1 }
  ];
  function renderVerifyGrid() {
    $('#verifyGrid').innerHTML = ISSUES.map((x, i) => `
      <div class="vg" data-i="${i}">
        <span class="vg-k mono">ISSUE 0${i + 1}</span>
        <h4>${x.t}</h4>
        <p></p>
        <span class="vg-s mono"></span>
      </div>`).join('');
  }
  function setVerify(level) {
    const v = VERIFY[level];
    $('#verifyBar').style.width = v.pct + '%';
    $('#verifyOut').textContent = `已发现 ${v.found} / 4 类问题 · ${v.label}：${v.desc}`;
    $$('#verifyGrid .vg').forEach((el, i) => {
      const x = ISSUES[i];
      el.querySelector('p').textContent = x.d[level];
      const found = level >= x.min;
      el.classList.toggle('is-found', found);
      el.querySelector('.vg-s').textContent = found ? '已核实' : '未核实';
    });
    $$('#verifyTabs button').forEach((b) => b.classList.toggle('is-on', Number(b.dataset.v) === level));
  }
  $$('#verifyTabs button').forEach((b) => b.addEventListener('click', () => setVerify(Number(b.dataset.v))));
  renderVerifyGrid();
  setVerify(0);

  /* ── §03 六条脐带 ─────────────────────────────────── */
  const UMB = {
    fee: {
      k: '连接 01 / RATE → BILLING',
      text: '合约里定义的费率，是支付中「计费 + 分账」的基础。收费方式有 5 种：按金额、按笔数、按时间范围、按梯级、按活动——不同方式，计费与分账逻辑完全不同。费率填错，商户收到的钱和平台记的账都会错。'
    },
    limit: {
      k: '连接 02 / LIMIT → RISK',
      text: '支付前定义的支付限额、商户属性、地域范围，是支付中风控判断的基础。风控会按商户属性配参数：自动饮料贩卖机不太可能单笔 1 万日元，也不太可能连续买 20 笔饮料。参数错了，要么误杀，要么放过。'
    },
    cycle: {
      k: '连接 03 / CYCLE → SETTLEMENT',
      text: '合约约定的结算周期，是支付后发起结算与对外打款的时间：可以 T+1，也可以 T+30 / T+60。周期没录对，备付金就会早出或晚出，直接变成流动性风险。'
    },
    bank: {
      k: '连接 04 / ACCOUNT → PAYOUT',
      text: '合约里的商户银行账户，是支付后出款的目的地。账户信息错一个数字，结算款就会打进别人的账户——追回极难。'
    },
    contact: {
      k: '连接 05 / CONTACT → SERVICE',
      text: '商户联系信息，是支付中客服触达商户的基础：系统维护、政策变化，都要靠它发邮件或打电话。联系不上，通知就落空。'
    },
    pos: {
      k: '连接 06 / POS → AUTH',
      text: 'POS 机具信息（型号、序列号、归属）是支付处理做认证、软件更新、建立安全通道的依据。机具信息不准，设备就认不出来，升级也找不到人。'
    }
  };
  function setUmb(key) {
    $$('#s03 .umb-item').forEach((b) => b.classList.toggle('is-on', b.dataset.u === key));
    $$('#s03 .umb-target').forEach((t) => t.classList.toggle('is-on', t.dataset.t === key));
    $('#umbK').textContent = UMB[key].k;
    $('#umbText').textContent = UMB[key].text;
  }
  $$('#s03 .umb-item').forEach((b) => b.addEventListener('click', () => setUmb(b.dataset.u)));
  setUmb('fee');

  /* ── §04 需求实质 ─────────────────────────────────── */
  function setDc(n) {
    const manual = Math.ceil(n / 20);
    const save = Math.max(0, manual - 1);
    $('#dcCount').textContent = n + ' 份';
    $('#dcManual').textContent = manual + ' 人';
    $('#dcAuto').textContent = '1 人';
    $('#dcSave').textContent = save + ' 人';
    $('#dcManualBar').style.width = (manual / 3 * 100) + '%';
    $('#dcAutoBar').style.width = (1 / 3 * 100) + '%';
    let v, note;
    if (n <= 20) {
      v = '先别做';
      note = `${n} 份/天时，即使全自动，合同管理岗仍要留 1 个人；岗位裁不掉，还要采购扫描识别的硬件软件，成本反而增加。把产品技术资源投到更急的地方。`;
    } else if (n <= 40) {
      v = '算得过来';
      note = `需要 ${manual} 个人，自动化能省 ${save} 个；但要先算 OCR 采购、维护和错误返工的成本，再决定做不做。`;
    } else {
      v = '值得做';
      note = `需要 ${manual} 个人，自动化能省 ${save} 个；规模上来了，才值得投入文档扫描识别，并保留 1 个人做管理。`;
    }
    $('#dcVerdict').textContent = v;
    $('#dcNote').textContent = note;
  }
  $('#dcRange').addEventListener('input', (e) => setDc(Number(e.target.value)));
  setDc(10);

  function setCase(c) {
    $$('#caseTabs button').forEach((b) => b.classList.toggle('is-on', b.dataset.c === c));
    $$('.demand-body').forEach((b) => b.classList.toggle('is-on', b.dataset.case === c));
  }
  $$('#caseTabs button').forEach((b) => b.addEventListener('click', () => setCase(b.dataset.c)));
  setCase('ocr');

  /* ── §05 解耦 ─────────────────────────────────────── */
  const DEC_NODES = ['签约', '申请 / 录入', '审核', '批准', '接入', '开通'];
  let decMode = 'coupled';
  let decRuns = 0;
  function renderDec() {
    if (decMode === 'coupled') {
      $('#decBus').hidden = true;
      $('#decChain').innerHTML = DEC_NODES.map((n, i) => `
        <div class="dc-node" data-n="${i}"><span class="mono">D0${i + 1}</span><b>${n}</b><em>${i === 0 ? '同一条记录' : '等上一步状态'}</em></div>
        ${i < DEC_NODES.length - 1 ? '<div class="dc-gate">状态闸门：全部字段一起校验，一个不对就停</div>' : ''}`).join('');
      $('#decStates').textContent = '一条记录几十个状态';
      $('#decBlock').textContent = '整条链停';
      $('#decBlock').className = 'bad';
    } else {
      $('#decBus').hidden = false;
      $('#decChain').innerHTML = DEC_NODES.map((n, i) => `
        <div class="dc-node ok" data-n="${i}"><span class="mono">S0${i + 1}</span><b>${n}</b><em>独立服务 · 各自管状态</em></div>`).join('');
      $('#decStates').textContent = '每个服务只管自己';
      $('#decBlock').textContent = '只停一个服务';
      $('#decBlock').className = 'good';
    }
    $('#decDba').textContent = decRuns ? (decMode === 'coupled' ? '18 次' : '0 次') : '0 次';
    $('#decDba').className = decMode === 'coupled' ? 'bad' : 'good';
  }
  function runDec() {
    decRuns++;
    $('#decDba').textContent = decMode === 'coupled' ? '18 次' : '0 次';
    $('#decDba').className = decMode === 'coupled' ? 'bad' : 'good';
    $$('#decChain .dc-node').forEach((n) => n.classList.remove('blocked', 'ok'));
    if (decMode === 'coupled') {
      const target = $('#decChain .dc-node[data-n="2"]');
      if (target) target.classList.add('blocked');
      $('#decLog').textContent = `跑 30 个案子：3 个案子停在「审核 → 批准」的状态闸门；DBA 手工修状态 18 次，修完继续。卡哪修哪。（次数为示意，重点是模式）`;
    } else {
      const target = $('#decChain .dc-node[data-n="2"]');
      if (target) target.classList.add('blocked');
      $('#decLog').textContent = '跑 30 个案子：3 个案子停在审核服务，录入 / 批准 / 开通照常；DBA 改库 0 次。一个服务失败，不殃及池鱼。';
    }
  }
  $$('#decTabs button').forEach((b) => b.addEventListener('click', () => {
    decMode = b.dataset.d;
    $$('#decTabs button').forEach((x) => x.classList.toggle('is-on', x === b));
    renderDec();
    $('#decLog').textContent = '切换模式，再点「跑 30 个案子」，看两种架构的差别。';
  }));
  $('#decRun').addEventListener('click', runDec);
  renderDec();

  /* ── §06 BPM ──────────────────────────────────────── */
  function bpmStats() {
    let nodes = 5, days = 7;
    $$('#bpmList input:checked').forEach((x) => {
      nodes += Number(x.dataset.n);
      days += Number(x.dataset.d);
    });
    return { nodes, days };
  }
  function renderBpm() {
    const { nodes, days } = bpmStats();
    $('#bpmNodes').textContent = nodes;
    $('#bpmDays').textContent = days + ' 天';
    $('#bpmChain').innerHTML = Array.from({ length: Math.min(nodes, 61) }, (_, i) =>
      `<i class="bpm-tick${i < nodes ? ' on' : ''}"></i>`).join('');
    const note = $('#bpmVerdict');
    if (nodes <= 20) {
      note.textContent = '还是一条能走完的流程。';
      note.classList.remove('hot');
    } else if (nodes <= 40) {
      note.textContent = '开始变慢：每多一个「想知道的部门」，就多一段等待。';
      note.classList.remove('hot');
    } else {
      note.textContent = '流程污染：60+ 个审批节点，合同审查周期从 1 周变 43 天，流程图成了乱麻。';
      note.classList.add('hot');
    }
    $('#bpmNote').textContent = nodes === 5
      ? '起点：销售管理 → 业务管理 → 律师审查 → 技术支持 → 风控，5 个节点，1 周内能走完。'
      : `当前：起点 5 个节点 + 各部门追加 ${nodes - 5} 个，共 ${nodes} 个；周期从 7 天拉长到 ${days} 天。`;
  }
  $$('#bpmList input').forEach((x) => x.addEventListener('change', renderBpm));
  $('#bpmReset').addEventListener('click', () => {
    $$('#bpmList input').forEach((x) => { x.checked = false; });
    renderBpm();
  });
  renderBpm();

  /* ── §07 SSO ──────────────────────────────────────── */
  const SYSTEMS = [
    ['ONB', '入网开通'], ['MER', '商户接入'], ['BNK', '银行接入'], ['PAY', '支付处理'],
    ['POS', '商户收单'], ['WLT', '电子钱包'], ['RSK', '风险管理'], ['MBS', '商户后台'],
    ['OPS', '运营后台'], ['RPT', '支付报告'], ['DAT', '数据管理'], ['OA', '邮件办公']
  ];
  let ssoMode = 'none';
  function renderSso() {
    $('#ssoGrid').innerHTML = SYSTEMS.map(([id, name], i) => `
      <div class="sso-tile" data-i="${i}"><span class="mono">${id}</span><b>${name}</b><i class="st"></i></div>`).join('');
  }
  function resetSso() {
    $$('#ssoGrid .sso-tile').forEach((t) => t.classList.remove('is-in', 'is-token'));
    $('#ssoLogins').textContent = '0';
    $('#ssoPwd').textContent = '0';
    $('#ssoTime').textContent = '0:00';
  }
  function fmt(sec) {
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function runSso() {
    resetSso();
    if (ssoMode === 'none') {
      $('#ssoLogins').textContent = '12';
      $('#ssoPwd').textContent = '12';
      $('#ssoTime').textContent = fmt(540);
      $('#ssoNote').textContent = '12 次登录、12 个密码、约 9 分钟；90 天还要全部改一遍。密码设成一样，风险最大——尤其是 PCI / PII 系统。';
      $$('#ssoGrid .sso-tile').forEach((t, i) => setTimeout(() => t.classList.add('is-in'), i * 70));
    } else {
      $('#ssoLogins').textContent = '1';
      $('#ssoPwd').textContent = '1';
      $('#ssoTime').textContent = fmt(45);
      $('#ssoNote').textContent = '一次 CAS 登录，换一个有时效的 token；12 个子系统凭 token 放行，权限仍由各系统的角色决定。';
      $$('#ssoGrid .sso-tile').forEach((t) => t.classList.add('is-in'));
    }
  }
  $$('#ssoTabs button').forEach((b) => b.addEventListener('click', () => {
    ssoMode = b.dataset.s;
    $$('#ssoTabs button').forEach((x) => x.classList.toggle('is-on', x === b));
    resetSso();
    $('#ssoNote').textContent = ssoMode === 'none'
      ? '点「跑一遍登录」，看 12 个系统在没有 SSO 时会发生什么。'
      : '点「跑一遍登录」，看 CAS 一次认证如何放行 12 个系统。';
  }));
  $('#ssoRun').addEventListener('click', runSso);
  renderSso();

  /* ── §08 Venus ────────────────────────────────────── */
  function setVenus(v) {
    $$('#venusTabs button').forEach((b) => b.classList.toggle('is-on', b.dataset.v === v));
    $$('.venus-body').forEach((b) => b.classList.toggle('is-on', b.dataset.v === v));
  }
  $$('#venusTabs button').forEach((b) => b.addEventListener('click', () => setVenus(b.dataset.v)));
  setVenus('raise');

  /* ── §09 自测题折叠 ───────────────────────────────── */
  $$('#quiz .q-item').forEach((q) => q.addEventListener('click', () => q.classList.toggle('is-open')));

  /* ── 自检 ─────────────────────────────────────────── */
  window.__selfCheck = () => {
    const checks = [];
    const ok = (name, cond, detail = '') => checks.push({ name, ok: !!cond, detail: String(detail) });

    ok('六站：默认申请', $('#kycName').textContent === '申请' && $('#kycProgT').textContent === '2 / 6');
    setKyc('open');
    ok('六站：开通 = 6/6', $('#kycName').textContent === '开通' && $('#kycProgT').textContent === '6 / 6');
    ok('六站：开通过后 5 站已走过', $$('#kycRail .kc.is-done').length === 5);
    setKyc('apply');

    ok('审核：默认只看材料', $('#verifyBar').style.width === '33%' && $('#verifyOut').textContent.includes('0 / 4'));
    setVerify(2);
    ok('审核：实地考察发现 4 类', $('#verifyBar').style.width === '100%' && $('#verifyOut').textContent.includes('4 / 4'));
    ok('审核：4 格都标记已核实', $$('#verifyGrid .vg.is-found').length === 4);
    setVerify(0);

    ok('脐带：默认费率 → 计费', $('#umbText').textContent.includes('5 种') && $('#s03 .umb-target[data-t="fee"]').classList.contains('is-on'));
    setUmb('bank');
    ok('脐带：银行账户 → 别人的账户', $('#umbText').textContent.includes('别人的账户') && $('#s03 .umb-target[data-t="bank"]').classList.contains('is-on'));
    setUmb('fee');

    ok('需求：10 份 → 先别做', $('#dcVerdict').textContent === '先别做' && $('#dcSave').textContent === '0 人');
    setDc(60);
    ok('需求：60 份 → 值得做、省 2 人', $('#dcVerdict').textContent === '值得做' && $('#dcSave').textContent === '2 人');
    setDc(10);
    setCase('edit');
    ok('需求：案例 B = 伪需求', $('#s04 .demand-body[data-case="edit"]').classList.contains('is-on') && $('#s04 .edit-stamp h3').textContent === '伪需求');
    setCase('ocr');

    ok('解耦：默认串行紧耦合', decMode === 'coupled' && $('#decStates').textContent.includes('几十个状态'));
    runDec();
    ok('解耦：串行跑 30 案 → DBA 18 次', $('#decDba').textContent === '18 次');
    $('#decTabs button[data-d="decoupled"]').click();
    runDec();
    ok('解耦：异步跑 30 案 → DBA 0 次', decMode === 'decoupled' && $('#decDba').textContent === '0 次');
    $('#decTabs button[data-d="coupled"]').click();

    ok('BPM：默认 5 节点 / 7 天', $('#bpmNodes').textContent === '5' && $('#bpmDays').textContent === '7 天');
    $$('#bpmList input').forEach((x) => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); });
    ok('BPM：全开 → 61 节点 / 43 天', $('#bpmNodes').textContent === '61' && $('#bpmDays').textContent === '43 天');
    $('#bpmReset').click();
    ok('BPM：重置 → 5 / 7', $('#bpmNodes').textContent === '5' && $('#bpmDays').textContent === '7 天');

    ssoMode = 'none';
    runSso();
    ok('SSO：无 SSO → 12 次登录 / 12 密码 / 9:00', $('#ssoLogins').textContent === '12' && $('#ssoPwd').textContent === '12' && $('#ssoTime').textContent === '9:00');
    $('#ssoTabs button[data-s="cas"]').click();
    runSso();
    ok('SSO：CAS → 1 次 / 1 密码 / 0:45', $('#ssoLogins').textContent === '1' && $('#ssoPwd').textContent === '1' && $('#ssoTime').textContent === '0:45');
    $('#ssoTabs button[data-s="none"]').click();

    ok('Venus：默认提出', $('#s08 .venus-body[data-v="raise"]').classList.contains('is-on'));
    setVenus('result');
    ok('Venus：效果页 = 结果', $('#s08 .venus-body[data-v="result"]').classList.contains('is-on'));
    setVenus('raise');

    ok('自测题：4 道', $$('#quiz .q-item').length === 4);

    const fr = $('footer .foot-r');
    ok('页脚左右导航：第5章 / 第7章待更新 / 章节索引',
      !!fr && fr.querySelector('a[href="../ch05/"]') && !!fr.querySelector('.foot-soon') &&
      !!fr.querySelector('a[href="../"]'));

    ok('无横向溢出', document.documentElement.scrollWidth <= innerWidth + 1,
      `scrollWidth=${document.documentElement.scrollWidth} innerWidth=${innerWidth}`);

    return checks;
  };
})();
