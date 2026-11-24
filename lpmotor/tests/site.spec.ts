import { expect, test } from "@playwright/test";
import { studio } from "../src/content/studio";

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  // Browser tests cover markup and interactions. The deployed-site check loads the real CDN assets.
  await page.route("https://m-files.cdn1.cc/lpfile/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a45cAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
});

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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Студия красоты в Балашихе",
  );
  await expect(page.locator(".hero-photo")).toBeVisible();
  await expect(page.locator(".header-header")).toHaveCSS(
    "background-color",
    "rgb(246, 241, 235)",
  );
  await expect(page.locator(".hero-btn--primary")).toHaveCSS(
    "background-color",
    "rgb(109, 63, 75)",
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
    "rgb(33, 25, 30)",
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
  await page.goto("/", { waitUntil: "domcontentloaded" });
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

test("portfolio opens by keyboard and links to the right price category", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".hero-portrait")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("link", { name: "Смотреть работы" }).click();
  await expect(page).toHaveURL(/#works$/);
  const work = page
    .locator("#works")
    .getByRole("button", { name: /Окрашивание/ });
  await work.focus();
  await work.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Окрашивание" });
  await expect(
    dialog.getByRole("img", { name: "Окрашивание в Bomond" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(work).toBeFocused();

  await work.click();
  await dialog.getByRole("link", { name: "Смотреть цены" }).click();
  await expect(page).toHaveURL(/#price-1$/);
  await expect(
    page.getByRole("tab", { name: "Парикмахерский зал" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel").getByText("Женская стрижка"),
  ).toBeVisible();
});
