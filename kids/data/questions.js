/**
 * 小问号博物馆 · 数据源
 *
 * 加一个新问题 = 在这里复制一个对象 + 在 assets/figures/ 放一张 SVG 图解。
 * 字段说明见 README.md。
 */
window.KQ = {
  kids: [
    { id: "yumi", name: "玉米", emoji: "🌽", note: "大女儿 · 2017 年生" },
    { id: "taozi", name: "桃子", emoji: "🍑", note: "小女儿 · 2022 年生" }
  ],

  subjects: [
    { id: "nature", name: "自然科学", emoji: "🌱", color: "#06D6A0", about: "动物、植物、天气、身体外面的大世界" },
    { id: "math", name: "数学与逻辑", emoji: "🔢", color: "#4EC5F1", about: "数、比较、因果、如果……会怎样" },
    { id: "society", name: "社会与经济", emoji: "🏙️", color: "#A78BFA", about: "钱、规则、公平、大家一起怎么过日子" },
    { id: "tech", name: "技术工具", emoji: "🔧", color: "#FFB347", about: "电脑、手机、插件、怎么把一件事做成" },
    { id: "life", name: "生命与健康", emoji: "❤️", color: "#FF7A7A", about: "身体、吃进去的东西、生病和保护自己" },
    { id: "daily", name: "生活常识", emoji: "🍚", color: "#FFD166", about: "吃穿住行、时间、爸爸妈妈的小时候" }
  ],

  questions: [
    {
      id: "crab-gender",
      date: "2026-10-06",
      kid: "yumi",
      age: 9,
      question: "螃蟹怎么分公母？",
      subject: "nature",
      secondary: "life",
      depth: 1,
      figure: "assets/figures/crab.svg",
      figureAlt: "两只螃蟹翻过来的肚子：母蟹是圆脐，公蟹是尖脐",
      oneLine: "把螃蟹翻过来看肚子：圆肚子（圆脐）是母蟹，尖肚子（尖脐）是公蟹。",
      points: [
        "螃蟹肚子下面有一片能翻开的「盖子」，叫蟹脐，那是它藏尾巴的地方。",
        "母蟹要抱着一肚子卵宝宝，所以脐又圆又宽，像个小围裙。",
        "公蟹的脐是尖的、窄的，像个小三角。"
      ],
      followUp: "那为什么菜市场的母蟹常常更贵？（因为有蟹黄——那是它抱卵前的卵巢，一年里只有一阵子最满。）",
      source: "2026-10-06 玉米"
    },
    {
      id: "insurance-profit",
      date: "2026-10-06",
      kid: "yumi",
      age: 9,
      question: "保险公司赔保险，怎么还能赚钱？",
      subject: "society",
      secondary: "math",
      depth: 3,
      figure: "assets/figures/insurance.svg",
      figureAlt: "很多人往一个大池子里投硬币，少数人从池子里领钱",
      oneLine: "很多人各交一点点钱，攒成一个大池子；真正出事要赔的只是少数人，剩下的钱付成本，剩下才是赚的。",
      points: [
        "一万个人各交 100 元，池子里就有 100 万元。",
        "这一年真正出事来领钱的，也许只有几十个人。",
        "剩下的钱要付工资、房租、税，还要留一大笔准备着下一年赔；赔得比收得多，保险公司就会亏。所以他们要算得很准。"
      ],
      followUp: "为什么每个人的车险价钱不一样？（开车的人不一样、车不一样，出事的可能就不一样，这叫「风险不同」。）",
      source: "2026-10-06 玉米"
    },
    {
      id: "eighty-toys",
      date: "2026-10-06",
      kid: "yumi",
      age: 9,
      question: "你们小时候有什么玩的？",
      subject: "daily",
      secondary: "society",
      depth: 1,
      figure: "assets/figures/toys.svg",
      figureAlt: "铁环、毽子、沙包三样老玩具，和一块平板电脑",
      oneLine: "没有手机和平板，玩的东西都是「动手做 + 出门跑」：铁环、毽子、沙包、跳皮筋、弹珠、拍画片。",
      points: [
        "玩具多半很便宜，有的是自己做的：沙包是妈妈用布缝的，毽子用铜钱和鸡毛扎。",
        "玩伴就是整条街的小孩，喊一嗓子就凑齐一队。",
        "天黑才回家，大人靠嗓门在楼下喊吃饭。"
      ],
      followUp: "那为什么那时候拍的照片特别少？（一卷胶卷只能拍 36 张，还要花钱洗出来。）",
      source: "2026-10-06 玉米"
    },
    {
      id: "canteen-dumpling",
      date: "2026-10-07",
      kid: "yumi",
      age: 9,
      question: "为什么学校食堂不做圆子和水饺？",
      subject: "society",
      secondary: "daily",
      depth: 2,
      figure: "assets/figures/canteen.svg",
      figureAlt: "左边一个个包饺子很慢，右边一大锅菜很快",
      oneLine: "因为要一次喂饱几百个人：圆子和水饺只能一个一个包，太慢；大锅菜能一次做很多。",
      points: [
        "时间短：午饭只有几十分钟，几百人排队。",
        "人手少：包一顿水饺要好几个人忙一上午，包完还得煮好几锅。",
        "安全和成本：一大锅菜更容易保证熟透、够热，同样的钱也能买到更多营养。"
      ],
      followUp: "那为什么过年家里就要包饺子？（人少、有闲、还图个一家人围在一起的热闹。）",
      source: "2026-10-07 玉米"
    },
    {
      id: "copy-image-wps",
      date: "2026-10-10",
      kid: "yumi",
      age: 9,
      question: "电脑上怎么把图片复制到 WPS 里面？",
      subject: "tech",
      depth: 3,
      figure: "assets/figures/copy-paste.svg",
      figureAlt: "三步：找到图片、按 Ctrl+C 复制、到 WPS 按 Ctrl+V 粘贴",
      oneLine: "三步：找到图片 → 按 Ctrl+C 复制 → 在 WPS 里按 Ctrl+V 粘贴。",
      points: [
        "图片在文件夹里：点一下选中它，按 Ctrl+C。",
        "图片在网页上：在图片上点右键，选「复制图片」。",
        "到 WPS 里点一下要放的位置，按 Ctrl+V。手机上对应的是长按「复制」和长按「粘贴」。"
      ],
      followUp: "Ctrl+X 是「剪切」：搬走，原来那份没了。另外，把图片文件直接拖进 WPS 窗口也行。",
      source: "2026-10-10 玉米"
    },
    {
      id: "what-is-plugin",
      date: "2026-10-11",
      kid: "yumi",
      age: 9,
      question: "什么是插件？是不是像电脑的 U 盘一样？",
      subject: "tech",
      depth: 1,
      figure: "assets/figures/plugin.svg",
      figureAlt: "U 盘装的是东西，插件像插头，插上就多一种本领",
      oneLine: "插件像给软件多插一个「本领插头」：插上去就多会一样本事，不用换掉整个软件。",
      points: [
        "U 盘装的是「东西」（照片、文件）；插件装的是「本领」。",
        "它插在一个已经有的软件身上。比如浏览器装了挡广告插件，就多了挡广告的本领。",
        "不用了拔掉就行，原来的软件还在，只是少了那一样本领。"
      ],
      followUp: "那插件会不会让电脑变慢？（会占一点内存，装太多会拖慢——和书包塞太多东西一个道理。）",
      source: "2026-10-11 玉米"
    },
    {
      id: "mosquito-itch",
      date: "2026-10-12",
      kid: "yumi",
      age: 9,
      question: "蚊子咬了之后，为什么会痒？",
      subject: "life",
      secondary: "nature",
      depth: 2,
      figure: "assets/figures/mosquito.svg",
      figureAlt: "蚊子在皮肤上吸血吐口水，身体的卫士释放组胺，让皮肤起包、让神经觉得痒",
      oneLine: "不是蚊子咬得痒，是你自己的「小卫士」在打架：它们放出一种叫组胺的东西，让皮肤起包、让神经觉得痒。",
      points: [
        "蚊子吸血前会先吐一点口水，防止血凝固堵住它的吸管。",
        "身体把这个口水当成敌人，派免疫细胞来处理，顺手放出「组胺」。",
        "组胺让那里的血管变宽（鼓成包），又刺激神经（发痒）。你越抓，它放得越多，所以越抓越痒。"
      ],
      followUp: "为什么有的小朋友被咬后肿得更大？涂点凉凉的为什么舒服些？（冰一冰，神经就不那么容易被「点着」。）",
      source: "2026-10-12 玉米"
    },
    {
      id: "orange-pill",
      date: "2026-10-12",
      kid: "taozi",
      age: 4,
      question: "早上吃的那个橘红色的是什么？",
      subject: "life",
      secondary: "daily",
      depth: 1,
      figure: "assets/figures/fishoil.svg",
      figureAlt: "一颗橘红色的小胶囊，里面是给大脑和眼睛用的 DHA",
      oneLine: "那是鱼油 DHA 的小胶囊，橙红色的；里面的 DHA 是大脑和眼睛的「建筑材料」。",
      points: [
        "它不是糖，是营养补充，一次吃一颗就够。",
        "DHA 来自深海鱼，摸起来软软的、亮亮的。",
        "大脑和眼睛要长好，需要一点这样的材料；但好好吃饭比吃胶囊更重要。"
      ],
      followUp: "为什么它是橙红色的？（一是好认，二是鱼油怕光怕坏，颜色和外壳都在保护它。）",
      source: "2026-10-12 桃子"
    }
  ]
};
