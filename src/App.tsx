import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Process from './components/Process';
import Pricing from './components/Pricing';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Marquee from './components/Marquee';
import ChatBot from './components/ChatBot';
import PrivacyPolicy from './components/PrivacyPolicy';
import SiteCheck from './components/SiteCheck';
import ScanPage from './components/ScanPage';
import useFadeInOnScroll from './hooks/useFadeInOnScroll';

function usePath() {
  const [path, setPath] = useState(window.__INITIAL_PATH__ || window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

function App() {
  useFadeInOnScroll();
  const path = usePath();

  if (path === '/privacypolicy') {
    return (
      <div key="privacy" className="relative bg-cream min-h-screen text-ink overflow-x-hidden">
        <Navbar />
        <main>
          <PrivacyPolicy />
        </main>
        <Footer />
      </div>
    );
  }

  if (path === '/scan') {
    return (
      <div key="scan" className="relative bg-cream min-h-screen text-ink overflow-x-hidden">
        <Navbar />
        <main>
          <ScanPage />
        </main>
        <Footer />
        <ChatBot />
      </div>
    );
  }

  return (
    <div key="home" className="relative bg-cream min-h-screen text-ink overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Marquee items={['Hantverk på skärmen', 'Byggd för din verksamhet', 'Designat från grunden', 'Lugnt och tydligt', 'Inga mallar']} />
        <SiteCheck />
        <About />
        <Process />
        <Pricing />
        <Portfolio />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default App;