#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""骰子大冒险 · 雪豹头像离线核对（开发用小工具，不进网站）

沙盒里跑不了 Chrome/QuickLook，看不见渲染结果，所以这里用 PIL 把
adventure/img/snowleopard.svg 里用到的那几个图元（ellipse / circle /
polygon / line / g 继承）重新画一遍，然后做几件「眼睛能看但脚本也能判」的事：

  1. 左右对称：把图水平翻转，看两半差多少（雪豹是正脸，必须对称）
  2. 留白比例：墨迹占画布多少，和 🐰🦊🐤 三张脸对比（太瘦/太胖都能看出来）
  3. 缩小后还认得吗：缩到棋子大小（约 32px）再放大回来，数一数眼睛、鼻子还在不在
  4. 生成对照图 docs/_preview/avatar-compare.png：雪豹头像和另外三张 emoji 脸并排

用法：python3 docs/adv-avatar-preview.py
"""

import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SVG = os.path.join(ROOT, 'adventure', 'img', 'snowleopard.svg')
OUT_DIR = os.path.join(HERE, '_preview')
EMOJI_FONT = '/System/Library/Fonts/Apple Color Emoji.ttc'
SCALE = 10                      # 先放大 10 倍画，再缩回来当抗锯齿
NUM = r'(-?\d+(?:\.\d+)?)'

PROPS = ('fill', 'stroke', 'stroke-width', 'opacity', 'stroke-linecap')


# ---------------------------------------------------------------- 解析 SVG

def _attrs(chunk):
    out = {}
    for m in re.finditer(r'([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"', chunk):
        out[m.group(1)] = m.group(2)
    return out


def parse_svg(text):
    """返回 [{tag, attrs(含继承)}]，顺序即绘制顺序（后画的盖住先画的）"""
    token = re.compile(r'<g([^>]*)>|</g>|<(ellipse|circle|polygon|line)([^>]*)/?>', re.S)
    shapes = []
    stack = [{}]
    for m in token.finditer(text):
        if m.group(0) == '</g>':
            if len(stack) > 1:
                stack.pop()
        elif m.group(1) is not None:                     # <g ...>
            inherit = dict(stack[-1])
            inherit.update(_attrs(m.group(1)))
            stack.append(inherit)
        else:                                            # 图元
            attrs = dict(stack[-1])
            attrs.update(_attrs(m.group(3)))
            shapes.append({'tag': m.group(2), 'attrs': attrs})
    return shapes


def color(v, default=None):
    if not v or v == 'none':
        return None
    v = v.strip()
    if v.startswith('#'):
        v = v[1:]
        if len(v) == 3:
            v = ''.join(c * 2 for c in v)
        return tuple(int(v[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
    return default


def draw_shape(d, shape, k):
    a = shape['attrs']
    fill = color(a.get('fill'))
    stroke = color(a.get('stroke'))
    sw = float(a.get('stroke-width', 1) or 1) * k
    if sw <= 0:
        stroke = None
    tag = shape['tag']
    if tag == 'ellipse':
        cx, cy = float(a['cx']) * k, float(a['cy']) * k
        rx, ry = float(a['rx']) * k, float(a['ry']) * k
        box = [cx - rx, cy - ry, cx + rx, cy + ry]
        d.ellipse(box, fill=fill, outline=stroke, width=max(1, round(sw)) if stroke else 0)
    elif tag == 'circle':
        cx, cy, r = float(a['cx']) * k, float(a['cy']) * k, float(a['r']) * k
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill,
                  outline=stroke, width=max(1, round(sw)) if stroke else 0)
    elif tag == 'polygon':
        pts = [(float(x) * k, float(y) * k)
               for x, y in re.findall(NUM + r'\s*,\s*' + NUM, a['points'])]
        d.polygon(pts, fill=fill, outline=stroke)
        if stroke and sw > 2:
            d.line(pts + [pts[0]], fill=stroke, width=round(sw), joint='curve')
    elif tag == 'line':
        d.line([float(a['x1']) * k, float(a['y1']) * k,
                float(a['x2']) * k, float(a['y2']) * k],
               fill=stroke or (0, 0, 0, 255), width=max(1, round(sw)))


def render(shapes, size, bg=(255, 255, 255, 255)):
    k = SCALE
    big = Image.new('RGBA', (100 * k, 100 * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    for s in shapes:
        draw_shape(d, s, k)
    small = big.resize((size, size), Image.LANCZOS)
    if bg is not None:
        plate = Image.new('RGBA', (size, size), bg)
        plate.alpha_composite(small)
        return plate
    return small


# ---------------------------------------------------------------- 检查

def ink_mask(img, bg=(255, 255, 255)):
    """把「明显不是背景」的像素挑出来"""
    px = img.convert('RGB').load()
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    m = mask.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > 30:
                m[x, y] = 255
    return mask


def main():
    text = open(SVG, encoding='utf-8').read()
    shapes = parse_svg(text)
    os.makedirs(OUT_DIR, exist_ok=True)

    fail = 0
    print('雪豹头像自检 · %s' % os.path.relpath(SVG, ROOT))
    print('图元 %d 个' % len(shapes))

    # 1) 左右对称
    a400 = render(shapes, 400)
    mirror = a400.transpose(Image.FLIP_LEFT_RIGHT)
    diff = [abs(p - q) for p, q in zip(a400.convert('L').tobytes(), mirror.convert('L').tobytes())]
    mean_diff = sum(diff) / len(diff)
    ok = mean_diff < 3.0
    fail += 0 if ok else 1
    print('%s 左右对称（翻转后平均差 %.2f/255，要求 < 3）' % ('✓' if ok else '✗', mean_diff))

    # 2) 留白比例，和 emoji 脸对比
    mine = ink_mask(a400).histogram()[255] / (400 * 400)
    faces = {}
    if os.path.exists(EMOJI_FONT):
        for ch, name in (('🐰', '兔子'), ('🦊', '藏狐'), ('🐤', '小鸡')):
            im = Image.new('RGBA', (160, 160), (255, 255, 255, 255))
            ImageDraw.Draw(im).text((0, -10), ch, font=ImageFont.truetype(EMOJI_FONT, 160),
                                    embedded_color=True)
            faces[name] = ink_mask(im).histogram()[255] / (160 * 160)
    lo, hi = (min(faces.values()), max(faces.values())) if faces else (0.49, 0.62)
    ok = (lo - 0.12) <= mine <= (hi + 0.12)
    fail += 0 if ok else 1
    print('%s 墨迹占 %.1f%%（三张 emoji 脸 %.1f%%~%.1f%%，允许上下浮动 12 个点）'
          % ('✓' if ok else '✗', mine * 100, lo * 100, hi * 100))

    # 3) 缩到棋子大小还认得吗：眼睛/鼻子这些深色特征还在不在
    for size in (32, 24):
        small = render(shapes, size, bg=None)
        alpha = small.split()[-1]
        rgb = small.convert('RGB')
        dark = sum(1 for (r, g, b), al in zip(rgb.getdata(), alpha.getdata())
                   if al > 120 and r + g + b < 330)
        ok = dark >= 4
        fail += 0 if ok else 1
        print('%s 缩到 %dpx 后深色特征（眼睛/瞳孔/斑）还有 %d 个像素'
              % ('✓' if ok else '✗', size, dark))

    # 4) 对照图，给人眼看
    if faces:
        tile = 160
        strip = Image.new('RGBA', (tile * 5, tile), (255, 255, 255, 255))
        for i, (ch, _) in enumerate((('🐰', 0), ('🦊', 0), ('🐤', 0), ('🐆', 0))):
            glyph = Image.new('RGBA', (tile, tile), (0, 0, 0, 0))
            ImageDraw.Draw(glyph).text((0, -10), ch, font=ImageFont.truetype(EMOJI_FONT, 160),
                                       embedded_color=True)
            strip.alpha_composite(glyph, (i * tile, 0))
        strip.alpha_composite(render(shapes, tile, bg=None), (tile * 4, 0))
        path = os.path.join(OUT_DIR, 'avatar-compare.png')
        strip.convert('RGB').save(path)
        print('对照图：%s（左起 兔子 / 藏狐 / 小鸡 / 雪豹emoji / 新头像）' % os.path.relpath(path, ROOT))

    print('结论：%s' % ('全部通过' if fail == 0 else '有 %d 项没过' % fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
