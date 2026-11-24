import { useRef, useState } from "react";
import { navigation, studio } from "../content/studio";
import { useTheme } from "../shared/useTheme";
import "../styles/header.css";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="header-header"
      id="top"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="header-bar">
        <a href="/" className="header-logo">
          {studio.name}
        </a>
        <nav className="header-nav" aria-label="Основная навигация">
          {navigation.map(({ id, label }) => (
            <a href={`#${id}`} className="header-link" key={id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a href={studio.phoneHref} className="header-phone">
            {studio.phoneLabel}
          </a>
          <a
            href={studio.booking}
            className="header-cta"
            target="_blank"
            rel="noopener"
          >
            Записаться
          </a>
        </div>
        <div className="header-theme-wrap">
          <button
            type="button"
            className="header-theme"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Переключить тёмную тему"
            title="Светлая / тёмная тема"
            onClick={(event) => toggleTheme(event.currentTarget)}
          >
            <span className="header-star header-star--1" />
            <span className="header-star header-star--2" />
            <span className="header-star header-star--3" />
            <span className="header-cloud" />
            <span className="header-knob" />
          </button>
          <span className="header-theme-label">
            {theme === "dark" ? "Тёмная" : "Светлая"}
          </span>
        </div>
        <button
          type="button"
          className="header-burger"
          ref={menuButton}
          aria-expanded={menuOpen}
          aria-controls="bnav-panel"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="header-burger-box" aria-hidden="true">
            <span className="header-burger-line" />
            <span className="header-burger-line" />
            <span className="header-burger-line" />
          </span>
          <span className="header-sr">Меню</span>
        </button>
      </div>
      <div
        className={
          menuOpen ? "header-panel" : "header-panel header-panel--collapsed"
        }
        id="bnav-panel"
      >
        <nav className="header-panel-nav" aria-label="Мобильная навигация">
          {navigation.map(({ id, label }) => (
            <a
              href={`#${id}`}
              className="header-panel-link"
              key={id}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-panel-actions">
          <a href={studio.phoneHref} className="header-panel-phone">
            {studio.phoneLabel}
          </a>
          <a
            href={studio.booking}
            className="header-panel-cta"
            target="_blank"
            rel="noopener"
          >
            Записаться
          </a>
        </div>
      </div>
    </header>
  );
}
