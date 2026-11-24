import { AmbientBackdrop } from "../shared/AmbientBackdrop";
import { studio } from "../content/studio";
import { team } from "../content/team";
import "../styles/team.css";

export function Team() {
  return (
    <section className="team-team" id="masters">
      <AmbientBackdrop className="team-aurora" />
      <div className="team-wrap">
        <p className="team-eyebrow">Команда</p>
        <h2 className="team-title">
          Пять мастеров. Один общий почерк совершенства
        </h2>
        <p className="team-lede">
          Каждая карточка — это человек команды, с которым можно связаться
          напрямую.
        </p>
        <div className="team-grid">
          {team.map((member) => (
            <article
              className="team-card team-reveal"
              id={member.id}
              key={member.id}
            >
              <div className="team-photo-wrap">
                <img
                  className="team-photo"
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                />
              </div>
              <div className="team-body">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
                <div className="team-actions">
                  <a
                    href={studio.booking}
                    target="_blank"
                    rel="noopener"
                    className="team-btn team-btn--primary"
                  >
                    Записаться
                  </a>
                  <a
                    href={studio.phoneHref}
                    className="team-btn team-btn--secondary"
                  >
                    Позвонить
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
