(function () {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============ LENIS SMOOTH SCROLL ============ */
    let lenis = null;
    if (!prefersReduced && window.Lenis) {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
        });
        (function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        })(0);
    }

    /* ============ ANCHOR SCROLL ============ */
    $$('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = -80;
            if (lenis) lenis.scrollTo(target, { offset });
            else {
                const top = target.getBoundingClientRect().top + window.scrollY + offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ============ PROGRESS BAR + HEADER + SCROLL TOP ============ */
    const header = $('#siteHeader');
    const scrollTopBtn = $('#scrollTop');
    const progressBar = $('#progressBar');
    const sections = $$('main section[id]');
    const navLinks = $$('#primaryNav a');

    function updateActiveNav() {
        const pos = window.scrollY + 140;
        let current = sections[0]?.id;
        sections.forEach((sec) => {
            if (pos >= sec.offsetTop) current = sec.id;
        });
        navLinks.forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    }

    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 20);
        scrollTopBtn.classList.toggle('show', y > 500);

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? y / docHeight : 0;
        if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

        updateActiveNav();
    }

    if (lenis) lenis.on('scroll', onScroll);
    else window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);

    scrollTopBtn?.addEventListener('click', () => {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ============ MOBILE NAV ============ */
    const nav = $('#primaryNav');
    const navToggle = $('#navToggle');
    navToggle?.addEventListener('click', () => {
        nav.classList.toggle('open');
        const isOpen = nav.classList.contains('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.innerHTML = isOpen ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    $$('#primaryNav a').forEach((a) =>
        a.addEventListener('click', () => {
            nav.classList.remove('open');
            navToggle.innerHTML = '<i class="bi bi-list"></i>';
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        })
    );

    /* ============ REVEAL (STAGGER) ============ */
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const siblings = Array.from(entry.target.parentElement.children).filter((el) =>
                        el.classList.contains('reveal')
                    );
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );
    function observeReveals() {
        $$('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));
    }

    /* ============ RENDER: EXPERIENCE ============ */
    /* ============ RENDER: EXPERIENCE ============ */
    function renderExperience() {
        const featuredWrap = $('#expFeatured');
        const listWrap = $('#expList');
        if (!featuredWrap || !listWrap) return;

        // Ubah 'find' menjadi 'filter' agar menangkap SEMUA yang featured: true
        const featuredItems = EXPERIENCES.filter((e) => e.featured);
        const others = EXPERIENCES.filter((e) => !e.featured);

        // Render semua yang featured (KPC & DEKA)
        featuredWrap.innerHTML = featuredItems.map((featured) => `
      <div class="exp-featured reveal" style="margin-bottom: 32px;">
        <div class="exp-content">
          <div class="exp-period">${featured.period}</div>
          <h3 class="exp-role">${featured.role}</h3>
          <p class="exp-company">${featured.company}</p>
          <ul class="exp-points">
            ${featured.points.map((p) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        ${featured.photo
                ? `<figure class="exp-photo">
                 <img src="${featured.photo}" alt="Dokumentasi ${featured.company}" loading="lazy" />
                 ${featured.photoCaption ? `<figcaption>${featured.photoCaption}</figcaption>` : ''}
               </figure>`
                : ''
            }
      </div>
    `).join('');

        // Render sisanya (Diskominfo) ke list biasa
        listWrap.innerHTML = others.map((e) => `
        <div class="exp-item reveal">
          <div class="exp-period">${e.period}</div>
          <div>
            <h3 class="exp-role">${e.role}</h3>
            <p class="exp-company">${e.company}</p>
            <ul class="exp-points">
              ${e.points.map((p) => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('');
    }

    /* ============ RENDER: PROJECTS ============ */
    function renderProjects() {
        const grid = $('#projectsGrid');
        if (!grid) return;

        grid.innerHTML = PROJECTS.map((p, i) => {
            const statusClass =
                p.statusType === 'online' ? 'status-online'
                    : p.statusType === 'proto' ? 'status-proto'
                        : 'status-onsite';

            const linkHTML =
                p.link && p.link !== '#'
                    ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer">
               Visit <i class="bi bi-arrow-up-right"></i>
             </a>`
                    : `<span class="confidential">Confidential</span>`;

            const featuredClass = i === 0 ? 'featured' : '';

            return `
        <article class="project-card ${featuredClass} filter-item reveal" data-category="${p.category}">
          <div class="project-thumb">
            <img src="${p.image}" alt="${p.title}" loading="lazy" />
            <span class="project-status ${statusClass}">${p.status}</span>
          </div>
          <div class="project-body">
            <div class="project-meta-top">${p.categoryLabel} · ${p.year}</div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-stack">
              ${p.stack.map((s) => `<span class="stack-chip">${s}</span>`).join('')}
            </div>
            <div class="project-footer">
              <span>${p.role}</span>
              ${linkHTML}
            </div>
          </div>
        </article>
      `;
        }).join('');
    }

    /* ============ RENDER: RESEARCH ============ */
    function renderResearch() {
        const grid = $('#researchGrid');
        if (!grid) return;

        grid.innerHTML = RESEARCH.map(
            (r) => `
        <article class="research-item reveal">
          <span class="research-badge">${r.badge}</span>
          <div class="research-content">
            <h3>${r.title}</h3>
            <p>${r.description}</p>
          </div>
          <span class="research-year">${r.year}</span>
        </article>
      `
        ).join('');
    }

    /* ============ RENDER: CERTS ============ */
    function renderCerts() {
        const grid = $('#certsGrid');
        if (!grid) return;

        grid.innerHTML = CERTIFICATIONS.map(
            (c) => `
        <div class="cert-item filter-item reveal" data-category="${c.type}">
          <a href="${c.image}" class="cert-thumb glightbox" data-gallery="certs" aria-label="Preview ${c.title}">
            <img src="${c.image}" alt="${c.title}" loading="lazy" />
          </a>
          <div class="cert-main">
            <div class="cert-title">${c.title}</div>
            <div class="cert-issuer">${c.issuer}</div>
          </div>
          <span class="cert-type">${c.type}</span>
          <span class="cert-year">${c.year}</span>
        </div>
      `
        ).join('');
    }

    /* ============ RENDER: CONTACTS ============ */
    function renderContacts() {
        const grid = $('#contactGrid');
        if (!grid) return;

        grid.innerHTML = CONTACTS.map((c) => {
            const content = `
        <div class="contact-link-info">
          <span class="contact-link-label">${c.label}</span>
          <span class="contact-link-value">${c.value}</span>
        </div>
        ${c.href ? '<i class="bi bi-arrow-up-right"></i>' : ''}
      `;
            return c.href
                ? `<a class="contact-link" href="${c.href}" target="_blank" rel="noopener noreferrer">${content}</a>`
                : `<div class="contact-link">${content}</div>`;
        }).join('');
    }

    /* ============ FILTERS ============ */
    function initFilters() {
        $$('.filter-chips').forEach((bar) => {
            const targetSelector = bar.dataset.target;
            const target = targetSelector ? $(targetSelector) : null;
            if (!target) return;

            bar.querySelectorAll('.chip').forEach((btn) => {
                btn.addEventListener('click', () => {
                    bar.querySelector('.chip.active')?.classList.remove('active');
                    btn.classList.add('active');
                    const filter = btn.dataset.filter;

                    target.querySelectorAll('.filter-item').forEach((item) => {
                        const cats = (item.dataset.category || '').split(' ');
                        const show = filter === '*' || cats.includes(filter);
                        item.classList.toggle('hidden', !show);
                    });
                });
            });
        });
    }

    /* ============ INIT ============ */
    function init() {
        renderExperience();
        renderProjects();
        renderResearch();
        renderCerts();
        renderContacts();
        initFilters();
        observeReveals();
        onScroll();

        if (window.GLightbox) GLightbox({ selector: '.glightbox' });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();