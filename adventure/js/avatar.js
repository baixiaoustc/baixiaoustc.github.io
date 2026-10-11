/* ============================================================
 * 骰子大冒险 · 头像
 *
 * 兔子 🐰、藏狐 🦊、小鸡 🐤 的 emoji 本身就是「一个头」，雪豹没有这样的 emoji
 * （🐆 是全身像，放到棋盘上比其他三只大一圈、也不是一个头），
 * 所以雪豹的头像是自己画的图片 adventure/img/snowleopard.svg。
 *
 * 这里只做一件事：把「某个小动物」变成界面上的一个节点。
 *   - 有 avatar 图片的 → <img class="avatar-img">
 *   - 其它 → 还是原来的 emoji 文字
 * 图片加载失败会自动退回 emoji，不会出现一个破图。
 *
 * 依赖 config.js（ANIMALS / ANIMAL_ORDER），要在 ui.js / setup.js 之前加载。
 * ============================================================ */

const AdventureAvatar = (function () {
  /* 有自己头像图片的小动物 */
  function withAvatar() {
    return ANIMAL_ORDER.filter(id => ANIMALS[id] && ANIMALS[id].avatar);
  }

  function textSpan(cls, text, title) {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text;
    if (title) span.title = title;
    return span;
  }

  /* 一个小动物的头像节点：图片或 emoji，两种情况下 class 都一样，方便 CSS 统一定尺寸 */
  function node(id, cls) {
    const animal = ANIMALS[id];
    if (!animal) return null;

    if (!animal.avatar) return textSpan(cls, animal.icon, animal.name);

    const img = document.createElement('img');
    img.className = (cls ? cls + ' ' : '') + 'avatar-img';
    img.src = animal.avatar;
    img.alt = '';
    img.title = animal.name;
    img.draggable = false;
    img.addEventListener('error', function () {
      // 图没加载出来（比如断网）就退回 emoji，总比一块空白强
      const back = textSpan(cls, animal.icon, animal.name);
      if (img.parentNode && typeof img.parentNode.replaceChild === 'function') {
        img.parentNode.replaceChild(back, img);
      }
    });
    return img;
  }

  /* 把一段带 emoji 的文案写进元素：碰到「有头像图」的小动物就换成图片。
     其余文字包在 span 里（小朋友浏览器都一样，但这样测试里的迷你 DOM 也跑得动）。 */
  function setText(el, text) {
    if (!el) return;
    const plain = text == null ? '' : String(text);
    const list = withAvatar();

    const parts = [];
    let rest = plain;
    let hitAny = false;

    while (rest) {
      let hit = null;
      list.forEach(id => {
        const icon = ANIMALS[id].icon;
        const at = rest.indexOf(icon);
        if (at >= 0 && (!hit || at < hit.at)) hit = { at: at, id: id, len: icon.length };
      });
      if (!hit || hit.len <= 0) break;   // 兜底：图标不该是空串，免得死循环
      hitAny = true;
      if (hit.at > 0) parts.push({ text: rest.slice(0, hit.at) });
      parts.push({ id: hit.id });
      rest = rest.slice(hit.at + hit.len);
    }

    if (!hitAny) {                      // 大部分文案里没有雪豹，原样写进去最省事
      el.textContent = plain;
      return;
    }
    if (rest) parts.push({ text: rest });

    el.textContent = '';

    parts.forEach(part => {
      const child = part.id ? node(part.id, 'avatar-inline') : textSpan('', part.text);
      if (child) el.appendChild(child);
    });
  }

  return { node: node, setText: setText, withAvatar: withAvatar };
})();
