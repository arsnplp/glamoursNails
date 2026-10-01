/* =========================================================
   GLAMOUR NAILS — Animations & interactions
   GSAP + ScrollTrigger + SplitText + Observer, défilement Lenis
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!window.gsap;

  const annee = $('[data-year]');
  if (annee) annee.textContent = new Date().getFullYear();

  // Sans GSAP (CDN bloqué), le site reste lisible : on retire juste le loader.
  if (!hasGsap) {
    document.body.classList.remove('is-loading');
    $('.loader')?.remove();
    initTabs(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, Observer);

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (window.Lenis && !reduit) {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const allerA = (cible) => {
    if (lenis) lenis.scrollTo(cible, { offset: 0, duration: 1.4 });
    else cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth' });
  };

  /* ---------- Menu mobile ---------- */
  const burger = $('[data-burger]');
  const mmenu = $('[data-mmenu]');
  const fermerMenu = () => {
    if (!mmenu.classList.contains('is-open')) return;
    mmenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    if (lenis) lenis.start();
    setTimeout(() => { mmenu.hidden = true; }, 800);
  };
  burger.addEventListener('click', () => {
    if (mmenu.classList.contains('is-open')) return fermerMenu();
    mmenu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => mmenu.classList.add('is-open')));
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    if (lenis) lenis.stop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(); });

  /* ---------- Ancres ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      const cible = $(id);
      if (!cible) return;
      e.preventDefault();
      fermerMenu();
      if (a.dataset.tabLink) choisirOnglet?.(a.dataset.tabLink);
      allerA(cible);
    });
  });

  /* ---------- Onglets tarifs ---------- */
  let choisirOnglet = null;
  initTabs((fn) => { choisirOnglet = fn; });

  /* ---------- Boutons : lettres qui roulent ---------- */
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    $$('[data-roll]').forEach((t) => {
      const s = new SplitText(t, { type: 'chars', charsClass: 'char' });
      s.chars.forEach((c, i) => { c.style.transitionDelay = i * 0.014 + 's'; });
    });
  });

  /* ---------- Boutons magnétiques ---------- */
  if (pointeurFin && !reduit) {
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' });
      });
    });
  }

  /* ---------- Curseur ---------- */
  if (pointeurFin && !reduit) {
    const cur = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12 });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => { cur.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    $$('a, button, summary').forEach((el) => {
      el.addEventListener('pointerenter', () => cur.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cur.classList.remove('is-hover'));
    });
    $$('[data-stack], .fan__stage').forEach((el) => {
      el.addEventListener('pointerenter', () => { label.textContent = 'Glisser'; cur.classList.add('is-drag'); });
      el.addEventListener('pointerleave', () => cur.classList.remove('is-drag'));
    });
  }

  /* ---------- Header ---------- */
  const header = $('[data-header]');
  const mbar = $('[data-mbar]');
  const wa = $('.wa-float');
  let dernierY = window.scrollY;
  const majHeader = () => {
    const y = window.scrollY;
    const descend = y > dernierY + 2;
    const monte = y < dernierY - 2;
    header.classList.toggle('is-solid', y > 40);
    if (descend && y > 400 && !mmenu.classList.contains('is-open')) header.classList.add('is-hidden');
    else if (monte || y <= 400) header.classList.remove('is-hidden');
    const loin = y > window.innerHeight * 0.6;
    mbar?.classList.toggle('is-visible', loin);
    wa?.classList.toggle('is-visible', loin);
    dernierY = y;
  };
  window.addEventListener('scroll', majHeader, { passive: true });
  majHeader();

  // Lien actif dans la navigation (créé après la section épinglée, voir demarrer)
  const liens = $$('.nav a');
  const initLienActif = () => liens.forEach((l) => {
    const sec = $(l.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (s) => { if (s.isActive) { liens.forEach((x) => x.classList.remove('is-active')); l.classList.add('is-active'); } else l.classList.remove('is-active'); },
    });
  });

  /* ---------- Barre de progression ---------- */
  gsap.to('.progress__bar', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
  });

  /* ---------- Ruban : vitesse liée au scroll ---------- */
  (() => {
    const rows = $$('.ribbon__row');
    if (!rows.length) return;
    const boucle = gsap.to(rows, { xPercent: -100, duration: 28, ease: 'none', repeat: -1 });
    if (reduit) { boucle.pause(); return; }
    const allure = { v: 1 };
    let sens = 1;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        sens = self.direction;
        const elan = gsap.utils.clamp(1, 7, 1 + Math.abs(self.getVelocity()) / 350);
        gsap.timeline({ onUpdate: () => boucle.timeScale(allure.v) })
          .to(allure, { v: elan * sens, duration: 0.15, overwrite: true })
          .to(allure, { v: sens, duration: 1.2, ease: 'power2.out' });
      },
    });
  })();

  /* ---------- FAQ : ouverture animée ---------- */
  $$('.acc__item').forEach((item) => {
    const sum = $('summary', item);
    const body = $('.acc__body', item);
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.open) {
        gsap.to(body, { height: 0, duration: 0.5, ease: 'power3.inOut', onComplete: () => { item.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        $$('.acc__item[open]').forEach((o) => o !== item && $('summary', o).click());
        item.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
        gsap.from($('p', body), { y: 14, autoAlpha: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 });
      }
    });
  });

  /* ---------- Lien mentions légales (à brancher) ---------- */
  $('[data-legal]')?.addEventListener('click', (e) => e.preventDefault());

  /* ---------- Éventail & pile ---------- */
  initFan();

  /* ---------- Loader puis entrée du hero ---------- */
  const heroLignes = $('[data-hero-lines]');
  let heroSplit = null;
  const entreeHero = () => {
    const tl = gsap.timeline();
    if (!reduit) {
      heroSplit = new SplitText(heroLignes, { type: 'lines,chars', mask: 'lines', linesClass: 'line' });
      tl.from('.hero__img', { scale: 1.25, duration: 2.2, ease: 'expo.out' }, 0)
        .from(heroSplit.lines, { yPercent: 120, duration: 1.3, stagger: 0.12, ease: 'expo.out' }, 0.15)
        .from('[data-hero-fade]', { y: 26, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0.55)
        .from('.header__pill', { y: -30, autoAlpha: 0, duration: 1, ease: 'power3.out' }, 0.4);
    }
    return tl;
  };

  const demarrer = () => {
    document.body.classList.remove('is-loading');
    if (lenis) lenis.start();
    initScrollFx();
    // Ces déclencheurs viennent après l'épinglage pour tenir compte de son espace
    initStack();
    initLienActif();
    ScrollTrigger.refresh();
  };

  const loader = $('.loader');
  const compteur = $('[data-loader-count]');
  if (reduit || !loader) {
    loader?.remove();
    entreeHero();
    demarrer();
  } else {
    const heroImg = new Image();
    heroImg.src = 'image/header3.webp';
    const pret = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
      new Promise((r) => setTimeout(r, 1300)),
    ]);
    const n = { v: 0 };
    const montee = gsap.to(n, { v: 90, duration: 1.3, ease: 'power2.out', onUpdate: () => { compteur.textContent = Math.round(n.v); } });
    // Filet de sécurité : le site s'ouvre même si une ressource traîne
    const delai = new Promise((r) => setTimeout(r, 4000));
    Promise.race([pret, delai]).then(() => {
      montee.kill();
      gsap.timeline()
        .to(n, { v: 100, duration: 0.35, onUpdate: () => { compteur.textContent = Math.round(n.v); } })
        .to('.loader__inner', { y: -30, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
        .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
        .add(() => { demarrer(); }, '-=0.9')
        .add(entreeHero(), '-=0.85')
        .add(() => loader.remove());
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* =========================================================
     Effets au défilement
     ========================================================= */
  function initScrollFx() {
    if (reduit) return;

    // Hero : l'image glisse plus lentement que la page (parallaxe) et le texte s'efface
    gsap.to('.hero__img', {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__content', {
      y: -120, autoAlpha: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: true },
    });

    // Grands titres : chaque ligne monte depuis son masque
    $$('[data-lines]').forEach((titre) => {
      SplitText.create(titre, {
        type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
        onSplit: (s) => gsap.from(s.lines, {
          yPercent: 115, duration: 1.2, stagger: 0.12, ease: 'expo.out',
          scrollTrigger: { trigger: titre, start: 'top 88%', once: true },
        }),
      });
    });

    // Textes d'accompagnement
    $$('.sec-lead, .kicker, .manifeste__sign, .avis__score').forEach((el) => {
      if (el.closest('.hero, .domaine')) return;
      gsap.from(el, { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    // Manifeste : la phrase s'illumine lettre après lettre
    $$('[data-highlight]').forEach((p) => {
      SplitText.create(p, {
        type: 'words,chars', autoSplit: true,
        onSplit: (s) => gsap.timeline({
          scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 45%', scrub: true },
        }).from(s.chars, { opacity: 0.12, stagger: 0.3, ease: 'none' }),
      });
    });

    // Cadre qui s'ouvre en plein écran, épinglé
    (() => {
      const media = $('[data-frame]');
      if (!media) return;
      const mm = gsap.matchMedia();
      mm.add({ petit: '(max-width: 860px)', grand: '(min-width: 861px)' }, (ctx) => {
        const depart = ctx.conditions.petit ? 'inset(10% 8% 10% 8% round 20px)' : 'inset(18% 22% 18% 22% round 28px)';
        const q = SplitText.create('[data-frame-quote] p', { type: 'lines', mask: 'lines' });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.reveal-frame', start: 'top top', end: '+=130%', scrub: 1, pin: '.reveal-frame__pin', anticipatePin: 1 },
        });
        tl.fromTo(media, { clipPath: depart }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 }, 0)
          .fromTo('.reveal-frame__img', { scale: ctx.conditions.petit ? 1.05 : 1.2 }, { scale: 1, ease: 'none', duration: 1 }, 0)
          .from(q.lines, { yPercent: 110, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, 0.45);
        return () => q.revert();
      });
    })();

    // Domaines : les photos s'affichent directement, seul le texte apparaît en douceur
    $$('.domaine').forEach((d) => {
      const body = $('.domaine__body', d);
      gsap.from(body.children, {
        y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: d, start: 'top 80%', once: true },
      });
    });

    // Fonds en parallaxe (façon Holeen) : l'image défile moins vite que la section
    $$('[data-parallax]').forEach((fond) => {
      const debut = parseFloat(fond.dataset.parallaxStart ?? 0);
      const fin = parseFloat(fond.dataset.parallaxEnd ?? 20);
      gsap.fromTo(fond, { yPercent: debut }, {
        yPercent: fin, ease: 'none',
        scrollTrigger: { trigger: fond.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      });
    });

    // Planity intégré : le cadre monte en fondu
    gsap.from('.planity', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.planity', start: 'top 88%', once: true } });

    // Avis : le mur apparaît en douceur
    gsap.from('.gwall', { y: 60, autoAlpha: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.gwall', start: 'top 90%', once: true } });

    // Réalisations : les vidéos se lancent (muettes) quand elles sont à l'écran
    const vids = $$('[data-video]');
    if (vids.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          const v = en.target;
          if (en.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
        });
      }, { threshold: 0.35 });
      vids.forEach((v) => io.observe(v));
    }

    // Réalisations : « Voir plus » déplie toute la grille
    (() => {
      const grille = $('[data-masonry]');
      const bouton = $('[data-masonry-more]');
      if (!grille || !bouton) return;
      const texte = $('.btn__text', bouton);
      bouton.addEventListener('click', () => {
        const ouvert = grille.classList.toggle('is-collapsed') === false;
        bouton.setAttribute('aria-expanded', String(ouvert));
        texte.textContent = ouvert ? 'Voir moins' : 'Voir plus de réalisations';
        if (!ouvert) allerA(grille.closest('section'));
        ScrollTrigger.refresh();
      });
    })();

    // Réalisations : chaque carte monte en fondu quand elle entre à l'écran.
    // Observée directement (et non par position), car la grille en colonnes
    // change de hauteur au fil du chargement des images.
    const reals = $$('[data-real]');
    if (reals.length && 'IntersectionObserver' in window) {
      const ioReal = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          ioReal.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      reals.forEach((el) => ioReal.observe(el));
    } else {
      reals.forEach((el) => el.classList.add('is-in'));
    }

    // Contact : apparition par classe (pas de tween sur transform, les cartes
    // ont leur propre transition CSS au survol)
    const contacts = $$('.contact-card, .info-block');
    if (contacts.length && 'IntersectionObserver' in window) {
      const ioC = new IntersectionObserver((entries) => {
        entries.forEach((en, k) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          ioC.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -6% 0px' });
      contacts.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.08 + 's'; ioC.observe(el); });
    } else {
      contacts.forEach((el) => el.classList.add('is-in'));
    }

  }

  /* =========================================================
     Onglets de la carte
     ========================================================= */
  function initTabs(exporter) {
    const tabs = $$('[data-tab]');
    const ink = $('.tabs__ink');
    if (!tabs.length) return;
    const placerEncre = (btn, instant) => {
      if (!ink) return;
      if (instant) ink.style.transition = 'none';
      ink.style.width = btn.offsetWidth + 'px';
      ink.style.transform = `translateX(${btn.offsetLeft}px)`;
      if (instant) requestAnimationFrame(() => { ink.style.transition = ''; });
    };
    const choisir = (nom, focus) => {
      const btn = tabs.find((t) => t.dataset.tab === nom);
      if (!btn || btn.getAttribute('aria-selected') === 'true') return;
      tabs.forEach((t) => {
        const on = t === btn;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      $$('[data-panel]').forEach((p) => {
        const on = p.dataset.panel === nom;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
        if (on && window.gsap && !reduit) {
          gsap.fromTo($$('.panel__cat, .menu li', p), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, ease: 'power3.out', overwrite: true });
        }
      });
      placerEncre(btn);
      if (focus) btn.focus();
      window.ScrollTrigger?.refresh();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => choisir(t.dataset.tab));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        choisir(tabs[(i + d + tabs.length) % tabs.length].dataset.tab, true);
      });
    });
    const init = () => placerEncre(tabs.find((t) => t.getAttribute('aria-selected') === 'true'), true);
    init();
    window.addEventListener('resize', init);
    document.fonts?.ready.then(init);
    exporter?.(choisir);
  }

  /* =========================================================
     Éventail de cartes (inspiré de Jolis Nails)
     Chaque carte a son propre ressort : position, rotation,
     échelle. Le survol écarte le paquet, le clic ou le glisser
     fait tourner l'éventail sans fin.
     ========================================================= */
  function initFan() {
    const root = $('[data-fan]');
    if (!root) return;
    // Sur téléphone et tablette, l'éventail laisse place à la pile au
    // défilement (même mécanique que Jolis Nails sur mobile).
    if (window.matchMedia('(max-width: 860px)').matches) { initEngStack(root); return; }
    const stage = $('.fan__stage', root);
    const cards = $$('.fan__card', stage);
    const n = cards.length;
    const dotsWrap = $('.fan__dots', root);
    const dots = cards.map(() => {
      const d = document.createElement('span');
      d.className = 'fan__dot';
      dotsWrap.appendChild(d);
      return d;
    });

    const CHUTE = 42;
    let rangs = 7, moitie = 3, ecart = 480, lc = 300, hc = 430;
    let centre = 0;
    let survol = null;
    let deploye = false;
    let raf = null;

    const E = cards.map(() => ({
      x: 0, y: 160, r: 0, s: 0.5, o: 0,
      vx: 0, vy: 0, vr: 0, vs: 0,
      tx: 0, ty: 160, tr: 0, ts: 0.5, to: 0,
      attente: 0, off: null, visible: false,
    }));

    const decalage = (i) => {
      let o = (((i - centre) % n) + n) % n;
      if (o > n / 2) o -= n;
      return o;
    };

    function mesurer() {
      const w = window.innerWidth;
      rangs = w < 640 ? 3 : w < 1080 ? 5 : 7;
      moitie = (rangs - 1) / 2;
      const cs = getComputedStyle(root);
      lc = parseFloat(cs.getPropertyValue('--fan-w')) || 300;
      hc = parseFloat(cs.getPropertyValue('--fan-h')) || 430;
      const declare = parseFloat(cs.getPropertyValue('--fan-x')) || 520;
      // Encombrement réel d'une carte couchée à 21° (largeur + part de la hauteur)
      const a = (21 * Math.PI) / 180;
      const demi = ((lc * Math.cos(a) + hc * Math.sin(a)) * 0.7756 * 1.1) / 2;
      // Les cartes extérieures peuvent déborder légèrement : la section les rogne
      const dispo = stage.clientWidth / 2 - demi + 60;
      const voisin = 0.79 * lc * moitie;
      ecart = Math.max(lc * 0.3, Math.min(declare, voisin, dispo));
    }

    function consignes() {
      cards.forEach((card, i) => {
        const e = E[i];
        const o = decalage(i);
        const visible = Math.abs(o) <= moitie;

        if (!visible) {
          if (e.visible) {
            // Elle sort du côté où elle était
            const cote = Math.sign(e.off || o) || 1;
            e.tx = cote * (ecart + lc * 1.3);
            e.tr = cote * 34;
            e.ts = 0.5;
            e.to = 0;
            e.visible = false;
          }
          e.off = null;
          card.style.pointerEvents = 'none';
          card.classList.remove('is-front');
          card.setAttribute('aria-hidden', 'true');
          return;
        }

        const d = moitie ? o / moitie : 0;
        const a = Math.abs(d);
        let x = d * ecart;
        let y = a * a * CHUTE;
        let r = d * 21;
        let s = 1 - 0.2244 * a * a;

        if (survol !== null && deploye) {
          const dist = Math.abs(o - survol);
          if (o === survol) {
            y -= 40;
            s *= 1.08;
          } else {
            const pousse = 0.267 * ecart * (1 - a) * (1 + 0.2 * Math.max(0, 3 - dist));
            if (o < survol) { x -= pousse; r -= 3 / (dist + 1); } else { x += pousse; r += 3 / (dist + 1); }
          }
        }

        if (!e.visible) {
          if (!deploye) {
            e.x = 0; e.y = 160; e.r = 0; e.s = 0.5; e.o = 0;
          } else {
            const cote = Math.sign(o) || 1;
            e.x = cote * (ecart + lc * 1.3); e.y = y; e.r = cote * 30; e.s = 0.6; e.o = 0;
          }
          e.vx = e.vy = e.vr = e.vs = 0;
          e.visible = true;
        }

        e.tx = x; e.ty = y; e.tr = r; e.ts = s; e.to = deploye ? 1 : 0;
        e.off = o;
        card.style.zIndex = String(10 - Math.abs(o) * 2 + (o === survol ? 3 : 0));
        card.style.pointerEvents = 'auto';
        card.style.setProperty('--dim', (a * 0.5).toFixed(2));
        card.classList.toggle('is-front', o === 0);
        card.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
      });
      dots.forEach((d, i) => d.classList.toggle('is-on', i === centre));
      demarrer();
    }

    // Ressort à amortissement critique (mêmes réglages que Jolis Nails) :
    // la carte part franchement, ralentit et se pose sans jamais dépasser
    // sa cible. Neuf dixièmes de la course en 0,5 s, aucun rebond.
    const RAIDEUR = 0.0175;
    const AMORTI = 0.78;
    const ressort = (val, vit, cible) => {
      vit = (vit + (cible - val) * RAIDEUR) * AMORTI;
      return [val + vit, vit];
    };
    function pas(dt) {
      // Le ressort est calibré par image à 60 i/s : on rejoue autant de pas
      // que d'images écoulées plutôt que d'étirer un seul pas.
      const n = Math.max(1, Math.min(3, Math.round(dt)));
      let calme = true;
      E.forEach((e, i) => {
        for (let k = 0; k < n; k++) {
          if (e.attente > 0) { e.attente--; calme = false; continue; }
          [e.x, e.vx] = ressort(e.x, e.vx, e.tx);
          [e.y, e.vy] = ressort(e.y, e.vy, e.ty);
          [e.r, e.vr] = ressort(e.r, e.vr, e.tr);
          [e.s, e.vs] = ressort(e.s, e.vs, e.ts);
          // L'opacité ne ressorte pas : simple approche exponentielle,
          // un peu plus vive à l'entrée qu'à la sortie.
          e.o += (e.to - e.o) * (e.to > e.o ? 0.07 : 0.05);
        }
        if (Math.abs(e.tx - e.x) + Math.abs(e.ty - e.y) + Math.abs(e.tr - e.r) > 0.05 || Math.abs(e.vx) > 0.01 || Math.abs(e.to - e.o) > 0.005) calme = false;
        const c = cards[i];
        c.style.transform = `translate3d(${e.x.toFixed(2)}px, ${e.y.toFixed(2)}px, 0) rotate(${e.r.toFixed(3)}deg) scale(${e.s.toFixed(4)})`;
        c.style.opacity = e.o.toFixed(3);
      });
      return calme;
    }

    let dernier = 0;
    function boucle(t) {
      const dt = dernier ? Math.min(3, (t - dernier) / 16.667) : 1;
      dernier = t;
      raf = pas(dt) ? null : requestAnimationFrame(boucle);
    }
    function demarrer() {
      if (raf) return;
      dernier = 0;
      raf = requestAnimationFrame(boucle);
    }

    function deployer() {
      if (deploye) return;
      deploye = true;
      // Ouverture en cascade de gauche à droite, 5 images entre deux cartes
      cards.forEach((_, i) => {
        const o = decalage(i);
        E[i].attente = reduit || Math.abs(o) > moitie ? 0 : (o + moitie) * 5;
      });
      consignes();
    }

    function tourner(sens) {
      centre = (((centre + sens) % n) + n) % n;
      survol = null;
      consignes();
    }

    // Première pose : toutes les cartes empilées, invisibles.
    // Le paquet démarre sur la carte du milieu pour lire 01 → 07 dans l'ordre.
    mesurer();
    centre = moitie;
    consignes();
    pas(1);

    new IntersectionObserver((entrees) => {
      entrees.forEach((en) => {
        if (en.isIntersecting && en.intersectionRatio > 0.25) deployer();
      });
    }, { threshold: [0, 0.25, 0.5] }).observe(stage);

    $('[data-fan-prev]', root).addEventListener('click', () => tourner(-1));
    $('[data-fan-next]', root).addEventListener('click', () => tourner(1));
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); tourner(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); tourner(1); }
    });

    // Survol : la carte visée se soulève, les autres s'écartent
    if (pointeurFin) {
      cards.forEach((card, i) => {
        card.addEventListener('pointerenter', () => {
          const o = decalage(i);
          if (Math.abs(o) > moitie || survol === o) return;
          survol = o;
          consignes();
        });
        // Bascule 3D + reflet sur la carte du milieu
        const inner = $('.fan__inner', card);
        card.addEventListener('pointermove', (e) => {
          if (decalage(i) !== 0) return;
          const r = inner.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          inner.style.setProperty('--ry', ((px - 0.5) * 12).toFixed(2) + 'deg');
          inner.style.setProperty('--rx', ((0.5 - py) * 10).toFixed(2) + 'deg');
          inner.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          inner.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', () => {
          inner.style.setProperty('--rx', '0deg');
          inner.style.setProperty('--ry', '0deg');
        });
      });
      stage.addEventListener('pointerleave', () => { survol = null; consignes(); });
    }

    // Clic sur une carte de côté : elle vient au centre
    let glisse = false;
    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (glisse) return;
        const o = decalage(i);
        if (o !== 0 && Math.abs(o) <= moitie) tourner(o);
      });
    });

    // Glisser (tactile et souris)
    let x0 = null, y0 = null;
    stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; glisse = false; });
    window.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        glisse = true;
        tourner(dx < 0 ? 1 : -1);
        setTimeout(() => { glisse = false; }, 50);
      }
    });

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { mesurer(); consignes(); }, 120);
    });
  }

  /* =========================================================
     Engagements sur mobile : pile épinglée au défilement
     La scène reste collée à l'écran ; chaque cran de défilement fait
     s'envoler la carte du dessus par le haut et révèle la suivante.
     Réglages repris de Jolis Nails : LEAD/HOLD, horloge à bascule 0,5
     et exposant 1,6, vol à -150 % avec effacement entre 38 % et 66 %.
     ========================================================= */
  function initEngStack(root) {
    const stage = $('.fan__stage', root);
    const cards = $$('.fan__card', stage);
    const n = cards.length;
    const nav = $('.fan__nav', root);
    if (nav) nav.hidden = true;

    const LEAD = 0.4, HOLD = 0.35, BASCULE = 0.5, FAN = 5;
    const STEPS = n - 1 + HOLD;
    const RAIL = STEPS + LEAD;

    // Rail de défilement autour de la scène collante
    const rail = document.createElement('div');
    rail.className = 'eng-rail';
    stage.parentNode.insertBefore(rail, stage);
    rail.appendChild(stage);
    const pace = document.createElement('div');
    pace.className = 'eng-pace';
    pace.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    pace.appendChild(fill);
    stage.appendChild(pace);
    const nudge = document.createElement('div');
    nudge.className = 'eng-nudge';
    nudge.setAttribute('aria-hidden', 'true');
    nudge.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';
    stage.appendChild(nudge);

    root.classList.add('is-stack');
    cards.forEach((c, i) => {
      c.style.zIndex = String(n - i);
      c.style.pointerEvents = 'auto';
      c.classList.toggle('is-front', i === 0);
      c.setAttribute('aria-hidden', 'false');
    });

    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    let pas = 0, railTop = 0, colle = 0;
    function mesurer() {
      pas = Math.round(window.innerHeight * 0.7);
      rail.style.height = Math.round(RAIL * pas + window.innerHeight * 0.85) + 'px';
      colle = parseFloat(getComputedStyle(stage).top) || 0;
      railTop = rail.getBoundingClientRect().top + window.scrollY - colle;
    }
    function horloge(t) {
      const e = Math.floor(t);
      const b = clamp((t - e) / BASCULE, 0, 1);
      return e + (1 - Math.pow(1 - b, 1.6));
    }
    const etat = cards.map(() => '');
    function peindre() {
      // Position relue à chaque image : les sections épinglées plus haut
      // modifient la hauteur de la page après le montage.
      railTop = rail.getBoundingClientRect().top + window.scrollY - colle;
      const p = (window.scrollY - railTop) / pas;
      const te = clamp(horloge(clamp(p - LEAD, 0, STEPS)), 0, n - 1);
      cards.forEach((card, i) => {
        const depth = clamp(i - te, 0, 4);
        const gone = i < n - 1 ? clamp(te - i, 0, 1) : 0;
        let y, rot, s, op;
        if (gone > 0) {
          y = -150 * gone; rot = -2 * FAN * gone; s = 1 + 0.02 * gone;
          op = 1 - clamp((gone - 0.38) / 0.28, 0, 1);
          card.style.transform = `translate3d(0, ${y}%, 0) rotate(${rot}deg) scale(${s})`;
        } else {
          y = depth * 16; rot = depth * FAN; s = 1 - depth * 0.02;
          op = depth > 3 ? clamp(4 - depth, 0, 1) : 1;
          card.style.transform = `translate3d(0, ${y}px, 0) rotate(${rot}deg) scale(${s})`;
        }
        const cle = card.style.transform + '|' + op.toFixed(3);
        if (etat[i] === cle) return;
        etat[i] = cle;
        card.style.opacity = op.toFixed(3);
        card.style.setProperty('--dim', (depth * 0.12).toFixed(2));
        card.classList.toggle('is-front', !(depth > 0.5 || gone > 0.05));
      });
      fill.style.transform = `scaleX(${(te / (n - 1)).toFixed(4)})`;
      nudge.style.opacity = String(te < 0.05 ? 1 : 0);
    }
    mesurer(); peindre();
    let raf = null;
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = null; peindre(); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { mesurer(); peindre(); });
    window.addEventListener('load', () => { mesurer(); peindre(); });
  }

  /* =========================================================
     Pile de photos à faire glisser (inspiré de Jolis Nails)
     ========================================================= */
  function initStack() {
    $$('[data-stack]').forEach(initPile);
  }
  // Une pile par prestation : les commandes et le compteur sont cherchés
  // dans le bloc parent (.domaine), pour ne piloter que cette pile-là.
  function initPile(pile) {
    const root = pile.closest('.domaine') || document;
    const cards = $$('.stack__card', pile);
    const n = cards.length;
    const idx = $('[data-stack-index]', root);
    const tot = $('[data-stack-total]', root);
    const cap = $('[data-stack-caption]', root);
    const ANGLES = [-3, 4, -6, 2, 7, -4, 5, -2];
    let ordre = cards.map((_, i) => i);
    let occupe = false;
    if (tot) tot.textContent = String(n).padStart(2, '0');
    if (cap) cap.textContent = cards[0].dataset.caption;
    pile.tabIndex = 0;

    gsap.set(cards, { xPercent: -50, yPercent: -50, x: 0, y: 0 });

    const disposer = (duree = 0.9) => {
      ordre.forEach((ci, k) => {
        const c = cards[ci];
        const p = Math.min(k, 4);
        c.style.zIndex = String(n - k);
        c.style.setProperty('--dim', (p * 0.16).toFixed(2));
        gsap.to(c, {
          x: p * 22, y: p * -14,
          rotation: k === 0 ? ANGLES[ci] * 0.35 : ANGLES[ci],
          scale: 1 - p * 0.05,
          autoAlpha: k > 4 ? 0 : 1,
          duration: duree, ease: 'expo.out', overwrite: 'auto',
        });
      });
      const top = cards[ordre[0]];
      if (idx) idx.textContent = String(ordre[0] + 1).padStart(2, '0');
      if (cap && cap.textContent !== top.dataset.caption) {
        gsap.fromTo(cap, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' });
        cap.textContent = top.dataset.caption;
      }
    };

    const jeter = (sens, vy = 0) => {
      if (occupe) return;
      occupe = true;
      const c = cards[ordre[0]];
      gsap.to(c, {
        x: sens * Math.max(420, pile.offsetWidth * 0.9), y: vy, rotation: sens * 26,
        duration: 0.45, ease: 'power2.in',
        onComplete: () => {
          ordre.push(ordre.shift());
          c.style.zIndex = '0';
          disposer();
          occupe = false;
        },
      });
    };

    const rappeler = () => {
      if (occupe) return;
      occupe = true;
      const ci = ordre.pop();
      const c = cards[ci];
      ordre.unshift(ci);
      c.style.zIndex = String(n + 1);
      gsap.set(c, { x: -pile.offsetWidth * 0.9, y: -40, rotation: -24, autoAlpha: 1, scale: 1 });
      disposer();
      setTimeout(() => { occupe = false; }, 350);
    };

    // Glisser la carte du dessus
    let depart = null;
    pile.addEventListener('pointerdown', (e) => {
      const c = cards[ordre[0]];
      if (occupe || !c.contains(e.target)) return;
      depart = { x: e.clientX, y: e.clientY, t: performance.now(), c };
      c.setPointerCapture(e.pointerId);
    });
    pile.addEventListener('pointermove', (e) => {
      if (!depart) return;
      const dx = e.clientX - depart.x;
      const dy = e.clientY - depart.y;
      gsap.set(depart.c, { x: dx, y: dy * 0.5, rotation: dx * 0.06 });
    });
    const lacher = (e) => {
      if (!depart) return;
      const dx = e.clientX - depart.x;
      const dy = e.clientY - depart.y;
      const v = dx / Math.max(1, performance.now() - depart.t);
      depart = null;
      if (Math.abs(dx) > 90 || Math.abs(v) > 0.6) jeter(Math.sign(dx) || 1, dy * 0.5);
      else disposer(0.8);
    };
    pile.addEventListener('pointerup', lacher);
    pile.addEventListener('pointercancel', lacher);

    $('[data-stack-next]', root)?.addEventListener('click', () => jeter(-1));
    $('[data-stack-prev]', root)?.addEventListener('click', rappeler);
    pile.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); jeter(-1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rappeler(); }
    });

    // Entrée : le paquet se forme au premier passage
    gsap.set(cards, { y: 120, autoAlpha: 0, rotation: 0 });
    ScrollTrigger.create({
      trigger: pile, start: 'top 80%', once: true,
      onEnter: () => disposer(1.4),
    });
    if (reduit) disposer(0);
  }
})();
