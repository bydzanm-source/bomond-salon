import { renderToString } from "react-dom/server";
import { studio } from "../content/studio";
import { App } from "./App";

const seo = {
  title: "Салон красоты Bomond в Балашихе — стрижки и окрашивание",
  description:
    "Сложное окрашивание AirTouch и балаяж, женские стрижки, уход за волосами, брови и ресницы. Цены и онлайн-запись в Bomond, Балашиха, шоссе Энтузиастов, 7/1.",
  keywords: [
    "салон красоты Балашиха",
    "студия красоты Балашиха",
    "Бомонд Балашиха",
    "Bomond Балашиха",
    "салон красоты шоссе Энтузиастов Балашиха",
    "сложное окрашивание волос Балашиха",
    "колорист Балашиха",
    "AirTouch Балашиха",
    "балаяж Балашиха",
    "выход из чёрного Балашиха",
    "женская стрижка Балашиха",
    "кератиновое восстановление волос Балашиха",
    "коррекция бровей Балашиха",
    "наращивание ресниц Балашиха",
    "ламинирование ресниц Балашиха",
    "перманентный макияж Балашиха",
  ],
};

const salonSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": studio.url + "#salon",
  name: studio.name,
  alternateName: "Бомонд",
  url: studio.url,
  image: studio.teamPhoto,
  telephone: studio.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: studio.street,
    addressLocality: studio.city,
    addressRegion: studio.region,
    postalCode: studio.postalCode,
    addressCountry: "RU",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: studio.opens,
    closes: studio.closes,
  },
  sameAs: [studio.yandex, studio.twoGis, studio.vk],
};

export const canonicalUrl = studio.url;

export function renderPage(indexable: boolean) {
  const metadata = renderToString(
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(", ")} />
      <meta
        name="robots"
        content={indexable ? "index, follow" : "noindex, follow"}
      />
      <link rel="canonical" href={studio.url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={studio.url} />
      <meta property="og:title" content="Bomond — студия красоты в Балашихе" />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={studio.name} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:image" content={studio.socialImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </>,
  );

  const jsonLd = JSON.stringify(salonSchema).replaceAll("<", "\\u003c");
  return {
    head:
      metadata + '<script type="application/ld+json">' + jsonLd + "</script>",
    body: renderToString(<App />),
  };
}
