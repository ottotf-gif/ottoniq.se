import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useFadeInOnScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Signal that JS is running — this is what enables the hidden start state.
    // Until this class exists, all .fade-in content is fully visible (good for
    // crawlers, social bots, no-JS, and full-page screenshots).
    document.documentElement.classList.add('js-ready');

    const elements = Array.from(document.querySelectorAll('.fade-in'));

    // If IntersectionObserver isn't supported, reveal everything immediately.
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    // Safety net: reveal anything already in (or above) the viewport on load,
    // so the top of the page is never stuck invisible if the observer is slow.
    const revealInView = () => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('is-visible');
        }
      });
    };
    revealInView();

    return () => observer.disconnect();
    // Re-run on every route change so client-side navigation (e.g. opening a
    // project page) observes the new page's .fade-in elements. Without this
    // they stay at opacity:0 until a full reload.
  }, [pathname]);
}