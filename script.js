/* ==========================================================================
   ES.DEV — Essa Muhammad's portfolio
   1. Settings + DOM references     2. Helpers                3. Loader
   4. Hero intro                    5. Hero pointer depth     6. Scroll motion
   7. Navigation                    8. Typewriter             9. Editor card
   10. Contact validation           11. Download CV feedback   12. Start
   Animation uses GSAP + ScrollTrigger. Section scenes are scroll-scrubbed (see section 6). Everything else is plain JavaScript
   and keeps working even if the animation files fail to load.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Settings + DOM references
     ------------------------------------------------------------------------ */
  var TERMINAL_LINES = ['initializing ES', 'loading creativity...', 'building experience...', 'compiling portfolio...'];
  var ROLES = ['Web Developer', 'Frontend Developer', 'WordPress Developer'];

  var TYPE_SPEED = 85;        // hero role typewriter, ms per character
  var DELETE_SPEED = 45;
  var HOLD_TIME = 1700;
  var GAP_TIME = 420;

  // CONTACT FORM → GOOGLE SHEET
  // Paste your Google Apps Script "Web app" URL between the quotes (steps: google-sheets/SETUP.txt).
  // While this is empty the form only validates and says, honestly, that nothing is connected.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwdwNlaLkHyF8e5L8cOL8a1AY96WU73OSZ9aLIWJZtBu9P2OAzyByvcPXDy0xKx60rr/exec';

  var LOADER_SPEED = 1.2;               // one dial for the whole cinematic loader (1 = as authored)
  var INTRO_KEY = 'esdev:intro-seen';   // sessionStorage: full loader plays once per session
  var ASSET_WAIT_LIMIT = 5000;          // never hold the loader longer than this for slow fonts / portrait

  var doc = document;
  var root = doc.documentElement;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasGsap = !!(gsap && ScrollTrigger);

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var isSmall = window.matchMedia('(max-width: 700px)');

  var loader = doc.getElementById('loader');
  var navbar = doc.getElementById('navbar');
  var navToggle = doc.getElementById('navToggle');
  var navMenu = doc.getElementById('navMenu');
  var navLinks = toArray(doc.querySelectorAll('.nav__link'));
  var sections = toArray(doc.querySelectorAll('main section[id]'));
  var footer = doc.getElementById('footer');
  var hero = doc.getElementById('home');
  var themeMeta = doc.querySelector('meta[name="theme-color"]');

  /* ------------------------------------------------------------------------
     2. Helpers
     ------------------------------------------------------------------------ */
  function toArray(list) { return Array.prototype.slice.call(list); }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function pad(number) { return (number < 10 ? '0' : '') + number; }

  function storageGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (error) { return null; }
  }

  function storageSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (error) { /* private mode: ignore */ }
  }

  // Size a .fit element so its text spans the available width exactly.
  function fitText(element, targetWidth, maxFontSize) {
    element.style.fontSize = '100px';
    var width = element.getBoundingClientRect().width;
    if (!width) return;
    var size = 100 * targetWidth / width;
    if (maxFontSize) size = Math.min(size, maxFontSize);
    element.style.fontSize = size.toFixed(2) + 'px';
  }

  function fitWordmarks() {
    toArray(doc.querySelectorAll('[data-fit]')).forEach(function (element) {
      var parent = element.parentElement;
      fitText(element, parent.clientWidth, 0);
    });
  }

  // Wrap every word of an element in a mask so it can rise into place.
  function splitWords(element) {
    toArray(element.childNodes).forEach(function (node) {
      if (node.nodeType === 1) { splitWords(node); return; }
      if (node.nodeType !== 3 || !node.textContent.trim()) return;

      var fragment = doc.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.appendChild(doc.createTextNode(' ')); return; }
        var outer = doc.createElement('span');
        var inner = doc.createElement('span');
        outer.className = 'w';
        inner.className = 'w__inner';
        inner.textContent = part;
        outer.appendChild(inner);
        fragment.appendChild(outer);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    return toArray(element.querySelectorAll('.w__inner'));
  }

  // Resolves when the things the hero needs are ready (or the wait limit passes).
  function whenAssetsReady() {
    return new Promise(function (resolve) {
      var finished = false;
      function done() { if (!finished) { finished = true; resolve(); } }

      var waits = [];
      if (doc.fonts && doc.fonts.ready) waits.push(doc.fonts.ready);
      var heroImage = doc.getElementById('heroImage');
      if (heroImage && heroImage.decode) waits.push(heroImage.decode().catch(function () {}));
      Promise.all(waits).then(done, done);
      window.setTimeout(done, ASSET_WAIT_LIMIT);
    });
  }

  /* ------------------------------------------------------------------------
     3. Loader
     BLACK → cursor → terminal → fragments → ES → scanner → ES.DEV → READY. → dot → blue → split
     ------------------------------------------------------------------------ */
  var afterLoader = null;   // set in start(): scroll scenes are built only once the page is scrollable
  function finishLoader() {
    if (loader) loader.classList.add('is-done');
    root.classList.remove('is-loading');
    if (themeMeta) themeMeta.setAttribute('content', '#F6F4EF');
    if (afterLoader) { var fn = afterLoader; afterLoader = null; window.setTimeout(fn, 60); }
  }

  // The last beat, shared by the full and the short loader: the blue halves part over the hero.
  function addSplit(timeline, onOpen) {
    var panels = loader.querySelectorAll('.loader__panel');
    timeline
      .add(function () {
        loader.classList.add('is-open');
        gsap.set('#loaderBlue', { clipPath: 'none' });
        gsap.set(['#loaderBrand', '#loaderTerminal', '#loaderScan', '#loaderCounter', '#loaderFrame', '#loaderProgress', '.loader__texture'], { autoAlpha: 0 });
        onOpen();
      })
      .to(panels[0], { xPercent: -101, duration: 0.95, ease: 'expo.inOut' }, '+=0.08')
      .to(panels[1], { xPercent: 101, duration: 0.95, ease: 'expo.inOut' }, '<')
      .add(finishLoader);
    return timeline;
  }

  function playShortLoader(onOpen) {
    var cover = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 20;
    var circle = { r: 0 };
    var blue = doc.getElementById('loaderBlue');
    var timeline = gsap.timeline();

    timeline
      .set(blue, { visibility: 'visible' })
      .to(circle, {
        r: cover, duration: 0.45, ease: 'power3.in', delay: 0.1,
        onUpdate: function () { blue.style.clipPath = 'circle(' + circle.r + 'px at 50% 50%)'; }
      });
    addSplit(timeline, onOpen);
  }

  function playFullLoader(onOpen) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var small = isSmall.matches;

    var terminal = doc.getElementById('loaderTerminal');
    var lines = toArray(terminal.querySelectorAll('.terminal__line'));
    var cursor = doc.getElementById('loaderCursor');
    var brand = doc.getElementById('loaderBrand');
    var brandEs = doc.getElementById('brandEs');
    var brandDev = doc.getElementById('brandDev');
    var brandDot = doc.getElementById('brandDot');
    var brandDevText = doc.getElementById('brandDevText');
    var scan = doc.getElementById('loaderScan');
    var counter = doc.getElementById('loaderCounter');
    var blue = doc.getElementById('loaderBlue');
    var texture = loader.querySelector('.loader__texture');
    var labels = loader.querySelectorAll('.loader__label');
    var progress = doc.getElementById('loaderProgress');
    var guides = loader.querySelectorAll('.brand__guide');

    /* --- measure the identity in its final, unscaled layout ---------------- */
    gsap.set(brand, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1 });
    fitText(brand, vw * (small ? 0.88 : 0.78), vh * 0.62);

    var brandRect = brand.getBoundingClientRect();
    var esRect = brandEs.getBoundingClientRect();
    var devRect = brandDev.getBoundingClientRect();
    var dotRect = brandDot.getBoundingClientRect();
    var dotX = dotRect.left + dotRect.width / 2;
    var dotY = dotRect.top + dotRect.height / 2;

    // "ES" alone starts huge: 60–80% of the viewport, centred
    var bigScale = Math.min(vw * (small ? 0.78 : 0.64) / esRect.width, vh * 0.78 / esRect.height);
    var bigShift = (brandRect.left + brandRect.width / 2 - (esRect.left + esRect.width / 2)) * bigScale;

    /* --- tiny counter: 01 02 03 … cycles until READY. ---------------------- */
    var count = { n: 1 };
    var counting = gsap.to(count, {
      n: 99, duration: 4.4, ease: 'none', repeat: -1,
      onUpdate: function () { counter.textContent = pad(Math.floor(count.n)); }
    });

    /* --- hold point: wait here (briefly) if the hero is not ready ---------- */
    var assetsReady = false;
    var holding = false;
    whenAssetsReady().then(function () {
      assetsReady = true;
      fitWordmarks();
      if (holding) timeline.play();
    });

    var timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline.timeScale(LOADER_SPEED);

    // Nobody is trapped: any key, click or tap fast-forwards the sequence.
    function hurry() { timeline.timeScale(5); }
    ['pointerdown', 'keydown'].forEach(function (type) { window.addEventListener(type, hurry, { once: true }); });

    /* 01 — black, then a tiny cursor */
    timeline
      .add(function () {
        lines[0].classList.add('is-active');
        lines[0].querySelector('.terminal__text').after(cursor);
        cursor.style.visibility = 'visible';
      }, 0.18)
      .to(counter, { opacity: 1, duration: 0.3 }, 0.2)
      .to(labels, { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'none' }, 0.2);

    /* 02 — terminal lines, typed fast and rhythmically */
    lines.forEach(function (line, index) {
      var target = line.querySelector('.terminal__text');
      var text = TERMINAL_LINES[index] || '';
      var typed = { n: 0 };
      var label = 'line' + index;

      timeline
        .add(function () {
          line.classList.add('is-active', 'is-typing');
          target.after(cursor);
        }, index === 0 ? 0.36 : '+=0.04')
        .addLabel(label)
        .to(typed, {
          n: text.length, duration: text.length * 0.0065, ease: 'none',
          onUpdate: function () { target.textContent = text.slice(0, Math.round(typed.n)); }
        }, label)
        .add(function () {
          line.classList.add('is-done', 'is-glow');
          window.setTimeout(function () { line.classList.remove('is-glow'); }, 220);
        });
    });

    /* 02b — lines break into pieces and are pulled to the centre.
       Pieces are characters on desktop (~85 spans) and whole words on mobile (~12 spans). */
    timeline.add(function () {
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      var pieces = [];

      lines.forEach(function (line) {
        var prompt = line.querySelector('.terminal__prompt');
        var target = line.querySelector('.terminal__text');
        var parts = small ? target.textContent.split(/(\s+)/) : target.textContent.split('');
        target.textContent = '';
        parts.forEach(function (part) {
          if (!part) return;
          var span = doc.createElement('span');
          span.textContent = part;
          target.appendChild(span);
          if (part.trim()) pieces.push(span);
        });
        pieces.push(prompt, line.querySelector('.terminal__lead'), line.querySelector('.terminal__ok'));
      });

      pieces.forEach(function (piece) {
        var rect = piece.getBoundingClientRect();
        gsap.to(piece, {
          x: (vw / 2 - rect.left - rect.width / 2) * 0.92,
          y: (vh / 2 - rect.top - rect.height / 2) * 0.92,
          scale: 0.1,
          opacity: 0,
          color: '#7FA2FF',
          duration: 0.3 + Math.random() * 0.1,
          delay: Math.random() * 0.08,
          ease: 'power3.in'
        });
      });
    }, '+=0.08');

    /* 03 — near darkness, then the giant ES */
    timeline
      .addLabel('es', '+=0.36')
      .set(brand, { visibility: 'visible', scale: bigScale * 1.14, x: bigShift * 1.14 }, 'es')
      .fromTo(brandEs,
        { opacity: 0, filter: 'blur(18px)', clipPath: 'inset(0% 0% 100% 0%)' },
        { opacity: 1, filter: 'blur(0px)', clipPath: 'inset(-10% -10% -10% -10%)', duration: 0.45, ease: 'power3.out' }, 'es')
      .to(brand, { scale: bigScale, x: bigShift, duration: 0.5, ease: 'power2.out' }, 'es')
      .to(texture, { opacity: 1, duration: 0.6, ease: 'none' }, 'es')
      .to(guides, { scaleX: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, 'es+=0.05')
      // a controlled band of blue light travels through the letters
      .fromTo(brandEs, { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 0.6, ease: 'power1.inOut' }, 'es+=0.08');

    /* 04 — the scanner builds ES into ES.DEV */
    var pulledBack = false;
    timeline
      .addLabel('scan', 'es+=0.46')
      .set(scan, { opacity: 1, x: -12 }, 'scan')
      .to(brand, {
        scale: 1, x: 0, duration: 0.3, ease: 'power3.inOut',
        onComplete: function () { pulledBack = true; }
      }, 'scan')
      .to(scan, {
        x: vw + 160, duration: 0.7, ease: 'none',
        onUpdate: function () {
          if (!pulledBack) return;
          var x = gsap.getProperty(scan, 'x');
          var reveal = clamp((x - devRect.left) / devRect.width, 0, 1);
          brandDev.style.setProperty('--reveal', (reveal * 100).toFixed(2) + '%');
        }
      }, 'scan')
      .fromTo(brandDot, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' },
        'scan+=' + (0.7 * (devRect.left + 12) / (vw + 172)).toFixed(3))
      .add(function () { brandDev.style.setProperty('--reveal', '100%'); }, 'scan+=0.7');

    /* 05 — hold here only if the hero is genuinely not ready, then READY. */
    timeline.add(function () {
      if (assetsReady) return;
      holding = true;
      timeline.pause();
    }, 'scan+=0.6');

    timeline
      .add(function () {
        counting.kill();
        counter.textContent = 'READY.';
        counter.classList.add('is-ready');
      }, 'scan+=0.62')
      .addLabel('dive', 'scan+=0.86');

    /* 06 — everything pulls toward the blue dot, then we dive into it */
    var circle = { r: dotRect.width * 0.8 };
    timeline
      .set(brand, { transformOrigin: (dotX - brandRect.left) + 'px ' + (dotY - brandRect.top) + 'px' }, 'dive')
      .to(brand, { x: vw / 2 - dotX, y: vh / 2 - dotY, scale: 1.6, duration: 0.34, ease: 'power3.inOut' }, 'dive')
      .to([brandEs, brandDevText], { opacity: 0, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, 'dive')
      .to([counter, texture, labels, guides, progress], { opacity: 0, duration: 0.3, ease: 'none' }, 'dive')
      .set(blue, { visibility: 'visible' }, 'dive+=0.24')
      .to(circle, {
        r: Math.hypot(vw, vh) / 2 + 24, duration: 0.42, ease: 'power3.in',
        onUpdate: function () { blue.style.clipPath = 'circle(' + circle.r.toFixed(1) + 'px at 50% 50%)'; }
      }, 'dive+=0.24');

    // the hairline at the bottom fills across the whole sequence
    timeline.to(progress, { scaleX: 1, ease: 'none', duration: timeline.labels.dive - 0.2 }, 0.2);

    /* 07 — blue covers the viewport; its halves part over the hero */
    addSplit(timeline, function () {
      storageSet(INTRO_KEY, '1');
      ['pointerdown', 'keydown'].forEach(function (type) { window.removeEventListener(type, hurry); });
      timeline.timeScale(LOADER_SPEED);
      onOpen();
    });
  }

  function runLoader(onOpen) {
    if (!loader) { onOpen(); return; }

    // No animation engine, or reduced motion: reveal the page almost immediately.
    if (!hasGsap || reducedMotion.matches) {
      loader.style.transition = 'opacity 260ms ease';
      loader.style.opacity = '0';
      window.setTimeout(function () { finishLoader(); onOpen(); }, 280);
      return;
    }

    try {
      if (storageGet(INTRO_KEY)) playShortLoader(onOpen);
      else playFullLoader(onOpen);
    } catch (error) {
      finishLoader();
      onOpen();
    }
  }

  /* ------------------------------------------------------------------------
     4. Hero intro — staggered, synchronised with the loader exit
     ------------------------------------------------------------------------ */
  var heroIntro = null;

  function prepareHero() {
    if (!hasGsap || reducedMotion.matches || !hero) return;

    var letters = hero.querySelectorAll('.hero__wordmark .wm');
    var titleLines = hero.querySelectorAll('.hero__title .line__inner');
    var rise = function () { return window.innerHeight * 0.45; };

    gsap.set(letters, { y: rise });
    gsap.set('.portrait__arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 22px 22px)' });
    gsap.set('.portrait__arch img', { y: 80, scale: 1.12 });
    gsap.set(titleLines, { yPercent: 112 });
    gsap.set('[data-hero="copy"], [data-hero="cta"]', { y: 22, opacity: 0 });
    gsap.set('[data-hero="detail"]', { opacity: 0 });
    gsap.set(navbar, { y: -18, opacity: 0 });

    heroIntro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      // 1. main typography rises
      .to(letters, { y: 0, duration: 1.15, stagger: 0.055 }, 0.25)
      // 2. Essa settles
      .to('.portrait__arch', { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 22px 22px)', duration: 1.25, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.3)
      .to('.portrait__arch img', { y: 0, scale: 1, duration: 1.5, clearProps: 'transform' }, 0.45)
      .to(titleLines, { yPercent: 0, duration: 1.0, stagger: 0.09 }, 0.62)
      // 3. supporting copy
      .to('[data-hero="copy"]', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.95)
      // 4. calls to action
      .to('[data-hero="cta"]', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.15)
      // 5. small interface details
      .to('[data-hero="detail"]', { opacity: 1, duration: 0.7, stagger: 0.12, ease: 'none' }, 1.4)
      // 6. navbar, last and quiet
      .to(navbar, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity' }, 1.5);
  }

  function playHero() {
    if (heroIntro) heroIntro.play();
    startTypewriter();
  }

  /* ------------------------------------------------------------------------
     5. Hero pointer depth — tiny parallax + soft light (desktop pointers only)
     ------------------------------------------------------------------------ */
  function initHeroPointer() {
    if (!hasGsap || !hero || reducedMotion.matches || !finePointer.matches) return;

    var light = doc.getElementById('heroLight');
    var layers = toArray(hero.querySelectorAll('[data-depth]')).map(function (element) {
      return {
        depth: parseFloat(element.getAttribute('data-depth')) || 0,   // max travel in px (4–10)
        x: gsap.quickTo(element, 'x', { duration: 1.1, ease: 'power3.out' }),
        y: gsap.quickTo(element, 'y', { duration: 1.1, ease: 'power3.out' })
      };
    });
    var lightX = gsap.quickTo(light, 'x', { duration: 0.9, ease: 'power3.out' });
    var lightY = gsap.quickTo(light, 'y', { duration: 0.9, ease: 'power3.out' });

    hero.addEventListener('pointermove', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      var rect = hero.getBoundingClientRect();
      var nx = (event.clientX - rect.left) / rect.width * 2 - 1;    // -1 … 1
      var ny = (event.clientY - rect.top) / rect.height * 2 - 1;

      layers.forEach(function (layer) {
        layer.x(nx * layer.depth);
        layer.y(ny * layer.depth * 0.6);
      });
      lightX(event.clientX - rect.left);
      lightY(event.clientY - rect.top);
    }, { passive: true });

    hero.addEventListener('pointerenter', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      var rect = hero.getBoundingClientRect();
      gsap.set(light, { x: event.clientX - rect.left, y: event.clientY - rect.top });
      gsap.to(light, { opacity: 1, duration: 0.8 });
    });
    hero.addEventListener('pointerleave', function () {
      gsap.to(light, { opacity: 0, duration: 0.8 });
      layers.forEach(function (layer) { layer.x(0); layer.y(0); });
    });
  }

  /* ------------------------------------------------------------------------
     6. Scroll motion — each section has its own, related, movement
     ------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------
     6. Scroll motion — every scene below is SCRUBBED: it follows the wheel,
        stops when scrolling stops, and reverses when scrolling back up.
        gsap.matchMedia() gives desktop the full scenes and phones lighter ones,
        and reverts everything cleanly if the viewport crosses a breakpoint.
     ------------------------------------------------------------------------ */
  var scrollStarted = false;
  var settleUntil = 0;
  var lastScrollAt = 0;
  window.addEventListener('scroll', function () { lastScrollAt = Date.now(); }, { passive: true });

  // Re-measuring while the page is moving can mis-place a pinned section, so deferred
  // refreshes wait until the page has been still for a moment.
  function refreshWhenStill() {
    if (!hasGsap || !ScrollTrigger) return;
    if (Date.now() - lastScrollAt < 400) { window.setTimeout(refreshWhenStill, 400); return; }
    ScrollTrigger.refresh();
  }      // resizes right after the reveal (scrollbar appearing etc.) must not rebuild pins
  var DESKTOP = '(min-width: 1024px)';
  var PHONE = '(max-width: 1023px)';

  // A section may be pinned only if the whole of it fits on the screen; otherwise its lower
  // part would be cut off for the entire pin. Tall sections fall back to the unpinned scrub.
  // Only the hero is ever pinned: it is exactly one viewport tall and sits at the top, so its
  // measurements cannot drift. Pinning sections further down proved fragile in real browsers
  // (fonts, lazy images and the WebGL canvas shift the layout after triggers are measured),
  // which made pinned cards float over other sections. Those sections use scrubbed, unpinned scenes.
  function canPin(element) {
    return element === hero && element.offsetHeight <= window.innerHeight + 4;
  }

  // A scrubbed timeline that plays while `trigger` travels from `start` to `end`
  function scene(trigger, start, end, scrub) {
    return gsap.timeline({
      scrollTrigger: { trigger: trigger, start: start, end: end, scrub: scrub == null ? 0.8 : scrub, invalidateOnRefresh: true }
    });
  }

  // Section head: title rises, note fades, hairline draws — all on the wheel
  function headScene(head) {
    scene(head, 'top 92%', 'top 55%', 0.6)
      .from(head.querySelector('.shead__title'), { y: 56, opacity: 0, ease: 'none' }, 0)
      .fromTo(head, { '--line': 0 }, { '--line': 1, ease: 'none' }, 0)
      .from(head.querySelector('.shead__note'), { opacity: 0, ease: 'none' }, 0.3);
  }

  function initScrollMotion() {
    if (scrollStarted) return;           // never create duplicate triggers
    scrollStarted = true;

    var journeyItems = toArray(doc.querySelectorAll('.journey__item'));

    if (!hasGsap || reducedMotion.matches) {
      journeyItems.forEach(function (item) { item.classList.add('is-passed'); });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Reading-progress line in the navbar
    var progress = doc.getElementById('navProgress');
    if (progress) {
      gsap.fromTo(progress, { '--progress': 0 }, {
        '--progress': 1, ease: 'none',
        scrollTrigger: { trigger: doc.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      });
    }

    toArray(doc.querySelectorAll('[data-anim="head"]')).forEach(headScene);

    buildScenes(journeyItems);

    // Pin decisions depend on the viewport size, so rebuild when it changes noticeably
    var lastW = window.innerWidth, lastH = window.innerHeight, rebuildTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(function () {
        if (Date.now() < settleUntil || Math.abs(window.innerWidth - lastW) < 60) { refreshWhenStill(); return; }
        lastW = window.innerWidth; lastH = window.innerHeight;
        buildScenes(journeyItems);
      }, 250);
    });

    // Layout can change after images decode — keep trigger positions exact
    window.addEventListener('load', function () {
      refreshWhenStill();
      window.setTimeout(refreshWhenStill, 600);   // after the WebGL canvas / fonts settle
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refreshWhenStill);
    toArray(doc.querySelectorAll('img[loading="lazy"]')).forEach(function (image) {
      image.addEventListener('load', refreshWhenStill, { once: true });
    });
  }

  var mm = null;
  function buildScenes(journeyItems) {
    if (mm) mm.revert();                 // removes every scene + pin cleanly before rebuilding
    mm = gsap.matchMedia();
    mm.add(DESKTOP, function () {
      initHeroScene(true); initAboutScene(true); initServicesScene(true); initProjectsScene(true);
      initSkillsScene(true); initJourneyScene(journeyItems); initContactScene(true); initMagnetic();
    });
    mm.add(PHONE, function () {
      initHeroScene(false); initAboutScene(false); initServicesScene(false); initProjectsScene(false);
      initSkillsScene(false); initJourneyScene(journeyItems); initContactScene(false);
    });
    ScrollTrigger.refresh();
  }

  /* HERO — desktop: pinned for one extra viewport. The pale ES.DEV grows and rises behind
     everything, the copy lifts away, the portrait eases back; the scene then hands over to About.
     Phone: no pin, only gentle parallax. (The load-time intro animates other elements/properties,
     so the two never fight.) */
  function initHeroScene(desktop) {
    if (!hero) return;
    var wordmark = hero.querySelector('.hero__wordmark');

    if (desktop && canPin(hero)) {
      gsap.set(wordmark, { transformOrigin: '50% 100%' });
      gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=120%', scrub: 0.75, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
      })
        .to(wordmark, { scale: 2.1, yPercent: 24, ease: 'none' }, 0)
        .to('.hero__copy', { yPercent: -28, opacity: 0, ease: 'none' }, 0)
        .to('.hero__visual', { yPercent: -16, scale: 0.9, ease: 'none' }, 0.05)
        .to('.hero__label, .scroll-indicator', { opacity: 0, ease: 'none', duration: 0.3 }, 0)
        .to(wordmark, { opacity: 0.55, ease: 'none', duration: 0.4 }, 0.6);
      return;
    }

    scene(hero, 'top top', 'bottom top', true)
      .to(wordmark, { yPercent: -16, ease: 'none' }, 0)
      .to('.hero__copy', { yPercent: -10, ease: 'none' }, 0)
      .to('.hero__visual', { yPercent: -6, ease: 'none' }, 0);
  }

  /* ABOUT — words rise through their masks, the editor slides in from the right (desktop) or
     from below (phone), the facts arrive cell by cell. */
  function initAboutScene(desktop) {
    var aboutSection = doc.getElementById('about');
    if (desktop && aboutSection && canPin(aboutSection)) {
      var lead = aboutSection.querySelector('[data-anim="words"]');
      var words = lead ? (lead.querySelectorAll('.w__inner').length ? toArray(lead.querySelectorAll('.w__inner')) : splitWords(lead)) : [];
      var editor = aboutSection.querySelector('[data-anim="editor"]');
      var side = aboutSection.querySelector('[data-anim="about-side"]');
      var tl = gsap.timeline({ scrollTrigger: { trigger: aboutSection, start: 'top top', end: '+=110%', scrub: 0.75, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
      if (words.length) tl.from(words, { yPercent: 115, opacity: 0, ease: 'none', stagger: 0.018 }, 0.04);
      if (editor) tl.from(editor, { xPercent: -18, y: 50, scale: 0.92, opacity: 0, rotation: -1.2, ease: 'none' }, 0.18)
        .from(editor.querySelectorAll('.editor__code li'), { x: -18, opacity: 0, ease: 'none', stagger: 0.012 }, 0.35);
      if (side) tl.from(side, { xPercent: 14, opacity: 0, ease: 'none' }, 0.28)
        .from(side.querySelectorAll('.info__cell'), { y: 28, opacity: 0, ease: 'none', stagger: 0.035 }, 0.43)
        .from(side.querySelector('.about__actions'), { y: 24, opacity: 0, ease: 'none' }, 0.62);
      tl.to(editor || aboutSection, { yPercent: editor ? -4 : 0, ease: 'none' }, 0.72);
      return;
    }
    toArray(doc.querySelectorAll('[data-anim="words"]')).forEach(function (block) {
      var words = block.querySelectorAll('.w__inner').length ? toArray(block.querySelectorAll('.w__inner')) : splitWords(block);
      scene(block, 'top 90%', 'top 45%', 0.7).from(words, { yPercent: 115, ease: 'none', stagger: 0.045 }, 0);
    });
    toArray(doc.querySelectorAll('[data-anim="editor"]')).forEach(function (editor) {
      var etl = scene(editor, 'top 95%', 'top 40%', 0.8);
      if (desktop) etl.from(editor, { x: 110, y: 40, rotation: 1.5, opacity: 0, ease: 'none' }, 0);
      else etl.from(editor, { y: 56, opacity: 0, ease: 'none' }, 0);
      etl.from(editor.querySelectorAll('.editor__code li'), { x: -14, opacity: 0, ease: 'none', stagger: 0.035 }, 0.35);
    });
    toArray(doc.querySelectorAll('[data-anim="about-side"]')).forEach(function (side) {
      scene(side, 'top 92%', 'top 45%', 0.7)
        .from(side.querySelector('.about__text'), { y: 40, opacity: 0, ease: 'none' }, 0)
        .from(side.querySelectorAll('.info__cell'), { y: 22, opacity: 0, ease: 'none', stagger: 0.08 }, 0.25)
        .from(side.querySelector('.about__actions'), { y: 20, opacity: 0, ease: 'none' }, 0.6);
    });
  }

  /* SERVICES — desktop: the three columns start gathered under the middle one, slightly
     smaller, and spread to their places as you scroll. Phone: they rise one after another. */
  function initServicesScene(desktop) {
    toArray(doc.querySelectorAll('[data-anim="services"]')).forEach(function (grid) {
      var cards = toArray(grid.children);
      var section = grid.closest('section') || grid;
      if (desktop && canPin(section)) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=100%', scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
        tl.from(cards, { yPercent: 28, scale: 0.86, opacity: 0, ease: 'none', stagger: 0.08 }, 0.03);
        if (cards.length >= 3) {
          tl.from(cards[0], { xPercent: 48, ease: 'none' }, 0.03)
            .from(cards[cards.length - 1], { xPercent: -48, ease: 'none' }, 0.03);
        }
        tl.from(grid.querySelectorAll('.service__list li, .service__link'), { y: 18, opacity: 0, ease: 'none', stagger: 0.018 }, 0.42)
          .to(cards, { yPercent: -4, ease: 'none', stagger: 0.025 }, 0.78);
      } else if (desktop && cards.length === 3) {
        // unpinned desktop fallback: the columns still gather and spread with the wheel
        scene(grid, 'top 85%', 'top 30%', 0.8)
          .from(cards[0], { xPercent: 60, scale: 0.94, opacity: 0, ease: 'none' }, 0)
          .from(cards[2], { xPercent: -60, scale: 0.94, opacity: 0, ease: 'none' }, 0)
          .from(cards[1], { y: 40, opacity: 0, ease: 'none' }, 0.1)
          .from(grid.querySelectorAll('.service__list li, .service__link'), { y: 14, opacity: 0, ease: 'none', stagger: 0.03 }, 0.5);
      } else {
        scene(grid, 'top 88%', 'top 34%', 0.7).from(cards, { y: 48, opacity: 0, ease: 'none', stagger: 0.14 }, 0);
      }
    });
  }

  /* PROJECTS — each case is one scene: the name slides in while the number rises, the browser
     frame grows from 84% and lifts into place, the screenshot drifts inside it (parallax),
     then the description and facts arrive. Works for any number of .case blocks. */
  function initProjectsScene(desktop) {
    toArray(doc.querySelectorAll('[data-anim="case"]')).forEach(function (item) {
      var visual = item.querySelector('[data-case="visual"]');
      var browser = item.querySelector('[data-case="browser"]');
      var shot = item.querySelector('[data-case="shot"]');
      var info = item.querySelector('.case__info');
      if (desktop && canPin(item)) {
        // the case sits centred on screen while the wheel tells its story
        var tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'center center', end: '+=100%', scrub: 0.75, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
        if (visual) tl.fromTo(visual, { scale: 0.86, yPercent: 10, transformOrigin: '50% 55%' }, { scale: 1, yPercent: 0, ease: 'none' }, 0);
        if (browser) tl.from(browser, { rotationX: 4, y: 50, ease: 'none' }, 0);
        tl.from(item.querySelector('[data-case="number"]'), { yPercent: 120, opacity: 0, ease: 'none' }, 0.05)
          .from(item.querySelector('[data-case="name"]'), { yPercent: 120, xPercent: -6, opacity: 0, ease: 'none' }, 0.1);
        if (shot) {
          gsap.set(shot, { scale: 1.1, transformOrigin: '50% 50%' });
          tl.fromTo(shot, { yPercent: -4 }, { yPercent: 4, scale: 1.03, ease: 'none' }, 0.1);
        }
        if (info) tl.from(item.querySelectorAll('[data-case="text"], [data-case="meta"] > *'), { y: 30, opacity: 0, ease: 'none', stagger: 0.05 }, 0.3);
        if (visual) tl.to(visual, { scale: 1.02, yPercent: -2, ease: 'none' }, 0.8);
        if (browser) initTilt(browser);
      } else {
        scene(item, 'top 88%', 'top 42%', 0.7)
          .from(item.querySelector('[data-case="number"]'), { yPercent: 112, ease: 'none' }, 0)
          .from(item.querySelector('[data-case="name"]'), { xPercent: desktop ? -12 : 0, yPercent: 112, ease: 'none' }, 0.05);
        if (visual) {
          scene(visual, 'top 95%', 'top 30%', 0.9)
            .fromTo(visual, { scale: desktop ? 0.84 : 0.94, transformOrigin: '50% 100%' }, { scale: 1, ease: 'none' }, 0)
            .from(browser, { yPercent: desktop ? 22 : 10, ease: 'none' }, 0);
          if (shot) {
            gsap.set(shot, { scale: 1.08 });
            gsap.fromTo(shot, { yPercent: -4 }, { yPercent: 4, ease: 'none',
              scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: 1 } });
          }
        }
        if (desktop && browser) initTilt(browser);
        if (info) scene(info, 'top 95%', 'top 60%', 0.7).from(info.children, { y: 30, opacity: 0, ease: 'none', stagger: 0.12 }, 0);
      }
    });
  }

  /* SKILLS — rows draw their rule, then their words slide in: odd rows from the left,
     even rows from the right, so the list moves at two speeds. */
  function initSkillsScene(desktop) {
    toArray(doc.querySelectorAll('[data-anim="spec"]')).forEach(function (row, index) {
      var from = desktop ? (index % 2 ? 70 : -70) : 0;
      scene(row, 'top 92%', 'top 50%', 0.7)
        .from(row, { y: 50, opacity: 0, ease: 'none' }, 0)
        .from(row.querySelector('.spec__label'), { opacity: 0, x: desktop ? -12 : 0, ease: 'none' }, 0.1)
        .from(row.querySelectorAll('.spec__items li'), { x: from, y: desktop ? 0 : 24, opacity: 0, ease: 'none', stagger: 0.07 }, 0.15);
    });
  }

  /* JOURNEY — the line fills exactly with the scroll; each entry's label, title and points
     slide in as its node is reached, and reverse when you scroll back. */
  function initJourneyScene(journeyItems) {
    var journey = doc.getElementById('journeyList');
    if (!journey) return;
    var horizontal = window.innerWidth >= 1024;   // three steps on one line

    if (horizontal) {
      // the line fills left → right while the row travels up the screen; each node lights at its third
      gsap.fromTo(journey, { '--progress': 0 }, {
        '--progress': 1, ease: 'none',
        scrollTrigger: {
          trigger: journey, start: 'top 80%', end: 'top 30%', scrub: 0.5,
          onUpdate: function (self) {
            journeyItems.forEach(function (item, i) {
              item.classList.toggle('is-passed', self.progress >= (i + 0.5) / journeyItems.length);
            });
          }
        }
      });
      scene(journey, 'top 85%', 'top 35%', 0.7)
        .from(journeyItems, { y: 56, opacity: 0, ease: 'none', stagger: 0.22 }, 0)
        .from(journey.querySelectorAll('.journey__list li'), { x: 20, opacity: 0, ease: 'none', stagger: 0.05 }, 0.55);
      return;
    }

    gsap.fromTo(journey, { '--progress': 0 }, {
      '--progress': 1, ease: 'none',
      scrollTrigger: { trigger: journey, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 }
    });
    journeyItems.forEach(function (item) {
      ScrollTrigger.create({
        trigger: item, start: 'top 62%',
        onEnter: function () { item.classList.add('is-passed'); },
        onLeaveBack: function () { item.classList.remove('is-passed'); }
      });
      scene(item, 'top 90%', 'top 58%', 0.6)
        .from(item, { y: 40, opacity: 0, ease: 'none' }, 0)
        .from(item.querySelectorAll('.journey__title, .journey__text, .journey__org, .journey__list li'), { x: 24, opacity: 0, ease: 'none', stagger: 0.08 }, 0.1);
    });
  }

  /* CONTACT — deliberately calm: the headline words rise, the details and form settle in,
     and the huge ES.DEV behind it climbs slowly with the page. */
  function initContactScene(desktop) {
    toArray(doc.querySelectorAll('[data-anim="words-lg"]')).forEach(function (title) {
      var words = title.querySelectorAll('.w__inner').length ? toArray(title.querySelectorAll('.w__inner')) : splitWords(title);
      scene(title, 'top 88%', 'top 45%', 0.7)
        .from(words, { yPercent: 118, ease: 'none', stagger: 0.07 }, 0);
    });

    var grid = doc.querySelector('.finale__grid');
    if (grid) {
      scene(grid, 'top 92%', 'top 55%', 0.7)
        .from(grid.children, { y: 44, opacity: 0, ease: 'none', stagger: 0.12 }, 0);
    }

    gsap.fromTo('.finale__wordmark .fit', { yPercent: 28 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
    });
  }

  /* Pointer refinements — desktop only, and both are small by design */

  // Buttons lean a few pixels toward the pointer and spring back on leave
  function initMagnetic() {
    if (!finePointer.matches) return;
    toArray(doc.querySelectorAll('.btn')).forEach(function (button) {
      var toX = gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
      var toY = gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
      button.addEventListener('pointerenter', function () { button.classList.add('is-magnetic'); });
      button.addEventListener('pointermove', function (event) {
        var rect = button.getBoundingClientRect();
        toX((event.clientX - rect.left - rect.width / 2) * 0.18);
        toY((event.clientY - rect.top - rect.height / 2) * 0.18 - 2);
      }, { passive: true });
      button.addEventListener('pointerleave', function () {
        toX(0); toY(0);
        window.setTimeout(function () { button.classList.remove('is-magnetic'); }, 500);
      });
    });
  }

  // The project browser tilts up to 3° toward the pointer
  function initTilt(element) {
    if (!finePointer.matches) return;
    gsap.set(element, { transformPerspective: 1400 });
    var rx = gsap.quickTo(element, 'rotationX', { duration: 0.7, ease: 'power3.out' });
    var ry = gsap.quickTo(element, 'rotationY', { duration: 0.7, ease: 'power3.out' });
    element.addEventListener('pointermove', function (event) {
      var rect = element.getBoundingClientRect();
      ry(((event.clientX - rect.left) / rect.width - 0.5) * 6);
      rx(-((event.clientY - rect.top) / rect.height - 0.5) * 6);
    }, { passive: true });
    element.addEventListener('pointerleave', function () { rx(0); ry(0); });
  }

  /* ------------------------------------------------------------------------
     7. Navigation — mobile menu, smooth anchors, active link, scrolled state
     ------------------------------------------------------------------------ */
  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    navbar.classList.toggle('is-menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function isMenuOpen() {
    return navToggle && navToggle.getAttribute('aria-expanded') === 'true';
  }

  function scrollToSection(target) {
    // The navbar floats, so leave room for it plus a little air
    var navSpace = navbar.getBoundingClientRect().bottom + 12;
    var top = target.id === 'home' ? 0 : target.getBoundingClientRect().top + window.pageYOffset - navSpace;
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function initNavigation() {
    if (navToggle) {
      navToggle.addEventListener('click', function () { setMenu(!isMenuOpen()); });

      doc.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isMenuOpen()) { setMenu(false); navToggle.focus(); }
      });

      doc.addEventListener('click', function (event) {
        if (isMenuOpen() && !navbar.contains(event.target)) setMenu(false);
      });

      window.matchMedia('(min-width: 961px)').addEventListener('change', function (event) {
        if (event.matches) setMenu(false);
      });
    }

    // In-page links
    doc.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      var hash = link.getAttribute('href');
      if (hash === '#') { event.preventDefault(); return; }

      var target = doc.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      setMenu(false);
      scrollToSection(target);

      // "Start a … project" links carry a subject for the contact form
      var subject = link.getAttribute('data-subject');
      var subjectField = doc.getElementById('subject');
      if (subject && subjectField && !subjectField.value.trim()) subjectField.value = subject;
      if (history.replaceState) history.replaceState(null, '', hash);

      if (link.classList.contains('skip-link')) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });

    if (!('IntersectionObserver' in window)) return;

    // Active link: a thin band 40% down the viewport decides the current section
    var currentId = 'home';
    var footerVisible = false;

    function paintActiveLink() {
      var activeId = footerVisible ? 'contact' : currentId;
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute('href') === '#' + activeId;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) currentId = entry.target.id; });
      paintActiveLink();
    }, { rootMargin: '-40% 0px -59% 0px', threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });

    if (footer) {
      new IntersectionObserver(function (entries) {
        footerVisible = entries[0].isIntersecting;
        paintActiveLink();
      }, { threshold: 0.6 }).observe(footer);
    }

    // Navbar gains its surface once the page has scrolled (sentinel, no scroll listener)
    var sentinel = doc.getElementById('scrollSentinel');
    if (sentinel) {
      new IntersectionObserver(function (entries) {
        navbar.classList.toggle('is-scrolled', !entries[0].isIntersecting);
      }).observe(sentinel);
    }
  }

  /* ------------------------------------------------------------------------
     8. Typewriter — the small role beside the greeting
     ------------------------------------------------------------------------ */
  var typewriterStarted = false;

  function startTypewriter() {
    var target = doc.getElementById('typedRole');
    if (typewriterStarted || !target || !ROLES.length) return;
    typewriterStarted = true;

    if (reducedMotion.matches) { target.textContent = ROLES[0]; return; }

    var roleIndex = 0;
    var charIndex = ROLES[0].length;   // the first role is already on screen: hold it, then delete
    var deleting = true;

    function tick() {
      if (doc.hidden) { window.setTimeout(tick, 600); return; }   // rest while the tab is in the background

      var role = ROLES[roleIndex];
      var delay;

      if (!deleting) {
        charIndex += 1;
        target.textContent = role.slice(0, charIndex);
        delay = TYPE_SPEED + Math.random() * 40 - 15;
        if (charIndex === role.length) { deleting = true; delay = HOLD_TIME; }
      } else {
        charIndex -= 1;
        target.textContent = role.slice(0, charIndex);
        delay = DELETE_SPEED;
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % ROLES.length;
          delay = GAP_TIME;
        }
      }
      window.setTimeout(tick, delay);
    }

    window.setTimeout(tick, HOLD_TIME + 1600);
  }

  /* ------------------------------------------------------------------------
     9. Editor card — the active line moves only while the card is on screen
     ------------------------------------------------------------------------ */
  function initEditor() {
    var editor = doc.getElementById('editor');
    if (!editor) return;

    var lines = toArray(editor.querySelectorAll('.editor__code li'));
    var position = doc.getElementById('editorPos');
    var order = [1, 2, 3, 5, 6, 8, 9];   // the lines worth pausing on
    var step = 0;
    var timer = null;

    function activate(index) {
      lines.forEach(function (line, i) { line.classList.toggle('is-active', i === index); });
      if (position && lines[index]) {
        position.textContent = 'Ln ' + (index + 1) + ', Col ' + (lines[index].textContent.length + 1);
      }
    }

    activate(order[0]);

    var command = doc.getElementById('consoleCmd');
    var output = doc.getElementById('consoleOut');
    var caret = doc.getElementById('consoleCaret');
    var commandText = command ? command.textContent : '';
    var hasRun = false;

    function runFile() {
      if (hasRun || !command || !output) return;
      hasRun = true;
      var index = 0;
      (function typeNext() {
        index += 1;
        command.textContent = commandText.slice(0, index);
        if (index < commandText.length) { window.setTimeout(typeNext, 55 + Math.random() * 45); return; }
        window.setTimeout(function () {
          output.style.opacity = '1';
          output.style.transform = 'none';
          if (caret) caret.style.display = 'none';
        }, 420);
      })();
    }

    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    // prepare the "not yet run" state only when it will actually be animated
    if (command && output) {
      command.textContent = '';
      output.style.opacity = '0';
      output.style.transform = 'translateY(6px)';
      output.style.transition = 'opacity 400ms ease, transform 400ms ease';
    }

    function advance() {
      if (doc.hidden) return;
      step = (step + 1) % order.length;
      activate(order[step]);
    }

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) window.setTimeout(runFile, 900);
      if (entries[0].isIntersecting && !timer) timer = window.setInterval(advance, 1700);
      else if (!entries[0].isIntersecting && timer) { window.clearInterval(timer); timer = null; }
    }, { threshold: 0.3 }).observe(editor);
  }

  /* ------------------------------------------------------------------------
     10. Contact validation (no backend: the form says so honestly)
     ------------------------------------------------------------------------ */
  function initContactForm() {
    var form = doc.getElementById('contactForm');
    var status = doc.getElementById('formStatus');
    if (!form) return;

    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var RULES = {
      name: function (value) { return value ? '' : 'Enter your name.'; },
      email: function (value) {
        if (!value) return 'Enter your email address.';
        return EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email address, like name@example.com.';
      },
      subject: function (value) { return value ? '' : 'Enter a subject.'; },
      message: function (value) { return value ? '' : 'Enter your message.'; }
    };

    var fields = toArray(form.querySelectorAll('.field__input'));

    function validateField(field) {
      var rule = RULES[field.name];
      if (!rule) return true;
      var message = rule(field.value.trim());
      var errorElement = doc.getElementById(field.id + 'Error');
      if (errorElement) errorElement.textContent = message;
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      return !message;
    }

    function setStatus(text, state) {
      if (!status) return;
      status.textContent = text;
      status.classList.toggle('is-ready', state === 'ready');
      status.classList.toggle('is-error', state === 'error');
      status.classList.toggle('is-sent', state === 'sent');
    }

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.value.trim() || field.hasAttribute('aria-invalid')) validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.hasAttribute('aria-invalid')) validateField(field);
        setStatus('', '');
      });
    });

    var submitButton = doc.getElementById('formSubmit');
    var submitLabel = doc.getElementById('formSubmitLabel');
    var sending = false;

    var done = doc.getElementById('formDone');
    var again = doc.getElementById('formAgain');

    function setSending(state) {
      sending = state;
      form.classList.toggle('is-sending', state);
      if (submitButton) submitButton.disabled = state;
      if (submitLabel) submitLabel.textContent = state ? 'Sending…' : 'Send Message';
    }

    // Swap the form for the delivery ticket (and back)
    function showDone(data) {
      if (!done) return;
      var who = doc.getElementById('formDoneName');
      if (who) who.textContent = data.name ? data.name.split(/\s+/)[0] : 'friend';
      var set = function (id, value) { var el = doc.getElementById(id); if (el) el.textContent = value; };
      set('ticketFrom', data.email || '—');
      set('ticketSubject', data.subject || '—');
      var now = new Date();
      set('ticketTime', now.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
      set('ticketRef', 'ES-' + String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 9000) + 1000));
      form.hidden = true;
      done.hidden = false;
      // restart the tracker animations each time
      Array.prototype.forEach.call(done.querySelectorAll('.track__step'), function (step) { step.style.animation = 'none'; step.offsetHeight; step.style.animation = ''; });
      if (window.gsap && !reducedMotion.matches) gsap.from(done.children, { y: 16, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' });
      done.setAttribute('tabindex', '-1'); done.focus({ preventScroll: true });
    }
    if (again) again.addEventListener('click', function () {
      done.hidden = true; form.hidden = false; setStatus('', '');
      var first = form.querySelector('.field__input'); if (first) first.focus({ preventScroll: true });
    });

    // Sends the message to the Google Apps Script web app, which appends a row to the sheet.
    // A URL-encoded POST is a "simple" request, so the browser needs no CORS pre-flight.
    function sendToSheet(data) {
      return window.fetch(FORM_ENDPOINT, { method: 'POST', body: new URLSearchParams(data) })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (result) {
          if (!result || result.ok !== true) throw new Error((result && result.error) || 'Rejected');
        });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) return;

      var invalid = fields.filter(function (field) { return !validateField(field); });
      if (invalid.length) {
        setStatus('Check the highlighted fields and try again.', 'error');
        invalid[0].focus();
        return;
      }

      // Not connected yet: say so instead of pretending.
      if (!FORM_ENDPOINT) {
        setStatus('Form is ready. Connect a backend or form service to enable message delivery.', 'ready');
        return;
      }

      var data = { page: window.location.href };
      toArray(form.elements).forEach(function (element) {
        if (element.name) data[element.name] = element.value.trim();
      });

      setSending(true);
      setStatus('', '');

      sendToSheet(data).then(function () {
        form.reset();
        setStatus('', '');
        showDone(data);
      }).catch(function () {
        // Only ever claim success when the sheet confirmed it.
        setStatus('Your message could not be sent right now. Please email essamuhammad5056@gmail.com or message me on WhatsApp.', 'error');
      }).then(function () {
        setSending(false);
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. Download CV feedback — check + "Downloaded" for ~800ms.
     The click is never prevented, so the browser download runs as normal.
     ------------------------------------------------------------------------ */
  function initDownloadCv() {
    var link = doc.getElementById('downloadCv');
    var label = doc.getElementById('downloadCvLabel');
    if (!link || !label) return;

    var original = label.textContent;
    var busy = false;
    var SWAP = 160;   // label cross-fade, ms
    var SHOW = 800;   // how long "Downloaded" stays

    function swapLabel(text, after) {
      link.classList.add('is-swapping');
      window.setTimeout(function () {
        label.textContent = text;
        link.classList.remove('is-swapping');
        if (after) after();
      }, SWAP);
    }

    if (!link.hasAttribute('download')) return;   // the link opens cv.html; feedback belongs to a direct download only

    link.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      link.style.minWidth = link.offsetWidth + 'px';   // the shorter word must not resize the button
      link.classList.add('is-done');

      swapLabel('Downloaded', function () {
        window.setTimeout(function () {
          link.classList.remove('is-done');
          swapLabel(original, function () {
            link.style.minWidth = '';
            busy = false;
          });
        }, SHOW);
      });
    });
  }

  /* ------------------------------------------------------------------------
     12. Start
     ------------------------------------------------------------------------ */
  function start() {
    fitWordmarks();
    initNavigation();
    initEditor();
    initContactForm();
    initDownloadCv();
    prepareHero();

    // Scroll scenes (pins, scrubs, the tech rail) are measured only after the loader has been
    // removed and the page can scroll, so nothing is calculated against a locked, covered page.
    afterLoader = function () {
      fitWordmarks();
      initScrollMotion();
      window.ESDEV_READY = true;
      doc.dispatchEvent(new CustomEvent('esdev:ready'));
      if (hasGsap && ScrollTrigger) {
        ScrollTrigger.refresh();
        [400, 1500, 3500].forEach(function (ms) { window.setTimeout(refreshWhenStill, ms); });
      }
      settleUntil = Date.now() + 4000;
    };

    runLoader(function () {
      fitWordmarks();
      playHero();
      initHeroPointer();
    });

    // Re-fit the wordmarks when the viewport or the fonts change
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { fitWordmarks(); if (hasGsap && ScrollTrigger) ScrollTrigger.refresh(); }, 150);
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fitWordmarks);
  }

  start();
})();
