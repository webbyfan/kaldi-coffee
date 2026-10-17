import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Shop.css';

export default function Shop() {
  const { lang } = useLang();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoast, setSelectedRoast] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const { products: PRODUCTS, loading, error } = useProducts();

  const CATEGORIES = useMemo(() => [
    { id: 'all', label: tr(t.shop.catAll, lang) },
    { id: 'single-origin', label: tr(t.shop.catSingle, lang) },
    { id: 'washed', label: tr(t.shop.catWashed, lang) },
    { id: 'natural', label: tr(t.shop.catNatural, lang) },
    { id: 'honey', label: tr(t.shop.catHoney, lang) },
    { id: 'blends', label: tr(t.shop.catBlends, lang) },
    { id: 'reserve', label: tr(t.shop.catReserve, lang) },
  ], [lang]);

  const ROASTS = useMemo(() => [
    tr(t.shop.roastAll, lang),
    tr(t.shop.roastLight, lang),
    tr(t.shop.roastMed, lang),
    tr(t.shop.roastDark, lang)
  ], [lang]);
  
  const mapRoastFilter = (translatedRoast) => {
    if (translatedRoast === tr(t.shop.roastAll, lang)) return 'All';
    if (translatedRoast === tr(t.shop.roastLight, lang)) return 'Light';
    if (translatedRoast === tr(t.shop.roastMed, lang)) return 'Medium';
    if (translatedRoast === tr(t.shop.roastDark, lang)) return 'Dark';
    return 'All';
  }

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory === 'single-origin' && product.badge !== 'Single Origin' && !product.subtitle.includes('Grade 1')) {
        if (!product.region.includes('Zone') && !product.region.includes('Highland')) return false;
      }
      if (selectedCategory === 'washed' && !product.process.toLowerCase().includes('washed')) {
        return false;
      }
      if (selectedCategory === 'natural' && !product.process.toLowerCase().includes('natural')) {
        return false;
      }
      if (selectedCategory === 'honey' && !product.process.toLowerCase().includes('honey')) {
        return false;
      }
      if (selectedCategory === 'blends' && !product.name.toLowerCase().includes('blend') && !product.name.toLowerCase().includes('flight')) {
        return false;
      }
      if (selectedCategory === 'reserve' && !product.badge?.toLowerCase().includes('reserve') && !product.badge?.toLowerCase().includes('gift')) {
        return false;
      }

      // Roast filter
      const internalRoast = mapRoastFilter(selectedRoast);
      if (internalRoast !== 'All') {
        if (!product.roast.toLowerCase().includes(internalRoast.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesRegion = product.region.toLowerCase().includes(query);
        const matchesNotes = product.notes.toLowerCase().includes(query);
        if (!matchesName && !matchesRegion && !matchesNotes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.prices['250g'] - b.prices['250g'];
      }
      if (sortBy === 'price-high') {
        return b.prices['250g'] - a.prices['250g'];
      }
      if (sortBy === 'roast') {
        return a.roastLevel - b.roastLevel;
      }
      return 0; // featured default
    });
  }, [selectedCategory, selectedRoast, searchQuery, sortBy, lang]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedRoast(ROASTS[0]);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <main className="shop-page" id="main-content">
      {/* Hero Header */}
      <section className="shop-hero">
        <div className="container">
          <span className="shop-hero__label">{tr(t.shop.shopHeroLabel, lang)}</span>
          <h1 className="shop-hero__title">
            {tr(t.shop.shopHeroTitle1, lang)} <em>{tr(t.shop.shopHeroTitle2, lang)}</em>
          </h1>
          <p className="shop-hero__desc">
            {tr(t.shop.shopHeroDesc, lang)}
          </p>
        </div>
      </section>

      {loading && <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem' }}>Loading products...</div>}
      {error && <div style={{ textAlign: 'center', padding: '5rem', color: 'red' }}>Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Sticky Filter Controls */}
      <section className="shop-controls" aria-label="Coffee Catalog Filters">
        <div className="container">
          <div className="shop-controls__inner">
            {/* Search */}
            <div className="shop-search">
              <svg
                className="shop-search__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="shop-search__input"
                placeholder={tr(t.shop.searchPlac, lang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills */}
            <div className="shop-filter-pills" role="tablist">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="shop-sort-wrap">
              <label htmlFor="shop-sort">{tr(t.shop.sortLabel, lang)}:</label>
              <select
                id="shop-sort"
                className="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">{tr(t.shop.sortFeatured, lang)}</option>
                <option value="price-low">{tr(t.shop.sortLow, lang)}</option>
                <option value="price-high">{tr(t.shop.sortHigh, lang)}</option>
                <option value="roast">{tr(t.shop.sortRoast, lang)}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <section className="section-pad" style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          {/* Subfilters for Roast */}
          <div className="shop-subfilters">
            <div className="roast-filter-group">
              <span>{tr(t.shop.roastLevel, lang)}</span>
              {ROASTS.map((r) => (
                <button
                  key={r}
                  className={`roast-chip ${selectedRoast === r ? 'is-active' : ''}`}
                  onClick={() => setSelectedRoast(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="shop-status-bar" style={{ flex: 1, padding: 0 }}>
              <span>
                {tr(t.shop.showing, lang).replace('{count}', filteredProducts.length)}
              </span>
              {(selectedCategory !== 'all' || selectedRoast !== ROASTS[0] || searchQuery !== '') && (
                <button className="shop-clear-btn" onClick={handleResetFilters}>
                  {tr(t.shop.resetAll, lang)}
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 1rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <p style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
                {tr(t.shop.noMatches, lang)}
              </p>
              <button className="btn btn-outline-dark" onClick={handleResetFilters}>
                {tr(t.shop.viewAllRoasts, lang)}
              </button>
            </div>
          ) : (
            <div className="shop-grid">
              {filteredProducts.map((coffee) => (
                <article className="catalog-card" key={coffee.id}>
                  {/* Media */}
                  <div
                    className="catalog-card__media"
                    style={{ backgroundColor: coffee.colorAccent || '#2c1810' }}
                  >
                    <img
                      className="catalog-card__img"
                      src={coffee.image}
                      alt={coffee.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        fontSize: '3rem',
                        opacity: 0.25,
                        color: '#fff',
                        pointerEvents: 'none',
                      }}
                    >
                      ☕
                    </div>


                    {/* Roast Indicator Dots */}
                    <div className="catalog-card__roast-meter">
                      <span>{coffee.roast}</span>
                      <div className="roast-dots">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <span
                            key={lvl}
                            className={`roast-dot ${lvl <= Math.round(coffee.roastLevel) ? 'is-filled' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="catalog-card__content">
                    <span className="catalog-card__region">{coffee.region}</span>
                    <h2 className="catalog-card__title">
                      <Link to={`/product/${coffee.id}`}>{coffee.name}</Link>
                    </h2>

                    {/* Tasting Notes */}
                    <div className="catalog-card__tags">
                      {coffee.tastingNotes.slice(0, 3).map((note) => (
                        <span className="tasting-tag" key={note}>
                          {note}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Pricing & CTAs */}
                    <div className="catalog-card__footer">
                      <div className="catalog-card__price-box">
                        <span className="catalog-card__from">{tr(t.shop.from250g, lang)}</span>
                        <span className="catalog-card__price">{tr(t.general.etb, lang)} {coffee.prices['250g'].toLocaleString()}</span>
                      </div>
                      <div className="catalog-card__cta-group">
                        <button
                          className="catalog-card__add-btn"
                          onClick={() => addToCart(coffee, { weight: '250g', grind: 'Whole Bean', quantity: 1 })}
                          aria-label={`Add 250g Whole Bean ${coffee.name} to cart`}
                        >
                          {tr(t.shop.quickAdd, lang)}
                        </button>
                        <Link to={`/product/${coffee.id}`} className="btn btn-outline-dark" style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
                          {tr(t.shop.view, lang)}
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Discovery Flight Callout Banner */}
          <div className="shop-tasting-banner">
            <div>
              <span className="section-label" style={{ color: 'var(--color-caramel)' }}>
                {tr(t.shop.flightLabel, lang)}
              </span>
              <h2 className="shop-tasting-banner__title">{tr(t.shop.flightTitle, lang)}</h2>
              <p className="shop-tasting-banner__p">
                {tr(t.shop.flightDesc, lang)}
              </p>
            </div>
            <Link to="/product/8" className="btn btn-primary" style={{ backgroundColor: 'var(--color-caramel)', color: 'var(--color-espresso)' }}>
              {tr(t.shop.flightBtn, lang)}
            </Link>
          </div>
        </div>
      </section>
        </>
      )}
    </main>
  );
}
