import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Intro from './components/Intro';
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
import StyleShowcase from './components/StyleShowcase';
import NotFound from './components/NotFound';
import DemoRequest from './components/DemoRequest';
import CTA from './components/CTA';
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
      <div key="privacy" className="relative bg-bg min-h-screen text-text overflow-x-hidden">
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
      <div key="scan" className="relative bg-bg min-h-screen text-text overflow-x-hidden">
        <Navbar />
        <main>
          <ScanPage />
        </main>
        <Footer />
        <ChatBot />
      </div>
    );
  }

  if (path === '/demo') {
    return (
      <div key="demo" className="relative bg-bg min-h-screen text-text overflow-x-hidden">
        <Navbar />
        <main>
          <DemoRequest />
        </main>
        <Footer />
        <ChatBot />
      </div>
    );
  }

  if (path === '/') {
    return (
      <div key="home" className="relative bg-bg min-h-screen text-text overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <Marquee items={['Design from scratch', 'No templates', 'Built for speed', 'Local business', 'Bohuslän', 'SEO-optimized']} />
          <Intro />
          <StyleShowcase />
          <SiteCheck />
          <Process />
          <Pricing />
          <Portfolio />
          <CTA />
          <FAQ />
          <Contact />
        </main>
        <Footer />
        <ChatBot />
      </div>
    );
  }

  return (
    <div key="404" className="relative bg-bg min-h-screen text-text overflow-x-hidden">
      <Navbar />
      <main>
        <NotFound />
      </main>
      <Footer />
    </div>
  );
}

export default App;
