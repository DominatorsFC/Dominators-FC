document.addEventListener('DOMContentLoaded', () => {

  const state = {
    scroll: { y: 0, direction: 'down' },
    lightbox: { active: false, index: 0 }
  };

  const DOM = {
    navbar: document.getElementById('navbar'),
    backToTop: document.getElementById('back-to-top'),
    mobileBtn: document.getElementById('mobile-menu-btn'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('section[id]'),
    anchorLinks: document.querySelectorAll('a[href^="#"]'),
    lightbox: document.getElementById('lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxClose: document.getElementById('lightbox-close'),
    galleryImages: Array.from(document.querySelectorAll('.gallery-item img')),
    searchInput: document.getElementById('player-search'),
    playerCards: document.querySelectorAll('.player-card'),
    animatedEls: document.querySelectorAll('.card, .squad-box, .gallery-item, .counter')
  };

  const debounce = (fn, wait = 10) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  let lastScrollY = window.pageYOffset;
  const handleScrollPerformance = () => {
    const currentScrollY = window.pageYOffset;
    state.scroll.direction = currentScrollY > lastScrollY ? 'down' : 'up';
    state.scroll.y = currentScrollY;
    lastScrollY = currentScrollY;

    if (DOM.navbar) {
      DOM.navbar.classList.toggle('scrolled', currentScrollY > 50);
    }

    if (DOM.backToTop) {
      const isVisible = currentScrollY > 300;
      DOM.backToTop.classList.toggle('visible', isVisible);
      DOM.backToTop.style.opacity = isVisible ? '1' : '0';
      DOM.backToTop.style.transform = isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.9)';
      DOM.backToTop.style.pointerEvents = isVisible ? 'auto' : 'none';
    }

    updateActiveNav();
  };

  window.addEventListener('scroll', debounce(handleScrollPerformance, 8), { passive: true });
  handleScrollPerformance();

  const toggleMobileMenu = (forceState) => {
    if (!DOM.navMenu || !DOM.mobileBtn) return;
    const isOpen = forceState !== undefined ? forceState : !DOM.navMenu.classList.contains('active');
    
    DOM.navMenu.classList.toggle('active', isOpen);
    DOM.mobileBtn.setAttribute('aria-expanded', isOpen.toString());
    
    const icon = DOM.mobileBtn.querySelector('i');
    if (icon) {
      icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }

    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  if (DOM.mobileBtn) {
    DOM.mobileBtn.addEventListener('click', () => toggleMobileMenu());
  }

  DOM.navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  DOM.anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 75;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const updateActiveNav = () => {
    const scrollPosition = state.scroll.y + 120;

    DOM.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        DOM.navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${sectionId}`;
          link.classList.toggle('active', isActive);
        });
      }
    });
  };

  const renderLightbox = (index) => {
    if (!DOM.lightboxImg || DOM.galleryImages.length === 0) return;

    if (index < 0) state.lightbox.index = DOM.galleryImages.length - 1;
    else if (index >= DOM.galleryImages.length) state.lightbox.index = 0;
    else state.lightbox.index = index;

    DOM.lightboxImg.style.opacity = '0';
    DOM.lightboxImg.style.transform = 'scale(0.96)';

    setTimeout(() => {
      const currentTarget = DOM.galleryImages[state.lightbox.index];
      DOM.lightboxImg.src = currentTarget.src;
      DOM.lightboxImg.alt = currentTarget.alt || 'Gallery View';
      DOM.lightboxImg.style.opacity = '1';
      DOM.lightboxImg.style.transform = 'scale(1)';
    }, 120);
  };

  if (DOM.lightbox && DOM.lightboxImg && DOM.galleryImages.length > 0) {
    DOM.galleryImages.forEach((img, index) => {
      const parentCard = img.closest('.gallery-item');
      if (parentCard) {
        parentCard.addEventListener('click', () => {
          state.lightbox.active = true;
          renderLightbox(index);
          DOM.lightbox.style.display = 'flex';
          requestAnimationFrame(() => DOM.lightbox.classList.add('active'));
          document.body.style.overflow = 'hidden';
        });
      }
    });

    const closeLightbox = () => {
      state.lightbox.active = false;
      DOM.lightbox.classList.remove('active');
      setTimeout(() => {
        DOM.lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }, 200);
    };

    if (DOM.lightboxClose) {
      DOM.lightboxClose.addEventListener('click', closeLightbox);
    }

    DOM.lightbox.addEventListener('click', (e) => {
      if (e.target === DOM.lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!state.lightbox.active) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') renderLightbox(state.lightbox.index + 1);
      if (e.key === 'ArrowLeft') renderLightbox(state.lightbox.index - 1);
    });
  }

  const animateCounter = (element) => {
    const target = parseFloat(element.getAttribute('data-target') || '0');
    const duration = 1600;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOutCubic * target);

      element.textContent = currentVal.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(step);
  };

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');

          if (entry.target.classList.contains('counter')) {
            animateCounter(entry.target);
          }
        }, idx * 40);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  DOM.animatedEls.forEach(el => revealObserver.observe(el));

  if (DOM.searchInput && DOM.playerCards.length > 0) {
    const handleSearch = debounce((e) => {
      const query = e.target.value.toLowerCase().trim();

      DOM.playerCards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const role = card.querySelector('.title')?.textContent.toLowerCase() || '';
        const match = name.includes(query) || role.includes(query);

        card.style.display = match ? '' : 'none';
        if (match) card.classList.add('visible');
      });
    }, 150);

    DOM.searchInput.addEventListener('input', handleSearch);
  }

  const tilts = document.querySelectorAll('.card');
  tilts.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      card.style.transform = `perspective(1000px) rotateX(${-y / 25}deg) rotateY(${x / 25}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});
