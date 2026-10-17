import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './Newsletter.css';

export default function Newsletter() {
  const { lang } = useLang();
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 900);
  }

  const btnText = {
    idle:    tr(t.newsletter.subscribe, lang),
    loading: lang === 'am' ? 'እየተመዘገበ…' : 'Subscribing…',
    success: lang === 'am' ? '✓ ተመዝግቧል' : '✓ Subscribed',
    error:   tr(t.newsletter.subscribe, lang),
  };

  return (
    <section className="newsletter section-pad" id="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter__inner">
        {/* Text */}
        <div className="newsletter__text">
          <span className="section-label">{tr(t.newsletter.sectionLabel, lang)}</span>
          <h2 className="newsletter__title" id="newsletter-title">
            {lang === 'am'
              ? <>{tr(t.newsletter.heading1, lang)} <em>{tr(t.newsletter.heading2, lang)}</em></>
              : <>Fresh roasts. <em>First in your inbox.</em></>
            }
          </h2>
          <p className="newsletter__desc">
            {tr(t.newsletter.body, lang)}
          </p>
        </div>

        {/* Form */}
        <div className="newsletter__form-wrap">
          <p className="newsletter__promise">
            <svg className="newsletter__promise-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 11l3 3 8-8"/>
              <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3c1.36 0 2.65.3 3.8.84"/>
            </svg>
            {tr(t.newsletter.disclaimer, lang)}
          </p>

          <form
            className="newsletter__form"
            onSubmit={handleSubmit}
            noValidate
            aria-label={lang === 'am' ? 'የኢሜል ምዝገባ ቅጽ' : 'Newsletter subscription form'}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {tr(t.newsletter.placeholder, lang)}
            </label>
            <input
              id="newsletter-email"
              type="email"
              className="newsletter__input"
              placeholder={tr(t.newsletter.placeholder, lang)}
              value={email}
              onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
              autoComplete="email"
              required
              aria-required="true"
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              className="newsletter__submit"
              disabled={status === 'loading' || status === 'success'}
            >
              {btnText[status] || btnText.idle}
            </button>
          </form>

          {status === 'success' && (
            <p className="newsletter__feedback newsletter__feedback--success" role="status" aria-live="polite">
              {lang === 'am'
                ? '✓ ተሳትፎዎ ተመዝግቧል! ወደ ካልዲ & ኩ ቤተሰብ እንኳን ደህና መጡ።'
                : '✓ You\'re on the list! Welcome to the Kaldi & Co family.'
              }
            </p>
          )}
          {status === 'error' && (
            <p className="newsletter__feedback newsletter__feedback--error" role="alert" aria-live="assertive">
              {lang === 'am' ? 'እባክዎ ትክክለኛ ኢሜል ያስገቡ።' : 'Please enter a valid email address.'}
            </p>
          )}

          <p className="newsletter__fine">
            {lang === 'am' ? 'በመመዝገብ ' : 'By subscribing you agree to our '}
            <a href="/privacy-policy" style={{ color: 'inherit', textDecoration: 'underline' }}>
              {lang === 'am' ? 'የፕራይቬሲ ፖሊሲ' : 'Privacy Policy'}
            </a>
            {lang === 'am' ? ' ይስማማሉ።' : '.'}
          </p>
        </div>
      </div>
    </section>
  );
}
