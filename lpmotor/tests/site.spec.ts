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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Входите в BOMOND",
  );
  await expect(page.locator(".hero-photo")).toBeVisible();

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
