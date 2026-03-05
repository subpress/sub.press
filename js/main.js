    // Custom cursor
    const cursor = document.getElementById('cursor');
    if (window.matchMedia('(pointer: fine)').matches) {
      cursor.classList.add('active');

      // Dark sections where cursor should be yellow
      const darkSections = ['manifesto', 'inprint', 'contact'];

      function updateCursorTheme(x, y) {
        let onDark = false;
        for (const id of darkSections) {
          const el = document.getElementById(id);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) {
            onDark = true; break;
          }
        }
        // Also yellow inside mobile menu (black bg)
        const menu = document.getElementById('mobileMenu');
        if (menu && menu.classList.contains('open')) onDark = true;
        cursor.classList.toggle('on-dark', onDark);
      }

      document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top  = e.clientY + 'px';
        updateCursorTheme(e.clientX, e.clientY);
      });

      document.querySelectorAll('a, button, .pile-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('large'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('large'));
      });
    }

    // Mobile menu
    const menuOpenBtn = document.getElementById('menuOpen');
    const menuCloseBtn = document.getElementById('menuClose');
    const mobileMenu  = document.getElementById('mobileMenu');
    function openMenu() {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      menuOpenBtn.setAttribute('aria-expanded', 'true');
      const first = mobileMenu.querySelector('button, a');
      if (first) first.focus();
    }
    function closeMenu() {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      menuOpenBtn.setAttribute('aria-expanded', 'false');
      menuOpenBtn.focus();
    }
    menuOpenBtn.addEventListener('click', openMenu);
    menuCloseBtn.addEventListener('click', closeMenu);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });

    // Scroll reveals
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    } else {
      const ro = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
    }

    // ── Pile gallery ──────────────────────────────────
    const pile    = document.getElementById('pile');
    if (pile) {
      const cards   = Array.from(pile.querySelectorAll('.pile-card'));
      const counter = document.getElementById('pile-current');
      const caption = document.querySelector('.pile-caption-text');
      const total   = document.getElementById('pile-total');
      if (total) total.textContent = cards.length;

      let current   = 0;
      let animating = false;

      function updatePositions() {
        cards.forEach((card, i) => {
          const pos = ((i - current) % cards.length + cards.length) % cards.length;
          card.setAttribute('data-pos', Math.min(pos, 5));
        });
        if (counter) counter.textContent = current + 1;
        const label = cards[current].dataset.label || '';
        if (caption) {
          caption.classList.add('fading');
          setTimeout(() => {
            caption.textContent = label;
            caption.classList.remove('fading');
          }, 150);
        }
      }

      function advance() {
        if (animating) return;
        animating = true;
        const frontCard = cards[current];
        frontCard.classList.add('exiting');
        setTimeout(() => {
          frontCard.style.transition = 'none';
          frontCard.classList.remove('exiting');
          current = (current + 1) % cards.length;
          updatePositions();
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              frontCard.style.transition = '';
              animating = false;
            });
          });
        }, 450);
      }

      pile.addEventListener('click', advance);
      const nextBtn = document.getElementById('pile-next');
      if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); advance(); });
      pile.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); advance(); }
      });

      updatePositions();
    }
