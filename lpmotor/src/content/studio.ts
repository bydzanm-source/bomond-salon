const phone = "+79067181768";
const city = "Балашиха";
const region = "Московская область";
const street = "шоссе Энтузиастов, 7/1";

export const studio = {
  name: "Bomond",
  url: "https://bomond.site/",
  phoneLabel: "+7 906 718-17-68",
  phoneHref: `tel:${phone}`,
  phone,
  city,
  region,
  street,
  fullAddress: [region, city, street].join(", "),
  postalCode: "143912",
  opens: "10:00",
  closes: "21:00",
  booking: "https://dikidi.ru/#widget=217330",
  whatsapp: "https://wa.me/79067181768",
  telegramBooking: "https://t.me/Bomond_Hostess_bot?start=site",
  telegram: "https://t.me/bomondblh",
  instagram: "https://www.instagram.com/bomond.blh",
  vk: "https://vk.ru/bomond_blh",
  twoGis: "https://2gis.ru/balashikha/firm/70000001039870510",
  yandex: "https://yandex.ru/maps/org/bomond/130025090200/",
  yandexReviews: "https://yandex.ru/maps/org/bomond/130025090200/reviews/",
  directions: "https://yandex.ru/maps/?rtext=~55.795607,37.934073&rtt=auto",
  teamPhoto:
    "https://m-files.cdn1.cc/lpfile/5/b/1/5b13eaff321dca64cb2d4dc738683c91.jpg",
  socialImage:
    "https://m-files.cdn1.cc/lpfile/2/c/a/2ca704f46e552d459c955ee11e030131.jpg",
} as const;

export const navigation = [
  { id: "about", label: "О салоне" },
  { id: "services", label: "Услуги" },
  { id: "masters", label: "Мастера" },
  { id: "promo", label: "Акции" },
  { id: "price", label: "Прайс" },
  { id: "reviews", label: "Отзывы" },
  { id: "contacts", label: "Контакты" },
] as const;
