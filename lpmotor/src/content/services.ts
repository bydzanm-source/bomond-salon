import type { PriceZoneId } from "./prices";

type Service = {
  priceZone: PriceZoneId;
  name: string;
  offer: string;
  description: string;
  photo: string;
  imageAlt: string;
};

export const services = [
  {
    priceZone: 1,
    name: "Парикмахерский зал",
    offer: "от 500 ₽",
    description:
      "Стрижки, окрашивание и укладка любой сложности — от лёгкого тонирования до сложного балаяжа и причёски на выход.",
    photo:
      "https://m-files.cdn1.cc/lpfile/f/b/b/fbb8be4e182a13d9295920ee4bacae68.jpg",
    imageAlt: "Парикмахерский зал",
  },
  {
    priceZone: 2,
    name: "Зона бровей и ресниц",
    offer: "от 800 ₽",
    description:
      "Архитектура и коррекция формы, окрашивание, ламинирование бровей и ресниц — взгляд, который работает без макияжа.",
    photo:
      "https://m-files.cdn1.cc/lpfile/9/1/6/916faef7f1c4476b5b2c3da597b54636.jpg",
    imageAlt: "Зона бровей и ресниц",
  },
  {
    priceZone: 4,
    name: "Наращивание ресниц",
    offer: "от 600 ₽",
    description:
      "Классика, объём 2D/3D, мокрый эффект — подберём формат под ваши природные ресницы и желаемый результат.",
    photo:
      "https://m-files.cdn1.cc/lpfile/9/5/2/952a57a5567e08a034b20516a8fd623c.jpg",
    imageAlt: "Наращивание ресниц",
  },
  {
    priceZone: 3,
    name: "Перманентный макияж",
    offer: "от 4000 ₽",
    description:
      "Губы, брови, межресничка — стойкий и аккуратный результат, который экономит время каждое утро.",
    photo:
      "https://m-files.cdn1.cc/lpfile/6/4/e/64e7ddba4dcb007ad7862d54086db73a.jpg",
    imageAlt: "Перманентный макияж",
  },
  {
    priceZone: 5,
    name: "Уход для волос",
    offer: "от 1000 ₽",
    description:
      "Кератин, ботокс, холодное восстановление и нанопластика — реанимация волос без утяжеления уже после одного визита.",
    photo:
      "https://m-files.cdn1.cc/lpfile/6/8/5/6857991177fdc8f6e0c11e9a9f2c5587.jpg",
    imageAlt: "Уход для волос",
  },
  {
    priceZone: 6,
    name: "Плетение кос, брейдов, дредов",
    offer: "от 1500 ₽",
    description:
      "От нежной косы до брейдов и дредов — причёска, в которой можно жить неделями.",
    photo:
      "https://m-files.cdn1.cc/lpfile/1/b/9/1b9b88ad3dc0d80775dfe430126ff141.jpg",
    imageAlt: "Плетение",
  },
  {
    priceZone: 7,
    name: "Макияж, причёски",
    offer: "от 5000 ₽",
    description:
      "Дневной и вечерний макияж, укладки и причёски на любой повод — от лёгкой базы до праздничного образа.",
    photo:
      "https://m-files.cdn1.cc/lpfile/c/e/d/ced9d3fec2b52beeefb80b0bf50fd5db.jpg",
    imageAlt: "Макияж, причёски",
  },
] satisfies Service[];
