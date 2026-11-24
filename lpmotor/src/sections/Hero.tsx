import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import "../styles/hero.css";

export function Hero() {
  return (
    <section className="hero-hero">
      <AmbientBackdrop className="hero-aurora" />
      <div className="hero-wrap">
        <div className="hero-content">
          <p className="hero-eyebrow">Студия красоты · Балашиха</p>
          <h1 className="hero-title">
            Входите в <span className="hero-brand">BOMOND</span>
          </h1>
          <p className="hero-sub">
            Так и переводится наше имя — «высший свет». Здесь окрашивание,
            стрижки, брови, ресницы и уход за волосами становятся поводом
            почувствовать себя иначе: увереннее, ярче, свободнее.
          </p>
          <div className="hero-rating">
            <span className="hero-stars" aria-hidden="true">
              ★★★★★
            </span>
            <span className="hero-rating-value">5.0</span>
            <span className="hero-rating-sep">·</span>
            <span className="hero-rating-text">Яндекс Карты · 150 отзывов</span>
          </div>
          <div className="hero-actions">
            <a
              href={studio.booking}
              target="_blank"
              rel="noopener"
              className="hero-btn hero-btn--primary"
            >
              Записаться
            </a>
            <a href={studio.phoneHref} className="hero-btn hero-btn--secondary">
              Позвонить
            </a>
          </div>
        </div>
        <div className="hero-media">
          <img
            className="hero-photo"
            src="https://m-files.cdn1.cc/lpfile/e/9/e/e9eb85b6cd73185acfd03869f2c86048.jpg"
            alt="Татьяна Буева, главный мастер-колорист Bomond"
            loading="eager"
          />
          <div className="hero-caption">Татьяна Буева · главный колорист</div>
        </div>
      </div>
      <div className="hero-ticker" aria-hidden="true">
        <div className="hero-ticker-track">
          <span className="hero-ticker-item">
            Окрашивание · Стрижки · Укладки · Брови и ресницы · Наращивание
            ресниц · Перманентный макияж · Кератин и ботокс · Плетение и брейды
            · Макияж и причёски · Рейтинг 5.0 на Яндекс Картах
          </span>
          <span className="hero-ticker-item">
            Окрашивание · Стрижки · Укладки · Брови и ресницы · Наращивание
            ресниц · Перманентный макияж · Кератин и ботокс · Плетение и брейды
            · Макияж и причёски · Рейтинг 5.0 на Яндекс Картах
          </span>
        </div>
      </div>
    </section>
  );
}
