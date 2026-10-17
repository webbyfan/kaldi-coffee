import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Footer.css';

const SHOP_LINKS = [
  { labelKey: 'allCoffees',       to: '/shop' },
  { labelKey: 'singleOrigin',     to: '/shop?category=single-origin', isCategory: true },
  { labelKey: 'blends',           to: '/shop?category=signature-blend', isCategory: true },
  { labelKey: 'giftSets',         to: '/shop?category=gifts' },
];

const COMPANY_LINKS = [
  { labelKey: 'about2',      to: '/about' },
  { labelKey: 'wholesale2',  to: '/wholesale' },
  { labelKey: 'journal2',    to: '/journal' },
  { labelKey: 'contact2',    to: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy',   amLabel: 'የግላዊነት ፖሊሲ', to: '/privacy-policy' },
  { label: 'Terms',            amLabel: 'ውሎች', to: '/terms' },
  { label: 'Shipping Policy',  amLabel: 'የማጓጓዣ ፖሊሲ', to: '/shipping-policy' },
  { label: 'Refund Policy',    amLabel: 'የገንዘብ ተመላሽ ፖሊሲ', to: '/refund-policy' },
];

// Replace with actual WhatsApp number
const WHATSAPP_NUMBER = '+251900000000';
const WHATSAPP_MESSAGE = encodeURIComponent('Hello Kaldi & Co, I\'d like to learn more about your coffees.');

export default function Footer() {
  const { lang } = useLang();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer" role="contentinfo">
        <div className="footer__main">
          <div className="container footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo" aria-label="Kaldi & Co — Home">
                <span className="footer__logo-name">Kaldi &amp; Co</span>
                <span className="footer__logo-tagline">{tr(t.footer.tagline, lang)}</span>
              </Link>

              <p className="footer__desc">
                {tr(t.footer.desc, lang)}
              </p>

              {/* Social */}
              <div className="footer__social" aria-label="Social media links">
                {/* Instagram */}
                <a
                  href="https://instagram.com/kaldiandco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label="Follow Kaldi & Co on Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="https://facebook.com/kaldiandco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label="Follow Kaldi & Co on Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label="Chat with Kaldi & Co on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.122 1.524 5.855L0 24l6.335-1.521A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.723-.5-5.285-1.376l-.378-.215-3.922.941.97-3.818-.247-.393A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href="https://tiktok.com/@kaldiandco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label="Follow Kaldi & Co on TikTok"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.78a8.18 8.18 0 004.77 1.52V6.83a4.85 4.85 0 01-1-.14z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h3 className="footer__col-title">{tr(t.footer.shopTitle, lang)}</h3>
              <ul className="footer__col-links">
                {SHOP_LINKS.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="footer__col-link">
                      {link.isCategory ? tr(t.categories[link.labelKey], lang) : tr(t.footer[link.labelKey], lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="footer__col-title">{tr(t.footer.companyTitle, lang)}</h3>
              <ul className="footer__col-links">
                {COMPANY_LINKS.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="footer__col-link">
                      {tr(t.footer[link.labelKey], lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="footer__col-title">{lang === 'am' ? 'አድራሻ' : 'Contact'}</h3>
              <div>
                <div className="footer__contact-item">
                  <svg className="footer__contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>
                    {lang === 'am' ? 'አዲስ አበባ፣ ኢትዮጵያ' : 'Addis Ababa, Ethiopia'}<br />
                    [Address placeholder]
                  </span>
                </div>
                <div className="footer__contact-item">
                  <svg className="footer__contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  <a href="tel:+251900000000" className="footer__col-link">+251 900 000 000</a>
                </div>
                <div className="footer__contact-item">
                  <svg className="footer__contact-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href="mailto:hello@kaldiandco.com" className="footer__col-link">hello@kaldiandco.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider" role="separator" />

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="container footer__bottom-inner">
            <p className="footer__copyright">
              {tr(t.footer.copyright, lang).replace('2026', currentYear)}
            </p>
            <nav className="footer__legal" aria-label="Legal pages">
              {LEGAL_LINKS.map(link => (
                <Link key={link.to} to={link.to} className="footer__legal-link">
                  {lang === 'am' ? link.amLabel : link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Action Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.122 1.524 5.855L0 24l6.335-1.521A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.723-.5-5.285-1.376l-.378-.215-3.922.941.97-3.818-.247-.393A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </>
  );
}
