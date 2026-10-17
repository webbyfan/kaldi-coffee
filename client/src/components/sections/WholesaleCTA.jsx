import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './WholesaleCTA.css';

const PERKS_KEYS = ['perk1', 'perk2', 'perk3', 'perk4'];

export default function WholesaleCTA() {
  const { lang } = useLang();

  return (
    <section className="wholesale-cta section-pad" id="wholesale" aria-labelledby="wholesale-title">
      <div className="container wholesale-cta__inner">
        {/* Main text */}
        <div>
          <span className="section-label wholesale-cta__label">
            {tr(t.wholesale.sectionLabel, lang)}
          </span>
          <h2 className="wholesale-cta__title" id="wholesale-title">
            {tr(t.wholesale.heading1, lang)}<br />
            <em>{tr(t.wholesale.heading2, lang)}</em>
          </h2>

          <p className="wholesale-cta__desc">
            {tr(t.wholesale.desc, lang)}
          </p>

          <ul className="wholesale-cta__perks" aria-label="Wholesale benefits">
            {PERKS_KEYS.map((key) => (
              <li key={key} className="wholesale-cta__perk">
                <span className="wholesale-cta__perk-dot" aria-hidden="true" />
                {tr(t.wholesale[key], lang)}
              </li>
            ))}
          </ul>

          <div className="wholesale-cta__actions">
            <Link to="/wholesale" className="btn btn-primary">
              {tr(t.wholesale.btnPrimary, lang)}
            </Link>
            <Link to="/contact" className="btn btn-outline">
              {lang === 'am' ? 'አድራሻ' : 'Get in Touch'}
            </Link>
          </div>
        </div>

        {/* Decorative right side */}
        <div className="wholesale-cta__deco" aria-hidden="true">
          <span className="wholesale-cta__deco-number">B2B</span>
          <span className="wholesale-cta__deco-text">
            {tr(t.wholesale.decoLabel, lang)}
          </span>
        </div>
      </div>
    </section>
  );
}
