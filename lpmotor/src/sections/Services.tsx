import { services } from "../content/services";
import { followSectionLink } from "../shared/sectionLink";
import { Portfolio } from "./Portfolio";
import "../styles/services.css";

export function Services() {
  return (
    <section className="services-services" id="services">
      <div className="services-wrap">
        <div className="services-heading">
          <h2 className="services-title">Услуги и цены</h2>
          <p className="services-lede">
            Выберите услугу, чтобы посмотреть процедуры и стоимость.
          </p>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <a
              className="services-card"
              href={`#price-${service.priceZone}`}
              key={service.priceZone}
              onClick={followSectionLink}
            >
              <div className="services-media">
                <img
                  className="services-photo"
                  src={service.photo}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="services-card-copy">
                <h3 className="services-name">{service.name}</h3>
                <p className="services-text">{service.description}</p>
                <span className="services-card-link">
                  Смотреть цены <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>
          ))}
        </div>
        <Portfolio />
      </div>
    </section>
  );
}
