import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listen } from "../integrations/sectionRuntime";
import { useTelegram } from "../integrations/useTelegram";
import { FallingLeaves } from "../shared/FallingLeaves";
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
    return listen(
      document,
      "click",
      (event) => {
        if (!(event instanceof MouseEvent)) return;
        const link =
          event.target instanceof Element
            ? event.target.closest("a[href]")
            : null;
        if (
          !(link instanceof HTMLAnchorElement) ||
          !link.closest("[data-bomond-island], #bomond-floating-root")
        )
          return;
        telegramClick(event);
        // LPmotor's smooth-scroll handler treats external fragments as local selectors.
        if (link.origin !== location.origin && link.hash)
          event.stopPropagation();
      },
      true,
    );
  }, [telegramClick]);

  return bookingHost
    ? createPortal(
        <>
          <FallingLeaves />
          <FloatingBooking />
        </>,
        bookingHost,
      )
    : null;
}
