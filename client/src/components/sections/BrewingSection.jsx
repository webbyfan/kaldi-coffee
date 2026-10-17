import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './BrewingSection.css';

const BREW_METHODS = {
  en: ['Pour Over', 'Aeropress', 'French Press', 'Espresso', 'Moka Pot', 'Cold Brew'],
  am: ['ፖር ኦቨር', 'ኤሮፕሬስ', 'ፈረንሳይ ፕሬስ', 'ኤስፕሬሶ', 'ሞካ ፖት', 'ቀዝቃዛ ቡና'],
};

// Coffee-themed color swatches used as image placeholders
const BREW_PALETTE = [
  { bg: '#2c1810', label: 'Espresso' },
  { bg: '#6b3d28', label: 'Pour Over' },
  { bg: '#c9945a', label: 'Caramel' },
  { bg: '#4a2c1a', label: 'French Press' },
];

export default function BrewingSection() {
  const { lang } = useLang();
  const methods = BREW_METHODS[lang] || BREW_METHODS.en;

  return (
    <section className="brewing section-pad" id="brewing" aria-labelledby="brewing-title">
      <div className="container brewing__inner">
        {/* Text */}
        <div className="brewing__text">
          <span className="section-label">{tr(t.brewing.sectionLabel, lang)}</span>
          <h2 className="brewing__heading" id="brewing-title">
            {tr(t.brewing.heading1, lang)} <em>{tr(t.brewing.heading2, lang)}</em><br />
            {tr(t.brewing.heading3, lang)}
          </h2>

          <p className="brewing__body">
            {tr(t.brewing.body, lang)}
          </p>

          <div className="brewing__methods" aria-label="Supported brewing methods">
            {methods.map((method, i) => (
              <span key={i} className="brewing__method-tag">{method}</span>
            ))}
          </div>

          <Link to="/journal?category=brewing-guides" className="btn btn-primary">
            {tr(t.brewing.explore, lang)}
          </Link>
        </div>

        {/* Image mosaic — high-resolution specialty coffee brewing photos */}
        <div className="brewing__images" role="img" aria-label="Specialty coffee brewing gallery">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
            alt="Barista executing precise pour-over coffee extraction"
            className="brewing__img brewing__img--tall"
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80"
            alt="Espresso shot pouring with thick golden crema"
            className="brewing__img brewing__img--wide"
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"
            alt="Freshly roasted specialty Ethiopian coffee beans"
            className="brewing__img brewing__img--sq"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
