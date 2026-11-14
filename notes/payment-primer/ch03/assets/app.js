/* CH.03 · 支付的基础工具
   配对板 / 四代卡 / 卡号解剖与卢恩 / 八维取舍 / POS 机身 /
   收单路径 / EAN-13 与 QR / CPM 与 MPM / 传感器与钱包 */

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

  const REVEAL = '.sec-head, .pair, .pair-table, .evo, .evo-read, .card-lab, .industry, .score-table, .pos-grid, .route-wrap, .code-grid, .scan-grid, .iot, .wallet, .ex-types, .matrix, .three-law, .quiz';
  $$(REVEAL).forEach((el) => el.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── 01 配对板 ─────────────────────────────────────── */
  const PAIRS = {
    bank: {
      carrier: '磁条 / 芯片 / NFC', name: 'POS 一体机',
      desc: '一台机器集成刷卡槽、插卡口、NFC 贴卡区与扫码摄像头，把三种载体读成同一笔支付请求。',
      dist: '接触 ~ 10 cm', who: '持卡人 + 店员', fail: '磁条被侧录'
    },
    wallet: {
      carrier: '付款码 / NFC / 人脸', name: '扫码枪 · 闸机 · 摄像头',
      desc: '手机把账户、卡、券收进一个入口；收单端只要认得其中一种形态，就能把支付请求接走。',
      dist: '10 cm ~ 1 m', who: '消费者自己', fail: '账户盗用 / 截图'
    },
    qr: {
      carrier: '黑白矩阵', name: '手机摄像头 + 收银系统',
      desc: '二维码把收款账户、金额或订单标识编码成图形；摄像头读出图形，系统再按码里的信息发起支付。',
      dist: '10 ~ 50 cm', who: '消费者自己', fail: '静态码被替换'
    },
    iot: {
      carrier: '电信号', name: '供应商订单系统',
      desc: '传感器把重量、温度、图像变成电信号，规则引擎判断后自动下单；读取器不在现场，在云端。',
      dist: '无（自动触发）', who: '没有人', fail: '误触发 / 重复下单'
    }
  };
  const pairList = $('#pairList');
  function setPair(key) {
    const p = PAIRS[key];
    $('#pairCarrier').textContent = p.carrier;
    $('#pairName').textContent = p.name;
    $('#pairDesc').textContent = p.desc;
    $('#pmDist').textContent = p.dist;
    $('#pmWho').textContent = p.who;
    $('#pmFail').textContent = p.fail;
    $$('.pair-btn', pairList).forEach((b) => b.classList.toggle('is-on', b.dataset.p === key));
  }
  pairList.addEventListener('click', (e) => {
    const b = e.target.closest('.pair-btn');
    if (b) setPair(b.dataset.p);
  });
  setPair('bank');

  /* ── 02 四代卡 ─────────────────────────────────────── */
  const EVO = {
    stripe: {
      k: 'GEN 01', name: '磁条卡', type: '磁化方向 / 三条磁道',
      desc: '磁条由定向排列的铁性氧化粒子组成，贴在卡背。支付只读第 2 磁道，另外两条留给别的行业或未来。<b>成本最低、覆盖最广，也最容易被原样复制</b>。',
      store: '磁化方向', read: '刷一下', cap: '210 字符', cost: '最低'
    },
    ic: {
      k: 'GEN 02', name: 'IC 卡', type: 'EEPROM + 嵌入式操作系统',
      desc: '芯片嵌在 ISO 7816 卡基里，相当于一台微型计算机：能存大量数据、能执行命令、能做加解密。<b>信息不再原样交出去，而是当场算出来</b>。',
      store: '电荷 / 芯片', read: '插入触点', cap: '百万字节', cost: '中'
    },
    composite: {
      k: 'GEN 03', name: '复合卡', type: '磁条 + 芯片 + NFC',
      desc: '同时拥有凸字、磁条、IC 芯片和 NFC 模块。它解决的是<b>兼容</b>：老终端刷磁条，新终端插芯片或贴卡。代价是制卡成本最高，卡也最厚。',
      store: '磁 + 电', read: '刷 / 插 / 贴', cap: '百万字节', cost: '最高'
    },
    virtual: {
      k: 'GEN 04', name: '虚拟卡', type: '卡号 + 有效期 + 验证码',
      desc: '物理上不存在，只有三串信息。发卡行审批后发给消费者，绑进电子钱包或在线上使用。<b>发行成本最低、线上覆盖最好，也最依赖账户安全</b>。',
      store: '一串数字', read: '输入 / 绑定', cap: '无实体', cost: '最低'
    }
  };
  const evo = $('#evo');
  function setEvo(key) {
    const e = EVO[key];
    $('#evK').textContent = `SELECTED / ${e.k}`;
    $('#evName').textContent = e.name;
    $('#evType').textContent = e.type;
    $('#evDesc').innerHTML = e.desc;
    $('#evStore').textContent = e.store;
    $('#evRead').textContent = e.read;
    $('#evCap').textContent = e.cap;
    $('#evCost').textContent = e.cost;
    $$('.evo-card', evo).forEach((b) => b.classList.toggle('is-on', b.dataset.e === key));
  }
  evo.addEventListener('click', (e) => {
    const b = e.target.closest('.evo-card');
    if (b) setEvo(b.dataset.e);
  });
  setEvo('composite');

  /* ── 03 卡号解剖 + 卢恩 ─────────────────────────────── */
  const cardInput = $('#cardInput');
  const DEMOS = ['6225880123456783', '4111111111111111', '378282246310005', '6011111111111117', '30569309025904'];

  function luhnTotal(digits) {
    let total = 0;
    const doubled = [];
    for (let i = 0; i < digits.length; i++) {
      const fromRight = digits.length - 1 - i;
      let d = Number(digits[i]);
      const isDouble = fromRight % 2 === 1;
      if (isDouble) { d *= 2; if (d > 9) d -= 9; }
      doubled.push(isDouble ? d : null);
      total += d;
    }
    return { total, doubled };
  }
  function expectedCheck(prefix) {
    for (let c = 0; c <= 9; c++) {
      if (luhnTotal(prefix + c).total % 10 === 0) return String(c);
    }
    return null;
  }
  function renderCard(raw) {
    const digits = (raw || '').replace(/\D/g, '').slice(0, 19);
    const len = digits.length;
    const bin = digits.slice(0, Math.min(6, Math.max(0, len - 1)));
    const chk = len >= 2 ? digits.slice(-1) : '';
    const mid = len >= 8 ? digits.slice(6, len - 1) : '';

    const group = (s) => s.replace(/(.{4})/g, '$1 ').trim();
    $('#caNum').innerHTML = len
      ? `<span class="seg-bin">${group(bin)}</span>${mid ? `<span class="seg-mid">${group(mid)}</span>` : ''}${chk ? `<span class="seg-chk">${chk}</span>` : ''}`
      : '<span class="seg-mid">—</span>';

    const { total, doubled } = luhnTotal(digits);
    $('#lhDigits').innerHTML = digits.split('').map((d, i) =>
      `<span class="lh-d${doubled[i] != null ? ' is-double' : ''}" title="${doubled[i] != null ? '×2 → ' + doubled[i] : '原值'}">${d}</span>`
    ).join('');
    const rem = total % 10;
    const ok = len >= 13 && rem === 0;
    const need = len >= 2 ? expectedCheck(digits.slice(0, -1)) : null;
    $('#lhSteps').innerHTML = len
      ? `<li><span class="num">1</span><span>自右向左，第 2、4、6… 位 ×2，双位数拆开相加</span></li>
         <li><span class="num">2</span><span>所有位求和：<b>${total}</b></span></li>
         <li><span class="num">3</span><span>总和 mod 10 = <b>${rem}</b>；校验位应为 <b>${need ?? '—'}</b></span></li>`
      : '<li><span class="num">1</span><span>请输入 13–19 位数字</span></li>';
    const state = $('#lhState');
    state.className = 'lh-state ' + (ok ? 'ok' : 'bad');
    state.textContent = ok ? 'LUHN PASS' : (len >= 13 ? `LUHN FAIL / 应为 ${need ?? '—'}` : 'WAITING FOR DIGITS');
    return { digits, ok, total, need };
  }
  cardInput.addEventListener('input', () => {
    const v = cardInput.value.replace(/\D/g, '').slice(0, 19);
    cardInput.value = v;
    renderCard(v);
  });
  $('#btnFix').addEventListener('click', () => {
    const d = cardInput.value.replace(/\D/g, '');
    if (d.length < 2) return;
    const need = expectedCheck(d.slice(0, -1));
    if (need == null) return;
    cardInput.value = d.slice(0, -1) + need;
    renderCard(cardInput.value);
  });
  let demoIdx = 0;
  $('#btnDemo').addEventListener('click', () => {
    demoIdx = (demoIdx + 1) % DEMOS.length;
    cardInput.value = DEMOS[demoIdx];
    renderCard(cardInput.value);
  });
  renderCard(cardInput.value);

  /* ── 05 POS 机身 ───────────────────────────────────── */
  const POS = {
    screen: { k: 'PART / 01 · SCREEN', name: '屏幕', desc: '显示金额、交易状态与提示。智能一体机通常有两块屏：一块给顾客确认金额，一块给店员操作。', carrier: '无（人看）', txn: '确认 / 输密', risk: '防窥屏 / 遮挡' },
    swipe: { k: 'PART / 02 · SWIPE', name: '刷卡槽', desc: '磁头贴着磁条划过，读出磁道 2 的卡号与有效期。最便宜，也最容易被侧录器复制。', carrier: '磁条', txn: '刷卡消费', risk: '侧录器 / 磁头改装' },
    tap: { k: 'PART / 03 · NFC', name: '贴卡区', desc: '13.56 MHz 近场通信，卡或手机靠近 10 cm 内完成感应，不需要物理接触。', carrier: 'NFC / 手机', txn: '挥卡 / 手机支付', risk: '中继放大 / 贴近盗读' },
    camera: { k: 'PART / 04 · CAMERA', name: '摄像头', desc: '读取付款码或收款码的黑白矩阵。扫码枪与 POS 摄像头是两种常见形态。', carrier: '一维码 / 二维码', txn: '扫码支付', risk: '替换码 / 假码' },
    keypad: { k: 'PART / 05 · KEYPAD', name: '键盘', desc: '输入金额、密码、授权码。实体键盘比触屏更容易加装侧录与假键盘。', carrier: '无（人输入）', txn: '输密 / 输金额', risk: '假键盘 / 密码窥探' },
    printer: { k: 'PART / 06 · PRINTER', name: '打印机', desc: '打印签购单，留作交易凭证与拒付举证。热敏纸会褪色，长期凭证要电子化。', carrier: '无（输出）', txn: '打印凭证', risk: '凭证缺失 / 信息泄露' }
  };
  const posDevice = $('#posDevice');
  function setPos(key) {
    const p = POS[key];
    $('#posK').textContent = p.k;
    $('#posName').textContent = p.name;
    $('#posDesc').textContent = p.desc;
    $('#posCarrier').textContent = p.carrier;
    $('#posTxn').textContent = p.txn;
    $('#posRisk').textContent = p.risk;
    $$('.pos-hot', posDevice).forEach((b) => b.classList.toggle('is-on', b.dataset.h === key));
  }
  posDevice.addEventListener('click', (e) => {
    const b = e.target.closest('.pos-hot');
    if (b) setPos(b.dataset.h);
  });
  setPos('screen');

  /* ── 06 收单路径 ───────────────────────────────────── */
  const ROUTES = {
    unionpay: {
      nodes: [['POS', '商户收银台'], ['ACQ', '银联商务 / 收单'], ['NET', '银联主机'], ['ISS', '发卡行'], ['MER', '商户账户']],
      desc: '商户 POS 先联到银联商务，再由银联主机判断发卡行并转接。所有跨行交易都走银联，银联在收单市场上起绝对主导作用。',
      parties: '4', union: '是', cover: '最广'
    },
    same: {
      nodes: [['POS', '商户收银台'], ['BANK', '收单行 = 发卡行'], ['MER', '商户账户'], ['NET', '银联（不经过）', 'skip']],
      desc: '消费者与商户在同一家银行开户。POS 把请求送到收单行，银行发现持卡人也是本行储户，直接内部转账，绕过了银联。',
      parties: '2', union: '否', cover: '窄（本行商户）'
    },
    cross: {
      nodes: [['POS', '商户收银台'], ['ACQ', '收单行'], ['ISS', '发卡行'], ['MER', '商户账户'], ['NET', '银联（不经过）', 'skip']],
      desc: '消费者与商户在不同银行。收单行把扣款指令发给发卡行，发卡行处理后回执，再由收单行通知商户；转接绕过了银联。',
      parties: '3', union: '否', cover: '中（签约商户）'
    },
    third: {
      nodes: [['POS', '商户收银台'], ['PSP', '第三方收单'], ['NET', '银联 / 银行'], ['MER', '商户账户']],
      desc: '2010 年前后第三方支付加入 POS 收单。商户只接第三方一条线，由第三方再对接银联与银行，市场进一步分化。',
      parties: '3–4', union: '视路径', cover: '广（下沉商户）'
    }
  };
  function setRoute(key) {
    const r = ROUTES[key];
    $('#routeFlow').innerHTML = r.nodes.map(([k, label, cls], i) => {
      const node = `<div class="rn${k === 'NET' && key !== 'unionpay' ? ' skip' : (i === 1 || i === 2 ? ' hi' : '')}"><span class="rk mono">${k}</span><b>${label}</b></div>`;
      return (i ? '<span class="ra">→</span>' : '') + node;
    }).join('');
    $('#routeDesc').textContent = r.desc;
    $('#rmParties').textContent = r.parties;
    $('#rmUnion').textContent = r.union;
    $('#rmCover').textContent = r.cover;
    $$('#routeBar .axis-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.r === key));
  }
  $('#routeBar').addEventListener('click', (e) => {
    const b = e.target.closest('.axis-btn');
    if (b) setRoute(b.dataset.r);
  });
  setRoute('unionpay');

  /* ── 07 EAN-13 ────────────────────────────────────── */
  const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
  const R = L.map((s) => s.split('').map((c) => (c === '0' ? '1' : '0')).join(''));
  const PARITY = ['AAAAAA', 'AABABB', 'AABBAB', 'AABBBA', 'ABAABB', 'ABBAAB', 'ABBBAA', 'ABABAB', 'ABABBA', 'ABBABA'];

  function eanCheck(d12) {
    let s = 0;
    for (let i = 0; i < 12; i++) s += Number(d12[i]) * (i % 2 === 0 ? 1 : 3);
    return String((10 - (s % 10)) % 10);
  }
  function renderEAN(raw) {
    let d = (raw || '').replace(/\D/g, '').slice(0, 13);
    if (d.length > 12) d = d.slice(0, 12);
    const state = $('#eanState');
    if (d.length < 12) {
      $('#barCode').innerHTML = '';
      $('#eanCheck').textContent = '—';
      $('#eanLeft').textContent = d || '—';
      $('#eanRight').textContent = '等待 12 位';
      state.textContent = '位数不足，请输入 12 位';
      return;
    }
    const c = eanCheck(d);
    const full = d + c;
    const parity = PARITY[Number(full[0])];
    let bits = '101';
    for (let i = 0; i < 6; i++) {
      const ch = Number(full[i + 1]);
      bits += parity[i] === 'A' ? L[ch] : G[ch];
    }
    bits += '01010';
    for (let i = 7; i < 13; i++) bits += R[Number(full[i])];
    bits += '101';
    $('#barCode').innerHTML = bits.split('').map((b, i) => {
      const guard = (i < 3) || (i >= 45 && i < 50) || (i >= 92);
      return `<i class="${b === '0' ? 'space' : ''}${guard ? ' guard' : ''}"></i>`;
    }).join('');
    $('#eanCheck').textContent = c;
    $('#eanLeft').textContent = full.slice(0, 1) + ' ' + full.slice(1, 7);
    $('#eanRight').textContent = full.slice(7);
    state.textContent = `校验通过 · ${bits.length} 模块`;
  }
  const eanInput = $('#eanInput');
  eanInput.addEventListener('input', () => {
    const v = eanInput.value.replace(/\D/g, '').slice(0, 12);
    eanInput.value = v;
    renderEAN(v);
  });
  renderEAN(eanInput.value);

  /* ── 07 QR ─────────────────────────────────────────── */
  function setQR(v) {
    const n = (v - 1) * 4 + 21;
    const art = $('#qrArt');
    art.style.setProperty('--n', n);
    $('#qrVLabel').textContent = `V${v} · ${n}×${n}`;
    $('#qrSide').textContent = `${n} × ${n}`;
    $('#qrFormula').textContent = `边长 = (V − 1) × 4 + 21 = (${v} − 1) × 4 + 21 = ${n}`;
    $('#qrAlign').style.display = v >= 2 ? '' : 'none';
  }
  $('#qrV').addEventListener('input', (e) => setQR(Number(e.target.value)));
  setQR(Number($('#qrV').value));

  /* ── 08 CPM / MPM ──────────────────────────────────── */
  const SCAN = {
    cpm: {
      k: 'CPM / CONSUMER PRESENTED MODE', title: '消费者出示，商户来扫',
      flow: [['01', '消费者打开钱包，出示付款码', '屏幕'], ['02', '店员用扫码枪或 POS 摄像头读取', '扫码枪'], ['03', '收银系统发起扣款', 'POS'], ['04', '结果回传，屏幕与语音确认', '回执']],
      cost: '扫码枪 / 收银改造', mod: '必须', scene: '超市 / 便利店', risk: '排队与设备故障'
    },
    mpm: {
      k: 'MPM / MERCHANT PRESENTED MODE', title: '商户出示，消费者来扫',
      flow: [['01', '商户贴静态码，或屏幕显示动态码', '贴纸 / 屏'], ['02', '消费者打开钱包扫码', '手机'], ['03', '钱包按码里的账户发起支付', '账户'], ['04', '双方收到结果，语音播报', '回执']],
      cost: '贴纸≈0 / 屏低成本', mod: '不需要', scene: '小商户 / 自助 / 无人', risk: '静态码被替换'
    }
  };
  function setScan(mode) {
    const s = SCAN[mode];
    $('#scanK').textContent = s.k;
    $('#scanTitle').textContent = s.title;
    $('#scanFlow').innerHTML = s.flow.map(([i, t, tag], idx) =>
      `<div class="sf-step${idx === 1 ? ' is-on' : ''}"><span class="sf-i">${i}</span><b>${t}</b><small>${tag}</small></div>`
    ).join('');
    $('#smCost').textContent = s.cost;
    $('#smMod').textContent = s.mod;
    $('#smScene').textContent = s.scene;
    $('#smRisk').textContent = s.risk;
    $('#scanCpm').classList.toggle('is-on', mode === 'cpm');
    $('#scanMpm').classList.toggle('is-on', mode === 'mpm');
  }
  $('#scanCpm').addEventListener('click', () => setScan('cpm'));
  $('#scanMpm').addEventListener('click', () => setScan('mpm'));
  setScan('cpm');

  let tampered = false;
  function setTamper(on) {
    tampered = on;
    $('#acctAttacker').classList.toggle('bad', on);
    $('#acctName').textContent = on ? '陌生账户 · 尾号 0093' : '邻里超市 · 尾号 8821';
    $('#tamperTitle').textContent = on ? '收款方：被替换的陌生账户' : '收款方：本店商户';
    $('#tamperNote').innerHTML = on
      ? '<b>码被替换</b>：顾客仍以为在付给超市，钱却进了别人的账户。商户卖了货，没收到钱；顾客付了钱，订单对不上。'
      : '正常状态：顾客扫的是商户自己的收款码，钱进入商户账户，语音播报与订单金额一致。';
    $('#btnTamper').textContent = on ? '恢复原码' : '模拟被替换';
  }
  $('#btnTamper').addEventListener('click', () => setTamper(!tampered));

  /* ── 09 传感器 ─────────────────────────────────────── */
  const iotLog = $('#iotLog');
  const timers = [];
  function clearTimers() { while (timers.length) clearTimeout(timers.pop()); }
  function iotEvent(t, text, warn) {
    const row = document.createElement('div');
    row.className = 'iot-ev' + (warn ? ' is-warn' : '');
    row.innerHTML = `<span class="t">${t}</span><span>${text}</span>`;
    iotLog.appendChild(row);
    iotLog.scrollTop = iotLog.scrollHeight;
  }
  function setWeight(v) {
    $('#iotVal').textContent = v;
    $('#iotBar').style.width = v + '%';
    $('#iotRange').value = v;
  }
  let crossed = false;
  $('#iotRange').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    setWeight(v);
    if (v < 20 && !crossed) {
      crossed = true;
      iotEvent('SENSOR', `剩余 <b>${v}%</b>，低于预警线 20%`, true);
    }
    if (v >= 20) crossed = false;
  });
  $('#btnIotRun').addEventListener('click', () => {
    clearTimers();
    iotLog.innerHTML = '';
    setWeight(65);
    crossed = false;
    const seq = [
      [0, 'SENSOR', '称重：剩余 <b>65%</b>，高于预警线'],
      [700, 'SENSOR', '称重：剩余 <b>18%</b>，低于预警线 20%', true],
      [1400, 'WIFI', '向供应商发送补货请求：洗衣粉 ×1'],
      [2100, 'SUPPLIER', '校验协议与账户，生成订单 <b>ORD-8821</b>'],
      [2800, 'ACCOUNT', '从预设账户扣款 <b>¥39.00</b>（幂等键 ORD-8821）'],
      [3500, 'DELIVERY', '发货，并通知主人：预计次日送达']
    ];
    seq.forEach(([delay, t, text, warn], i) => {
      timers.push(setTimeout(() => {
        iotEvent(t, text, warn);
        if (i === 2) setWeight(18);
      }, delay));
    });
  });
  $('#btnIotReset').addEventListener('click', () => {
    clearTimers();
    setWeight(65);
    crossed = false;
    iotLog.innerHTML = '<div class="iot-ev is-warn"><span class="t">IDLE</span><span>等待传感器触发。把滑杆降到 20% 以下，或点「模拟一次补货」。</span></div>';
  });
  setWeight(65);

  /* ── 09 钱包三级 ───────────────────────────────────── */
  const WALLETS = {
    1: { k: 'LEVEL 01 / CARD HOLDER', name: '卡包', cap: '把实体卡电子化', d: '把银行卡、会员卡、优惠券、身份证装进手机。它替代的是「带卡」的动作，还没有替代「做决定」的过程。' },
    2: { k: 'LEVEL 02 / PAYMENT ENTRY', name: '支付入口', cap: '扫码 / NFC / 刷脸', d: '电子钱包本身不具备支付功能，真正付钱的是它承载的绑卡、账户与授权应用。它把各种收单方式收进一个入口：扫码、NFC、刷脸、指纹。今天大多数钱包停在这一层。' },
    3: { k: 'LEVEL 03 / DECISION CENTER', name: '决策中心', cap: '选哪张卡 / 哪家店 / 最优价', d: '再往前一步，钱包要回答「用哪张卡积分最多、折扣最大」「附近哪家店最便宜」。把支付与消费决策结合，才真正从工具变成助手。' }
  };
  const walletHead = $('#walletHead');
  function setWallet(lv) {
    const w = WALLETS[lv];
    $('#walletK').textContent = w.k;
    $('#walletName').textContent = w.name;
    $('#walletCap').textContent = w.cap;
    $('#walletDesc').textContent = w.d;
    $$('.axis-btn', walletHead).forEach((b) => b.classList.toggle('is-on', b.dataset.w === String(lv)));
  }
  walletHead.addEventListener('click', (e) => {
    const b = e.target.closest('.axis-btn');
    if (b) setWallet(b.dataset.w);
  });
  setWallet(2);

  /* ── 折叠矩阵 / 问答 ───────────────────────────────── */
  $$('#matrix .mx-row').forEach((r) => r.addEventListener('click', () => {
    const open = r.classList.contains('is-open');
    $$('#matrix .mx-row').forEach((x) => x.classList.remove('is-open'));
    if (!open) r.classList.add('is-open');
    if (!open) r.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }));
  $$('.q-item').forEach((q) => q.addEventListener('click', () => {
    const open = q.classList.contains('is-open');
    $$('.q-item').forEach((x) => x.classList.remove('is-open'));
    if (!open) q.classList.add('is-open');
  }));

  /* ── 自检 ─────────────────────────────────────────── */
  window.__selfCheck = async () => {
    const checks = [];
    const ok = (name, cond, detail = '') => checks.push({ name, ok: !!cond, detail });

    setPair('wallet');
    ok('配对切换：钱包 → 扫码枪', $('#pairName').textContent.includes('扫码枪'));
    setPair('iot');
    ok('配对切换：传感器 → 供应商系统', $('#pairName').textContent.includes('供应商'));
    setPair('bank');

    setEvo('ic');
    ok('四代卡切换：IC', $('#evName').textContent === 'IC 卡' && $('#evCap').textContent === '百万字节');
    setEvo('composite');

    cardInput.value = '4111111111111111';
    renderCard(cardInput.value);
    ok('卢恩：4111111111111111 通过', $('#lhState').textContent.startsWith('LUHN PASS'));
    cardInput.value = '6225880123456789';
    renderCard(cardInput.value);
    ok('卢恩：错误卡号不通过', $('#lhState').textContent.startsWith('LUHN FAIL'));
    $('#btnFix').click();
    ok('修正校验位后通过', $('#lhState').textContent.startsWith('LUHN PASS'), cardInput.value);
    cardInput.value = '6225880123456783';
    renderCard(cardInput.value);

    setPos('tap');
    ok('POS 热点：贴卡区', $('#posName').textContent === '贴卡区' && $('#posCarrier').textContent.includes('NFC'));
    setPos('swipe');
    ok('POS 热点：刷卡槽', $('#posName').textContent === '刷卡槽');
    setPos('screen');

    setRoute('same');
    ok('收单路径：同银行 2 参与方', $('#rmParties').textContent === '2');
    setRoute('unionpay');

    renderEAN('690123456789');
    ok('EAN-13：95 模块', $('#barCode').children.length === 95, `modules=${$('#barCode').children.length}`);
    ok('EAN-13：校验位 2', $('#eanCheck').textContent === '2');

    setQR(40);
    ok('QR：V40 边长 177', $('#qrSide').textContent === '177 × 177');
    ok('QR：公式含 177', $('#qrFormula').textContent.includes('= 177'));
    setQR(10);

    setScan('mpm');
    ok('扫码模式：MPM 标题', $('#scanTitle').textContent.includes('消费者来扫'));
    setTamper(true);
    ok('静态码替换：账户变红', $('#acctAttacker').classList.contains('bad') && $('#acctName').textContent.includes('陌生'));
    setTamper(false);
    setScan('cpm');

    $('#iotRange').value = '10';
    $('#iotRange').dispatchEvent(new Event('input', { bubbles: true }));
    ok('传感器：重量 10%', $('#iotVal').textContent === '10' && $('#iotBar').style.width === '10%');
    $('#btnIotReset').click();

    setWallet(3);
    ok('钱包：决策中心', $('#walletName').textContent === '决策中心');
    setWallet(2);

    ok('无横向溢出', document.documentElement.scrollWidth <= innerWidth + 1,
       `scrollWidth=${document.documentElement.scrollWidth} innerWidth=${innerWidth}`);

    return checks;
  };
})();
