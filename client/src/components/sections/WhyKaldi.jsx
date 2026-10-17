import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './WhyKaldi.css';

const FEATURES = [
  {
    id: 'direct-origin',
    titleKey: 'card1Title',
    descKey: 'card1Desc',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'elevation',
    titleKey: 'card2Title',
    descKey: 'card2Desc',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'roasted-addis',
    titleKey: 'card3Title',
    descKey: 'card3Desc',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    id: 'specialty',
    titleKey: 'card4Title',
    descKey: 'card4Desc',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
];

export default function WhyKaldi() {
  const { lang } = useLang();

  return (
    <section className="why-kaldi section-pad" id="why-kaldi" aria-labelledby="why-kaldi-title">
      <div className="container">
        <header className="why-kaldi__header">
          <span className="section-label">{tr(t.whyKaldi.sectionLabel, lang)}</span>
          <h2 className="why-kaldi__title" id="why-kaldi-title">
            {tr(t.whyKaldi.heading1, lang)} &amp; Co<br />
            <em>{tr(t.whyKaldi.heading2, lang)}</em>
          </h2>
        </header>

        <div className="why-kaldi__grid">
          {FEATURES.map(feat => (
            <article key={feat.id} className="feature-card">
              <div className="feature-card__icon">{feat.icon}</div>
              <h3 className="feature-card__title">{tr(t.whyKaldi[feat.titleKey], lang)}</h3>
              <p className="feature-card__desc">{tr(t.whyKaldi[feat.descKey], lang)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
