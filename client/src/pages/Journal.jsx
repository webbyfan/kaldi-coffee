import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Journal.css';

const ARTICLES = [
  {
    id: 1,
    title: 'The Sacred Three Rounds: Abol, Tona, & Baraka in the Ethiopian Ceremony',
    category: 'Heritage & Culture',
    readTime: '6 min read',
    date: 'February 2026',
    author: 'Samrawit Girma',
    image: '/images/hero-coffee.jpg',
    excerpt:
      'In Ethiopia, coffee is never consumed in haste. Discover the spiritual and social choreography behind the three pours of the traditional clay Jebena pot.',
    content: `
      In Ethiopian homes, coffee is an invocation of blessing and an anchor of community life. Known colloquially as 'Buna Tetu' (Come drink coffee), the ritual can span hours of conversation, frankincense aroma, and freshly popped corn (fendisha).

      The ceremony centers on three successive brews from the same roasted grounds inside a handmade earthenware Jebena:

      1. Abol (The First Round): The strongest, richest extraction. Poured from a height into small handleless ceramic cups (Cini). This cup is reserved for contemplation, elder blessings, and deep conversation.
      2. Tona (The Second Round): Fresh boiling water is added to the Jebena and brought to a rolling simmer over charcoal embers. Lighter in body, this round invites lively storytelling and family sharing.
      3. Baraka (The Blessing): The third and final cup. Drinking the Baraka seals good fortune, peace, and mutual goodwill over the household before guests depart.

      When you brew our single-origin Ethiopian beans at home, you participate in an unbroken lineage of communal warmth that dates back more than ten centuries.
    `,
  },
  {
    id: 2,
    title: 'Dialing in Ethiopian Yirgacheffe on V60: Flow Rate & Agitation',
    category: 'Brewing Guides',
    readTime: '5 min read',
    date: 'January 2026',
    author: 'Ephraim Mengistu, Head Barista',
    image: '/images/product-yirgacheffe.jpg',
    excerpt:
      'High-altitude washed Ethiopian coffees are dense and packed with delicate floral volatiles. Here is our master recipe to preserve jasmine sweetness without astringency.',
    content: `
      Washed coffees from Gedeb and Chelchele in Yirgacheffe boast delicate jasmine, bergamot, and white peach notes that can easily be overwhelmed if over-extracted or channeled.

      Our Standard Dial-In Parameters:
      • Dose: 16g coffee
      • Water: 250g filtered water at 93°C (90-120 PPM hardness)
      • Ratio: 1:15.6
      • Grind: Medium-fine (similar to sea salt)
      • Total Brew Time: 2:45 to 3:00 minutes

      The 4-Pour Technique:
      1. The Bloom (0:00 - 0:45): Pour 50g of water in gentle concentric circles. Swirl lightly once. Watch the fresh CO2 gases escape as the coffee expands.
      2. First Extension (0:45 - 1:15): Pour slowly up to 120g. Maintain a gentle laminar flow to avoid disturbing the filter paper bed.
      3. Second Extension (1:15 - 1:45): Pour up to 190g with slightly higher flow to create gentle agitation.
      4. Final Pour (1:45 - 2:15): Pour gently in the center up to 250g. Give one gentle swirl to ensure a flat, even coffee bed during drawdown.

      Result: A crystal-clear, tea-like cup with shimmering citrus brightness and lingering honeyed floral perfume.
    `,
  },
  {
    id: 3,
    title: 'Washed vs. Natural Anaerobic: The Alchemy of Ethiopian Processing',
    category: 'Origins & Science',
    readTime: '7 min read',
    date: 'December 2025',
    author: 'Kaleb Tadesse, Q-Grader',
    image: '/images/product-sidamo.jpg',
    excerpt:
      'Why does Sidama taste like blueberry pie while Yirgacheffe tastes like Earl Grey tea? Unpacking how processing transforms identical heirloom cherries.',
    content: `
      The secret behind the staggering spectrum of Ethiopian coffee profiles lies in how the freshly harvested cherry is processed within hours of picking.

      The Washed (Wet) Process:
      Cherries are pulped immediately to strip the skin and mucilage before fermenting in pristine spring water tanks for 24-36 hours. The beans are thoroughly washed through canals and dried slowly on raised African bamboo beds.
      • Cup Character: Exceptional clarity, sparkling citric acidity, delicate jasmine florality, and elegant tea-like body.

      The Natural (Sun-Dried) Process:
      Ripe cherries are dried whole with skin and sweet fruit pulp intact under the highland sun for 21 to 28 days. As the fruit slowly dehydrates, sugars and wild yeasts ferment into the seed.
      • Cup Character: Heavy jammy body, explosive blueberry and strawberry sweetness, winey complexity, and rich dark cocoa undertones.

      At Kaldi & Co, we roast each processing method with unique thermal curves to accentuate these natural flavor molecules without imparting roasty bitterness.
    `,
  },
  {
    id: 4,
    title: 'Why Water Chemistry Accounts for 98% of Your Cup Quality',
    category: 'Barista Craft',
    readTime: '4 min read',
    date: 'November 2025',
    author: 'Kaldi Roastery Lab',
    image: '/images/product-guji.jpg',
    excerpt:
      'If your specialty coffee tastes flat, chalky, or sour at home, the problem might not be your beans—it is likely your tap water.',
    content: `
      A brewed cup of filter coffee is roughly 98.6% water. If the water lacks the correct mineral balance, it cannot bind to the delicate flavor compounds inside the coffee grounds.

      Key Minerals in Coffee Extraction:
      • Magnesium (Mg2+): Strongly binds to oxygen-rich aroma compounds like fruity esters and floral notes.
      • Calcium (Ca2+): Accentuates heavier creamy body and chocolate notes, but too much leads to chalky scale.
      • Buffer / Alkalinity: Keeps acidity in balance. Too much buffer neutralizes the lively fruit acidity of Ethiopian coffees, making them taste dull and flat.

      Recommendation: Use filtered water or remineralized mineral water (TDS around 100-150 PPM) to taste the vibrant sweetness Kaldi & Co roasters intended.
    `,
  },
];

const CATEGORIES = ['All', 'Heritage & Culture', 'Brewing Guides', 'Origins & Science', 'Barista Craft'];

export default function Journal() {
  const { lang } = useLang();
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const filtered = selectedCat === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCat);

  return (
    <main className="journal-page" id="main-content">


      <div className="container" style={{ paddingTop: '3.5rem' }}>
        {/* Featured Article Banner */}
        <article className="journal-featured" onClick={() => setActiveArticle(ARTICLES[0])}>
          <div className="journal-featured__img-box">
            <img
              src={ARTICLES[0].image}
              alt={ARTICLES[0].title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{ position: 'absolute', fontSize: '5rem', color: '#fff', opacity: 0.2 }}>☕</div>
          </div>
          <div className="journal-featured__content">
            <div className="journal-meta">{tr(t.journal.featHeritage, lang)} · {ARTICLES[0].readTime}</div>
            <h2 className="journal-featured__title">{ARTICLES[0].title}</h2>
            <p className="journal-featured__excerpt">{ARTICLES[0].excerpt}</p>
            <span style={{ color: 'var(--color-coffee)', fontWeight: 600, fontSize: '0.88rem' }}>
              {tr(t.journal.readFull, lang)}
            </span>
          </div>
        </article>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${selectedCat === cat ? 'is-active' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="journal-grid">
          {filtered.map((article) => (
            <article
              key={article.id}
              className="article-card"
              onClick={() => setActiveArticle(article)}
            >
              <div className="article-card__img-box">
                <img
                  src={article.image}
                  alt={article.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div style={{ position: 'absolute', fontSize: '3rem', color: '#fff', opacity: 0.2 }}>☕</div>
              </div>
              <div className="article-card__content">
                <div className="journal-meta">{article.category} · {article.readTime}</div>
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__excerpt">{article.excerpt}</p>
                <div className="article-card__footer">
                  <span>{tr(t.journal.by, lang)} {article.author}</span>
                  <span>{tr(t.journal.readStory, lang)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full Article Modal Reader */}
      {activeArticle && (
        <div className="article-modal-overlay" onClick={() => setActiveArticle(null)}>
          <div
            className="article-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="article-modal-close"
              onClick={() => setActiveArticle(null)}
              aria-label="Close article"
            >
              &times;
            </button>
            <div className="journal-meta" style={{ marginBottom: '0.5rem' }}>
              {activeArticle.category} · {activeArticle.readTime} · {activeArticle.date}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-espresso)', marginBottom: '1rem', lineHeight: 1.25 }}>
              {activeArticle.title}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-light)' }}>
              {tr(t.journal.writtenBy, lang)} <strong>{activeArticle.author}</strong> — Kaldi &amp; Co Specialty Roasters
            </div>
            <div
              style={{
                fontSize: '1rem',
                lineHeight: 1.85,
                color: 'var(--color-text-body)',
                whiteSpace: 'pre-line',
              }}
            >
              {activeArticle.content}
            </div>
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                {tr(t.journal.freshBeans, lang)}
              </span>
              <button className="btn btn-primary" onClick={() => setActiveArticle(null)}>
                {tr(t.journal.doneReading, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
