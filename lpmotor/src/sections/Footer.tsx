import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import "../styles/footer.css";

export function Footer() {
  return (
    <footer className="footer-footer">
      <AmbientBackdrop className="footer-aurora" />
      <div className="footer-wrap">
        <div className="footer-top">
          <div className="footer-brand footer-reveal">
            <span className="footer-logo">Bomond</span>
            <p className="footer-tagline">
              Студия красоты в Балашихе. Окрашивание, стрижки, уход, брови и
              ресницы — для тех, кто выбирает лучшее.
            </p>
          </div>
          <div className="footer-col footer-reveal">
            <h3 className="footer-col-title">Навигация</h3>
            <a href="#services" className="footer-link">
              Услуги
            </a>
            <a href="#masters" className="footer-link">
              Мастера
            </a>
            <a href="#promo" className="footer-link">
              Акции
            </a>
            <a href="#price" className="footer-link">
              Прайс
            </a>
            <a href="#reviews" className="footer-link">
              Отзывы
            </a>
          </div>
          <div className="footer-col footer-reveal">
            <h3 className="footer-col-title">Контакты</h3>
            <a href={studio.phoneHref} className="footer-link">
              {studio.phoneLabel}
            </a>
            <a
              href={studio.telegram}
              target="_blank"
              rel="noopener"
              className="footer-link"
            >
              Telegram-канал
            </a>
            <a
              href={studio.whatsapp}
              target="_blank"
              rel="noopener"
              className="footer-link"
            >
              WhatsApp
            </a>
            <a
              href={studio.instagram}
              target="_blank"
              rel="noopener"
              className="footer-link"
            >
              Instagram
            </a>
            <a
              href={studio.vk}
              target="_blank"
              rel="noopener"
              className="footer-link"
            >
              ВКонтакте
            </a>
            <a
              href={studio.twoGis}
              target="_blank"
              rel="noopener"
              className="footer-link"
            >
              2ГИС
            </a>
          </div>
        </div>
        <div className="footer-bottom footer-reveal">
          <span className="footer-copy">
            © Bomond, студия красоты — Балашиха, шоссе Энтузиастов, 7/1
          </span>
          <span className="footer-hours">Работаем ежедневно 10:00–21:00</span>
        </div>
      </div>
    </footer>
  );
}
