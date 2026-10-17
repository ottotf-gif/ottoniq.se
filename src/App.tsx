import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Process from './components/Process';
import Pricing from './components/Pricing';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import PrivacyPolicy from './components/PrivacyPolicy';
import ScanPage from './components/ScanPage';
import ScanResult from './components/ScanResult';
import ProjectPage from './components/ProjectPage';
import NotFound from './components/NotFound';
import DemoRequest from './components/DemoRequest';
import useFadeInOnScroll from './hooks/useFadeInOnScroll';

function Home() {
  useEffect(() => {
    document.title = 'Hemsida för småföretag i Stenungsund & Bohuslän | Ottoniq';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Jag bygger hemsidor åt lokala företag i Stenungsund, Tjörn, Orust och Kungälv. 3 000 kr/år – domän, hosting och ändringar ingår.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://ottoniq.se/');
  }, []);

  return (
    <main>
      <Hero />
      <Projects />
      <Pricing />
      <Process />
      <About />
      <FAQ />
      <Contact />
    </main>
  );
}

function Scan() {
  useEffect(() => {
    document.title = 'Gratis hemsideskoll | Ottoniq';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Analysera din hemsida gratis – se hur den presterar på Google, i mobilen och på säkerhet.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://ottoniq.se/scan');
  }, []);

  return <main><ScanPage /></main>;
}

function ScanResultPage() {
  useEffect(() => {
    document.title = 'Din hemsideskoll | Ottoniq';
    const robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      const m = document.createElement('meta');
      m.name = 'robots';
      m.content = 'noindex';
      document.head.appendChild(m);
    } else {
      robots.setAttribute('content', 'noindex');
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://ottoniq.se/scan');
  }, []);

  return <main><ScanResult /></main>;
}

function Demo() {
  useEffect(() => {
    document.title = 'Skicka en förfrågan | Ottoniq';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Berätta om ditt företag så hör jag av mig med ett förslag på hemsida.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://ottoniq.se/demo');
  }, []);

  return <main><DemoRequest /></main>;
}

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
  return null;
}

function AppInner() {
  useFadeInOnScroll();
  return (
    <div className="relative bg-bg min-h-screen text-text overflow-x-hidden">
      <Navbar />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/scan/:id" element={<ScanResultPage />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/integritetspolicy" element={<main><PrivacyPolicy /></main>} />
        <Route path="/privacypolicy" element={<main><PrivacyPolicy /></main>} />
        <Route path="/projekt/:slug" element={<main><ProjectPage /></main>} />
        <Route path="*" element={<main><NotFound /></main>} />
      </Routes>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
