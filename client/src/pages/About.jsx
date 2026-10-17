import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './About.css';

export default function About() {
  const { lang } = useLang();

  return (
    <main className="about-page" id="main-content">
      {/* Editorial Hero */}
      <section className="about-hero">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--color-caramel)' }}>
            {tr(t.about.heroLabel, lang)}
          </span>
          <h1 className="about-hero__title">
            {tr(t.about.heroTitle1, lang)} <em>{tr(t.about.heroTitle2, lang)}</em>
          </h1>
          <p className="about-hero__desc">
            {tr(t.about.heroDesc, lang)}
          </p>
        </div>
      </section>

      {/* Chapter 1: The Legend of Kaldi */}
      <section className="section-pad">
        <div className="container">
          <div className="story-row">
            <div className="story-visual">
              <img
                src="/images/story-roastery.jpg"
                alt="Ethiopian Coffee Roastery"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div style={{ position: 'absolute', fontSize: '6rem', color: '#fff', opacity: 0.15, pointerEvents: 'none' }}>
                ☕
              </div>
              <div className="story-quote-card">
                {tr(t.about.chap1Quote, lang)}
              </div>
            </div>

            <div className="story-text">
              <span className="section-label">{tr(t.about.chap1Label, lang)}</span>
              <h2>{tr(t.about.chap1Title, lang)}</h2>
              <p>
                {tr(t.about.chap1p1, lang)}
              </p>
              <p>
                {tr(t.about.chap1p2, lang)}
              </p>
              <p>
                {tr(t.about.chap1p3, lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 2: The Roaster's Craft */}
      <section className="section-pad" style={{ background: 'var(--color-cream-light)' }}>
        <div className="container">
          <div className="story-row story-row--reverse">
            <div className="story-visual">
              <img
                src="/images/hero-coffee.jpg"
                alt="Artisan Roasting Drum"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div style={{ position: 'absolute', fontSize: '6rem', color: '#fff', opacity: 0.15, pointerEvents: 'none' }}>
                🔥
              </div>
              <div className="story-quote-card">
                {tr(t.about.chap2Quote, lang)}
              </div>
            </div>

            <div className="story-text">
              <span className="section-label">{tr(t.about.chap2Label, lang)}</span>
              <h2>{tr(t.about.chap2Title, lang)}</h2>
              <p>
                {tr(t.about.chap2p1, lang)}
              </p>
              <p>
                {tr(t.about.chap2p2, lang)}
              </p>
              <p>
                {tr(t.about.chap2p3, lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Integrity */}
      <section className="values-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <span className="section-label">{tr(t.about.valLabel, lang)}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-espresso)' }}>
              {tr(t.about.valTitle, lang)}
            </h2>
          </div>

          <div className="values-grid">
            <div className="value-item">
              <span className="value-num">01</span>
              <h3 className="value-title">{tr(t.about.val1Title, lang)}</h3>
              <p className="value-desc">
                {tr(t.about.val1Desc, lang)}
              </p>
            </div>

            <div className="value-item">
              <span className="value-num">02</span>
              <h3 className="value-title">{tr(t.about.val2Title, lang)}</h3>
              <p className="value-desc">
                {tr(t.about.val2Desc, lang)}
              </p>
            </div>

            <div className="value-item">
              <span className="value-num">03</span>
              <h3 className="value-title">{tr(t.about.val3Title, lang)}</h3>
              <p className="value-desc">
                {tr(t.about.val3Desc, lang)}
              </p>
            </div>

            <div className="value-item">
              <span className="value-num">04</span>
              <h3 className="value-title">{tr(t.about.val4Title, lang)}</h3>
              <p className="value-desc">
                {tr(t.about.val4Desc, lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tasting Room & Roastery Visit */}
      <section className="section-pad">
        <div className="container">
          <div className="roastery-visit-banner">
            <div>
              <span className="section-label">{tr(t.about.visitLabel, lang)}</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-espresso)', marginBottom: '1rem' }}>
                {tr(t.about.visitTitle, lang)}
              </h2>
              <p style={{ color: 'var(--color-text-body)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                {tr(t.about.visitDesc, lang)}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary">
                  {tr(t.about.visitDir, lang)}
                </Link>
                <Link to="/shop" className="btn btn-outline-dark">
                  {tr(t.about.visitShop, lang)}
                </Link>
              </div>
            </div>

            <div style={{ background: 'var(--color-cream-light)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-espresso)', marginBottom: '0.75rem' }}>
                {tr(t.about.visitHours, lang)}
              </h4>
              <ul style={{ fontSize: '0.88rem', color: 'var(--color-text-body)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>{tr(t.about.visitM_F, lang)}</strong> 7:30 AM – 7:00 PM</li>
                <li><strong>{tr(t.about.visitSat, lang)}</strong> 8:00 AM – 6:30 PM</li>
                <li><strong>{tr(t.about.visitSun, lang)}</strong> 9:00 AM – 4:00 PM</li>
                <li style={{ marginTop: '0.5rem', color: 'var(--color-coffee)' }}>{tr(t.about.visitLoc, lang)}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
