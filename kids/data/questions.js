/**
 * 小问号博物馆 · 数据源（自动生成，别手改）
 *
 * 事实源是 data/questions.json。改数据请用：
 *   node tools/capture.mjs "玉米今天问：…"     # 秒级入库
 *   node tools/publish.mjs < draft.json        # 补内容并合入
 *   node tools/build.mjs                       # 重新生成这个文件
 */
window.KQ = {
  "kids": [
    {
      "id": "yumi",
      "name": "玉米",
      "nameEn": "Yumi",
      "emoji": "🌽",
      "note": "大女儿 · 2017 年生",
      "noteEn": "Older daughter · born 2017"
    },
    {
      "id": "taozi",
      "name": "桃子",
      "nameEn": "Taozi",
      "emoji": "🍑",
      "note": "小女儿 · 2022 年生",
      "noteEn": "Younger daughter · born 2022"
    }
  ],
  "subjects": [
    {
      "id": "nature",
      "name": "自然科学",
      "nameEn": "Nature",
      "emoji": "🌱",
      "color": "#06D6A0",
      "about": "动物、植物、天气、身体外面的大世界",
      "aboutEn": "Animals, plants, weather — the big world outside our bodies"
    },
    {
      "id": "math",
      "name": "数学逻辑",
      "nameEn": "Math & Logic",
      "emoji": "🔢",
      "color": "#4EC5F1",
      "about": "数、比较、因果、如果……会怎样",
      "aboutEn": "Numbers, comparisons, cause and effect, what if…"
    },
    {
      "id": "society",
      "name": "社会经济",
      "nameEn": "Society & Money",
      "emoji": "🏙️",
      "color": "#A78BFA",
      "about": "钱、规则、公平、大家一起怎么过日子",
      "aboutEn": "Money, rules, fairness — how people live together"
    },
    {
      "id": "tech",
      "name": "技术工具",
      "nameEn": "Tech & Tools",
      "emoji": "🔧",
      "color": "#FFB347",
      "about": "电脑、手机、插件、怎么把一件事做成",
      "aboutEn": "Computers, phones, plugins — how to get a thing done"
    },
    {
      "id": "life",
      "name": "生命健康",
      "nameEn": "Body & Health",
      "emoji": "❤️",
      "color": "#FF7A7A",
      "about": "身体、吃进去的东西、生病和保护自己",
      "aboutEn": "Your body, what goes into it, staying safe"
    },
    {
      "id": "daily",
      "name": "生活常识",
      "nameEn": "Everyday Life",
      "emoji": "🍚",
      "color": "#FFD166",
      "about": "吃穿住行、时间、爸爸妈妈的小时候",
      "aboutEn": "Food, clothes, home, time, and when Mum and Dad were little"
    },
    {
      "id": "story",
      "name": "故事想象",
      "nameEn": "Stories & Imagination",
      "emoji": "🎬",
      "color": "#FF9BC0",
      "about": "电影、故事、角色，还有那些还没发生的事",
      "aboutEn": "Films, stories, characters, and things not yet happened"
    }
  ],
  "questions": [
    {
      "id": "recycler",
      "date": "2026-11-07",
      "kid": "yumi",
      "question": "收废品的他怎么可以赚钱？",
      "subject": "society",
      "secondary": "math",
      "depth": 3,
      "figure": "assets/figures/recycler.svg",
      "figureAlt": "流程图：家里和小区里要扔的旧纸箱、空瓶子、旧家电，收废品的人按很低的价按斤收走，再按纸、塑料、金属分开，压成一大包，按吨卖给造纸厂、塑料厂、铝厂和钢厂；他赚的是收进价和卖出价之间的差价，靠的是把很多家的一点点攒成一大车",
      "oneLine": "他赚的是「收进来的价」和「卖出去的价」之间的差价：你嫌麻烦要扔的东西，到他手里就是工厂要的原料。",
      "points": [
        "纸箱、空瓶子、旧家电在你手里是要扔的垃圾，在收废品的人手里是原料。他按斤、用很低的价收走——这么便宜，是因为你只想把它们清出去。",
        "最值钱的一步是分开：纸归纸、塑料归塑料、铝归铝、铁归铁。混成一堆谁也不收；分开了，每一种都有工厂抢着要，价钱能差好几倍。这就是他的「加工」。",
        "攒够了他就压成一大包，按吨卖给造纸厂、塑料厂、铝厂和钢厂：废纸打成浆做新纸箱，废塑料熔成颗粒做桶和衣架，废铝回炉变铝锭。卖出的钱减去收进的钱，就是他的收入；一车越大、分得越干净，赚得越多。"
      ],
      "followUp": "那我们把旧纸箱直接扔了，为什么就不值钱了？",
      "source": "2026-11-07 玉米",
      "en": {
        "question": "How does the scrap collector make money?",
        "oneLine": "He earns the difference between the low price he pays and the price the factories pay him: what you want to throw away is raw material to him.",
        "points": [
          "To you, cardboard boxes, empty bottles and old appliances are rubbish to get rid of; to the scrap collector they are raw material. He buys them by weight at a very low price — so cheap because all you want is to clear them out.",
          "The valuable step is sorting: paper with paper, plastic with plastic, aluminium with aluminium, iron with iron. Piled together nobody wants them; sorted, each kind has a factory eager to buy, at prices several times higher. That sorting is his real 'processing'.",
          "When he has enough he bales it and sells it by the tonne to paper mills, plastics plants, aluminium smelters and steel works: waste paper is pulped into new boxes, waste plastic melted into pellets for buckets and coat hangers, aluminium remelted into ingots. What he sells for minus what he paid is his income — a bigger load and cleaner sorting means more money."
        ],
        "followUp": "Then why is the cardboard we throw away worth nothing?",
        "figureAlt": "A flow diagram: cardboard boxes, empty bottles and old appliances that a household or neighbourhood wants to throw away are bought by weight at a very low price by the scrap collector, who then sorts them into paper, plastic and metal, bales them into one big pack and sells them by the tonne to paper mills, plastics plants, aluminium smelters and steel works; he earns the gap between the buying price and the selling price by collecting many households' small piles into one big truckload"
      },
      "figureEn": "assets/figures/en/recycler.svg",
      "age": 9,
      "time": "11:05:16"
    },
    {
      "id": "human-origin",
      "date": "2026-11-06",
      "kid": "taozi",
      "age": 4,
      "question": "为什么以前没有人，现在有人了？",
      "subject": "nature",
      "secondary": "story",
      "depth": 3,
      "figure": "assets/figures/human-origin.svg",
      "figureAlt": "三段图解：很久以前地球上有植物、鱼和恐龙，还没有人；我们的祖先长得像猴子，慢慢学会站着走、用石头；现在的人会说话、用火、写字",
      "oneLine": "以前真的没有人。我们不是一下子冒出来的，是一代一代慢慢变来的，变了几百万年。",
      "points": [
        "地球先有植物、鱼和恐龙。很久很久以后，才出现我们的祖先——它们长得像猴子，会用手抓东西、会用石头。",
        "它们的孩子、孩子的孩子……每一代都变那么一点点：站得更直一点、脑袋更大一点、会用火、会说话。",
        "这么多「一点点」攒了几百万年，才变成现在的人。所以不是某一天突然冒出一个人，是慢慢来的。"
      ],
      "followUp": "那现在的猴子，为什么没有变成人？",
      "source": "2026-11-06 桃子",
      "time": "08:58:55",
      "en": {
        "question": "Why were there no people before, but now there are?",
        "oneLine": "There really were no people before. We did not pop up all at once — we changed bit by bit, over millions of years.",
        "points": [
          "First there were plants, fish and dinosaurs. Only much, much later came our ancestors: they looked like apes and could grip things with their hands and use stones.",
          "Their children, and their children's children… each generation changed a tiny bit: standing a little straighter, a bigger brain, using fire, talking.",
          "All those tiny changes piled up over millions of years and became the people we are now. So nobody appeared on some single day — it happened slowly."
        ],
        "followUp": "Then why don't today's apes turn into people?",
        "figureAlt": "Three panels: long ago the Earth had plants, fish and dinosaurs but no people; our ancestors looked like apes and slowly learned to stand up and use stones; people today talk, use fire and write"
      },
      "figureEn": "assets/figures/en/human-origin.svg"
    },
    {
      "id": "securities-firm",
      "date": "2026-11-05",
      "kid": "yumi",
      "age": 9,
      "question": "证券公司是做什么的？",
      "subject": "society",
      "secondary": "math",
      "depth": 3,
      "figure": "assets/figures/securities-firm.svg",
      "figureEn": "assets/figures/en/securities-firm.svg",
      "figureAlt": "流程图：投资者到证券公司开户下单，证券公司把单子送进交易所撮合，再把成交回报给投资者；上市公司通过交易所发股票换钱；证券公司赚的是佣金和各类服务费，不是投资者赚亏的钱",
      "oneLine": "证券公司是市场里的「中间柜台」：你不能直接进交易所买卖，得通过它开户、下单、把钱和股票托管好；另一边它还帮公司上市、发债。它赚的是服务费，不替你赌涨跌。",
      "points": [
        "第一件事是当你的柜台。交易所不是谁都能进的大卖场，只对会员开放——证券公司就是那个会员。你在它那儿开户，它替你验明身份、把钱转进来；你按一下「买入」，它把你的委托单送进交易所排队，跟别人的卖单对上，成交后再帮你把钱和股票各自记好账。这一整套叫「经纪业务」，它抽的费叫佣金。",
        "第二件事是当公司那边的帮手。一家公司想上市，得有人帮它把账整理清楚、写招股说明书、找投资人、定发行价，这些活儿也是证券公司干的（叫投行或承销）。公司发股票、发债拿到的钱进了公司口袋，证券公司收一笔服务费。所以同一家券商，左边柜台对着散户，右边会议室对着老板。",
        "它靠什么赚钱？佣金、代销基金和理财的手续费、融资融券的利息（借钱给你买、借股票给你卖），还有给公司做上市和发债的服务费，外加自己拿钱投资的自营业务。关键在于：它不保证你赚钱，也不从你的亏损里抽成——它赚的是「把事办成」的服务费，涨跌的风险是投资者自己承担的。这也是它和银行最大的不同：银行给你存款利息、替你把钱借出去，证券公司只帮你参与投资。"
      ],
      "followUp": "那为什么买股票的钱亏了，证券公司不用赔？",
      "source": "2026-11-05 玉米",
      "en": {
        "question": "What does a securities firm do?",
        "oneLine": "A securities firm — a broker — is the counter between you and the market: you cannot trade on the exchange directly, so you open an account with it, place orders through it, and it keeps your cash and shares straight. On the other side it helps companies list and issue bonds. It earns service fees; it does not gamble on prices for you.",
        "points": [
          "The first job is being your counter. The exchange is not a market anyone can walk into — it only admits members, and a securities firm is one of those members. You open an account there, it verifies who you are and takes in your money; when you tap “buy”, it sends your order to the exchange, where it queues up and gets matched against someone’s sell order, and afterwards it records the cash and the shares on both sides. This whole service is called brokerage, and the cut it takes is the commission.",
          "The second job is helping companies. A company that wants to list needs someone to tidy up its books, write the prospectus, find investors and set an issue price — that is also the securities firm’s work, called investment banking or underwriting. The money from shares and bonds goes into the company’s pocket, and the firm charges a service fee. So the same firm has a counter facing ordinary savers and a meeting room facing bosses.",
          "Where does the money come from? Commissions, fees for selling funds and wealth products, interest on margin lending (lending you cash to buy or shares to sell short), fees for taking companies public or issuing bonds, plus proprietary trading with its own capital. The key point: it does not promise you a profit and does not take a cut of your losses — it earns fees for getting things done, while the risk of prices going up or down stays with the investor. That is the biggest difference from a bank: a bank pays you deposit interest and lends your money out, while a broker only helps you take part in investing."
        ],
        "followUp": "Then why doesn't the securities firm have to pay me back when my shares lose money?",
        "figureAlt": "A flow diagram: an investor opens an account and places orders with a securities firm, which sends the order to the exchange to be matched and reports the fill back; a listed company issues shares for cash through the exchange; the firm earns commissions and service fees, not a share of the investor's gains or losses"
      },
      "time": "08:15:26"
    },
    {
      "id": "traffic-lines",
      "date": "2026-11-05",
      "kid": "yumi",
      "age": 9,
      "question": "地上的交通线，白的和黄的有什么区别？",
      "subject": "society",
      "secondary": "daily",
      "depth": 3,
      "figure": "assets/figures/traffic-lines.svg",
      "figureEn": "assets/figures/en/traffic-lines.svg",
      "figureAlt": "俯视一条双向道路：白虚线分开同方向的车道、可以变道，白实线不能变；中间的双黄实线隔开对向车道，两边都不许跨；黄虚线才准借道超车，路边黄实线表示不能停车",
      "oneLine": "两种线是两套命令：白线管同一个方向的车怎么排——虚线可以变道、实线不行；黄线管对面来的车别越界——中间的黄线、路边的黄线都是在说「不许」。",
      "points": [
        "白线的任务只有一件：让朝同一个方向走的车排好队。车道中间画成白虚线，意思是「我可以让开，你可以借我的位置换道」；画成白实线，意思是「现在谁都别动，不能换道」。斑马线、路口前的停止线、路口中间那块斜纹的导流区，也都是白色的——它们管的是「这个方向的车该走哪儿、该停在哪儿」。",
        "黄线的任务正相反：它不是排队，是把人分开。两条车道相对着开，中间那道黄线就是一堵画在地上的墙。双黄实线谁都不能跨；一条实一条虚，只有靠虚线那一边的车可以借道超车；路边的黄实线表示「这一段不许停车」。所以看到一条线，可以先问一句：它是在安排同一队人排队（白），还是在拦住对面来的人（黄）？",
        "为什么偏偏选白色和黄色？因为这是给夜里看的问题：车灯一照，湿路面上白线和黄线反光最亮、对比最清楚，有色觉障碍的人也能分开。而且只要两种颜色就够用——一种是「同一方向内部的事」，一种是「两个方向之间的事」，规则不需要第三种颜色。顺带一句：各国规矩有差别，美国的中线也是黄色、边线白色，欧洲则大量用白色，去别的地方开车得先看当地怎么定。"
      ],
      "followUp": "那为什么路口的斑马线要画成一条一条横的，而不是刷一整块白？",
      "source": "2026-11-05 玉米",
      "en": {
        "question": "What is the difference between the white and yellow lines on the road?",
        "oneLine": "Two colours, two sets of orders: white lines organise cars going the same way — dashed means you may change lanes, solid means you may not. Yellow lines keep traffic coming the other way out — the yellow line down the middle and the yellow line by the kerb both mean “do not”.",
        "points": [
          "White lines do exactly one job: they keep cars heading the same direction in order. Painted dashed, it means “I will make room, you may borrow my spot to change lanes”; painted solid, it means “nobody moves now — no lane change”. Zebra crossings, the stop line before a junction, and the hatched chevron area in the middle of an intersection are all white too — they say where cars going that way may drive and where they must stop.",
          "Yellow lines do the opposite job: they do not queue people, they separate them. Where two lanes face each other, the yellow line between them is a wall painted on the ground. Nobody may cross a double solid yellow; where one is solid and one dashed, only the side facing the dashed line may cross to overtake; a solid yellow line along the kerb means “no parking on this stretch”. So whenever you see a line, ask first: is it queueing one direction (white), or blocking the traffic coming the other way (yellow)?",
          "Why white and yellow in particular? Because this is a problem for the eyes at night: under headlights on wet asphalt, white and yellow reflect brightest and contrast most clearly, and people with colour-vision deficiency can still tell them apart. Two colours are also enough — one for “things inside a single direction”, one for “things between two directions” — the rules need no third colour. One aside: countries differ. In the United States the centre line is yellow and edge lines are white; in Europe white is used almost everywhere, so before driving abroad, check the local rules."
        ],
        "followUp": "Then why is a zebra crossing painted as separate stripes instead of one solid white block?",
        "figureAlt": "A top-down view of a two-way road: a dashed white line separates lanes going the same way and may be crossed, a solid white line may not; a double solid yellow line down the middle separates opposite directions and neither side may cross it; only a dashed yellow line allows overtaking, and a solid yellow line by the kerb means no parking"
      },
      "time": "07:59:31"
    },
    {
      "id": "lightning",
      "date": "2026-11-03",
      "kid": "yumi",
      "age": 9,
      "question": "闪电是怎么来的？云里面的水有关系吗？",
      "subject": "nature",
      "secondary": "tech",
      "depth": 3,
      "figure": "assets/figures/lightning.svg",
      "figureEn": "assets/figures/en/lightning.svg",
      "figureAlt": "三段图解：云里的小冰晶和小水珠互相碰撞，把电荷撞开，正电飘到云顶、负电留在云底；电荷越攒越多，中间隔着的空气像一堵墙，撑不住被一下子打穿；电顺着这条路冲到地面，通道被烧得极亮就是闪电，被烤热的空气猛地膨胀炸开就是雷",
      "oneLine": "有关系，但不是水变成电：云里的小冰晶和小水珠撞来撞去，把电荷撞开——正电上了云顶、负电留在云底，整块云就成了电池；电攒够了，把空气打穿、一路冲到地面，那就是闪电。",
      "points": [
        "云里的水有关系，但它不是「变成电」，是「帮忙把电分开」。云里全是小水珠和小冰晶，被上升的气流托着不停乱撞，撞的时候像摩擦毛衣一样，把电子从一个撞到另一个身上。轻的正电被气流带到云顶，重的负电留在云底，整块云就变成一节充好电的电池。",
        "分开的电荷越攒越多，云底和地面之间的电压差就越大。中间隔着的东西是空气，空气平时不导电，像一堵墙。墙撑到某个程度就守不住了，被一下子打穿，中间裂开一条能通电的路——这个过程叫「击穿」，一条细细的先导从云里朝地面探下来。",
        "路一通，云和地面之间的巨大电压差就把电荷一股脑送过去，通道被烧到两三万度，亮得晃眼，那就是闪电。通道里的空气被瞬间烤热，猛地膨胀，把周围的空气推开——那声炸响就是雷。所以先看到亮、后听到响：光一秒跑三十万公里，声音一秒才三公里多。下次打雷可以自己数：看见闪电就开始数秒，听到雷声停下，每 3 秒大约就是 1 公里远。"
      ],
      "followUp": "那为什么雷声总是「轰隆隆」拖很久，而不是短短一声？",
      "en": {
        "question": "How does lightning happen? Does the water in the cloud have anything to do with it?",
        "oneLine": "Yes, but the water does not turn into electricity — it helps split it. Tiny ice crystals and droplets bumping into each other inside a cloud knock electric charge apart, positive up to the top and negative down to the base, so the cloud becomes a charged battery; when enough charge builds up it punches through the air and races to the ground, and that is lightning.",
        "points": [
          "The water in the cloud matters, but it is not turned into electricity — it helps separate it. A cloud is full of tiny droplets and ice crystals, held up by rising air and constantly colliding. Each collision works like rubbing a sweater: electrons get knocked from one particle onto another. The light positive charge is carried up to the cloud top, the heavy negative charge stays near the base, and the whole cloud becomes a charged battery.",
          "The more charge that piles up, the bigger the voltage difference between the cloud base and the ground. What sits in between is air, and air does not normally conduct — it is like a wall. Past a certain point the wall gives way and gets punched through, cracking open a path that current can flow along. That is called breakdown, and a thin leader reaches down from the cloud toward the ground.",
          "Once the path is open, the huge voltage difference drives the charge down in one go. The channel is heated to tens of thousands of degrees and blazes — that is the flash we see. The air inside it is suddenly roasted and expands violently, shoving the surrounding air outward — that bang is thunder. That is why you see the flash first and hear the bang later: light covers 300,000 km in a second, sound only about 3 km. Next time it thunders, count the seconds from flash to bang — every 3 seconds is roughly 1 km of distance."
        ],
        "followUp": "Then why does thunder roll on and on instead of giving one short crack?",
        "figureAlt": "Three panels: tiny ice crystals and droplets bumping in a cloud prise charge apart, positive rising to the cloud top and negative staying at the bottom; when the charge piles up, the air between acts like a wall and gets punched through; the current races to the ground and the burned channel is the flash, while the suddenly heated air exploding outward is the thunder"
      },
      "source": "2026-11-03 玉米",
      "time": "21:51:00"
    },
    {
      "id": "photo-pink",
      "date": "2026-11-02",
      "kid": "yumi",
      "age": 9,
      "question": "照片久了之后，照射阳光为什么会转成粉色？",
      "subject": "nature",
      "secondary": "tech",
      "depth": 3,
      "figure": "assets/figures/photo-pink.svg",
      "figureEn": "assets/figures/en/photo-pink.svg",
      "figureAlt": "三段图解：老照片是青、品红、黄三种染料叠出来的；青色最怕太阳的紫外光和热，被一点点打散；青色退场后蓝少了，红显得多，照片就泛粉",
      "en": {
        "question": "Why do photos turn pink after a long time in the sun?",
        "oneLine": "Colour photos are printed with three dyes — cyan, magenta and yellow — and cyan is the one that fears sunlight most. When the sun breaks the cyan apart, the blue goes away, red stands out, and the photo drifts pink.",
        "points": [
          "An old colour photo is not a painting. It is made of three dyes laid on the paper: cyan (blue-green), magenta and yellow. Only all three together look like the right colour.",
          "The three dyes do not age at the same speed. Cyan is the most fragile: ultraviolet light and heat slowly break its molecules apart. Each sunny day takes away a little more, and after decades the cyan simply leaves. That is the whole trick — nothing was added, something was lost.",
          "With less blue the same red and yellow look much stronger, and the picture slides toward pink. The proof is easy: leave one photo in a drawer and hang another by the window for a few months, and the two will no longer match. Old photos want dark, dry, and away from glass that lets the sun in."
        ],
        "followUp": "Then why do old black-and-white photos go yellow-brown instead of pink?",
        "figureAlt": "Three panels: old photos are built from cyan, magenta and yellow dyes; cyan fears sunlight and heat most, and is slowly broken apart; once the cyan is gone there is too little blue, red looks strong, and the photo turns pink"
      },
      "oneLine": "彩色照片是用青、品红、黄三种染料印出来的，其中「青色」最怕太阳——紫外光和热把它一点点打散；蓝色没了，红就显得多，照片就泛粉。",
      "points": [
        "老彩色照片不是画上去的，是三种染料摊在纸上：青（蓝绿）、品红、黄。三种叠在一起，颜色才正常；少一种，颜色就偏。",
        "三种染料老得不一样快。青色最脆，阳光里的紫外线和热会一点点把它的分子打散。晒一天少一点，几十年下来青色干脆退场——不是多了什么，是少了一样。",
        "蓝色少了，剩下的红和黄就显得特别多，整张照片慢慢滑向粉色。这个能验证：同一张照片，一张放抽屉、一张贴窗边几个月，颜色就对不上了。所以老照片要避光、干燥、别贴着玻璃晒。"
      ],
      "followUp": "那黑白老照片为什么是发黄变褐色，不是发粉？",
      "source": "2026-11-02 玉米",
      "time": "07:38:07"
    },
    {
      "id": "mirror-flip",
      "date": "2026-10-31",
      "kid": "yumi",
      "age": 9,
      "question": "为什么镜子里面是反起来的？",
      "subject": "nature",
      "secondary": "math",
      "depth": 3,
      "figure": "assets/figures/mirror-flip.svg",
      "figureEn": "assets/figures/en/mirror-flip.svg",
      "figureAlt": "三段图解：光撞到镜子像球撞墙一样原路弹回；左右两个手的光直去直回，左手还在左边；把镜子平放在地上，左右没变、上下却反了",
      "en": {
        "question": "Why is everything in a mirror backwards?",
        "oneLine": "A mirror flips front and back, not left and right: it sends back exactly the side that faces it. It feels like left and right are swapped because your brain reads the person in the mirror as someone who turned around to face you — and someone facing you has their right hand on your left.",
        "points": [
          "Behind the glass there is a coat of metal. Light does not pass through the way it does through a window; it bounces straight back like a ball off a wall. So what you see in a mirror is always the side facing the mirror — the direction that gets swapped is front and back.",
          "Left and right are not swapped at all. Light from your left hand goes straight there and straight back and lands on the left again; raise your right hand and the mirror's hand is on your right too. The mirror is like a sheet of clear paper that only turns facing the mirror into lit by the mirror.",
          "So why does it feel wrong? Because your brain has a default translation: a face looking straight at you is read as a person who turned round, and a person facing you has their right hand on your left, so the brain translates the whole picture into swapped left and right. The proof is blunt: lay the mirror flat on the floor and left and right stay put while up and down flip — a mirror only flips the direction it faces."
        ],
        "followUp": "Then why do clocks in a mirror run backwards, and letters look reversed?",
        "figureAlt": "Three panels: light bounces off a mirror like a ball off a wall; light from both hands goes straight there and back, so the left hand stays on the left; laid flat on the floor the mirror keeps left and right but flips up and down"
      },
      "oneLine": "镜子只翻「前后」，不翻「左右」：它把正对着它的那一面原样送回来。你觉得左右反了，是因为大脑把镜子里的人当成「转过身来的人」——而转过身的人，右手正好在你左边。",
      "points": [
        "镜子背面涂了一层金属，光照上去不像照进窗户那样穿过去，而是像球撞墙一样直线弹回来。所以你在镜子里看到的，永远是「正对着镜子的那一面」——被换掉的是「前和后」这一个方向。",
        "左右其实一点没换。你的左手的光直着过去、直着回来，落点还在左边；举右手，镜子里那只手也确实在你右手这边。镜面就像一张透明的纸，只把「朝着镜子」变成「被镜子照着」。",
        "那为什么看着别扭？因为大脑有一套默认翻译：看到一张脸正对着自己，就当成「一个人转过身来了」；转过身的人右手在你左边，于是整个画面就被大脑「翻译」成左右反了。证据很硬：把镜子平放在地上照，左右照旧，上下反而颠倒了——镜子只会翻它正对着的那一个方向。"
      ],
      "followUp": "那为什么镜子里的钟表是逆着走的，字也是反的？",
      "source": "2026-10-31 玉米",
      "time": "13:07:04"
    },
    {
      "id": "why-money",
      "date": "2026-10-30",
      "kid": "taozi",
      "age": 4,
      "question": "为什么出去买东西要给钱？",
      "subject": "society",
      "secondary": "daily",
      "depth": 2,
      "figure": "assets/figures/money-why.svg",
      "figureEn": "assets/figures/en/money-why.svg",
      "figureAlt": "三段图解：最早是拿东西换东西，谁都麻烦；后来大家约定一张票，谁拿着都能用；你拿走东西留一张票，老板再拿票去换他要的东西",
      "en": {
        "question": "Why do we have to pay money when we buy things?",
        "oneLine": "Money is a ticket everyone agrees on: you take someone's thing and leave a ticket behind, and the shopkeeper takes the ticket and trades it for what he needs.",
        "points": [
          "Long ago there was no money: people swapped things, one chicken for a bag of rice. The trouble was that the person who wanted rice did not always happen to have a chicken.",
          "So people agreed on a kind of ticket that anyone would accept — for rice, for vegetables, for toys. That ticket everyone trusts is money.",
          "Paying is not handing in homework, and it is not a present for the shopkeeper. It is leaving a mark: I took this, and I left something of the same value. Money cannot be eaten or played with; it is just the ticket that holds your place in the queue for things."
        ],
        "followUp": "So who makes money? And who decides how much a ticket can buy?",
        "figureAlt": "Three panels: at first people swapped things and it was awkward for everyone; then everyone agreed on a ticket anybody would accept; you take the goods and leave a ticket, and the shopkeeper trades the ticket for what he needs"
      },
      "oneLine": "钱是一张大家都认的「票」：你拿走别人的东西，就留一张票；老板拿着票，再去换他自己需要的东西。",
      "points": [
        "很早以前没有钱，是拿东西换东西：一只鸡换一袋米。麻烦的是——想要米的人，不一定正好有一只鸡。",
        "所以大家约定了一种「票」，谁拿着都能用，可以换米、换菜、换玩具。这张大家都肯认的票，就是钱。",
        "买东西付钱，不是「交作业」，也不是给老板的礼物，是留下一个记号：我拿走了这个，留下了等价的东西。钱自己不能吃也不能玩，它只是替东西排队的那张票。"
      ],
      "followUp": "那钱是谁做的？谁说了算，一张票能换多少？",
      "source": "2026-10-30 桃子",
      "time": "18:29:59",
      "timeSource": "capture"
    },
    {
      "id": "why-cloud-float",
      "date": "2026-10-30",
      "kid": "yumi",
      "age": 9,
      "question": "为什么云可以飘起来，人却不行？",
      "subject": "nature",
      "secondary": "math",
      "depth": 3,
      "figure": "assets/figures/cloud-float.svg",
      "figureEn": "assets/figures/en/cloud-float.svg",
      "figureAlt": "三段图解：云是无数极小的水珠，一点点上升的风就托得住；人是一整块大东西，风托不动；人想飞要靠机翼推空气或靠比空气轻的热气球",
      "en": {
        "question": "Why can clouds float but people can't?",
        "oneLine": "A cloud is not a ball of cotton; it is countless tiny water droplets. When something tiny falls, the air resistance is huge compared with its weight, so even a gentle updraught pushes it back — a person is too big and heavy, and the same breeze cannot hold them.",
        "points": [
          "A droplet in a cloud is a fraction of a hair's width. Falling on its own it drops only a few millimetres a second, slower than a speck of dust. A little rising warm air nudges it back where it was — so the cloud we see floating is really falling extremely slowly.",
          "Swap in a person of a few dozen kilos and the same breeze is basically nothing. To fly, a person has two options: push air down with wings and the air pushes you up (birds and planes), or get inside something lighter than air (a hot-air balloon). You do not get lighter — you change how you use the air.",
          "The real trick is spreading out: the same weight broken into tiny pieces with a wide face to the wind can be held up, while one lump cannot. That is why flour drifts in the sunshine for ages, but a lump of dough dropped straight down lands at once."
        ],
        "followUp": "So when it rains, is that the cloud finally unable to hold on, falling down?",
        "figureAlt": "Three panels: a cloud is countless tiny droplets a gentle updraught can hold; a person is one big lump the wind cannot lift; to fly you need wings that push air, or a balloon lighter than air"
      },
      "oneLine": "云不是一块棉花，是无数极小的水珠——小东西往下掉时，空气的阻力相对它的重量特别大，一点点上升的风就把它托回去了；人太大太重，同样的风托不动。",
      "points": [
        "一朵云里的水珠只有头发丝的几分之一宽，单独一颗往下掉，每秒才落几毫米，比一片灰尘还慢。上升的暖空气轻轻一顶，它就回到原处——所以我们看到的是「飘着」的云，其实是掉得极慢。",
        "换成几十公斤的人，同样这阵风基本等于没有。人想飞只有两条路：用翅膀或机翼把空气往下推，空气就反过来把你往上顶（鸟和飞机）；或者钻到比空气轻的东西里（热气球）。不是人变轻了，是换了种用法。",
        "真正的关键是「摊得开」：同样重量，分成很小的份、迎风的面积却很大，风就托得住；团成一大块，风就托不住。所以面粉在阳光里能飘很久，一块面团扔下去直接就落地。"
      ],
      "followUp": "那下雨的时候，是不是云终于托不住、掉下来了？",
      "source": "2026-10-30 玉米",
      "time": "08:01:12",
      "timeSource": "capture"
    },
    {
      "id": "why-sleep",
      "date": "2026-10-29",
      "kid": "yumi",
      "age": 9,
      "question": "人为什么会困，要睡觉？",
      "subject": "life",
      "secondary": "nature",
      "depth": 3,
      "figure": "assets/figures/sleep.svg",
      "figureEn": "assets/figures/en/sleep.svg",
      "figureAlt": "三段图解：醒着的时候腺苷越攒越多；睡着后脑脊液把它冲走；同时把白天的记忆从临时本抄进长期本",
      "en": {
        "question": "Why do people get sleepy and need to sleep?",
        "oneLine": "Sleepiness is a used-too-long signal: while you are awake your brain cells keep making a waste called adenosine, and the more it builds up the sleepier you get. Once you are asleep the brain washes it away with cerebrospinal fluid and copies what you learned into long-term memory.",
        "points": [
          "Every waking minute, working brain cells leave a little adenosine behind, like dust in a room — the more you use it, the more there is. When enough has piled up, the brain sends a time-to-rest signal: that is sleepiness.",
          "Once you are asleep, cerebrospinal fluid flows through the brain like water and carries the waste away; at the same time the brain copies what you learned today from a scratch pad into a long-term book — that step is called memory consolidation.",
          "Coffee and tea do not clear the waste, they only block the sleepy signal while the debt stays. So the time you borrow by staying up late comes back the next day as forgetting things and reacting slowly."
        ],
        "followUp": "Why is it sometimes harder to fall asleep when you are really tired?",
        "figureAlt": "Three panels: adenosine builds up while you are awake; while you sleep, fluid washes it away; and the day's memories are copied from the scratch pad into the long-term book"
      },
      "oneLine": "困是「用了太久的信号」：醒着的时候脑细胞一直在产生一种叫腺苷的废物，攒得越多你越困；睡着后大脑一边用脑脊液把它冲走，一边把白天学到的东西抄进长期记忆。",
      "points": [
        "你醒着的每一分钟，脑细胞干活都会留下一点「腺苷」，它像房间里的灰，越用越多；攒到一定量，大脑就发出「该休息了」的信号——这就是困。",
        "睡着以后，脑脊液会像水一样冲过脑子，把攒下的废物带走；同时大脑把白天学到的东西从「临时本」抄到「长期本」，这一步叫记忆固化。",
        "咖啡和茶不是把废物清掉了，只是把「困」的信号挡住，账还欠着；所以熬夜省下的时间，第二天会以「记不住、反应慢」的形式还回来。"
      ],
      "followUp": "为什么有时候越累反而越睡不着？",
      "source": "2026-10-29 玉米",
      "time": "22:16:40",
      "timeSource": "capture"
    },
    {
      "id": "why-scold",
      "date": "2026-10-29",
      "kid": "taozi",
      "age": 4,
      "question": "为什么小朋友做错事，大人要批评？",
      "subject": "society",
      "depth": 2,
      "figure": "assets/figures/why-scold.svg",
      "figureEn": "assets/figures/en/why-scold.svg",
      "figureAlt": "三段图解：打翻水是做错的那件事；大人着急是因为怕你受伤；批评的是这件事，喜欢你这件事没变",
      "en": {
        "question": "Why do grown-ups tell kids off when they do something wrong?",
        "oneLine": "Grown-ups are telling off the thing that went wrong, not you as a person — they are afraid you will get hurt, or someone else will, and when they are worried their voice gets a bit loud.",
        "points": [
          "Some mistakes can hurt you (touching boiling water, running down the stairs), and some can hurt others (pushing, grabbing toys). Grown-ups get worried because they care and they are scared, not because they do not like you.",
          "When grown-ups are worried they often only say 'no' and forget to say why. You can ask: Why can't I? Once you know, you know what to do next time.",
          "It is a telling-off about one thing, not about a person. Fix it and that thing is over; being told off never means I am a naughty kid."
        ],
        "followUp": "Then when grown-ups do something wrong, who tells them off?",
        "figureAlt": "Three panels: spilling the water is the thing that went wrong; grown-ups get worried because they are afraid you will be hurt; the telling-off is about the thing, and liking you has not changed"
      },
      "oneLine": "大人批评的是「做错的那件事」，不是你这个人——他们怕你受伤、怕别人受伤，一着急声音就大了一点。",
      "points": [
        "有些错会伤到你自己（摸开水、跑下楼），有些会伤到别人（推人、抢玩具）。大人着急，是因为心疼和害怕，不是不喜欢你。",
        "大人着急的时候常常只说「不行」，忘了说为什么。你可以问一句：「为什么不可以？」问清楚了，才知道下次怎么做。",
        "批评的是一件事，不是一个人。改了，这件事就过去了；「被批评」从来不等于「我不乖」。"
      ],
      "followUp": "那大人做错事的时候，谁来批评大人呢？",
      "source": "2026-10-29 桃子",
      "time": "21:27:16",
      "timeSource": "capture"
    },
    {
      "id": "moon-follow",
      "date": "2026-10-28",
      "kid": "taozi",
      "age": 4,
      "question": "为什么我们走，月亮也跟着我们走？",
      "subject": "nature",
      "secondary": "math",
      "depth": 2,
      "figure": "assets/figures/moon-follow.svg",
      "figureEn": "assets/figures/en/moon-follow.svg",
      "figureAlt": "三段图解：你往前走几步，近处的树很快退到身后；月亮离得太远，方向几乎不变，所以看上去像在跟着你",
      "en": {
        "question": "Why does the moon follow us when we walk?",
        "oneLine": "The moon is not following you; it is just very far away. Your few steps are too small for it to notice, while everything around you slides backwards — put side by side, it looks as if the moon is chasing you.",
        "points": [
          "Nearby trees, houses and streetlights are close: after a few steps they jump from in front of you to behind you, which is very obvious.",
          "The moon is very far away; the few dozen metres you walk around the block are almost too small to measure up there, so its direction barely changes.",
          "The things beside you keep sliding backwards while the moon stays in the same direction, so it feels as if it is walking along with you."
        ],
        "followUp": "If you ride a fast train, does the moon still follow? Why is that?",
        "figureAlt": "Three panels: walk a few steps and nearby trees slide behind you; the moon is so far that its direction hardly changes, so it looks like it is following"
      },
      "oneLine": "月亮没有跟着你走，它只是离得太远：你走的几步对它来说小得看不见，而你身边的东西一路往后退，一对比就成了「它在追我」。",
      "points": [
        "近处的树、房子、路灯离你近，你走几步，它们就从前面跑到身后，变化特别明显。",
        "月亮离我们非常远，你在小区里走的那几十米，在它那儿小得几乎量不出来，方向基本没变。",
        "身边的东西一直在往后跑，只有月亮一直待在同一个方向，看上去就像它在陪着你走。"
      ],
      "followUp": "坐火车飞快地往前跑，月亮还会跟着吗？为什么会这样？",
      "source": "2026-10-28 桃子",
      "time": "09:17:20",
      "timeSource": "capture"
    },
    {
      "id": "calculator-how",
      "date": "2026-10-28",
      "kid": "yumi",
      "age": 9,
      "question": "小学生用的计算器是怎么工作的？",
      "subject": "tech",
      "secondary": "math",
      "depth": 3,
      "figure": "assets/figures/calculator.svg",
      "figureEn": "assets/figures/en/calculator.svg",
      "figureAlt": "按下一个键就接通一根线，芯片照程序算，屏幕用七根小横条显示结果",
      "en": {
        "question": "How does the calculator pupils use actually work?",
        "oneLine": "A calculator does not think: pressing a key just connects one wire, a chip runs a program written in advance, and the answer lights up on the screen.",
        "points": [
          "Under the keys is a grid of lines. Pressing a key connects one row to one column, and the chip knows which key it was.",
          "The chip holds a set of programs written long ago; 'add two numbers' is just one of them. It also has to remember the numbers you typed.",
          "Each digit on the screen is made of seven little bars; whichever bars light up make that digit — so when a calculator breaks, it is often one bar that stopped lighting."
        ],
        "followUp": "Is the calculator in a phone the same? What extra step does it do?",
        "figureAlt": "Press a key and a wire connects; a chip runs its program; the screen shows the answer with seven small bars"
      },
      "oneLine": "计算器不会思考：你按的每个键只是接通了一根线，芯片照提前写好的程序算完，再把结果亮在屏幕上。",
      "points": [
        "键盘底下像一张格子网，按下一个键，就是让那一行和那一列接通一下，芯片就知道你按的是谁。",
        "芯片里存着一套早就写好的程序，「两个数相加」只是其中一条；它还负责记住你输进去的数。",
        "屏幕上的每个数字由七根小横条拼成，亮哪几根就是哪个数——所以计算器坏了，常常是其中一段不亮了。"
      ],
      "followUp": "手机里的计算器也是这样吗？它还要多做哪一步？",
      "source": "2026-10-28 玉米"
    },
    {
      "id": "pangu-axe",
      "date": "2026-10-27",
      "kid": "yumi",
      "age": 9,
      "question": "盘古开天辟地时候有一把斧子，这个斧子是从哪来的？",
      "subject": "story",
      "secondary": "nature",
      "depth": 2,
      "figure": "assets/figures/pangu-axe.svg",
      "figureEn": "assets/figures/en/pangu-axe.svg",
      "figureAlt": "三层时间线：三国的盘古只用身体撑开天地，明代的书写他执斧执凿，今天的动画照着画",
      "en": {
        "question": "When Pangu split heaven and earth, he had an axe. Where did that axe come from?",
        "oneLine": "That axe was not Pangu's — a Ming-dynasty storyteller gave it to him. In the oldest myth he only used his body to hold heaven and earth apart.",
        "points": [
          "The earliest record is Xu Zheng's third-century account: the world was like an egg with Pangu inside, and he grew ten feet a day while heaven rose ten feet and earth thickened ten feet — he was holding them apart.",
          "Only in a Ming-dynasty retelling does he first hold a chisel in one hand and an axe in the other, to chop or chisel it open: a story needs a chopping motion you can see.",
          "Later cartoons and picture books copied that, and the axe became Pangu's fixed prop while the chisel was forgotten — so the axe comes from a Ming storyteller's hands."
        ],
        "followUp": "Then who gave him the chisel? And where did Nuwa's five-coloured stone come from? (Myths love explaining where the world came from, and rarely explain where their own props came from.)",
        "figureAlt": "A timeline in three layers: Pangu in the third-century story only holds the sky with his body; the Ming book gives him an axe and a chisel; today's cartoons copy that"
      },
      "oneLine": "那把斧子不是盘古的，是明朝说书人给他配的——最早的神话里他只靠身体把天地撑开。",
      "points": [
        "最早的记载是三国吴人徐整的《三五历纪》：天地混沌如鸡子，盘古生在其中，每天长一丈，天日高一丈、地日厚一丈——天地是被他「撑」开的。",
        "到明代的《开辟衍绎》，才第一次写他「左手执凿，右手持斧」，或斧劈或以凿开：故事需要一个看得见的「劈」的动作。",
        "后来动画、绘本照着画，斧子成了盘古的「标配」，凿子反倒被忘掉——所以斧子的出处在明代说书人手里。"
      ],
      "followUp": "那凿子又是谁给的？再往下问：女娲补天的五色石哪来的？（神话很会解释世界怎么来，却很少解释自己的道具哪来。）",
      "source": "2026-10-27 玉米"
    },
    {
      "id": "candy-tooth",
      "date": "2026-10-26",
      "kid": "yumi",
      "age": 9,
      "question": "为什么吃糖牙齿要烂？",
      "subject": "life",
      "secondary": "nature",
      "depth": 2,
      "figure": "assets/figures/candy-tooth.svg",
      "figureEn": "assets/figures/en/candy-tooth.svg",
      "figureAlt": "牙齿的盔甲被酸泡出小洞，洞深了碰到牙神经",
      "en": {
        "question": "Why does eating sweets rot your teeth?",
        "oneLine": "What rots teeth is not the sugar itself but the acid that sugar feeds: the bacteria in your mouth eat sugar and spit out acid, and the acid soaks little holes into the tooth's armour, deeper and deeper.",
        "points": [
          "A tooth wears a very hard coat called enamel, like armour — hard enough to grind bone, but afraid of acid.",
          "Sugar sticks to the teeth, and the mouth bacteria eat it and give off acid. Sugar is not the villain directly; it is delivering dinner to the bacteria.",
          "The acid pulls calcium out little by little (that is called demineralisation): first a chalky spot, then a small hole; when the hole reaches the nerve, it hurts."
        ],
        "followUp": "Why is eating several sweets slowly through the day worse than eating them all at once? (The bacteria are served a meal every time and the acid baths add up; brushing with fluoride can rebuild the armour.)",
        "figureAlt": "Acid soaks a hole into the tooth's armour; deep enough, it reaches the nerve"
      },
      "oneLine": "真正烂牙的不是糖，是糖养出来的「酸」：嘴里的细菌吃糖、吐酸，酸把牙齿的盔甲泡出小洞，洞越来越深。",
      "points": [
        "牙齿外面包着一层很硬的牙釉质，像盔甲；硬到能磨碎骨头，但它怕酸。",
        "糖分黏在牙上，嘴里的细菌吃了就吐酸。糖不是直接坏事，它相当于给细菌送饭。",
        "酸把钙一点一点抽走（脱矿），先出一个白黄斑，再变成小洞；洞深到牙神经，就会疼。"
      ],
      "followUp": "为什么「一天慢慢吃好几颗」比「一次吃完」更糟？（细菌每隔一阵就开一次饭，酸泡的时间是累出来的；刷牙 + 含氟能把盔甲补回来。）",
      "source": "2026-10-26 玉米"
    },
    {
      "id": "laputa-robot",
      "date": "2026-10-25",
      "kid": "taozi",
      "age": 4,
      "question": "天空之城里的机器人为什么死了？",
      "subject": "story",
      "secondary": "life",
      "depth": 2,
      "figure": "assets/figures/laputa-robot.svg",
      "figureEn": "assets/figures/en/laputa-robot.svg",
      "figureAlt": "花园机器人、它的鸟窝，和拉普达城里的发光石头",
      "en": {
        "question": "Why did the robot in Castle in the Sky die?",
        "oneLine": "It did not die from bleeding — it ran out of power. Its strength came from Laputa itself, and when the city fell and the army shot it apart, it could not move any more.",
        "points": [
          "The robots of Laputa were built by an ancient people to do work. This one looked after the garden and guarded a bird's nest, and it was very gentle.",
          "It did not eat or sleep. Its power came from the whole city — the glowing stone and the roots of the great tree.",
          "In the film the army breaks it with cannon fire; then the city falls, it has no power left, and it stops there, still."
        ],
        "followUp": "So did it die? (It will not grow or eat — it is more like it stopped. But the chicks in the nest it guarded are still there.)",
        "figureAlt": "The garden robot, the nest it guarded, and the glowing stone under Laputa"
      },
      "oneLine": "它不是流血死的，是「没劲了」：它的力气来自拉普达城，城塌了、它又被军队打坏，就再也不动了。",
      "points": [
        "拉普达的机器人是古代人做来干活的，这一个在花园里照顾花草、护着鸟窝，特别温柔。",
        "它不吃饭、不睡觉，力气来自整座城（那颗会发光的石头和巨树的根）。",
        "电影里军队用大炮把它打坏；最后城塌了，它就没有力气了，停在那里不动。"
      ],
      "followUp": "那它算不算「死」？（它不会长大、不会吃饭，更像是「停下来了」——但它护过的鸟窝里，小鸟还在。）",
      "source": "2026-10-25 桃子（看《天空之城》）"
    },
    {
      "id": "mosquito-itch",
      "date": "2026-10-12",
      "kid": "yumi",
      "age": 9,
      "question": "蚊子咬了之后，为什么会痒？",
      "subject": "life",
      "secondary": "nature",
      "depth": 2,
      "figure": "assets/figures/mosquito.svg",
      "figureEn": "assets/figures/en/mosquito.svg",
      "figureAlt": "蚊子在皮肤上吸血吐口水，身体的卫士释放组胺，让皮肤起包、让神经觉得痒",
      "en": {
        "question": "Why does a mosquito bite itch?",
        "oneLine": "It is not the bite that itches — your own little guards are fighting: they release something called histamine, which puffs up the skin and makes nerves feel itchy.",
        "points": [
          "Before a mosquito drinks, it spits a little saliva so the blood will not clot and block its straw.",
          "Your body treats that saliva as an enemy, sends immune cells to deal with it, and those release histamine on the way.",
          "Histamine widens the blood vessels there (so it swells into a bump) and tickles the nerves (so it itches). The more you scratch, the more it releases — which is why scratching makes it worse."
        ],
        "followUp": "Why do some kids swell up more after a bite? And why does something cold feel good? (Chill it and the nerves are harder to trigger.)",
        "figureAlt": "A mosquito drinks and spits saliva; the body's guards release histamine; the skin puffs up and the nerves feel itchy"
      },
      "oneLine": "不是蚊子咬得痒，是你自己的「小卫士」在打架：它们放出一种叫组胺的东西，让皮肤起包、让神经觉得痒。",
      "points": [
        "蚊子吸血前会先吐一点口水，防止血凝固堵住它的吸管。",
        "身体把这个口水当成敌人，派免疫细胞来处理，顺手放出「组胺」。",
        "组胺让那里的血管变宽（鼓成包），又刺激神经（发痒）。你越抓，它放得越多，所以越抓越痒。"
      ],
      "followUp": "为什么有的小朋友被咬后肿得更大？涂点凉凉的为什么舒服些？（冰一冰，神经就不那么容易被「点着」。）",
      "source": "2026-10-12 玉米"
    },
    {
      "id": "orange-pill",
      "date": "2026-10-12",
      "kid": "taozi",
      "age": 4,
      "question": "早上吃的那个橘红色的是什么？",
      "subject": "life",
      "secondary": "daily",
      "depth": 1,
      "figure": "assets/figures/fishoil.svg",
      "figureEn": "assets/figures/en/fishoil.svg",
      "figureAlt": "一颗橘红色的小胶囊，里面是给大脑和眼睛用的 DHA",
      "en": {
        "question": "What was that orange thing I ate this morning?",
        "oneLine": "That was a little orange-red fish-oil capsule. The DHA inside is a building block for the brain and the eyes.",
        "points": [
          "It is not a sweet, it is a supplement — one capsule a day is enough.",
          "DHA comes from deep-sea fish; the capsule feels soft and looks shiny.",
          "A growing brain and eyes need a little of that material, but eating well matters more than taking capsules."
        ],
        "followUp": "Why is it orange-red? (One, so it is easy to recognise. Two, fish oil is sensitive to light, so the colour and the shell both protect it.)",
        "figureAlt": "A little orange-red capsule holding DHA for the brain and eyes"
      },
      "oneLine": "那是鱼油 DHA 的小胶囊，橙红色的；里面的 DHA 是大脑和眼睛的「建筑材料」。",
      "points": [
        "它不是糖，是营养补充，一次吃一颗就够。",
        "DHA 来自深海鱼，摸起来软软的、亮亮的。",
        "大脑和眼睛要长好，需要一点这样的材料；但好好吃饭比吃胶囊更重要。"
      ],
      "followUp": "为什么它是橙红色的？（一是好认，二是鱼油怕光怕坏，颜色和外壳都在保护它。）",
      "source": "2026-10-12 桃子"
    },
    {
      "id": "what-is-plugin",
      "date": "2026-10-11",
      "kid": "yumi",
      "age": 9,
      "question": "什么是插件？是不是像电脑的 U 盘一样？",
      "subject": "tech",
      "depth": 1,
      "figure": "assets/figures/plugin.svg",
      "figureEn": "assets/figures/en/plugin.svg",
      "figureAlt": "U 盘装的是东西，插件像插头，插上就多一种本领",
      "en": {
        "question": "What is a plugin? Is it like a USB stick?",
        "oneLine": "A plugin is like an extra skill socket you plug into a program: plug it in and the program learns a new skill, without replacing the whole program.",
        "points": [
          "A USB stick carries things — photos, files. A plugin carries a skill.",
          "It plugs into a program that already exists. Add an ad blocker to a browser and the browser gains the skill of blocking ads.",
          "When you no longer need it, unplug it. The original program is still there — it just loses that one skill."
        ],
        "followUp": "Can plugins make a computer slow? (They use a bit of memory, and too many will drag it down — like stuffing too much into a school bag.)",
        "figureAlt": "A USB stick carries stuff; a plugin is a socket that adds a skill"
      },
      "oneLine": "插件像给软件多插一个「本领插头」：插上去就多会一样本事，不用换掉整个软件。",
      "points": [
        "U 盘装的是「东西」（照片、文件）；插件装的是「本领」。",
        "它插在一个已经有的软件身上。比如浏览器装了挡广告插件，就多了挡广告的本领。",
        "不用了拔掉就行，原来的软件还在，只是少了那一样本领。"
      ],
      "followUp": "那插件会不会让电脑变慢？（会占一点内存，装太多会拖慢——和书包塞太多东西一个道理。）",
      "source": "2026-10-11 玉米"
    },
    {
      "id": "copy-image-wps",
      "date": "2026-10-10",
      "kid": "yumi",
      "age": 9,
      "question": "电脑上怎么把图片复制到 WPS 里面？",
      "subject": "tech",
      "depth": 3,
      "figure": "assets/figures/copy-paste.svg",
      "figureEn": "assets/figures/en/copy-paste.svg",
      "figureAlt": "三步：找到图片、按 Ctrl+C 复制、到 WPS 按 Ctrl+V 粘贴",
      "en": {
        "question": "How do I copy a picture into WPS on the computer?",
        "oneLine": "Three steps: find the picture, press Ctrl+C to copy, then press Ctrl+V in WPS to paste.",
        "points": [
          "If the picture is in a folder: click it once to select it, then press Ctrl+C.",
          "If the picture is on a web page: right-click on it and choose Copy Image.",
          "Click where you want it in WPS and press Ctrl+V. On a phone it is long-press to copy and long-press to paste."
        ],
        "followUp": "Ctrl+X is cut: it moves the thing, and the original spot is empty. You can also drag a picture file straight onto the WPS window.",
        "figureAlt": "Three steps: find the picture, press Ctrl+C, then press Ctrl+V in WPS"
      },
      "oneLine": "三步：找到图片 → 按 Ctrl+C 复制 → 在 WPS 里按 Ctrl+V 粘贴。",
      "points": [
        "图片在文件夹里：点一下选中它，按 Ctrl+C。",
        "图片在网页上：在图片上点右键，选「复制图片」。",
        "到 WPS 里点一下要放的位置，按 Ctrl+V。手机上对应的是长按「复制」和长按「粘贴」。"
      ],
      "followUp": "Ctrl+X 是「剪切」：搬走，原来那份没了。另外，把图片文件直接拖进 WPS 窗口也行。",
      "source": "2026-10-10 玉米"
    },
    {
      "id": "canteen-dumpling",
      "date": "2026-10-07",
      "kid": "yumi",
      "age": 9,
      "question": "为什么学校食堂不做圆子和水饺？",
      "subject": "society",
      "secondary": "daily",
      "depth": 2,
      "figure": "assets/figures/canteen.svg",
      "figureEn": "assets/figures/en/canteen.svg",
      "figureAlt": "左边一个个包饺子很慢，右边一大锅菜很快",
      "en": {
        "question": "Why doesn't the school canteen make rice balls and dumplings?",
        "oneLine": "Because it has to feed hundreds of pupils at once: rice balls and dumplings have to be wrapped one by one, which is far too slow, while a big pot of food can be made all at once.",
        "points": [
          "Little time: the lunch break is only a few dozen minutes, and hundreds of kids are in line.",
          "Few hands: wrapping a whole meal of dumplings takes several people half a morning, and then you have to boil pot after pot.",
          "Safety and cost: one big pot is easier to cook through and keep hot, and the same money buys more nutrition."
        ],
        "followUp": "Then why does the family wrap dumplings at New Year? (Fewer people, more time — and everyone likes sitting round together to make them.)",
        "figureAlt": "Left: wrapping dumplings one by one is slow. Right: one big pot is quick."
      },
      "oneLine": "因为要一次喂饱几百个人：圆子和水饺只能一个一个包，太慢；大锅菜能一次做很多。",
      "points": [
        "时间短：午饭只有几十分钟，几百人排队。",
        "人手少：包一顿水饺要好几个人忙一上午，包完还得煮好几锅。",
        "安全和成本：一大锅菜更容易保证熟透、够热，同样的钱也能买到更多营养。"
      ],
      "followUp": "那为什么过年家里就要包饺子？（人少、有闲、还图个一家人围在一起的热闹。）",
      "source": "2026-10-07 玉米"
    },
    {
      "id": "crab-gender",
      "date": "2026-10-06",
      "kid": "yumi",
      "age": 9,
      "question": "螃蟹怎么分公母？",
      "subject": "nature",
      "secondary": "life",
      "depth": 1,
      "figure": "assets/figures/crab.svg",
      "figureEn": "assets/figures/en/crab.svg",
      "figureAlt": "两只螃蟹翻过来的肚子：母蟹是圆脐，公蟹是尖脐",
      "en": {
        "question": "How can you tell a boy crab from a girl crab?",
        "oneLine": "Turn the crab over and look at its belly: a round flap means a female, a pointed one means a male.",
        "points": [
          "Under a crab's belly there is a flap that can open — it is called the apron, and it is where the crab tucks its tail away.",
          "A mother crab has to carry a whole bellyful of eggs, so her apron is wide and round, like a little apron.",
          "A male crab's apron is narrow and pointed, like a small triangle."
        ],
        "followUp": "Then why are mother crabs often more expensive at the market? (Because of the orange roe — those are her eggs before she lays them, and they are only full for one season.)",
        "figureAlt": "Two crabs flipped over: a round apron for the female, a pointed apron for the male"
      },
      "oneLine": "把螃蟹翻过来看肚子：圆肚子（圆脐）是母蟹，尖肚子（尖脐）是公蟹。",
      "points": [
        "螃蟹肚子下面有一片能翻开的「盖子」，叫蟹脐，那是它藏尾巴的地方。",
        "母蟹要抱着一肚子卵宝宝，所以脐又圆又宽，像个小围裙。",
        "公蟹的脐是尖的、窄的，像个小三角。"
      ],
      "followUp": "那为什么菜市场的母蟹常常更贵？（因为有蟹黄——那是它抱卵前的卵巢，一年里只有一阵子最满。）",
      "source": "2026-10-06 玉米"
    },
    {
      "id": "insurance-profit",
      "date": "2026-10-06",
      "kid": "yumi",
      "age": 9,
      "question": "保险公司赔保险，怎么还能赚钱？",
      "subject": "society",
      "secondary": "math",
      "depth": 3,
      "figure": "assets/figures/insurance.svg",
      "figureEn": "assets/figures/en/insurance.svg",
      "figureAlt": "很多人往一个大池子里投硬币，少数人从池子里领钱",
      "en": {
        "question": "If an insurance company has to pay out, how does it still make money?",
        "oneLine": "Many people each pay a little, and together it becomes one big pool. Only a few people ever need a payout; what is left pays the costs, and the rest is profit.",
        "points": [
          "Ten thousand people pay 100 yuan each, and the pool holds a million.",
          "In one year, maybe only a few dozen of them ever come to claim.",
          "The rest has to pay salaries, rent and taxes, and a big chunk is kept for next year's payouts. If payouts cost more than the money coming in, the company loses — that is why they measure so carefully."
        ],
        "followUp": "Then why does each person pay a different price for car insurance? (Different drivers, different cars, different chances of a crash — that is what they call different risk.)",
        "figureAlt": "Many people dropping coins into one big pool, and a few people taking money out"
      },
      "oneLine": "很多人各交一点点钱，攒成一个大池子；真正出事要赔的只是少数人，剩下的钱付成本，剩下才是赚的。",
      "points": [
        "一万个人各交 100 元，池子里就有 100 万元。",
        "这一年真正出事来领钱的，也许只有几十个人。",
        "剩下的钱要付工资、房租、税，还要留一大笔准备着下一年赔；赔得比收得多，保险公司就会亏。所以他们要算得很准。"
      ],
      "followUp": "为什么每个人的车险价钱不一样？（开车的人不一样、车不一样，出事的可能就不一样，这叫「风险不同」。）",
      "source": "2026-10-06 玉米"
    },
    {
      "id": "eighty-toys",
      "date": "2026-10-06",
      "kid": "yumi",
      "age": 9,
      "question": "你们小时候有什么玩的？",
      "subject": "daily",
      "secondary": "society",
      "depth": 1,
      "figure": "assets/figures/toys.svg",
      "figureEn": "assets/figures/en/toys.svg",
      "figureAlt": "铁环、毽子、沙包三样老玩具，和一块平板电脑",
      "en": {
        "question": "What did you play with when you were little?",
        "oneLine": "No phones, no tablets — everything was hands-on and outdoors: iron hoops, shuttlecocks, beanbags, skipping ropes, marbles and picture cards.",
        "points": [
          "Toys were cheap, and many we made ourselves: Mum sewed the beanbag out of cloth, and the shuttlecock was a coin with a few chicken feathers.",
          "Our playmates were every kid on the street — one shout and a whole team showed up.",
          "We came home only when it got dark, and grown-ups called you in from the balcony by shouting."
        ],
        "followUp": "So why are there so few photos from back then? (One roll of film took only 36 pictures, and you still had to pay to get them developed.)",
        "figureAlt": "Three old toys — an iron hoop, a shuttlecock, a beanbag — next to a tablet"
      },
      "oneLine": "没有手机和平板，玩的东西都是「动手做 + 出门跑」：铁环、毽子、沙包、跳皮筋、弹珠、拍画片。",
      "points": [
        "玩具多半很便宜，有的是自己做的：沙包是妈妈用布缝的，毽子用铜钱和鸡毛扎。",
        "玩伴就是整条街的小孩，喊一嗓子就凑齐一队。",
        "天黑才回家，大人靠嗓门在楼下喊吃饭。"
      ],
      "followUp": "那为什么那时候拍的照片特别少？（一卷胶卷只能拍 36 张，还要花钱洗出来。）",
      "source": "2026-10-06 玉米"
    }
  ]
};
