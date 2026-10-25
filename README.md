# Nova Rift

### A star-lit 5v5 MOBA that runs directly in your browser.

Nova Rift（星渊裂隙）是一款无需安装、无需后端的 5v5 英雄竞技游戏原型。战场、英雄、技能特效、UI 与程序化音效均由 Canvas、CSS 和原生 JavaScript 构建。

<p align="center">
  <img src="docs/screenshots/lobby.webp" width="74%" alt="Nova Rift hero lobby">
  <img src="docs/screenshots/mobile.webp" width="22%" alt="Nova Rift mobile gameplay">
</p>

## Highlights

- A complete single-player 5v5 match: one player plus four AI allies against five AI opponents.
- Five heroes with distinct stats, passives, four abilities, roles, and visual identities.
- Three lanes, jungle camps, defensive towers, river objectives, and a timed boss.
- Role-aware AI for top, jungle, mid, bottom, and support positions.
- Twelve purchasable items, six equipment slots, and live stat bonuses for both teams.
- Responsive desktop and mobile HUD with a touch joystick.
- Procedural Web Audio effects with an in-game mute control.
- No runtime dependencies, build step, framework, or backend.

## Screenshots

### Choose your champion

<p align="center">
  <img src="docs/screenshots/hero-select.webp" width="100%" alt="Nova Rift hero selection with Lingge, support champion">
</p>

Five heroes share one roster but differ in stats, passives, skill patterns, and preferred lanes.

### Enter the rift

<p align="center">
  <img src="docs/screenshots/intro.webp" width="100%" alt="Nova Rift 5v5 team lineup before the match">
</p>

Each match opens with both five-player lineups, player role, and lane assignment.

### Fight across three lanes

<p align="center">
  <img src="docs/screenshots/gameplay.webp" width="49%" alt="Nova Rift combat and minimap HUD">
  <img src="docs/screenshots/battle.webp" width="49%" alt="Nova Rift river bridge battle in progress">
</p>

Minions, jungle camps, towers, river objectives, and both AI teams progress continuously during a match.

### Build power during the match

<p align="center">
  <img src="docs/screenshots/shop.webp" width="100%" alt="Nova Rift Starforge Armory equipment shop">
</p>

Purchases update hero stats immediately, while the six-slot loadout makes each build easy to read at a glance.

## Run locally

Node.js 20 or newer is recommended.

```powershell
npm install
npm start
```

Open <http://127.0.0.1:8000>. You can also open `index.html` directly, although the local server is recommended for testing.

To use another port:

```powershell
$env:PORT = 4173
npm start
```

## Controls

| Input | Action |
| --- | --- |
| Right click | Move / path toward a point |
| Left click | Select and attack an enemy |
| `Q` / `W` / `E` / `R` | Cast an ability toward the cursor |
| `Space` | Attack the nearest enemy |
| Arrow keys | Keyboard movement |
| `B` | Recall to base |
| `Y` | Open or close the shop |
| `Tab` | Toggle the scoreboard |
| `Esc` | Pause or close the active panel |
| `M` | Toggle sound |

On mobile, drag in the lower-left region to move and tap enemies or ability buttons to act.

## Engineering notes

Nova Rift intentionally stays close to the platform:

- The world, heroes, and effects use layered Canvas 2D rendering.
- The lobby backdrop is cached and refreshed at a lower cadence instead of being redrawn every frame.
- Hero portrait rendering is frame-limited, while live combat remains smooth.
- The animation loop pauses when the page is hidden and reacts to reduced-motion preferences.
- DOM references used by the HUD are cached outside the combat update loop.
- A dependency-free Node server provides predictable local development behavior on Windows, macOS, and Linux.
- Playwright covers combat input, hero selection, role assignment, shopping, objectives, victory flow, and mobile layout.

## Project structure

```text
index.html                  Game shell and HUD markup
styles.css                  Lobby, battlefield HUD, and responsive layouts
js/data.js                  Heroes, abilities, items, roles, and map data
js/game.js                  Simulation, AI, rendering, input, and match flow
scripts/serve.mjs           Zero-dependency local static server
tests/smoke.spec.js         End-to-end Playwright coverage
docs/screenshots/           Optimized WebP project previews
```

## Testing

```powershell
npm install
npx playwright install chromium
npm test
```

The Playwright configuration starts the site automatically and retries once in CI. Screenshots are only generated when `CAPTURE_SCREENSHOTS=1` is set.

```powershell
$env:CAPTURE_SCREENSHOTS = "1"
npm test
```

Generated test assets are written under `test-results/` and are excluded from version control.

## Browser support

Nova Rift targets current versions of Chrome, Edge, Firefox, and Safari. Touch controls and pointer input require a modern browser; Web Audio remains optional if the browser blocks autoplay.

## Contributing

Issues and pull requests are welcome. Run `npm ci` and `npm test` before opening a pull request, and keep the project free of runtime dependencies whenever the platform APIs are sufficient. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## License

Nova Rift is open-source software available under the [MIT License](LICENSE).
