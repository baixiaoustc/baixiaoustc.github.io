/* 小问号博物馆 · 前端渲染（中英双语）
   数据来自 data/questions.js（window.KQ），不需要构建、不需要后端。
   语言切换：URL ?lang=en 优先，其次 localStorage，默认中文。 */

(function () {
  const D = window.KQ;
  if (!D) {
    document.body.innerHTML = '<p style="padding:40px">数据没加载上：data/questions.js 没找到。</p>';
    return;
  }

  /* ---------- 文案 ---------- */
  const STR = {
    zh: {
      siteTitle: "小问号博物馆",
      siteSub: "玉米和桃子问过的每一个问题，都收在这里。一张图看懂，三句话说清。",
      searchPlaceholder: "搜一搜：螃蟹、蚊子、插件、保险…",
      chipAll: "全部",
      chipAllSubjects: "全部学科",
      viewTime: "按时间",
      viewSubject: "按学科",
      timeHead: "最新在前",
      timeAbout: "按提问时刻倒排（时:分:秒）",
      emptyBoard: "没有找到这样的问题 🌱<br>换个词试试，比如「螃蟹」「蚊子」「插件」。",
      waiting: "还等着第一个问题的学科：",
      footerIndex: "问题来自玉米和桃子，答案由爸爸整理 · 每个问题配一张手绘的图",
      footerQuestion: "问题来自玉米和桃子 · 答案由爸爸整理",
      statsQuestions: (n) => `${n} 个问题`,
      statsKids: (n) => `${n} 位小问号`,
      statsSubjects: (n) => `${n} 个学科`,
      statsUpdated: (d) => `最近更新 ${d}`,
      count: (n) => `${n} 个问题`,
      age: (n) => `${n} 岁`,
      ageCard: (n) => `${n} 岁`,
      back: "← 回到博物馆首页",
      quoteLabel: (name) => `${name}当时的原话`,
      oneLineLabel: "一句话答案",
      pointsTitle: "三句话说清楚",
      followLabel: "还可以接着问：",
      relatedTitle: "同一学科的问题",
      relatedEmpty: "这个学科还在等第二个问题。",
      notFound: "没找到这个问题。",
      figCaption: "一眼看懂：",
      zoomHint: "🔍 点击放大",
      zoomAria: "放大看这张图",
      closeAria: "关闭",
      langBtn: "EN",
      langBtnAria: "Switch to English",
      titleSuffix: " · 小问号博物馆",
      docTitleIndex: "小问号博物馆 · 玉米和桃子的问题",
      docDescIndex: "记录玉米和桃子每天提出的问题，按学科分好，每个问题配一张一眼看懂的图。",
      docDescQuestion: "玉米和桃子的提问，一图三句讲清楚。",
    },
    en: {
      siteTitle: "The Little Question Museum",
      siteSub: "Every question Yumi and Taozi have asked lives here. One picture to see it, three sentences to explain it.",
      searchPlaceholder: "Search: crab, mosquito, plugin, insurance…",
      chipAll: "All",
      chipAllSubjects: "All subjects",
      viewTime: "By date",
      viewSubject: "By subject",
      timeHead: "Newest first",
      timeAbout: "Sorted by the moment each question was asked (hh:mm:ss)",
      emptyBoard: "No questions like that 🌱<br>Try another word: crab, mosquito, plugin.",
      waiting: "Subjects still waiting for their first question:",
      footerIndex: "Questions from Yumi and Taozi, answers sorted out by Dad · a hand-drawn picture for each",
      footerQuestion: "Questions from Yumi and Taozi · answers sorted out by Dad",
      statsQuestions: (n) => `${n} ${n === 1 ? "question" : "questions"}`,
      statsKids: (n) => `${n} curious ${n === 1 ? "kid" : "kids"}`,
      statsSubjects: (n) => `${n} ${n === 1 ? "subject" : "subjects"}`,
      statsUpdated: (d) => `Updated ${d}`,
      count: (n) => `${n} ${n === 1 ? "question" : "questions"}`,
      age: (n) => `age ${n}`,
      ageCard: (n) => `Age ${n}`,
      back: "← Back to the museum",
      quoteLabel: (name) => `What ${name} actually asked`,
      oneLineLabel: "In one sentence",
      pointsTitle: "Three sentences to explain it",
      followLabel: "One more question you could ask:",
      relatedTitle: "More from the same subject",
      relatedEmpty: "This subject is still waiting for its second question.",
      notFound: "No such question.",
      figCaption: "At a glance: ",
      zoomHint: "🔍 Click to enlarge",
      zoomAria: "Enlarge this picture",
      closeAria: "Close",
      langBtn: "中文",
      langBtnAria: "切换到中文",
      titleSuffix: " · The Little Question Museum",
      docTitleIndex: "The Little Question Museum · questions from Yumi and Taozi",
      docDescIndex: "Every question Yumi and Taozi ask, sorted by subject, each with one picture that makes it clear.",
      docDescQuestion: "Questions from Yumi and Taozi, explained in one picture and three sentences.",
    },
  };

  /* ---------- 语言状态 ---------- */
  const LS_KEY = "kq-lang";
  const readLang = () => {
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "en" || p === "zh") return p;
    try {
      const v = localStorage.getItem(LS_KEY);
      if (v === "en" || v === "zh") return v;
    } catch {}
    return "zh";
  };
  let lang = readLang();
  const T = () => STR[lang];
  const isEn = () => lang === "en";

  // 取某题的当前语言内容：没有英文就退回中文
  const loc = (q) => {
    if (!isEn()) return { question: q.question, oneLine: q.oneLine, points: q.points || [], followUp: q.followUp, figureAlt: q.figureAlt, figure: q.figure };
    const e = q.en || {};
    return {
      question: e.question || q.question,
      oneLine: e.oneLine || q.oneLine,
      points: e.points || q.points || [],
      followUp: e.followUp || q.followUp,
      figureAlt: e.figureAlt || q.figureAlt,
      figure: q.figureEn || q.figure,
    };
  };

  const subjectOf = (id) => {
    const s = D.subjects.find((x) => x.id === id) || { id, name: id, emoji: "❓", color: "#FFD166", about: "" };
    return { ...s, name: isEn() ? s.nameEn || s.name : s.name, about: isEn() ? s.aboutEn || s.about : s.about };
  };
  const kidOf = (id) => {
    const k = D.kids.find((x) => x.id === id) || { id, name: id, emoji: "🙂" };
    return { ...k, name: isEn() ? k.nameEn || k.name : k.name };
  };

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // 2026-10-06 -> 2026 年 10 月 6 日 / Oct 6, 2026
  const fmtDate = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ""));
    if (!m) return esc(d);
    return isEn() ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : `${m[1]} 年 ${Number(m[2])} 月 ${Number(m[3])} 日`;
  };

  const stampOf = (q) => `${q.date} ${q.time || "00:00:00"}`;
  const shortStamp = (q) => `${String(q.date).slice(5)}${q.time ? " " + q.time : ""}`;

  /* ---------- 静态文案 ---------- */
  function applyStatic() {
    const t = T();
    document.documentElement.lang = isEn() ? "en" : "zh-CN";
    document.body.dataset.lang = lang;
    for (const el of document.querySelectorAll("[data-i18n]")) {
      const k = el.dataset.i18n;
      if (typeof t[k] === "string") el.textContent = t[k];
    }
    for (const el of document.querySelectorAll("[data-i18n-placeholder]")) el.placeholder = t[el.dataset.i18nPlaceholder];
    const desc = document.querySelector('meta[name="description"]');
    const isQ = document.body.dataset.page === "question";
    if (desc) desc.setAttribute("content", isQ ? t.docDescQuestion : t.docDescIndex);
    if (!isQ) document.title = t.docTitleIndex;
  }

  /* ---------- 语言按钮 ---------- */
  function mountLangButtons(onChange) {
    for (const btn of document.querySelectorAll(".lang-toggle")) {
      btn.textContent = T().langBtn;
      btn.setAttribute("aria-label", T().langBtnAria);
      btn.onclick = () => {
        lang = lang === "en" ? "zh" : "en";
        try { localStorage.setItem(LS_KEY, lang); } catch {}
        const url = new URL(location.href);
        url.searchParams.delete("lang");
        history.replaceState(null, "", url);
        applyStatic();
        mountLangButtons(onChange);
        onChange();
      };
    }
  }

  /* ---------- 图片全屏查看（点图放大） ---------- */
  let lbInstance = null;
  function lightbox() {
    if (lbInstance) return lbInstance;
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `<button class="lb-close" type="button" aria-label="${esc(T().closeAria)}">✕</button><img alt="">`;
    document.body.appendChild(box);
    const img = box.querySelector("img");

    const close = () => {
      box.classList.remove("open", "zoomed");
      document.body.style.overflow = "";
    };
    const open = (src, alt) => {
      img.src = src;
      img.alt = alt || "";
      box.classList.add("open");
      box.classList.remove("zoomed");
      document.body.style.overflow = "hidden";
      box.scrollTop = 0;
      box.scrollLeft = 0;
    };

    img.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!box.classList.contains("zoomed")) {
        box.classList.add("zoomed");
        requestAnimationFrame(() => {
          box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
          box.scrollTop = (box.scrollHeight - box.clientHeight) / 2;
        });
      } else {
        box.classList.remove("zoomed");
      }
    });
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.classList.contains("lb-close")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && box.classList.contains("open")) close();
    });

    return (lbInstance = { box, open, close });
  }

  /* ---------- 首页 ---------- */
  function renderIndex() {
    const t = T();
    const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);
    const qs = [...D.questions].sort(byDateDesc);

    const usedSubjects = D.subjects.filter((s) => qs.some((q) => q.subject === s.id || q.secondary === s.id));
    const primarySubjects = D.subjects.filter((s) => qs.some((q) => q.subject === s.id));

    const stats = document.getElementById("stats");
    if (stats) {
      stats.innerHTML =
        `<span>${esc(t.statsQuestions(qs.length))}</span>` +
        `<span>${esc(t.statsKids(D.kids.length))}</span>` +
        `<span>${esc(t.statsSubjects(primarySubjects.length))}</span>` +
        `<span>${esc(t.statsUpdated(qs[0] ? qs[0].date : "—"))}</span>`;
    }

    let kidFilter = "all";
    let subjectFilter = "all";
    let keyword = "";
    let view = "subject";

    const kidChips = document.getElementById("kidChips");
    const subjectChips = document.getElementById("subjectChips");

    const chip = (label, on) => `<button class="chip${on ? " on" : ""}" type="button">${label}</button>`;

    function paintChips() {
      kidChips.innerHTML =
        chip(esc(t.chipAll), kidFilter === "all") + D.kids.map((k) => chip(`${k.emoji} ${esc(kidOf(k.id).name)}`, kidFilter === k.id)).join("");

      subjectChips.innerHTML =
        chip(esc(t.chipAllSubjects), subjectFilter === "all") +
        usedSubjects.map((s) => chip(`${s.emoji} ${esc(subjectOf(s.id).name)}`, subjectFilter === s.id)).join("");

      [...kidChips.querySelectorAll(".chip")].forEach((el, i) => {
        el.onclick = () => {
          kidFilter = i === 0 ? "all" : D.kids[i - 1].id;
          paintChips();
          render();
        };
      });
      [...subjectChips.querySelectorAll(".chip")].forEach((el, i) => {
        el.onclick = () => {
          subjectFilter = i === 0 ? "all" : usedSubjects[i - 1].id;
          paintChips();
          render();
        };
      });
    }

    function match(q) {
      if (kidFilter !== "all" && q.kid !== kidFilter) return false;
      if (subjectFilter !== "all" && q.subject !== subjectFilter && q.secondary !== subjectFilter) return false;
      if (!keyword) return true;
      const c = loc(q);
      const hay = [c.question, c.oneLine, c.followUp, (c.points || []).join(" "), q.question, q.oneLine, subjectOf(q.subject).name, subjectOf(q.secondary).name, kidOf(q.kid).name]
        .join(" ")
        .toLowerCase();
      return hay.includes(keyword.toLowerCase());
    }

    const board = document.getElementById("board");

    function card(q) {
      const s = subjectOf(q.subject);
      const k = kidOf(q.kid);
      const c = loc(q);
      return `<a class="card" href="question.html?id=${encodeURIComponent(q.id)}" style="--c:${s.color}">
        ${
          c.figure
            ? `<div class="card-fig"><img src="${esc(c.figure)}" alt="${esc(c.figureAlt || c.question)}" loading="lazy"><span class="card-zoom" role="button" tabindex="0" aria-label="${esc(t.zoomAria)}" data-src="${esc(c.figure)}" data-alt="${esc(c.figureAlt || c.question)}">🔍</span></div>`
            : `<div class="card-fig card-fig-soon" aria-hidden="true"><span>${s.emoji}</span></div>`
        }
        <div class="card-body">
          <p class="q">${esc(c.question)}</p>
          <p class="ans">${esc(c.oneLine)}</p>
          <div class="meta">
            <span class="pill">${k.emoji} ${esc(k.name)}</span>
            <span class="pill">${esc(t.ageCard(q.age))}</span>
            <span class="pill">${esc(shortStamp(q))}</span>
          </div>
        </div>
      </a>`;
    }

    function render() {
      const list = qs.filter(match);
      if (!list.length) {
        board.innerHTML = `<p class="empty">${t.emptyBoard}</p>`;
        return;
      }

      const groups = D.subjects
        .map((s, i) => ({ s, i, items: list.filter((q) => q.subject === s.id) }))
        .filter((g) => g.items.length)
        .sort((a, b) => (stampOf(a.items[0]) === stampOf(b.items[0]) ? a.i - b.i : stampOf(a.items[0]) < stampOf(b.items[0]) ? 1 : -1));

      const emptySubjects =
        subjectFilter === "all" && !keyword ? D.subjects.filter((s) => !qs.some((q) => q.subject === s.id)) : [];

      if (view === "time") {
        board.innerHTML = `<section class="subject" id="s-time">
          <div class="subject-head">
            <h2>${esc(t.timeHead)}</h2>
            <span class="count">${esc(t.count(list.length))}</span>
            <span class="about">${esc(t.timeAbout)}</span>
          </div>
          <div class="grid">${list.map(card).join("")}</div>
        </section>`;
        return;
      }

      board.innerHTML =
        groups
          .map(
            (g) => `<section class="subject" id="s-${g.s.id}" style="--c:${g.s.color}">
          <div class="subject-head">
            <h2>${g.s.emoji} ${esc(subjectOf(g.s.id).name)}</h2>
            <span class="count">${esc(t.count(g.items.length))}</span>
            <span class="about">${esc(subjectOf(g.s.id).about)}</span>
          </div>
          <div class="grid">${g.items.map(card).join("")}</div>
        </section>`
          )
          .join("") +
        (emptySubjects.length
          ? `<p class="waiting">${esc(t.waiting)}<span class="chips">${emptySubjects
              .map((s) => `<span class="chip">${s.emoji} ${esc(subjectOf(s.id).name)}</span>`)
              .join("")}</span></p>`
          : "");
    }

    const search = document.getElementById("search");
    if (search) {
      search.addEventListener("input", () => {
        keyword = search.value.trim();
        render();
      });
    }

    const viewBtn = document.getElementById("viewToggle");
    if (viewBtn) {
      viewBtn.textContent = t.viewTime;
      viewBtn.onclick = () => {
        view = view === "subject" ? "time" : "subject";
        viewBtn.textContent = view === "subject" ? t.viewTime : t.viewSubject;
        render();
      };
    }

    if (board) {
      const zoomFrom = (el) => {
        const z = el.closest && el.closest(".card-zoom");
        if (!z) return false;
        lightbox().open(z.dataset.src, z.dataset.alt);
        return true;
      };
      board.addEventListener("click", (e) => {
        if (zoomFrom(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      board.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && zoomFrom(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    paintChips();
    render();

    // 语言切换后整页重画
    return () => {
      if (search) search.value = keyword;
      paintChips();
      render();
    };
  }

  /* ---------- 详情页 ---------- */
  function renderQuestion() {
    const t = T();
    const root = document.getElementById("q");
    const id = new URLSearchParams(location.search).get("id");
    const idx = D.questions.findIndex((q) => q.id === id);

    if (idx < 0) {
      root.innerHTML = `<p class="empty">${esc(t.notFound)}<br><a class="back" href="index.html">${esc(t.back)}</a></p>`;
      return () => {};
    }

    const q = D.questions[idx];
    const prev = D.questions[idx - 1];
    const next = D.questions[idx + 1];
    const c = loc(q);
    const s = subjectOf(q.subject);
    const s2 = q.secondary ? subjectOf(q.secondary) : null;
    const k = kidOf(q.kid);

    document.title = `${c.question}${t.titleSuffix}`;

    const related = D.questions.filter((x) => x.id !== q.id && (x.subject === q.subject || x.secondary === q.subject)).slice(0, 3);

    root.innerHTML = `
      <div class="topbar">
        <a class="back" href="index.html">${esc(t.back)}</a>
        <button class="lang-toggle" type="button"></button>
      </div>

      <div class="byline" style="--c:${s.color}">
        <span>${k.emoji} ${esc(k.name)}</span><span class="sep">·</span>
        <span>${esc(t.age(q.age))}</span><span class="sep">·</span>
        <span>${fmtDate(q.date)}${q.time ? ` ${q.time}` : ""}</span><span class="sep">·</span>
        <span><i class="dot"></i>${esc(s.name)}${s2 ? ` / ${esc(s2.name)}` : ""}</span>
      </div>

      <p class="quote-label">${esc(t.quoteLabel(k.name))}</p>
      <h1 class="q-title">「${esc(c.question)}」</h1>

      ${
        c.figure
          ? `<figure class="figure">
        <img src="${esc(c.figure)}" alt="${esc(c.figureAlt || c.question)}">
        <figcaption>${esc(t.figCaption)}${esc(c.figureAlt || c.question)}</figcaption>
      </figure>`
          : ""
      }

      <div class="oneline" style="--c:${s.color}">
        <div class="label">${esc(t.oneLineLabel)}</div>
        <p>${esc(c.oneLine)}</p>
      </div>

      <h2 class="block-title">${esc(t.pointsTitle)}</h2>
      <ol class="points" style="--c:${s.color}">
        ${(c.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}
      </ol>

      ${c.followUp ? `<div class="followup"><b>${esc(t.followLabel)}</b>${esc(c.followUp)}</div>` : ""}

      <div class="related">
        <h3>${esc(t.relatedTitle)}</h3>
        <div class="related-list">
          ${
            related.length
              ? related.map((r) => `<a href="question.html?id=${encodeURIComponent(r.id)}">「${esc(loc(r).question)}」</a>`).join("")
              : `<p style="margin:0;padding:11px 0;font-size:14px;color:var(--muted)">${esc(t.relatedEmpty)}</p>`
          }
        </div>
      </div>

      <div class="pager">
        <span>${prev ? `<a href="question.html?id=${encodeURIComponent(prev.id)}">← ${esc(loc(prev).question)}</a>` : ""}</span>
        <span>${next ? `<a href="question.html?id=${encodeURIComponent(next.id)}">${esc(loc(next).question)} →</a>` : ""}</span>
      </div>
    `;

    const figImg = root.querySelector(".figure img");
    if (figImg) {
      const figEl = figImg.closest(".figure");
      figEl.classList.add("zoomable");
      const hint = document.createElement("span");
      hint.className = "zoom-hint";
      hint.textContent = t.zoomHint;
      figEl.appendChild(hint);
      figImg.addEventListener("click", () => lightbox().open(figImg.currentSrc || figImg.src, figImg.alt));
    }

    mountLangButtons(() => {
      renderQuestion();
      applyStatic();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyStatic();
    const page = document.body.dataset.page;
    if (page === "index") {
      const rerender = renderIndex();
      mountLangButtons(() => {
        rerender();
        applyStatic();
      });
    }
    if (page === "question") renderQuestion();
  });
})();
