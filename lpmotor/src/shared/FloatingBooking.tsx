import { useEffect, useState } from "react";
import { studio } from "../content/studio";
import { listen } from "../integrations/sectionRuntime";

export function FloatingBooking() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    update();
    const stopScroll = listen(window, "scroll", update);
    const stopResize = listen(window, "resize", update);
    return () => {
      stopScroll();
      stopResize();
    };
  }, []);

  return (
    <a
      href={studio.booking}
      target="_blank"
      rel="noopener"
      className={visible ? "booking-float is-visible" : "booking-float"}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Онлайн-запись"
    >
      <span>Онлайн-запись</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
