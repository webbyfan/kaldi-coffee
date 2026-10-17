import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './InstagramGallery.css';

// Coffee-toned color swatches to represent product/lifestyle photos
// Replace with real Instagram/product images when available
const GALLERY_ITEMS = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    alt: 'Dark roasted Ethiopian specialty coffee beans close-up'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    alt: 'Specialty Chemex coffee being poured with morning light'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    alt: 'Golden hour at Kaldi & Co roastery and espresso bar'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=600&q=80',
    alt: 'Red ripe coffee cherries harvested from Yirgacheffe farm'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    alt: 'Artisan barista pouring silky rosetta latte art'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    alt: 'Cold brew and fresh specialty pour-over over ice'
  },
];

export default function InstagramGallery() {
  const { lang } = useLang();

  return (
    <section className="gallery section-pad" id="gallery" aria-labelledby="gallery-title">
      <div className="container">
        <header className="gallery__header">
          <span className="section-label">{tr(t.gallery.sectionLabel, lang)}</span>
          <h2 className="gallery__title" id="gallery-title">{tr(t.gallery.heading, lang)}</h2>
          <p className="gallery__handle">
            {tr(t.gallery.handle, lang)}{' '}
            <a
              href="https://instagram.com/kaldiandco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Kaldi & Co on Instagram (opens in new tab)"
            >
              @kaldiandco
            </a>
          </p>
        </header>

        <div className="gallery__grid" role="list" aria-label="Instagram gallery">
          {GALLERY_ITEMS.map(item => (
            <div
              key={item.id}
              className="gallery__item"
              role="listitem"
              tabIndex={0}
              aria-label={item.alt}
            >
              {/* Real coffee photo */}
              <img
                src={item.src}
                alt={item.alt}
                className="gallery__item-img"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="gallery__item-overlay" aria-hidden="true">
                <svg className="gallery__item-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="gallery__cta">
          <a
            href="https://instagram.com/kaldiandco"
            target="_blank"
            rel="noopener noreferrer"
            className="gallery__follow-btn"
            aria-label="Follow Kaldi & Co on Instagram (opens in new tab)"
          >
            {tr(t.gallery.followBtn, lang)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
