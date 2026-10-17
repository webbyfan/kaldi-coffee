import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';

export default function NotFound() {
  const { lang } = useLang();

  return (
    <main
      id="main-content"
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
        paddingTop: 'calc(var(--navbar-height) + 2rem)',
      }}
    >
      <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>☕</div>
      <span className="section-label">{tr(t.notFound.label, lang)}</span>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
          color: 'var(--color-espresso)',
          marginBottom: '1rem',
        }}
      >
        {tr(t.notFound.title, lang)}
      </h1>
      <p
        style={{
          maxWidth: '480px',
          color: 'var(--color-text-body)',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}
      >
        {tr(t.notFound.desc, lang)}
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/shop" className="btn btn-primary">
          {tr(t.notFound.exploreBtn, lang)}
        </Link>
        <Link to="/" className="btn btn-outline-dark">
          {tr(t.notFound.homeBtn, lang)}
        </Link>
      </div>
    </main>
  );
}
