import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { services } from "../content/services";
import "../styles/services.css";

export function Services() {
  return (
    <section className="services-services" id="services">
      <AmbientBackdrop className="services-aurora" />
      <div className="services-wrap">
        <p className="services-eyebrow">Услуги</p>
        <h2 className="services-title">Каждая техника — под ваш образ</h2>
        <p className="services-lede">
          От смелого окрашивания до деликатного ухода: полный цикл
          beauty-процедур в одной студии.
        </p>
        <div className="services-grid">
          {services.map((service) => (
            <a
              className="services-card services-reveal"
              href={`#price-${service.priceZone}`}
              key={service.priceZone}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                const hash = event.currentTarget.hash;
                if (window.location.hash === hash) {
                  window.dispatchEvent(new HashChangeEvent("hashchange"));
                } else {
                  window.location.hash = hash;
                }
              }}
            >
              <div className="services-media">
                <img
                  className="services-photo"
                  src={service.photo}
                  alt={service.imageAlt}
                  loading="lazy"
                />
                <span className="services-badge">{service.offer}</span>
              </div>
              <h3 className="services-name">{service.name}</h3>
              <p className="services-text">{service.description}</p>
            </a>
          ))}
        </div>
        <div className="services-more">
          <a href="#price" className="services-more-link">
            Подробнее →
          </a>
        </div>
      </div>
    </section>
  );
}
