import { expect, test } from "@playwright/test";
import { studio } from "../src/content/studio";

test.use({ reducedMotion: "reduce" });

test("server HTML includes the whole page and indexing metadata", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("Салон красоты Bomond в Балашихе");
  expect(html).toContain('rel="canonical" href="https://bomond.site/"');
  expect(html).toContain('"@type":"BeautySalon"');
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).toContain(studio.booking);
  expect(html).toContain("Наращивание ресниц");
  expect(html).toContain("Маргарита Манина");
  expect(html).toContain("Выход из чёрного");
  expect(html).toContain("Юлия Милавина");
  expect(
    (await request.get("/sitemap.xml")).headers()["content-type"],
  ).toContain("xml");
});

test("navigation, price tabs, reviews, persistent theme and booking", async ({
  page,
  isMobile,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?season=winter", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-season", "winter");
  await expect(page.locator("#telegram-sdk")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Входите в BOMOND",
  );
  const portrait = page.locator(".hero-photo");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute("fetchpriority", "high");
  await expect(page.locator(".header-header")).toHaveCSS(
    "background-color",
    "rgb(250, 246, 241)",
  );
  await expect(page.locator(".hero-btn--primary")).toHaveCSS(
    "background-color",
    "rgb(184, 121, 79)",
  );

  if (isMobile) {
    const menu = page.getByRole("button", { name: "Меню" });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page
      .getByRole("navigation", { name: "Мобильная навигация" })
      .getByRole("link", { name: "Услуги" })
      .click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  } else {
    await page
      .getByRole("navigation", { name: "Основная навигация" })
      .getByRole("link", { name: "Услуги" })
      .click();
  }
  await expect(page).toHaveURL(/#services$/);
  await page
    .locator("#services")
    .getByRole("link", { name: /Наращивание ресниц/ })
    .click();
  const lashes = page.getByRole("tab", { name: "Наращивание ресниц" });
  await expect(lashes).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel").getByText("Мокрый эффект", { exact: true }),
  ).toBeVisible();
  await lashes.press("ArrowLeft");
  await expect(
    page.getByRole("tab", { name: "Перманентный макияж" }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Следующие отзывы" }).click();
  await expect(page.locator("#reviews [aria-current=true]")).toHaveAttribute(
    "aria-label",
    /^Отзывы 2 из /,
  );
  const highlightedReview = page
    .locator(".reviews-card.reviews-is-current")
    .first();
  await expect(highlightedReview).toBeInViewport();

  const theme = page.getByRole("switch", { name: "Переключить тёмную тему" });
  await theme.click();
  await expect(theme).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".header-header")).toHaveCSS(
    "background-color",
    "rgb(23, 18, 15)",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(theme).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByRole("tab", { name: "Наращивание ресниц" }),
  ).toHaveAttribute("aria-selected", "true");

  await context.route("https://dikidi.ru/", (route) =>
    route.fulfill({ body: "DIKIDI" }),
  );
  const booking = page
    .locator(".hero-actions")
    .getByRole("link", { name: "Записаться" });
  await expect(booking).toHaveAttribute("href", studio.booking);
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    booking.click(),
  ]);
  await expect(popup).toHaveURL(studio.booking);
  expect(errors).toEqual([]);
});

test("Telegram Mini App uses the Telegram bridge for booking", async ({
  page,
}) => {
  await page.route("https://telegram.org/js/telegram-web-app.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `window.Telegram = { WebApp: {
      platform: "ios", colorScheme: "dark",
      ready() { document.documentElement.dataset.telegramReady = "true"; },
      openLink(url) { document.documentElement.dataset.telegramLink = url; }
    } };`,
    }),
  );
  await page.goto("/#tgWebAppPlatform=ios&tgWebAppVersion=8.0", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("html")).toHaveAttribute(
    "data-telegram-ready",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Записаться" })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-telegram-link",
    studio.booking,
  );
});

test("November promotion shows the terms and keeps the referral offer", async ({
  page,
}) => {
  await page.goto("/#promo", { waitUntil: "domcontentloaded" });
  const promo = page.locator("#promo");
  await expect(
    promo.getByRole("heading", { name: "Ноябрь в Bomond" }),
  ).toBeVisible();
  await expect(promo.getByText("До 30 ноября включительно")).toBeVisible();
  const cards = promo.locator(".promotions-offers").getByRole("listitem");
  await expect(cards).toHaveCount(4);
  const photos = new Set<string>();
  for (const [title, benefit, detail, alt] of [
    [
      "Ампульное восстановление волос",
      "В подарок",
      "При окрашивании у Лины или Алёны.",
      "Мастер наносит ампульный уход на пряди волос",
    ],
    [
      "Ботокс для волос",
      "−15%",
      "У Кристины",
      "Гладкие светлые волосы после ботокса",
    ],
    [
      "Наращивание ресниц",
      "−10%",
      "",
      "Крупный план классического наращивания ресниц",
    ],
    [
      "Мужские стрижки",
      "−10%",
      "У Марии",
      "Мастер стрижёт короткие мужские волосы ножницами",
    ],
  ]) {
    const card = cards.filter({
      has: page.getByRole("heading", { name: title, exact: true }),
    });
    await expect(card).toContainText(benefit);
    if (detail) await expect(card).toContainText(detail);
    const photo = card.getByRole("img", { name: alt, exact: true });
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    await expect
      .poll(() =>
        photo.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    photos.add(
      await photo.evaluate((image: HTMLImageElement) => image.currentSrc),
    );
  }
  expect(photos.size).toBe(4);
  await expect(
    promo.getByRole("link", { name: "Записаться по акции" }),
  ).toHaveAttribute("href", "https://dikidi.net/500351");
  await expect(
    promo.getByRole("link", { name: "Акция в Telegram" }),
  ).toHaveAttribute("href", "https://t.me/bomondblh/422");
  await expect(promo).not.toContainText(/сентябр/i);
  await expect(
    page
      .locator("#referral")
      .getByRole("heading", { name: "Приведи подругу — скидка обеим" }),
  ).toBeVisible();
});

test("autumn leaves settle, lift in a gust and respect reduced motion", async ({
  page,
}) => {
  await page.goto("/?season=autumn", { waitUntil: "domcontentloaded" });
  const leaves = page.locator(".falling-leaves");
  const maple = leaves.locator('[data-leaf="maple"]');
  const ginkgo = leaves.locator('[data-leaf="ginkgo"]');
  await expect(leaves).toHaveAttribute("aria-hidden", "true");
  await expect(leaves).toHaveCSS("pointer-events", "none");
  await expect(leaves.locator("img")).toHaveCount(8);
  await expect(page.locator("html")).toHaveCSS("--season-pattern", "");
  await expect(maple).toHaveAttribute("data-leaf-phase", "still");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(maple).toHaveAttribute("data-leaf-phase", "falling");
  await expect(maple).toHaveAttribute("data-leaf-surface", "heading");
  await expect(ginkgo).toHaveAttribute("data-leaf-surface", "photo");
  await expect(maple).toHaveAttribute("data-leaf-phase", "resting");
  await expect(ginkgo).toHaveAttribute("data-leaf-phase", "resting");

  const heading = await page.locator(".hero-brand").boundingBox();
  const mapleBounds = await maple.locator("img").boundingBox();
  const photo = await page.locator(".hero-photo").boundingBox();
  const ginkgoBounds = await ginkgo.locator("img").boundingBox();
  expect(heading && mapleBounds && photo && ginkgoBounds).toBeTruthy();
  expect(Math.abs(heading!.y - mapleBounds!.y)).toBeLessThan(40);
  expect(Math.abs(photo!.y - ginkgoBounds!.y)).toBeLessThan(40);

  await page.evaluate(() => window.scrollBy({ top: 70, behavior: "instant" }));
  await expect
    .poll(async () => Math.round((await maple.boundingBox())!.y))
    .toBeLessThan(Math.round(mapleBounds!.y) - 30);
  const restingY = (await ginkgo.boundingBox())!.y;
  await expect(ginkgo).toHaveAttribute("data-leaf-phase", "gust", {
    timeout: 7000,
  });
  await expect
    .poll(async () => (await ginkgo.boundingBox())?.y ?? restingY)
    .toBeLessThan(restingY - 28);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(maple).toHaveAttribute("data-leaf-phase", "still");
  await expect
    .poll(() =>
      leaves.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
  await page.goto("/?season=winter", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-season", "winter");
  await expect(leaves).toBeHidden();
});

test("leaves stay in view while scrolling and land on newly visible cards", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?season=autumn", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-leaf="oak-drift"]')).toHaveAttribute(
    "data-leaf-phase",
    "falling",
  );

  const samples = await page.evaluate(async () => {
    const layer = document.querySelector(".falling-leaves")!;
    const leaves = Array.from(layer.querySelectorAll('[data-leaf$="-drift"]'));
    const flights = leaves.map((leaf) => leaf.getAnimations()[0]);
    const section = document.querySelector("#services")!;
    const destination =
      window.scrollY + section.getBoundingClientRect().top - 85;
    const visibleCounts = [];
    for (let step = 1; step <= 20; step++) {
      window.scrollTo({ top: (destination * step) / 20, behavior: "instant" });
      await new Promise((resolve) => requestAnimationFrame(resolve));
      visibleCounts.push(
        leaves.filter((leaf) => {
          const rect = leaf.querySelector("img")!.getBoundingClientRect();
          return (
            rect.top > 72 &&
            rect.bottom < window.innerHeight &&
            Number(getComputedStyle(leaf).opacity) > 0.35
          );
        }).length,
      );
    }
    return {
      visibleCounts,
      sameFlights: leaves.every(
        (leaf, index) => leaf.getAnimations()[0] === flights[index],
      ),
    };
  });
  expect(samples.sameFlights).toBe(true);
  expect(
    Math.min(...samples.visibleCounts),
    JSON.stringify(samples.visibleCounts),
  ).toBeGreaterThan(0);

  await page.locator("#services").evaluate((section) => {
    window.scrollBy({
      top: section.getBoundingClientRect().top - 85,
      behavior: "instant",
    });
  });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const section = document.querySelector("#services")!;
          return ["heading", "photo"].every((kind) => {
            const targets = section.querySelectorAll(
              kind === "photo" ? "img" : "h2, h3",
            );
            const leaves = document.querySelectorAll(
              `[data-leaf-phase="resting"][data-leaf-surface="${kind}"] img`,
            );
            return Array.from(leaves).some((leaf) => {
              const center = leaf.getBoundingClientRect();
              return Array.from(targets).some((target) => {
                const bounds = target.getBoundingClientRect();
                return (
                  bounds.top > 62 &&
                  Math.abs(center.top - bounds.top) < 40 &&
                  center.right >= bounds.left &&
                  center.left <= bounds.right
                );
              });
            });
          });
        }),
      { timeout: 10000 },
    )
    .toBe(true);
});
