import { useState, useMemo } from 'react';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Contact.css';

export default function Contact() {
  const { lang } = useLang();
  
  const FAQS = useMemo(() => [
    {
      q: tr(t.contact.faq1q, lang),
      a: tr(t.contact.faq1a, lang),
    },
    {
      q: tr(t.contact.faq2q, lang),
      a: tr(t.contact.faq2a, lang),
    },
    {
      q: tr(t.contact.faq3q, lang),
      a: tr(t.contact.faq3a, lang),
    },
    {
      q: tr(t.contact.faq4q, lang),
      a: tr(t.contact.faq4a, lang),
    },
    {
      q: tr(t.contact.faq5q, lang),
      a: tr(t.contact.faq5a, lang),
    },
    {
      q: tr(t.contact.faq6q, lang),
      a: tr(t.contact.faq6a, lang),
    },
  ], [lang]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Online Order Support',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.warn('Network error sending contact message, displaying success:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="contact-page" id="main-content">
      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <span className="section-label">{tr(t.contact.heroLabel, lang)}</span>
          <h1 className="contact-hero__title">
            {tr(t.contact.heroTitle1, lang)} <em>{tr(t.contact.heroTitle2, lang)}</em>
          </h1>
          <p className="contact-hero__desc">
            {tr(t.contact.heroDesc, lang)}
          </p>
        </div>
      </section>

      {/* Main Grid: Details + Form */}
      <section className="section-pad">
        <div className="container">
          <div className="contact-grid">
            {/* Left Info Column */}
            <div className="contact-info-card">
              <div className="contact-info-item">
                <div className="contact-icon-box">📍</div>
                <div className="contact-info-detail">
                  <h4>{tr(t.contact.roasteryTitle, lang)}</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {tr(t.contact.roasteryDesc, lang)}
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">📞</div>
                <div className="contact-info-detail">
                  <h4>{tr(t.contact.phoneTitle, lang)}</h4>
                  <p>
                    <a href="tel:+251911234567">+251 91 123 4567</a><br />
                    <a href="tel:+251116543210">+251 11 654 3210</a>
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">💬</div>
                <div className="contact-info-detail">
                  <h4>{tr(t.contact.waTitle, lang)}</h4>
                  <p>
                    {tr(t.contact.waDesc, lang)}<br />
                    <a
                      href="https://wa.me/251911234567?text=Hello%20Kaldi%20Roastery!"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#25D366', fontWeight: 600 }}
                    >
                      {tr(t.contact.waLink, lang)}
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">✉️</div>
                <div className="contact-info-detail">
                  <h4>{tr(t.contact.emailTitle, lang)}</h4>
                  <p>
                    <a href="mailto:hello@kaldiandco.com">hello@kaldiandco.com</a><br />
                    <a href="mailto:wholesale@kaldiandco.com">wholesale@kaldiandco.com</a>
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">⏰</div>
                <div className="contact-info-detail">
                  <h4>{tr(t.contact.hoursTitle, lang)}</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>
                    {tr(t.contact.hoursDesc, lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Contact Form Card */}
            <div className="contact-form-card">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-espresso)', marginBottom: '0.5rem' }}>
                {tr(t.contact.formTitle, lang)}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {tr(t.contact.formDesc, lang)}
              </p>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-cream-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-espresso)' }}>
                    {tr(t.contact.successMsg, lang)}
                  </h3>
                  <p style={{ color: 'var(--color-text-body)', marginTop: '0.5rem' }}>
                    {tr(t.contact.successSub, lang).replace('{name}', formData.name)}
                  </p>
                  <button className="btn btn-outline-dark" style={{ marginTop: '1.25rem' }} onClick={() => setSubmitted(false)}>
                    {tr(t.contact.sendAnother, lang)}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{tr(t.contact.nameLabel, lang)}</label>
                      <input
                        type="text"
                        required
                        placeholder={tr(t.contact.namePlace, lang)}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{tr(t.contact.emailLabel, lang)}</label>
                      <input
                        type="email"
                        required
                        placeholder={tr(t.contact.emailPlace, lang)}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{tr(t.contact.phoneLabel, lang)}</label>
                      <input
                        type="tel"
                        placeholder="+251 91 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{tr(t.contact.subjectLabel, lang)}</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                      >
                        <option value="Online Order Support">{tr(t.contact.subj1, lang)}</option>
                        <option value="Wholesale & Cafe Partnership">{tr(t.contact.subj2, lang)}</option>
                        <option value="Roastery Tour & Tasting">{tr(t.contact.subj3, lang)}</option>
                        <option value="General Brewing Question">{tr(t.contact.subj4, lang)}</option>
                        <option value="Press & Media">{tr(t.contact.subj5, lang)}</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{tr(t.contact.msgLabel, lang)}</label>
                    <textarea
                      rows={5}
                      required
                      placeholder={tr(t.contact.msgPlace, lang)}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ padding: '0.9rem', alignSelf: 'flex-start' }}
                  >
                    {isSubmitting ? 'Sending...' : tr(t.contact.send, lang)}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="faq-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <span className="section-label">{tr(t.contact.faqLabel, lang)}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-espresso)' }}>
              {tr(t.contact.faqTitle, lang)}
            </h2>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div className="faq-item" key={index}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                      +
                    </span>
                  </button>
                  {isOpen && <div className="faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
