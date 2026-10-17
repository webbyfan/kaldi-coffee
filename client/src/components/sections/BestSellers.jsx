import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import { useProducts } from '../../hooks/useProducts';
import './BestSellers.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { lang } = useLang();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, { weight: '250g', grind: 'Whole Bean', quantity: 1 });
  };

  return (
    <article className="product-card" aria-label={`${product.name} coffee`}>
      {/* Image */}
      <div
        className="product-card__img-wrap"
        style={{ backgroundColor: product.colorAccent || '#2c1810' }}
      >
        <img
          className="product-card__img"
          src={product.image}
          alt={`${product.name} specialty coffee from ${product.region}`}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div style={{ position: 'absolute', fontSize: '3.5rem', color: '#fff', opacity: 0.25 }}>
          ☕
        </div>


        {/* Quick add overlay */}
        <div className="product-card__quick-add">
          <button
            type="button"
            className="product-card__quick-add-btn"
            onClick={handleQuickAdd}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.97-1.67L23 6H6" />
            </svg>
            {tr(t.bestSellers.addToCart, lang)}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="product-card__body">
        <span className="product-card__origin">
          {product.origin} · {product.roast} {lang === 'am' ? 'ቆሎ' : 'Roast'}
        </span>
        <h3 className="product-card__name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__notes">{product.notes}</p>

        <div className="product-card__divider" aria-hidden="true" />

        {/* Pricing */}
        <div className="product-card__pricing">
          <div className="product-card__price-row">
            <span className="product-card__weight">250g</span>
            <span className="product-card__price">
              {tr(t.bestSellers.etb, lang)} {product.prices['250g'].toLocaleString()}
            </span>
          </div>
          <div className="product-card__price-row">
            <span className="product-card__weight">1kg</span>
            <span className="product-card__price">
              {tr(t.bestSellers.etb, lang)} {product.prices['1kg'].toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="btn btn-outline-dark product-card__cta"
        >
          {lang === 'am' ? 'ምረጥ & ዘዝ' : 'Select & Order'}
        </Link>
      </div>
    </article>
  );
}

export default function BestSellers() {
  const { lang } = useLang();
  const { products: PRODUCTS, loading, error } = useProducts();
  const featuredList = PRODUCTS.slice(0, 4);

  return (
    <section className="bestsellers section-pad" id="best-sellers" aria-labelledby="bestsellers-title">
      <div className="container">
        <div className="bestsellers__header">
          <div className="bestsellers__header-text">
            <span className="section-label">{tr(t.bestSellers.sectionLabel, lang)}</span>
            <h2 className="bestsellers__title" id="bestsellers-title">
              {lang === 'am'
                ? <>ከፋብሪካው<br /><em>ተወዳጅ ቡናዎች።</em></>
                : <>Favourites from<br />the <em>roastery.</em></>
              }
            </h2>
            <p className="bestsellers__subtitle">
              {lang === 'am'
                ? 'በጥንቃቄ የተመረጡ የኢትዮጵያ ቡናዎች — ምርጥ ትኩስ ጣዕምና ባህሪ ለማቅረብ በትንሽ ቦርሳ ቆልቷቸዋል።'
                : 'Carefully selected Ethiopian coffees, roasted in small batches for maximum freshness and character.'
              }
            </p>
          </div>

          <Link to="/shop" className="bestsellers__view-all" aria-label="View all coffees in shop">
            {tr(t.bestSellers.viewAll, lang)}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
        
        {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading best sellers...</div>}
        {error && <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>}

        {!loading && !error && (
        <div className="bestsellers__grid">
          {featuredList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
