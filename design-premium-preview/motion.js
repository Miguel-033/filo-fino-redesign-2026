'use strict';

// Native, bounded animations. Content stays readable before enhancement and on failure.
window.FiloFinoMotion = (() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const current = new WeakMap();
  function play(element, frames, options) {
    if (!element || preference.matches || typeof element.animate !== 'function') return null;
    current.get(element)?.cancel();
    const animation = element.animate(frames, options);
    current.set(element, animation);
    active.add(animation);
    const clean = () => {
      active.delete(animation);
      if (current.get(element) === animation) current.delete(element);
    };
    animation.addEventListener('finish', clean, { once: true });
    animation.addEventListener('cancel', clean, { once: true });
    return animation;
  }
  preference.addEventListener('change', () => {
    if (preference.matches) [...active].forEach(animation => animation.cancel());
  });
  function initialise() {
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => play(line,
      [{ opacity: .45, transform: 'translateY(26px) skewY(2deg)' }, { opacity: 1, transform: 'none' }],
      { duration: 720, delay: 90 + i * 110, fill: 'backwards', easing: 'cubic-bezier(.16,.7,.2,1)' }));
    play(document.querySelector('.hero-photo'),
      [{ opacity: .45, transform: 'translateX(35px) scale(1.025)' }, { opacity: 1, transform: 'none' }],
      { duration: 1050, easing: 'cubic-bezier(.16,.7,.2,1)' });
    play(document.querySelector('.hero-actions'),
      [{ transform: 'translateY(14px)', opacity: .6 }, { transform: 'none', opacity: 1 }],
      { duration: 500, delay: 260, fill: 'backwards', easing: 'ease-out' });
    document.querySelectorAll('.hero-shortcuts a').forEach((item, i) => play(item,
      [{ transform: 'translateX(12px)', opacity: .4 }, { transform: 'none', opacity: 1 }],
      { duration: 480, delay: 340 + i * 65, fill: 'backwards', easing: 'ease-out' }));
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        section.classList.add('motion-entered');
        const heading = section.querySelector('h2');
        play(heading,
          [{ transform: 'translateY(26px) skewY(1.5deg)', opacity: .55 }, { transform: 'none', opacity: 1 }],
          { duration: 720, easing: 'cubic-bezier(.2,.65,.2,1)' });
        const images = section.querySelectorAll('.service-link, .craft-photo, .gallery-item, .process-frame, .visit-photo');
        images.forEach((image, i) => play(image,
          [{ transform: `translateY(${i % 2 ? 34 : 20}px)`, opacity: .65 }, { transform: 'none', opacity: 1 }],
          { duration: 750, delay: Math.min(i * 90, 270), fill: 'backwards', easing: 'cubic-bezier(.16,.65,.2,1)' }));
        observer.unobserve(section);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: .08 });
    document.querySelectorAll('main > section:not(.hero), .site-footer').forEach(section => observer.observe(section));
  }
  document.addEventListener('DOMContentLoaded', initialise, { once: true });
  return Object.freeze({ play });
})();
