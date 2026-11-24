import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import "../styles/promotions.css";

export function Promotions() {
  return (
    <section className="promotions-promo" id="promo">
      <AmbientBackdrop className="promotions-aurora" />
      <div className="promotions-wrap">
        <div className="promotions-featured">
          <div className="promotions-featured-text promotions-reveal">
            <p className="promotions-eyebrow">Акция месяца</p>
            <h2 className="promotions-title">
              Супер акция <span className="promotions-shine">сентября</span>
            </h2>
            <p className="promotions-lede">
              Дарим не только хорошее настроение, но и подарки — каждого гостя
              ждёт беспроигрышная лотерея.
            </p>
            <span className="promotions-badge">
              <span className="promotions-badge-text">Весь сентябрь</span>
            </span>
            <h3 className="promotions-sub">Правила предельно просты</h3>
            <ol className="promotions-steps">
              <li className="promotions-step">
                <span className="promotions-step-num">1</span>
                <span className="promotions-step-text">
                  Запишитесь в сентябре онлайн — на Dikidi или прямо здесь, на
                  сайте
                </span>
              </li>
              <li className="promotions-step">
                <span className="promotions-step-num">2</span>
                <span className="promotions-step-text">
                  Приходите в студию красоты Bomond
                </span>
              </li>
              <li className="promotions-step">
                <span className="promotions-step-num">3</span>
                <span className="promotions-step-text">
                  После процедуры испытайте удачу в беспроигрышной лотерее
                </span>
              </li>
              <li className="promotions-step">
                <span className="promotions-step-num">4</span>
                <span className="promotions-step-text">
                  Остались вопросы — администратор с удовольствием подскажет
                </span>
              </li>
            </ol>
            <div className="promotions-actions">
              <a
                href={studio.booking}
                target="_blank"
                rel="noopener"
                className="promotions-btn promotions-btn--primary"
              >
                Записаться и участвовать
              </a>
              <a
                href="https://t.me/bomondblh/344"
                target="_blank"
                rel="noopener"
                className="promotions-btn promotions-btn--secondary"
              >
                Пост в Telegram-канале →
              </a>
            </div>
          </div>
          <div className="promotions-featured-media promotions-reveal">
            <img
              className="promotions-photo"
              src="https://m-files.cdn1.cc/lpfile/6/e/6/6e6c9f51b92d65f4a5e666b63d2e920d.jpg"
              alt="Акция сентября в студии Bomond"
              loading="lazy"
            />
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
