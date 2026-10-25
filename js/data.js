(() => {
  "use strict";

  const HEROES = [
    {
      id: "assassin",
      name: "玄霜",
      title: "「影刃」",
      role: "刺客 · 突进",
      shortRole: "刺客",
      difficulty: "进阶",
      sigil: "刃",
      color: "#68e7de",
      color2: "#1b6966",
      glow: "#8ffcf4",
      tagline: "刃光掠过之处，胜负早已写定。",
      stagePhrase: "宿命，由我执笔",
      passive: "锋芒",
      lore: "来自北境的无名执刃者。她没有过去，却能从每一次交手中读到敌人的未来。",
      stats: { damage: 88, survival: 48, difficulty: 72, power: 72 },
      body: { hp: 900, mana: 240, damage: 56, range: 108, speed: 250, manaRegen: 7 },
      abilities: [
        {
          name: "逐影",
          icon: "影",
          type: "dash",
          cooldown: 5,
          mana: 30,
          damage: 105,
          distance: 250,
          radius: 88,
          slow: 0.22,
          color: "#78f4e7",
          description: "向指针方向疾掠，对路径上的敌人造成伤害。"
        },
        {
          name: "裂空",
          icon: "斩",
          type: "slash",
          cooldown: 8,
          mana: 38,
          damage: 92,
          radius: 135,
          slow: 0.42,
          slowDuration: 2,
          color: "#b9fff7",
          description: "斩出一道环形刃风，对周围敌人造成伤害和减速。"
        },
        {
          name: "无迹",
          icon: "隐",
          type: "vanish",
          cooldown: 14,
          mana: 45,
          duration: 2.8,
          speedBoost: 1.55,
          color: "#9aaaff",
          description: "隐入夜色，获得短暂加速与伤害减免。"
        },
        {
          name: "瞬狱",
          icon: "终",
          type: "execute",
          cooldown: 42,
          mana: 90,
          damage: 235,
          range: 430,
          executeRatio: 0.22,
          color: "#ffdb8e",
          description: "锁定范围内生命值最低的敌方英雄，造成处决伤害。"
        }
      ]
    },
    {
      id: "archer",
      name: "星岚",
      title: "「流光」",
      role: "射手 · 持续",
      shortRole: "射手",
      difficulty: "熟练",
      sigil: "羽",
      color: "#7cc8ff",
      color2: "#275987",
      glow: "#bde7ff",
      tagline: "群星为我引路，风替我张弓。",
      stagePhrase: "箭出，星海为我让路",
      passive: "星痕",
      lore: "守望天穹的流亡游侠。每一支箭都循着星光，在抵达终点前绝不偏转。",
      stats: { damage: 82, survival: 36, difficulty: 58, power: 76 },
      body: { hp: 765, mana: 275, damage: 66, range: 335, speed: 228, manaRegen: 8 },
      abilities: [
        {
          name: "穿云",
          icon: "矢",
          type: "bolt",
          cooldown: 6.5,
          mana: 34,
          damage: 98,
          speed: 940,
          width: 28,
          range: 760,
          pierce: true,
          color: "#8ee2ff",
          description: "射出一支贯穿所有敌人的星辉之箭。"
        },
        {
          name: "缚星",
          icon: "阵",
          type: "zone",
          cooldown: 11,
          mana: 48,
          damage: 55,
          radius: 145,
          range: 620,
          delay: 0.45,
          root: 1.3,
          color: "#7d9fff",
          description: "在目标区域布下星阵，短暂束缚范围内的敌人。"
        },
        {
          name: "风踏",
          icon: "闪",
          type: "dash",
          cooldown: 10,
          mana: 38,
          damage: 36,
          distance: 230,
          radius: 62,
          color: "#b9efff",
          description: "向指针方向灵巧跃迁，并射出短促的冲击箭。"
        },
        {
          name: "陨星华",
          icon: "雨",
          type: "rain",
          cooldown: 46,
          mana: 95,
          damage: 62,
          radius: 245,
          range: 640,
          duration: 3,
          tick: 0.42,
          slow: 0.32,
          color: "#c9edff",
          description: "召唤流转星雨，持续轰击目标区域并减速敌人。"
        }
      ]
    },
    {
      id: "mage",
      name: "赤璃",
      title: "「炎歌」",
      role: "法师 · 爆发",
      shortRole: "法师",
      difficulty: "进阶",
      sigil: "焰",
      color: "#ff9f65",
      color2: "#853f2b",
      glow: "#ffd5a2",
      tagline: "余烬未熄，我便仍在歌唱。",
      stagePhrase: "以余烬，重燃长夜",
      passive: "烬火",
      lore: "赤曜古国的最后一位祭火师。她以歌声封存火焰，也以火焰封存逝者的名字。",
      stats: { damage: 94, survival: 40, difficulty: 66, power: 86 },
      body: { hp: 790, mana: 430, damage: 50, range: 295, speed: 220, manaRegen: 12 },
      abilities: [
        {
          name: "流火",
          icon: "火",
          type: "bolt",
          cooldown: 5.5,
          mana: 42,
          damage: 135,
          speed: 720,
          width: 34,
          range: 720,
          explode: 82,
          color: "#ffc06f",
          description: "掷出流火，命中时对周围敌人造成爆裂伤害。"
        },
        {
          name: "焰环",
          icon: "环",
          type: "zone",
          cooldown: 10,
          mana: 58,
          damage: 112,
          radius: 155,
          range: 620,
          delay: 0.55,
          stun: 0.9,
          color: "#ff9b57",
          description: "灼烧目标区域，短暂眩晕命中的敌人。"
        },
        {
          name: "烬步",
          icon: "迁",
          type: "blink",
          cooldown: 12,
          mana: 50,
          distance: 300,
          color: "#ffd18b",
          description: "化为一簇余烬，瞬间闪现至指针方向。"
        },
        {
          name: "天火",
          icon: "灾",
          type: "rain",
          cooldown: 48,
          mana: 110,
          damage: 78,
          radius: 265,
          range: 690,
          duration: 3.25,
          tick: 0.46,
          slow: 0.18,
          color: "#ffb06c",
          description: "引落天火，持续灼烧目标区域的敌人。"
        }
      ]
    },
    {
      id: "guardian",
      name: "苍岳",
      title: "「铁壁」",
      role: "战士 · 承伤",
      shortRole: "战士",
      difficulty: "入门",
      sigil: "山",
      color: "#d9b774",
      color2: "#72552e",
      glow: "#ffe2a8",
      tagline: "山不移，路便不会断。",
      stagePhrase: "此身如山，寸土不让",
      passive: "磐心",
      lore: "镇守关隘二十年的老兵。他的盾上刻满名字，每一个名字都曾与他并肩。",
      stats: { damage: 64, survival: 94, difficulty: 36, power: 70 },
      body: { hp: 1130, mana: 270, damage: 62, range: 118, speed: 216, manaRegen: 7 },
      abilities: [
        {
          name: "震岳",
          icon: "震",
          type: "dash",
          cooldown: 7,
          mana: 38,
          damage: 82,
          distance: 205,
          radius: 105,
          slow: 0.48,
          color: "#ffda90",
          description: "向前冲撞，撞飞路径上的敌人并使其减速。"
        },
        {
          name: "铁壁",
          icon: "盾",
          type: "shield",
          cooldown: 12,
          mana: 48,
          shield: 270,
          duration: 3.5,
          color: "#f6d698",
          description: "架起星岩重盾，吸收大量伤害。"
        },
        {
          name: "山岚",
          icon: "岚",
          type: "slash",
          cooldown: 9,
          mana: 42,
          damage: 76,
          radius: 150,
          slow: 0.52,
          slowDuration: 2.2,
          color: "#e5c985",
          description: "横扫重刃，击退近身的敌人。"
        },
        {
          name: "万钧",
          icon: "坠",
          type: "leap",
          cooldown: 45,
          mana: 90,
          damage: 245,
          radius: 235,
          range: 580,
          stun: 0.8,
          color: "#ffd884",
          description: "跃向目标区域，落地时造成巨额伤害并眩晕敌人。"
        }
      ]
    },
    {
      id: "support",
      name: "灵歌",
      title: "「月弦」",
      role: "辅助 · 守护",
      shortRole: "辅助",
      difficulty: "入门",
      sigil: "歌",
      color: "#c7a2ff",
      color2: "#5e478b",
      glow: "#eadcff",
      tagline: "愿每颗迷失的星，都能听见归途。",
      stagePhrase: "让每颗星，听见归途",
      passive: "月辉",
      lore: "游走于星海之间的吟游者。她相信歌声能让最疲惫的灵魂，再向前一步。",
      stats: { damage: 54, survival: 70, difficulty: 44, power: 65 },
      body: { hp: 860, mana: 420, damage: 48, range: 300, speed: 226, manaRegen: 12 },
      abilities: [
        {
          name: "月矢",
          icon: "弦",
          type: "bolt",
          cooldown: 5.5,
          mana: 28,
          damage: 72,
          speed: 820,
          width: 22,
          range: 640,
          color: "#dec8ff",
          description: "拨动月弦，射出一枚会削弱敌人的星音。"
        },
        {
          name: "清辉",
          icon: "愈",
          type: "heal",
          cooldown: 11,
          mana: 55,
          heal: 165,
          shield: 68,
          radius: 260,
          color: "#d6b5ff",
          description: "为周围友军恢复生命，并附着一层月辉护盾。"
        },
        {
          name: "定弦",
          icon: "缚",
          type: "zone",
          cooldown: 12,
          mana: 50,
          damage: 42,
          radius: 145,
          range: 610,
          delay: 0.48,
          root: 1.2,
          color: "#b899ff",
          description: "在目标区域弹奏静默之音，束缚敌人。"
        },
        {
          name: "星之安眠",
          icon: "梦",
          type: "sanctuary",
          cooldown: 50,
          mana: 110,
          damage: 110,
          heal: 265,
          shield: 115,
          radius: 320,
          range: 360,
          stun: 0.85,
          color: "#e6d7ff",
          description: "奏响安眠夜曲，治愈友军并震慑周围敌人。"
        }
      ]
    }
  ];

  const ROLES = [
    {
      id: "clash",
      name: "对抗路",
      short: "对抗",
      lane: 0,
      icon: "锋",
      color: "#d6b875",
      description: "独立带线、牵制敌方，承担正面交锋与侧翼推进。",
      preferredHeroes: ["guardian", "assassin"]
    },
    {
      id: "jungle",
      name: "打野",
      short: "打野",
      lane: 1,
      icon: "林",
      color: "#7fdaaa",
      description: "清理野区、争夺河道资源，通过游走帮助各条分路。",
      preferredHeroes: ["assassin", "guardian"]
    },
    {
      id: "mid",
      name: "中路",
      short: "中路",
      lane: 1,
      icon: "法",
      color: "#a4a8ff",
      description: "镇守中央兵线，快速支援河道与两侧战场的核心法术位。",
      preferredHeroes: ["mage", "archer"]
    },
    {
      id: "farm",
      name: "发育路",
      short: "发育",
      lane: 2,
      icon: "弓",
      color: "#78cfff",
      description: "通过下路兵线积累经济，在装备成型后接管团战输出。",
      preferredHeroes: ["archer", "mage"]
    },
    {
      id: "support",
      name: "辅助",
      short: "辅助",
      lane: 2,
      icon: "护",
      color: "#d5b2ff",
      description: "保护发育路、掌控视野并先手开团，为队友创造输出空间。",
      preferredHeroes: ["support", "guardian"]
    }
  ];

  const ITEMS = [
    {
      id: "iron-sword",
      name: "陨铁长剑",
      icon: "刃",
      category: "attack",
      price: 420,
      color: "#d9b674",
      stats: { attack: 20 },
      statText: "物理攻击 +20",
      description: "由陨铁锻造的基础武器，适合所有物理输出英雄。"
    },
    {
      id: "star-bow",
      name: "逐星长弓",
      icon: "弓",
      category: "attack",
      price: 820,
      color: "#76cfff",
      stats: { attack: 24, attackSpeed: 0.16 },
      statText: "物理攻击 +24 · 攻速 +16%",
      description: "星光穿过弓弦，使下一次出手更快。"
    },
    {
      id: "storm-lance",
      name: "破军长枪",
      icon: "破",
      category: "attack",
      price: 1680,
      color: "#ffd37d",
      stats: { attack: 62 },
      statText: "物理攻击 +62",
      description: "重装战士的终结兵器，以纯粹力量撕开阵线。"
    },
    {
      id: "vampire-blade",
      name: "饮血之刃",
      icon: "饮",
      category: "attack",
      price: 1380,
      color: "#ff827f",
      stats: { attack: 38, lifeSteal: 0.15 },
      statText: "物理攻击 +38 · 吸血 +15%",
      description: "每次普通攻击都会汲取敌人的生命。"
    },
    {
      id: "star-charm",
      name: "星辉护符",
      icon: "辉",
      category: "magic",
      price: 380,
      color: "#aaa5ff",
      stats: { abilityPower: 22, mana: 80 },
      statText: "法术强度 +22 · 法力 +80",
      description: "刻有聚星咒文的基础护符，适合法术英雄出门携带。"
    },
    {
      id: "arcane-tome",
      name: "星咒法典",
      icon: "典",
      category: "magic",
      price: 620,
      color: "#a5a7ff",
      stats: { abilityPower: 55, mana: 120 },
      statText: "法术强度 +55 · 法力 +120",
      description: "记录星界咒文的法书，让每一次施法更具威力。"
    },
    {
      id: "flame-orb",
      name: "烬火法球",
      icon: "焰",
      category: "magic",
      price: 1080,
      color: "#ffa25d",
      stats: { abilityPower: 85, hp: 150 },
      statText: "法术强度 +85 · 生命 +150",
      description: "封存永不熄灭的祭火，提升伤害与生存能力。"
    },
    {
      id: "sky-staff",
      name: "天穹权杖",
      icon: "穹",
      category: "magic",
      price: 1780,
      color: "#d5bcff",
      stats: { abilityPower: 145, mana: 260 },
      statText: "法术强度 +145 · 法力 +260",
      description: "天穹祭司的遗物，能够引导群星坠落。"
    },
    {
      id: "warden-pendant",
      name: "守誓护符",
      icon: "守",
      category: "defense",
      price: 410,
      color: "#d6c18a",
      stats: { armor: 10, hp: 150 },
      statText: "物理防御 +10 · 生命 +150",
      description: "守卫者宣誓时佩戴的护符，在前期提供可靠的承伤能力。"
    },
    {
      id: "iron-armor",
      name: "玄铁战甲",
      icon: "甲",
      category: "defense",
      price: 680,
      color: "#c3a975",
      stats: { armor: 34, hp: 220 },
      statText: "物理防御 +34 · 生命 +220",
      description: "厚重的玄铁甲片，有效抵挡持续物理伤害。"
    },
    {
      id: "life-crystal",
      name: "不灭晶核",
      icon: "生",
      category: "defense",
      price: 920,
      color: "#72d9af",
      stats: { hp: 460, armor: 12 },
      statText: "生命 +460 · 物理防御 +12",
      description: "封存古老生命力的晶核，持续滋养佩戴者。"
    },
    {
      id: "moon-cloak",
      name: "辉月斗篷",
      icon: "月",
      category: "defense",
      price: 1320,
      color: "#d9c6ff",
      stats: { hp: 330, magicResist: 0.08 },
      statText: "生命 +330 · 伤害减免 +8%",
      description: "月辉织成的斗篷，能够削弱所有来袭伤害。"
    },
    {
      id: "wind-boots",
      name: "追风战靴",
      icon: "靴",
      category: "move",
      price: 450,
      color: "#8ee4cf",
      stats: { speed: 34 },
      statText: "移动速度 +34",
      description: "轻盈的战靴，让英雄更快抵达战场。"
    },
    {
      id: "star-wings",
      name: "流光羽翼",
      icon: "羽",
      category: "move",
      price: 980,
      color: "#b8ddff",
      stats: { speed: 52, attackSpeed: 0.08 },
      statText: "移动速度 +52 · 攻速 +8%",
      description: "以流光凝成的羽翼，追击与撤退都更加从容。"
    }
  ];

  const MAP = {
    size: 4200,
    playerSpawn: { x: 1010, y: 3420 },
    blueBase: { x: 760, y: 3500 },
    redBase: { x: 3440, y: 700 },
    bossSpawn: { x: 2800, y: 2810 },
    lanes: [
      {
        name: "云崖路",
        short: "上路",
        points: [
          { x: 840, y: 3310 },
          { x: 700, y: 2640 },
          { x: 710, y: 1420 },
          { x: 960, y: 830 },
          { x: 1770, y: 680 },
          { x: 2630, y: 700 },
          { x: 3230, y: 950 },
          { x: 3440, y: 700 }
        ]
      },
      {
        name: "星辉路",
        short: "中路",
        points: [
          { x: 930, y: 3400 },
          { x: 1510, y: 2850 },
          { x: 2100, y: 2290 },
          { x: 2690, y: 1690 },
          { x: 3230, y: 1140 },
          { x: 3440, y: 700 }
        ]
      },
      {
        name: "潮生路",
        short: "下路",
        points: [
          { x: 1060, y: 3630 },
          { x: 1850, y: 3580 },
          { x: 2740, y: 3540 },
          { x: 3330, y: 3190 },
          { x: 3660, y: 2390 },
          { x: 3550, y: 1390 },
          { x: 3440, y: 700 }
        ]
      }
    ],
    towers: [
      { team: "blue", lane: 0, x: 730, y: 2360, tier: 1 },
      { team: "blue", lane: 0, x: 730, y: 1430, tier: 2 },
      { team: "red", lane: 0, x: 1390, y: 740, tier: 1 },
      { team: "red", lane: 0, x: 2570, y: 720, tier: 2 },
      { team: "blue", lane: 1, x: 1660, y: 2700, tier: 1 },
      { team: "blue", lane: 1, x: 2300, y: 2090, tier: 2 },
      { team: "red", lane: 1, x: 2600, y: 1780, tier: 1 },
      { team: "red", lane: 1, x: 3010, y: 1340, tier: 2 },
      { team: "blue", lane: 2, x: 1880, y: 3580, tier: 1 },
      { team: "blue", lane: 2, x: 2960, y: 3540, tier: 2 },
      { team: "red", lane: 2, x: 3470, y: 2350, tier: 1 },
      { team: "red", lane: 2, x: 3630, y: 1470, tier: 2 }
    ],
    jungleCamps: [
      { name: "星蓝魔像", x: 1360, y: 2070, color: "#55bfff", team: "neutral", scale: 1.1 },
      { name: "赤炎蜥王", x: 2810, y: 2210, color: "#ff875f", team: "neutral", scale: 1.1 },
      { name: "晶甲兽", x: 1750, y: 1160, color: "#83db9d", team: "neutral", scale: 0.9 },
      { name: "潮鸣兽", x: 3170, y: 3060, color: "#74c9d8", team: "neutral", scale: 0.9 }
    ],
    bushes: [
      { x: 1250, y: 1880, rx: 150, ry: 105 },
      { x: 2850, y: 2440, rx: 155, ry: 110 },
      { x: 1630, y: 3630, rx: 180, ry: 78 },
      { x: 3400, y: 1640, rx: 150, ry: 90 },
      { x: 1110, y: 890, rx: 135, ry: 90 },
      { x: 3090, y: 3290, rx: 160, ry: 100 }
    ]
  };

  window.MOBA_DATA = { HEROES, ROLES, ITEMS, MAP };
})();
