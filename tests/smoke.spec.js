const { test, expect } = require("@playwright/test");

async function capture(page, testInfo, name) {
  if (process.env.CAPTURE_SCREENSHOTS !== "1") return;
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: false
  });
}

test("Nova Rift launches, progresses, and responds to combat input", async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "玄霜" })).toBeVisible();
  await page.waitForTimeout(900);
  await capture(page, testInfo, "lobby");
  await page.getByRole("button", { name: "开始对局" }).click();
  await expect(page.locator("#gameHud")).toBeVisible();

  await page.waitForTimeout(900);
  await capture(page, testInfo, "match-intro");
  await expect(page.locator("#matchIntro")).toBeHidden({ timeout: 4000 });
  await page.mouse.click(860, 430, { button: "right" });
  await page.keyboard.press("Q");
  await page.waitForTimeout(450);
  await expect(page.locator("#cdQ")).not.toHaveText("");
  await page.keyboard.press("W");
  await page.waitForTimeout(250);
  await expect(page.locator("#cdW")).not.toHaveText("");

  await page.keyboard.press("Tab");
  await expect(page.locator("#scoreboard")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator("#scoreboard")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.locator("#pauseModal")).toBeVisible();
  await page.getByRole("button", { name: "继续对局" }).click();
  await expect(page.locator("#pauseModal")).toBeHidden();

  await page.waitForTimeout(3200);
  const clock = await page.locator("#matchClock").innerText();
  expect(clock).not.toBe("00:00");
  await capture(page, testInfo, "gameplay");
  expect(pageErrors).toEqual([]);
});

test("all hero cards can start a match", async ({ page }, testInfo) => {
  await page.goto("/");
  for (const hero of ["星岚", "赤璃", "苍岳", "灵歌"]) {
    await page.locator(`[data-hero="${["archer", "mage", "guardian", "support"][["星岚", "赤璃", "苍岳", "灵歌"].indexOf(hero)]}"]`).click();
    await expect(page.locator("#heroName")).toHaveText(hero);
  }
  if (process.env.CAPTURE_SCREENSHOTS === "1") {
    await page.waitForTimeout(650);
    await capture(page, testInfo, "hero-select");
  }
  await page.getByRole("button", { name: "开始对局" }).click();
  await expect(page.locator("#hudHeroName")).toHaveText("灵歌");
  await expect(page.locator("#skillNameW")).toHaveText("清辉");
});

test("boss rewards and core victory resolve correctly", async ({ page }) => {
  await page.goto("/?debug=1");
  await page.getByRole("button", { name: "开始对局" }).click();
  await page.evaluate(() => window.__ARENA_DEBUG__.spawnBoss());
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__ARENA_DEBUG__.game?.bossMonster && !window.__ARENA_DEBUG__.game.bossMonster.dead)))
    .toBe(true);
  await page.evaluate(() => window.__ARENA_DEBUG__.damageBoss());
  await expect
    .poll(() => page.evaluate(() => window.__ARENA_DEBUG__.game?.buff.blue > window.__ARENA_DEBUG__.game?.time))
    .toBe(true);
  await page.evaluate(() => {
    window.__ARENA_DEBUG__.defeatNexus("red");
    window.__ARENA_DEBUG__.advance(2);
  });
  await expect(page.locator("#resultModal")).toBeVisible({ timeout: 3000 });
  await expect(page.locator("#resultTitle")).toHaveText("胜利");
});

test("accelerated battle remains stable while lanes advance", async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/?debug=1");
  await page.getByRole("button", { name: "开始对局" }).click();
  const snapshot = await page.evaluate(() => {
    document.querySelector("#matchIntro").hidden = true;
    const result = window.__ARENA_DEBUG__.advance(22);
    window.__ARENA_DEBUG__.teleportPlayer(2100, 2290);
    return result;
  });
  expect(snapshot.time).toBeGreaterThanOrEqual(21);
  expect(snapshot.minions).toBeGreaterThan(10);
  await page.waitForTimeout(250);
  await capture(page, testInfo, "battle-22s");
  expect(pageErrors).toEqual([]);
});

test("mobile HUD fits without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "开始对局" })).toBeVisible();
  await page.getByRole("button", { name: "开始对局" }).click();
  await expect(page.locator("#matchIntro")).toBeVisible();
  await page.evaluate(() => {
    document.querySelector("#matchIntro").hidden = true;
  });
  await expect(page.locator("#gameHud")).toBeVisible();
  await expect(page.locator('[data-skill="Q"]')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  const skillBounds = await page.locator(".ability-button:not(.passive)").evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
    })
  );
  skillBounds.forEach((box) => {
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.bottom).toBeLessThanOrEqual(844);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(390);
  });
  await capture(page, testInfo, "mobile-gameplay");
});

test("reduced motion keeps the arena playable", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await page.getByRole("button", { name: "开始对局" }).click();
  await page.evaluate(() => {
    document.querySelector("#matchIntro").hidden = true;
  });
  await page.keyboard.press("Q");
  await expect(page.locator("#cdQ")).not.toHaveText("");
  expect(pageErrors).toEqual([]);
});

test("role draft fills all five positions and shop applies equipment", async ({ page }, testInfo) => {
  await page.goto("/?debug=1");
  await page.locator('[data-role="jungle"]').click();
  await page.getByRole("button", { name: "开始对局" }).click();
  await page.evaluate(() => {
    document.querySelector("#matchIntro").hidden = true;
  });
  await expect(page.locator("#hudRole")).toHaveText("打野");
  const assignments = await page.evaluate(() =>
    window.__ARENA_DEBUG__.game.heroes
      .filter((hero) => hero.team === "blue")
      .map((hero) => ({ name: hero.name, role: hero.roleName }))
  );
  expect(assignments).toHaveLength(5);
  expect(new Set(assignments.map((hero) => hero.role)).size).toBe(5);

  await page.keyboard.press("KeyY");
  await expect(page.locator("#shopModal")).toBeVisible();
  await page.locator('[data-buy-item="iron-sword"]').click();
  await expect(page.locator("#shopGold")).toHaveText("70");
  await expect(page.locator(".item-slot.is-filled")).toHaveCount(1);
  const attack = await page.evaluate(() => window.__ARENA_DEBUG__.game.player.attackDamage);
  expect(attack).toBe(76);
  await capture(page, testInfo, "shop-purchased");
  await page.keyboard.press("Escape");
  await expect(page.locator("#shopModal")).toBeHidden();
});
