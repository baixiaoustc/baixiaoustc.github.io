/* 小问号博物馆 · 前端渲染
   数据来自 data/questions.js（window.KQ），不需要构建、不需要后端。 */

(function () {
  const D = window.KQ;
  if (!D) {
    document.body.innerHTML = '<p style="padding:40px">数据没加载上：data/questions.js 没找到。</p>';
    return;
  }

  const subjectOf = (id) => D.subjects.find((s) => s.id === id) || { id, name: id, emoji: "❓", color: "#FFD166", about: "" };
  const kidOf = (id) => D.kids.find((k) => k.id === id) || { id, name: id, emoji: "🙂" };

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 2026-10-06 -> 2026 年 10 月 6 日
  const cnDate = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ""));
    if (!m) return esc(d);
    return `${m[1]} 年 ${Number(m[2])} 月 ${Number(m[3])} 日`;
  };

  /* ---------- 图片全屏查看（点图放大） ---------- */
  let lbInstance = null;
  function lightbox() {
    if (lbInstance) return lbInstance;
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `<button class="lb-close" type="button" aria-label="关闭">✕</button><img alt="">`;
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

    // 点图片：在「适应屏幕」与「放大」之间切换；点背景 / ✕ / Esc：关闭
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
    const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);
    const qs = [...D.questions].sort(byDateDesc);

    const usedSubjects = D.subjects.filter((s) => qs.some((q) => q.subject === s.id || q.secondary === s.id));
    const primarySubjects = D.subjects.filter((s) => qs.some((q) => q.subject === s.id));

    // 顶部统计：一行字，不抢眼
    const stats = document.getElementById("stats");
    if (stats) {
      stats.innerHTML =
        `<span>${qs.length} 个问题</span>` +
        `<span>${D.kids.length} 位小问号</span>` +
        `<span>${primarySubjects.length} 个学科</span>` +
        `<span>最近更新 ${esc(qs[0] ? qs[0].date : "—")}</span>`;
    }

    // 筛选条
    let kidFilter = "all";
    let subjectFilter = "all";
    let keyword = "";

    const kidChips = document.getElementById("kidChips");
    const subjectChips = document.getElementById("subjectChips");

    const chip = (label, on) =>
      `<button class="chip${on ? " on" : ""}" type="button">${label}</button>`;

    function paintChips() {
      kidChips.innerHTML =
        chip("全部", kidFilter === "all") +
        D.kids.map((k) => chip(`${k.emoji} ${esc(k.name)}`, kidFilter === k.id)).join("");

      subjectChips.innerHTML =
        chip("全部学科", subjectFilter === "all") +
        usedSubjects.map((s) => chip(`${s.emoji} ${esc(s.name)}`, subjectFilter === s.id)).join("");

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
      const hay = [q.question, q.oneLine, q.followUp, (q.points || []).join(" "), subjectOf(q.subject).name, subjectOf(q.secondary).name, kidOf(q.kid).name]
        .join(" ")
        .toLowerCase();
      return hay.includes(keyword.toLowerCase());
    }

    const board = document.getElementById("board");

    function card(q) {
      const s = subjectOf(q.subject);
      const k = kidOf(q.kid);
      return `<a class="card" href="question.html?id=${encodeURIComponent(q.id)}" style="--c:${s.color}">
        ${
          q.figure
            ? `<div class="card-fig"><img src="${esc(q.figure)}" alt="${esc(q.figureAlt || q.question)}" loading="lazy"><span class="card-zoom" role="button" tabindex="0" aria-label="放大看这张图" data-src="${esc(q.figure)}" data-alt="${esc(q.figureAlt || q.question)}">🔍</span></div>`
            : `<div class="card-fig card-fig-soon" aria-hidden="true"><span>${s.emoji}</span></div>`
        }
        <div class="card-body">
          <p class="q">${esc(q.question)}</p>
          <p class="ans">${esc(q.oneLine)}</p>
          <div class="meta">
            <span class="pill">${k.emoji} ${esc(k.name)}</span>
            <span class="pill">${q.age} 岁</span>
            <span class="pill">${esc(q.date)}</span>
          </div>
        </div>
      </a>`;
    }

    function render() {
      const list = qs.filter(match);
      if (!list.length) {
        board.innerHTML = `<p class="empty">没有找到这样的问题 🌱<br>换个词试试，比如「螃蟹」「蚊子」「插件」。</p>`;
        return;
      }
      // 按学科分组
      const groups = D.subjects
        .map((s) => ({ s, items: list.filter((q) => q.subject === s.id) }))
        .filter((g) => g.items.length);
      // 有副学科的、主学科没有的，也归到主学科分组里（上面已按 subject 归，这里补一眼提示）
      const emptySubjects =
        subjectFilter === "all" && !keyword
          ? D.subjects.filter((s) => !qs.some((q) => q.subject === s.id))
          : [];

      board.innerHTML =
        groups
          .map(
            (g) => `<section class="subject" id="s-${g.s.id}" style="--c:${g.s.color}">
          <div class="subject-head">
            <h2>${g.s.emoji} ${esc(g.s.name)}</h2>
            <span class="count">${g.items.length} 个问题</span>
            <span class="about">${esc(g.s.about)}</span>
          </div>
          <div class="grid">${g.items.map(card).join("")}</div>
        </section>`
          )
          .join("") +
        (emptySubjects.length
          ? `<p class="waiting">还等着第一个问题的学科：<span class="chips">${emptySubjects
                .map((s) => `<span class="chip">${s.emoji} ${esc(s.name)}</span>`)
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

    // 卡片右上角的 🔍：只放大看图，不进详情页
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
  }

  /* ---------- 详情页 ---------- */
  function renderQuestion() {
    const root = document.getElementById("q");
    const id = new URLSearchParams(location.search).get("id");
    const idx = D.questions.findIndex((q) => q.id === id);

    if (idx < 0) {
      root.innerHTML = `<p class="empty">没找到这个问题。<br><a class="back" href="index.html">← 回到博物馆首页</a></p>`;
      return;
    }

    const q = D.questions[idx];
    const prev = D.questions[idx - 1];
    const next = D.questions[idx + 1];
    const s = subjectOf(q.subject);
    const s2 = q.secondary ? subjectOf(q.secondary) : null;
    const k = kidOf(q.kid);

    document.title = `${q.question} · 小问号博物馆`;

    const related = D.questions
      .filter((x) => x.id !== q.id && (x.subject === q.subject || x.secondary === q.subject))
      .slice(0, 3);

    root.innerHTML = `
      <a class="back" href="index.html">← 回到博物馆首页</a>

      <div class="byline" style="--c:${s.color}">
        <span>${k.emoji} ${esc(k.name)}</span><span class="sep">·</span>
        <span>${q.age} 岁</span><span class="sep">·</span>
        <span>${cnDate(q.date)}</span><span class="sep">·</span>
        <span><i class="dot"></i>${esc(s.name)}${s2 ? ` / ${esc(s2.name)}` : ""}</span>
      </div>

      <p class="quote-label">${esc(k.name)}当时的原话</p>
      <h1 class="q-title">「${esc(q.question)}」</h1>

      ${
        q.figure
          ? `<figure class="figure">
        <img src="${esc(q.figure)}" alt="${esc(q.figureAlt || q.question)}">
        <figcaption>一眼看懂：${esc(q.figureAlt || q.question)}</figcaption>
      </figure>`
          : ''
      }

      <div class="oneline" style="--c:${s.color}">
        <div class="label">一句话答案</div>
        <p>${esc(q.oneLine)}</p>
      </div>

      <h2 class="block-title">三句话说清楚</h2>
      <ol class="points" style="--c:${s.color}">
        ${(q.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}
      </ol>

      ${
        q.followUp
          ? `<div class="followup"><b>还可以接着问：</b>${esc(q.followUp)}</div>`
          : ""
      }

      <div class="related">
        <h3>同一学科的问题</h3>
        <div class="related-list">
          ${
            related.length
              ? related.map((r) => `<a href="question.html?id=${encodeURIComponent(r.id)}">「${esc(r.question)}」</a>`).join("")
              : `<p style="margin:0;padding:11px 0;font-size:14px;color:var(--muted)">这个学科还在等第二个问题。</p>`
          }
        </div>
      </div>

      <div class="pager">
        <span>${prev ? `<a href="question.html?id=${encodeURIComponent(prev.id)}">← ${esc(prev.question)}</a>` : ""}</span>
        <span>${next ? `<a href="question.html?id=${encodeURIComponent(next.id)}">${esc(next.question)} →</a>` : ""}</span>
      </div>
    `;

    // 点图片全屏查看
    const figImg = root.querySelector(".figure img");
    if (figImg) {
      const figEl = figImg.closest(".figure");
      figEl.classList.add("zoomable");
      const hint = document.createElement("span");
      hint.className = "zoom-hint";
      hint.textContent = "🔍 点击放大";
      figEl.appendChild(hint);
      figImg.addEventListener("click", () => lightbox().open(figImg.currentSrc || figImg.src, figImg.alt));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "index") renderIndex();
    if (page === "question") renderQuestion();
  });
})();
