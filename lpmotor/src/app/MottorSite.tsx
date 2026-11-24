import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listen } from "../integrations/sectionRuntime";
import { useTelegram } from "../integrations/useTelegram";
import { FloatingBooking } from "../shared/FloatingBooking";
import { useSeason } from "../shared/useSeason";

export function MottorSite() {
  const telegramClick = useTelegram();
  const [bookingHost, setBookingHost] = useState<HTMLElement | null>(null);
  useSeason();

  useEffect(() => {
    setBookingHost(document.getElementById("bomond-floating-root"));
  }, []);

  useEffect(() => {
    return listen(document, "click", (event) => {
      if (event instanceof MouseEvent) telegramClick(event);
    });
  }, [telegramClick]);

  return bookingHost ? createPortal(<FloatingBooking />, bookingHost) : null;
}
