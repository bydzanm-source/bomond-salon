import { useRef, useState } from "react";
import { priceZones } from "../content/prices";
import { followSectionLink } from "../shared/sectionLink";

const works = [
  { ...priceZones[0].photos[1], zone: 1 },
  { ...priceZones[4].photos[1], zone: 5 },
  { ...priceZones[1].photos[0], zone: 2 },
  { ...priceZones[3].photos[0], zone: 4 },
];

export function Portfolio() {
  const [work, setWork] = useState<(typeof works)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <div id="works" className="services-portfolio">
      <div className="services-portfolio-head">
        <h2>Работы мастеров</h2>
        <p>
          Откройте фото, чтобы рассмотреть результат и найти цены на услугу.
        </p>
      </div>
      <div className="services-works">
        {works.map((item) => (
          <button
            className="services-work"
            key={item.src}
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              setWork(item);
              dialog.current?.showModal();
            }}
          >
            <span className="services-work-photo">
              <img
                src={item.src}
                alt={item.alt}
                width="420"
                height="525"
                loading="lazy"
              />
            </span>
            <span className="services-work-caption">
              <span>{item.caption}</span>
              <span aria-hidden="true">↗</span>
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="services-dialog"
        aria-labelledby="services-dialog-title"
      >
        <div className="services-dialog-bar">
          <h2 id="services-dialog-title">{work?.caption}</h2>
          <button
            type="button"
            className="services-dialog-close"
            onClick={() => dialog.current?.close()}
          >
            Закрыть
          </button>
        </div>
        {work && (
          <>
            <img
              className="services-dialog-photo"
              src={work.src}
              alt={work.alt}
            />
            <a
              className="services-dialog-price"
              href={`#price-${work.zone}`}
              onClick={(event) => {
                if (followSectionLink(event)) dialog.current?.close();
              }}
            >
              Смотреть цены
            </a>
          </>
        )}
      </dialog>
    </div>
  );
}
