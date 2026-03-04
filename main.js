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

      document.querySelectorAll('a, button, .inprint-slot').forEach(el => {
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
