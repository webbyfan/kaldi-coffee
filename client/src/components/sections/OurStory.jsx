import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { t, tr } from '../../data/translations';
import './OurStory.css';

export default function OurStory() {
  const { lang } = useLang();

  return (
    <section className="our-story section-pad" id="our-story" aria-labelledby="story-title">
      <div className="container our-story__inner">
        {/* Image column */}
        <div className="our-story__img-wrap">
          <img
            className="our-story__img-main"
            src="/images/story-roastery.jpg"
            alt="Kaldi & Co head roaster monitoring freshly roasted Ethiopian coffee at the roastery"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Text column */}
        <div className="our-story__text">
          <span className="section-label">{tr(t.ourStory.sectionLabel, lang)}</span>

          <h2 className="our-story__heading" id="story-title">
            {tr(t.ourStory.heading1, lang)}<br />
            <em>{tr(t.ourStory.heading2, lang)}</em>
          </h2>

          <p className="our-story__body">
            {tr(t.ourStory.body1, lang)}
          </p>

          <p className="our-story__body">
            {tr(t.ourStory.body2, lang)}
          </p>

          <blockquote className="our-story__quote">
            <p>{tr(t.ourStory.quote, lang)}</p>
            <cite>{tr(t.ourStory.cite, lang)}</cite>
          </blockquote>

          <div className="our-story__cta">
            <Link to="/about" className="btn btn-primary">
              {tr(t.ourStory.btnFull, lang)}
            </Link>
            <Link to="/wholesale" className="btn btn-ghost">
              {tr(t.ourStory.btnWhole, lang)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
