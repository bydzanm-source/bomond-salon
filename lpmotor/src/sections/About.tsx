import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import "../styles/about.css";

export function About() {
  return (
    <section className="about-about" id="about">
      <AmbientBackdrop className="about-aurora" />
      <div className="about-wrap">
        <div className="about-text">
          <p className="about-eyebrow">Философия</p>
          <h2 className="about-title">Красота как состояние, а не процедура</h2>
          <p className="about-p">
            Bomond — небольшая студия на шоссе Энтузиастов, где вместо конвейера
            — разговор. Прежде чем взять ножницы или кисть для окрашивания,
            мастер слушает: какой образ вы носите внутри и как помочь ему выйти
            наружу.
          </p>
          <p className="about-p">
            Мы верим, что хороший колорист работает как ювелир — миллиметрами, а
            не приблизительно. Поэтому в команде пять мастеров с разным почерком
            и внимательный администратор, который держит на связи всех, и один
            общий стандарт: результат, который не нужно донашивать неделю, чтобы
            «вроде привыкла».
          </p>
          <div className="about-stats">
            <div className="about-stat about-reveal">
              <span className="about-stat-num">5.0</span>
              <span className="about-stat-label">рейтинг на Яндекс Картах</span>
            </div>
            <div className="about-stat about-reveal">
              <span className="about-stat-num">150+</span>
              <span className="about-stat-label">отзывов довольных гостей</span>
            </div>
            <div className="about-stat about-reveal">
              <span className="about-stat-num">5</span>
              <span className="about-stat-label">человек в команде студии</span>
            </div>
            <div className="about-stat about-reveal">
              <span className="about-stat-num">1</span>
              <span className="about-stat-label">адрес — Энтузиастов, 7/1</span>
            </div>
          </div>
        </div>
        <div className="about-media">
          <div className="about-photos about-reveal">
            <div className="about-photo-main">
              <img
                src="https://m-files.cdn1.cc/lpfile/8/4/5/8453c7d8acc89ed32f44b6ee354ba3c4.webp"
                width={760}
                height={1112}
                alt="Команда студии красоты Bomond в полном составе"
                loading="lazy"
              />
            </div>
            <div className="about-photo-accent">
              <img
                src="https://m-files.cdn1.cc/lpfile/b/9/6/b96675be694701a5d48bb4a59d367831.webp"
                width={480}
                height={728}
                alt="Мастера студии красоты Bomond"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="about-lineup-wrap">
        <figure className="about-figure about-reveal about-lineup-strip">
          <div className="about-lineup">
            <img
              className="about-photo"
              src="https://m-files.cdn1.cc/lpfile/8/3/3/833c352bb19f10989ab5edab9d497f14.webp"
              width={1360}
              height={906}
              alt="Команда студии красоты Bomond в полном составе"
              loading="lazy"
            />
            <a
              className="about-hot about-hot--1"
              href="#master-alena"
              aria-label="Алёна Сухарева"
            >
              <span className="about-chip">Алёна Сухарева</span>
            </a>
            <a
              className="about-hot about-hot--2"
              href="#master-varvara"
              aria-label="Варвара Лунина"
            >
              <span className="about-chip">Варвара Лунина</span>
            </a>
            <a
              className="about-hot about-hot--3"
              href="#master-tatiana"
              aria-label="Татьяна Буева"
            >
              <span className="about-chip">Татьяна Буева</span>
            </a>
            <a
              className="about-hot about-hot--4"
              href="#master-lina"
              aria-label="Лина Овчарова"
            >
              <span className="about-chip">Лина Овчарова</span>
            </a>
            <a
              className="about-hot about-hot--5"
              href="#master-polina"
              aria-label="Полина Андреева"
            >
              <span className="about-chip">Полина Андреева</span>
            </a>
            <a
              className="about-hot about-hot--6"
              href="#master-margarita"
              aria-label="Маргарита Манина"
            >
              <span className="about-chip">Маргарита Манина</span>
            </a>
          </div>
          <figcaption className="about-caption">
            Коснитесь фото или наведите курсор, чтобы найти своего мастера
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
