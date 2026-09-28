/* Infinity Moments — cinta 3D del infinito, circuito ∞, respiración y scroll en bucle */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- bucle: al final, la web vuelve a empezar ---------- */
const hero = $('.hero');
const clone = hero.cloneNode(true);
clone.removeAttribute('id'); clone.setAttribute('aria-hidden', 'true'); clone.classList.add('hero--clone');
$$('a,button', clone).forEach(a => a.setAttribute('tabindex', '-1'));
$('#loop').appendChild(clone);
addEventListener('scroll', () => {
  const top = clone.offsetTop;
  if (scrollY >= top - 1) scrollTo(0, scrollY - top);
}, { passive: true });

/* ---------- cinta del infinito (three.js) ---------- */
(function ribbon() {
  if (!window.THREE) return;
  const scene = new THREE.Scene();
  class Lemni extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      const s = t * Math.PI * 2, a = 2.7, d = 1 + Math.sin(s) ** 2;
      return target.set(a * Math.cos(s) / d, a * Math.sin(s) * Math.cos(s) / d, .45 * Math.sin(s));
    }
  }
  const geo = new THREE.TubeGeometry(new Lemni(), 420, .34, 56, true);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xf5c2b6, roughness: .22, metalness: .15, clearcoat: 1, clearcoatRoughness: .12, reflectivity: .6 });
  const mesh = new THREE.Mesh(geo, mat);
  const group = new THREE.Group(); group.add(mesh); scene.add(group);
  scene.add(new THREE.HemisphereLight(0xfff3ee, 0xe9a39a, .9));
  const key = new THREE.PointLight(0xffffff, 1.2); key.position.set(3, 4, 6); scene.add(key);
  const rim = new THREE.PointLight(0xff8fa3, 1.4); rim.position.set(-5, -2, 3); scene.add(rim);
  const cool = new THREE.PointLight(0xa8c8ff, .7); cool.position.set(0, 3, -4); scene.add(cool);
  // polvo de estrellas
  const n = 260, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 12; pos[i * 3 + 1] = (Math.random() - .5) * 7; pos[i * 3 + 2] = (Math.random() - .5) * 6; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xe38c8c, size: .035, transparent: true, opacity: .7 }));
  scene.add(dust);

  const views = $$('canvas.ribbon').map(cv => {
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const cam = new THREE.PerspectiveCamera(34, 1, .1, 100); cam.position.z = 10;
    const v = { cv, r, cam, visible: true };
    new IntersectionObserver(([e]) => { v.visible = e.isIntersecting; }).observe(cv);
    return v;
  });
  function size() {
    views.forEach(v => {
      const w = v.cv.clientWidth, h = v.cv.clientHeight;
      v.r.setSize(w, h, false); v.cam.aspect = w / h; v.cam.updateProjectionMatrix();
    });
    const wide = innerWidth > 860;
    group.position.set(wide ? 2.1 : 0, wide ? 0 : 2.1, 0);
    group.scale.setScalar(wide ? 1 : Math.min(.52, innerWidth / 720));
  }
  size(); addEventListener('resize', size);
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
  const intro = { s: 0 };
  gsap.to(intro, { s: 1, duration: 2.4, ease: 'expo.out', delay: .2 });
  gsap.ticker.add((t) => {
    if (!views.some(v => v.visible)) return;
    mesh.rotation.x = Math.sin(t * .4) * .25 + mouse.y * .5;
    mesh.rotation.y = t * .25 + mouse.x * .8;
    mesh.rotation.z = Math.sin(t * .3) * .1;
    mesh.scale.setScalar(.2 + .8 * intro.s);
    dust.rotation.y = t * .03;
    views.forEach(v => v.visible && v.r.render(scene, v.cam));
  });
})();

/* ---------- entrada ---------- */
gsap.from('.hero:not(.hero--clone) .hero__txt > *', { y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .1, delay: .3 });

/* ---------- circuito: tarjetas que viajan por el ∞ ---------- */
ScrollTrigger.matchMedia({
  '(min-width: 861px)': () => {
    const path = $('#lemni'), cards = $$('.card');
    const d = [];
    for (let i = 0; i <= 200; i++) {
      const s = i / 200 * Math.PI * 2, a = 450, k = 1 + Math.sin(s) ** 2;
      d.push(`${(500 + a * Math.cos(s) / k).toFixed(1)},${(250 + a * 1.25 * Math.sin(s) * Math.cos(s) / k).toFixed(1)}`);
    }
    path.setAttribute('d', 'M' + d.join(' L') + 'Z');
    const L = path.getTotalLength();
    const place = p => {
      const W = innerWidth, H = innerHeight;
      const ox = W * .06, oy = H * .12, sw = W * .88, sh = H * .76;
      cards.forEach((c, i) => {
        const f = ((i / cards.length + p) % 1 + 1) % 1;
        const pt = path.getPointAtLength(f * L);
        const x = ox + pt.x / 1000 * sw, y = oy + pt.y / 500 * sh;
        const depth = .82 + .22 * Math.cos(f * Math.PI * 4);
        c.style.transform = `translate(${x - c.offsetWidth / 2}px,${y - c.offsetHeight / 2}px) scale(${depth.toFixed(3)}) rotate(${(Math.sin(f * Math.PI * 2) * 6).toFixed(2)}deg)`;
        c.style.zIndex = Math.round(depth * 100);
      });
    };
    place(0);
    const st = ScrollTrigger.create({ trigger: '.circuit', start: 'top top', end: 'bottom bottom', scrub: .8, onUpdate: s => place(s.progress * .85) });
    const onR = () => place(st.progress * .85);
    addEventListener('resize', onR);
    return () => { removeEventListener('resize', onR); cards.forEach(c => c.style.transform = ''); };
  }
});

/* ---------- respira: 1 minuto infinito ---------- */
(function breath() {
  const path = $('#bpath'), trail = $('#btrail'), dot = $('#bdot'), word = $('#bword'), btn = $('#bstart');
  const L = path.getTotalLength();
  trail.style.strokeDasharray = `0 ${L}`;
  let tw;
  btn.addEventListener('click', () => {
    tw && tw.kill();
    btn.textContent = 'Reiniciar';
    const st = { t: 0 };
    const cycles = 7.5; // 8 s por ciclo ≈ 1 minuto
    tw = gsap.to(st, {
      t: cycles, duration: cycles * 8, ease: 'none',
      onUpdate: () => {
        const f = st.t % 1;
        const pt = path.getPointAtLength(f * L);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        trail.style.strokeDasharray = `${(f * L).toFixed(1)} ${L}`;
        const inhale = f < .5;
        const txt = inhale ? 'Inspira…' : 'Espira…';
        if (word.textContent !== txt) { word.textContent = txt; gsap.fromTo(word, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6 }); }
        dot.setAttribute('r', (12 + (inhale ? f * 2 : (1 - f) * 2) * 6).toFixed(1));
      },
      onComplete: () => { word.textContent = 'Un minuto para ti. ¿Te imaginas una hora?'; btn.textContent = 'Otra vez'; }
    });
  });
})();

/* ---------- apariciones ---------- */
$$('.story__img, .story__txt, .breath > *, .quote--big, .quotes__row blockquote, .contact__card').forEach(n => {
  gsap.from(n, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 88%' } });
});
ScrollTrigger.refresh();
