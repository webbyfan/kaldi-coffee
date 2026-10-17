import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './Hero.css';

export default function Hero() {
  const { lang } = useLang();

  return (
    <section className="hero" aria-label="Hero">
      {/* Background image */}
      <div className="hero__bg">
        <img
          src="/images/hero-coffee.jpg"
          alt="Specialty coffee being brewed with a pour-over dripper at Kaldi & Co roastery"
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Overlay */}
      <div className="hero__overlay" aria-hidden="true" />

      {/* Content */}
      <div className="container hero__content">
        <p className="hero__eyebrow">
          <span className="hero__eyebrow-line" aria-hidden="true" />
          {tr(t.hero.eyebrow, lang)}
        </p>

        <h1 className="hero__headline">
          {tr(t.hero.headline1, lang)}<br />
          {lang === 'am'
            ? <>{tr(t.hero.headline2, lang)}</>
            : <>roasted with <em>intention.</em></>
          }
        </h1>

        <p className="hero__subtext">
          {tr(t.hero.subtext, lang)}
        </p>

        <div className="hero__actions">
          <Link to="/shop" className="btn btn-primary">
            {tr(t.hero.shopBtn, lang)}
          </Link>
          <Link to="/wholesale" className="btn btn-outline">
            {tr(t.hero.wholesaleBtn, lang)}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll" aria-hidden="true">
        <span>{tr(t.hero.scroll, lang)}</span>
        <span className="hero__scroll-bar" />
      </div>

      {/* Stats strip */}
      <div className="hero__stats" aria-label="Kaldi & Co key figures">
        <div className="hero__stat">
          <span className="hero__stat-number">{tr(t.hero.stat1num, lang)}</span>
          <span className="hero__stat-label">{tr(t.hero.stat1label, lang)}</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-number">{tr(t.hero.stat2num, lang)}</span>
          <span className="hero__stat-label">{tr(t.hero.stat2label, lang)}</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-number">{tr(t.hero.stat3num, lang)}</span>
          <span className="hero__stat-label">{tr(t.hero.stat3label, lang)}</span>
        </div>
        <div className="hero__stat">
          <span className="hero__stat-number">{tr(t.hero.stat4num, lang)}</span>
          <span className="hero__stat-label">{tr(t.hero.stat4label, lang)}</span>
        </div>
      </div>
    </section>
  );
}
