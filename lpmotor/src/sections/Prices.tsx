import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { priceZones } from "../content/prices";
import type { PriceTable } from "../content/prices";
import { studio } from "../content/studio";
import { listen } from "../integrations/sectionRuntime";
import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import "../styles/prices.css";

const firstZone = priceZones[0].id;

export function Prices() {
  const [activeZone, setActiveZone] = useState(firstZone);
  const [enhanced, setEnhanced] = useState(false);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    setEnhanced(true);
    function readZoneFromHash() {
      const match = /^#price-(\d+)$/.exec(location.hash);
      if (!match) return;
      const zone = priceZones.find(({ id }) => id === Number(match[1]));
      if (zone) {
        setActiveZone(zone.id);
        section.current?.scrollIntoView({ block: "start" });
      }
    }
    readZoneFromHash();
    return listen(window, "hashchange", readZoneFromHash);
  }, []);

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowLeft":
        nextIndex = (index + priceZones.length - 1) % priceZones.length;
        break;
      case "ArrowRight":
        nextIndex = (index + 1) % priceZones.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = priceZones.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const zone = priceZones[nextIndex].id;
    setActiveZone(zone);
    document.getElementById(`price-tab-${zone}`)?.focus();
  }

  return (
    <section
      className="prices-price"
      id="price"
      ref={section}
      data-prices-ready={enhanced ? "" : undefined}
    >
      <AmbientBackdrop className="prices-aurora" />
      <div className="prices-wrap">
        <p className="prices-eyebrow">Прайс</p>
        <h2 className="prices-title">Честная цена за безупречный результат</h2>
        <p className="prices-lede">
          Выберите зону процедур — ниже актуальный прайс-лист студии. Точную
          стоимость мастер согласует на консультации в зависимости от длины и
          структуры волос.
        </p>
        <div
          className="prices-tabs prices-reveal"
          role="tablist"
          aria-label="Категории прайса"
        >
          {priceZones.map((zone, index) => (
            <button
              key={zone.id}
              type="button"
              role="tab"
              id={`price-tab-${zone.id}`}
              aria-controls={`price-${zone.id}`}
              aria-selected={activeZone === zone.id}
              tabIndex={activeZone === zone.id ? 0 : -1}
              className={
                activeZone === zone.id
                  ? "prices-tab prices-is-active"
                  : "prices-tab"
              }
              onClick={() => setActiveZone(zone.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {zone.title}
            </button>
          ))}
        </div>
        <div className="prices-panels prices-reveal">
          {priceZones.map((zone) => (
            <div
              key={zone.id}
              id={`price-${zone.id}`}
              role="tabpanel"
              aria-labelledby={`price-tab-${zone.id}`}
              className={
                enhanced && activeZone !== zone.id
                  ? "prices-panel prices-is-hidden"
                  : "prices-panel"
              }
            >
              <h3 className="prices-fallback-title">{zone.title}</h3>
              <p className="prices-panel-intro">{zone.intro}</p>
              <div className="prices-photos">
                {zone.photos.map((photo) => (
                  <figure className="prices-figure" key={photo.src}>
                    <img
                      className="prices-photo"
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                    />
                    <figcaption className="prices-figcaption">
                      {photo.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
              {zone.tables.map(({ title, columns, rows }: PriceTable) => (
                <div key={title ?? zone.id}>
                  {title && <h4 className="prices-group">{title}</h4>}
                  <div className="prices-table-wrap">
                    <table className="prices-table">
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <th key={column} scope="col">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(([service, ...rates]) => (
                          <tr key={service}>
                            <td>{service}</td>
                            {rates.map((rate, index) => (
                              <td key={columns[index + 1]}>{rate}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="prices-note">
          Стоимость зависит от длины и структуры волос, а также от квалификации
          мастера. Актуальный полный прайс уточняйте у администратора — напишите
          нам в{" "}
          <a
            className="prices-note-link"
            href={studio.whatsapp}
            target="_blank"
            rel="noopener"
          >
            WhatsApp
          </a>{" "}
          или{" "}
          <a
            className="prices-note-link"
            href={studio.telegramBooking}
            target="_blank"
            rel="noopener"
          >
            Telegram
          </a>
          .
        </p>
      </div>
    </section>
  );
}
