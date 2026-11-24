import { useState } from "react";
import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import { ContactApproach } from "./ContactApproach";
import "../styles/contacts.css";

export function Contacts() {
  const [showMap, setShowMap] = useState(false);

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
              <p className="contacts-note">Вход со двора</p>
              <a
                href={studio.directions}
                target="_blank"
                rel="noopener"
                className="contacts-route-link"
              >
                Построить маршрут до входа в Яндекс Картах →
              </a>
            </div>
            <div className="contacts-card contacts-reveal">
              <h3 className="contacts-card-title">График работы</h3>
              <div className="contacts-hours-row">
                <span className="contacts-hours-days">
                  Понедельник — воскресенье
                </span>
                <span className="contacts-hours-time">
                  {`${studio.opens} – ${studio.closes}`}
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
              <div
                className="contacts-map-controls"
                aria-label="Как добраться"
                role="group"
              >
                <button
                  type="button"
                  aria-pressed={!showMap}
                  onClick={() => setShowMap(false)}
                >
                  Схема проезда
                </button>
                <button
                  type="button"
                  aria-pressed={showMap}
                  onClick={() => setShowMap(true)}
                >
                  Яндекс Карты
                </button>
              </div>
              {showMap ? (
                <iframe
                  className="contacts-map-frame"
                  src={studio.entranceMap}
                  title="Яндекс Карты — вход в Bomond со двора"
                  loading="lazy"
                />
              ) : (
                <ContactApproach />
              )}
              <div className="contacts-map-details">
                <span className="contacts-map-brand">Bomond</span>
                <a
                  className="contacts-map-address"
                  href={studio.yandex}
                  target="_blank"
                  rel="noopener"
                >
                  {`${studio.street}, ${studio.city}`}
                </a>
                <a
                  href={studio.directions}
                  target="_blank"
                  rel="noopener"
                  className="contacts-map-btn"
                >
                  Маршрут ко входу
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
