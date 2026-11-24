import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import "../styles/contacts.css";

export function Contacts() {
  return (
    <section className="contacts-contacts" id="contacts">
      <AmbientBackdrop className="contacts-aurora" />
      <div className="contacts-wrap">
        <p className="contacts-eyebrow">Контакты</p>
        <h2 className="contacts-title">Найти нас — просто</h2>
        <div className="contacts-grid">
          <div className="contacts-info">
            <div className="contacts-card contacts-reveal">
              <h3 className="contacts-card-title">Адрес</h3>
              <p className="contacts-address">{studio.fullAddress}</p>
              <a
                href={studio.directions}
                target="_blank"
                rel="noopener"
                className="contacts-route-link"
              >
                Нажмите, чтобы построить маршрут в Яндекс Картах →
              </a>
            </div>
            <div className="contacts-card contacts-reveal">
              <h3 className="contacts-card-title">График работы</h3>
              <div className="contacts-hours-row">
                <span className="contacts-hours-days">
                  Понедельник — воскресенье
                </span>
                <span className="contacts-hours-time">
                  {studio.opens} – {studio.closes}
                </span>
              </div>
              <p className="contacts-note">Без выходных, работаем по записи</p>
            </div>
            <div className="contacts-card contacts-reveal">
              <h3 className="contacts-card-title">Телефон</h3>
              <a href={studio.phoneHref} className="contacts-phone">
                {studio.phoneLabel}
              </a>
              <p className="contacts-note">
                Звонок, WhatsApp или Telegram — как удобно
              </p>
            </div>
            <div className="contacts-quick contacts-reveal">
              <a href={studio.phoneHref} className="contacts-quick-link">
                Позвонить
              </a>
              <a
                href={studio.whatsapp}
                target="_blank"
                rel="noopener"
                className="contacts-quick-link"
              >
                WhatsApp
              </a>
              <a
                href={studio.telegramBooking}
                target="_blank"
                rel="noopener"
                className="contacts-quick-link"
              >
                Telegram
              </a>
              <a
                href={studio.booking}
                target="_blank"
                rel="noopener"
                className="contacts-quick-link"
              >
                Dikidi
              </a>
              <a
                href={studio.instagram}
                target="_blank"
                rel="noopener"
                className="contacts-quick-link"
              >
                Instagram
              </a>
              <a
                href={studio.vk}
                target="_blank"
                rel="noopener"
                className="contacts-quick-link"
              >
                VK
              </a>
              <a
                href={studio.twoGis}
                target="_blank"
                rel="noopener"
                className="contacts-quick-link"
              >
                2ГИС
              </a>
            </div>
          </div>
          <div className="contacts-map">
            <div className="contacts-map-card contacts-reveal">
              <span className="contacts-map-brand">Bomond</span>
              <span className="contacts-map-address">
                шоссе Энтузиастов, 7/1, Балашиха
              </span>
              <a
                href={studio.directions}
                target="_blank"
                rel="noopener"
                className="contacts-map-btn"
              >
                Построить маршрут
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
