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
  expect(html).toContain("rtext=~55.79491018,37.93238849&amp;rtt=pd");
  expect(html).toContain("Вход со двора");
  expect(html).toContain("whatshere%5Bpoint%5D=37.93238849%2C55.79491018");
  expect(html).toContain(
    '"geo":{"@type":"GeoCoordinates","latitude":55.794874,"longitude":37.932743}',
  );
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

test("winter is active from November 24 through February in Moscow", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-23T20:59:59Z"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-season", "autumn");
  await expect(page.locator(".snowfall")).toHaveCount(0);

  await page.clock.setFixedTime(new Date("2026-11-23T21:00:00Z"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-season", "winter");
  await expect(page.locator(".falling-leaves")).toHaveCount(0);
  await expect(
    page.locator('[data-snow-surface="heading"]').first(),
  ).toHaveAttribute("data-snow-depth", "3");
  await expect(page.locator(".snow-flurry").first()).toBeHidden();

  await page.clock.setFixedTime(new Date("2027-02-28T20:59:59Z"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-season", "winter");

  await page.clock.setFixedTime(new Date("2027-02-28T21:00:00Z"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-season", "spring");
  await expect(page.locator(".snowfall")).toHaveCount(0);
});

test("snowflakes build caps on text and photos and follow their anchors", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?season=winter", { waitUntil: "domcontentloaded" });
  const snow = page.locator(".snowfall");
  await expect(snow).toHaveCSS("pointer-events", "none");
  await expect(snow).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("html")).toHaveCSS("--season-pattern", "");

  const heading = page.locator('[data-snow-surface="heading"]').first();
  const photo = page.locator('[data-snow-surface="photo"]').first();
  await expect(heading).toHaveAttribute("data-snow-depth", /^[1-4]$/);
  await expect(photo).toHaveAttribute("data-snow-depth", /^[1-4]$/);
  await expect(heading).toHaveAttribute("data-snow-depth", /^[2-4]$/);
  await expect(photo).toHaveAttribute("data-snow-depth", /^[2-4]$/);
  const glyphContact = await heading.evaluate((cap) => {
    const brand = document.querySelector("h1 span")!;
    const text = brand.firstChild!;
    const glyph = new Range();
    glyph.setStart(text, text.textContent!.length - 1);
    glyph.setEnd(text, text.textContent!.length);
    const box = glyph.getBoundingClientRect();
    const style = getComputedStyle(brand);
    const context = document.createElement("canvas").getContext("2d")!;
    context.font = [style.fontWeight, style.fontSize, style.fontFamily].join(
      " ",
    );
    const metrics = context.measureText("D");
    const letterTop =
      box.top +
      (box.height +
        metrics.fontBoundingBoxAscent -
        metrics.fontBoundingBoxDescent) /
        2 -
      metrics.actualBoundingBoxAscent;
    const snowBase = cap.querySelector("path")!.getBoundingClientRect();
    glyph.setStart(text, text.textContent!.length - 2);
    const wordEdge = glyph.getBoundingClientRect();
    return {
      overlap: snowBase.bottom - letterTop,
      spansBothLetters:
        snowBase.left < box.left &&
        snowBase.right > box.left &&
        snowBase.left >= wordEdge.left &&
        snowBase.right <= wordEdge.right,
    };
  });
  expect(glyphContact.spansBothLetters).toBe(true);
  expect(glyphContact.overlap).toBeGreaterThan(0);
  expect(glyphContact.overlap).toBeLessThan(4);

  const portrait = page.locator(".hero-photo");
  const originalTop = (await portrait.boundingBox())!.y;
  await portrait.evaluate((image) => {
    const zoom = image
      .getAnimations()
      .find(
        (animation) => animation.effect?.getTiming().iterations === Infinity,
      )!;
    zoom.pause();
    zoom.currentTime = 17600;
  });
  const zoomedTop = (await portrait.boundingBox())!.y;
  expect(originalTop - zoomedTop).toBeGreaterThan(8);
  await expect
    .poll(async () => {
      const snowBase = (await photo
        .locator(".snow-ridge path")
        .first()
        .boundingBox())!;
      return Math.abs(snowBase.y + snowBase.height - zoomedTop - 2);
    })
    .toBeLessThan(1.5);

  const before = (await heading.boundingBox())!.y;
  await page.evaluate(() => window.scrollBy({ top: 74, behavior: "instant" }));
  await expect
    .poll(async () => (await heading.boundingBox())?.y ?? before)
    .toBeLessThan(before - 60);
  await expect(heading).toHaveAttribute("data-snow-depth", /^[2-4]$/);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".snow-flurry").first()).toBeHidden();
  await expect(heading).toHaveAttribute("data-snow-depth", "3");
});

test("a landing meets the raised snow profile and grows it from the base", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?season=winter", { waitUntil: "domcontentloaded" });
  const photo = page.locator('[data-snow-surface="photo"]').first();
  const landedAt = await photo.evaluate(async (bank) => {
    const flake = bank.querySelector<HTMLElement>(".snow-contact")!;
    const ridge = bank.querySelector<SVGSVGElement>(".snow-ridge")!;
    const profile = ridge.querySelector("path")!;
    const firstFlight = flake.getAnimations()[0];
    firstFlight.finish();
    const untilNextFlight = () =>
      new Promise<Animation>((resolve) => {
        const sample = () => {
          const flight = flake
            .getAnimations()
            .find((item) => Number(item.effect?.getTiming().duration) > 1000);
          if (flight && Number(bank.getAttribute("data-snow-depth")) === 1)
            resolve(flight);
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
    const secondFlight = await untilNextFlight();
    secondFlight.pause();
    secondFlight.currentTime =
      Number(secondFlight.effect!.getTiming().duration) - 1;
    const flakeBounds = flake.getBoundingClientRect();
    const x = flakeBounds.x + flakeBounds.width * 0.5;
    const y =
      flakeBounds.y +
      flakeBounds.height * 0.5 +
      flake.offsetWidth * 0.48 * 0.44;
    const inverse = profile.getScreenCTM()!.inverse();
    const above = profile.isPointInFill(
      new DOMPoint(x, y - 1.5).matrixTransform(inverse),
    );
    const below = profile.isPointInFill(
      new DOMPoint(x, y + 1.5).matrixTransform(inverse),
    );
    const before = ridge.getBoundingClientRect();
    secondFlight.finish();
    await new Promise((resolve) => setTimeout(resolve, 480));
    const after = ridge.getBoundingClientRect();
    return {
      above,
      below,
      rise: before.top - after.top,
      baseShift: Math.abs(before.bottom - after.bottom),
    };
  });
  expect(landedAt.above).toBe(false);
  expect(landedAt.below).toBe(true);
  expect(landedAt.rise).toBeGreaterThan(2);
  expect(landedAt.baseShift).toBeLessThan(1);
  await expect(photo).toHaveAttribute("data-snow-depth", "2");
});

test("winter squalls ramp up and return to calm", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/?season=winter", { waitUntil: "domcontentloaded" });
  const layer = page.locator(".snowfall");
  await expect(layer).toHaveAttribute("data-snow-weather", "calm");
  await page.clock.fastForward(19000);
  await expect(layer).toHaveAttribute("data-snow-weather", "squall");
  await expect(layer).toHaveCSS("--snow-wind", /^-?[6-9]\d(?:\.\d+)?px$/);
  await expect(layer.locator(".snow-squall .snow-flurry").first()).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await page.clock.fastForward(6400);
  await expect(layer).toHaveAttribute("data-snow-weather", "calm");
  await expect(layer).toHaveCSS("--snow-wind", "");
});

test("the same snow cap receives visibly different approaches", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?season=winter", { waitUntil: "domcontentloaded" });
  const cap = page.locator('[data-snow-surface="heading"]').first();
  const approaches = await cap.evaluate(async (bank) => {
    const flake = bank.querySelector(".snow-contact")!;
    const routes: { shape: string; sweep: number; descends: boolean }[] = [];
    let previous: Animation | undefined;
    for (let index = 0; index < 5; index++) {
      const flight = await new Promise<Animation>((resolve) => {
        const nextFrame = () => {
          const candidate = flake
            .getAnimations()
            .find(
              (item) =>
                item !== previous &&
                Number(item.effect?.getTiming().duration) > 1000,
            );
          if (candidate) resolve(candidate);
          else requestAnimationFrame(nextFrame);
        };
        nextFrame();
      });
      const frames = (flight.effect as KeyframeEffect).getKeyframes();
      const coordinates = frames.map(
        (frame) => new DOMMatrixReadOnly(String(frame.transform)),
      );
      const destination = coordinates[coordinates.length - 1];
      routes.push({
        shape: coordinates
          .map((point) => Math.round((point.m41 - destination.m41) / 4))
          .join(","),
        sweep:
          Math.max(...coordinates.map((point) => point.m41)) -
          Math.min(...coordinates.map((point) => point.m41)),
        descends: coordinates.every(
          (point, i) => i === 0 || point.m42 > coordinates[i - 1].m42,
        ),
      });
      previous = flight;
      flight.finish();
    }
    return routes;
  });
  expect(
    approaches.every(
      (route, index) =>
        index === 0 || route.shape !== approaches[index - 1].shape,
    ),
  ).toBe(true);
  expect(approaches.every((route) => route.descends)).toBe(true);
  expect(Math.max(...approaches.map((route) => route.sweep))).toBeGreaterThan(
    25,
  );
});
