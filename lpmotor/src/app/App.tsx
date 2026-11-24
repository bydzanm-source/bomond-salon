import { useTelegram } from "../integrations/useTelegram";
import { Footer } from "../sections/Footer";
import { Header } from "../sections/Header";
import { FallingLeaves } from "../shared/FallingLeaves";
import { Snowfall } from "../shared/Snowfall";
import { FloatingBooking } from "../shared/FloatingBooking";
import { useSeason } from "../shared/useSeason";
import { mainSections } from "./sections";
import "../styles/base.css";
import "../styles/booking.css";

export function App() {
  const openTelegramLink = useTelegram();
  const season = useSeason();
  return (
    <div
      className="bomond"
      onClickCapture={(event) => openTelegramLink(event.nativeEvent)}
    >
      <Header />
      <main>
        {mainSections.map(({ name, Component }) => (
          <Component key={name} />
        ))}
      </main>
      <Footer />
      {season === "autumn" && <FallingLeaves />}
      {season === "winter" && <Snowfall />}
      <FloatingBooking />
    </div>
  );
}
