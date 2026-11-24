import { useEffect, useRef, useState } from "react";
import { reviews } from "../content/reviews";
import { studio } from "../content/studio";
import { listen } from "../integrations/sectionRuntime";
import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import "../styles/reviews.css";

export function Reviews() {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [enhanced, setEnhanced] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const pageCount = Math.ceil(reviews.length / perPage);
  const activePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    const narrow = matchMedia("(max-width: 640px)");
    const medium = matchMedia("(max-width: 980px)");
    const updateLayout = () => {
      const nextPerPage = narrow.matches ? 1 : medium.matches ? 2 : 3;
      setPerPage(nextPerPage);
      setPage((current) =>
        Math.min(current, Math.ceil(reviews.length / nextPerPage) - 1),
      );
    };
    updateLayout();
    setEnhanced(true);
    return listen(window, "resize", updateLayout);
  }, []);

  useEffect(() => {
    if (track.current) {
      track.current.style.transform = `translateX(calc(${-activePage} * (100% + var(--reviews-gap))))`;
    }
  }, [activePage]);

  function move(direction: number) {
    setPage((activePage + direction + pageCount) % pageCount);
  }

  return (
    <section className="reviews-reviews" id="reviews">
      <AmbientBackdrop className="reviews-aurora" />
      <div className="reviews-wrap">
        <p className="reviews-eyebrow">Отзывы</p>
        <h2 className="reviews-title">150 голосов, которые говорят за нас</h2>
        <div className="reviews-rating">
          <span className="reviews-stars" aria-hidden="true">
            ★★★★★
          </span>
          <span className="reviews-rating-value">5.0</span>
          <span className="reviews-rating-sep">·</span>
          <span className="reviews-rating-text">
            150 отзывов на Яндекс Картах
          </span>
        </div>
        <div
          className="reviews-slider"
          data-reviews-ready={enhanced ? "" : undefined}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = touch
              ? { x: touch.clientX, y: touch.clientY }
              : null;
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            const touch = event.changedTouches[0];
            touchStart.current = null;
            if (!start || !touch) return;
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
              move(dx < 0 ? 1 : -1);
          }}
        >
          <div className="reviews-viewport">
            <div className="reviews-track" id="reviews-track" ref={track}>
              {reviews.map((review, index) => {
                const current = Math.floor(index / perPage) === activePage;
                return (
                  <article
                    className={
                      current
                        ? "reviews-card reviews-is-current"
                        : "reviews-card"
                    }
                    aria-hidden={enhanced && !current ? true : undefined}
                    key={review.author}
                  >
                    <div className="reviews-card-head">
                      <span className="reviews-name">{review.author}</span>
                      <span className="reviews-stars-sm" aria-hidden="true">
                        ★★★★★
                      </span>
                    </div>
                    <div className="reviews-meta">{review.visit}</div>
                    <p className="reviews-text">{review.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="reviews-controls">
            <button
              className="reviews-arrow"
              type="button"
              aria-label="Предыдущие отзывы"
              onClick={() => move(-1)}
            >
              <span className="reviews-arrow-icon" aria-hidden="true">
                ←
              </span>
            </button>
            <div
              className="reviews-dots"
              role="group"
              aria-label="Страницы отзывов"
            >
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  className={
                    activePage === index
                      ? "reviews-dot reviews-is-active"
                      : "reviews-dot"
                  }
                  type="button"
                  key={index}
                  aria-label={`Отзывы ${index + 1} из ${pageCount}`}
                  aria-current={activePage === index ? "true" : undefined}
                  aria-controls="reviews-track"
                  onClick={() => setPage(index)}
                />
              ))}
            </div>
            <button
              className="reviews-arrow"
              type="button"
              aria-label="Следующие отзывы"
              onClick={() => move(1)}
            >
              <span className="reviews-arrow-icon" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
        <p className="reviews-footnote">
          <a
            href={studio.yandexReviews}
            target="_blank"
            rel="noopener"
            className="reviews-footnote-link"
          >
            Все отзывы — реальные, с Яндекс Карт · читать на Яндекс Картах →
          </a>
        </p>
      </div>
    </section>
  );
}
