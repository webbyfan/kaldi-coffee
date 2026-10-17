import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Legal.css';

export default function Legal({ initialTab = 'privacy' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang();

  const TABS = [
    { id: 'privacy', path: '/privacy-policy', label: tr(t.legal.tabPrivacy, lang) },
    { id: 'terms', path: '/terms', label: tr(t.legal.tabTerms, lang) },
    { id: 'shipping', path: '/shipping-policy', label: tr(t.legal.tabShipping, lang) },
    { id: 'refund', path: '/refund-policy', label: tr(t.legal.tabRefund, lang) },
  ];

  // Determine current active tab based on route or prop
  const currentTab = (() => {
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('shipping')) return 'shipping';
    if (location.pathname.includes('refund')) return 'refund';
    return initialTab || 'privacy';
  })();

  const [activeTab, setActiveTab] = useState(currentTab);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path, { replace: true });
  };

  return (
    <main className="legal-page" id="main-content">
      <div className="container">
        <header className="legal-header">
          <span className="section-label">{tr(t.legal.heroLabel, lang)}</span>
          <h1 className="legal-title">{tr(t.legal.heroTitle, lang)}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {tr(t.legal.heroDesc, lang)}
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="legal-nav-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`legal-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => handleTabSwitch(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Policy Content */}
        <div className="legal-content-card">
          {activeTab === 'privacy' && (
            <div>
              <h2>{tr(t.legal.privacy1Title, lang)}</h2>
              <p>{tr(t.legal.privacy1Desc, lang)}</p>
              <h2>{tr(t.legal.privacy2Title, lang)}</h2>
              <p>{tr(t.legal.privacy2Desc, lang)}</p>
              <h2>{tr(t.legal.privacy3Title, lang)}</h2>
              <p>{tr(t.legal.privacy3Desc, lang)}</p>
              <h2>{tr(t.legal.privacy4Title, lang)}</h2>
              <p>{tr(t.legal.privacy4Desc, lang)}</p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h2>{tr(t.legal.terms1Title, lang)}</h2>
              <p>{tr(t.legal.terms1Desc, lang)}</p>
              <h2>{tr(t.legal.terms2Title, lang)}</h2>
              <p>{tr(t.legal.terms2Desc, lang)}</p>
              <h2>{tr(t.legal.terms3Title, lang)}</h2>
              <p>{tr(t.legal.terms3Desc, lang)}</p>
              <h2>{tr(t.legal.terms4Title, lang)}</h2>
              <p>{tr(t.legal.terms4Desc, lang)}</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div>
              <h2>{tr(t.legal.ship1Title, lang)}</h2>
              <p>{tr(t.legal.ship1Desc, lang)}</p>
              <ul>
                <li>{tr(t.legal.ship1List1, lang)}</li>
                <li>{tr(t.legal.ship1List2, lang)}</li>
                <li>{tr(t.legal.ship1List3, lang)}</li>
              </ul>
              <h2>{tr(t.legal.ship2Title, lang)}</h2>
              <p>{tr(t.legal.ship2Desc, lang)}</p>
              <h2>{tr(t.legal.ship3Title, lang)}</h2>
              <p>{tr(t.legal.ship3Desc, lang)}</p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div>
              <h2>{tr(t.legal.refund1Title, lang)}</h2>
              <p>{tr(t.legal.refund1Desc, lang)}</p>
              <h2>{tr(t.legal.refund2Title, lang)}</h2>
              <p>{tr(t.legal.refund2Desc, lang)}</p>
              <h2>{tr(t.legal.refund3Title, lang)}</h2>
              <p>{tr(t.legal.refund3Desc, lang)}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
