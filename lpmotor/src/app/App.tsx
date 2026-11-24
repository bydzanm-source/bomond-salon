import { useTelegram } from "../integrations/useTelegram";
import { Footer } from "../sections/Footer";
import { Header } from "../sections/Header";
import { FloatingBooking } from "../shared/FloatingBooking";
import { useSeason } from "../shared/useSeason";
import { mainSections } from "./sections";
import "../styles/base.css";
import "../styles/booking.css";

export function App() {
  const openTelegramLink = useTelegram();
  useSeason();
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
      <FloatingBooking />
    </div>
  );
}
