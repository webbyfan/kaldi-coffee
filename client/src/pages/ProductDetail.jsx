import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GRIND_OPTIONS, WEIGHT_OPTIONS } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './ProductDetail.css';

const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Henok T. — Addis Ababa',
    rating: 5,
    date: '2 weeks ago',
    title: 'The cleanest bergamot aroma I have ever experienced',
    comment:
      'Brewed on a V60 at 93°C. The floral jasmine bloom during the first pour filled my entire kitchen. Truly exceptional roasting that honors Ethiopian heritage.',
  },
  {
    id: 2,
    name: 'Sarah M. — Specialty Cafe Owner',
    rating: 5,
    date: '1 month ago',
    title: 'Consistent roast profile every single week',
    comment:
      'We run Kaldi & Co beans through our cafe espresso machine. Our customers specifically ask when the fresh batch arrives. Delivery in Bole is always rapid.',
  },
  {
    id: 3,
    name: 'Dawit B. — Home Barista',
    rating: 5,
    date: 'Last month',
    title: 'Rich sweetness without any bitterness',
    comment:
      'The natural sweetness is remarkable. No sugar needed at all. The tasting notes on the bag are accurate to the letter.',
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { lang } = useLang();

  const { products: PRODUCTS, loading, error } = useProducts();

  // Find product by id (or slug)
  const product = useMemo(() => {
    if (!PRODUCTS.length) return null;
    return PRODUCTS.find((p) => String(p.id) === String(id) || p.slug === id) || PRODUCTS[0];
  }, [id, PRODUCTS]);

  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [selectedGrind, setSelectedGrind] = useState('Whole Bean');
  const [quantity, setQuantity] = useState(1);
  const [userReviewSubmitted, setUserReviewSubmitted] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product || !PRODUCTS.length) return [];
    return PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);
  }, [product, PRODUCTS]);

  const currentPrice = product?.prices?.[selectedWeight] || 650;

  const handleAddToCart = () => {
    addToCart(product, {
      weight: selectedWeight,
      grind: selectedGrind,
      quantity,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, {
      weight: selectedWeight,
      grind: selectedGrind,
      quantity,
    });
    navigate('/checkout');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReviewText.trim()) {
      setUserReviewSubmitted(true);
      setNewReviewText('');
    }
  };

  return (
    <main className="product-detail-page" id="main-content">
      {loading && <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem' }}>Loading product details...</div>}
      {error && <div style={{ textAlign: 'center', padding: '5rem', color: 'red' }}>Error: {error}</div>}
      {!loading && !error && product && (
      <div className="container">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumbs">
          <Link to="/">{tr(t.product.home, lang)}</Link>
          <span>/</span>
          <Link to="/shop">{tr(t.product.shopBrd, lang)}</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-espresso)', fontWeight: 500 }}>{product.name}</span>
        </nav>

        {/* Main PDP Grid */}
        <div className="pdp-main-grid">
          {/* Left Column: Media & Roast Meter */}
          <div className="pdp-gallery">
            <div
              className="pdp-main-image-wrap"
              style={{ backgroundColor: product.colorAccent || '#2c1810' }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="pdp-main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  fontSize: '6rem',
                  opacity: 0.2,
                  color: '#fff',
                  pointerEvents: 'none',
                }}
              >
                ☕
              </div>
            </div>

            {/* Roast Level Indicator */}
            <div className="pdp-roast-meter-bar">
              <span className="pdp-roast-label">
                {tr(t.product.roastProf, lang)} <strong>{product.roast}</strong>
              </span>
              <div className="pdp-roast-track">
                {[1, 2, 3, 4, 5].map((step) => (
                  <span
                    key={step}
                    className={`pdp-roast-pill ${step <= Math.round(product.roastLevel) ? 'is-active' : ''}`}
                    title={`Roast level ${step} of 5`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Buying Options & Specs */}
          <div className="pdp-info">
            <div>
              <span className="pdp-origin-tag">{product.origin} · {product.region}</span>
              <h1 className="pdp-title">{product.name}</h1>
              <p className="pdp-subtitle">{product.subtitle}</p>
            </div>

            {/* Sensory Tasting Notes */}
            <div className="pdp-tasting-chips">
              {product.tastingNotes.map((note) => (
                <span className="pdp-chip" key={note}>
                  ✦ {note}
                </span>
              ))}
            </div>

            {/* Price Row */}
            <div className="pdp-price-wrap">
              <span className="pdp-price">{tr(t.general.etb, lang)} {(currentPrice * quantity).toLocaleString()}</span>
              <span className="pdp-tax-note">{tr(t.product.incTaxes, lang)}</span>
            </div>

            {/* Bag Size Selector */}
            <div className="pdp-selector-group">
              <div className="pdp-selector-label">
                <span>{tr(t.product.selBagSize, lang)}</span>
                <span style={{ color: 'var(--color-coffee-mid)' }}>{selectedWeight}</span>
              </div>
              <div className="pdp-options-grid">
                {WEIGHT_OPTIONS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`pdp-option-btn ${selectedWeight === w ? 'is-active' : ''}`}
                    onClick={() => setSelectedWeight(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Grind Selector */}
            <div className="pdp-selector-group">
              <div className="pdp-selector-label">
                <span>{tr(t.product.selGrind, lang)}</span>
                <span style={{ color: 'var(--color-coffee-mid)' }}>{selectedGrind}</span>
              </div>
              <select
                className="pdp-grind-select"
                value={selectedGrind}
                onChange={(e) => setSelectedGrind(e.target.value)}
              >
                {GRIND_OPTIONS.map((g) => (
                  <option key={g.id} value={g.label}>
                    {g.label} — {g.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="pdp-action-row">
              <div className="pdp-qty-control">
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pdp-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="pdp-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary pdp-add-cart-btn"
                onClick={handleAddToCart}
              >
                {tr(t.product.addToCart, lang)} · {tr(t.general.etb, lang)} {(currentPrice * quantity).toLocaleString()}
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <button
              type="button"
              className="btn pdp-buy-now-btn"
              onClick={handleBuyNow}
            >
              {tr(t.product.buyNow, lang)}
            </button>

            {/* Perks Guarantee Strip */}
            <div className="pdp-perks-list">
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">✓</span>
                <span>{tr(t.product.perk1, lang)}</span>
              </div>
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">✓</span>
                <span>{tr(t.product.perk2, lang)}</span>
              </div>
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">✓</span>
                <span>{tr(t.product.perk3, lang)}</span>
              </div>
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">✓</span>
                <span>{tr(t.product.perk4, lang)}</span>
              </div>
            </div>

            {/* Coffee Story */}
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-espresso)' }}>
                {tr(t.product.aboutHarv, lang)}
              </h3>
              <p style={{ color: 'var(--color-text-body)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Specifications & Origin Details Section */}
        <section className="pdp-details-section">
          <div className="pdp-specs-grid">
            {/* Left: Origin Spec Sheet */}
            <div>
              <span className="section-label">{tr(t.product.traceLabel, lang)}</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-espresso)', marginBottom: '1.25rem' }}>
                {tr(t.product.lotSpec, lang)}
              </h2>
              <table className="pdp-specs-table">
                <tbody>
                  <tr>
                    <th>{tr(t.product.regOrig, lang)}</th>
                    <td>{product.region}, {product.origin}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.elev, lang)}</th>
                    <td>{product.altitude}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.procMeth, lang)}</th>
                    <td>{product.process}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.varietal, lang)}</th>
                    <td>{product.varietal}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.harvSeason, lang)}</th>
                    <td>{product.harvest}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.producer, lang)}</th>
                    <td>{product.producer}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.cupAcid, lang)}</th>
                    <td>{product.acidity}</td>
                  </tr>
                  <tr>
                    <th>{tr(t.product.bodyMouth, lang)}</th>
                    <td>{product.body}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Master Roaster Brewing Guide */}
            <div>
              <span className="section-label">{tr(t.product.baristaRec, lang)}</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--color-espresso)', marginBottom: '1.25rem' }}>
                {tr(t.product.howToBrew, lang)}
              </h2>
              <div className="pdp-brew-box">
                <h3 className="pdp-brew-title">{tr(t.product.recBrew, lang)} {product.brewGuide.preferredMethod}</h3>

                <div className="pdp-brew-parameters">
                  <div className="pdp-brew-param">
                    <div className="pdp-brew-param-label">{tr(t.product.coffeeDose, lang)}</div>
                    <div className="pdp-brew-param-val">{product.brewGuide.dose}</div>
                  </div>
                  <div className="pdp-brew-param">
                    <div className="pdp-brew-param-label">{tr(t.product.waterTemp, lang)}</div>
                    <div className="pdp-brew-param-val">{product.brewGuide.waterTemp}</div>
                  </div>
                  <div className="pdp-brew-param">
                    <div className="pdp-brew-param-label">{tr(t.product.grindSize, lang)}</div>
                    <div className="pdp-brew-param-val">{product.brewGuide.grind}</div>
                  </div>
                  <div className="pdp-brew-param">
                    <div className="pdp-brew-param-label">{tr(t.product.extrTime, lang)}</div>
                    <div className="pdp-brew-param-val">{product.brewGuide.brewTime}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-body)', fontStyle: 'italic', background: 'var(--color-cream-light)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  💡 <strong>{tr(t.product.roastNote, lang)}</strong> {product.brewGuide.tastingTip}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="pdp-reviews-section">
          <div className="pdp-reviews-header">
            <div>
              <span className="section-label">{tr(t.product.verifExp, lang)}</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-espresso)' }}>
                {tr(t.product.tastingRev, lang)} (4.9 / 5.0)
              </h2>
            </div>
            <a
              href="#review-form"
              className="btn btn-outline-dark"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
            >
              {tr(t.product.writeRev, lang)}
            </a>
          </div>

          <div className="pdp-reviews-grid">
            {REVIEWS_DATA.map((rev) => (
              <div className="review-card" key={rev.id}>
                <div className="review-card__stars">★★★★★</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-espresso)' }}>
                  "{rev.title}"
                </h4>
                <p className="review-card__text">{rev.comment}</p>
                <div className="review-card__author">{rev.name} · {rev.date}</div>
              </div>
            ))}
          </div>

          {/* Simple Review Submission Form */}
          <div
            id="review-form"
            style={{
              marginTop: '2.5rem',
              padding: '2rem',
              background: '#fff',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '650px',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', marginBottom: '1rem' }}>
              {tr(t.product.shareExp, lang)}
            </h3>
            {userReviewSubmitted ? (
              <div style={{ color: 'var(--color-sage)', fontWeight: 500 }}>
                {tr(t.product.revThanks, lang)}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder={tr(t.product.revNamePlac, lang)}
                  required
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  style={{
                    padding: '0.65rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
                <textarea
                  placeholder={tr(t.product.revDescPlac, lang)}
                  rows={4}
                  required
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  style={{
                    padding: '0.65rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  {tr(t.product.subRev, lang)}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* You Might Also Like / Related Coffees */}
        <section style={{ marginTop: '5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">{tr(t.product.pairSugg, lang)}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-espresso)' }}>
              {tr(t.product.moreRoast, lang)}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {relatedProducts.map((rel) => (
              <Link
                to={`/product/${rel.id}`}
                key={rel.id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div
                  style={{
                    height: '140px',
                    borderRadius: 'var(--radius-sm)',
                    background: rel.colorAccent || '#2c1810',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '2rem',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={rel.image}
                    alt={rel.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  ☕
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-coffee-light)', textTransform: 'uppercase' }}>
                  {rel.region}
                </span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-espresso)' }}>
                  {rel.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{rel.notes}</p>
                <div style={{ marginTop: 'auto', fontWeight: 600, color: 'var(--color-coffee)', fontSize: '0.9rem' }}>
                  {tr(t.product.from, lang)} {tr(t.general.etb, lang)} {rel.prices['250g'].toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      )}
    </main>
  );
}
