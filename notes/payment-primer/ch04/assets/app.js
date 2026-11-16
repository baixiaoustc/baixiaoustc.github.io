/* CH.04 · 生物特征支付
   认证阶梯 / 六把钥匙 / 刷脸六步 / 双因子组合 /
   指纹三型四读 / 可见-接触位置图 / 维度排名 /
   FAR-FRR 阈值滑杆 / 场景选型 */

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

  const REVEAL = '.sec-head, .cred-wrap, .match, .key-grid, .key-read, .flow-lab, .pay-mode, .reset, .twofa, .fp-lab, .fp-two, .quad-wrap, .rank-bar, .rank, .far-stats, .roc-lab, .conf, .pick, .quiz, .three-law';
  $$(REVEAL).forEach((el) => el.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
  }

  /* ── 01 认证凭证 ─────────────────────────────────────── */
  const AUTH = {
    user: {
      form: '一串账号', reset: '能，改个名字', copy: '能，记住就行', cost: '最低，几乎零成本',
      read: '<b>用户名只回答「你说你是谁」</b>，不回答「你真的是谁」。它必须再绑一个密码、一张卡或一段短信，才能变成一次可验证的授权。'
    },
    pwd: {
      form: '一段口令', reset: '能，改密码', copy: '能，拖库或猜到', cost: '低，输入几秒',
      read: '<b>密码是「你知道的东西」</b>，和人分离：泄露了可以换，忘了可以重置。代价是你要记住它，系统要防它被猜到。'
    },
    sms: {
      form: '6 位数字', reset: '能，换号或重发', copy: '难，但可转发 / 拦截', cost: '中，要等短信',
      read: '<b>短信验证码把「手机号」当成你的代理</b>：能收到短信，就默认手机在你手里。它的强度取决于运营商与 SIM 卡，不取决于那 6 位数字。'
    },
    card: {
      form: '磁条 / 芯片', reset: '能，挂失补卡', copy: '能，侧录 / 复制', cost: '中，刷卡或插卡',
      read: '<b>银行卡是「你带的东西」</b>：卡号可以复制，磁条可以侧录；芯片每次算新密文，才把「复制」这条路堵住。'
    },
    face: {
      form: '一张人脸图像', reset: '不能，只能换脸', copy: '能，照片 / 视频 / 面具', cost: '低，看一眼',
      read: '<b>人脸把凭证和人合并了</b>：不用带、不用记，但也不能丢、不能换。它最适合做「你本人」的确认，不适合单独承担大额授权。'
    },
    finger: {
      form: '一枚指纹图像', reset: '不能，磨掉还会长回来', copy: '能，指纹膜 / 照片', cost: '低，按一下',
      read: '<b>指纹是「你本身」+「一次接触」</b>：比人脸难采，但要按在设备上。接触带来卫生、磨损与留痕问题，也把设备成本分给了收款方。'
    }
  };
  function setAuth(key) {
    const a = AUTH[key];
    $('#aForm').textContent = a.form;
    $('#aReset').textContent = a.reset;
    $('#aCopy').textContent = a.copy;
    $('#aCost').textContent = a.cost;
    $('#authRead').innerHTML = a.read;
    $$('#authChips .chip').forEach((b) => b.classList.toggle('is-on', b.dataset.a === key));
  }
  $('#authChips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (b) setAuth(b.dataset.a);
  });
  setAuth('user');

  const MATCH = {
    one: { count: '1 次', width: '6%', meaning: '这个人是不是他声称的人', scene: '支付授权 / 门禁 / 手机解锁' },
    many: { count: '100,000 次', width: '100%', meaning: '谁的脸最像这张脸', scene: '布控 / 检索 / 反欺诈名单' }
  };
  function setMatch(mode) {
    const m = MATCH[mode];
    $('#mbCount').textContent = m.count;
    $('#mbBar').style.width = m.width;
    $('#mbMeaning').textContent = m.meaning;
    $('#mbScene').textContent = m.scene;
    $('#btn1to1').classList.toggle('is-on', mode === 'one');
    $('#btn1to1').className = mode === 'one' ? 'btn is-on' : 'btn ghost';
    $('#btn1toN').className = mode === 'many' ? 'btn is-on' : 'btn ghost';
    $('#btn1to1').setAttribute('aria-pressed', String(mode === 'one'));
    $('#btn1toN').setAttribute('aria-pressed', String(mode === 'many'));
  }
  $('#btn1to1').addEventListener('click', () => setMatch('one'));
  $('#btn1toN').addEventListener('click', () => setMatch('many'));
  setMatch('one');

  /* ── 02 六把钥匙 ─────────────────────────────────────── */
  const KEYS = {
    face: {
      k: 'SELECTED / B01 · FACE', name: '人脸', type: '生理特征 · 面部轮廓', num: '5',
      numL: '个轮廓部位：眉、眼、鼻、口、颊',
      desc: '摄像头采集面部图像，计算机先定位人脸，再提取轮廓与特征点，最后和预留模板比对。支付场景只做一对一确认，不做一对多检索。',
      read: '摄像头 / 视频', touch: '非接触', dev: '手机 / 收单平板', limit: '公开可采、不可重置'
    },
    finger: {
      k: 'SELECTED / B02 · FINGERPRINT', name: '指纹', type: '生理特征 · 指腹纹路', num: '3',
      numL: '种纹型：斗型、弓型、箕型',
      desc: '指纹在母体内 3—4 个月形成，14 岁左右定型，约 5% 受环境因素影响。它由嵴（凸起的脊线）与峪（凹下的谷线）构成；识别只提取总体纹型与局部节点，不保存原始指纹图，模板匹配仍是 1:1。',
      read: '按压式传感器', touch: '接触', dev: '手机 / 指纹仪', limit: '留痕、老人磨平、卫生'
    },
    palm: {
      k: 'SELECTED / B03 · PALM', name: '掌纹', type: '生理特征 · 手掌纹线', num: '3',
      numL: '个区域：大鱼际、小鱼际、指间区',
      desc: '掌纹的主线、皱纹、细小纹理、脊末梢和分叉点都能用于识别。特征区域比指纹大，信息更丰富；采集可以不接触掌面，适合商户端收单。',
      read: '掌纹扫描 / 摄像', touch: '可非接触', dev: '专用掌纹仪', limit: '设备大、需用户学习'
    },
    vein: {
      k: 'SELECTED / B04 · VEIN', name: '静脉', type: '生理特征 · 皮下血管', num: '2',
      numL: '条特性：唯一、稳定（健康成年人不再变化）',
      desc: '近红外线照射手指，还原血红素吸收红外线，只有静脉部分有微弱反射，从而形成静脉纹路。它藏在皮下，必须活体才拍得到。',
      read: '近红外照射', touch: '接触', dev: '专用扫描仪', limit: '手指要贴近设备'
    },
    voice: {
      k: 'SELECTED / B05 · VOICE', name: '声纹', type: '行为特征 · 发声习惯', num: '90+',
      numL: '种子特征：音高、音强、音长、音色',
      desc: '发声器官与共鸣器官的差异，让每个人的声音有不同的波长、频率、强度和节奏。识别主要看共振峰的频率值与走向，其次才是时长、音强与波形。',
      read: '麦克风 / 录音', touch: '非接触', dev: '手机 / 麦克风', limit: '环境噪声、可录音重放'
    },
    iris: {
      k: 'SELECTED / B06 · IRIS', name: '虹膜', type: '生理特征 · 眼内纹理', num: '4',
      numL: '步：获取图像、预处理、提取特征、匹配特征',
      desc: '虹膜有斑点、细丝、冠状、条纹等丰富纹理，出生 8 个月后稳定成形、终身不变。近红外拍摄后编码比对；理论认假率约 1/1,500,000，而 TouchID 约 1/50,000，是目前已知最精确的生物特征识别之一。',
      read: '近红外相机', touch: '非接触', dev: '专用虹膜仪', limit: '设备贵、心理障碍、IR 安全'
    }
  };
  function setKey(key) {
    const k = KEYS[key];
    $('#keyK').textContent = k.k;
    $('#keyName').textContent = k.name;
    $('#keyType').textContent = k.type;
    $('#keyNum').textContent = k.num;
    $('#keyNumL').textContent = k.numL;
    $('#keyDesc').textContent = k.desc;
    $('#keyRead').textContent = k.read;
    $('#keyTouch').textContent = k.touch;
    $('#keyDev').textContent = k.dev;
    $('#keyLimit').textContent = k.limit;
    $$('#keyGrid .key-card').forEach((b) => b.classList.toggle('is-on', b.dataset.k === key));
  }
  $('#keyGrid').addEventListener('click', (e) => {
    const b = e.target.closest('.key-card');
    if (b) setKey(b.dataset.k);
  });
  setKey('face');

  /* ── 03 刷脸六步 ─────────────────────────────────────── */
  const FLOW = [
    { k: 'STEP 01 / CAPTURE', name: '采集：先把脸变成像素',
      desc: '摄像头（CCD 或 CMOS 传感器）把光学信息转成数字图像。CCD 分辨率高但能耗约为 CMOS 的 100 倍，今天手机与收单设备基本都用 CMOS。',
      fail: '光线太暗、角度太偏，后面再准也没有可用的输入' },
    { k: 'STEP 02 / DETECT', name: '检测：在画面里框出人脸',
      desc: '在图像上准确标定人脸的位置和大小，像手术前先做标记和区域划定。主流检测方法之一是 AdaBoost；这一步只回答「脸在哪、多大」。',
      fail: '侧脸、口罩、逆光会让检测框不到人脸' },
    { k: 'STEP 03 / PREPROCESS', name: '预处理：把图像拉回可比状态',
      desc: '做光线补偿、灰度变换、直方图均衡化、归一化、几何校正、滤波与锐化，目的是让不同设备、不同光线下拍到的人脸进入同一个可比空间。',
      fail: '过曝、噪声、旋转会让特征提取不稳' },
    { k: 'STEP 04 / EXTRACT', name: '特征提取：把脸变成一组数',
      desc: '用轮廓曲线或关键位置的特征点描述人脸：眉毛、眼睛、鼻子、嘴巴、脸颊五个部分。最终输出的是一组特征数据，不是一张照片。',
      fail: '表情、年龄、化妆、遮挡会让特征漂移' },
    { k: 'STEP 05 / MATCH', name: '匹配：算相似度，过阈值才算匹配',
      desc: '把提取到的特征与数据库里的模板比对，相似度超过预设阈值才输出匹配结果。阈值调高，冒用者更难进；调低，本人更容易过。',
      fail: '阈值太松放进冒用者，太严挡住本人' },
    { k: 'STEP 06 / RECOGNIZE', name: '识别：输出「是不是同一个人」',
      desc: '根据匹配结果，确定采集图像与系统预留图像是否一致。支付场景到此完成身份确认；接着才进入账户扣款与结果通知。',
      fail: '把「像」当成「是」，活体检测没做' }
  ];
  let flowI = 0;
  let flowTimers = [];
  function clearFlowTimers() { flowTimers.forEach(clearTimeout); flowTimers = []; }
  function setFlow(i) {
    flowI = i;
    const f = FLOW[i];
    $('#flowK').textContent = f.k;
    $('#flowName').textContent = f.name;
    $('#flowDesc').textContent = f.desc;
    $('#flowFail').textContent = f.fail;
    $$('#flowSteps .fs-step').forEach((b, n) => b.classList.toggle('is-on', n === i));
  }
  $('#flowSteps').addEventListener('click', (e) => {
    const b = e.target.closest('.fs-step');
    if (!b) return;
    clearFlowTimers();
    setFlow(Number(b.dataset.f));
  });
  $('#btnFlowNext').addEventListener('click', () => {
    clearFlowTimers();
    setFlow((flowI + 1) % FLOW.length);
  });
  $('#btnFlowReset').addEventListener('click', () => {
    clearFlowTimers();
    setFlow(0);
  });
  $('#btnFlowPlay').addEventListener('click', () => {
    clearFlowTimers();
    setFlow(0);
    FLOW.forEach((_, i) => {
      if (i === 0) return;
      flowTimers.push(setTimeout(() => setFlow(i), i * 1250));
    });
  });
  setFlow(0);

  function setPayMode(mode) {
    const large = mode === 'large';
    $$('#pmSteps .pm-step').forEach((s, i) => {
      const on = large ? true : (i !== 1);
      s.classList.toggle('is-on', on);
      s.classList.toggle('is-off', !on);
    });
    $('#btnSmall').className = large ? 'btn ghost' : 'btn is-on';
    $('#btnLarge').className = large ? 'btn is-on' : 'btn ghost';
    $('#btnSmall').setAttribute('aria-pressed', String(!large));
    $('#btnLarge').setAttribute('aria-pressed', String(large));
    $('#pmNote').innerHTML = large
      ? '大额交易里，刷脸只顶「用户名」，还必须补密码、PIN 或其他认证。<b>人脸不可重置，不能让它单独决定一笔大钱。</b>'
      : '小额免密不是「刷脸就绝对安全」，而是<b>金额小、风控赔得起</b>：用限额把单次风险封顶，再用行为模型盯异常。';
  }
  $('#btnSmall').addEventListener('click', () => setPayMode('small'));
  $('#btnLarge').addEventListener('click', () => setPayMode('large'));
  setPayMode('small');

  /* ── 04 双因子组合 ──────────────────────────────────── */
  const ONE_NAME = { face: '一张活人脸', finger: '一枚活体指纹', palm: '一只活体手掌' };
  const TWO = {
    pwd: { name: '正确密码', time: '约 8 秒', level: 'L2 / 中高', kind: '可撤销因子' },
    sms: { name: '能收短信的手机号', time: '约 15 秒', level: 'L2 / 中高', kind: '通道因子' },
    eid: { name: '公安库里的身份核验', time: '约 3 秒', level: 'L3 / 高', kind: '权威源因子' },
    finger2: { name: '同一双手上的指纹', time: '约 2 秒', level: 'L1 / 同类叠加', kind: '同类生物因子' }
  };
  let fa1 = 'face', fa2 = 'pwd';
  function set2FA(one, two) {
    fa1 = one; fa2 = two;
    $$('#faOne .btn').forEach((b) => { b.className = b.dataset.v === one ? 'btn is-on' : 'btn ghost'; });
    $$('#faTwo .btn').forEach((b) => { b.className = b.dataset.v === two ? 'btn is-on' : 'btn ghost'; });
    const t = TWO[two];
    $('#faNeed').textContent = ONE_NAME[one] + ' + ' + t.name;
    $('#faTime').textContent = t.time;
    $('#faLevel').textContent = t.level;
    $('#faLevel').className = t.level.startsWith('L3') ? 'gold' : '';
    let note;
    if (two === 'finger2') {
      note = '<b>这是同类因子叠加，不是双因子</b>：两条都来自身体，攻击者拿到一次生物样本就可能同时破两条。安全收益有限，不能代替可撤销的第二因子。';
    } else if (two === 'eid') {
      note = '<b>人脸 + eID 是「生物特征 + 权威身份源」</b>：支付机构不用自己存底账，核验调到公安部门的人口库。速度快、门槛高，但依赖外部接口与授权。';
    } else if (two === 'sms') {
      note = '<b>人脸 + 短信是「生物特征 + 通信通道」</b>：两条路径相对独立，但短信可被拦截、SIM 可被补卡；它比单刷脸强，仍不是最高等级。';
    } else {
      note = '<b>人脸 + 密码是「生物特征 + 可撤销因子」</b>：一条负责你本人，一条负责授权可撤销。攻击者要同时拿到活人脸和密码，门槛明显高于单刷脸。';
    }
    $('#faNote').innerHTML = note;
  }
  $('#faOne').addEventListener('click', (e) => {
    const b = e.target.closest('.btn');
    if (b) set2FA(b.dataset.v, fa2);
  });
  $('#faTwo').addEventListener('click', (e) => {
    const b = e.target.closest('.btn');
    if (b) set2FA(fa1, b.dataset.v);
  });
  set2FA('face', 'pwd');

  /* ── 05 指纹实验室 ───────────────────────────────────── */
  const FP_TYPES = {
    whorl: { legend: 'WHORL / 斗型', name: '斗型', desc: '中心闭合、像旋涡，是肉眼可辨的总体特征之一。纹型只是第一层筛选，真正比对靠局部节点（断点、分叉点、转折点）。' },
    arch: { legend: 'ARCH / 弓型', name: '弓型', desc: '脊线从一侧横跨到另一侧，像拱桥。总体纹型相同不代表同一人：不同人的弓型仍会在节点分布上不同。' },
    loop: { legend: 'LOOP / 箕型', name: '箕型', desc: '脊线开口回折，像簸箕。指纹识别算法会同时看总体纹型与局部特征；两枚指纹可以总体相同，局部却不可能完全相同。' }
  };
  function setFPType(t) {
    const info = FP_TYPES[t];
    $('#fpLegend').textContent = info.legend;
    $$('#fpSvg .fp-g').forEach((g) => { g.style.display = g.dataset.t === t ? '' : 'none'; });
    $$('#fpTypes .fp-type').forEach((b) => b.classList.toggle('is-on', b.dataset.t === t));
  }
  $('#fpTypes').addEventListener('click', (e) => {
    const b = e.target.closest('.fp-type');
    if (b) setFPType(b.dataset.t);
  });
  setFPType('whorl');

  const TECH = {
    optical: {
      name: '光学识别', how: '光学对比', speed: '一般', size: '大 / 低', clean: '中等',
      desc: '手指放在棱镜上，内置光源把脊线与谷线投到 CCD，形成多灰度图像。历史最久、用得最广，但模块体积大，容易被指纹膜骗过。'
    },
    thermal: {
      name: '温差式识别', how: '温度差 → 电信号', speed: '100 ms 内', size: '最小 / 中', clean: '较高',
      desc: '每个像素相当于微型电荷传感器，感应手指与芯片映像区域的温度差。优点是 100 ms 内成像、传感器体积最小；缺点是时间一长温差消失，滑动式指纹仪常用它。'
    },
    cap: {
      name: '电容式识别', how: '嵴峪电容值差', speed: '快', size: '小 / 中', clean: '较高',
      desc: '嵴凸起、峪凹下，与半导体电容颗粒形成不同电容值，放电速度不同，据此还原指纹图像。手机里的指纹传感器多为电容式，成本与体积平衡得最好。'
    },
    ultra: {
      name: '超声波识别', how: '声波阻抗差异', speed: '较慢', size: '中 / 高', clean: '低',
      desc: '超声波穿透材料后按材质产生不同回波，利用皮肤与空气的声波阻抗差异区分嵴与峪。频率约 1×10⁴–1×10⁹ Hz，能量控制在医学诊断强度、对人体无损；精度最好，但采集慢、价格贵。'
    }
  };
  function setTech(t) {
    const info = TECH[t];
    $('#techName').textContent = info.name;
    $('#techDesc').textContent = info.desc;
    $('#techHow').textContent = info.how;
    $('#techSpeed').textContent = info.speed;
    $('#techSize').textContent = info.size;
    $('#techClean').textContent = info.clean;
    $$('#fpTech .fp-t').forEach((b) => b.classList.toggle('is-on', b.dataset.tech === t));
  }
  $('#fpTech').addEventListener('click', (e) => {
    const b = e.target.closest('.fp-t');
    if (b) setTech(b.dataset.tech);
  });
  setTech('optical');

  /* ── 06 位置图 ───────────────────────────────────────── */
  const QUAD = {
    face: { k: 'POINT / FACE', name: '人脸', type: '非接触 · 外显 · 生理特征',
      desc: '摄像头隔着几十厘米就能采，用户不需要学任何动作；但同一套设备，别人也能在街上、在社交平台上采到你的脸。方便与暴露是同一条性质的两面。',
      easy: '最低', live: '关键 / 难', cost: '已有摄像头', risk: '照片 / 视频 / 面具' },
    palm: { k: 'POINT / PALM', name: '掌纹', type: '可非接触 · 外显 · 生理特征',
      desc: '掌纹区域大、纹线清晰，识别信息比一枚指纹更丰富；掌面可以不接触设备。代价是设备更大、用户需要学习把手放对位置。',
      easy: '低', live: '较难', cost: '专用掌纹仪', risk: '掌纹照片 / 假掌模' },
    finger: { k: 'POINT / FINGERPRINT', name: '指纹', type: '接触 · 外显 · 生理特征',
      desc: '指纹要按在传感器上，读取器与手指直接接触。它最容易普及，因为手机和门禁本来就有传感器；但在公共场所，接触本身成了障碍。',
      easy: '低', live: '较难', cost: '手机 / 指纹仪', risk: '指纹膜 / 留痕复制' },
    voice: { k: 'POINT / VOICE', name: '声纹', type: '非接触 · 行为特征',
      desc: '对着麦克风说几个字就能采，设备最简单；但环境噪声、感冒变声、录音重放都会影响结果。它更适合做辅助因子，而不是唯一因子。',
      easy: '低（有噪声）', live: '难 / 可重放', cost: '手机麦克风', risk: '录音重放 / 模仿' },
    iris: { k: 'POINT / IRIS', name: '虹膜', type: '非接触 · 内藏 · 生理特征',
      desc: '虹膜纹理在眼内，出生 8 个月后稳定，认假率约 1/1,500,000，是已知最精确的生物特征之一。它不用接触，但需要近红外相机与用户配合。',
      easy: '中', live: '强', cost: '专用虹膜仪', risk: '隐形眼镜 / 虹膜照片' },
    vein: { k: 'POINT / VEIN', name: '静脉', type: '接触 · 内藏 · 生理特征',
      desc: '静脉藏在皮下，近红外照射才能成像；必须是活体、有血流才拍得到，所以防伪能力强。富士通 2017 年数据：识别错误率 0.00008%，识别失败率 0.01%。',
      easy: '高（要贴近）', live: '最强', cost: '专用扫描仪', risk: '设备接触 / 卫生顾虑' }
  };
  function setQuad(key) {
    const q = QUAD[key];
    $('#qK').textContent = q.k;
    $('#qName').textContent = q.name;
    $('#qType').textContent = q.type;
    $('#qDesc').textContent = q.desc;
    $('#qEasy').textContent = q.easy;
    $('#qLive').textContent = q.live;
    $('#qCost').textContent = q.cost;
    $('#qRisk').textContent = q.risk;
    $$('#s06 .q-point').forEach((b) => b.classList.toggle('is-on', b.dataset.q === key));
  }
  $$('#s06 .q-point').forEach((b) => b.addEventListener('click', () => setQuad(b.dataset.q)));
  setQuad('face');

  /* ── 07 排名 ─────────────────────────────────────────── */
  const RANK = {
    all: {
      label: '综合序（按定性描述整理）',
      note: '书中结论是 <b>刷脸第 1、掌纹第 2、指纹第 6</b>；中间三种未给明确位次，本表按定性描述填入相对分数。分数为阅读整理，不是书中原表数值。',
      s: { face: 5.0, palm: 4.3, iris: 3.8, vein: 3.5, voice: 2.8, finger: 1.8 }
    },
    easy: {
      label: '便利：不用学动作、不用接触',
      note: '便利维度看「用户要做几个动作」。刷脸只要站好，声纹只要说话，掌纹可以不接触；指纹和静脉都要把手指伸过去。',
      s: { face: 5.0, voice: 4.5, palm: 4.0, finger: 3.4, iris: 3.0, vein: 2.2 }
    },
    clean: {
      label: '卫生：尽量不碰公共设备',
      note: '卫生维度看「皮肤是否接触公共表面」。非接触的人脸、虹膜、声纹、掌纹占优；静脉与指纹都要接触，指纹还更容易留痕。',
      s: { face: 5.0, iris: 4.6, voice: 4.4, palm: 4.1, vein: 2.0, finger: 1.5 }
    },
    safe: {
      label: '安全：活体、内藏、难复制',
      note: '安全维度看「伪造与冒用的门槛」。静脉内藏且验活体最强，虹膜精度最高；人脸公开可采、不可重置，单因子最危险。',
      s: { vein: 5.0, iris: 4.8, palm: 4.0, finger: 3.0, face: 2.4, voice: 2.0 }
    },
    cost: {
      label: '成本：设备与改造成本',
      note: '成本维度看「读取器要不要另买」。声纹、人脸用现成麦克风与摄像头，成本最低；虹膜、掌纹、静脉都要专用设备。',
      s: { voice: 5.0, face: 4.6, finger: 4.2, iris: 2.4, palm: 2.2, vein: 2.0 }
    },
    accept: {
      label: '接受度：用户习不习惯',
      note: '接受度维度看「用户是否熟悉、是否愿意配合」。指纹在手机里已经教育了十几年，接受度最高；虹膜、静脉仍有心理门槛。',
      s: { finger: 4.6, face: 4.2, voice: 3.5, palm: 3.0, iris: 2.6, vein: 2.3 }
    }
  };
  let rankDim = 'all';
  function setRank(dim) {
    rankDim = dim;
    const data = RANK[dim];
    $$('#rankTabs .btn').forEach((b) => { b.className = b.dataset.d === dim ? 'btn is-on' : 'btn ghost'; });
    const rows = $$('#rankList .rank-row');
    const sorted = rows.slice().sort((a, b) => data.s[b.dataset.k] - data.s[a.dataset.k]);
    sorted.forEach((r, i) => {
      const key = r.dataset.k;
      const v = data.s[key];
      r.style.order = String(i);
      $('.rk-no', r).textContent = String(i + 1).padStart(2, '0');
      $('.rk-bar i', r).style.width = (v / 5 * 100).toFixed(1) + '%';
      $('.rk-v', r).textContent = v.toFixed(1);
      r.classList.remove('flash');
      setTimeout(() => r.classList.add('flash'), 20);
      setTimeout(() => r.classList.remove('flash'), 520);
    });
    $('#rankNote').innerHTML = '<b>' + data.label + '</b> ' + data.note;
  }
  $('#rankTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.btn');
    if (b) setRank(b.dataset.d);
  });
  setRank('all');

  /* ── 08 FAR / FRR ────────────────────────────────────── */
  const N_IRA = 89100;   // 类间匹配总次数：300×299 - 600
  const N_GRA = 600;     // 类内匹配总次数：100 人 × 6 组合
  const X0 = 48, X1 = 530, Y0 = 250, Y1 = 50;
  const THR_MIN = 50, THR_MAX = 100, Y_MAX = 20;
  const farAt = (t) => 0.11 * Math.pow(10, (90 - t) / 20);
  const frrAt = (t) => 5 * Math.pow(10, (t - 90) / 10);
  const eerT = 90 + 10 * (Math.log10(0.11 / 5) / 1.5);
  const eerV = 5 * Math.pow(10, (eerT - 90) / 10);
  const xOf = (t) => X0 + (t - THR_MIN) / (THR_MAX - THR_MIN) * (X1 - X0);
  const yOf = (v) => Y0 - Math.min(v, Y_MAX) / Y_MAX * (Y0 - Y1);
  const fmtPct = (v) => (v >= 1 ? v.toFixed(2) : v >= 0.01 ? v.toFixed(3) : v.toFixed(5)) + '%';

  function drawCurves() {
    const mk = (fn) => {
      let pts = [];
      for (let t = THR_MIN; t <= THR_MAX; t += 0.5) pts.push(xOf(t).toFixed(1) + ',' + yOf(fn(t)).toFixed(1));
      return pts.join(' ');
    };
    $('#farLine').setAttribute('points', mk(farAt));
    $('#frrLine').setAttribute('points', mk(frrAt));
    const ex = xOf(eerT), ey = yOf(eerV);
    $('#eerDot').setAttribute('cx', ex.toFixed(1));
    $('#eerDot').setAttribute('cy', ey.toFixed(1));
    $('#eerLabel').setAttribute('x', (ex + 8).toFixed(1));
    $('#eerLabel').setAttribute('y', (ey - 8).toFixed(1));
    $('#eerLabel').textContent = 'EER ' + fmtPct(eerV);
  }

  function setThr(t) {
    t = Math.max(THR_MIN, Math.min(99.9, Number(t)));
    const far = farAt(t), frr = frrAt(t);
    const cx = xOf(t);
    $('#thrVal').textContent = t.toFixed(1) + '%';
    $('#outFar').textContent = fmtPct(far);
    $('#outFrr').textContent = fmtPct(frr);
    $('#outFarN').textContent = '≈ ' + Math.round(far / 100 * N_IRA).toLocaleString('en-US') + ' / ' + N_IRA.toLocaleString('en-US');
    $('#outFrrN').textContent = '≈ ' + Math.round(frr / 100 * N_GRA) + ' / ' + N_GRA;

    let tone, toneN, cls;
    if (t < eerT - 2) { tone = '偏松 / 宽进宽出'; toneN = '阈值偏低：本人更容易过，冒用者也更容易进'; cls = 'loose'; }
    else if (t > eerT + 2) { tone = '偏严 / 严进严出'; toneN = '阈值偏高：冒用者更难进，本人也更容易被挡'; cls = 'strict'; }
    else { tone = '平衡区'; toneN = '接近 EER：两类错误率相当'; cls = ''; }
    $('#outTone').textContent = tone;
    $('#outToneN').textContent = toneN;
    const badge = $('#rocBadge');
    badge.textContent = tone;
    badge.className = 'roc-badge ' + cls;

    const farY = yOf(far), frrY = yOf(frr);
    $('#rocCursor').setAttribute('x1', cx.toFixed(1));
    $('#rocCursor').setAttribute('x2', cx.toFixed(1));
    $('#farLabel').setAttribute('x', (cx + 6).toFixed(1));
    $('#farLabel').setAttribute('y', (Math.max(Y1 + 10, farY - 6)).toFixed(1));
    $('#farLabel').textContent = 'FAR ' + fmtPct(far);
    $('#frrLabel').setAttribute('x', (Math.min(X1 - 54, cx + 6)).toFixed(1));
    $('#frrLabel').setAttribute('y', (Math.max(Y1 + 10, frrY - 6)).toFixed(1));
    $('#frrLabel').textContent = 'FRR ' + fmtPct(frr);
  }
  $('#thr').addEventListener('input', (e) => setThr(e.target.value));
  $('#btnThr90').addEventListener('click', () => { $('#thr').value = '90'; setThr(90); });
  drawCurves();
  setThr(90);

  /* ── 09 选型 ─────────────────────────────────────────── */
  const PICK = {
    store: {
      k: 'SCENARIO 01 / CONVENIENCE STORE', name: '便利店小额：刷脸 + 限额',
      tags: ['非接触', '免密', '活体检测'],
      why: '几十元的交易，最重要的是别排队。刷脸不需要掏手机、不需要接触设备，摄像头现成；用单笔限额把损失封顶，再用频次与行为模型盯异常。掌纹可以做备选，但需要商户铺设备。',
      best: '刷脸', second: '金额超限时密码 / 短信', ctrl: '活体检测 + 单笔限额'
    },
    market: {
      k: 'SCENARIO 02 / SUPERMARKET', name: '商超大额：刷脸 + 密码 / eID',
      tags: ['双因子', '大额', '可撤销授权'],
      why: '上千元的交易不能只靠一张脸。刷脸负责确认本人，密码或 eID 负责可撤销的授权；两条路径必须相对独立。指纹要接触公共设备，卫生与留痕都是减分项。',
      best: '刷脸 + 密码 / eID', second: '短信作为备用', ctrl: '双因子 + 大额风控 + 人工复核'
    },
    online: {
      k: 'SCENARIO 03 / MOBILE ONLINE', name: '手机线上：设备内的指纹 / 人脸',
      tags: ['设备绑定', 'TEE', '小额免密'],
      why: '线上场景没有商户收单设备，读取器就是用户自己的手机。指纹或人脸在设备本地完成比对，模板不出安全区；大额再叠密码或短信。设备丢失要能远程解绑。',
      best: '指纹 / 人脸（设备本地）', second: '密码 / 短信', ctrl: '设备绑定 + 远程解绑 + 限额'
    },
    vault: {
      k: 'SCENARIO 04 / HIGH SECURITY', name: '高安全门禁：静脉 + 虹膜',
      tags: ['活体', '内藏', '专用设备'],
      why: '金库、数据中心要的不是快，而是「伪造不了」。静脉必须活体、有血流才拍得到，虹膜认假率约 1/1,500,000；两种都要专用设备，也只适合少数人、少数点位。',
      best: '静脉 / 虹膜', second: '卡 + 密码（作为降级路径）', ctrl: '活体检测 + 双人复核 + 审计留痕'
    }
  };
  function setPick(key) {
    const p = PICK[key];
    $('#pickK').textContent = p.k;
    $('#pickName').textContent = p.name;
    $('#pickTags').innerHTML = p.tags.map((t) => '<span>' + t + '</span>').join('');
    $('#pickWhy').textContent = p.why;
    $('#pickBest').textContent = p.best;
    $('#pickSecond').textContent = p.second;
    $('#pickCtrl').textContent = p.ctrl;
    $$('#pickTabs .pick-tab').forEach((b) => b.classList.toggle('is-on', b.dataset.p === key));
  }
  $('#pickTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.pick-tab');
    if (b) setPick(b.dataset.p);
  });
  setPick('store');

  /* ── 问答 ─────────────────────────────────────────────── */
  $$('.q-item').forEach((q) => q.addEventListener('click', () => {
    const open = q.classList.contains('is-open');
    $$('.q-item').forEach((x) => x.classList.remove('is-open'));
    if (!open) q.classList.add('is-open');
  }));

  /* ── 自检 ─────────────────────────────────────────────── */
  window.__selfCheck = async () => {
    const checks = [];
    const ok = (name, cond, detail = '') => checks.push({ name, ok: !!cond, detail });

    setAuth('face');
    ok('认证：人脸不可重置', $('#aReset').textContent.includes('不能') && $('#aCopy').textContent.includes('照片'));
    setAuth('user');

    setMatch('many');
    ok('比对模式：1:N 次数上升', $('#mbCount').textContent.includes('100,000') && $('#mbBar').style.width === '100%');
    setMatch('one');

    setKey('iris');
    ok('六把钥匙：虹膜 4 步', $('#keyName').textContent === '虹膜' && $('#keyNum').textContent === '4');
    setKey('face');

    $('#btnFlowNext').click(); $('#btnFlowNext').click(); $('#btnFlowNext').click();
    ok('刷脸流程：走到第 4 步', $('#flowK').textContent.includes('EXTRACT'), $('#flowK').textContent);
    $('#btnFlowReset').click();
    ok('刷脸流程：重置回采集', $('#flowName').textContent.includes('采集'));

    setPayMode('large');
    ok('刷脸支付：大额启用密码', $$('#pmSteps .pm-step')[1].classList.contains('is-on') && !$$('#pmSteps .pm-step')[1].classList.contains('is-off'));
    setPayMode('small');

    set2FA('face', 'eid');
    ok('双因子：人脸 + eID → L3', $('#faLevel').textContent.includes('L3'));
    set2FA('face', 'finger2');
    ok('双因子：同类因子会降级', $('#faLevel').textContent.includes('L1') && $('#faNote').textContent.includes('不是双因子'));
    set2FA('face', 'pwd');

    setTech('ultra');
    ok('指纹读取：超声波', $('#techName').textContent.includes('超声波') && $('#techSpeed').textContent === '较慢');
    setFPType('arch');
    ok('指纹纹型：弓型', $('#fpLegend').textContent.includes('弓型'));
    setFPType('whorl');

    setQuad('vein');
    ok('位置图：静脉在内藏/接触角', $('#qName').textContent === '静脉' && $('#qLive').textContent.includes('最强'));
    setQuad('face');

    setRank('safe');
    const first = $$('#rankList .rank-row').sort((a, b) => Number(a.style.order) - Number(b.style.order))[0];
    ok('排名：安全维度静脉第一', first.dataset.k === 'vein', first.dataset.k);
    setRank('all');

    $('#thr').value = '90';
    $('#thr').dispatchEvent(new Event('input', { bubbles: true }));
    ok('阈值 90：FAR≈0.11%', $('#outFar').textContent.includes('0.110'));
    ok('阈值 90：FRR≈5%', $('#outFrr').textContent.includes('5.00'));
    ok('EER 交点已绘制', $('#eerDot').getAttribute('cx') !== '0' && $('#eerLabel').textContent.includes('0.393'));
    $('#thr').value = '99.9';
    $('#thr').dispatchEvent(new Event('input', { bubbles: true }));
    ok('阈值调严：FAR 下降、FRR 上升', parseFloat($('#outFar').textContent) < 0.11 && parseFloat($('#outFrr').textContent) > 5);
    $('#btnThr90').click();

    setPick('vault');
    ok('选型：高安全门禁 → 静脉/虹膜', $('#pickBest').textContent.includes('静脉'));
    setPick('store');

    ok('无横向溢出', document.documentElement.scrollWidth <= innerWidth + 1,
       `scrollWidth=${document.documentElement.scrollWidth} innerWidth=${innerWidth}`);

    return checks;
  };
})();
