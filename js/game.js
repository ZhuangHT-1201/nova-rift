(() => {
  "use strict";

  const { HEROES, ROLES, ITEMS, MAP } = window.MOBA_DATA;
  const TAU = Math.PI * 2;
  const BLUE = "blue";
  const RED = "red";
  const NEUTRAL = "neutral";
  const HUD_KEYS = ["Q", "W", "E", "R"];
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const TEAM_COLORS = {
    blue: { main: "#65e7df", light: "#bcfff9", dark: "#134f50", soft: "rgba(83, 224, 213, 0.2)" },
    red: { main: "#ff6972", light: "#ffc1c4", dark: "#682d35", soft: "rgba(255, 92, 104, 0.2)" },
    neutral: { main: "#dabc7c", light: "#ffe6ad", dark: "#695939", soft: "rgba(217, 183, 108, 0.2)" }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const distanceSq = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };
  const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const normalize = (x, y) => {
    const length = Math.hypot(x, y) || 1;
    return { x: x / length, y: y / length, length };
  };
  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  };
  const pointSegmentDistance = (px, py, ax, ay, bx, by) => {
    const abx = bx - ax;
    const aby = by - ay;
    const lengthSq = abx * abx + aby * aby || 1;
    const t = clamp(((px - ax) * abx + (py - ay) * aby) / lengthSq, 0, 1);
    return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
  };

  function mulberry32(seed) {
    return function random() {
      let value = (seed += 0x6d2b79f5);
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  const surfaceGrain = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 192;
    const context = canvas.getContext("2d");
    const image = context.createImageData(192, 192);
    const random = mulberry32(91827);
    for (let i = 0; i < image.data.length; i += 4) {
      const value = Math.floor(80 + random() * 176);
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = Math.floor(random() * 34);
    }
    context.putImageData(image, 0, 0);
    return canvas;
  })();

  function applySurfaceGrain(ctx, width, height, alpha = 0.16, composite = "soft-light") {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = composite;
    ctx.fillStyle = ctx.createPattern(surfaceGrain, "repeat");
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const dom = {
    app: $("#app"),
    canvas: $("#gameCanvas"),
    menu: $("#mainMenu"),
    matchIntro: $("#matchIntro"),
    introHeroCanvas: $("#introHeroCanvas"),
    introBlue: $("#introBlue"),
    introRed: $("#introRed"),
    introHeroSigil: $("#introHeroSigil"),
    introHeroName: $("#introHeroName"),
    introHeroRole: $("#introHeroRole"),
    hud: $("#gameHud"),
    heroCanvas: $("#heroCanvas"),
    heroRoster: $("#heroRoster"),
    abilityPreview: $("#abilityPreview"),
    heroRole: $("#heroRole"),
    heroName: $("#heroName"),
    heroTitle: $("#heroTitle"),
    heroTagline: $("#heroTagline"),
    heroSigil: $("#heroSigil"),
    stageCaption: $("#stageCaption"),
    statDamage: $("#statDamage"),
    statSurvival: $("#statSurvival"),
    statDifficulty: $("#statDifficulty"),
    rosterCount: $("#rosterCount"),
    roleOptions: $("#roleOptions"),
    roleHint: $("#roleHint"),
    startBtn: $("#startBtn"),
    guideBtn: $("#guideBtn"),
    pauseBtn: $("#pauseBtn"),
    muteBtn: $("#muteBtn"),
    soundIcon: $("#soundIcon"),
    blueSquad: $("#blueSquad"),
    redSquad: $("#redSquad"),
    targetPanel: $("#targetPanel"),
    targetCrest: $("#targetCrest"),
    targetName: $("#targetName"),
    targetHealth: $("#targetHealth"),
    targetHealthText: $("#targetHealthText"),
    bossHud: $("#bossHud"),
    bossHudName: $("#bossHudName"),
    bossHudBar: $("#bossHudBar"),
    blueKills: $("#blueKills"),
    redKills: $("#redKills"),
    matchClock: $("#matchClock"),
    minimapTimer: $("#minimapTimer"),
    objectiveHint: $("#objectiveHint"),
    hudHeroSigil: $("#hudHeroSigil"),
    hudHeroName: $("#hudHeroName"),
    hudRole: $("#hudRole"),
    hudLevel: $("#hudLevel"),
    hudKda: $("#hudKda"),
    hudGold: $("#hudGold"),
    hpBar: $("#hpBar"),
    hpText: $("#hpText"),
    manaBar: $("#manaBar"),
    xpBar: $("#xpBar"),
    minimap: $("#minimap"),
    killFeed: $("#killFeed"),
    announcement: $("#announcement"),
    announcementKicker: $("#announcementKicker"),
    announcementText: $("#announcementText"),
    comboCallout: $("#comboCallout"),
    comboStatus: $("#comboStatus"),
    objectivePanel: $(".objective-panel"),
    objectiveStatus: $("#objectiveStatus"),
    statHint: $("#statHint"),
    attackBtn: $("#attackBtn"),
    recallBtn: $("#recallBtn"),
    shopBtn: $("#shopBtn"),
    itemBar: $("#itemBar"),
    recallIndicator: $("#recallIndicator"),
    recallProgress: $("#recallProgress"),
    deathOverlay: $("#deathOverlay"),
    respawnTimer: $("#respawnTimer"),
    touchStick: $("#touchStick"),
    stickKnob: $("#stickKnob"),
    scoreboard: $("#scoreboard"),
    scoreboardTeams: $("#scoreboardTeams"),
    shopModal: $("#shopModal"),
    shopGold: $("#shopGold"),
    shopItems: $("#shopItems"),
    shopSlots: $("#shopSlots"),
    shopStats: $("#shopStats"),
    guideModal: $("#guideModal"),
    pauseModal: $("#pauseModal"),
    resumeBtn: $("#resumeBtn"),
    quitBtn: $("#quitBtn"),
    resultModal: $("#resultModal"),
    resultTitle: $("#resultTitle"),
    resultSubtitle: $("#resultSubtitle"),
    resultKicker: $("#resultKicker"),
    resultDuration: $("#resultDuration"),
    resultKda: $("#resultKda"),
    resultDamage: $("#resultDamage"),
    playAgainBtn: $("#playAgainBtn"),
    toast: $("#toast"),
    damageFlash: $("#damageFlash")
  };

  const mainContext = dom.canvas.getContext("2d");
  const portraitContext = dom.heroCanvas.getContext("2d");
  const introPortraitContext = dom.introHeroCanvas.getContext("2d");
  const hudRefs = {
    abilityButtons: HUD_KEYS.map((key) => $(`[data-skill="${key}"]`)),
    cooldownNodes: HUD_KEYS.map((key) => $(`#cd${key}`))
  };
  const menuBackdropCache = document.createElement("canvas");
  const menuBackdropContext = menuBackdropCache.getContext("2d");
  let menuBackdropStamp = "";

  class AudioEngine {
    constructor() {
      this.context = null;
      this.muted = false;
      this.master = null;
    }

    init() {
      if (this.context) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);
    }

    tone(frequency, duration, type = "sine", volume = 0.2, slide = 0) {
      if (!this.context || this.muted) return;
      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.03);
    }

    noise(duration = 0.12, volume = 0.14, highpass = 240) {
      if (!this.context || this.muted) return;
      const rate = this.context.sampleRate;
      const buffer = this.context.createBuffer(1, Math.floor(rate * duration), rate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      filter.type = "highpass";
      filter.frequency.value = highpass;
      gain.gain.setValueAtTime(volume, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      source.start();
    }

    click() {
      this.tone(620, 0.055, "sine", 0.1, 120);
    }

    attack() {
      this.noise(0.055, 0.08, 1400);
      this.tone(180, 0.08, "triangle", 0.08, -60);
    }

    impact() {
      this.noise(0.11, 0.09, 320);
      this.tone(90, 0.13, "sine", 0.12, -35);
    }

    skill(ultimate = false) {
      const base = ultimate ? 170 : 330;
      this.tone(base, ultimate ? 0.55 : 0.22, "triangle", ultimate ? 0.22 : 0.13, ultimate ? 300 : 140);
      this.noise(ultimate ? 0.35 : 0.14, ultimate ? 0.1 : 0.055, ultimate ? 140 : 700);
    }

    recall() {
      this.tone(310, 0.45, "sine", 0.1, 310);
      setTimeout(() => this.tone(470, 0.55, "sine", 0.08, 220), 180);
    }

    kill() {
      this.tone(420, 0.14, "triangle", 0.13, 170);
      setTimeout(() => this.tone(640, 0.22, "sine", 0.1, 120), 90);
    }

    defeat() {
      this.tone(220, 0.7, "sine", 0.12, -120);
      setTimeout(() => this.tone(150, 0.9, "triangle", 0.09, -60), 180);
    }
  }

  const audio = new AudioEngine();

  class MapArt {
    constructor() {
      this.canvas = document.createElement("canvas");
      this.canvas.width = 2100;
      this.canvas.height = 2100;
      this.context = this.canvas.getContext("2d");
      this.build();
    }

    smoothPath(ctx, points, closed = false) {
      if (!points.length) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
      if (closed) ctx.closePath();
    }

    drawTree(ctx, x, y, scale = 1, random = Math.random) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(2, 15, 14, 0.24)";
      ctx.beginPath();
      ctx.ellipse(21, 35, 59, 21, 0.4, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(51, 54, 38, 0.9)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(3, 31);
      ctx.quadraticCurveTo(8, -1, 4, -35);
      ctx.moveTo(7, -4);
      ctx.lineTo(-15, -25);
      ctx.moveTo(7, -14);
      ctx.lineTo(25, -38);
      ctx.stroke();
      ctx.lineCap = "butt";

      const clusters = [
        { x: 0, y: -45, r: 34 },
        { x: -29, y: -31, r: 25 },
        { x: 30, y: -32, r: 27 },
        { x: -13, y: -65, r: 22 },
        { x: 18, y: -63, r: 20 },
        { x: 1, y: -20, r: 27 }
      ];
      clusters.forEach((cluster, index) => {
        const gradient = ctx.createRadialGradient(
          cluster.x - cluster.r * 0.35,
          cluster.y - cluster.r * 0.4,
          1,
          cluster.x,
          cluster.y,
          cluster.r
        );
        gradient.addColorStop(0, index % 3 === 0 ? "rgba(128, 169, 102, 0.76)" : "rgba(82, 136, 87, 0.8)");
        gradient.addColorStop(0.55, "rgba(35, 91, 64, 0.92)");
        gradient.addColorStop(1, "rgba(8, 36, 31, 0.3)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cluster.x + (random() - 0.5) * 5, cluster.y + (random() - 0.5) * 4, cluster.r + random() * 4, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(179, 211, 139, 0.14)";
      ctx.beginPath();
      ctx.arc(-20, -61, 10, 0, TAU);
      ctx.arc(21, -52, 7, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    drawRock(ctx, x, y, scale, random) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((random() - 0.5) * 0.8);
      const gradient = ctx.createLinearGradient(0, -30 * scale, 0, 24 * scale);
      gradient.addColorStop(0, "rgba(91, 116, 103, 0.9)");
      gradient.addColorStop(0.4, "rgba(45, 72, 66, 0.95)");
      gradient.addColorStop(1, "rgba(22, 42, 40, 0.45)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-25 * scale, 18 * scale);
      ctx.lineTo(-18 * scale, -15 * scale);
      ctx.lineTo(-3 * scale, -32 * scale);
      ctx.lineTo(22 * scale, -18 * scale);
      ctx.lineTo(29 * scale, 9 * scale);
      ctx.lineTo(12 * scale, 23 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(151, 171, 147, 0.12)";
      ctx.beginPath();
      ctx.moveTo(-18 * scale, -15 * scale);
      ctx.lineTo(-3 * scale, -32 * scale);
      ctx.lineTo(8 * scale, -15 * scale);
      ctx.lineTo(-4 * scale, -8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawRidge(ctx, x, y, scale, random) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = "rgba(2, 12, 12, 0.3)";
      ctx.beginPath();
      ctx.ellipse(10, 30, 86, 29, 0.1, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const px = (random() - 0.5) * 88;
        const py = (random() - 0.5) * 36;
        const width = 30 + random() * 42;
        const height = 20 + random() * 37;
        const rock = ctx.createLinearGradient(px - width, py - height, px + width, py + height);
        rock.addColorStop(0, "rgba(107, 121, 98, 0.55)");
        rock.addColorStop(0.38, "rgba(57, 78, 68, 0.8)");
        rock.addColorStop(1, "rgba(18, 43, 39, 0.76)");
        ctx.fillStyle = rock;
        ctx.beginPath();
        ctx.moveTo(px - width * 0.62, py + height * 0.45);
        ctx.lineTo(px - width * 0.23, py - height);
        ctx.lineTo(px + width * 0.25, py - height * 0.73);
        ctx.lineTo(px + width * 0.67, py + height * 0.35);
        ctx.lineTo(px + width * 0.18, py + height * 0.67);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(186, 195, 151, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(71, 121, 72, 0.23)";
        ctx.beginPath();
        ctx.ellipse(px - width * 0.05, py - height * 0.67, width * 0.34, height * 0.18, -0.1, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    build() {
      const ctx = this.context;
      const random = mulberry32(47291);
      ctx.scale(0.5, 0.5);
      const ground = ctx.createRadialGradient(1900, 1700, 100, 2100, 2100, 2900);
      ground.addColorStop(0, "#1b4334");
      ground.addColorStop(0.52, "#103129");
      ground.addColorStop(1, "#081d1a");
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, MAP.size, MAP.size);

      for (let i = 0; i < 165; i++) {
        const radius = 90 + random() * 280;
        const x = random() * MAP.size;
        const y = random() * MAP.size;
        ctx.fillStyle = random() > 0.52 ? "rgba(55, 105, 76, 0.08)" : "rgba(8, 35, 32, 0.2)";
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * (0.4 + random() * 0.45), random() * TAU, 0, TAU);
        ctx.fill();
      }

      for (let i = 0; i < 340; i++) {
        const edgeBias = random();
        let x = random() * 4100 + 50;
        let y = random() * 4100 + 50;
        if (edgeBias < 0.35) {
          if (random() > 0.5) x = 120 + random() * 310;
          else x = 3700 + random() * 380;
        } else if (edgeBias > 0.72) {
          if (random() > 0.5) y = 100 + random() * 310;
          else y = 3680 + random() * 400;
        }
        this.drawTree(ctx, x, y, 0.6 + random() * 1.15, random);
      }

      for (let i = 0; i < 90; i++) {
        const x = 80 + random() * 4040;
        const y = 80 + random() * 4040;
        if (random() > 0.35) this.drawRock(ctx, x, y, 0.32 + random() * 0.5, random);
      }

      // Winding river.
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const river = new Path2D();
      river.moveTo(250, 1520);
      river.bezierCurveTo(920, 1680, 1350, 2120, 2110, 2380);
      river.bezierCurveTo(2870, 2640, 3210, 2520, 3960, 3270);
      ctx.strokeStyle = "rgba(4, 20, 25, 0.75)";
      ctx.lineWidth = 390;
      ctx.stroke(river);
      const riverGradient = ctx.createLinearGradient(300, 1600, 3800, 3200);
      riverGradient.addColorStop(0, "rgba(35, 96, 108, 0.97)");
      riverGradient.addColorStop(0.45, "rgba(31, 111, 121, 0.98)");
      riverGradient.addColorStop(1, "rgba(20, 77, 92, 0.96)");
      ctx.strokeStyle = riverGradient;
      ctx.lineWidth = 315;
      ctx.stroke(river);
      ctx.strokeStyle = "rgba(86, 176, 176, 0.2)";
      ctx.lineWidth = 145;
      ctx.stroke(river);
      ctx.strokeStyle = "rgba(174, 238, 224, 0.11)";
      ctx.lineWidth = 3;
      ctx.setLineDash([75, 90]);
      ctx.stroke(river);
      ctx.setLineDash([]);
      ctx.restore();

      for (let i = 0; i < 90; i++) {
        const t = i / 90;
        const x = lerp(480, 3740, t) + Math.sin(t * 9) * 160;
        const y = lerp(1740, 3100, t) + Math.sin(t * 7) * 110;
        ctx.strokeStyle = `rgba(166, 237, 227, ${0.025 + random() * 0.055})`;
        ctx.lineWidth = 2 + random() * 3;
        ctx.beginPath();
        ctx.ellipse(x, y, 35 + random() * 75, 2.5 + random() * 5, Math.sin(t * 3), 0, TAU);
        ctx.stroke();
      }

      const riverSegments = [
        [{ x: 250, y: 1520 }, { x: 920, y: 1680 }, { x: 1350, y: 2120 }, { x: 2110, y: 2380 }],
        [{ x: 2110, y: 2380 }, { x: 2870, y: 2640 }, { x: 3210, y: 2520 }, { x: 3960, y: 3270 }]
      ];
      const riverPoint = (segment, t) => {
        const u = 1 - t;
        return {
          x: u * u * u * segment[0].x + 3 * u * u * t * segment[1].x + 3 * u * t * t * segment[2].x + t * t * t * segment[3].x,
          y: u * u * u * segment[0].y + 3 * u * u * t * segment[1].y + 3 * u * t * t * segment[2].y + t * t * t * segment[3].y,
          dx: 3 * u * u * (segment[1].x - segment[0].x) + 6 * u * t * (segment[2].x - segment[1].x) + 3 * t * t * (segment[3].x - segment[2].x),
          dy: 3 * u * u * (segment[1].y - segment[0].y) + 6 * u * t * (segment[2].y - segment[1].y) + 3 * t * t * (segment[3].y - segment[2].y)
        };
      };
      riverSegments.forEach((segment, segmentIndex) => {
        for (let i = 0; i < 54; i++) {
          const t = i / 53;
          const point = riverPoint(segment, t);
          const length = Math.hypot(point.dx, point.dy) || 1;
          const nx = -point.dy / length;
          const ny = point.dx / length;
          [-1, 1].forEach((side) => {
            const edge = 145 + random() * 16;
            const x = point.x + nx * edge * side;
            const y = point.y + ny * edge * side;
            ctx.strokeStyle = `rgba(182, 232, 222, ${0.08 + random() * 0.08})`;
            ctx.lineWidth = 1 + random() * 1.5;
            ctx.beginPath();
            ctx.ellipse(x, y, 8 + random() * 18, 1.5 + random() * 2.5, Math.atan2(point.dy, point.dx), 0, TAU);
            ctx.stroke();
            if (random() > 0.68) {
              ctx.fillStyle = "rgba(59, 85, 65, 0.48)";
              ctx.beginPath();
              ctx.arc(x + nx * random() * 20, y + ny * random() * 20, 3 + random() * 6, 0, TAU);
              ctx.fill();
            }
          });
        }
      });
      for (let i = 0; i < 34; i++) {
        const segment = riverSegments[Math.floor(random() * riverSegments.length)];
        const point = riverPoint(segment, 0.12 + random() * 0.76);
        const length = Math.hypot(point.dx, point.dy) || 1;
        const lateral = (random() - 0.5) * 235;
        const x = point.x - point.dy / length * lateral;
        const y = point.y + point.dx / length * lateral;
        ctx.fillStyle = random() > 0.45 ? "rgba(65, 122, 88, 0.24)" : "rgba(66, 143, 124, 0.16)";
        ctx.beginPath();
        ctx.ellipse(x, y, 10 + random() * 19, 5 + random() * 9, random() * TAU, 0, TAU);
        ctx.fill();
        if (random() > 0.68) {
          ctx.fillStyle = "rgba(224, 196, 130, 0.28)";
          ctx.beginPath();
          ctx.arc(x + 3, y - 2, 2.5, 0, TAU);
          ctx.fill();
        }
      }

      // Three curving lanes.
      MAP.lanes.forEach((lane, laneIndex) => {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        this.smoothPath(ctx, lane.points);
        ctx.strokeStyle = "rgba(5, 21, 18, 0.66)";
        ctx.lineWidth = laneIndex === 1 ? 208 : 194;
        ctx.stroke();
        this.smoothPath(ctx, lane.points);
        ctx.strokeStyle = laneIndex === 2 ? "rgba(78, 91, 63, 0.97)" : "rgba(87, 96, 67, 0.97)";
        ctx.lineWidth = laneIndex === 1 ? 178 : 166;
        ctx.stroke();
        this.smoothPath(ctx, lane.points);
        ctx.strokeStyle = laneIndex === 1 ? "rgba(102, 104, 72, 0.6)" : "rgba(112, 107, 76, 0.58)";
        ctx.lineWidth = laneIndex === 1 ? 126 : 116;
        ctx.stroke();
        this.smoothPath(ctx, lane.points);
        ctx.strokeStyle = "rgba(196, 174, 111, 0.09)";
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 28]);
        ctx.stroke();
        ctx.restore();
      });

      // Broken curb stones and low scrub soften the lane boundaries.
      MAP.lanes.forEach((lane, laneIndex) => {
        const halfWidth = laneIndex === 1 ? 89 : 84;
        for (let segment = 0; segment < lane.points.length - 1; segment++) {
          const a = lane.points[segment];
          const b = lane.points[segment + 1];
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          const normalX = Math.cos(angle + Math.PI / 2);
          const normalY = Math.sin(angle + Math.PI / 2);
          for (let step = 0; step < 23; step++) {
            const t = (step + random() * 0.7) / 23;
            const centerX = lerp(a.x, b.x, t);
            const centerY = lerp(a.y, b.y, t);
            [-1, 1].forEach((side) => {
              if (random() < 0.42) return;
              const distanceFromCenter = halfWidth + 12 + random() * 17;
              const x = centerX + normalX * distanceFromCenter * side;
              const y = centerY + normalY * distanceFromCenter * side;
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(angle + side * 0.2);
              if (random() > 0.47) {
                ctx.fillStyle = random() > 0.5 ? "rgba(49, 74, 60, 0.82)" : "rgba(77, 99, 74, 0.66)";
                ctx.beginPath();
                ctx.ellipse(0, 0, 11 + random() * 15, 6 + random() * 8, 0, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(143, 172, 124, 0.12)";
                ctx.beginPath();
                ctx.arc(-3, -3, 4 + random() * 5, 0, TAU);
                ctx.fill();
              } else {
                ctx.fillStyle = "rgba(86, 100, 86, 0.72)";
                ctx.beginPath();
                ctx.moveTo(-10, 5);
                ctx.lineTo(-7, -6);
                ctx.lineTo(2, -11);
                ctx.lineTo(10, -3);
                ctx.lineTo(8, 6);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "rgba(191, 191, 157, 0.11)";
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
              ctx.restore();
            });
          }
        }
      });

      // Loose cobbles make the roads feel travelled.
      for (let i = 0; i < 480; i++) {
        const lane = MAP.lanes[Math.floor(random() * MAP.lanes.length)];
        const index = Math.floor(random() * (lane.points.length - 1));
        const a = lane.points[index];
        const b = lane.points[index + 1];
        const t = random();
        const x = lerp(a.x, b.x, t) + (random() - 0.5) * 150;
        const y = lerp(a.y, b.y, t) + (random() - 0.5) * 150;
        ctx.fillStyle = `rgba(207, 190, 139, ${0.035 + random() * 0.075})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 2 + random() * 7, 1 + random() * 3, random() * TAU, 0, TAU);
        ctx.fill();
      }

      // Crossing stones at the river.
      const bridgePoints = [
        { x: 2020, y: 2370, angle: -0.56 },
        { x: 1010, y: 2590, angle: 0.25 },
        { x: 3290, y: 3020, angle: -0.72 }
      ];
      bridgePoints.forEach((bridge, index) => {
        ctx.save();
        ctx.translate(bridge.x, bridge.y);
        ctx.rotate(bridge.angle);
        ctx.fillStyle = "rgba(11, 31, 29, 0.55)";
        ctx.fillRect(-index * 10 + 8, -88, 240 + index * 20, 176);
        ctx.fillStyle = "rgba(24, 43, 39, 0.9)";
        ctx.fillRect(-25, -100, 290, 12);
        ctx.fillRect(-25, 88, 290, 12);
        ctx.strokeStyle = "rgba(213, 190, 130, 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-22, -94);
        ctx.lineTo(260, -94);
        ctx.moveTo(-22, 94);
        ctx.lineTo(260, 94);
        ctx.stroke();
        ctx.fillStyle = "rgba(90, 102, 88, 0.78)";
        for (let x = -index * 10; x < 248; x += 24) {
          ctx.fillRect(x, -78, 19, 156);
          ctx.fillStyle = "rgba(166, 180, 151, 0.11)";
          ctx.fillRect(x + 2, -75, 2, 150);
          ctx.fillStyle = "rgba(90, 102, 88, 0.78)";
        }
        for (let x = -12; x < 252; x += 56) {
          [-1, 1].forEach((side) => {
            ctx.fillStyle = "rgba(36, 53, 48, 0.95)";
            ctx.fillRect(x - 3, side * 89 - 4, 7, 19);
            ctx.fillStyle = "rgba(223, 188, 108, 0.19)";
            ctx.beginPath();
            ctx.arc(x, side * 89, 4, 0, TAU);
            ctx.fill();
          });
        }
        ctx.restore();
      });

      // Arena edge rock wall.
      ctx.strokeStyle = "rgba(3, 13, 13, 0.9)";
      ctx.lineWidth = 150;
      ctx.strokeRect(35, 35, 4130, 4130);
      ctx.strokeStyle = "rgba(84, 111, 89, 0.14)";
      ctx.lineWidth = 7;
      ctx.strokeRect(115, 115, 3970, 3970);
      for (let i = 0; i < 100; i++) {
        const side = Math.floor(random() * 4);
        const offset = random() * 4050 + 70;
        const x = side < 2 ? offset : side === 2 ? 90 + random() * 50 : 4110 + random() * 20;
        const y = side < 2 ? (side === 0 ? 90 + random() * 40 : 4110 + random() * 20) : offset;
        this.drawRock(ctx, x, y, 0.5 + random() * 0.85, random);
      }

      // Camps and brush beds.
      MAP.jungleCamps.forEach((camp) => {
        const glow = ctx.createRadialGradient(camp.x, camp.y, 3, camp.x, camp.y, 125);
        glow.addColorStop(0, `${camp.color}33`);
        glow.addColorStop(0.55, `${camp.color}10`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(camp.x, camp.y, 130, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(173, 217, 196, 0.12)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(camp.x, camp.y, 83, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([9, 15]);
        ctx.beginPath();
        ctx.arc(camp.x, camp.y, 95, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      MAP.bushes.forEach((bush) => {
        ctx.fillStyle = "rgba(13, 54, 38, 0.78)";
        ctx.beginPath();
        ctx.ellipse(bush.x, bush.y, bush.rx, bush.ry, 0.2, 0, TAU);
        ctx.fill();
        for (let i = 0; i < 20; i++) {
          const angle = random() * TAU;
          const radius = Math.sqrt(random());
          const x = bush.x + Math.cos(angle) * bush.rx * radius;
          const y = bush.y + Math.sin(angle) * bush.ry * radius;
          ctx.fillStyle = random() > 0.5 ? "rgba(71, 130, 79, 0.36)" : "rgba(38, 99, 63, 0.55)";
          ctx.beginPath();
          ctx.ellipse(x, y, 13 + random() * 18, 8 + random() * 11, angle, 0, TAU);
          ctx.fill();
        }
      });

      // Boss rune.
      ctx.save();
      ctx.translate(MAP.bossSpawn.x, MAP.bossSpawn.y);
      ctx.strokeStyle = "rgba(225, 190, 105, 0.17)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 175, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 139, 0, TAU);
      ctx.stroke();
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-104, -104, 208, 208);
      ctx.restore();

      // Base plates.
      this.drawBasePlate(ctx, MAP.blueBase.x, MAP.blueBase.y, TEAM_COLORS.blue.main);
      this.drawBasePlate(ctx, MAP.redBase.x, MAP.redBase.y, TEAM_COLORS.red.main);

      // Fine forest floor detail.
      for (let i = 0; i < 1100; i++) {
        const x = 100 + random() * 4000;
        const y = 100 + random() * 4000;
        ctx.fillStyle = random() > 0.5 ? "rgba(145, 184, 129, 0.055)" : "rgba(4, 20, 18, 0.11)";
        ctx.fillRect(x, y, 1 + random() * 2, 1 + random() * 4);
      }

      const laneClearance = (x, y) => {
        let nearest = Infinity;
        MAP.lanes.forEach((lane) => {
          for (let i = 0; i < lane.points.length - 1; i++) {
            const a = lane.points[i];
            const b = lane.points[i + 1];
            nearest = Math.min(nearest, pointSegmentDistance(x, y, a.x, a.y, b.x, b.y));
          }
        });
        return nearest;
      };

      // Carved paving stones break up the road surfaces.
      for (let i = 0; i < 1450; i++) {
        const lane = MAP.lanes[Math.floor(random() * MAP.lanes.length)];
        const segment = Math.floor(random() * (lane.points.length - 1));
        const a = lane.points[segment];
        const b = lane.points[segment + 1];
        const t = random();
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const lateral = (random() - 0.5) * 108;
        const along = (random() - 0.5) * 34;
        const x = lerp(a.x, b.x, t) + Math.cos(angle + Math.PI / 2) * lateral + Math.cos(angle) * along;
        const y = lerp(a.y, b.y, t) + Math.sin(angle + Math.PI / 2) * lateral + Math.sin(angle) * along;
        const width = 7 + random() * 17;
        const height = 3 + random() * 8;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + (random() - 0.5) * 0.24);
        ctx.fillStyle = random() > 0.72 ? "rgba(201, 190, 143, 0.115)" : "rgba(37, 57, 48, 0.16)";
        roundedRect(ctx, -width / 2, -height / 2, width, height, 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(232, 216, 158, 0.055)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }

      // Moss, fern tufts and tiny luminous flowers in the jungle.
      for (let i = 0; i < 1600; i++) {
        const x = 120 + random() * 3960;
        const y = 120 + random() * 3960;
        if (laneClearance(x, y) < 118) continue;
        const height = 4 + random() * 13;
        ctx.strokeStyle = random() > 0.4 ? "rgba(93, 136, 89, 0.2)" : "rgba(151, 180, 116, 0.13)";
        ctx.lineWidth = 0.8 + random() * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 3, y - height * 0.5, x - 4 - random() * 3, y - height);
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 4, y - height * 0.6, x + 3 + random() * 4, y - height * 0.8);
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 2, y - height * 0.7, x + 8, y - height * 0.6);
        ctx.stroke();
      }

      for (let i = 0; i < 260; i++) {
        const x = 150 + random() * 3900;
        const y = 150 + random() * 3900;
        if (laneClearance(x, y) < 125) continue;
        const color = random() > 0.7 ? "rgba(235, 208, 133, 0.24)" : "rgba(137, 201, 187, 0.17)";
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 1.1 + random() * 1.7, 0, TAU);
        ctx.fill();
      }

      // Broken shrine fragments lend the jungle a lived-in history.
      const ruins = [
        { x: 1330, y: 1780, scale: 0.9, rotation: -0.18 },
        { x: 2900, y: 2060, scale: 1.1, rotation: 0.24 },
        { x: 1440, y: 3080, scale: 0.72, rotation: 0.2 },
        { x: 3170, y: 2900, scale: 0.82, rotation: -0.28 },
        { x: 2050, y: 1160, scale: 0.65, rotation: 0.12 }
      ];
      ruins.forEach((ruin) => {
        ctx.save();
        ctx.translate(ruin.x, ruin.y);
        ctx.rotate(ruin.rotation);
        ctx.scale(ruin.scale, ruin.scale);
        ctx.fillStyle = "rgba(6, 20, 18, 0.28)";
        ctx.beginPath();
        ctx.ellipse(10, 44, 94, 31, 0, 0, TAU);
        ctx.fill();
        [-1, 1].forEach((flip) => {
          const pillar = ctx.createLinearGradient(flip * 44, -80, flip * 78, 55);
          pillar.addColorStop(0, "rgba(92, 113, 99, 0.4)");
          pillar.addColorStop(0.45, "rgba(42, 67, 62, 0.55)");
          pillar.addColorStop(1, "rgba(9, 27, 26, 0.22)");
          ctx.fillStyle = pillar;
          ctx.beginPath();
          ctx.moveTo(flip * 37, 45);
          ctx.lineTo(flip * 47, -58);
          ctx.lineTo(flip * 68, -68);
          ctx.lineTo(flip * 75, 39);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(174, 190, 150, 0.1)";
          ctx.fillRect(flip * 48 - 3, -51, 4, 80);
        });
        ctx.strokeStyle = "rgba(70, 98, 85, 0.32)";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-67, -58);
        ctx.quadraticCurveTo(0, -112, 69, -61);
        ctx.stroke();
        ctx.strokeStyle = "rgba(224, 191, 111, 0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-35, -72);
        ctx.quadraticCurveTo(0, -98, 34, -72);
        ctx.stroke();
        ctx.restore();
      });

      const riverClearance = (x, y) => {
        let nearest = Infinity;
        riverSegments.forEach((segment) => {
          for (let i = 0; i <= 28; i++) {
            const point = riverPoint(segment, i / 28);
            nearest = Math.min(nearest, Math.hypot(x - point.x, y - point.y));
          }
        });
        return nearest;
      };
      for (let i = 0; i < 78; i++) {
        const x = 180 + random() * 3840;
        const y = 180 + random() * 3840;
        if (laneClearance(x, y) < 175 || riverClearance(x, y) < 175) continue;
        if (Math.hypot(x - MAP.blueBase.x, y - MAP.blueBase.y) < 460) continue;
        if (Math.hypot(x - MAP.redBase.x, y - MAP.redBase.y) < 460) continue;
        if (Math.hypot(x - MAP.bossSpawn.x, y - MAP.bossSpawn.y) < 320) continue;
        if (MAP.jungleCamps.some((camp) => Math.hypot(x - camp.x, y - camp.y) < 190)) continue;
        this.drawRidge(ctx, x, y, 0.58 + random() * 0.75, random);
      }

      // Subtle terrain grain keeps broad surfaces from reading as flat fills.
      const noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = 128;
      noiseCanvas.height = 128;
      const noiseContext = noiseCanvas.getContext("2d");
      const noiseImage = noiseContext.createImageData(128, 128);
      for (let i = 0; i < noiseImage.data.length; i += 4) {
        const value = Math.floor(120 + random() * 130);
        noiseImage.data[i] = value;
        noiseImage.data[i + 1] = value;
        noiseImage.data[i + 2] = value;
        noiseImage.data[i + 3] = Math.floor(7 + random() * 20);
      }
      noiseContext.putImageData(noiseImage, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = ctx.createPattern(noiseCanvas, "repeat");
      ctx.fillRect(0, 0, MAP.size, MAP.size);
      ctx.restore();
    }

    drawBasePlate(ctx, x, y, color) {
      const glow = ctx.createRadialGradient(x, y, 20, x, y, 370);
      glow.addColorStop(0, `${color}26`);
      glow.addColorStop(0.5, `${color}0e`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 390, 0, TAU);
      ctx.fill();
      const floor = ctx.createRadialGradient(x, y, 12, x, y, 292);
      floor.addColorStop(0, "rgba(44, 68, 62, 0.56)");
      floor.addColorStop(0.52, "rgba(24, 48, 43, 0.38)");
      floor.addColorStop(1, "rgba(8, 25, 23, 0.04)");
      ctx.fillStyle = floor;
      ctx.beginPath();
      ctx.arc(x, y, 294, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `${color}34`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(x, y, 268, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(202, 190, 142, 0.12)";
      ctx.lineWidth = 1.2;
      for (let ring = 0; ring < 4; ring++) {
        ctx.beginPath();
        ctx.arc(x, y, 72 + ring * 46, 0, TAU);
        ctx.stroke();
      }
      for (let i = 0; i < 24; i++) {
        const angle = i / 24 * TAU;
        ctx.save();
        ctx.translate(x + Math.cos(angle) * 248, y + Math.sin(angle) * 248);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = i % 3 === 0 ? `${color}24` : "rgba(193, 178, 130, 0.07)";
        roundedRect(ctx, -13, -20, 26, 40, 3);
        ctx.fill();
        ctx.restore();
      }
      ctx.lineWidth = 2;
      ctx.setLineDash([38, 25]);
      ctx.beginPath();
      ctx.arc(x, y, 310, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * TAU;
        ctx.save();
        ctx.translate(x + Math.cos(angle) * 225, y + Math.sin(angle) * 225);
        ctx.rotate(angle);
        ctx.fillStyle = `${color}35`;
        ctx.fillRect(-8, -42, 16, 84);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.22;
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, -39, 4.5, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = `${color}48`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 165, y);
      ctx.lineTo(x + 165, y);
      ctx.moveTo(x, y - 165);
      ctx.lineTo(x, y + 165);
      ctx.stroke();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = `${color}61`;
      ctx.lineWidth = 2;
      ctx.strokeRect(-77, -77, 154, 154);
      ctx.strokeRect(-52, -52, 104, 104);
      ctx.restore();
    }
  }

  const mapArt = new MapArt();

  function drawHeroPortrait(ctx, hero, time) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);
    const bob = Math.sin(time * 0.0015) * 5;
    const cx = width * 0.53;
    const baseY = height * 0.84 + bob;
    const scale = width / 670;

    // Ambient halo and dust.
    const halo = ctx.createRadialGradient(cx, 330, 24, cx, 360, 360);
    halo.addColorStop(0, `${hero.color}35`);
    halo.addColorStop(0.4, `${hero.color}12`);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, 360, 360, 0, TAU);
    ctx.fill();

    // Painted stage: eclipse, ruined gate and distant floating shards.
    const eclipse = ctx.createRadialGradient(cx - 20, 213, 12, cx - 20, 240, 196);
    eclipse.addColorStop(0, "rgba(223, 244, 237, 0.13)");
    eclipse.addColorStop(0.58, `${hero.color}0c`);
    eclipse.addColorStop(1, "rgba(1, 8, 10, 0)");
    ctx.fillStyle = eclipse;
    ctx.beginPath();
    ctx.arc(cx - 20, 240, 196, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `${hero.color}2c`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx - 20, 240, 126, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "rgba(232, 206, 139, 0.1)";
    ctx.setLineDash([2, 10]);
    ctx.beginPath();
    ctx.arc(cx - 20, 240, 158, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(cx + side * 258, 338);
      ctx.rotate(side * -0.04);
      const pillar = ctx.createLinearGradient(-44, -150, 58, 150);
      pillar.addColorStop(0, "rgba(82, 113, 101, 0.25)");
      pillar.addColorStop(0.45, "rgba(24, 51, 48, 0.46)");
      pillar.addColorStop(1, "rgba(5, 17, 18, 0.08)");
      ctx.fillStyle = pillar;
      ctx.beginPath();
      ctx.moveTo(-40, -128);
      ctx.lineTo(32, -164);
      ctx.lineTo(48, 122);
      ctx.lineTo(-33, 156);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `${hero.color}12`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(160, 187, 165, 0.1)";
      ctx.beginPath();
      ctx.moveTo(-66, -145);
      ctx.lineTo(43, -190);
      ctx.lineTo(55, -161);
      ctx.lineTo(-41, -124);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(4, 14, 15, 0.28)";
      ctx.fillRect(-22, -78, 3, 223);
      ctx.fillRect(18, -94, 2, 214);
      ctx.restore();
    }

    for (let i = 0; i < 22; i++) {
      const px = cx + Math.sin(i * 8.39 + time * 0.00005) * (105 + (i % 6) * 39);
      const py = 130 + ((i * 47 + time * 0.012) % 420);
      const alpha = 0.08 + (i % 4) * 0.022;
      ctx.fillStyle = i % 5 === 0 ? `rgba(242, 211, 139, ${alpha + 0.08})` : `${hero.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
      ctx.beginPath();
      ctx.arc(px, py, i % 5 === 0 ? 1.8 : 1.1, 0, TAU);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, 542);
    ctx.strokeStyle = `${hero.color}12`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 240 + i * 29, 39 + i * 8, -0.04, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(scale, scale);
    ctx.rotate(-0.018);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = hero.color;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 9]);
    ctx.beginPath();
    ctx.arc(0, -280, 235, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU + time * 0.00009;
      const radius = 245 + Math.sin(time * 0.001 + i) * 16;
      ctx.fillStyle = i % 3 === 0 ? "#f2d28e" : hero.color;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * radius, -280 + Math.sin(angle) * radius, i % 3 === 0 ? 2.2 : 1.2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Ground shadow.
    const shadow = ctx.createRadialGradient(0, 0, 2, 0, 0, 190);
    shadow.addColorStop(0, "rgba(0,0,0,0.48)");
    shadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(0, 4, 190, 38, 0, 0, TAU);
    ctx.fill();

    // Energy ribbons and grounded armor read behind the main silhouette.
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 3; i++) {
      const sway = Math.sin(time * 0.0011 + i * 1.7) * 22;
      ctx.strokeStyle = `${hero.color}${i === 1 ? "3b" : "22"}`;
      ctx.lineWidth = 2.1 - i * 0.4;
      ctx.beginPath();
      ctx.moveTo(i * 32 - 35, -292);
      ctx.bezierCurveTo(-166 - i * 16, -247 + sway, -194 - i * 24, -112, -250 - i * 22, -58 + sway);
      ctx.stroke();
    }
    ctx.restore();

    const bootGradient = ctx.createLinearGradient(-50, -75, 40, 5);
    bootGradient.addColorStop(0, "#31484a");
    bootGradient.addColorStop(0.35, "#15272b");
    bootGradient.addColorStop(1, "#061214");
    ctx.fillStyle = bootGradient;
    ctx.strokeStyle = `${hero.color}62`;
    ctx.lineWidth = 1.2;
    [-1, 1].forEach((flip) => {
      ctx.beginPath();
      ctx.moveTo(flip * 8, -104);
      ctx.lineTo(flip * 49, -94);
      ctx.lineTo(flip * 58, -15);
      ctx.quadraticCurveTo(flip * 51, 1, flip * 28, 2);
      ctx.lineTo(flip * 2, -1);
      ctx.lineTo(flip * 17, -91);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(233, 207, 142, 0.38)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flip * 15, -72);
      ctx.lineTo(flip * 50, -61);
      ctx.stroke();
      ctx.strokeStyle = `${hero.color}62`;
      ctx.lineWidth = 1.2;
    });

    // Cloak / silhouette.
    const cloak = ctx.createLinearGradient(-100, -320, 100, -15);
    cloak.addColorStop(0, hero.color);
    cloak.addColorStop(0.42, hero.color2);
    cloak.addColorStop(1, "#071416");
    ctx.fillStyle = cloak;
    ctx.beginPath();
    ctx.moveTo(-48, -345);
    ctx.bezierCurveTo(-125, -305, -145, -150, -205, -14);
    ctx.quadraticCurveTo(-45, 28, 12, -10);
    ctx.quadraticCurveTo(82, 30, 216, -8);
    ctx.bezierCurveTo(143, -180, 106, -300, 43, -349);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `${hero.color}aa`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner robe.
    const robe = ctx.createLinearGradient(0, -320, 20, -35);
    robe.addColorStop(0, "#14252b");
    robe.addColorStop(0.55, "#0d1a20");
    robe.addColorStop(1, `rgba(10, 21, 23, 0.5)`);
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(-30, -320);
    ctx.lineTo(35, -325);
    ctx.lineTo(82, -20);
    ctx.lineTo(-18, -13);
    ctx.lineTo(-79, -16);
    ctx.closePath();
    ctx.fill();

    // Belt and armor accents.
    ctx.fillStyle = `${hero.color}66`;
    ctx.beginPath();
    ctx.moveTo(-69, -174);
    ctx.lineTo(61, -178);
    ctx.lineTo(54, -154);
    ctx.lineTo(-59, -150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e0bd74";
    ctx.beginPath();
    ctx.arc(0, -164, 9, 0, TAU);
    ctx.fill();

    // Layered ceremonial armour and cloth folds.
    const armor = ctx.createLinearGradient(-105, -336, 92, -142);
    armor.addColorStop(0, "rgba(219, 239, 232, 0.42)");
    armor.addColorStop(0.18, "#35585a");
    armor.addColorStop(0.56, "#14272b");
    armor.addColorStop(1, "#071417");
    ctx.fillStyle = armor;
    ctx.strokeStyle = "rgba(229, 206, 145, 0.42)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-56, -320);
    ctx.quadraticCurveTo(0, -344, 58, -318);
    ctx.lineTo(74, -228);
    ctx.quadraticCurveTo(47, -193, 0, -181);
    ctx.quadraticCurveTo(-47, -194, -74, -229);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `${hero.color}8f`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-45, -304);
    ctx.lineTo(-19, -263);
    ctx.lineTo(0, -284);
    ctx.lineTo(20, -260);
    ctx.lineTo(47, -304);
    ctx.stroke();
    ctx.fillStyle = "rgba(7, 18, 20, 0.72)";
    ctx.beginPath();
    ctx.arc(0, -241, 23, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#dec084";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -241, 15, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = hero.glow;
    ctx.shadowColor = hero.glow;
    ctx.shadowBlur = 12;
    ctx.font = `400 20px "STKaiti", "KaiTi", serif`;
    ctx.textAlign = "center";
    ctx.fillText(hero.sigil, 0, -233);
    ctx.shadowBlur = 0;

    ctx.fillStyle = `${hero.color}23`;
    [-1, 1].forEach((flip) => {
      ctx.beginPath();
      ctx.moveTo(flip * 23, -178);
      ctx.quadraticCurveTo(flip * 94, -164, flip * 96, -28);
      ctx.lineTo(flip * 31, -56);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(228, 205, 143, 0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Tassels and hanging jade discs.
    [-1, 1].forEach((flip) => {
      ctx.strokeStyle = "#d8b66a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(flip * 57, -159);
      ctx.quadraticCurveTo(flip * 67, -125, flip * 60, -93);
      ctx.stroke();
      ctx.fillStyle = hero.color;
      ctx.beginPath();
      ctx.arc(flip * 60, -89, 6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#f0d38b";
      ctx.stroke();
    });

    // Arms.
    ctx.strokeStyle = "#111e23";
    ctx.lineWidth = 34;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-46, -296);
    ctx.lineTo(-115, -215);
    ctx.lineTo(-92, -135);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(44, -296);
    ctx.lineTo(118, -225);
    ctx.lineTo(139, -146);
    ctx.stroke();
    ctx.strokeStyle = `${hero.color}66`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-82, -203);
    ctx.lineTo(-103, -156);
    ctx.moveTo(88, -207);
    ctx.lineTo(112, -161);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Sculpted shoulder guards and gauntlet highlights.
    [-1, 1].forEach((flip) => {
      const pauldron = ctx.createLinearGradient(flip * 42, -325, flip * 104, -272);
      pauldron.addColorStop(0, "#63817f");
      pauldron.addColorStop(0.32, hero.color2);
      pauldron.addColorStop(1, "#091619");
      ctx.fillStyle = pauldron;
      ctx.strokeStyle = "rgba(235, 211, 151, 0.47)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(flip * 36, -320);
      ctx.lineTo(flip * 86, -324);
      ctx.lineTo(flip * 113, -292);
      ctx.lineTo(flip * 78, -270);
      ctx.lineTo(flip * 37, -285);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `${hero.color}70`;
      ctx.beginPath();
      ctx.moveTo(flip * 57, -311);
      ctx.lineTo(flip * 87, -307);
      ctx.lineTo(flip * 73, -289);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `${hero.color}69`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flip * 102, -275);
      ctx.lineTo(flip * 121, -262);
      ctx.stroke();
    });

    // Head, hood and mask.
    ctx.fillStyle = "#0c191d";
    ctx.beginPath();
    ctx.arc(0, -382, 57, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#17262a";
    ctx.beginPath();
    ctx.moveTo(-62, -374);
    ctx.quadraticCurveTo(-68, -454, 0, -464);
    ctx.quadraticCurveTo(71, -453, 64, -371);
    ctx.quadraticCurveTo(38, -415, 4, -407);
    ctx.quadraticCurveTo(-31, -414, -62, -374);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hero.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.65;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#d4eee9";
    ctx.beginPath();
    ctx.ellipse(-19, -386, 9, 2.3, -0.06, 0, TAU);
    ctx.ellipse(20, -386, 9, 2.3, 0.06, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hero.glow;
    ctx.shadowColor = hero.glow;
    ctx.shadowBlur = 13;
    ctx.beginPath();
    ctx.arc(-19, -386, 2, 0, TAU);
    ctx.arc(20, -386, 2, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Stylised face, nose and luminous eye line.
    const face = ctx.createLinearGradient(0, -414, 0, -350);
    face.addColorStop(0, "#d6c0ae");
    face.addColorStop(0.55, "#a88778");
    face.addColorStop(1, "rgba(73, 45, 43, 0.5)");
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.moveTo(-42, -401);
    ctx.quadraticCurveTo(0, -426, 42, -401);
    ctx.lineTo(31, -363);
    ctx.quadraticCurveTo(0, -341, -30, -363);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(10, 19, 21, 0.66)";
    ctx.beginPath();
    ctx.moveTo(-41, -394);
    ctx.quadraticCurveTo(0, -408, 41, -394);
    ctx.lineTo(34, -383);
    ctx.quadraticCurveTo(0, -392, -34, -383);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(76, 45, 43, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -373);
    ctx.quadraticCurveTo(4, -363, -1, -358);
    ctx.moveTo(-10, -350);
    ctx.quadraticCurveTo(0, -346, 10, -351);
    ctx.stroke();
    ctx.strokeStyle = `${hero.color}c4`;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = hero.color;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(-29, -386);
    ctx.lineTo(-7, -383);
    ctx.moveTo(10, -383);
    ctx.lineTo(31, -386);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(29, 21, 23, 0.45)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-24, -383);
    ctx.lineTo(-7, -383);
    ctx.moveTo(10, -383);
    ctx.lineTo(27, -383);
    ctx.stroke();
    ctx.fillStyle = "rgba(238, 249, 245, 0.82)";
    ctx.beginPath();
    ctx.ellipse(-18, -383, 7, 1.2, 0, 0, TAU);
    ctx.ellipse(19, -383, 7, 1.2, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hero.glow;
    ctx.shadowColor = hero.glow;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-18, -383, 1.6, 0, TAU);
    ctx.arc(19, -383, 1.6, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Forehead crest and wind-blown hair strands.
    ctx.fillStyle = "#dfc078";
    ctx.beginPath();
    ctx.moveTo(0, -422);
    ctx.lineTo(7, -413);
    ctx.lineTo(0, -403);
    ctx.lineTo(-7, -413);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 23, 25, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-35, -416);
    ctx.quadraticCurveTo(-58, -394, -56, -361);
    ctx.moveTo(31, -424);
    ctx.quadraticCurveTo(64, -408, 66, -382);
    ctx.stroke();

    if (hero.id === "guardian") {
      const beard = ctx.createLinearGradient(0, -369, 0, -319);
      beard.addColorStop(0, "#d0c3ae");
      beard.addColorStop(1, "rgba(75, 74, 65, 0.55)");
      ctx.fillStyle = beard;
      ctx.beginPath();
      ctx.moveTo(-29, -360);
      ctx.quadraticCurveTo(-23, -318, 0, -305);
      ctx.quadraticCurveTo(25, -318, 30, -361);
      ctx.quadraticCurveTo(14, -345, 0, -349);
      ctx.quadraticCurveTo(-14, -346, -29, -360);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#9f7d47";
      ctx.beginPath();
      ctx.moveTo(-48, -432);
      ctx.quadraticCurveTo(0, -485, 50, -430);
      ctx.lineTo(36, -447);
      ctx.lineTo(0, -429);
      ctx.lineTo(-34, -447);
      ctx.closePath();
      ctx.fill();
    } else if (hero.id === "archer") {
      ctx.save();
      ctx.translate(-38, -430);
      ctx.rotate(-0.4);
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(211, 238, 247, ${0.68 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.quadraticCurveTo(-26 - i * 4, -48 - i * 9, -72 - i * 6, -70 - i * 6);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(202, 229, 248, 0.72)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, -420);
      ctx.quadraticCurveTo(-75, -400, -84, -351);
      ctx.moveTo(12, -422);
      ctx.quadraticCurveTo(76, -408, 70, -363);
      ctx.stroke();
    } else if (hero.id === "mage") {
      const flameHair = ctx.createLinearGradient(-55, -447, 50, -351);
      flameHair.addColorStop(0, "#ffd2a0");
      flameHair.addColorStop(0.35, hero.color);
      flameHair.addColorStop(1, "rgba(83, 29, 25, 0.7)");
      ctx.fillStyle = flameHair;
      ctx.beginPath();
      ctx.moveTo(-33, -426);
      ctx.quadraticCurveTo(-60, -378, -49, -334);
      ctx.lineTo(-20, -364);
      ctx.lineTo(-34, -409);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(31, -433);
      ctx.quadraticCurveTo(70, -389, 58, -327);
      ctx.lineTo(25, -361);
      ctx.lineTo(34, -407);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f5d58c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -435, 32, -2.7, -0.44);
      ctx.stroke();
    } else if (hero.id === "support") {
      ctx.strokeStyle = "rgba(232, 220, 255, 0.76)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -431);
      ctx.quadraticCurveTo(-74, -416, -87, -352);
      ctx.moveTo(12, -432);
      ctx.quadraticCurveTo(72, -414, 82, -351);
      ctx.stroke();
      ctx.fillStyle = "rgba(241, 224, 255, 0.72)";
      ctx.beginPath();
      ctx.arc(-17, -432, 4, 0, TAU);
      ctx.arc(18, -432, 4, 0, TAU);
      ctx.fill();
    } else {
      ctx.strokeStyle = `${hero.color}8e`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, -427);
      ctx.quadraticCurveTo(-55, -407, -60, -361);
      ctx.stroke();
      ctx.strokeStyle = "rgba(12, 22, 24, 0.92)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-13, -419);
      ctx.quadraticCurveTo(-47, -398, -46, -369);
      ctx.stroke();
    }

    // Role-specific weapons and silhouette details.
    if (hero.id === "assassin") {
      const drawBlade = (flip = 1) => {
        ctx.save();
        ctx.translate(flip * 128, -165);
        ctx.rotate(flip * 0.24);
        ctx.fillStyle = "#b9fff8";
        ctx.shadowColor = hero.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(flip * 12, -115);
        ctx.lineTo(flip * 27, -190);
        ctx.lineTo(flip * 21, -91);
        ctx.lineTo(flip * 8, 16);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#d7b76e";
        ctx.fillRect(flip * -18, 12, 43, 8);
        ctx.restore();
      };
      drawBlade(-1);
      drawBlade(1);
    } else if (hero.id === "archer") {
      ctx.save();
      ctx.translate(-134, -214);
      ctx.rotate(-0.28);
      ctx.strokeStyle = "#d4a654";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(-25, 10, 112, -1.16, 1.2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(198, 240, 255, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-20, -92);
      ctx.lineTo(8, 110);
      ctx.stroke();
      ctx.strokeStyle = hero.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-68, -38);
      ctx.lineTo(92, -62);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = `${hero.color}44`;
      ctx.beginPath();
      ctx.moveTo(60, -284);
      ctx.lineTo(180, -238);
      ctx.lineTo(112, -164);
      ctx.lineTo(30, -228);
      ctx.closePath();
      ctx.fill();
    } else if (hero.id === "mage") {
      ctx.save();
      ctx.translate(145, -230);
      ctx.rotate(0.16);
      ctx.strokeStyle = "#c58c54";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.lineTo(-20, -150);
      ctx.stroke();
      const orb = ctx.createRadialGradient(-24, -184, 2, -24, -174, 44);
      orb.addColorStop(0, "#fff1bd");
      orb.addColorStop(0.25, hero.glow);
      orb.addColorStop(1, "rgba(255,100,46,0)");
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(-24, -174, 53, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#ffc66f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-24, -174, 25, 0, TAU);
      ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.0007 + i * TAU / 6;
        const x = Math.cos(angle) * 175;
        const y = -220 + Math.sin(angle) * 110;
        ctx.fillStyle = hero.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (hero.id === "guardian") {
      ctx.save();
      ctx.translate(-125, -225);
      ctx.fillStyle = "#152226";
      ctx.strokeStyle = "#d9b774";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-68, -73);
      ctx.lineTo(44, -82);
      ctx.lineTo(66, 16);
      ctx.lineTo(0, 100);
      ctx.lineTo(-61, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(246, 220, 158, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -66);
      ctx.lineTo(-3, 70);
      ctx.moveTo(-49, 4);
      ctx.lineTo(46, 4);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(124, -183);
      ctx.rotate(0.18);
      ctx.fillStyle = "#d9b774";
      ctx.beginPath();
      ctx.moveTo(-7, 15);
      ctx.lineTo(1, -210);
      ctx.lineTo(12, -138);
      ctx.lineTo(19, 15);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-22, 10, 45, 9);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(103, -187);
      ctx.rotate(-0.2);
      ctx.strokeStyle = "#e9c77e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-2, 0, 106, -1.75, 1.45);
      ctx.stroke();
      ctx.strokeStyle = hero.color;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-8, -77 + i * 36);
        ctx.lineTo(79, -68 + i * 36);
        ctx.stroke();
      }
      ctx.restore();
      const wing = ctx.createLinearGradient(-150, -280, -40, -100);
      wing.addColorStop(0, `${hero.color}00`);
      wing.addColorStop(0.6, `${hero.color}50`);
      wing.addColorStop(1, `${hero.color}08`);
      ctx.fillStyle = wing;
      ctx.beginPath();
      ctx.moveTo(-38, -290);
      ctx.bezierCurveTo(-160, -310, -218, -210, -224, -102);
      ctx.bezierCurveTo(-180, -147, -122, -130, -58, -93);
      ctx.closePath();
      ctx.fill();
    }

    // Halo filigree and class-specific constellations.
    ctx.save();
    ctx.translate(0, -486);
    ctx.rotate(time * 0.00006);
    ctx.strokeStyle = "rgba(236, 211, 145, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 73, -2.5, 2.2);
    ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const angle = i / 9 * TAU;
      const inner = 79;
      const outer = i % 3 === 0 ? 96 : 87;
      ctx.strokeStyle = i % 3 === 0 ? "rgba(243, 216, 151, 0.48)" : `${hero.color}58`;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();

    if (hero.id === "assassin") {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = `${hero.color}3d`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-185 + i * 18, -118 + i * 24);
        ctx.quadraticCurveTo(-265 + i * 5, -285, -195 + i * 17, -424);
        ctx.stroke();
      }
      ctx.restore();
    } else if (hero.id === "archer") {
      ctx.save();
      ctx.strokeStyle = `${hero.color}48`;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const angle = -2.4 + i * 0.18;
        ctx.beginPath();
        ctx.moveTo(95, -245);
        ctx.quadraticCurveTo(210 + i * 12, -365 + i * 15, 250 + i * 8, -188 + i * 20);
        ctx.stroke();
      }
      ctx.restore();
    } else if (hero.id === "mage") {
      ctx.save();
      ctx.translate(135, -190);
      ctx.strokeStyle = `${hero.color}3f`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 98 + i * 20, 31 + i * 7, -0.18 + i * 0.18, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    } else if (hero.id === "support") {
      ctx.save();
      ctx.fillStyle = `${hero.color}19`;
      ctx.beginPath();
      ctx.moveTo(-54, -310);
      ctx.bezierCurveTo(-216, -362, -257, -188, -178, -121);
      ctx.bezierCurveTo(-136, -166, -93, -212, -48, -238);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Floating role sigil.
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = hero.glow;
    ctx.font = `400 120px "STKaiti", "KaiTi", serif`;
    ctx.textAlign = "center";
    ctx.fillText(hero.sigil, 0, -535);
    ctx.restore();

    ctx.restore();

    applySurfaceGrain(ctx, width, height, 0.15, "source-atop");
  }

  const App = {
    phase: "menu",
    hero: null,
    game: null,
    selectedHeroId: HEROES[0].id,
    selectedRoleId: "mid",
    shopCategory: null,
    difficulty: "hard",
    time: 0,
    lastFrame: performance.now(),
    lastRenderAt: 0,
    lastPortraitAt: 0,
    reducedMotion: reducedMotionQuery.matches,
    rafId: 0,
    mouse: { x: 0, y: 0, worldX: 2100, worldY: 2100, inside: false },
    keys: new Set(),
    touch: { active: false, id: null, originX: 0, originY: 0, dx: 0, dy: 0 },
    announcementToken: 0,
    toastTimer: 0,
    introTimer: 0,
    introLeaveTimer: 0
  };

  function selectedHero() {
    return HEROES.find((hero) => hero.id === App.selectedHeroId) || HEROES[0];
  }

  function selectedRole() {
    return ROLES.find((role) => role.id === App.selectedRoleId) || ROLES.find((role) => role.id === "mid");
  }

  function preferredRoleForHero(heroId, available) {
    return available.find((role) => role.preferredHeroes.includes(heroId)) || available[0];
  }

  function buildRoleAssignment(definitions, forcedIndex = -1, forcedRoleId = null) {
    let available = [...ROLES];
    return definitions.map((definition, index) => {
      let role;
      if (index === forcedIndex) {
        role = available.find((entry) => entry.id === forcedRoleId) || available[0];
      } else {
        role = preferredRoleForHero(definition.id, available);
      }
      available = available.filter((entry) => entry.id !== role.id);
      return role;
    });
  }

  function buildMenu() {
    dom.heroRoster.innerHTML = HEROES.map((hero, index) => `
      <button type="button" class="roster-card${hero.id === App.selectedHeroId ? " is-selected" : ""}" role="option" aria-selected="${hero.id === App.selectedHeroId}" data-hero="${hero.id}" style="--hero-color:${hero.color2}">
        <span class="roster-icon"><i class="roster-head"></i><b>${hero.sigil}</b></span>
        <span class="roster-info"><span class="roster-name">${hero.name}</span><span class="roster-role">${hero.role}</span></span>
        <span class="roster-chevron">›</span>
      </button>
    `).join("");

    dom.heroRoster.querySelectorAll("[data-hero]").forEach((button) => {
      button.addEventListener("click", () => {
        App.selectedHeroId = button.dataset.hero;
        audio.init();
        audio.click();
        updateHeroSelection();
      });
    });
    updateHeroSelection();
    buildRolePicker();
    setDifficulty(App.difficulty);
  }

  function updateHeroSelection() {
    const hero = selectedHero();
    document.documentElement.style.setProperty("--active-hero", hero.color);
    document.documentElement.style.setProperty("--active-hero-deep", hero.color2);
    document.documentElement.style.setProperty("--active-hero-glow", hero.glow);
    dom.heroRole.textContent = hero.role;
    dom.heroName.textContent = hero.name;
    dom.heroTitle.textContent = hero.title;
    dom.heroTagline.textContent = hero.tagline;
    dom.stageCaption.textContent = hero.stagePhrase;
    dom.heroSigil.textContent = hero.sigil;
    dom.heroSigil.style.color = `${hero.color}0e`;
    dom.statDamage.style.width = `${hero.stats.damage}%`;
    dom.statSurvival.style.width = `${hero.stats.survival}%`;
    dom.statDifficulty.style.width = `${hero.stats.difficulty}%`;
    dom.rosterCount.textContent = `${String(HEROES.indexOf(hero) + 1).padStart(2, "0")} / ${String(HEROES.length).padStart(2, "0")}`;
    dom.abilityPreview.innerHTML = hero.abilities.map((ability) => `
      <div class="preview-skill"><b>${ability.icon}</b><span>${ability.name}</span></div>
    `).join("");
    dom.heroRoster.querySelectorAll("[data-hero]").forEach((button) => {
      const active = button.dataset.hero === hero.id;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (dom.heroCanvas.animate && App.phase === "menu" && !App.reducedMotion) {
      dom.heroCanvas.animate(
        [
          { opacity: 0.25, transform: "translateY(12px) scale(0.975)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }
        ],
        { duration: 520, easing: "cubic-bezier(.2,.72,.2,1)" }
      );
      dom.heroName.animate(
        [
          { opacity: 0.2, letterSpacing: "0.16em", filter: "blur(4px)" },
          { opacity: 1, letterSpacing: "0.08em", filter: "blur(0)" }
        ],
        { duration: 460, easing: "ease-out" }
      );
    }
    App.portraitDirty = true;
  }

  function buildRolePicker() {
    dom.roleOptions.innerHTML = ROLES.map((role) => `
      <button type="button" class="role-option${role.id === App.selectedRoleId ? " is-selected" : ""}" data-role="${role.id}" role="radio" aria-checked="${role.id === App.selectedRoleId}" aria-label="${role.name}：${role.description}" title="${role.name} · ${role.description}" style="--role-color:${role.color}">
        <i>${role.icon}</i><span>${role.short}</span>
      </button>
    `).join("");
    dom.roleOptions.querySelectorAll("[data-role]").forEach((button) => {
      button.addEventListener("click", () => {
        App.selectedRoleId = button.dataset.role;
        audio.click();
        updateRoleSelection();
      });
    });
    updateRoleSelection();
  }

  function updateRoleSelection() {
    const role = selectedRole();
    dom.roleHint.textContent = role.description;
    dom.roleHint.title = role.description;
    dom.roleOptions.querySelectorAll("[data-role]").forEach((button) => {
      const active = button.dataset.role === role.id;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-checked", String(active));
    });
  }

  function setDifficulty(value) {
    App.difficulty = value;
    $$(".mode-option").forEach((button) => {
      const active = button.dataset.difficulty === value;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function showGuide(show) {
    dom.guideModal.hidden = !show;
    if (show) audio.click();
  }

  function showToast(message, duration = 1800) {
    dom.toast.textContent = message;
    dom.toast.hidden = false;
    clearTimeout(App.toastTimer);
    App.toastTimer = setTimeout(() => {
      dom.toast.hidden = true;
    }, duration);
  }

  function audioGesture() {
    audio.init();
    if (audio.context && audio.context.state === "suspended") audio.context.resume();
  }

  dom.startBtn.addEventListener("click", () => {
    audioGesture();
    audio.click();
    startGame(App.selectedHeroId, App.difficulty, App.selectedRoleId);
  });
  dom.guideBtn.addEventListener("click", () => showGuide(true));
  dom.playAgainBtn.addEventListener("click", () => {
    dom.resultModal.hidden = true;
    startGame(App.selectedHeroId, App.difficulty, App.selectedRoleId);
  });
  $$(".mode-option").forEach((button) => button.addEventListener("click", () => {
    audio.click();
    setDifficulty(button.dataset.difficulty);
  }));
  $$("[data-close]").forEach((button) => button.addEventListener("click", () => {
    const target = button.dataset.close;
    if (target === "scoreboard") closeScoreboard();
    else if (target === "guideModal") showGuide(false);
    else $(`#${target}`).hidden = true;
  }));
  dom.muteBtn.addEventListener("click", () => {
    audio.init();
    audio.muted = !audio.muted;
    dom.soundIcon.textContent = audio.muted ? "×" : "♪";
    dom.muteBtn.title = audio.muted ? "开启声音" : "切换声音";
  });
  dom.shopBtn.addEventListener("click", openShop);
  dom.itemBar.addEventListener("click", openShop);
  $$(".shop-tab").forEach((button) => button.addEventListener("click", () => {
    App.shopCategory = button.dataset.shopCategory;
    renderShop();
    audio.click();
  }));
  dom.shopItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-item]");
    if (!button || !game) return;
    game.purchaseItem(game.player, button.dataset.buyItem);
  });
  dom.pauseBtn.addEventListener("click", pauseGame);
  dom.resumeBtn.addEventListener("click", resumeGame);
  dom.quitBtn.addEventListener("click", () => {
    dom.pauseModal.hidden = true;
    returnToMenu();
  });

  let game = null;

  function hostile(a, b) {
    if (!a || !b || a === b) return false;
    if (a === NEUTRAL || b === NEUTRAL) return a !== b;
    return a !== b;
  }

  class Unit {
    constructor(options) {
      Object.assign(this, options);
      this.maxHp = options.maxHp || options.hp || 1;
      this.hp = options.hp || this.maxHp;
      this.radius = options.radius || 20;
      this.speed = options.speed || 0;
      this.attackRange = options.attackRange || 0;
      this.attackDamage = options.attackDamage || 0;
      this.attackDuration = options.attackDuration || 1;
      this.attackTimer = Math.random() * this.attackDuration;
      this.facing = options.facing ?? (this.team === BLUE ? -0.6 : 2.5);
      this.dead = false;
      this.deathTimer = 0;
      this.removed = false;
      this.hitFlash = 0;
      this.shield = 0;
      this.shieldUntil = 0;
      this.stunUntil = 0;
      this.rootUntil = 0;
      this.slowUntil = 0;
      this.slowFactor = 1;
      this.target = null;
      this.moving = false;
      this.bobSeed = Math.random() * TAU;
    }

    get isStunned() {
      return game && game.time < this.stunUntil;
    }

    get isRooted() {
      return game && game.time < this.rootUntil;
    }

    get moveSpeed() {
      const slow = game && game.time < this.slowUntil ? this.slowFactor : 1;
      const haste = this.speedBoostUntil && game.time < this.speedBoostUntil ? (this.speedMultiplier || 1.25) : 1;
      return this.speed * slow * haste;
    }

    updateBase(dt) {
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      if (this.attackTimer > 0) this.attackTimer -= dt;
      if (this.shield > 0 && game.time >= this.shieldUntil) {
        this.shield = 0;
      }
    }

    moveToward(x, y, dt) {
      if (this.isStunned || this.isRooted) {
        this.moving = false;
        return false;
      }
      const dx = x - this.x;
      const dy = y - this.y;
      const length = Math.hypot(dx, dy);
      if (length < 2) {
        this.moving = false;
        return true;
      }
      this.facing = Math.atan2(dy, dx);
      const step = Math.min(length, this.moveSpeed * dt);
      this.x += dx / length * step;
      this.y += dy / length * step;
      this.x = clamp(this.x, 120, MAP.size - 120);
      this.y = clamp(this.y, 120, MAP.size - 120);
      this.moving = true;
      return length <= step + 2;
    }

    stopMoving() {
      this.moving = false;
    }

    canAttack(target) {
      return target &&
        !target.dead &&
        !target.removed &&
        hostile(this.team, target.team) &&
        distance(this, target) <= this.attackRange + this.radius + target.radius * 0.35 &&
        this.attackTimer <= 0 &&
        !this.isStunned;
    }

    attack(target) {
      if (!this.canAttack(target)) return false;
      this.attackTimer = this.attackDuration;
      this.facing = angleTo(this, target);
      if (this.attackRange > 175) {
        game.spawnAttackTracer(this, target, this.attackRange > 350 ? "#9ae9ef" : "#e3d39e");
      } else {
        game.spawnMeleeArc(this, target);
      }
      game.dealDamage(this, target, this.attackDamage + (this.level ? (this.level - 1) * 4 : 0), { basic: true });
      return true;
    }
  }

  class Hero extends Unit {
    constructor(definition, team, lane, options = {}) {
      const base = definition.body;
      super({
        kind: "hero",
        heroDefinition: definition,
        heroId: definition.id,
        team,
        lane,
        name: options.name || definition.name,
        title: definition.title,
        x: options.x || (team === BLUE ? MAP.blueBase.x : MAP.redBase.x),
        y: options.y || (team === BLUE ? MAP.blueBase.y : MAP.redBase.y),
        maxHp: base.hp,
        hp: base.hp,
        mana: base.mana,
        maxMana: base.mana,
        attackDamage: base.damage,
        attackRange: base.range,
        speed: base.speed,
        radius: 28,
        attackDuration: definition.id === "archer" ? 0.72 : definition.id === "mage" ? 0.86 : 0.68
      });
      this.level = 1;
      this.xp = 0;
      this.xpToNext = 120;
      this.gold = 490;
      this.kills = 0;
      this.deaths = 0;
      this.assists = 0;
      this.cs = 0;
      this.damageDealt = 0;
      this.abilityCooldowns = [0, 0, 0, 0];
      this.baseSpeed = base.speed;
      this.baseManaRegen = base.manaRegen;
      this.baseAttackDuration = definition.id === "archer" ? 0.72 : definition.id === "mage" ? 0.86 : 0.68;
      this.roleId = options.roleId || "mid";
      this.assignedRole = ROLES.find((role) => role.id === this.roleId) || ROLES.find((role) => role.id === "mid");
      this.roleName = this.assignedRole.name;
      this.sigil = definition.sigil;
      this.color = definition.color;
      this.color2 = definition.color2;
      this.glow = definition.glow;
      this.isPlayer = Boolean(options.isPlayer);
      this.spawnPoint = {
        x: team === BLUE ? MAP.blueBase.x : MAP.redBase.x,
        y: team === BLUE ? MAP.blueBase.y : MAP.redBase.y
      };
      this.moveTarget = null;
      this.attackTarget = null;
      this.recall = 0;
      this.recalling = false;
      this.stealthUntil = 0;
      this.damageReductionUntil = 0;
      this.speedBoostUntil = 0;
      this.speedMultiplier = 1;
      this.aiAbilityTimer = 1.8 + Math.random() * 2;
      this.aiDecisionTimer = Math.random() * 0.25;
      this.pathIndex = team === BLUE ? 1 : MAP.lanes[lane].points.length - 2;
      this.lastCombat = -20;
      this.castPulse = 0;
      this.respawnDelay = 0;
      this.nextFootstep = 0;
      this.items = [];
      this.armor = 0;
      this.abilityPower = 0;
      this.lifeSteal = 0;
      this.attackSpeedBonus = 0;
      this.equipmentReduction = 0;
      this.jungleIndex = 0;
      if (this.roleId === "jungle") this.pathIndex = 0;
    }

    get hpRatio() {
      return this.hp / this.maxHp;
    }

    get manaRatio() {
      return this.mana / this.maxMana;
    }

    get isStealthed() {
      return game.time < this.stealthUntil;
    }

    update(dt) {
      this.updateBase(dt);
      if (this.dead) return;
      this.castPulse = Math.max(0, this.castPulse - dt * 2.8);
      this.mana = Math.min(this.maxMana, this.mana + this.baseManaRegen * dt);
      for (let i = 0; i < this.abilityCooldowns.length; i++) {
        this.abilityCooldowns[i] = Math.max(0, this.abilityCooldowns[i] - dt);
      }
      const nearOwnBase = distance(this, this.spawnPoint) < 315;
      if (nearOwnBase) {
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.09 * dt);
        this.mana = Math.min(this.maxMana, this.mana + this.maxMana * 0.16 * dt);
        if (this.isPlayer && this.recalling) this.finishRecall();
      } else if (game.time - this.lastCombat > 4) {
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.008 * dt);
      }
      if (this.recalling && !nearOwnBase) {
        this.recall += dt;
        if (this.recall >= 3.2) this.finishRecall();
      }
      if (this.moving && game.time >= this.nextFootstep) {
        this.nextFootstep = game.time + 0.17;
        game.addParticleBurst(
          this.x + (Math.random() - 0.5) * 12,
          this.y + 17,
          this.team === BLUE ? "rgba(129, 209, 191, 0.5)" : "rgba(210, 117, 120, 0.46)",
          2,
          22,
          { life: 0.32, size: 1.8, gravity: -8 }
        );
      }
      if (this.isPlayer) this.updatePlayer(dt);
      else this.updateAI(dt);
    }

    finishRecall() {
      this.x = this.spawnPoint.x + (this.isPlayer ? 20 : 0);
      this.y = this.spawnPoint.y + (this.isPlayer ? 20 : 0);
      this.recalling = false;
      this.recall = 0;
      this.moveTarget = null;
      this.attackTarget = null;
      this.stopMoving();
      game.spawnTeleportEffect(this.x, this.y, this.color);
      if (this.isPlayer) {
        dom.recallIndicator.hidden = true;
        showToast("已返回星穹圣坛");
      }
    }

    cancelRecall() {
      if (!this.recalling) return;
      this.recalling = false;
      this.recall = 0;
      if (this.isPlayer) dom.recallIndicator.hidden = true;
    }

    gainXp(amount) {
      if (this.level >= 15) return;
      this.xp += amount;
      while (this.level < 15 && this.xp >= this.xpToNext) {
        this.xp -= this.xpToNext;
        this.level += 1;
        this.xpToNext = Math.round(this.xpToNext * 1.16 + 22);
        const oldMax = this.maxHp;
        this.maxHp += 102 + this.level * 2;
        this.hp += this.maxHp - oldMax + this.maxHp * 0.08;
        this.maxMana += 28;
        this.mana = Math.min(this.maxMana, this.mana + 55);
        this.attackDamage += this.heroDefinition.stats.damage > 80 ? 6 : 4;
        game.spawnLevelEffect(this);
        if (this.isPlayer) {
          game.showAnnouncement("英雄进阶", `达到 ${this.level} 级`, 1.6);
          audio.tone(430 + this.level * 16, 0.3, "sine", 0.11, 130);
        }
      }
    }

    updatePlayer(dt) {
      if (this.dead) return;
      let inputX = 0;
      let inputY = 0;
      if (App.keys.has("ArrowUp")) inputY -= 1;
      if (App.keys.has("ArrowDown")) inputY += 1;
      if (App.keys.has("ArrowLeft")) inputX -= 1;
      if (App.keys.has("ArrowRight")) inputX += 1;
      if (App.touch.active) {
        inputX += App.touch.dx;
        inputY += App.touch.dy;
      }
      const inputLength = Math.hypot(inputX, inputY);
      if (inputLength > 0.12) {
        this.cancelRecall();
        this.moveTarget = null;
        this.attackTarget = null;
        const normalized = normalize(inputX, inputY);
        this.moveToward(this.x + normalized.x * 120, this.y + normalized.y * 120, Math.min(1, inputLength) * dt);
        this.stopMoving();
        return;
      }

      if (this.attackTarget && (this.attackTarget.dead || this.attackTarget.removed)) this.attackTarget = null;
      if (this.attackTarget) {
        const dist = distance(this, this.attackTarget);
        if (dist > this.attackRange + this.attackTarget.radius * 0.4) {
          this.moveToward(
            this.attackTarget.x,
            this.attackTarget.y,
            dt
          );
        } else {
          this.stopMoving();
          this.attack(this.attackTarget);
        }
        return;
      }
      if (this.moveTarget) {
        const arrived = this.moveToward(this.moveTarget.x, this.moveTarget.y, dt);
        if (arrived) this.moveTarget = null;
      } else {
        this.stopMoving();
      }
    }

    updateAI(dt) {
      if (this.dead) return;
      this.aiDecisionTimer -= dt;
      this.aiAbilityTimer -= dt;
      const isJungler = this.roleId === "jungle";
      const path = isJungler ? game.jungleRouteFor(this) : MAP.lanes[this.lane].points;
      let nearest = null;
      let nearestDistance = Infinity;

      if (this.aiDecisionTimer <= 0) {
        this.aiDecisionTimer = 0.18 + Math.random() * 0.2;
        const searchRange = 610 + (App.difficulty === "hard" ? 90 : 0);
        const candidates = game.unitsForTeam(this.team === BLUE ? RED : BLUE, true)
          .filter((unit) => !unit.dead && !unit.removed);
        if (isJungler) {
          candidates.push(...game.monsters.filter((monster) => !monster.dead && !monster.removed && (!monster.boss || game.time >= 115)));
        }
        candidates.forEach((unit) => {
          const d = distance(this, unit);
          const weight = unit.kind === "hero" ? 0.72 : unit.kind === "monster" && unit.boss ? 2.4 : 1;
          if (d * weight < nearestDistance && d < searchRange) {
            nearest = unit;
            nearestDistance = d * weight;
          }
        });
        this.target = nearest;
      } else {
        nearest = this.target;
      }

      const retreat = this.hpRatio < 0.24 || (this.hpRatio < 0.34 && game.time - this.lastCombat < 2.4);
      if (retreat) {
        this.cancelRecall();
        this.target = null;
        const home = this.spawnPoint;
        if (distance(this, home) > 110) {
          this.moveToward(home.x, home.y, dt);
        } else {
          this.stopMoving();
        }
        return;
      }

      if (nearest && !nearest.dead) {
        const dist = distance(this, nearest);
        if (dist <= this.attackRange + nearest.radius * 0.25) {
          this.stopMoving();
          this.attack(nearest);
        } else if (dist < 760) {
          this.moveToward(nearest.x, nearest.y, dt);
        }
        this.useAIAbility(nearest);
      } else {
        if (this.roleId === "support") {
          const carry = game.heroes.find((hero) =>
            hero.team === this.team &&
            hero.roleId === "farm" &&
            !hero.dead &&
            !hero.removed
          );
          if (carry) {
            const followDistance = this.team === BLUE ? 92 : -92;
            const followPoint = { x: carry.x + followDistance, y: carry.y + 54 };
            if (distance(this, followPoint) > 85) {
              this.moveToward(followPoint.x, followPoint.y, dt);
              return;
            }
          }
        }
        let waypoint = path[this.pathIndex];
        if (!waypoint) {
          waypoint = isJungler
            ? path[0]
            : this.team === BLUE ? MAP.redBase : MAP.blueBase;
        }
        if (distance(this, waypoint) < 68) {
          this.pathIndex += isJungler ? 1 : (this.team === BLUE ? 1 : -1);
          this.pathIndex = clamp(this.pathIndex, 0, path.length - 1);
          waypoint = path[this.pathIndex];
        }
        if (waypoint) {
          this.moveToward(waypoint.x, waypoint.y, dt);
        } else {
          const enemyBase = this.team === BLUE ? MAP.redBase : MAP.blueBase;
          this.moveToward(enemyBase.x, enemyBase.y, dt);
        }
      }
    }

    useAIAbility(target) {
      if (this.aiAbilityTimer > 0 || !target || target.dead) return;
      const dist = distance(this, target);
      const difficultyModifier = App.difficulty === "hard" ? 0.72 : 1.28;
      this.aiAbilityTimer = (2.1 + Math.random() * 2.8) * difficultyModifier;
      let abilityIndex = -1;
      if (dist < 520) {
        const ready = this.abilityCooldowns
          .map((cooldown, index) => ({ cooldown, index }))
          .filter((entry) => entry.cooldown <= 0 && this.mana >= this.heroDefinition.abilities[entry.index].mana);
        if (ready.length) {
          if (ready.some((entry) => entry.index === 3) && Math.random() < 0.72) {
            abilityIndex = 3;
          } else if (ready[1] && Math.random() < 0.54) {
            abilityIndex = 1;
          } else {
            abilityIndex = ready[Math.floor(Math.random() * Math.min(2, ready.length))].index;
          }
        }
      }
      if (abilityIndex >= 0) {
        game.castAbility(this, abilityIndex, target.x, target.y);
      }
    }

    respawn() {
      const angle = Math.random() * TAU;
      this.x = this.spawnPoint.x + Math.cos(angle) * 55;
      this.y = this.spawnPoint.y + Math.sin(angle) * 55;
      this.hp = this.maxHp;
      this.mana = this.maxMana;
      this.dead = false;
      this.deathTimer = 0;
      this.target = null;
      this.attackTarget = null;
      this.moveTarget = null;
      this.recalling = false;
      this.recall = 0;
      this.stunUntil = 0;
      this.rootUntil = 0;
      this.slowUntil = 0;
      this.pathIndex = this.roleId === "jungle" ? 0 : this.team === BLUE ? 1 : MAP.lanes[this.lane].points.length - 2;
      game.spawnTeleportEffect(this.x, this.y, this.color);
      if (this.isPlayer) {
        dom.deathOverlay.hidden = true;
        game.showAnnouncement("重返战场", "星穹之力已重聚", 1.7);
      }
    }
  }

  class Minion extends Unit {
    constructor(team, lane, type, wave, x, y, offset = 0) {
      const stats = {
        melee: { name: "星卫兵", hp: 295, damage: 21, range: 72, radius: 15, speed: 86, color: "#7dd8c9" },
        caster: { name: "星术师", hp: 225, damage: 26, range: 250, radius: 14, speed: 83, color: "#8bc8e9" },
        siege: { name: "破城车", hp: 620, damage: 44, range: 300, radius: 23, speed: 72, color: "#d8c286" }
      }[type];
      super({
        kind: "minion",
        minionType: type,
        team,
        lane,
        name: stats.name,
        x,
        y,
        maxHp: stats.hp + wave * 7,
        hp: stats.hp + wave * 7,
        attackDamage: stats.damage + wave * 1.1,
        attackRange: stats.range,
        speed: stats.speed,
        radius: stats.radius,
        attackDuration: type === "siege" ? 1.45 : type === "caster" ? 1.15 : 0.9
      });
      this.color = stats.color;
      this.pathIndex = team === BLUE ? 1 : MAP.lanes[lane].points.length - 2;
      this.waypointBias = offset;
      this.aggroRange = type === "caster" ? 310 : 255;
      this.deadTimer = 0;
      this.movePhase = Math.random() * TAU;
    }

    update(dt) {
      this.updateBase(dt);
      if (this.dead) {
        this.deathTimer += dt;
        return;
      }
      if (this.target && (this.target.dead || this.target.removed || distance(this, this.target) > 520)) {
        this.target = null;
      }
      if (!this.target) {
        this.target = game.findNearestEnemy(this, this.aggroRange, (unit) => unit.kind !== "monster");
      }
      if (this.target) {
        const dist = distance(this, this.target);
        if (dist <= this.attackRange + this.target.radius * 0.25) {
          this.stopMoving();
          this.attack(this.target);
        } else {
          this.moveToward(this.target.x, this.target.y, dt);
        }
        return;
      }

      const path = MAP.lanes[this.lane].points;
      let point = path[this.pathIndex];
      if (!point) {
        point = this.team === BLUE ? MAP.redBase : MAP.blueBase;
      }
      if (distance(this, point) < 52) {
        const nextIndex = this.pathIndex + (this.team === BLUE ? 1 : -1);
        if (nextIndex >= 0 && nextIndex < path.length) {
          this.pathIndex = nextIndex;
          point = path[this.pathIndex];
        }
      }
      if (point) {
        const side = Math.sin(this.movePhase) * this.waypointBias;
        this.moveToward(point.x + side, point.y - side * 0.5, dt);
      }
    }
  }

  class Tower extends Unit {
    constructor(data) {
      const tierScale = data.tier === 2 ? 1.15 : 1;
      super({
        kind: "tower",
        team: data.team,
        lane: data.lane,
        x: data.x,
        y: data.y,
        name: data.tier === 1 ? "外塔" : "高地塔",
        maxHp: 3150 * tierScale,
        hp: 3150 * tierScale,
        attackRange: data.tier === 1 ? 445 : 480,
        attackDamage: data.tier === 1 ? 105 : 128,
        attackDuration: 0.9,
        radius: data.tier === 1 ? 43 : 48,
        speed: 0,
        structure: true
      });
      this.tier = data.tier;
      this.lastTarget = null;
      this.chargePulse = 0;
    }

    update(dt) {
      this.updateBase(dt);
      this.chargePulse = Math.max(0, this.chargePulse - dt * 2);
      if (this.dead) return;
      let target = null;
      let bestDistance = Infinity;
      game.unitsForTeam(this.team === BLUE ? RED : BLUE, true).forEach((unit) => {
        if (unit.dead || unit.removed || unit.structure) return;
        const dist = distance(this, unit);
        if (dist > this.attackRange + unit.radius * 0.3) return;
        const priority = unit.kind === "minion" ? 0 : unit.kind === "hero" ? 1 : 2;
        const weighted = priority * 1000 + dist;
        if (weighted < bestDistance) {
          bestDistance = weighted;
          target = unit;
        }
      });
      this.lastTarget = target;
      if (target && this.attackTimer <= 0) {
        this.attackTimer = this.attackDuration;
        this.chargePulse = 1;
        game.spawnTowerBolt(this, target);
      }
    }
  }

  class Nexus extends Unit {
    constructor(team) {
      const base = team === BLUE ? MAP.blueBase : MAP.redBase;
      super({
        kind: "nexus",
        team,
        x: base.x,
        y: base.y,
        name: team === BLUE ? "星穹圣坛" : "赤曜王座",
        maxHp: 7600,
        hp: 7600,
        attackRange: 540,
        attackDamage: 145,
        attackDuration: 1.2,
        radius: 70,
        speed: 0,
        structure: true
      });
      this.chargePulse = 0;
    }

    update(dt) {
      this.updateBase(dt);
      this.chargePulse = Math.max(0, this.chargePulse - dt * 1.7);
      if (this.dead) return;
      let target = null;
      let bestDistance = Infinity;
      game.unitsForTeam(this.team === BLUE ? RED : BLUE, true).forEach((unit) => {
        if (unit.dead || unit.removed) return;
        const dist = distance(this, unit);
        if (dist <= this.attackRange && dist < bestDistance) {
          bestDistance = dist;
          target = unit;
        }
      });
      if (target && this.attackTimer <= 0) {
        this.attackTimer = this.attackDuration;
        this.chargePulse = 1;
        game.spawnTowerBolt(this, target, true);
      }
    }
  }

  class Monster extends Unit {
    constructor(data, index, boss = false) {
      super({
        kind: "monster",
        team: NEUTRAL,
        monsterType: boss ? "boss" : "camp",
        name: boss ? "星渊主宰" : data.name,
        x: data.x,
        y: data.y,
        maxHp: boss ? 11800 : data.scale > 1 ? 1700 : 1250,
        hp: boss ? 11800 : data.scale > 1 ? 1700 : 1250,
        attackDamage: boss ? 185 : 62,
        attackRange: boss ? 145 : 105,
        attackDuration: boss ? 1.15 : 1.4,
        speed: 0,
        radius: boss ? 72 : Math.round(34 * (data.scale || 1)),
        color: data.color
      });
      this.spawn = { x: data.x, y: data.y };
      this.boss = boss;
      this.campIndex = index;
      this.aggroTarget = null;
      this.aggroUntil = 0;
      this.respawnAt = 0;
      this.returning = false;
      this.bossScale = data.scale || 1;
    }

    update(dt) {
      this.updateBase(dt);
      if (this.dead) return;
      if (this.aggroTarget && (this.aggroTarget.dead || this.aggroTarget.removed || game.time > this.aggroUntil)) {
        this.aggroTarget = null;
      }
      if (!this.aggroTarget) {
        if (distance(this, this.spawn) > 8) {
          this.moveToward(this.spawn.x, this.spawn.y, dt * 0.6);
        } else {
          this.stopMoving();
        }
        return;
      }
      if (distance(this, this.spawn) > (this.boss ? 620 : 340)) {
        this.aggroTarget = null;
        return;
      }
      if (this.canAttack(this.aggroTarget)) {
        this.stopMoving();
        this.attack(this.aggroTarget);
      } else {
        this.moveToward(this.aggroTarget.x, this.aggroTarget.y, dt);
      }
    }
  }

  class Game {
    constructor(playerHeroId, difficulty, playerRoleId = "mid") {
      this.difficulty = difficulty;
      this.playerRoleId = playerRoleId;
      this.phase = "playing";
      this.time = 0;
      this.lastHudUpdate = 0;
      this.heroes = [];
      this.minions = [];
      this.structures = [];
      this.monsters = [];
      this.projectiles = [];
      this.areas = [];
      this.particles = [];
      this.effects = [];
      this.feed = [];
      this.teamStats = {
        blue: { kills: 0, gold: 0, towerKills: 0, heroDamage: 0 },
        red: { kills: 0, gold: 0, towerKills: 0, heroDamage: 0 }
      };
      this.waveNumber = 0;
      this.nextWave = 5;
      this.bossSpawned = false;
      this.bossAlive = false;
      this.bossMonster = null;
      this.bossRespawnAt = 0;
      this.buff = { blue: 0, red: 0 };
      this.camera = {
        x: MAP.blueBase.x,
        y: MAP.blueBase.y,
        zoom: 0.9,
        shake: 0,
        flash: 0
      };
      this.endQueued = null;
      this.milestones = new Set();
      this.aiShopTimer = 3.2;
      this.resize();
      this.createTeams(playerHeroId, playerRoleId);
      this.createStructures();
      this.createMonsters();
      this.player = this.heroes.find((hero) => hero.isPlayer);
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      this.setupHud();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = pixelRatio();
      dom.canvas.width = Math.floor(this.width * this.dpr);
      dom.canvas.height = Math.floor(this.height * this.dpr);
      this.zoomTarget = this.width < 600 ? 0.67 : this.width < 900 ? 0.75 : clamp(this.width / 1540, 0.82, 1.08);
    }

    createTeams(playerHeroId, playerRoleId) {
      const playerDefinition = HEROES.find((hero) => hero.id === playerHeroId) || HEROES[0];
      const otherDefinitions = HEROES.filter((hero) => hero.id !== playerHeroId);
      const blueDefinitions = [playerDefinition, ...otherDefinitions];
      const blueRoles = buildRoleAssignment(blueDefinitions, 0, playerRoleId);
      blueDefinitions.forEach((definition, index) => {
        const role = blueRoles[index];
        const angle = index * 1.07;
        const hero = new Hero(definition, BLUE, role.lane, {
          isPlayer: index === 0,
          roleId: role.id,
          x: MAP.blueBase.x + Math.cos(angle) * (index === 0 ? 180 : 120),
          y: MAP.blueBase.y + Math.sin(angle) * (index === 0 ? 120 : 110)
        });
        if (index === 0) {
          hero.x = MAP.playerSpawn.x;
          hero.y = MAP.playerSpawn.y;
        }
        hero.pathIndex = role.id === "jungle" ? 0 : 1;
        this.heroes.push(hero);
      });

      const enemyNames = ["夜枭", "烬羽", "魇火", "狂岩", "幽弦"];
      const redRoles = buildRoleAssignment(HEROES);
      HEROES.forEach((definition, index) => {
        const role = redRoles[index];
        const angle = index * 1.05 + 0.4;
        const hero = new Hero(definition, RED, role.lane, {
          name: enemyNames[index],
          roleId: role.id,
          x: MAP.redBase.x + Math.cos(angle) * 125,
          y: MAP.redBase.y + Math.sin(angle) * 125
        });
        hero.pathIndex = role.id === "jungle" ? 0 : MAP.lanes[role.lane].points.length - 2;
        this.heroes.push(hero);
      });
    }

    createStructures() {
      MAP.towers.forEach((tower) => this.structures.push(new Tower(tower)));
      this.structures.push(new Nexus(BLUE));
      this.structures.push(new Nexus(RED));
    }

    createMonsters() {
      MAP.jungleCamps.forEach((camp, index) => this.monsters.push(new Monster(camp, index, false)));
    }

    jungleRouteFor(hero) {
      const order = hero.team === BLUE ? [0, 2, 1, 3] : [1, 3, 0, 2];
      const route = [];
      order.forEach((campIndex) => {
        const monster = this.monsters.find((unit) => unit.campIndex === campIndex && !unit.dead);
        if (monster) route.push({ x: monster.x, y: monster.y });
      });
      const boss = this.monsters.find((unit) => unit.boss && !unit.dead);
      if (boss) route.push({ x: boss.x, y: boss.y });
      if (!route.length) {
        const lane = MAP.lanes[1].points;
        route.push(hero.team === BLUE ? lane[Math.min(3, lane.length - 1)] : lane[Math.max(1, lane.length - 4)]);
      }
      return route;
    }

    setupHud() {
      const player = this.player;
      const def = player.heroDefinition;
      document.documentElement.style.setProperty("--battle-accent", def.color);
      document.documentElement.style.setProperty("--battle-accent-deep", def.color2);
      document.documentElement.style.setProperty("--battle-accent-glow", def.glow);
      dom.hudHeroSigil.textContent = def.sigil;
      dom.hudHeroName.textContent = def.name;
      dom.hudRole.textContent = player.roleName;
      dom.hudHeroSigil.parentElement.style.background = `radial-gradient(circle at 35% 28%, rgba(255,255,255,.28), transparent 30%), linear-gradient(145deg, ${def.color2}, #0d1b1f)`;
      const passive = $(".ability-button.passive .ability-icon");
      if (passive) passive.textContent = def.passive.slice(0, 1);
      HUD_KEYS.forEach((key, index) => {
        const ability = def.abilities[index];
        $(`#skillIcon${key}`).textContent = ability.icon;
        $(`#skillName${key}`).textContent = ability.name;
        const button = hudRefs.abilityButtons[index];
        button.style.setProperty("--skill-color", ability.color || def.color);
        button.setAttribute("aria-label", `${ability.name}：${ability.description}`);
        button.title = `${ability.name} · ${ability.description}`;
      });
      dom.killFeed.innerHTML = "";
      dom.deathOverlay.hidden = true;
      dom.recallIndicator.hidden = true;
      this.setupSquadHud();
      renderItemBar(this);
      this.updateHud(true);
    }

    applyItemStats(hero, item) {
      const stats = item.stats;
      if (stats.hp) {
        hero.maxHp += stats.hp;
        hero.hp += stats.hp;
      }
      if (stats.mana) {
        hero.maxMana += stats.mana;
        hero.mana += stats.mana;
      }
      if (stats.attack) hero.attackDamage += stats.attack;
      if (stats.abilityPower) hero.abilityPower += stats.abilityPower;
      if (stats.armor) hero.armor += stats.armor;
      if (stats.magicResist) hero.equipmentReduction += stats.magicResist;
      if (stats.speed) hero.speed += stats.speed;
      if (stats.lifeSteal) hero.lifeSteal += stats.lifeSteal;
      if (stats.attackSpeed) {
        hero.attackSpeedBonus += stats.attackSpeed;
        hero.attackDuration = hero.baseAttackDuration / (1 + hero.attackSpeedBonus);
      }
    }

    purchaseItem(hero, itemId, silent = false) {
      const item = ITEMS.find((entry) => entry.id === itemId);
      if (!hero || !item || game !== this) return false;
      if (hero.items.length >= 6) {
        if (!silent) showToast("装备栏已满");
        return false;
      }
      if (hero.items.includes(item.id)) {
        if (!silent) showToast("该装备已经购买");
        return false;
      }
      if (hero.gold < item.price) {
        if (!silent) showToast(`金币不足 · 还差 ${Math.ceil(item.price - hero.gold)}`);
        return false;
      }
      hero.gold -= item.price;
      hero.items.push(item.id);
      this.applyItemStats(hero, item);
      if (hero.isPlayer) {
        audio.tone(520, 0.16, "triangle", 0.1, 140);
        showToast(`已购买 ${item.name} · ${item.statText}`, 1800);
        this.spawnBurst(hero.x, hero.y, item.color, 46);
        renderItemBar();
        if (!dom.shopModal.hidden) renderShop();
      }
      return true;
    }

    autoPurchaseForAI(hero) {
      if (hero.isPlayer || hero.items.length >= 6) return;
      const plans = {
        clash: ["warden-pendant", "iron-armor", "wind-boots", "storm-lance", "life-crystal", "moon-cloak"],
        jungle: ["iron-sword", "wind-boots", "vampire-blade", "storm-lance", "iron-armor", "moon-cloak"],
        mid: ["star-charm", "arcane-tome", "wind-boots", "flame-orb", "sky-staff", "moon-cloak"],
        farm: ["wind-boots", "star-bow", "iron-sword", "vampire-blade", "storm-lance", "moon-cloak"],
        support: ["warden-pendant", "wind-boots", "life-crystal", "moon-cloak", "star-charm", "star-wings"]
      };
      const plan = plans[hero.roleId] || plans.mid;
      const next = plan.find((itemId) => {
        const item = ITEMS.find((entry) => entry.id === itemId);
        return item && !hero.items.includes(itemId) && hero.gold >= item.price;
      });
      if (next) this.purchaseItem(hero, next, true);
    }

    setupSquadHud() {
      const markup = (team) => this.heroes
        .map((hero, index) => ({ hero, index }))
        .filter((entry) => entry.hero.team === team)
        .map(({ hero, index }) => `
          <div class="squad-member${hero.isPlayer ? " is-player" : ""}" data-unit-index="${index}" title="${hero.name} · ${hero.roleName}">
            <div class="squad-face" style="--member-color:${hero.color2}">${hero.sigil}<span class="squad-respawn"></span></div>
            <span class="squad-level">${hero.level}</span>
            <div class="squad-health"><i></i></div>
          </div>
        `).join("");
      dom.blueSquad.innerHTML = markup(BLUE);
      dom.redSquad.innerHTML = markup(RED);
    }

    updateSquadHud() {
      $$(".squad-member").forEach((member) => {
        const hero = this.heroes[Number(member.dataset.unitIndex)];
        if (!hero) return;
        member.classList.toggle("is-dead", hero.dead);
        const health = member.querySelector(".squad-health i");
        const level = member.querySelector(".squad-level");
        const respawn = member.querySelector(".squad-respawn");
        health.style.width = `${clamp(hero.hp / hero.maxHp * 100, 0, 100)}%`;
        level.textContent = hero.level;
        respawn.textContent = hero.dead ? Math.max(0, Math.ceil(hero.deathTimer)) : "";
      });
    }

    unitsForTeam(team, includeStructures = false) {
      const units = [
        ...this.heroes.filter((hero) => hero.team === team && !hero.dead && !hero.removed),
        ...this.minions.filter((minion) => minion.team === team && !minion.dead && !minion.removed)
      ];
      if (includeStructures) {
        units.push(...this.structures.filter((structure) => structure.team === team && !structure.dead && !structure.removed));
      }
      return units;
    }

    allTargetUnits() {
      return [
        ...this.heroes,
        ...this.minions,
        ...this.structures,
        ...this.monsters
      ].filter((unit) => !unit.dead && !unit.removed);
    }

    findNearestEnemy(source, range, filter = null) {
      let best = null;
      let bestDistance = range;
      const enemies = source.team === NEUTRAL
        ? this.allTargetUnits().filter((unit) => unit.team !== NEUTRAL)
        : this.allTargetUnits().filter((unit) => hostile(source.team, unit.team));
      enemies.forEach((unit) => {
        if (filter && !filter(unit)) return;
        const d = distance(source, unit) - unit.radius * 0.2;
        if (d < bestDistance) {
          bestDistance = d;
          best = unit;
        }
      });
      return best;
    }

    spawnUnit(unit) {
      if (unit.kind === "minion") this.minions.push(unit);
      else if (unit.kind === "monster") this.monsters.push(unit);
      else if (unit.kind === "hero") this.heroes.push(unit);
      else if (unit.structure) this.structures.push(unit);
    }

    update(dt) {
      if (this.phase !== "playing") return;
      this.time += dt;
      this.camera.zoom = lerp(this.camera.zoom, this.zoomTarget, Math.min(1, dt * 4));
      this.camera.shake = Math.max(0, this.camera.shake - dt * 4.2);
      this.camera.flash = Math.max(0, this.camera.flash - dt * 3.6);

      if (this.time >= this.nextWave) {
        this.spawnWave();
        this.nextWave += 22;
      }
      this.aiShopTimer -= dt;
      if (this.aiShopTimer <= 0) {
        this.aiShopTimer = 1.8;
        this.heroes.filter((hero) => !hero.isPlayer).forEach((hero) => this.autoPurchaseForAI(hero));
      }
      if (!this.bossSpawned && this.time >= 120) this.spawnBoss();
      if (this.bossSpawned && !this.bossAlive && this.bossRespawnAt && this.time >= this.bossRespawnAt) {
        this.spawnBoss(true);
      }
      if (!this.milestones.has("minute1") && this.time >= 60) {
        this.milestones.add("minute1");
        this.showAnnouncement("峡谷战况", "星渊主宰即将苏醒", 2.2);
      }

      this.heroes.forEach((hero) => {
        if (hero.dead) {
          hero.deathTimer -= dt;
          if (hero.deathTimer <= 0) hero.respawn();
        } else {
          hero.update(dt);
        }
      });
      this.minions.forEach((minion) => minion.update(dt));
      this.structures.forEach((structure) => structure.update(dt));
      this.monsters.forEach((monster) => {
        if (monster.dead) {
          if (!monster.boss && monster.respawnAt && this.time >= monster.respawnAt) {
            monster.dead = false;
            monster.hp = monster.maxHp;
            monster.x = monster.spawn.x;
            monster.y = monster.spawn.y;
            monster.respawnAt = 0;
            this.spawnMonsterRespawn(monster);
          }
        } else {
          monster.update(dt);
        }
      });

      this.separateUnits(dt);
      this.updateProjectiles(dt);
      this.updateAreas(dt);
      this.updateParticles(dt);
      this.updateEffects(dt);
      this.minions = this.minions.filter((minion) => !minion.removed && !(minion.dead && minion.deathTimer > 2.4));

      const targetCameraX = this.player.dead ? this.player.x : this.player.x;
      const targetCameraY = this.player.dead ? this.player.y : this.player.y;
      this.camera.x = lerp(this.camera.x, targetCameraX, Math.min(1, dt * 5.2));
      this.camera.y = lerp(this.camera.y, targetCameraY, Math.min(1, dt * 5.2));

      if (this.endQueued) {
        this.endQueued.delay -= dt;
        if (this.endQueued.delay <= 0) {
          const winningTeam = this.endQueued.winningTeam;
          this.endQueued = null;
          finishMatch(winningTeam);
        }
      }

      this.lastHudUpdate += dt;
      if (this.lastHudUpdate > 0.07) {
        this.lastHudUpdate = 0;
        this.updateHud();
      }
    }

    spawnWave() {
      this.waveNumber += 1;
      [BLUE, RED].forEach((team) => {
        for (let laneIndex = 0; laneIndex < MAP.lanes.length; laneIndex++) {
          const path = MAP.lanes[laneIndex].points;
          const spawn = team === BLUE ? path[0] : path[path.length - 1];
          const direction = team === BLUE ? 1 : -1;
          const baseAngle = Math.atan2(
            path[team === BLUE ? 1 : path.length - 2].y - spawn.y,
            path[team === BLUE ? 1 : path.length - 2].x - spawn.x
          );
          const offsetX = Math.cos(baseAngle + Math.PI / 2) * 35;
          const offsetY = Math.sin(baseAngle + Math.PI / 2) * 35;
          const units = [
            { type: "melee", offset: -1.5 },
            { type: "melee", offset: -0.5 },
            { type: "melee", offset: 0.5 },
            { type: "caster", offset: 1.5 }
          ];
          if (this.waveNumber % 3 === 0) units.push({ type: "siege", offset: 2.5 });
          units.forEach((unit, index) => {
            const along = index * 22 * direction;
            const minion = new Minion(
              team,
              laneIndex,
              unit.type,
              this.waveNumber,
              spawn.x + offsetX * unit.offset - Math.cos(baseAngle) * along,
              spawn.y + offsetY * unit.offset - Math.sin(baseAngle) * along,
              unit.offset * 8
            );
            this.minions.push(minion);
          });
          this.spawnWavePulse(spawn.x, spawn.y, team);
        }
      });
      if (this.waveNumber === 1) this.showAnnouncement("战局开始", "兵线已出发", 1.8);
    }

    spawnBoss(respawn = false) {
      if (this.bossMonster && !this.bossMonster.dead) return;
      const bossData = {
        x: MAP.bossSpawn.x,
        y: MAP.bossSpawn.y,
        name: "星渊主宰",
        color: "#e6c476",
        scale: 1.3
      };
      const boss = new Monster(bossData, -1, true);
      this.monsters = this.monsters.filter((monster) => !monster.boss);
      this.monsters.push(boss);
      this.bossMonster = boss;
      this.bossAlive = true;
      this.bossSpawned = true;
      this.spawnBossArrival(boss.x, boss.y);
      this.showAnnouncement("星渊主宰降临", respawn ? "争夺河道终极资源" : "击败它，获得全队强化", 2.8);
    }

    separateUnits(dt) {
      const units = [...this.heroes, ...this.minions].filter((unit) => !unit.dead && !unit.removed && !unit.structure);
      for (let i = 0; i < units.length; i++) {
        const a = units[i];
        for (let j = i + 1; j < units.length; j++) {
          const b = units[j];
          if (a.team !== b.team) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minDistance = (a.radius + b.radius) * 0.72;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0.001 && distSq < minDistance * minDistance) {
            const dist = Math.sqrt(distSq);
            const push = (minDistance - dist) * Math.min(1, dt * 8) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;
          }
        }
      }
    }

    castAbility(hero, index, aimX, aimY) {
      if (!hero || hero.dead || hero.team === NEUTRAL) return false;
      const ability = hero.heroDefinition.abilities[index];
      if (!ability || hero.abilityCooldowns[index] > 0) {
        if (hero.isPlayer && ability) showToast(`技能冷却中 · ${Math.ceil(hero.abilityCooldowns[index])}s`);
        return false;
      }
      if (hero.mana < ability.mana) {
        if (hero.isPlayer) showToast("法力不足");
        return false;
      }
      hero.cancelRecall();
      hero.abilityCooldowns[index] = ability.cooldown;
      hero.mana -= ability.mana;
      hero.castPulse = 1;
      hero.facing = angleTo(hero, { x: aimX, y: aimY });
      audio.skill(index === 3);
      this.applyAbility(hero, ability, aimX, aimY);
      return true;
    }

    aimPoint(hero, aimX, aimY, maxRange) {
      const dx = aimX - hero.x;
      const dy = aimY - hero.y;
      const direction = normalize(dx, dy);
      const range = Math.min(maxRange || direction.length, direction.length || maxRange);
      return {
        x: hero.x + direction.x * range,
        y: hero.y + direction.y * range,
        direction
      };
    }

    applyAbility(hero, ability, aimX, aimY) {
      const team = hero.team;
      const color = ability.color || hero.color;
      switch (ability.type) {
        case "dash": {
          const startX = hero.x;
          const startY = hero.y;
          const point = this.aimPoint(hero, aimX, aimY, ability.distance);
          this.damageLine(team, startX, startY, point.x, point.y, ability.radius, ability.damage, hero, {
            slow: ability.slow
          });
          this.spawnDashTrail(startX, startY, point.x, point.y, color);
          hero.x = point.x;
          hero.y = point.y;
          break;
        }
        case "blink": {
          const point = this.aimPoint(hero, aimX, aimY, ability.distance);
          this.spawnTeleportEffect(hero.x, hero.y, color);
          this.addParticleBurst(hero.x, hero.y, color, 16, 170);
          hero.x = point.x;
          hero.y = point.y;
          this.spawnTeleportEffect(hero.x, hero.y, color);
          break;
        }
        case "slash": {
          this.damageCircle(team, hero.x, hero.y, ability.radius, ability.damage, hero, {
            slow: ability.slow,
            slowDuration: ability.slowDuration
          });
          this.spawnSlashEffect(hero.x, hero.y, ability.radius, color, hero.facing);
          this.camera.shake = Math.max(this.camera.shake, 0.12);
          break;
        }
        case "bolt": {
          const point = this.aimPoint(hero, aimX, aimY, ability.range);
          const direction = normalize(point.x - hero.x, point.y - hero.y);
          this.projectiles.push({
            kind: "ability",
            x: hero.x + direction.x * 32,
            y: hero.y + direction.y * 32,
            vx: direction.x * ability.speed,
            vy: direction.y * ability.speed,
            radius: ability.width || 22,
            team,
            owner: hero,
            damage: ability.damage,
            remaining: ability.range,
            pierce: Boolean(ability.pierce),
            explode: ability.explode || 0,
            color,
            hit: new Set(),
            trail: []
          });
          break;
        }
        case "zone": {
          const point = this.aimPoint(hero, aimX, aimY, ability.range);
          this.areas.push({
            kind: "zone",
            x: point.x,
            y: point.y,
            radius: ability.radius,
            team,
            owner: hero,
            color,
            delay: ability.delay || 0.2,
            delayRemaining: ability.delay || 0.2,
            duration: 0.08,
            remaining: 0.08,
            damage: ability.damage,
            stun: ability.stun || 0,
            root: ability.root || 0,
            slow: ability.slow || 0,
            triggered: false
          });
          break;
        }
        case "rain": {
          const point = this.aimPoint(hero, aimX, aimY, ability.range);
          this.areas.push({
            kind: "rain",
            x: point.x,
            y: point.y,
            radius: ability.radius,
            team,
            owner: hero,
            color,
            delay: 0.18,
            delayRemaining: 0.18,
            duration: ability.duration,
            remaining: ability.duration,
            damage: ability.damage,
            tick: ability.tick,
            tickTimer: 0,
            slow: ability.slow || 0,
            triggered: false
          });
          break;
        }
        case "execute": {
          let target = null;
          let lowestHp = Infinity;
          this.heroes.forEach((unit) => {
            if (unit.team !== team && !unit.dead && distance(hero, unit) <= ability.range && unit.hp < lowestHp) {
              target = unit;
              lowestHp = unit.hp;
            }
          });
          if (!target) target = this.findNearestEnemy(hero, ability.range, (unit) => unit.kind === "hero");
          this.spawnExecuteLines(hero, target ? target.x : aimX, target ? target.y : aimY, color);
          if (target) {
            const missing = 1 - target.hp / target.maxHp;
            const damage = ability.damage + target.maxHp * ability.executeRatio * missing;
            this.dealDamage(hero, target, damage, { ability: true, critical: true });
            this.spawnBurst(target.x, target.y, color, 90);
            this.camera.shake = 0.3;
          }
          break;
        }
        case "vanish": {
          hero.stealthUntil = this.time + ability.duration;
          hero.speedBoostUntil = this.time + ability.duration;
          hero.speedMultiplier = ability.speedBoost;
          hero.damageReductionUntil = this.time + ability.duration;
          this.addParticleBurst(hero.x, hero.y, color, 24, 120);
          break;
        }
        case "shield": {
          hero.shield = Math.max(hero.shield, ability.shield * (1 + hero.abilityPower / 800));
          hero.shieldUntil = this.time + ability.duration;
          this.spawnShieldRing(hero, color);
          break;
        }
        case "heal": {
          const healAmount = ability.heal * (1 + hero.abilityPower / 520);
          this.heroes.forEach((ally) => {
            if (ally.team === team && !ally.dead && distance(hero, ally) <= ability.radius) {
              ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
              ally.shield = Math.max(ally.shield, (ability.shield || 0) * (1 + hero.abilityPower / 800));
              ally.shieldUntil = this.time + 2.8;
              this.spawnHealEffect(ally.x, ally.y, color);
            }
          });
          break;
        }
        case "leap": {
          const point = this.aimPoint(hero, aimX, aimY, ability.range);
          hero.x = point.x;
          hero.y = point.y;
          this.areas.push({
            kind: "zone",
            x: point.x,
            y: point.y,
            radius: ability.radius,
            team,
            owner: hero,
            color,
            delay: 0.08,
            delayRemaining: 0.08,
            duration: 0.1,
            remaining: 0.1,
            damage: ability.damage,
            stun: ability.stun || 0,
            triggered: false
          });
          this.camera.shake = 0.36;
          break;
        }
        case "sanctuary": {
          const healAmount = ability.heal * (1 + hero.abilityPower / 520);
          this.heroes.forEach((ally) => {
            if (ally.team === team && !ally.dead && distance(hero, ally) <= ability.radius) {
              ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
              ally.shield = Math.max(ally.shield, (ability.shield || 0) * (1 + hero.abilityPower / 800));
              ally.shieldUntil = this.time + 3.2;
              this.spawnHealEffect(ally.x, ally.y, color);
            }
          });
          this.damageCircle(team, hero.x, hero.y, ability.radius, ability.damage, hero, {
            stun: ability.stun
          });
          this.spawnSanctuaryEffect(hero.x, hero.y, ability.radius, color);
          break;
        }
        default:
          break;
      }
    }

    damageCircle(team, x, y, radius, damage, source, statuses = {}) {
      this.allTargetUnits().forEach((unit) => {
        if (unit.team === team || !hostile(team, unit.team)) return;
        if (distance(unit, { x, y }) <= radius + unit.radius) {
          this.dealDamage(source, unit, damage, { ability: true });
          if (statuses.stun) unit.stunUntil = Math.max(unit.stunUntil, this.time + statuses.stun);
          if (statuses.root) unit.rootUntil = Math.max(unit.rootUntil, this.time + statuses.root);
          if (statuses.slow) {
            unit.slowUntil = Math.max(unit.slowUntil, this.time + (statuses.slowDuration || 1.8));
            unit.slowFactor = 1 - statuses.slow;
          }
        }
      });
    }

    damageLine(team, x1, y1, x2, y2, width, damage, source, statuses = {}) {
      this.allTargetUnits().forEach((unit) => {
        if (unit.team === team || !hostile(team, unit.team)) return;
        if (pointSegmentDistance(unit.x, unit.y, x1, y1, x2, y2) <= width + unit.radius) {
          this.dealDamage(source, unit, damage, { ability: true });
          if (statuses.slow) {
            unit.slowUntil = Math.max(unit.slowUntil, this.time + 1.7);
            unit.slowFactor = 1 - statuses.slow;
          }
        }
      });
    }

    dealDamage(source, target, amount, options = {}) {
      if (!source || !target || target.dead || target.removed || !hostile(source.team, target.team)) return 0;
      let damage = amount;
      if (source.kind === "hero") {
        if (this.buff[source.team] > this.time) damage *= 1.16;
        if (options.ability) damage *= 1 + (source.level - 1) * 0.028 + source.abilityPower / 620;
      }
      if (target.kind === "hero" && this.time < target.damageReductionUntil) damage *= 0.48;
      if (target.kind === "hero") {
        damage *= 1 - clamp(target.armor / (target.armor + 720), 0, 0.45);
        damage *= 1 - clamp(target.equipmentReduction || 0, 0, 0.35);
      }
      if (target.structure) damage *= target.kind === "nexus" ? 0.86 : 0.9;
      let applied = damage;
      if (target.shield > 0) {
        const absorbed = Math.min(target.shield, applied);
        target.shield -= absorbed;
        applied -= absorbed;
        if (absorbed > 0) this.spawnShieldHit(target.x, target.y, absorbed);
      }
      target.hp -= applied;
      target.hitFlash = 0.13;
      if (applied > 0 && (source.kind === "hero" || target.kind === "hero")) {
        this.addParticleBurst(
          target.x,
          target.y - Math.min(38, target.radius),
          options.critical ? "#fff0b0" : target.kind === "hero" ? target.glow : "#f1d899",
          options.critical ? 18 : 7,
          options.critical ? 160 : 85,
          { life: options.critical ? 0.7 : 0.38, size: options.critical ? 4 : 2.4, gravity: 80 }
        );
      }
      if (source.kind === "hero") {
        source.damageDealt += Math.max(0, applied);
        this.teamStats[source.team].heroDamage += Math.max(0, applied);
        source.lastCombat = this.time;
        if (options.basic && source.lifeSteal > 0 && applied > 0 && !source.dead) {
          const healed = Math.min(source.maxHp - source.hp, applied * source.lifeSteal);
          if (healed > 0) {
            source.hp += healed;
            if (source.isPlayer) this.spawnDamageText(source.x, source.y - 104, `+${Math.round(healed)}`, "#87efb6");
          }
        }
      }
      if (target.kind === "hero") {
        target.lastCombat = this.time;
        target.cancelRecall();
        if (target.isPlayer) {
          dom.damageFlash.classList.remove("flash");
          void dom.damageFlash.offsetWidth;
          dom.damageFlash.classList.add("flash");
          this.camera.shake = Math.max(this.camera.shake, 0.09);
          audio.impact();
        }
      }
      if (target.kind === "monster") {
        target.aggroTarget = source;
        target.aggroUntil = this.time + 7;
      }
      if ((target.kind === "hero" || target.kind === "tower" || target.kind === "nexus" || target.kind === "monster") && applied > 0) {
        const color = source.kind === "hero" ? source.glow : "#f1dc9b";
        this.spawnDamageText(target.x, target.y - target.radius - 14, Math.round(applied), color, options.critical);
      }
      if (source.isPlayer && Math.random() < 0.6) audio.attack();
      if (target.hp <= 0) this.killUnit(target, source);
      return Math.max(0, applied);
    }

    killUnit(target, source) {
      if (target.dead) return;
      target.dead = true;
      target.hp = 0;
      this.spawnDeathBurst(target.x, target.y, target.kind === "hero" ? target.color : "#dec98c", target.kind === "nexus" ? 110 : target.radius);
      if (target.kind === "minion") {
        target.deathTimer = 0;
        target.removed = false;
        const killer = source.kind === "hero" ? source : this.heroes.find((hero) => hero.team === source.team && distance(hero, target) < 520);
        if (killer) {
          killer.gold += target.minionType === "siege" ? 64 : 34;
          killer.cs += 1;
        }
        this.heroes.forEach((hero) => {
          if (hero.team === source.team && !hero.dead && distance(hero, target) < 760) {
            hero.gainXp(target.minionType === "siege" ? 52 : 28);
          }
        });
      } else if (target.kind === "tower") {
        target.deathTimer = 0;
        this.teamStats[source.team === BLUE ? BLUE : RED].towerKills += 1;
        this.heroes.forEach((hero) => {
          if (hero.team === source.team) hero.gold += 85;
        });
        this.addFeed(source, target, true);
        this.showAnnouncement(source.team === BLUE ? "星穹推进" : "赤曜推进", `${this.teamName(source.team)}摧毁了${MAP.lanes[target.lane].short}防御塔`, 2.2);
        this.camera.shake = Math.max(this.camera.shake, 0.15);
      } else if (target.kind === "nexus") {
        target.deathTimer = 0;
        this.showAnnouncement(source.team === BLUE ? "终局已定" : "圣坛陨落", `${this.teamName(source.team)}击破了敌方核心`, 2.8);
        this.endQueued = { delay: 1.8, winningTeam: source.team };
        this.camera.shake = 0.8;
        this.spawnBossArrival(target.x, target.y);
      } else if (target.kind === "monster") {
        target.deathTimer = 0;
        const killer = source.kind === "hero" ? source : this.findNearestEnemy(target, 700, (unit) => unit.kind === "hero");
        if (killer && killer.kind === "hero") {
          killer.gold += target.boss ? 420 : 120;
          killer.damageDealt += 0;
        }
        if (target.boss) {
          this.bossAlive = false;
          this.bossRespawnAt = this.time + 150;
          if (killer && killer.kind === "hero") {
            this.buff[killer.team] = this.time + 90;
            this.heroes.forEach((hero) => {
              if (hero.team === killer.team) hero.gold += 130;
            });
            this.showAnnouncement("主宰之力", `${this.teamName(killer.team)}获得全队攻击强化`, 3);
            this.addFeed(killer, target, true);
            audio.kill();
          }
        } else {
          target.respawnAt = this.time + 58;
        }
      } else if (target.kind === "hero") {
        let killer = source.kind === "hero" ? source : this.findNearestEnemy(target, 700, (unit) => unit.kind === "hero");
        if (!killer || killer.team === target.team) {
          killer = this.heroes.find((hero) => hero.team === source.team && !hero.dead && distance(hero, target) < 850) || source;
        }
        const killerTeam = killer.team === NEUTRAL ? source.team : killer.team;
        if (killerTeam === BLUE || killerTeam === RED) this.teamStats[killerTeam].kills += 1;
        target.deaths += 1;
        if (killer.kind === "hero") {
          killer.kills += 1;
          killer.gold += 280 + target.level * 18;
          killer.gainXp(105 + target.level * 8);
        }
        this.heroes.forEach((hero) => {
          if (hero.team === killerTeam && hero !== killer && distance(hero, target) < 750) {
            hero.assists += 1;
            hero.gainXp(48);
            hero.gold += 70;
          }
        });
        target.respawnDelay = 6.5 + target.level * 0.8;
        target.deathTimer = target.respawnDelay;
        target.recalling = false;
        this.addFeed(killer, target, false);
        if (target.isPlayer) {
          dom.deathOverlay.hidden = false;
          dom.respawnTimer.textContent = Math.ceil(target.deathTimer);
          showToast(`你被 ${killer.name || "敌方单位"} 击败`, 2000);
          this.camera.shake = 0.45;
          audio.defeat();
        } else if (killer.isPlayer) {
          this.showAnnouncement("击败敌方英雄", `${target.name} 已倒下`, 1.8);
          this.spawnKillCallout(target);
          audio.kill();
        }
        if (killer.kind === "hero") this.spawnSlayerAura(killer);
      }
    }

    teamName(team) {
      return team === BLUE ? "星穹" : team === RED ? "赤曜" : "中立";
    }

    addFeed(killer, victim, structure = false) {
      if (killer.kind !== "hero" && structure) {
        const fallback = this.findNearestEnemy(victim, 800, (unit) => unit.kind === "hero");
        if (fallback) killer = fallback;
      }
      const item = document.createElement("div");
      item.className = `feed-item ${killer.team === RED ? "enemy-kill" : ""}`;
      item.innerHTML = `<span class="slayer">${killer.name || (killer.team === BLUE ? "星穹" : "赤曜")}</span><span class="weapon">${structure ? "◆" : "⟡"}</span><span>${victim.name || "防御塔"}</span>`;
      dom.killFeed.prepend(item);
      while (dom.killFeed.children.length > 5) dom.killFeed.lastElementChild.remove();
      setTimeout(() => item.remove(), 7000);
    }

    updateProjectiles(dt) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i];
        projectile.trail.unshift({ x: projectile.x, y: projectile.y });
        if (projectile.trail.length > 8) projectile.trail.pop();
        const stepX = projectile.vx * dt;
        const stepY = projectile.vy * dt;
        projectile.x += stepX;
        projectile.y += stepY;
        projectile.remaining -= Math.hypot(stepX, stepY);
        let remove = projectile.remaining <= 0;
        for (const unit of this.allTargetUnits()) {
          if (unit.team === projectile.team || !hostile(unit.team, projectile.team) || projectile.hit.has(unit)) continue;
          if (distance(projectile, unit) <= projectile.radius + unit.radius) {
            projectile.hit.add(unit);
            this.dealDamage(projectile.owner, unit, projectile.damage, { ability: true });
            this.spawnBurst(unit.x, unit.y, projectile.color, Math.max(20, projectile.radius));
            if (projectile.explode) {
              this.damageCircle(projectile.team, unit.x, unit.y, projectile.explode, projectile.damage * 0.48, projectile.owner);
              this.spawnBurst(unit.x, unit.y, projectile.color, projectile.explode);
            }
            if (!projectile.pierce) remove = true;
            if (remove) break;
          }
        }
        if (remove) this.projectiles.splice(i, 1);
      }
    }

    updateAreas(dt) {
      for (let i = this.areas.length - 1; i >= 0; i--) {
        const area = this.areas[i];
        if (area.delayRemaining > 0) {
          area.delayRemaining -= dt;
          if (area.delayRemaining <= 0) {
            area.triggered = true;
            area.tickTimer = 0;
            this.spawnBurst(area.x, area.y, area.color, area.radius * 0.5);
            if (area.kind === "zone") {
              this.damageCircle(area.team, area.x, area.y, area.radius, area.damage || 0, area.owner, {
                stun: area.stun,
                root: area.root,
                slow: area.slow
              });
            }
          }
          continue;
        }
        area.remaining -= dt;
        area.tickTimer -= dt;
        if (area.kind === "rain") {
          if (area.tickTimer <= 0) {
            area.tickTimer = area.tick;
            this.damageCircle(area.team, area.x, area.y, area.radius, area.damage, area.owner, {
              slow: area.slow,
              slowDuration: 0.8
            });
            this.spawnRainTick(area);
          }
        } else if (!area.triggered) {
          area.triggered = true;
          this.damageCircle(area.team, area.x, area.y, area.radius, area.damage || 0, area.owner, {
            stun: area.stun,
            root: area.root,
            slow: area.slow
          });
        }
        if (area.remaining <= 0) {
          this.spawnAreaEnd(area);
          this.areas.splice(i, 1);
        }
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i];
        particle.life -= dt;
        if (particle.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= Math.pow(particle.drag || 0.04, dt);
        particle.vy *= Math.pow(particle.drag || 0.04, dt);
        particle.vy += (particle.gravity || 0) * dt;
      }
    }

    updateEffects(dt) {
      for (let i = this.effects.length - 1; i >= 0; i--) {
        const effect = this.effects[i];
        effect.life -= dt;
        if (effect.life <= 0) this.effects.splice(i, 1);
      }
    }

    addParticleBurst(x, y, color, count, speed = 120, options = {}) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * TAU;
        const velocity = speed * (0.25 + Math.random() * 0.75);
        this.particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: (options.life || 0.55) * (0.45 + Math.random() * 0.6),
          maxLife: options.life || 0.55,
          size: (options.size || 4) * (0.4 + Math.random()),
          color,
          drag: options.drag || 0.03,
          gravity: options.gravity || 0,
          glow: options.glow ?? 10
        });
      }
    }

    spawnBurst(x, y, color, radius, life = 0.45) {
      this.effects.push({ kind: "ring", x, y, color, radius, life, maxLife: life });
      this.addParticleBurst(x, y, color, 16, radius * 2.3, { life: 0.5, size: 3.5 });
    }

    spawnDamageText(x, y, amount, color, critical = false) {
      this.effects.push({
        kind: "text",
        x: x + (Math.random() - 0.5) * 18,
        y,
        text: String(amount),
        color,
        life: 0.75,
        maxLife: 0.75,
        critical
      });
    }

    spawnMeleeArc(source, target) {
      this.effects.push({
        kind: "arc",
        x: source.x,
        y: source.y,
        angle: angleTo(source, target),
        color: source.kind === "hero" ? source.glow : "#d7c58d",
        radius: source.attackRange + 18,
        life: 0.16,
        maxLife: 0.16
      });
    }

    spawnAttackTracer(source, target, color) {
      this.effects.push({
        kind: "tracer",
        x1: source.x,
        y1: source.y - 14,
        x2: target.x,
        y2: target.y - 12,
        color,
        life: source.kind === "tower" ? 0.18 : 0.12,
        maxLife: 0.18
      });
    }

    spawnTowerBolt(tower, target, nexus = false) {
      this.spawnAttackTracer(tower, target, tower.team === BLUE ? "#7bebff" : "#ff8f95");
      this.effects.push({
        kind: "towerShot",
        x1: tower.x,
        y1: tower.y - tower.radius,
        x2: target.x,
        y2: target.y,
        color: tower.team === BLUE ? "#82ecff" : "#ff8f95",
        life: 0.22,
        maxLife: 0.22,
        size: nexus ? 11 : 7
      });
      setTimeout(() => {
        if (game === this) this.dealDamage(tower, target, tower.attackDamage, { basic: true });
      }, 140);
      this.addParticleBurst(tower.x, tower.y - 40, tower.team === BLUE ? "#7be8f7" : "#ff8189", 10, 90, { life: 0.36 });
    }

    spawnDashTrail(x1, y1, x2, y2, color) {
      this.effects.push({ kind: "line", x1, y1, x2, y2, color, life: 0.4, maxLife: 0.4, width: 34 });
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        this.addParticleBurst(lerp(x1, x2, t), lerp(y1, y2, t), color, 4, 80, { life: 0.55, size: 3 });
      }
    }

    spawnTeleportEffect(x, y, color) {
      this.effects.push({ kind: "portal", x, y, color, radius: 54, life: 0.65, maxLife: 0.65 });
      this.addParticleBurst(x, y, color, 22, 180, { life: 0.7, size: 4, gravity: -20 });
    }

    spawnSlashEffect(x, y, radius, color, angle) {
      this.effects.push({ kind: "slash", x, y, radius, color, angle, life: 0.38, maxLife: 0.38 });
    }

    spawnShieldRing(unit, color) {
      this.effects.push({ kind: "shield", unit, color, radius: unit.radius + 20, life: 0.8, maxLife: 0.8 });
    }

    spawnShieldHit(x, y, amount) {
      this.effects.push({ kind: "text", x, y: y - 52, text: `-${Math.round(amount)} 盾`, color: "#b9ddf1", life: 0.65, maxLife: 0.65, critical: false });
    }

    spawnHealEffect(x, y, color) {
      this.effects.push({ kind: "heal", x, y, color, radius: 35, life: 0.7, maxLife: 0.7 });
      this.addParticleBurst(x, y - 20, color, 14, 65, { life: 0.8, size: 4, gravity: -35, glow: 12 });
    }

    spawnSanctuaryEffect(x, y, radius, color) {
      this.effects.push({ kind: "sanctuary", x, y, color, radius, life: 0.9, maxLife: 0.9 });
      this.effects.push({ kind: "ring", x, y, color, radius, life: 0.65, maxLife: 0.65 });
      this.addParticleBurst(x, y, color, 50, 260, { life: 1, size: 3.5 });
    }

    spawnExecuteLines(source, x, y, color) {
      this.effects.push({ kind: "execute", x1: source.x, y1: source.y, x2: x, y2: y, color, life: 0.48, maxLife: 0.48 });
    }

    spawnDeathBurst(x, y, color, radius) {
      this.effects.push({ kind: "ring", x, y, color, radius: radius * 2.5, life: 0.7, maxLife: 0.7 });
      this.addParticleBurst(x, y, color, 38, 210, { life: 0.9, size: 5 });
    }

    spawnLevelEffect(hero) {
      this.effects.push({ kind: "level", unit: hero, life: 1.2, maxLife: 1.2, color: "#e9ce89" });
      this.addParticleBurst(hero.x, hero.y, "#eed79a", 28, 150, { life: 1, size: 3.5, gravity: -30 });
    }

    spawnWavePulse(x, y, team) {
      const color = team === BLUE ? "#6fe8df" : "#ff7a82";
      this.effects.push({ kind: "ring", x, y, color, radius: 120, life: 0.75, maxLife: 0.75 });
    }

    spawnBossArrival(x, y) {
      this.effects.push({ kind: "boss", x, y, life: 1.4, maxLife: 1.4 });
      this.addParticleBurst(x, y, "#e6c476", 60, 280, { life: 1.2, size: 5, glow: 20 });
      this.camera.shake = Math.max(this.camera.shake, 0.26);
    }

    spawnMonsterRespawn(monster) {
      this.spawnTeleportEffect(monster.x, monster.y, monster.color);
    }

    spawnRainTick(area) {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * TAU;
        const radius = Math.sqrt(Math.random()) * area.radius;
        this.effects.push({
          kind: "meteor",
          x: area.x + Math.cos(angle) * radius,
          y: area.y + Math.sin(angle) * radius,
          color: area.color,
          life: 0.38,
          maxLife: 0.38
        });
      }
      this.addParticleBurst(area.x, area.y, area.color, 3, 80, { life: 0.32, size: 2 });
    }

    spawnAreaEnd(area) {
      this.effects.push({ kind: "ring", x: area.x, y: area.y, color: area.color, radius: area.radius, life: 0.4, maxLife: 0.4 });
    }

    spawnKillCallout(target) {
      dom.comboCallout.textContent = `${target.name} · 已击败`;
      dom.comboCallout.hidden = false;
      setTimeout(() => {
        dom.comboCallout.hidden = true;
      }, 900);
    }

    spawnSlayerAura(hero) {
      if (hero.isPlayer) hero.gold += 30;
    }

    showAnnouncement(kicker, text, duration = 2.2) {
      const token = ++App.announcementToken;
      dom.announcementKicker.textContent = kicker;
      dom.announcementText.textContent = text;
      dom.announcement.hidden = false;
      setTimeout(() => {
        if (token === App.announcementToken) dom.announcement.hidden = true;
      }, duration * 1000);
    }

    updateHud(force = false) {
      const player = this.player;
      if (!player) return;
      dom.blueKills.textContent = this.teamStats.blue.kills;
      dom.redKills.textContent = this.teamStats.red.kills;
      dom.matchClock.textContent = formatTime(this.time);
      dom.minimapTimer.textContent = formatTime(this.time);
      dom.hudLevel.textContent = player.level;
      dom.hudRole.textContent = player.roleName;
      dom.hudKda.textContent = `${player.kills} / ${player.deaths} / ${player.assists}`;
      dom.hudGold.textContent = `${Math.floor(player.gold)} G`;
      if (!dom.shopModal.hidden) dom.shopGold.textContent = Math.floor(player.gold);
      dom.hpBar.style.width = `${clamp(player.hp / player.maxHp * 100, 0, 100)}%`;
      dom.hpText.textContent = player.dead ? "已阵亡" : `${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`;
      dom.manaBar.style.width = `${clamp(player.mana / player.maxMana * 100, 0, 100)}%`;
      dom.xpBar.style.width = `${clamp(player.xp / player.xpToNext * 100, 0, 100)}%`;
      dom.comboStatus.textContent = `${player.kills} 击败 · ${player.cs} 补刀`;

      HUD_KEYS.forEach((key, index) => {
        const ability = player.heroDefinition.abilities[index];
        const cooldown = player.abilityCooldowns[index];
        const button = hudRefs.abilityButtons[index];
        const cooldownNode = hudRefs.cooldownNodes[index];
        button.classList.toggle("is-cooling", cooldown > 0);
        button.classList.toggle("no-mana", player.mana < ability.mana);
        button.style.setProperty("--cd-ratio", String(cooldown > 0 ? cooldown / ability.cooldown : 0));
        cooldownNode.textContent = cooldown > 0 ? (cooldown > 10 ? Math.ceil(cooldown) : cooldown.toFixed(1)) : "";
      });

      if (this.time < 120) {
        const seconds = Math.ceil(120 - this.time);
        dom.objectiveHint.textContent = `星渊主宰 ${formatTime(seconds)} 后降临`;
        dom.objectiveStatus.textContent = `${formatTime(seconds)} 后降临`;
      } else if (this.bossMonster && !this.bossMonster.dead) {
        dom.objectiveHint.textContent = `星渊主宰 · ${Math.ceil(this.bossMonster.hp / this.bossMonster.maxHp * 100)}%`;
        dom.objectiveStatus.textContent = `生命 ${Math.ceil(this.bossMonster.hp)} / ${this.bossMonster.maxHp}`;
      } else {
        const wait = Math.max(0, Math.ceil((this.bossRespawnAt || this.time) - this.time));
        dom.objectiveHint.textContent = "星渊主宰已被击败";
        dom.objectiveStatus.textContent = `${formatTime(wait)} 后重生`;
      }

      this.updateSquadHud();
      const bossAlive = Boolean(this.bossMonster && !this.bossMonster.dead);
      dom.bossHud.hidden = !bossAlive;
      if (bossAlive) {
        dom.bossHudName.textContent = `${this.bossMonster.name} · ${Math.ceil(this.bossMonster.hp)}`;
        dom.bossHudBar.style.width = `${clamp(this.bossMonster.hp / this.bossMonster.maxHp * 100, 0, 100)}%`;
      }
      const target = player.attackTarget;
      const showTarget = Boolean(target && !target.dead && !target.removed && !bossAlive);
      dom.targetPanel.hidden = !showTarget;
      if (showTarget) {
        dom.targetCrest.textContent = target.sigil || (target.kind === "tower" ? "塔" : "敌");
        dom.targetName.textContent = target.name || "敌方单位";
        dom.targetHealth.style.width = `${clamp(target.hp / target.maxHp * 100, 0, 100)}%`;
        dom.targetHealthText.textContent = `${Math.ceil(target.hp)} / ${Math.ceil(target.maxHp)}`;
      }

      if (player.dead) {
        dom.deathOverlay.hidden = false;
        dom.respawnTimer.textContent = Math.max(0, Math.ceil(player.deathTimer));
      } else {
        dom.deathOverlay.hidden = true;
      }
      if (player.recalling) {
        dom.recallIndicator.hidden = false;
        dom.recallProgress.style.width = `${clamp(player.recall / 3.2 * 100, 0, 100)}%`;
      } else {
        dom.recallIndicator.hidden = true;
      }
      if (force) dom.statHint.textContent = "点击敌人发起攻击 · 右键移动";
    }
  }

  function screenToWorld(screenX, screenY) {
    if (!game) return { x: MAP.size / 2, y: MAP.size / 2 };
    const zoom = game.camera.zoom;
    return {
      x: game.camera.x + (screenX - window.innerWidth / 2) / zoom,
      y: game.camera.y + (screenY - window.innerHeight / 2) / zoom
    };
  }

  function drawEntityShadow(ctx, x, y, radius, alpha = 0.28) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x + 4, y + radius * 0.65, radius * 0.92, radius * 0.42, 0, 0, TAU);
    ctx.fill();
  }

  function drawHealthBar(ctx, unit, width, yOffset, showName = false) {
    const x = unit.x - width / 2;
    const y = unit.y - yOffset;
    const ratio = clamp(unit.hp / unit.maxHp, 0, 1);
    const teamColor = TEAM_COLORS[unit.team] || TEAM_COLORS.neutral;
    ctx.fillStyle = "rgba(2, 9, 11, 0.8)";
    roundedRect(ctx, x - 1, y - 1, width + 2, 7, 2);
    ctx.fill();
    ctx.fillStyle = unit.team === RED ? "#de5e69" : unit.team === BLUE ? "#5bcbaa" : "#c5af72";
    ctx.fillRect(x, y, width * ratio, 5);
    if (unit.shield > 0) {
      const shieldRatio = clamp(unit.shield / unit.maxHp, 0, 1 - ratio);
      ctx.fillStyle = "rgba(187, 230, 250, 0.78)";
      ctx.fillRect(x + width * ratio, y, width * shieldRatio, 5);
    }
    if (showName) {
      ctx.font = `500 10px "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(237, 248, 244, 0.85)";
      ctx.fillText(unit.name, unit.x, y - 8);
      if (unit.level) {
        ctx.fillStyle = "rgba(6, 20, 23, 0.9)";
        ctx.beginPath();
        ctx.arc(x - 7, y + 2.5, 7, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(232, 204, 137, 0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#ecd18e";
        ctx.font = `500 7px "Microsoft YaHei", sans-serif`;
        ctx.fillText(String(unit.level), x - 7, y + 5);
      }
    }
    if (unit === game.player) {
      ctx.fillStyle = teamColor.light;
      ctx.beginPath();
      ctx.moveTo(unit.x, y - 12);
      ctx.lineTo(unit.x - 4, y - 19);
      ctx.lineTo(unit.x + 4, y - 19);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawHeroEntity(ctx, hero, time) {
    if (hero.dead) return;
    const opacity = hero.isStealthed && !hero.isPlayer ? 0.22 : 1;
    const teamColor = TEAM_COLORS[hero.team];
    const moving = hero.moving ? 1 : 0;
    const step = Math.sin(time * 9 + hero.bobSeed) * 2.5 * moving;
    const capeSway = Math.sin(time * 2.7 + hero.bobSeed) * 4 + moving * 3;
    const pulse = 1 + Math.sin(time * 3.4 + hero.bobSeed) * 0.025;

    ctx.save();
    ctx.globalAlpha = opacity;
    drawEntityShadow(ctx, hero.x, hero.y + 5, hero.radius * 1.7, 0.4);

    if (hero.isPlayer) {
      ctx.save();
      ctx.translate(hero.x, hero.y + 20);
      ctx.rotate(time * 0.0004);
      ctx.strokeStyle = "rgba(243, 208, 119, 0.38)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.ellipse(0, 0, hero.radius * 1.55, hero.radius * 0.69, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 4; i++) {
        const angle = i / 4 * TAU;
        ctx.fillStyle = "rgba(248, 216, 133, 0.64)";
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * hero.radius * 1.6, Math.sin(angle) * hero.radius * 0.7, 1.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.strokeStyle = hero.isPlayer ? "rgba(241, 205, 117, 0.66)" : `${teamColor.main}88`;
    ctx.lineWidth = hero.isPlayer ? 2 : 1.3;
    ctx.beginPath();
    ctx.ellipse(hero.x, hero.y + 17, hero.radius * 1.2, hero.radius * 0.5, 0, 0, TAU);
    ctx.stroke();

    const aura = ctx.createRadialGradient(hero.x, hero.y - 8, 0, hero.x, hero.y - 8, hero.radius * 2.8);
    aura.addColorStop(0, `${hero.color}2e`);
    aura.addColorStop(0.45, `${teamColor.main}13`);
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(hero.x, hero.y - 8, hero.radius * 2.75, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(hero.x, hero.y + step * 0.35);
    ctx.scale(pulse, pulse);

    if (hero.castPulse > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${hero.castPulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -25, hero.radius + 18 + (1 - hero.castPulse) * 18, 0, TAU);
      ctx.stroke();
    }

    // Sweeping cape, separated feet and tall armour silhouette.
    ctx.save();
    ctx.translate(0, -30);
    ctx.rotate(hero.facing * 0.04);
    const cape = ctx.createLinearGradient(-38, -48, 34, 66);
    cape.addColorStop(0, `${hero.color}de`);
    cape.addColorStop(0.35, hero.color2);
    cape.addColorStop(1, "rgba(5, 18, 21, 0.9)");
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-13, -18);
    ctx.bezierCurveTo(-42, 7, -52 - capeSway, 46, -42 - capeSway, 72);
    ctx.quadraticCurveTo(-7, 57, 3, 31);
    ctx.quadraticCurveTo(24, 65, 52 + capeSway, 60);
    ctx.bezierCurveTo(48 + capeSway, 26, 31, 4, 15, -17);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `${teamColor.light}60`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const bootY = 19 + Math.max(0, step);
    ctx.fillStyle = "#0b181c";
    ctx.strokeStyle = "rgba(224, 201, 142, 0.46)";
    ctx.lineWidth = 1;
    [-1, 1].forEach((flip) => {
      ctx.beginPath();
      ctx.moveTo(flip * 4, -17);
      ctx.lineTo(flip * 17, -16 + (flip * step));
      ctx.lineTo(flip * 20, bootY);
      ctx.lineTo(flip * 4, bootY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    const bodyGradient = ctx.createLinearGradient(-28, -75, 29, 18);
    bodyGradient.addColorStop(0, `${teamColor.light}cc`);
    bodyGradient.addColorStop(0.18, hero.color);
    bodyGradient.addColorStop(0.54, hero.color2);
    bodyGradient.addColorStop(1, "#07171a");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(-18, -69);
    ctx.quadraticCurveTo(-36, -54, -31, 8);
    ctx.lineTo(-12, 25);
    ctx.lineTo(4, 10);
    ctx.lineTo(20, 23);
    ctx.lineTo(32, -7);
    ctx.quadraticCurveTo(31, -52, 17, -69);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(233, 211, 153, 0.52)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Chest plate, shoulder guards and belt.
    const armor = ctx.createLinearGradient(-25, -72, 24, -28);
    armor.addColorStop(0, "rgba(230, 245, 239, 0.68)");
    armor.addColorStop(0.22, "#38595a");
    armor.addColorStop(0.65, "#16282c");
    armor.addColorStop(1, "#081619");
    ctx.fillStyle = armor;
    ctx.beginPath();
    ctx.moveTo(-18, -69);
    ctx.lineTo(0, -77);
    ctx.lineTo(18, -69);
    ctx.lineTo(23, -38);
    ctx.quadraticCurveTo(0, -23, -23, -38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(232, 202, 131, 0.5)";
    ctx.stroke();
    ctx.strokeStyle = `${hero.color}94`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-15, -64);
    ctx.lineTo(0, -48);
    ctx.lineTo(16, -64);
    ctx.stroke();

    [-1, 1].forEach((flip) => {
      ctx.fillStyle = hero.color2;
      ctx.strokeStyle = "rgba(234, 209, 145, 0.52)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(flip * 13, -72);
      ctx.lineTo(flip * 30, -74);
      ctx.lineTo(flip * 40, -61);
      ctx.lineTo(flip * 27, -51);
      ctx.lineTo(flip * 13, -58);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    ctx.fillStyle = "#d6b66f";
    ctx.fillRect(-25, -39, 50, 4);
    ctx.fillStyle = hero.glow;
    ctx.shadowColor = hero.glow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, -36, 4, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Head, hair and class mask.
    ctx.fillStyle = "#0b191d";
    ctx.beginPath();
    ctx.ellipse(1, -92, 16, 17, 0, 0, TAU);
    ctx.fill();
    const faceGradient = ctx.createLinearGradient(0, -107, 0, -79);
    faceGradient.addColorStop(0, "#d6c0ab");
    faceGradient.addColorStop(0.62, "#a27f70");
    faceGradient.addColorStop(1, "#493a39");
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.ellipse(1, -90, 12, 12, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#132329";
    ctx.beginPath();
    ctx.moveTo(-15, -97);
    ctx.quadraticCurveTo(-3, -116, 18, -104);
    ctx.lineTo(15, -94);
    ctx.quadraticCurveTo(1, -101, -13, -87);
    ctx.closePath();
    ctx.fill();
    if (hero.heroId === "support" || hero.heroId === "mage") {
      ctx.strokeStyle = hero.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-8, -104);
      ctx.quadraticCurveTo(-22, -92, -17, -72);
      ctx.moveTo(13, -103);
      ctx.quadraticCurveTo(24, -88, 19, -70);
      ctx.stroke();
    }
    ctx.fillStyle = "#ecf8f4";
    ctx.beginPath();
    ctx.ellipse(-4, -92, 3.3, 0.9, -0.08, 0, TAU);
    ctx.ellipse(6, -92, 3.3, 0.9, 0.08, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hero.glow;
    ctx.shadowColor = hero.glow;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-4, -92, 1.2, 0, TAU);
    ctx.arc(6, -92, 1.2, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arm and weapon read by role.
    ctx.save();
    ctx.translate(0, -56);
    ctx.rotate(hero.facing);
    if (hero.heroId === "guardian") {
      ctx.strokeStyle = "#d9b774";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(54, 0);
      ctx.stroke();
      ctx.fillStyle = "rgba(35, 44, 42, 0.95)";
      ctx.strokeStyle = "#d9b774";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-34, -4);
      ctx.lineTo(-48, -23);
      ctx.lineTo(-59, 1);
      ctx.lineTo(-45, 24);
      ctx.lineTo(-32, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(239, 214, 155, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-46, -16);
      ctx.lineTo(-46, 18);
      ctx.moveTo(-56, 3);
      ctx.lineTo(-35, 3);
      ctx.stroke();
    } else if (hero.heroId === "archer") {
      ctx.strokeStyle = "#d9b96f";
      ctx.lineWidth = 2.8;
      ctx.shadowColor = hero.glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(27, 0, 25, -1.25, 1.25);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(223, 247, 242, 0.8)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(34, -24);
      ctx.lineTo(34, 24);
      ctx.stroke();
      ctx.strokeStyle = hero.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(70, 0);
      ctx.stroke();
    } else if (hero.heroId === "mage" || hero.heroId === "support") {
      ctx.strokeStyle = "#b88d59";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-3, 2);
      ctx.lineTo(44, 3);
      ctx.stroke();
      ctx.fillStyle = hero.glow;
      ctx.shadowColor = hero.glow;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(51, 3, 9, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (hero.heroId === "support") {
        ctx.strokeStyle = `${hero.color}a0`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(48, 3, 18, -1.35, 1.35);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#c7fff8";
      ctx.shadowColor = hero.color;
      ctx.shadowBlur = 13;
      ctx.beginPath();
      ctx.moveTo(4, -4);
      ctx.lineTo(58, -1);
      ctx.lineTo(78, 1);
      ctx.lineTo(54, 6);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    if (hero.shield > 0) {
      ctx.strokeStyle = "rgba(176, 227, 248, 0.58)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(0, -21, hero.radius + 14, hero.radius * 1.55 + 10, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (hero.isStunned) {
      ctx.fillStyle = "#f6e8a9";
      ctx.font = `500 13px "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("✦  ✦  ✦", 0, -123);
    }

    ctx.restore();
    const isLocked = game.player.attackTarget === hero;
    if (isLocked) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 117, 122, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -time * 0.02;
      ctx.beginPath();
      ctx.ellipse(hero.x, hero.y + 17, hero.radius * 1.65, hero.radius * 0.7, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    drawHealthBar(ctx, hero, 72, 126, true);
    ctx.restore();
  }

  function drawMinionEntity(ctx, minion, time) {
    const color = TEAM_COLORS[minion.team];
    if (minion.dead) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - minion.deathTimer / 2.4, 0, 1) * 0.5;
      ctx.translate(minion.x, minion.y);
      ctx.rotate(0.8);
      ctx.fillStyle = minion.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, minion.radius * 1.5, minion.radius * 0.45, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }
    drawEntityShadow(ctx, minion.x, minion.y + 3, minion.radius * 1.15, 0.27);
    const bob = Math.sin(time * 7 + minion.bobSeed) * (minion.moving ? 1.7 : 0.4);
    ctx.save();
    ctx.translate(minion.x, minion.y + bob);
    const facingFlip = Math.cos(minion.facing) >= 0 ? 1 : -1;
    ctx.scale(facingFlip, 1);
    const body = ctx.createLinearGradient(-12, -28, 13, 17);
    body.addColorStop(0, "rgba(238, 251, 246, 0.78)");
    body.addColorStop(0.18, color.light);
    body.addColorStop(0.52, color.main);
    body.addColorStop(1, color.dark);
    if (minion.minionType === "melee") {
      ctx.strokeStyle = "rgba(4, 14, 15, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.lineTo(-8, 17);
      ctx.moveTo(5, 5);
      ctx.lineTo(9, 16);
      ctx.stroke();
      ctx.fillStyle = color.dark;
      ctx.beginPath();
      ctx.moveTo(-8, -21);
      ctx.lineTo(8, -22);
      ctx.lineTo(14, 8);
      ctx.lineTo(0, 15);
      ctx.lineTo(-14, 7);
      ctx.closePath();
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(229, 208, 148, 0.48)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.fillStyle = "#0a191c";
      ctx.beginPath();
      ctx.arc(0, -27, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = color.light;
      ctx.beginPath();
      ctx.moveTo(-9, -31);
      ctx.lineTo(1, -38);
      ctx.lineTo(9, -30);
      ctx.lineTo(6, -24);
      ctx.lineTo(-6, -24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(229, 215, 165, 0.78)";
      ctx.fillRect(-10, -4, 20, 2);
      ctx.fillStyle = "rgba(21, 49, 48, 0.96)";
      ctx.strokeStyle = "rgba(222, 241, 234, 0.38)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(-13, -2, 8, 14, -0.1, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#d9cd9d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(9, -5);
      ctx.lineTo(29, -18);
      ctx.stroke();
      ctx.fillStyle = "#e8ddb2";
      ctx.beginPath();
      ctx.moveTo(28, -19);
      ctx.lineTo(34, -27);
      ctx.lineTo(31, -16);
      ctx.closePath();
      ctx.fill();
    } else if (minion.minionType === "caster") {
      ctx.fillStyle = color.dark;
      ctx.beginPath();
      ctx.moveTo(-5, -21);
      ctx.lineTo(8, -22);
      ctx.lineTo(20, 16);
      ctx.quadraticCurveTo(0, 25, -20, 15);
      ctx.closePath();
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(222, 208, 153, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = "#0b191d";
      ctx.beginPath();
      ctx.arc(0, -28, 8, 0, TAU);
      ctx.fill();
      ctx.fillStyle = color.main;
      ctx.beginPath();
      ctx.moveTo(-10, -30);
      ctx.quadraticCurveTo(0, -43, 11, -30);
      ctx.lineTo(6, -21);
      ctx.lineTo(-7, -21);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d8c78f";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(10, 6);
      ctx.lineTo(23, -34);
      ctx.stroke();
      ctx.fillStyle = color.light;
      ctx.shadowColor = color.light;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(24, -38, 4.5, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      roundedRect(ctx, -23, -21, 46, 31, 5);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(235, 215, 156, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "rgba(9, 23, 24, 0.92)";
      roundedRect(ctx, -27, 4, 54, 14, 4);
      ctx.fill();
      [-14, 0, 14].forEach((wheelX) => {
        ctx.fillStyle = "#152325";
        ctx.strokeStyle = color.main;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(wheelX, 17, 6, 0, TAU);
        ctx.fill();
        ctx.stroke();
      });
      ctx.strokeStyle = color.light;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-15, -21);
      ctx.lineTo(-15, 4);
      ctx.moveTo(15, -21);
      ctx.lineTo(15, 4);
      ctx.stroke();
      ctx.strokeStyle = "#c5b77f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(19, -8);
      ctx.lineTo(35, -31);
      ctx.stroke();
      ctx.fillStyle = color.light;
      ctx.beginPath();
      ctx.moveTo(33, -31);
      ctx.lineTo(47, -26);
      ctx.lineTo(34, -19);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    drawHealthBar(ctx, minion, minion.minionType === "siege" ? 48 : 34, minion.minionType === "siege" ? 42 : 44, false);
  }

  function drawTowerEntity(ctx, tower, time) {
    const team = TEAM_COLORS[tower.team];
    if (tower.dead) {
      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.fillStyle = "rgba(30, 45, 41, 0.8)";
      ctx.beginPath();
      ctx.moveTo(-42, 28);
      ctx.lineTo(-20, -11);
      ctx.lineTo(9, 5);
      ctx.lineTo(31, -24);
      ctx.lineTo(43, 28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `${team.main}2a`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }
    drawEntityShadow(ctx, tower.x, tower.y + 16, tower.radius * 1.3, 0.4);
    const aura = ctx.createRadialGradient(tower.x, tower.y, 8, tower.x, tower.y, 100);
    aura.addColorStop(0, `${team.main}32`);
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 100, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = `${team.main}55`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(tower.x, tower.y + 20, 55, 24, 0, 0, TAU);
    ctx.stroke();
    const stone = ctx.createLinearGradient(tower.x, tower.y - 54, tower.x, tower.y + 38);
    stone.addColorStop(0, "#8a9b84");
    stone.addColorStop(0.35, "#4b6158");
    stone.addColorStop(1, "#172b28");
    ctx.fillStyle = stone;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * TAU + Math.PI / 8;
      const x = tower.x + Math.cos(angle) * 58;
      const y = tower.y + 18 + Math.sin(angle) * 28;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(225, 207, 153, 0.28)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(183, 194, 166, 0.12)" : "rgba(4, 17, 17, 0.18)";
      roundedRect(ctx, tower.x - 50 + Math.abs(i) * 4, tower.y + 18 + i * 8, 100 - Math.abs(i) * 8, 5, 2);
      ctx.fill();
    }
    ctx.strokeStyle = `${team.main}8a`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y + 17, 31, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tower.x, tower.y + 17, 39, -0.4, 1.7);
    ctx.stroke();

    [-1, 1].forEach((flip) => {
      const px = tower.x + flip * 42;
      ctx.fillStyle = "rgba(42, 64, 59, 0.9)";
      ctx.strokeStyle = "rgba(228, 209, 151, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(px - 7, tower.y - 58, 14, 79);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = team.dark;
      ctx.beginPath();
      ctx.moveTo(px - 6, tower.y - 54);
      ctx.lineTo(px - 30, tower.y - 43);
      ctx.lineTo(px - 25, tower.y - 2);
      ctx.lineTo(px - 6, tower.y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `${team.main}80`;
      ctx.stroke();
      ctx.fillStyle = team.light;
      ctx.font = `400 14px "STKaiti", "KaiTi", serif`;
      ctx.textAlign = "center";
      ctx.fillText(tower.tier === 1 ? "星" : "穹", px - 16, tower.y - 27);
    });

    const pulse = 0.6 + Math.sin(time * 2.5) * 0.1 + tower.chargePulse * 0.3;
    const beam = ctx.createLinearGradient(tower.x, tower.y - 110, tower.x, tower.y + 20);
    beam.addColorStop(0, "rgba(236, 247, 240, 0.95)");
    beam.addColorStop(0.35, team.light);
    beam.addColorStop(1, team.dark);
    ctx.fillStyle = beam;
    ctx.shadowColor = team.main;
    ctx.shadowBlur = 18 * pulse;
    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y - 105);
    ctx.lineTo(tower.x + 23, tower.y - 12);
    ctx.lineTo(tower.x + 18, tower.y + 22);
    ctx.lineTo(tower.x - 18, tower.y + 22);
    ctx.lineTo(tower.x - 23, tower.y - 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(12, 28, 29, 0.8)";
    ctx.beginPath();
    ctx.moveTo(tower.x - 31, tower.y + 15);
    ctx.lineTo(tower.x - 21, tower.y - 30);
    ctx.lineTo(tower.x + 21, tower.y - 30);
    ctx.lineTo(tower.x + 31, tower.y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = team.light;
    ctx.shadowColor = team.light;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y - 125);
    ctx.lineTo(tower.x + 10, tower.y - 103);
    ctx.lineTo(tower.x, tower.y - 90);
    ctx.lineTo(tower.x - 10, tower.y - 103);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.save();
    ctx.translate(tower.x, tower.y - 105);
    ctx.rotate(time * 0.0008);
    ctx.strokeStyle = `${team.light}92`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 8]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 11, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    drawHealthBar(ctx, tower, 74, 143, false);
  }

  function drawNexusEntity(ctx, nexus, time) {
    const team = TEAM_COLORS[nexus.team];
    if (nexus.dead) {
      ctx.save();
      ctx.translate(nexus.x, nexus.y);
      ctx.fillStyle = "rgba(26, 39, 38, 0.8)";
      ctx.beginPath();
      ctx.moveTo(-70, 48);
      ctx.lineTo(-42, -21);
      ctx.lineTo(-12, 6);
      ctx.lineTo(18, -40);
      ctx.lineTo(46, 2);
      ctx.lineTo(73, 48);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }
    const pulse = 0.9 + Math.sin(time * 1.8) * 0.08 + nexus.chargePulse * 0.2;
    drawEntityShadow(ctx, nexus.x, nexus.y + 28, 90, 0.48);
    const aura = ctx.createRadialGradient(nexus.x, nexus.y, 12, nexus.x, nexus.y, 215);
    aura.addColorStop(0, `${team.main}55`);
    aura.addColorStop(0.35, `${team.main}18`);
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(nexus.x, nexus.y, 215, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(nexus.x, nexus.y);
    ctx.rotate(time * 0.035);
    ctx.strokeStyle = `${team.light}44`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 117, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([22, 18]);
    ctx.beginPath();
    ctx.arc(0, 0, 94, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 6; i++) {
      ctx.rotate(TAU / 6);
      ctx.fillStyle = `${team.main}55`;
      ctx.fillRect(-4, -127, 8, 34);
    }
    ctx.restore();

    [-1, 1].forEach((flip) => {
      ctx.save();
      ctx.translate(nexus.x + flip * 82, nexus.y + 12);
      const pillar = ctx.createLinearGradient(-14, -92, 18, 55);
      pillar.addColorStop(0, "rgba(151, 167, 143, 0.62)");
      pillar.addColorStop(0.45, "rgba(54, 77, 70, 0.82)");
      pillar.addColorStop(1, "rgba(17, 38, 35, 0.8)");
      ctx.fillStyle = pillar;
      ctx.beginPath();
      ctx.moveTo(-16, 42);
      ctx.lineTo(-12, -82);
      ctx.lineTo(8, -95);
      ctx.lineTo(16, -76);
      ctx.lineTo(17, 44);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(229, 207, 152, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = `${team.main}63`;
      ctx.beginPath();
      ctx.moveTo(-4, -62);
      ctx.lineTo(7, -50);
      ctx.lineTo(-4, -36);
      ctx.stroke();
      ctx.restore();
    });
    ctx.save();
    ctx.strokeStyle = `${team.light}55`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nexus.x - 83, nexus.y - 72);
    ctx.quadraticCurveTo(nexus.x, nexus.y - 157, nexus.x + 83, nexus.y - 72);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 5; i++) {
      const angle = time * (0.0005 + i * 0.00002) + i / 5 * TAU;
      const radius = 112 + Math.sin(time * 0.0016 + i) * 7;
      const sx = nexus.x + Math.cos(angle) * radius;
      const sy = nexus.y - 62 + Math.sin(angle) * 38;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.fillStyle = i % 2 ? team.main : team.light;
      ctx.shadowColor = team.main;
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(nexus.x, nexus.y - 35);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = team.dark;
    ctx.beginPath();
    ctx.moveTo(0, -122);
    ctx.lineTo(38, -68);
    ctx.lineTo(31, 40);
    ctx.lineTo(0, 91);
    ctx.lineTo(-31, 40);
    ctx.lineTo(-38, -68);
    ctx.closePath();
    ctx.fill();
    const crystal = ctx.createLinearGradient(-25, -100, 25, 70);
    crystal.addColorStop(0, "rgba(238, 255, 251, 0.95)");
    crystal.addColorStop(0.36, team.light);
    crystal.addColorStop(0.7, team.main);
    crystal.addColorStop(1, team.dark);
    ctx.fillStyle = crystal;
    ctx.shadowColor = team.main;
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.moveTo(0, -104);
    ctx.lineTo(26, -52);
    ctx.lineTo(18, 47);
    ctx.lineTo(0, 72);
    ctx.lineTo(-18, 47);
    ctx.lineTo(-26, -52);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.36)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(-4, 57);
    ctx.stroke();
    ctx.restore();
    drawHealthBar(ctx, nexus, 120, 181, false);
  }

  function drawMonsterEntity(ctx, monster, time) {
    if (monster.dead) return;
    drawEntityShadow(ctx, monster.x, monster.y, monster.radius * 1.25, 0.4);
    const pulse = 1 + Math.sin(time * 2.1 + monster.bobSeed) * 0.035;
    const aura = ctx.createRadialGradient(monster.x, monster.y, 4, monster.x, monster.y, monster.radius * 3);
    aura.addColorStop(0, `${monster.color}2f`);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(monster.x, monster.y, monster.radius * 3, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(monster.x, monster.y);
    ctx.scale(pulse, pulse);
    const body = ctx.createLinearGradient(-monster.radius, -monster.radius, monster.radius, monster.radius);
    body.addColorStop(0, monster.color);
    body.addColorStop(0.52, "#193a35");
    body.addColorStop(1, "#071b1d");
    ctx.fillStyle = body;
    ctx.beginPath();
    if (monster.boss) {
      ctx.moveTo(0, -74);
      ctx.bezierCurveTo(57, -82, 94, -29, 74, 46);
      ctx.bezierCurveTo(42, 81, -38, 82, -73, 46);
      ctx.bezierCurveTo(-95, -26, -54, -75, 0, -74);
    } else {
      ctx.ellipse(0, 0, 42, 34, 0, 0, TAU);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `${monster.color}88`;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (monster.boss) {
      ctx.fillStyle = "rgba(7, 20, 21, 0.72)";
      [-1, 1].forEach((flip) => {
        ctx.beginPath();
        ctx.moveTo(flip * 35, -42);
        ctx.lineTo(flip * 77, -9);
        ctx.lineTo(flip * 52, 35);
        ctx.lineTo(flip * 24, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(232, 200, 128, 0.22)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      const core = ctx.createRadialGradient(-10, -28, 2, 0, 0, 43);
      core.addColorStop(0, "#fff2bc");
      core.addColorStop(0.22, monster.color);
      core.addColorStop(0.58, "rgba(104, 60, 43, 0.52)");
      core.addColorStop(1, "rgba(9, 25, 24, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, -10, 45, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(238, 208, 135, 0.4)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(0, -7, 26 + i * 10, 0.35 + i * 0.5, 1.6 + i * 0.5);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.00035 + i / 6 * TAU;
        const sx = Math.cos(angle) * (104 + Math.sin(time * 0.001 + i) * 5);
        const sy = -24 + Math.sin(angle) * 58;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.fillStyle = i % 2 ? "#e3c782" : "#9e7250";
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.strokeStyle = "rgba(221, 236, 198, 0.2)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-22, -16);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-23, 18);
      ctx.moveTo(23, -13);
      ctx.lineTo(7, 3);
      ctx.lineTo(22, 22);
      ctx.stroke();
      ctx.fillStyle = "rgba(9, 26, 26, 0.86)";
      [-1, 1].forEach((flip) => {
        ctx.beginPath();
        ctx.ellipse(flip * 40, 17, 14, 8, flip * 0.25, 0, TAU);
        ctx.fill();
      });
    }
    ctx.fillStyle = "#e7d09c";
    ctx.beginPath();
    ctx.moveTo(-22, -43);
    ctx.lineTo(-43, -74);
    ctx.lineTo(-10, -62);
    ctx.moveTo(20, -48);
    ctx.lineTo(43, -77);
    ctx.lineTo(9, -65);
    ctx.fill();
    ctx.fillStyle = "#f5e3b7";
    ctx.shadowColor = monster.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(-15, -16, 3.8, 0, TAU);
    ctx.arc(16, -16, 3.8, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (monster.boss) {
      ctx.strokeStyle = "rgba(238, 204, 123, 0.32)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -2, 94, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    drawHealthBar(ctx, monster, monster.boss ? 160 : 66, monster.radius * 2.5 + 18, true);
  }

  function drawArea(ctx, area, time) {
    ctx.save();
    if (area.kind === "rain") {
      const pulse = 0.65 + Math.sin(time * 5) * 0.08;
      const gradient = ctx.createRadialGradient(area.x, area.y, 0, area.x, area.y, area.radius);
      gradient.addColorStop(0, `${area.color}24`);
      gradient.addColorStop(0.7, `${area.color}13`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(area.x, area.y, area.radius, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `${area.color}8f`;
      ctx.lineWidth = 3;
      ctx.setLineDash([18, 14]);
      ctx.lineDashOffset = -time * 35;
      ctx.beginPath();
      ctx.arc(area.x, area.y, area.radius * pulse, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `${area.color}33`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(area.x, area.y, area.radius * (0.32 + i * 0.2), 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(area.x, area.y);
      ctx.rotate(time * 0.0005);
      ctx.strokeStyle = `${area.color}4f`;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) {
        ctx.rotate(TAU / 8);
        ctx.beginPath();
        ctx.moveTo(area.radius * 0.72, 0);
        ctx.lineTo(area.radius * 0.9, 0);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      const progress = area.delay > 0 ? clamp(1 - area.delayRemaining / area.delay, 0, 1) : 1;
      ctx.fillStyle = `${area.color}12`;
      ctx.beginPath();
      ctx.arc(area.x, area.y, area.radius, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `${area.color}${progress >= 1 ? "cc" : "66"}`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(area.x, area.y, area.radius * (0.55 + progress * 0.45), 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `${area.color}34`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(area.x, area.y, area.radius, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `${area.color}50`;
      ctx.save();
      ctx.translate(area.x, area.y);
      ctx.rotate(progress * 0.5 + time * 0.0004);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = i / 6 * TAU;
        const x = Math.cos(angle) * area.radius * 0.55;
        const y = Math.sin(angle) * area.radius * 0.55;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawProjectile(ctx, projectile) {
    ctx.save();
    if (projectile.trail.length > 1) {
      ctx.strokeStyle = `${projectile.color}55`;
      ctx.lineWidth = projectile.radius * 0.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(projectile.trail[projectile.trail.length - 1].x, projectile.trail[projectile.trail.length - 1].y);
      projectile.trail.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.lineTo(projectile.x, projectile.y);
      ctx.stroke();
    }
    ctx.shadowColor = projectile.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius * 0.38, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius * 0.13, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles(ctx, particles) {
    particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      if (particle.glow) {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.glow;
      }
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (0.55 + alpha * 0.45), 0, TAU);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawEffects(ctx, game, time) {
    game.effects.forEach((effect) => {
      const progress = 1 - effect.life / effect.maxLife;
      const alpha = clamp(effect.life / effect.maxLife, 0, 1);
      ctx.save();
      switch (effect.kind) {
        case "ring":
          ctx.globalAlpha = alpha * 0.8;
          if (effect.radius > 70) {
            const burst = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
            burst.addColorStop(0, `${effect.color}00`);
            burst.addColorStop(0.55, `${effect.color}12`);
            burst.addColorStop(0.86, `${effect.color}2e`);
            burst.addColorStop(1, `${effect.color}00`);
            ctx.fillStyle = burst;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, TAU);
            ctx.fill();
          }
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 3.5 * alpha + 0.7;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius * (0.2 + progress * 0.8), 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = alpha * 0.38;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius * (0.08 + progress * 0.58), 0, TAU);
          ctx.stroke();
          break;
        case "arc":
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius, effect.angle - 0.75, effect.angle + 0.75);
          ctx.stroke();
          break;
        case "tracer":
          ctx.globalAlpha = alpha * 0.88;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = effect.color;
          ctx.shadowBlur = 8;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(effect.x1, effect.y1);
          ctx.lineTo(effect.x2, effect.y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.setLineDash([]);
          break;
        case "towerShot": {
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = effect.size;
          ctx.shadowColor = effect.color;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(effect.x1, effect.y1);
          ctx.lineTo(effect.x2, effect.y2);
          ctx.stroke();
          break;
        }
        case "line":
          ctx.globalAlpha = alpha * 0.4;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = effect.width * alpha;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(effect.x1, effect.y1);
          ctx.lineTo(effect.x2, effect.y2);
          ctx.stroke();
          break;
        case "portal":
          ctx.globalAlpha = alpha * 0.9;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius * (0.4 + i * 0.3) * (0.8 + progress * 0.25), 0, TAU);
            ctx.stroke();
          }
          const portalGradient = ctx.createLinearGradient(effect.x, effect.y - 140, effect.x, effect.y + 10);
          portalGradient.addColorStop(0, `${effect.color}00`);
          portalGradient.addColorStop(0.65, `${effect.color}24`);
          portalGradient.addColorStop(1, `${effect.color}00`);
          ctx.fillStyle = portalGradient;
          ctx.beginPath();
          ctx.ellipse(effect.x, effect.y - 62, effect.radius * 0.34, 75, 0, 0, TAU);
          ctx.fill();
          break;
        case "slash":
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 8 * alpha;
          ctx.shadowColor = effect.color;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius * (0.72 + progress * 0.18), effect.angle - 1.08, effect.angle + 1.08);
          ctx.stroke();
          ctx.globalAlpha = alpha * 0.46;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius * (0.58 + progress * 0.13), effect.angle - 1.3, effect.angle + 1.3);
          ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const sparkAngle = effect.angle - 0.9 + i * 0.36;
            const radius = effect.radius * (0.78 + progress * 0.2);
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x + Math.cos(sparkAngle) * radius, effect.y + Math.sin(sparkAngle) * radius, 1.8 * alpha, 0, TAU);
            ctx.fill();
          }
          break;
        case "shield":
          if (!effect.unit.dead) {
            ctx.globalAlpha = alpha * 0.8;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(effect.unit.x, effect.unit.y - 4, effect.unit.radius + 16 + progress * 8, 0, TAU);
            ctx.stroke();
          }
          break;
        case "heal":
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2 + progress;
            ctx.beginPath();
            ctx.arc(effect.x + Math.cos(angle) * 19, effect.y - 34, 7 + progress * 10, 0, TAU);
            ctx.stroke();
          }
          break;
        case "sanctuary":
          ctx.globalAlpha = alpha * 0.65;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius * (0.4 + progress * 0.65), 0, TAU);
          ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const angle = i / 8 * TAU + time * 0.08;
            ctx.beginPath();
            ctx.moveTo(effect.x + Math.cos(angle) * effect.radius * 0.72, effect.y + Math.sin(angle) * effect.radius * 0.72);
            ctx.lineTo(effect.x + Math.cos(angle) * effect.radius * 0.82, effect.y + Math.sin(angle) * effect.radius * 0.82);
            ctx.stroke();
          }
          break;
        case "execute":
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 5 * alpha;
          ctx.shadowColor = effect.color;
          ctx.shadowBlur = 22;
          ctx.beginPath();
          ctx.moveTo(effect.x1, effect.y1);
          ctx.lineTo(effect.x2, effect.y2);
          ctx.stroke();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "rgba(255,255,255,0.65)";
          ctx.beginPath();
          ctx.moveTo(effect.x1 - 12, effect.y1 + 18);
          ctx.lineTo(effect.x2 + 28, effect.y2 - 34);
          ctx.moveTo(effect.x1 + 14, effect.y1 - 8);
          ctx.lineTo(effect.x2 - 20, effect.y2 + 30);
          ctx.stroke();
          break;
        case "level":
          if (!effect.unit.dead) {
            ctx.globalAlpha = alpha * 0.8;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(effect.unit.x, effect.unit.y + 4, 28 + progress * 22, 11 + progress * 8, 0, 0, TAU);
            ctx.stroke();
          }
          break;
        case "boss":
          ctx.globalAlpha = alpha * 0.8;
          ctx.strokeStyle = "#ead08e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 215 * progress, 0, TAU);
          ctx.stroke();
          for (let i = 0; i < 10; i++) {
            const angle = i / 10 * TAU;
            ctx.beginPath();
            ctx.moveTo(effect.x + Math.cos(angle) * 55, effect.y + Math.sin(angle) * 55);
            ctx.lineTo(effect.x + Math.cos(angle) * 245 * progress, effect.y + Math.sin(angle) * 245 * progress);
            ctx.stroke();
          }
          break;
        case "meteor":
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = effect.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(effect.x + 28, effect.y - 140 * (1 - progress));
          ctx.lineTo(effect.x, effect.y);
          ctx.stroke();
          ctx.fillStyle = effect.color;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 7 * (1 - progress) + 2, 0, TAU);
          ctx.fill();
          break;
        case "text":
          ctx.globalAlpha = alpha;
          ctx.fillStyle = effect.color;
          ctx.textAlign = "center";
          ctx.font = `${effect.critical ? "700" : "500"} ${effect.critical ? 18 : 12}px "Microsoft YaHei", sans-serif`;
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = 4;
          ctx.strokeStyle = "rgba(5, 10, 11, 0.82)";
          ctx.lineWidth = 2.6;
          ctx.strokeText(effect.text, effect.x, effect.y - progress * 28);
          ctx.fillText(effect.text, effect.x, effect.y - progress * 28);
          break;
        default:
          break;
      }
      ctx.restore();
    });
  }

  function renderWorld(ctx, time) {
    const { camera } = game;
    const shakeX = camera.shake && !App.reducedMotion ? (Math.random() - 0.5) * camera.shake * 24 : 0;
    const shakeY = camera.shake && !App.reducedMotion ? (Math.random() - 0.5) * camera.shake * 24 : 0;
    ctx.save();
    ctx.translate(game.width / 2 + shakeX, game.height / 2 + shakeY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    ctx.drawImage(mapArt.canvas, 0, 0, MAP.size, MAP.size);

    // Animated water glints and base energy.
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const t = (time * 0.012 + i / 16) % 1;
      const x = lerp(550, 3800, t) + Math.sin(t * 11 + i) * 135;
      const y = lerp(1750, 3200, t) + Math.sin(t * 7) * 82;
      ctx.globalAlpha = 0.1 + Math.sin(time * 2 + i) * 0.04;
      ctx.strokeStyle = "#aeece3";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, 42 + i * 2, 2, -0.4, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    [BLUE, RED].forEach((team) => {
      const base = team === BLUE ? MAP.blueBase : MAP.redBase;
      const color = TEAM_COLORS[team].main;
      const pulse = 0.16 + Math.sin(time * 1.7 + (team === BLUE ? 0 : 2)) * 0.04;
      const glow = ctx.createRadialGradient(base.x, base.y, 10, base.x, base.y, 235);
      glow.addColorStop(0, `${color}40`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = pulse;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(base.x, base.y, 235, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Living atmosphere: drifting motes, leaf flecks and soft canopy shadows.
    ctx.save();
    for (let i = 0; i < 42; i++) {
      const span = 1550;
      const px = camera.x + ((i * 257 + time * (5 + i % 5)) % span) - span / 2;
      const py = camera.y + ((i * 173 + Math.sin(time * 0.0008 + i) * 240) % span) - span / 2;
      const twinkle = 0.18 + (Math.sin(time * 0.0021 + i * 1.9) + 1) * 0.18;
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = i % 7 === 0 ? "#f2d58d" : i % 3 === 0 ? "#a6eadc" : "#719e7d";
      if (i % 7 === 0) {
        ctx.shadowColor = "#f2d58d";
        ctx.shadowBlur = 9;
      }
      ctx.beginPath();
      ctx.arc(px, py, i % 7 === 0 ? 2 : 1.1, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    const canopyShade = ctx.createRadialGradient(
      camera.x - game.width * 0.32 / camera.zoom,
      camera.y - game.height * 0.38 / camera.zoom,
      30,
      camera.x - game.width * 0.32 / camera.zoom,
      camera.y - game.height * 0.38 / camera.zoom,
      900
    );
    canopyShade.addColorStop(0, "rgba(3, 13, 12, 0)");
    canopyShade.addColorStop(0.7, "rgba(4, 20, 17, 0.035)");
    canopyShade.addColorStop(1, "rgba(4, 20, 17, 0.12)");
    ctx.fillStyle = canopyShade;
    ctx.fillRect(camera.x - 1100, camera.y - 900, 2200, 1800);

    // Lane labels are intentionally understated on the world itself.
    MAP.lanes.forEach((lane) => {
      const mid = lane.points[Math.floor(lane.points.length / 2)];
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#f1e1b3";
      ctx.textAlign = "center";
      ctx.font = `400 25px "STKaiti", "KaiTi", serif`;
      ctx.fillText(lane.name, mid.x, mid.y - 120);
      ctx.restore();
    });

    game.areas.forEach((area) => drawArea(ctx, area, time));

    if (game.player.attackTarget) {
      const target = game.player.attackTarget;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 101, 109, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 7]);
      ctx.lineDashOffset = -time * 28;
      ctx.beginPath();
      ctx.arc(target.x, target.y + target.radius * 0.3, target.radius * 1.4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (App.mouse.inside && !game.player.dead) {
      const cursorX = App.mouse.worldX;
      const cursorY = App.mouse.worldY;
      ctx.save();
      ctx.translate(cursorX, cursorY);
      ctx.rotate(time * 0.00045);
      ctx.strokeStyle = "rgba(229, 209, 153, 0.46)";
      ctx.lineWidth = 1.15;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(0, -28);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(247, 223, 158, 0.65)";
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, TAU);
      ctx.fill();
      ctx.restore();
      const hover = pickUnitAt(App.mouse.x, App.mouse.y);
      if (hover && hostile(game.player.team, hover.team)) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 126, 132, 0.74)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(hover.x, hover.y + hover.radius * 0.42, hover.radius * 1.35, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    const drawables = [
      ...game.structures.filter((unit) => !unit.removed),
      ...game.monsters.filter((unit) => !unit.removed),
      ...game.minions.filter((unit) => !unit.removed),
      ...game.heroes.filter((unit) => !unit.removed)
    ].sort((a, b) => a.y - b.y);

    drawables.forEach((unit) => {
      if (unit.kind === "hero") drawHeroEntity(ctx, unit, time);
      else if (unit.kind === "minion") drawMinionEntity(ctx, unit, time);
      else if (unit.kind === "tower") drawTowerEntity(ctx, unit, time);
      else if (unit.kind === "nexus") drawNexusEntity(ctx, unit, time);
      else if (unit.kind === "monster") drawMonsterEntity(ctx, unit, time);
    });
    game.projectiles.forEach((projectile) => drawProjectile(ctx, projectile));
    drawParticles(ctx, game.particles);
    drawEffects(ctx, game, time);
    ctx.restore();

    // Local vignette follows the viewport but keeps the scene legible.
    ctx.save();
    const vignette = ctx.createRadialGradient(
      game.width / 2,
      game.height * 0.48,
      Math.min(game.width, game.height) * 0.22,
      game.width / 2,
      game.height * 0.48,
      Math.max(game.width, game.height) * 0.75
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(1,7,9,0.48)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.restore();
  }

  function renderMenuBackdrop(ctx, time) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const activeHero = selectedHero();
    const zoom = clamp(width / 1600, 0.62, 1.05);
    const driftX = 2560 + Math.sin(time * 0.00008) * 350;
    const driftY = 2080 + Math.cos(time * 0.00006) * 260;
    ctx.save();
    ctx.translate(width * 0.63, height * 0.48);
    ctx.scale(zoom, zoom);
    ctx.translate(-driftX, -driftY);
    ctx.drawImage(mapArt.canvas, 0, 0, MAP.size, MAP.size);
    const glow = ctx.createRadialGradient(driftX - 240, driftY + 20, 20, driftX - 240, driftY + 20, 780);
    glow.addColorStop(0, `${activeHero.color}2b`);
    glow.addColorStop(0.5, `${activeHero.color2}12`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(driftX - 240, driftY + 20, 780, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    const atmosphere = ctx.createLinearGradient(0, 0, width, height);
    atmosphere.addColorStop(0, "rgba(2, 11, 15, 0.42)");
    atmosphere.addColorStop(0.5, "rgba(4, 22, 25, 0.18)");
    atmosphere.addColorStop(1, "rgba(2, 9, 12, 0.4)");
    ctx.fillStyle = atmosphere;
    ctx.fillRect(0, 0, width, height);
    const spotlight = ctx.createRadialGradient(width * 0.57, height * 0.38, 20, width * 0.57, height * 0.38, width * 0.48);
    spotlight.addColorStop(0, `${activeHero.color}15`);
    spotlight.addColorStop(0.42, `${activeHero.color2}09`);
    spotlight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, width, height);
    const vignette = ctx.createRadialGradient(width * 0.62, height * 0.45, 80, width * 0.62, height * 0.45, width * 0.8);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(1,6,9,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function drawCachedMenuBackdrop(ctx, time) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = pixelRatio();
    const chunk = App.reducedMotion ? 1000 : 180;
    const stamp = `${width}:${height}:${dpr}:${App.selectedHeroId}:${Math.floor(time / chunk)}`;
    if (menuBackdropCache.width !== Math.floor(width * dpr) || menuBackdropCache.height !== Math.floor(height * dpr)) {
      menuBackdropCache.width = Math.floor(width * dpr);
      menuBackdropCache.height = Math.floor(height * dpr);
      menuBackdropStamp = "";
    }
    if (stamp !== menuBackdropStamp) {
      menuBackdropContext.setTransform(1, 0, 0, 1, 0, 0);
      menuBackdropContext.clearRect(0, 0, menuBackdropCache.width, menuBackdropCache.height);
      menuBackdropContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderMenuBackdrop(menuBackdropContext, time);
      menuBackdropStamp = stamp;
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(menuBackdropCache, 0, 0);
    ctx.restore();
  }

  function drawMinimap() {
    if (!game) return;
    const ctx = dom.minimap.getContext("2d");
    const size = 224;
    const scale = (size - 20) / MAP.size;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#081b19";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(mapArt.canvas, 8, 8, size - 16, size - 16);
    ctx.fillStyle = "rgba(1, 8, 9, 0.2)";
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.translate(10, 10);

    ctx.strokeStyle = "rgba(120, 214, 198, 0.23)";
    ctx.lineWidth = 2;
    const river = new Path2D();
    river.moveTo(16, 82);
    river.bezierCurveTo(55, 90, 80, 116, 128, 131);
    river.bezierCurveTo(172, 145, 188, 153, 208, 178);
    ctx.stroke(river);

    MAP.lanes.forEach((lane) => {
      ctx.strokeStyle = "rgba(198, 181, 121, 0.16)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      lane.points.forEach((point, index) => {
        const x = point.x * scale;
        const y = point.y * scale;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    game.structures.forEach((structure) => {
      if (structure.dead) return;
      const x = structure.x * scale;
      const y = structure.y * scale;
      ctx.fillStyle = TEAM_COLORS[structure.team].main;
      if (structure.kind === "nexus") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      } else {
        ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
      }
    });

    game.minions.forEach((minion) => {
      if (minion.dead) return;
      ctx.fillStyle = TEAM_COLORS[minion.team].main;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(minion.x * scale, minion.y * scale, 1.15, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (game.bossMonster && !game.bossMonster.dead) {
      const x = game.bossMonster.x * scale;
      const y = game.bossMonster.y * scale;
      ctx.strokeStyle = "#f0d18e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(240, 209, 142, 0.5)";
      ctx.fill();
    }

    game.heroes.forEach((hero) => {
      if (hero.dead) return;
      const x = hero.x * scale;
      const y = hero.y * scale;
      ctx.fillStyle = hero.isPlayer ? "#ffe19a" : TEAM_COLORS[hero.team].light;
      ctx.strokeStyle = TEAM_COLORS[hero.team].main;
      ctx.lineWidth = hero.isPlayer ? 2 : 1.3;
      ctx.beginPath();
      ctx.arc(x, y, hero.isPlayer ? 4.4 : 3.3, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (hero.isPlayer) {
        ctx.strokeStyle = "rgba(255, 225, 154, 0.45)";
        ctx.beginPath();
        ctx.arc(x, y, 7 + Math.sin(game.time * 4) * 1.5, 0, TAU);
        ctx.stroke();
      }
    });

    const viewWidth = game.width / game.camera.zoom * scale;
    const viewHeight = game.height / game.camera.zoom * scale;
    ctx.strokeStyle = "rgba(229, 242, 237, 0.24)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(game.camera.x * scale - viewWidth / 2, game.camera.y * scale - viewHeight / 2, viewWidth, viewHeight);
    ctx.restore();
  }

  function render() {
    const ctx = mainContext;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
    const dpr = game?.dpr || pixelRatio();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (App.phase === "menu" || !game) {
      drawCachedMenuBackdrop(ctx, App.time);
      const portraitInterval = App.reducedMotion ? 250 : 34;
      if (App.portraitDirty || App.time - App.lastPortraitAt >= portraitInterval) {
        drawHeroPortrait(portraitContext, selectedHero(), App.time);
        App.lastPortraitAt = App.time;
        App.portraitDirty = false;
      }
      return;
    }
    renderWorld(ctx, App.time);
    drawMinimap();
    const portraitInterval = App.reducedMotion ? 250 : 34;
    if (!dom.matchIntro.hidden && App.time - App.lastPortraitAt >= portraitInterval) {
      drawHeroPortrait(introPortraitContext, selectedHero(), App.time);
      App.lastPortraitAt = App.time;
    }
  }

  function pickUnitAt(screenX, screenY, includeFriendly = false) {
    if (!game) return null;
    const point = screenToWorld(screenX, screenY);
    let picked = null;
    let best = Infinity;
    game.allTargetUnits().forEach((unit) => {
      if (!includeFriendly && !hostile(game.player.team, unit.team)) return;
      const d = distance(point, unit);
      const threshold = unit.radius + 22 / game.camera.zoom;
      if (d <= threshold && d < best) {
        best = d;
        picked = unit;
      }
    });
    return picked;
  }

  function movePlayerTo(screenX, screenY) {
    if (!game || !game.player || game.player.dead) return;
    const point = screenToWorld(screenX, screenY);
    game.player.attackTarget = null;
    game.player.moveTarget = { x: point.x, y: point.y };
    game.player.cancelRecall();
    game.effects.push({ kind: "ring", x: point.x, y: point.y, color: "#cdeee7", radius: 33, life: 0.34, maxLife: 0.34 });
  }

  function commandAttack(screenX, screenY) {
    if (!game || !game.player || game.player.dead) return;
    const target = pickUnitAt(screenX, screenY);
    if (target) {
      game.player.attackTarget = target;
      game.player.moveTarget = null;
      game.player.cancelRecall();
      audio.click();
      game.spawnBurst(target.x, target.y, "#ff8d92", target.radius);
    }
  }

  function castPlayerSkill(index) {
    if (!game || game.phase !== "playing" || !game.player || game.player.dead) return;
    const aim = screenToWorld(App.mouse.x, App.mouse.y);
    game.castAbility(game.player, index, aim.x, aim.y);
  }

  function targetNearestEnemy() {
    if (!game || !game.player || game.player.dead) return;
    const target = game.findNearestEnemy(game.player, 620);
    if (target) {
      game.player.attackTarget = target;
      game.player.moveTarget = null;
      game.spawnBurst(target.x, target.y, "#f1d58a", target.radius);
    } else {
      showToast("附近没有可攻击目标", 1000);
    }
  }

  function startRecall() {
    if (!game || !game.player || game.player.dead || game.phase !== "playing") return;
    const player = game.player;
    if (distance(player, player.spawnPoint) < 300) {
      showToast("你已在星穹圣坛");
      return;
    }
    player.recalling = true;
    player.recall = 0;
    player.moveTarget = null;
    player.attackTarget = null;
    dom.recallIndicator.hidden = false;
    audio.recall();
  }

  function openScoreboard() {
    if (!game) return;
    closeShop();
    renderScoreboard();
    dom.scoreboard.hidden = false;
  }

  function closeScoreboard() {
    dom.scoreboard.hidden = true;
  }

  function renderItemBar(match = game) {
    if (!match || !match.player) {
      dom.itemBar.innerHTML = "";
      return;
    }
    const player = match.player;
    dom.itemBar.innerHTML = Array.from({ length: 6 }, (_, index) => {
      const item = ITEMS.find((entry) => entry.id === player.items[index]);
      if (!item) return '<span class="item-slot">+</span>';
      return `<span class="item-slot is-filled" style="--item-color:${item.color}" title="${item.name} · ${item.statText}">${item.icon}</span>`;
    }).join("");
    dom.itemBar.title = player.items.length
      ? `已装备 ${player.items.length}/6 · 点击打开商店`
      : "装备栏为空 · 点击打开商店";
  }

  function renderShop() {
    if (!game || !game.player) return;
    const player = game.player;
    const category = App.shopCategory || "attack";
    dom.shopGold.textContent = Math.floor(player.gold);
    dom.shopItems.innerHTML = ITEMS
      .filter((item) => item.category === category)
      .map((item) => {
        const owned = player.items.includes(item.id);
        return `
          <button type="button" class="shop-item${owned ? " is-owned" : ""}" data-buy-item="${item.id}" style="--item-color:${item.color}" ${owned ? "disabled" : ""} aria-label="${item.name}，${item.statText}，${item.price}金币">
            <span class="shop-item-icon">${item.icon}</span>
            <span class="shop-item-name">${item.name}</span>
            <span class="shop-item-stat">${item.statText}</span>
            <span class="shop-item-desc">${item.description}</span>
            <span class="shop-item-buy">
              <span class="shop-item-price">${item.price} G</span>
              <span class="shop-item-action">${owned ? "已装备" : "点击购买"}</span>
            </span>
          </button>
        `;
      }).join("");
    dom.shopSlots.innerHTML = Array.from({ length: 6 }, (_, index) => {
      const item = ITEMS.find((entry) => entry.id === player.items[index]);
      if (!item) return '<span class="shop-slot">＋</span>';
      return `<span class="shop-slot is-filled" style="--item-color:${item.color}" title="${item.name} · ${item.statText}">${item.icon}</span>`;
    }).join("");
    const attackSpeed = Math.round(player.attackSpeedBonus * 100);
    const rows = [
      ["生命", Math.ceil(player.maxHp)],
      ["物理攻击", Math.round(player.attackDamage)],
      ["法术强度", Math.round(player.abilityPower)],
      ["物理防御", Math.round(player.armor)],
      ["移动速度", Math.round(player.speed)],
      ["攻击速度", `+${attackSpeed}%`],
      ["生命汲取", `${Math.round(player.lifeSteal * 100)}%`]
    ];
    dom.shopStats.innerHTML = rows
      .map(([label, value]) => `<div class="shop-stat-row"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");
    $$(".shop-tab").forEach((button) => {
      const active = button.dataset.shopCategory === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function openShop() {
    if (!game || game.phase !== "playing" || !game.player || !dom.matchIntro.hidden) return;
    if (!App.shopCategory) {
      App.shopCategory = game.player.heroId === "guardian"
        ? "defense"
        : ["mage", "support"].includes(game.player.heroId) ? "magic" : "attack";
    }
    dom.scoreboard.hidden = true;
    dom.shopModal.hidden = false;
    renderShop();
    audio.click();
  }

  function closeShop() {
    dom.shopModal.hidden = true;
  }

  function renderScoreboard() {
    if (!game) return;
    const teamBlock = (team) => {
      const rows = game.heroes
        .filter((hero) => hero.team === team)
        .map((hero) => `
          <div class="score-row ${team === BLUE ? "blue-row" : "red-row"}">
            <span class="score-avatar">${hero.sigil}</span>
            <span class="score-player">${hero.name}<small class="score-role">${hero.roleName}</small>${hero.isPlayer ? '<small class="score-you">YOU</small>' : ""}</span>
            <span>${hero.kills}/${hero.deaths}/${hero.assists}</span>
            <span>${Math.floor(hero.gold)}</span>
            <span>${hero.cs}</span>
            <span>${Math.round(hero.damageDealt / 100) / 10}k</span>
          </div>
        `).join("");
      return `
        <div class="score-team-block">
          <h3>${team === BLUE ? "星穹 · 蓝方" : "赤曜 · 红方"} &nbsp;·&nbsp; ${game.teamStats[team].kills} 击败</h3>
          <div class="score-row header"><span></span><span>英雄</span><span>K / D / A</span><span>金币</span><span>补刀</span><span>输出</span></div>
          ${rows}
        </div>
      `;
    };
    dom.scoreboardTeams.innerHTML = teamBlock(BLUE) + teamBlock(RED);
  }

  function showMatchIntro(match) {
    clearTimeout(App.introTimer);
    clearTimeout(App.introLeaveTimer);
    const player = match.player;
    const lineup = (team, target) => {
      target.innerHTML = match.heroes
        .filter((hero) => hero.team === team)
        .map((hero) => `
          <div class="intro-lineup-item">
            <span class="intro-lineup-icon" style="--lineup-color:${hero.color2}">${hero.sigil}</span>
            <small>${hero.name} · ${hero.roleName}</small>
          </div>
        `).join("");
    };
    lineup(BLUE, dom.introBlue);
    lineup(RED, dom.introRed);
    dom.introHeroSigil.textContent = player.sigil;
    dom.introHeroName.textContent = player.name;
    dom.introHeroRole.textContent = `${player.roleName} · ${player.heroDefinition.shortRole}`;
    dom.matchIntro.classList.remove("is-leaving");
    dom.matchIntro.hidden = false;
    App.introTimer = setTimeout(() => {
      dom.matchIntro.classList.add("is-leaving");
      match.showAnnouncement("分路确认", `${player.roleName} · ${player.assignedRole.description.split("，")[0]}`, 2.4);
      App.introLeaveTimer = setTimeout(() => {
        dom.matchIntro.hidden = true;
        dom.matchIntro.classList.remove("is-leaving");
      }, 680);
    }, 2300);
  }

  function startGame(heroId, difficulty, roleId = App.selectedRoleId) {
    audioGesture();
    dom.resultModal.hidden = true;
    dom.pauseModal.hidden = true;
    dom.guideModal.hidden = true;
    dom.scoreboard.hidden = true;
    dom.shopModal.hidden = true;
    dom.menu.classList.remove("is-active");
    dom.menu.hidden = true;
    dom.hud.hidden = false;
    game = new Game(heroId, difficulty, roleId);
    App.shopCategory = null;
    App.game = game;
    App.phase = "playing";
    game.phase = "playing";
    showMatchIntro(game);
    game.showAnnouncement("欢迎来到群星峡谷", "跟随兵线 · 推毁敌方核心", 2.8);
    const hintByRole = {
      clash: "对抗路 · 独立带线，牵制敌方后排",
      jungle: "打野 · 清理野区，寻找游走机会",
      mid: "中路 · 守住兵线，快速支援两翼",
      farm: "发育路 · 稳健补刀，积累装备经济",
      support: "辅助 · 保护输出，争夺河道资源"
    };
    dom.statHint.textContent = hintByRole[roleId] || "点击敌人发起攻击 · 右键移动";
  }

  function pauseGame() {
    if (!game || game.phase !== "playing") return;
    closeShop();
    game.phase = "paused";
    App.phase = "paused";
    dom.pauseModal.hidden = false;
    dom.scoreboard.hidden = true;
  }

  function resumeGame() {
    if (!game || game.phase !== "paused") return;
    game.phase = "playing";
    App.phase = "playing";
    dom.pauseModal.hidden = true;
  }

  function returnToMenu() {
    clearTimeout(App.introTimer);
    clearTimeout(App.introLeaveTimer);
    dom.matchIntro.hidden = true;
    if (game) game.phase = "menu";
    game = null;
    App.game = null;
    App.phase = "menu";
    dom.hud.hidden = true;
    dom.menu.hidden = false;
    dom.menu.classList.add("is-active");
    dom.scoreboard.hidden = true;
    dom.shopModal.hidden = true;
    dom.pauseModal.hidden = true;
    dom.resultModal.hidden = true;
    dom.deathOverlay.hidden = true;
    dom.killFeed.innerHTML = "";
    updateHeroSelection();
  }

  function finishMatch(winningTeam) {
    if (!game || game.phase === "over") return;
    game.phase = "over";
    App.phase = "gameover";
    closeShop();
    const player = game.player;
    const victory = player.team === winningTeam;
    dom.resultKicker.textContent = victory ? "VICTORY · 星穹凯旋" : "DEFEAT · 长夜未明";
    dom.resultTitle.textContent = victory ? "胜利" : "战败";
    dom.resultTitle.style.color = victory ? "#f4dc97" : "#ffb0b3";
    dom.resultSubtitle.textContent = victory ? "星穹的旗帜猎猎作响。" : "圣坛的余烬仍在等待下一次燃起。";
    dom.resultDuration.textContent = formatTime(game.time);
    dom.resultKda.textContent = `${player.kills} / ${player.deaths}`;
    const teamDamage = Math.max(1, game.teamStats[player.team].heroDamage);
    dom.resultDamage.textContent = `${clamp(Math.round(player.damageDealt / teamDamage * 100), 0, 100)}%`;
    dom.resultModal.hidden = false;
    dom.deathOverlay.hidden = true;
    audio[victory ? "kill" : "defeat"]();
  }

  function resize() {
    if (game) game.resize();
    const dpr = pixelRatio();
    dom.canvas.width = Math.floor(window.innerWidth * dpr);
    dom.canvas.height = Math.floor(window.innerHeight * dpr);
    menuBackdropStamp = "";
  }

  dom.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  dom.canvas.addEventListener("pointerenter", () => {
    App.mouse.inside = true;
  });
  dom.canvas.addEventListener("pointerleave", () => {
    App.mouse.inside = false;
  });
  dom.canvas.addEventListener("pointermove", (event) => {
    App.mouse.inside = true;
    App.mouse.x = event.clientX;
    App.mouse.y = event.clientY;
    if (game) {
      const world = screenToWorld(event.clientX, event.clientY);
      App.mouse.worldX = world.x;
      App.mouse.worldY = world.y;
    }
    if (App.touch.active && event.pointerId === App.touch.id) {
      const dx = event.clientX - App.touch.originX;
      const dy = event.clientY - App.touch.originY;
      const length = Math.hypot(dx, dy);
      const max = 52;
      App.touch.dx = dx / Math.max(max, length || 1) * Math.min(1, length / 32);
      App.touch.dy = dy / Math.max(max, length || 1) * Math.min(1, length / 32);
      dom.stickKnob.style.transform = `translate(${clamp(dx, -max, max)}px, ${clamp(dy, -max, max)}px)`;
    }
  });
  dom.canvas.addEventListener("pointerdown", (event) => {
    audioGesture();
    if (App.phase !== "playing" || !game) return;
    App.mouse.x = event.clientX;
    App.mouse.y = event.clientY;
    if (event.pointerType === "touch") {
      if (event.clientX < window.innerWidth * 0.5 && event.clientY > window.innerHeight * 0.35) {
        App.touch.active = true;
        App.touch.id = event.pointerId;
        App.touch.originX = event.clientX;
        App.touch.originY = event.clientY;
        App.touch.dx = 0;
        App.touch.dy = 0;
        dom.touchStick.style.display = "block";
        dom.touchStick.style.left = `${event.clientX}px`;
        dom.touchStick.style.top = `${event.clientY}px`;
        dom.stickKnob.style.transform = "translate(0, 0)";
        dom.canvas.setPointerCapture?.(event.pointerId);
      } else {
        commandAttack(event.clientX, event.clientY);
      }
      return;
    }
    if (event.button === 2) {
      movePlayerTo(event.clientX, event.clientY);
    } else if (event.button === 0) {
      commandAttack(event.clientX, event.clientY);
    }
  });
  const clearTouch = (event) => {
    if (!App.touch.active || (event && event.pointerId !== App.touch.id)) return;
    App.touch.active = false;
    App.touch.dx = 0;
    App.touch.dy = 0;
    App.touch.id = null;
    dom.touchStick.style.display = "none";
  };
  dom.canvas.addEventListener("pointerup", clearTouch);
  dom.canvas.addEventListener("pointercancel", clearTouch);

  window.addEventListener("keydown", (event) => {
    if (["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    if (event.code === "Escape") {
      if (!dom.shopModal.hidden) {
        closeShop();
      } else if (!dom.scoreboard.hidden) {
        closeScoreboard();
      } else if (!dom.guideModal.hidden) {
        showGuide(false);
      } else if (game && game.phase === "playing") {
        pauseGame();
      } else if (game && game.phase === "paused") {
        resumeGame();
      }
      return;
    }
    if (event.code === "Tab" && game && game.phase !== "menu") {
      if (dom.scoreboard.hidden) openScoreboard();
      else closeScoreboard();
      return;
    }
    if (!game || game.phase !== "playing") return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
      App.keys.add(event.code);
      return;
    }
    if (event.repeat) return;
    if (event.code === "KeyQ") castPlayerSkill(0);
    else if (event.code === "KeyW") castPlayerSkill(1);
    else if (event.code === "KeyE") castPlayerSkill(2);
    else if (event.code === "KeyR") castPlayerSkill(3);
    else if (event.code === "KeyB") startRecall();
    else if (event.code === "KeyY") {
      if (dom.shopModal.hidden) openShop();
      else closeShop();
    }
    else if (event.code === "Space") targetNearestEnemy();
    else if (event.code === "KeyM") dom.muteBtn.click();
  });
  window.addEventListener("keyup", (event) => {
    App.keys.delete(event.code);
  });
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      resize();
    });
  });
  reducedMotionQuery.addEventListener?.("change", (event) => {
    App.reducedMotion = event.matches;
    menuBackdropStamp = "";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(App.rafId);
      if (game && game.phase === "playing") pauseGame();
    } else {
      App.lastFrame = performance.now();
      App.lastRenderAt = 0;
      App.rafId = requestAnimationFrame(loop);
    }
    App.keys.clear();
  });

  $$(".ability-button[data-skill]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const skill = button.dataset.skill;
      if (skill === "P") {
        if (game) showToast(`${game.player.heroDefinition.passive}：${game.player.heroDefinition.tagline}`, 1800);
        return;
      }
      const index = ["Q", "W", "E", "R"].indexOf(skill);
      if (index >= 0) castPlayerSkill(index);
    });
  });
  dom.attackBtn.addEventListener("click", targetNearestEnemy);
  dom.recallBtn.addEventListener("click", startRecall);

  // The W key is both movement and an ability; movement wins only while held as a direction.
  // Q/E/R are unambiguous. W is cast on key down before movement can begin, preserving the MOBA bind.

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - App.lastFrame) / 1000));
    App.lastFrame = now;
    App.time = now;
    if (game && game.phase === "playing") {
      game.update(dt);
    }
    const renderInterval = game?.phase === "playing" ? 0 : App.reducedMotion ? 100 : 33;
    if (renderInterval === 0 || now - App.lastRenderAt >= renderInterval) {
      render();
      App.lastRenderAt = now;
    }
    if (!document.hidden) App.rafId = requestAnimationFrame(loop);
  }

  if (new URLSearchParams(window.location.search).has("debug")) {
    window.__ARENA_DEBUG__ = {
      get game() {
        return game;
      },
      spawnBoss() {
        if (!game) return;
        game.time = Math.max(game.time, 120);
        game.spawnBoss();
      },
      defeatNexus(team = RED) {
        if (!game) return;
        const nexus = game.structures.find((structure) => structure.kind === "nexus" && structure.team === team);
        if (nexus && !nexus.dead) game.dealDamage(game.player, nexus, 99999, { ability: true });
      },
      damageBoss() {
        if (!game || !game.bossMonster || game.bossMonster.dead) return;
        game.dealDamage(game.player, game.bossMonster, 99999, { ability: true });
      },
      spawnEnemyNearPlayer() {
        if (!game) return null;
        const enemy = game.heroes.find((hero) => hero.team === RED);
        if (enemy) {
          enemy.x = game.player.x + 180;
          enemy.y = game.player.y;
        }
        return enemy;
      },
      teleportPlayer(x = 2100, y = 2290) {
        if (!game || !game.player) return;
        game.player.x = x;
        game.player.y = y;
        game.player.moveTarget = null;
        game.player.attackTarget = null;
        game.camera.x = x;
        game.camera.y = y;
      },
      advance(seconds = 20) {
        if (!game || game.phase !== "playing") return null;
        const steps = Math.min(2400, Math.max(1, Math.floor(seconds * 30)));
        for (let i = 0; i < steps && game.phase === "playing"; i++) game.update(1 / 30);
        return {
          time: game.time,
          minions: game.minions.filter((unit) => !unit.dead).length,
          heroes: game.heroes.filter((hero) => !hero.dead).length
        };
      }
    };
  }

  buildMenu();
  resize();
  App.rafId = requestAnimationFrame(loop);
})();
