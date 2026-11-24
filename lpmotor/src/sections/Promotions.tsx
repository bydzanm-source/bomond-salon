import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import "../styles/promotions.css";

const novemberOffers = [
  {
    title: "Ампульное восстановление волос",
    benefit: "В подарок",
    detail: "При окрашивании у Лины или Алёны.",
    photo:
      "https://m-files.cdn1.cc/lpfile/5/e/6/5e699ebd180f11d0f6da23e1dc82e618/-/crop/36x205x120x122/f.jpg",
    alt: "Мастер наносит ампульный уход на пряди волос",
  },
  {
    title: "Ботокс для волос",
    benefit: "−15%",
    detail: "У Кристины",
    photo:
      "https://m-files.cdn1.cc/lpfile/e/d/9/ed9b697868a1ec937ea44003db9a2d55.jpeg",
    alt: "Гладкие светлые волосы после ботокса",
  },
  {
    title: "Наращивание ресниц",
    benefit: "−10%",
    detail: null,
    photo:
      "https://m-files.cdn1.cc/lpfile/3/d/3/3d3220c821361eb074c6930fd3efe43d.jpeg",
    alt: "Крупный план классического наращивания ресниц",
  },
  {
    title: "Мужские стрижки",
    benefit: "−10%",
    detail: "У Марии",
    photo:
      "https://m-files.cdn1.cc/lpfile/5/e/6/5e699ebd180f11d0f6da23e1dc82e618/-/crop/250x593x166x166/f.jpg",
    alt: "Мастер стрижёт короткие мужские волосы ножницами",
  },
] as const;

export function Promotions() {
  return (
    <section className="promotions-promo" id="promo">
      <AmbientBackdrop className="promotions-aurora" />
      <div className="promotions-wrap">
        <div className="promotions-featured">
          <p className="promotions-period">
            <time dateTime="2026-11-30">До 30 ноября включительно</time>
          </p>
          <h2 className="promotions-title">Ноябрь в Bomond</h2>

          <ul className="promotions-offers" role="list">
            {novemberOffers.map(
              ({ title, benefit, detail, photo, alt }, index) => (
                <li
                  className={
                    index === 0
                      ? "promotions-offer promotions-offer--gift"
                      : "promotions-offer"
                  }
                  key={title}
                >
                  <div className="promotions-offer-media">
                    <img src={photo} alt={alt} loading="lazy" />
                  </div>
                  <div className="promotions-offer-copy">
                    <p className="promotions-offer-value">{benefit}</p>
                    <h3>{title}</h3>
                    {detail && (
                      <p className="promotions-offer-detail">{detail}</p>
                    )}
                  </div>
                </li>
              ),
            )}
          </ul>

          <div className="promotions-actions">
            <a
              href="https://dikidi.net/500351"
              target="_blank"
              rel="noopener"
              className="promotions-btn promotions-btn--primary"
            >
              Записаться по акции
            </a>
            <a
              href="https://t.me/bomondblh/422"
              target="_blank"
              rel="noopener"
              className="promotions-offer-source"
            >
              Акция в Telegram
            </a>
          </div>
        </div>

        <div className="promotions-referral promotions-reveal" id="referral">
          <p className="promotions-eyebrow">Постоянная акция</p>
          <h3 className="promotions-ref-title">
            {"Приведи подругу — "}
            <span className="promotions-shine">скидка обеим</span>
          </h3>
          <div className="promotions-ref-grid">
            <div className="promotions-ref-text">
              <p className="promotions-ref-p">
                Пригласите подругу, которая ещё ни разу не была в Bomond, по
                реферальной программе DIKIDI: подруге — скидка на первый визит,
                вам — бонусные баллы, которыми можно оплатить любые услуги
                студии.
              </p>
              <div className="promotions-ref-numbers">
                <div className="promotions-ref-num">
                  <span className="promotions-ref-num-value">10%</span>
                  <span className="promotions-ref-num-label">вам бонусами</span>
                </div>
                <div className="promotions-ref-num">
                  <span className="promotions-ref-num-value">15%</span>
                  <span className="promotions-ref-num-label">
                    подруге скидка
                  </span>
                </div>
              </div>
              <ol className="promotions-ref-steps">
                <li className="promotions-step">
                  <span className="promotions-step-num">1</span>
                  <span className="promotions-step-text">
                    Отправьте подруге свою индивидуальную ссылку или QR-код для
                    записи
                  </span>
                </li>
                <li className="promotions-step">
                  <span className="promotions-step-num">2</span>
                  <span className="promotions-step-text">
                    После её первого визита баллы появятся в вашем кабинете
                    DIKIDI
                  </span>
                </li>
                <li className="promotions-step">
                  <span className="promotions-step-num">3</span>
                  <span className="promotions-step-text">
                    Потратьте баллы на услуги в течение двух месяцев
                  </span>
                </li>
              </ol>
              <p className="promotions-ref-note">
                Баллы активируются только после посещения студии подругой
              </p>
              <p className="promotions-ref-note">
                Свою ссылку и QR-код вы найдёте в личном кабинете
              </p>
              <a
                href="https://t.me/bomondblh/253"
                target="_blank"
                rel="noopener"
                className="promotions-ref-link"
              >
                Подробная инструкция в канале →
              </a>
            </div>
            <div className="promotions-ref-media">
              <div className="promotions-ref-ring">
                <img
                  className="promotions-ref-photo"
                  src="https://m-files.cdn1.cc/lpfile/c/0/d/c0d2c4df26e77ba24787621e876fab9a.jpg"
                  alt="Реферальная программа Bomond"
                  loading="lazy"
                />
              </div>
              <p className="promotions-ref-quote">
                Дружба — это
                <br />
                <em>подарить ей преображение в&nbsp;BOMOND</em>
              </p>
              <a
                className="promotions-qr"
                href="https://t.me/bomondblh/253"
                target="_blank"
                rel="noopener"
              >
                <img
                  className="promotions-qr-img"
                  src="https://m-files.cdn1.cc/lpfile/5/b/b/5bb9e96d41e2c8d7e7083d7c38de060a.png"
                  alt="QR-код реферальной ссылки"
                  loading="lazy"
                />
                <span className="promotions-qr-caption">
                  <b>Реферальная программа</b>Наведите камеру — инструкция в
                  канале
                </span>
              </a>
            </div>
          </div>
        </div>

        <p className="promotions-closing">
          {"Новые акции появляются каждый месяц — следите за анонсами в нашем "}
          <a
            href={studio.telegram}
            target="_blank"
            rel="noopener"
            className="promotions-closing-link"
          >
            Telegram-канале
          </a>
          .
        </p>
      </div>
    </section>
  );
}
