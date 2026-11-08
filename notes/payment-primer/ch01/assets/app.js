/* PAYMENT PRIMER · CH.01 — interactions
   无依赖，所有动效只为「看懂」，不为了炫技。 */

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nf = (n, d = 0) => n.toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0. 进度条 + 进场 ─────────────────────────────── */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $$('.sec-head, .term-grid, .steps, .step-detail, .cred-wrap, .corridor-scroll, .runner-body, .clear-sim, .calc, .ex-types, .matrix, .three-law, .idem, .ledger, .model8, .glossary, .quiz')
    .forEach((el) => el.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── 1. 交易五要素 ─────────────────────────────────── */
  const TX = [
    {
      n: '01 / SIGN', t: '签约', role: '对标的、数量、质量、价值、时间地点达成共识并固定下来。',
      trad: '纸质合同、销售确认书、口头承诺。', digi: '电子合同、电子签章、区块链智能合约。',
      note: '没有签约，后面四步都没有依据可谈。'
    },
    {
      n: '02 / AUTH', t: '认证', role: '确认对手方身份，防欺诈并满足监管要求。',
      trad: '证件、执照、现场核验。', digi: '短信、邮件、电子身份证、刷脸、指纹、掌纹、声纹。',
      note: '远程非接触场景下，验明正身是最难的一步；欺诈与拒付都从这里长出来。'
    },
    {
      n: '03 / DELIVER', t: '交付', role: '卖方按约定提供商品或服务。',
      trad: '物流、商检、海关、保险、信用证。', digi: '电子转账、数字权益下发、数字货币。',
      note: '交付与支付的时间差，是「货钱不同步」风险的来源。'
    },
    {
      n: '04 / RECORD', t: '记录', role: '留存交易细节，以备纠纷、审计与监管检查。',
      trad: '合同、订单、发票、提单、保单。', digi: '电子发票、链上数字发票。',
      note: '记录是证据链。没有记录，事后只能靠猜。'
    },
    {
      n: '05 / PAY', t: '支付', role: '买方按约定时间、账户、币种、金额付款。',
      trad: '现金、支票、汇票、信用证。', digi: '电子转账、数字钱包、数字货币。',
      note: '支付排在最后，但它是唯一能让前四步闭环的一步。'
    }
  ];
  const txSteps = $$('#txSteps .tx-step');
  const sdN = $('#sdN'), sdTitle = $('#sdTitle'), sdRole = $('#sdRole');
  const sdTrad = $('#sdTrad'), sdDigi = $('#sdDigi'), sdNote = $('#sdNote');
  let txMode = 'trad';
  function renderTx(i) {
    const d = TX[i];
    sdN.textContent = d.n; sdTitle.textContent = d.t; sdRole.textContent = d.role;
    sdTrad.textContent = d.trad; sdDigi.textContent = d.digi; sdNote.textContent = d.note;
    txSteps.forEach((b) => b.classList.toggle('is-on', +b.dataset.i === i));
  }
  txSteps.forEach((b) => b.addEventListener('click', () => renderTx(+b.dataset.i)));
  $$('.tg').forEach((b) => b.addEventListener('click', () => {
    txMode = b.dataset.form;
    $$('.tg').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#sdTrad').parentElement.style.display = txMode === 'trad' ? '' : 'none';
    $('#sdDigi').parentElement.style.display = txMode === 'digi' ? '' : 'none';
  }));

  /* ── 2. 债权凭证实验 ───────────────────────────────── */
  const chips = $$('#credChips .chip');
  const credRead = $('#credRead p');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.classList.toggle('is-on', x === c));
    const ok = c.dataset.ok === '1';
    credRead.innerHTML = ok
      ? `<b class="ok">✓ 支付成立</b>：${c.dataset.y}的${c.querySelector('.chip-n').textContent}能换东西，因为买卖双方都接受它作为债权凭证。货币形态一直在变，<b>「被双方信任」这条没变</b>。`
      : `<b class="bad">✗ 支付不成立</b>：凭证的形态再精致，只要<b>收款人不接受</b>，它就不是「可接受的货币债权」。支付的三个要素缺一不可。`;
  }));

  /* ── 3. 资金链路走廊 ───────────────────────────────── */
  let NODE_CENTERS = [10, 30, 50, 70, 90];
  const dotInfo = $('#dotInfo'), dotFund = $('#dotFund');
  const measureCenters = () => {
    const track = $('.track').getBoundingClientRect();
    NODE_CENTERS = $$('#nodeRow .node').map((n) => {
      const r = n.getBoundingClientRect();
      return ((r.left + r.width / 2 - track.left) / track.width) * 100;
    });
  };
  const clock = $('#clock'), evlog = $('#evlog'), exAmt = $('#exAmt'), exNote = $('#exNote');
  const nodeEls = $$('#nodeRow .node'), cbEls = $$('#crossbank .cb-node');
  const cbNet = $('#cbNet');

  const STEPS = [
    { t: 'T+0', info: 0, fund: 0, nodes: [0], exp: 0,
      tag: '交易',
      log: '订单成立：签约、认证、交付、记录四步走完，等待支付。',
      note: '钱还停在买家账户，没有离开，敞口为 0。' },
    { t: 'T+0.2s', info: 1, fund: 0, nodes: [1], exp: 0,
      tag: '请求',
      log: '商户发出<b>支付请求</b> Payment Request，内含金额与资金来源。信息流已跨出第一步。',
      note: '信息流在跑，资金流还一动不动。' },
    { t: 'T+0.5s', info: 1, fund: 0, nodes: [1], exp: 0,
      tag: '风控',
      log: '收单接入：验商户、验设备、验额度。风险评分在这一层做，拒付与欺诈也在这里拦。',
      note: '这一层拦不住，后面每一层都要替它还债。' },
    { t: 'T+0.6s', info: 2, fund: 0, nodes: [1, 2], exp: 0,
      tag: '指令',
      log: '按协议拆成 <b>N 个支付指令</b> Payment Instruction，分别发往发卡行。一个请求 ≠ 一个指令。',
      note: '这就是「部分成功」的来源：N 个指令，可能只成功 N−1 个。' },
    { t: 'T+1s', info: 2, fund: 1, nodes: [0, 1], exp: 1000,
      tag: '扣款',
      log: '银行扣款成功，资金离开买家账户。<b>信息流已跑到一半，资金流才刚起步。</b>',
      note: '在途开始：钱离开了买家，还没落到支付机构账上。' },
    { t: 'T+1s', info: 2, fund: 2, nodes: [2], exp: 1000,
      tag: '归集',
      log: '资金归集进<b>备付金账户</b>：以「预收待付」名义存在，法律上属于商户与用户，不属于机构。',
      note: '1000 万元已进入客户资金池，滞留时间开始计时。' },
    { t: 'T+1d', info: 2, fund: 2, nodes: [3], exp: 1000,
      tag: '结算',
      log: '结算引擎按周期汇总本周期全部请求，扣费率，算出应付净额。',
      note: '滞留满 1 天 → 敞口 1,000 万元·日。这就是 §06 要精算的那个池子。' },
    { t: 'T+1d', info: 4, fund: 4, nodes: [3, 4], exp: 0,
      tag: '出款',
      log: '结算出款：净额打进商户账户。两条流终于在 N05 会合，在途清零。',
      note: '会合只是瞬间。下一笔支付在 100 毫秒后又开始制造新的在途。' },
    { t: 'T+2d 02:00', info: 4, fund: 4, nodes: [3, 5, 6], exp: 200,
      tag: '清算',
      log: '跨行部分：银行群（N06）→ 清算所（N07）日终批量轧差，<b>只搬净额</b>。',
      note: '清算只搬净额：两两相抵之后，真正搬动的只是差额，不是每笔都搬。' },
    { t: 'T+2d 09:00', info: 4, fund: 4, nodes: [0, 1, 2, 3, 4], exp: 0,
      tag: '对账',
      log: '对账：按<b>指令</b>逐笔比对信息流与资金流。差异挂账，不进「待处理池」不算完。',
      note: '对账不是补丁，是资金系统的一等公民。' }
  ];

  let cur = -1, timer = null, playing = false;
  const resetVisual = () => {
    nodeEls.forEach((n) => n.classList.remove('is-on', 'is-past', 'pulse'));
    cbEls.forEach((n) => n.classList.remove('is-on'));
    dotInfo.style.left = NODE_CENTERS[0] + '%';
    dotFund.style.left = NODE_CENTERS[0] + '%';
    clock.textContent = 'T+0';
    cbNet.textContent = '差额';
  };

  function paint(i) {
    const s = STEPS[i];
    clock.textContent = s.t;
    nodeEls.forEach((n, k) => {
      n.classList.toggle('is-on', s.nodes.includes(k));
      n.classList.toggle('is-past', k < s.info && !s.nodes.includes(k));
      n.classList.remove('pulse');
    });
    cbEls.forEach((n, k) => n.classList.toggle('is-on', s.nodes.includes(k + 5)));
    dotInfo.style.left = NODE_CENTERS[s.info] + '%';
    dotFund.style.left = NODE_CENTERS[s.fund] + '%';
    if (s.tag === '对账') nodeEls.forEach((n) => n.classList.add('pulse'));

    evlog.insertAdjacentHTML('beforeend',
      `<div class="ev ${['扣款', '归集', '清算'].includes(s.tag) ? 'ev-key' : ''}">
         <span class="ev-t mono">${s.t}</span><p><b>${s.tag}</b> · ${s.log}</p></div>`);
    evlog.scrollTop = evlog.scrollHeight;

    exAmt.textContent = s.exp ? nf(s.exp) : '0';
    exNote.textContent = s.note;
    $('#expose').classList.toggle('hot', s.exp > 0);
  }

  function step() {
    if (cur >= STEPS.length - 1) return false;
    cur += 1;
    if (cur === 0) evlog.innerHTML = '';
    paint(cur);
    return true;
  }
  function stop() { playing = false; clearTimeout(timer); $('#btnPlay').textContent = '▶ 播放一笔支付'; }
  function play() {
    if (cur >= STEPS.length - 1) { cur = -1; resetVisual(); evlog.innerHTML = ''; }
    playing = true;
    $('#btnPlay').textContent = '⏸ 暂停';
    const tick = () => {
      if (!playing) return;
      if (!step()) { stop(); return; }
      timer = setTimeout(tick, reduced ? 400 : 1000);
    };
    tick();
  }
  $('#btnPlay').addEventListener('click', () => { playing ? stop() : play(); });
  $('#btnStep').addEventListener('click', () => {
    stop();
    if (cur >= STEPS.length - 1) { cur = -1; resetVisual(); evlog.innerHTML = ''; }
    step();
  });
  measureCenters();
  resetVisual();
  addEventListener('resize', () => {
    measureCenters();
    if (cur >= 0) {
      dotInfo.style.left = NODE_CENTERS[STEPS[cur].info] + '%';
      dotFund.style.left = NODE_CENTERS[STEPS[cur].fund] + '%';
    } else {
      dotInfo.style.left = NODE_CENTERS[0] + '%';
      dotFund.style.left = NODE_CENTERS[0] + '%';
    }
  });
  $('#btnReset').addEventListener('click', () => {
    stop(); cur = -1; resetVisual();
    evlog.innerHTML = '<div class="ev ev-idle"><span class="ev-t mono">IDLE</span><p>等待播放。每一步都会写明「信息流到哪」与「资金流到哪」。</p></div>';
    exAmt.textContent = '0';
    exNote.textContent = '资金还停在 N01，没有离开买家账户，敞口为 0。';
  });

  /* ── 4. 清算轧差模拟器 ─────────────────────────────── */
  let t1 = false, t2 = false;
  const rowA = $('#rowA'), rowA2 = $('#rowA2'), rowB = $('#rowB'), rowB2 = $('#rowB2');
  const aNet = $('#aNet'), bNet = $('#bNet'), grossMove = $('#grossMove'), netMove = $('#netMove');
  const grossBar = $('#grossBar'), netBar = $('#netBar'), csNote = $('#csNote');

  function renderCs() {
    rowA.classList.toggle('is-on', t1);
    rowB.classList.toggle('is-on', t1);
    rowA2.classList.toggle('is-on', t2);
    rowB2.classList.toggle('is-on', t2);

    const a = (t1 ? -700 : 0) + (t2 ? 500 : 0);
    const b = (t1 ? 700 : 0) + (t2 ? -500 : 0);
    aNet.textContent = (a > 0 ? '+' : '') + a;
    bNet.textContent = (b > 0 ? '+' : '') + b;
    aNet.style.color = a < 0 ? '#C4574A' : '#C8A45C';
    bNet.style.color = b < 0 ? '#C4574A' : '#C8A45C';

    const gross = (t1 ? 700 : 0) + (t2 ? 500 : 0);
    const net = t1 && t2 ? Math.abs(a) : gross;
    grossMove.textContent = nf(gross);
    netMove.textContent = nf(net);
    grossBar.style.width = (gross / 1200) * 100 + '%';
    netBar.style.width = (net / 1200) * 100 + '%';

    if (!t1 && !t2) csNote.textContent = '两家银行互不相欠时，轧差没有意义。先取款，再算净额。';
    else if (!(t1 && t2)) csNote.textContent = '只有一笔取款时，没有可抵消的长短款，必须全额搬动。再看第二笔。';
    else csNote.textContent = '700 与 500 互相抵消，只剩 200 元净额。实际资金搬动从 1,200 元降到 200 元，减少 83%。';
  }
  $('#btnTake1').addEventListener('click', () => { t1 = true; renderCs(); });
  $('#btnTake2').addEventListener('click', () => { t2 = true; renderCs(); });
  $('#btnNet').addEventListener('click', () => {
    t1 = true; t2 = true; renderCs();
    csNote.textContent = '日终轧差：中行净付建行 200 元，清算结束。银行之间不逐笔搬钱，只搬净额。';
  });
  $('#btnCsReset').addEventListener('click', () => { t1 = t2 = false; renderCs(); });

  /* ── 5. 备付金精算 ─────────────────────────────────── */
  let vol = 1000, days = 1, fee = 0.6;
  const oPool = $('#oPool'), tankFill = $('#tankFill');
  const oDays = $('#oDays'), oCost = $('#oCost'), oFee = $('#oFee'), oMax = $('#oMax');

  function renderCalc() {
    const pool = vol * days;                    // 万元
    const poolDays = pool * 365;                // 万元·日
    const cost = pool * 0.015;                  // 万元/年（1.5%）
    const feeIncome = vol * 365 * fee / 100;    // 万元/年
    oPool.textContent = nf(pool, pool < 100 ? 1 : 0);
    oDays.textContent = nf(poolDays) + ' 万元·日';
    oCost.textContent = nf(cost, cost < 10 ? 1 : 0) + ' 万元/年';
    oFee.textContent = nf(feeIncome, feeIncome < 10 ? 1 : 0) + ' 万元/年';
    oMax.textContent = nf(pool) + ' 万元';
    const maxPool = 5000 * 7;
    tankFill.style.width = Math.max(3, (pool / maxPool) * 100) + '%';
  }
  $('#rVol').addEventListener('input', (e) => { vol = +e.target.value; $('#vVol').textContent = nf(vol); renderCalc(); });
  $('#rFee').addEventListener('input', (e) => { fee = +e.target.value; $('#vFee').textContent = fee.toFixed(2); renderCalc(); });
  $$('#segCycle button').forEach((b) => b.addEventListener('click', () => {
    days = +b.dataset.d;
    $$('#segCycle button').forEach((x) => x.classList.toggle('is-on', x === b));
    renderCalc();
  }));
  renderCalc();

  /* ── 6. 风险矩阵折叠 ───────────────────────────────── */
  $$('#matrix .mx-row').forEach((r) => r.addEventListener('click', () => {
    const open = r.classList.contains('is-open');
    $$('#matrix .mx-row').forEach((x) => x.classList.remove('is-open'));
    if (!open) r.classList.add('is-open');
  }));

  /* ── 7. 幂等事故 ───────────────────────────────────── */
  const idemLog = $('#idemLog'), ioActual = $('#ioActual'), ioGap = $('#ioGap');
  const ioBar = $('#ioBar'), ioNote = $('#ioNote');
  let idemTimers = [];
  const clearIdemTimers = () => { idemTimers.forEach(clearTimeout); idemTimers = []; };

  function idemReset() {
    clearIdemTimers();
    idemLog.innerHTML = '<div class="il-row is-idle mono">等待模拟…</div>';
    ioActual.textContent = '0';
    ioGap.textContent = '0';
    ioBar.style.width = '0%';
    ioBar.parentElement.classList.remove('ok');
    ioNote.textContent = '未发生扣款。';
  }
  function pushRow(html, cls = '') {
    idemLog.insertAdjacentHTML('beforeend', `<div class="il-row ${cls}">${html}</div>`);
    idemLog.scrollTop = idemLog.scrollHeight;
  }
  $('#btnRetry').addEventListener('click', () => {
    clearIdemTimers();
    idemLog.innerHTML = '';
    const key = $('#idemKey').checked;
    const rows = key ? [
      ['<b>请求 #1</b> → 发卡行：<b>超时</b>，结果未知', ''],
      ['重试 #1 · 带幂等键 <b>K-8842</b> → 发卡行返回「已处理」，<b>不重复扣款</b>', 'is-ok'],
      ['重试 #2 · 同键 → 仍命中幂等记录，<b>不重复扣款</b>', 'is-ok'],
      ['对账：应收 100 万 / 实扣 100 万 / 差异 <b>0</b>', 'is-ok']
    ] : [
      ['<b>请求 #1</b> → 发卡行：<b>超时</b>，结果未知', ''],
      ['重试 #1 · 无幂等键 → 发卡行<b>再次扣款 100 万</b>', 'is-bad'],
      ['重试 #2 · 无幂等键 → <b>第三次扣款 100 万</b>', 'is-bad'],
      ['对账：应收 100 万 / 实扣 300 万 / 挂账 <b>200 万</b>，找不到凭证', 'is-bad']
    ];
    rows.forEach(([t, c], i) => {
      idemTimers.push(setTimeout(() => {
        pushRow(t, c);
        if (i === 0) { ioActual.textContent = '0'; ioNote.textContent = '扣款结果未知：这是最危险的中间态。'; }
        if (i === 1) { ioActual.textContent = key ? '100 万' : '200 万'; ioNote.textContent = key ? '幂等命中，重试没有放大金额。' : '重试变成第二次扣款，敞口开始增长。'; }
        if (i === 2) { ioActual.textContent = key ? '100 万' : '300 万'; ioNote.textContent = key ? '仍是 100 万，差异为 0。' : '三次扣款全部落地，200 万没有对应订单。'; }
        if (i === 3) {
          if (key) {
            ioGap.textContent = '0';
            ioBar.style.width = '33%';
            ioBar.parentElement.classList.add('ok');
            ioNote.innerHTML = '幂等键把「重试」变成「查询」。<b>资金流只发生一次。</b>';
          } else {
            ioGap.textContent = '200 万';
            ioBar.style.width = '100%';
            ioBar.parentElement.classList.remove('ok');
            ioNote.innerHTML = '挂账 200 万不会自己消失。它会在对账日变成一张找不到来源的差异单。';
          }
        }
      }, 420 * i + 200));
    });
  });
  $('#btnIdemReset').addEventListener('click', idemReset);
  $('#idemKey').addEventListener('change', idemReset);

  /* ── 8. 余额与分录 ─────────────────────────────────── */
  const lgBal = $('#lgBal'), lgSum = $('#lgSum'), lgRows = $('#lgRows');
  const lgState = $('#lgState'), lgAlarm = $('#lgAlarm'), lgDiff = $('#lgDiff'), lgDiffV = $('#lgDiffV');
  let balance = 1000, entries = 1000, seq = 1;

  function renderLedger() {
    lgBal.textContent = nf(balance, 2);
    lgSum.textContent = nf(entries, 2);
    const diff = balance - entries;
    const bad = Math.abs(diff) > 0.001;
    lgState.textContent = bad ? '不平' : '平衡';
    lgState.classList.toggle('bad', bad);
    lgDiff.hidden = !bad;
    lgDiffV.textContent = nf(Math.abs(diff), 2);
    lgAlarm.hidden = !bad;
  }
  $('#btnBad').addEventListener('click', () => {
    balance += 500;
    const row = document.createElement('div');
    row.className = 'lg-row bad';
    row.innerHTML = `<span class="mono">X${seq++}</span><span>无凭证直接改余额</span><b class="mono">+500.00</b>`;
    lgRows.appendChild(row); lgRows.scrollTop = lgRows.scrollHeight;
    renderLedger();
  });
  $('#btnGood').addEventListener('click', () => {
    balance += 500; entries += 500;
    const row = document.createElement('div');
    row.className = 'lg-row';
    row.innerHTML = `<span class="mono">D${seq++}</span><span>记一笔分录 · 借 应收 / 贷 客户资金</span><b class="mono">+500.00</b>`;
    lgRows.appendChild(row); lgRows.scrollTop = lgRows.scrollHeight;
    renderLedger();
  });
  $('#btnLedgerReset').addEventListener('click', () => {
    balance = 1000; entries = 1000; seq = 1;
    lgRows.innerHTML = '<div class="lg-row"><span class="mono">D1</span><span>期初入账</span><b class="mono">+1,000.00</b></div>';
    renderLedger();
  });
  renderLedger();

  /* ── 9. 自测折叠 ───────────────────────────────────── */
  $$('#quiz .q-item').forEach((q) => q.addEventListener('click', () => {
    const open = q.classList.contains('is-open');
    $$('#quiz .q-item').forEach((x) => x.classList.remove('is-open'));
    if (!open) q.classList.add('is-open');
  }));

  /* ── 10. 年份 ─────────────────────────────────────── */
  const now = new Date();
  $('#footDate').textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
})();
