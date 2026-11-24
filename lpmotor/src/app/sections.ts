import { About } from "../sections/About";
import { Contacts } from "../sections/Contacts";
import { Footer } from "../sections/Footer";
import { Header } from "../sections/Header";
import { Hero } from "../sections/Hero";
import { Prices } from "../sections/Prices";
import { Promotions } from "../sections/Promotions";
import { Reviews } from "../sections/Reviews";
import { Services } from "../sections/Services";
import { Team } from "../sections/Team";

const header = { name: "header", prefix: "bnav", Component: Header } as const;
const footer = { name: "footer", prefix: "bftr", Component: Footer } as const;

export const mainSections = [
  { name: "hero", prefix: "bhro", Component: Hero },
  { name: "about", prefix: "babt", Component: About },
  { name: "team", prefix: "btim", Component: Team },
  { name: "services", prefix: "bsvc", Component: Services },
  { name: "promotions", prefix: "bpro", Component: Promotions },
  { name: "prices", prefix: "bprc", Component: Prices },
  { name: "reviews", prefix: "brev", Component: Reviews },
  { name: "contacts", prefix: "bcnt", Component: Contacts },
] as const;

export const sections = [header, ...mainSections, footer] as const;
