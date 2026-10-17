import { Link } from 'react-router-dom';
import './Categories.css';

const CATEGORIES = [
  {
    id: 'single-origin',
    name: 'Single Origin',
    count: '8 coffees',
    to: '/shop?category=single-origin',
  },
  {
    id: 'signature-blend',
    name: 'Signature Blends',
    count: '4 coffees',
    to: '/shop?category=signature-blend',
  },
  {
    id: 'light-roast',
    name: 'Light Roast',
    count: '5 coffees',
    to: '/shop?roast=light',
  },
  {
    id: 'medium-roast',
    name: 'Medium Roast',
    count: '6 coffees',
    to: '/shop?roast=medium',
  },
  {
    id: 'dark-roast',
    name: 'Dark Roast',
    count: '4 coffees',
    to: '/shop?roast=dark',
  },
];

export default function Categories() {
  return (
    <section className="categories section-pad" id="categories" aria-labelledby="categories-title">
      <div className="container">
        <header className="categories__header">
          <h2 className="categories__title" id="categories-title">
            Find your perfect cup
          </h2>
        </header>

        <div className="categories__grid">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={cat.to}
              className="category-card"
              aria-label={`Browse ${cat.name} — ${cat.count}`}
            >
              <div>
                <p className="category-card__name">{cat.name}</p>
                <p className="category-card__count">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
