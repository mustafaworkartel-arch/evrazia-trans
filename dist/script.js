(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.site-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!header || !menu || !toggle) return;

  const mobile = window.matchMedia('(max-width: 800px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash));
  let menuOpen = false;
  let scrollFrame = 0;

  function setMenu(open, restoreFocus = false) {
    menuOpen = open && mobile.matches;
    toggle.setAttribute('aria-expanded', String(menuOpen));
    toggle.setAttribute('aria-label', menuOpen ? 'Закрыть меню' : 'Открыть меню');
    header.classList.toggle('is-menu-open', menuOpen);
    menu.inert = mobile.matches && !menuOpen;
    if (mobile.matches && !menuOpen) menu.setAttribute('aria-hidden', 'true');
    else menu.removeAttribute('aria-hidden');
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => {
    setMenu(!menuOpen);
    if (menuOpen) links[0]?.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });
  links.forEach((link, index) => link.addEventListener('click', () => {
    if (menuOpen) {
      setMenu(false);
      const target = sections[index];
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  }));
  header.querySelector('.brand').addEventListener('click', () => setMenu(false));

  function updateScroll() {
    scrollFrame = 0;
    const scrollY = Math.max(0, window.scrollY);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', scrollY > 32);
    header.style.setProperty('--scroll-progress', String(maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0));

    let currentIndex = -1;
    const threshold = header.offsetHeight + 100;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= threshold) currentIndex = index;
    });
    if (maxScroll > 0 && scrollY >= maxScroll - 8) currentIndex = links.length - 1;
    links.forEach((link, index) => {
      if (index === currentIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
  window.addEventListener('load', scheduleScrollUpdate, { once: true });
  mobile.addEventListener('change', () => {
    setMenu(false);
    scheduleScrollUpdate();
  });

  setMenu(false);
  document.documentElement.classList.add('js');
  updateScroll();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.fact, .company-grid > div, .section-heading, .step, .contact-grid > div').forEach(element => {
      if (element.matches('.fact, .step')) {
        const index = [...element.parentElement.children].indexOf(element);
        element.style.setProperty('--reveal-delay', `${index * 90}ms`);
      }
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
  }
})();
