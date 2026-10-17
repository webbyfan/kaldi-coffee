import Hero            from '../components/sections/Hero';
import BestSellers     from '../components/sections/BestSellers';
import OurStory        from '../components/sections/OurStory';
import WhyKaldi        from '../components/sections/WhyKaldi';
import BrewingSection  from '../components/sections/BrewingSection';
import WholesaleCTA    from '../components/sections/WholesaleCTA';
import InstagramGallery from '../components/sections/InstagramGallery';
import Newsletter       from '../components/sections/Newsletter';

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <BestSellers />
      <OurStory />
      <WhyKaldi />
      <BrewingSection />
      <WholesaleCTA />
      <InstagramGallery />
      <Newsletter />
    </main>
  );
}
