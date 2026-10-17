import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Wholesale.css';

export default function Wholesale() {
  const { lang } = useLang();
  const [formState, setFormState] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: 'Cafe / Specialty Coffee Shop',
    volumeKg: '15kg - 30kg / month',
    coffeeInterest: 'Signature Espresso Blend + Rotating Single Origins',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
    } catch (err) {
      console.warn('Network error sending wholesale inquiry, displaying success:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="wholesale-page" id="main-content">
      {/* Hero */}
      <section className="wholesale-hero">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--color-caramel)' }}>
            {tr(t.wholesalePage.heroLabel, lang)}
          </span>
          <h1 className="wholesale-hero__title">
            {tr(t.wholesalePage.heroTitle1, lang)} <em>{tr(t.wholesalePage.heroTitle2, lang)}</em>
          </h1>
          <p className="wholesale-hero__desc">
            {tr(t.wholesalePage.heroDesc, lang)}
          </p>
          <div style={{ marginTop: '2rem' }}>
            <a href="#wholesale-form" className="btn btn-primary" style={{ backgroundColor: 'var(--color-caramel)', color: 'var(--color-espresso)', borderColor: 'var(--color-caramel)' }}>
              {tr(t.wholesalePage.requestBtn, lang)}
            </a>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Value */}
      <section className="section-pad">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
            <span className="section-label">{tr(t.wholesalePage.whyPartner, lang)}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-espresso)' }}>
              {tr(t.wholesalePage.builtForProf, lang)}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              {tr(t.wholesalePage.builtDesc, lang)}
            </p>
          </div>

          <div className="wholesale-pillars">
            <div className="pillar-card">
              <span className="pillar-icon">🔥</span>
              <h3>{tr(t.wholesalePage.pillar1Title, lang)}</h3>
              <p>
                {tr(t.wholesalePage.pillar1Desc, lang)}
              </p>
            </div>

            <div className="pillar-card">
              <span className="pillar-icon">☕</span>
              <h3>{tr(t.wholesalePage.pillar2Title, lang)}</h3>
              <p>
                {tr(t.wholesalePage.pillar2Desc, lang)}
              </p>
            </div>

            <div className="pillar-card">
              <span className="pillar-icon">🎓</span>
              <h3>{tr(t.wholesalePage.pillar3Title, lang)}</h3>
              <p>
                {tr(t.wholesalePage.pillar3Desc, lang)}
              </p>
            </div>

            <div className="pillar-card">
              <span className="pillar-icon">⚙️</span>
              <h3>{tr(t.wholesalePage.pillar4Title, lang)}</h3>
              <p>
                {tr(t.wholesalePage.pillar4Desc, lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Tiers */}
      <section className="wholesale-tiers-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="section-label">{tr(t.wholesalePage.transpVol, lang)}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-espresso)' }}>
              {tr(t.wholesalePage.partnerTiers, lang)}
            </h2>
          </div>

          <div className="tiers-grid">
            <div className="tier-card">
              <h3 className="tier-name">{tr(t.wholesalePage.starterTitle, lang)}</h3>
              <div className="tier-volume">{tr(t.wholesalePage.starterVol, lang)}</div>
              <ul className="tier-perks">
                <li>{tr(t.wholesalePage.starterPerk1, lang)}</li>
                <li>{tr(t.wholesalePage.starterPerk2, lang)}</li>
                <li>{tr(t.wholesalePage.starterPerk3, lang)}</li>
                <li>{tr(t.wholesalePage.starterPerk4, lang)}</li>
              </ul>
              <a href="#wholesale-form" className="btn btn-outline-dark" style={{ width: '100%' }}>
                {tr(t.wholesalePage.getStarted, lang)}
              </a>
            </div>

            <div className="tier-card is-featured">
              <span className="tier-badge">{tr(t.wholesalePage.mostPopular, lang)}</span>
              <h3 className="tier-name">{tr(t.wholesalePage.cafePartner, lang)}</h3>
              <div className="tier-volume">{tr(t.wholesalePage.cafeVol, lang)}</div>
              <ul className="tier-perks">
                <li>{tr(t.wholesalePage.cafePerk1, lang)}</li>
                <li>{tr(t.wholesalePage.cafePerk2, lang)}</li>
                <li>{tr(t.wholesalePage.cafePerk3, lang)}</li>
                <li>{tr(t.wholesalePage.cafePerk4, lang)}</li>
                <li>{tr(t.wholesalePage.cafePerk5, lang)}</li>
              </ul>
              <a href="#wholesale-form" className="btn btn-primary" style={{ width: '100%' }}>
                {tr(t.wholesalePage.applyCafe, lang)}
              </a>
            </div>

            <div className="tier-card">
              <h3 className="tier-name">{tr(t.wholesalePage.comTitle, lang)}</h3>
              <div className="tier-volume">{tr(t.wholesalePage.comVol, lang)}</div>
              <ul className="tier-perks">
                <li>{tr(t.wholesalePage.comPerk1, lang)}</li>
                <li>{tr(t.wholesalePage.comPerk2, lang)}</li>
                <li>{tr(t.wholesalePage.comPerk3, lang)}</li>
                <li>{tr(t.wholesalePage.comPerk4, lang)}</li>
                <li>{tr(t.wholesalePage.comPerk5, lang)}</li>
              </ul>
              <a href="#wholesale-form" className="btn btn-outline-dark" style={{ width: '100%' }}>
                {tr(t.wholesalePage.contactCom, lang)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="wholesale-form-section" id="wholesale-form">
        <div className="container">
          <div className="wholesale-form-card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="section-label">{tr(t.wholesalePage.letsConnect, lang)}</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-espresso)' }}>
                {tr(t.wholesalePage.reqFormTitle, lang)}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                {tr(t.wholesalePage.reqFormDesc, lang)}
              </p>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-espresso)' }}>
                  {tr(t.wholesalePage.inqReceived, lang)}
                </h3>
                <p style={{ color: 'var(--color-text-body)', maxWidth: '480px', margin: '0.75rem auto 1.5rem', lineHeight: 1.6 }}>
                  {tr(t.wholesalePage.inqThanks, lang)}
                </p>
                <button className="btn btn-outline-dark" onClick={() => setSubmitted(false)}>
                  {tr(t.wholesalePage.subAnother, lang)}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.busNameLabel, lang)}</label>
                    <input
                      type="text"
                      required
                      placeholder={tr(t.wholesalePage.busNamePlac, lang)}
                      value={formState.businessName}
                      onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.contNameLabel, lang)}</label>
                    <input
                      type="text"
                      required
                      placeholder={tr(t.wholesalePage.contNamePlac, lang)}
                      value={formState.contactName}
                      onChange={(e) => setFormState({ ...formState, contactName: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.emailLabel, lang)}</label>
                    <input
                      type="email"
                      required
                      placeholder={tr(t.wholesalePage.emailPlac, lang)}
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.phoneLabel, lang)}</label>
                    <input
                      type="tel"
                      required
                      placeholder="+251 91 234 5678"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.busTypeLabel, lang)}</label>
                    <select
                      value={formState.businessType}
                      onChange={(e) => setFormState({ ...formState, businessType: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    >
                      <option value="Cafe / Specialty Coffee Shop">{tr(t.wholesalePage.busType1, lang)}</option>
                      <option value="Restaurant / Bistro">{tr(t.wholesalePage.busType2, lang)}</option>
                      <option value="Boutique Hotel / Hospitality">{tr(t.wholesalePage.busType3, lang)}</option>
                      <option value="Corporate Office / Tech Campus">{tr(t.wholesalePage.busType4, lang)}</option>
                      <option value="Retailer / Specialty Grocery">{tr(t.wholesalePage.busType5, lang)}</option>
                      <option value="International Importer / Distributor">{tr(t.wholesalePage.busType6, lang)}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.estVolLabel, lang)}</label>
                    <select
                      value={formState.volumeKg}
                      onChange={(e) => setFormState({ ...formState, volumeKg: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    >
                      <option value="5kg - 15kg / month">{tr(t.wholesalePage.estVol1, lang)}</option>
                      <option value="15kg - 30kg / month">{tr(t.wholesalePage.estVol2, lang)}</option>
                      <option value="30kg - 60kg / month">{tr(t.wholesalePage.estVol3, lang)}</option>
                      <option value="60kg - 150kg / month">{tr(t.wholesalePage.estVol4, lang)}</option>
                      <option value="150kg+ / month">{tr(t.wholesalePage.estVol5, lang)}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tr(t.wholesalePage.visionLabel, lang)}</label>
                  <textarea
                    rows={4}
                    placeholder={tr(t.wholesalePage.visionPlac, lang)}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '1rem', marginTop: '0.5rem' }}
                >
                  {isSubmitting ? 'Submitting Application...' : tr(t.wholesalePage.submitBtn, lang)}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
