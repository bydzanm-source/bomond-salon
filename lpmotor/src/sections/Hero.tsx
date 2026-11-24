import { studio } from "../content/studio";
import { followSectionLink } from "../shared/sectionLink";
import "../styles/hero.css";

export function Hero() {
  return (
    <section className="hero-hero" aria-labelledby="hero-title">
      <div className="hero-wrap">
        <div className="hero-content">
          <p className="hero-eyebrow">Bomond · Шоссе Энтузиастов</p>
          <h1 className="hero-title" id="hero-title">
            Студия красоты <em>в Балашихе</em>
          </h1>
          <p className="hero-sub">
            Окрашивание, стрижки и уход за волосами. Брови, ресницы и макияж для
            повседневного образа и особых случаев.
          </p>
          <div className="hero-actions">
            <a
              href={studio.booking}
              target="_blank"
              rel="noopener"
              className="hero-btn hero-btn--primary"
            >
              Записаться онлайн
            </a>
            <a
              href="#works"
              className="hero-btn hero-btn--secondary"
              onClick={followSectionLink}
            >
              Смотреть работы <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className="hero-notes">
            <a href={studio.directions} target="_blank" rel="noopener">
              <span>Как добраться</span>
              <strong>{studio.street}</strong>
            </a>
            <a href={studio.yandexReviews} target="_blank" rel="noopener">
              <span>Что говорят гости</span>
              <strong>Отзывы на Яндекс Картах</strong>
            </a>
          </div>
        </div>
        <figure className="hero-media">
          <div className="hero-portrait">
            <img
              className="hero-photo"
              src="https://m-files.cdn1.cc/lpfile/e/9/e/e9eb85b6cd73185acfd03869f2c86048.jpg"
              alt="Татьяна Буева, главный колорист Bomond"
              width="700"
              height="987"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <figcaption className="hero-caption">
            <strong>Татьяна Буева</strong>
            <span>Основатель и главный колорист</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
