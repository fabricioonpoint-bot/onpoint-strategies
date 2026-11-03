/* =========================================================
   CONFIGURACIÓN: edita solo este bloque
   ========================================================= */
const CONFIG = {
  // WhatsApp comercial: código de país + número, solo dígitos (Perú: 51 + 9 dígitos).
  // Si se llena, el formulario abre WhatsApp y aparece el botón flotante.
  whatsapp: "",
  // Perfil de Instagram (respaldo del formulario si no hay WhatsApp).
  instagram: "https://www.instagram.com/onpoint.mkt.pe/",
  instagramHandle: "@onpoint.mkt.pe",
  // Correo de contacto (opcional). Si se llena, aparece en el footer.
  email: "",
  // Medición (opcional). Se cargan solo si tienen un ID.
  metaPixelId: "",
  ga4Id: "",
};
/* ========================================================= */

document.documentElement.classList.add("js");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Menú móvil ---------- */
const menuButton = document.getElementById("menu-toggle");
const nav = document.getElementById("site-nav");
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}
menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => event.key === "Escape" && setMenu(false));
window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setMenu(false));

/* ---------- Progreso de lectura, header y sección activa ---------- */
const progress = document.getElementById("scroll-progress");
const header = document.querySelector(".site-header");
const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.nav-cta-mobile)')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${(window.scrollY / max).toFixed(4)})`;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    const anchor = window.scrollY + window.innerHeight * 0.35;
    let current = "";
    sections.forEach((s) => { if (s.offsetTop <= anchor) current = `#${s.id}`; });
    navLinks.forEach((a) => {
      const on = a.getAttribute("href") === current;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
onScroll();

/* ---------- Revelado de contenido al bajar ---------- */
if (!reducedMotion && "IntersectionObserver" in window) {
  const items = document.querySelectorAll(
    ".section-head, .approach, .svc-filter, .svc-layout, .route, .process-step, .id-copy, .tabs, .audience, .faq-layout > *, .contact-layout > *",
  );
  items.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--d", `${(i % 3) * 80}ms`);
  });
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------- Canales de contacto ---------- */
const whatsappDigits = CONFIG.whatsapp.replace(/\D/g, "");
const hasWhatsapp = /^\d{11,15}$/.test(whatsappDigits);
const waLink = (text) => `https://wa.me/${whatsappDigits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

const waFloat = document.getElementById("wa-float");
if (hasWhatsapp) {
  waFloat.href = waLink("Hola, equipo On Point Strategies. Quisiera información sobre sus servicios.");
  waFloat.hidden = false;
}
document.querySelectorAll("[data-contact]").forEach((link) => {
  const type = link.dataset.contact;
  if (type === "whatsapp" && hasWhatsapp) { link.href = waLink(""); link.hidden = false; }
  if (type === "email" && CONFIG.email) { link.href = `mailto:${CONFIG.email}`; link.textContent = CONFIG.email; link.hidden = false; }
  if (type === "instagram") link.href = CONFIG.instagram;
});
if (hasWhatsapp) {
  document.getElementById("form-note").textContent =
    "No guardamos tus datos en esta página: al enviar se abre WhatsApp con tu mensaje listo.";
}

/* ---------- Formulario ---------- */
const form = document.getElementById("brief-form");
const select = document.getElementById("servicio");
const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 6000);
}

// Los botones de cada servicio dejan elegido ese servicio en el formulario
document.querySelectorAll(".plan-link").forEach((link) =>
  link.addEventListener("click", () => {
    const option = [...select.options].find((o) => o.value === link.dataset.plan);
    if (option) select.value = option.value;
  }),
);

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(value); return true; } catch (e) { /* respaldo abajo */ }
  }
  const temp = document.createElement("textarea");
  temp.value = value;
  temp.setAttribute("readonly", "");
  temp.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(temp);
  temp.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  temp.remove();
  return ok;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const name = form.nombre.value.trim();
  const business = form.negocio.value.trim();
  const type = form.tipo.value;
  const plan = select.value;
  const goal = form.objetivo.value.trim();
  const message =
    `Hola, equipo On Point Strategies. Me llamo ${name}.\n` +
    `Mi negocio: ${business} (${type}).\n` +
    `Me interesa: ${plan}.` +
    (goal ? `\nSobre mi negocio y lo que quiero lograr: ${goal}` : "") +
    `\n¿Me cuentan la propuesta y los próximos pasos?`;

  track("Lead", { content_name: plan });

  if (hasWhatsapp) {
    window.open(waLink(message), "_blank", "noopener,noreferrer");
    showToast("Abrimos WhatsApp con tu mensaje listo. Solo tienes que enviarlo.");
    return;
  }
  // Sin WhatsApp: se abre Instagram dentro del mismo clic (evita bloqueos) y se copia el mensaje
  window.open(CONFIG.instagram, "_blank", "noopener,noreferrer");
  const copied = await copyText(message);
  showToast(
    copied
      ? `Tu mensaje está copiado. Pégalo en un mensaje directo a ${CONFIG.instagramHandle}.`
      : `Escríbenos por mensaje directo a ${CONFIG.instagramHandle} en Instagram.`,
  );
});

/* ---------- Carta de servicios: filtro por objetivo, detalle y mira ---------- */
const services = [...document.querySelectorAll(".svc")];
const chips = [...document.querySelectorAll(".svc-chip")];
const target = document.querySelector(".target");
const targetName = document.getElementById("target-name");
const targetNote = document.getElementById("target-note");
const targetDefault = { name: targetName?.textContent, note: targetNote?.textContent };
const RING_RADIUS = { 1: 58, 2: 104, 3: 150 };

// Cada nombre de anillo lleva su propia pastilla del ancho justo
target?.querySelectorAll(".t-tag").forEach((tag) => {
  const text = tag.querySelector("text");
  const rect = tag.querySelector("rect");
  const fit = () => {
    const w = text.getComputedTextLength() + 20;
    rect.setAttribute("x", (-w / 2).toFixed(1));
    rect.setAttribute("width", w.toFixed(1));
  };
  fit();
  document.fonts?.ready.then(fit);
});

// Onda que sale del punto hasta el anillo activo
function pulseTo(ring) {
  const pulse = target?.querySelector(".t-pulse");
  if (!pulse || reducedMotion) return;
  pulse.style.setProperty("--s", ((RING_RADIUS[ring] || 150) / 24).toFixed(2));
  pulse.classList.remove("is-pulsing");
  void pulse.getBBox();
  pulse.classList.add("is-pulsing");
}

function showOnTarget(svc) {
  if (!target) return;
  const ring = svc ? svc.dataset.ring : "";
  if (target.dataset.active !== ring && ring) {
    const el = target.querySelector(`.t-ring-${ring}`);
    el.classList.remove("is-drawing");
    void el.getBBox();
    el.classList.add("is-drawing");
    pulseTo(ring);
  }
  target.dataset.active = ring;
  targetName.textContent = svc ? svc.querySelector(".svc-name").textContent : targetDefault.name;
  targetNote.textContent = svc ? svc.dataset.note : targetDefault.note;
}
// Sin nada elegido, la mira late cada tanto para invitar a pasar por un servicio
if (target && !reducedMotion) setInterval(() => { if (!target.dataset.active) pulseTo(3); }, 3200);

const openService = () => services.find((s) => s.querySelector("details").open);

function setFilter(goal) {
  chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === goal)));
  services.forEach((s) => {
    const match = goal === "todos" || s.dataset.goals.split(" ").includes(goal);
    s.classList.toggle("is-dim", !match);
    s.classList.toggle("is-match", match && goal !== "todos");
  });
  // Al elegir un objetivo, se abre el servicio principal para ese objetivo
  const primary = services.find((s) => s.dataset.primary === goal) || null;
  services.forEach((s) => { s.querySelector("details").open = s === primary; });
  showOnTarget(primary);
}
chips.forEach((chip) => chip.addEventListener("click", () => setFilter(chip.dataset.filter)));

services.forEach((svc) => {
  const details = svc.querySelector("details");
  svc.addEventListener("pointerenter", () => showOnTarget(svc));
  svc.addEventListener("pointerleave", () => showOnTarget(openService() || null));
  details.addEventListener("toggle", () => {
    if (details.open) {
      // Un servicio abierto a la vez, para que la carta se lea fácil
      services.forEach((other) => { if (other !== svc) other.querySelector("details").open = false; });
      svc.classList.remove("is-dim");
      showOnTarget(svc);
    } else if (!openService()) {
      showOnTarget(null);
    }
  });
});

// "¿Qué necesitas hoy?" del hero: lleva a la carta con el objetivo ya elegido
document.querySelectorAll(".goal").forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setFilter(link.dataset.goal);
    // Con la mira visible se muestra la carta completa; sin ella, el servicio abierto
    const withTarget = window.matchMedia("(min-width: 981px)").matches;
    const destination = withTarget
      ? document.getElementById("carta")
      : services.find((s) => s.dataset.primary === link.dataset.goal) || document.getElementById("carta");
    destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }),
);

/* ---------------------------------------------------------
   Órbita del hero: tres anillos en perspectiva alrededor del isotipo.
   Cada anillo pasa por delante y por detrás del centro; los puntos 01, 02 y 03
   giran con su estela, hay satélites y estrellas en 3D, y al bajar la órbita
   se abre y se desvanece hacia la siguiente sección.
   --------------------------------------------------------- */
(function orbit() {
  const svg = document.getElementById("orbit");
  const stage = document.getElementById("hero-stage");
  if (!svg || !stage) return;
  const NS = "http://www.w3.org/2000/svg";
  const CX = 500, CY = 400;
  const RINGS = [
    { r: 180, k: 0.6, roll: -0.38, speed: 0.42, start: 2.5, sats: 4 },
    { r: 275, k: 0.46, roll: 0.24, speed: -0.28, start: 0.35, sats: 6 },
    { r: 370, k: 0.34, roll: -0.08, speed: 0.18, start: 1.3, sats: 8 },
  ];
  const q = (sel) => [...svg.querySelectorAll(sel)];
  const backHalves = q(".o-halves-back .o-half");
  const frontHalves = q(".o-halves-front .o-half");
  const ripples = q(".o-ripple");
  const links = q(".o-link");
  const nodes = q(".o-node");
  const far = svg.querySelector(".o-ring-far");
  const back = svg.querySelector(".o-back");
  const front = svg.querySelector(".o-front");
  const satsBack = svg.querySelector(".o-sats-back");
  const satsFront = svg.querySelector(".o-sats-front");
  const make = (tag, cls, parent) => {
    const el = document.createElementNS(NS, tag);
    el.setAttribute("class", cls);
    parent.appendChild(el);
    return el;
  };
  // Los nombres van en la capa de arriba: el isotipo nunca los tapa
  const labelsLayer = make("g", "o-labels", svg);
  const tags = nodes.map((n) => {
    const g = make("g", "o-tag", labelsLayer);
    n.querySelectorAll("text").forEach((t) => g.appendChild(t));
    return g;
  });

  // Satélites: puntos pequeños que viajan por cada anillo
  const sats = [];
  RINGS.forEach((ring, i) => {
    for (let j = 0; j < ring.sats; j++) sats.push({ ring: i, off: (j / ring.sats) * Math.PI * 2 + 0.5, el: make("circle", "o-sat", satsBack) });
  });
  // Estelas detrás de los puntos con nombre
  const TRAIL = 12;
  const trailsG = svg.querySelector(".o-trails");
  const trails = nodes.map(() => Array.from({ length: TRAIL }, () => make("line", "o-trail", trailsG)));
  // Estrellas en una esfera que gira lentamente (profundidad real)
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const starsG = svg.querySelector(".o-stars");
  const stars = Array.from({ length: 48 }, () => {
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2, R = 300 + rand() * 340, s = Math.sqrt(1 - u * u);
    return { x: R * s * Math.cos(th), y: R * u * 0.75, z: R * s * Math.sin(th), size: 0.9 + rand() * 1.9, tw: rand() * 6.28, el: make("circle", "o-star", starsG) };
  });

  // Medidas de las etiquetas para ubicarlas sin chocar
  let labelBox = [];
  let compact = false;
  let safe = { x0: 60, x1: 940 };
  const measure = () => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const scale = Math.max(rect.width / 1000, rect.height / 800);
    const visW = rect.width / scale;
    const absolute = getComputedStyle(stage).position === "absolute";
    const left = 500 - visW / 2;
    safe = { x0: left + visW * 0.05, x1: 500 + visW / 2 - visW * 0.05 };
    if (absolute) {
      // Las etiquetas empiezan donde termina el texto del hero (letras y botones reales)
      let copyRight = 0;
      const walker = document.createTreeWalker(document.querySelector(".hero-copy"), NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        range.selectNodeContents(walker.currentNode);
        [...range.getClientRects()].forEach((r) => { copyRight = Math.max(copyRight, r.right); });
      }
      document.querySelectorAll(".hero-copy .goal, .hero-copy .btn").forEach((el) => { copyRight = Math.max(copyRight, el.getBoundingClientRect().right); });
      safe.x0 = Math.max(safe.x0, left + (copyRight + 28 - rect.left) / scale);
    }
    compact = !absolute;
    labelBox = tags.map((n) => {
      const [label, caption] = n.querySelectorAll("text");
      const capVisible = getComputedStyle(caption).display !== "none";
      const lh = parseFloat(getComputedStyle(label).fontSize) || 15;
      const ch = capVisible ? parseFloat(getComputedStyle(caption).fontSize) || 16 : 0;
      const w = Math.max(label.getComputedTextLength(), capVisible ? caption.getComputedTextLength() : 0);
      return { w, lh, ch };
    });
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });
  document.fonts?.ready.then(measure);

  // El cursor inclina el plano
  let tiltTarget = 0, tilt = 0, rollTarget = 0, roll = 0;
  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const hero = document.querySelector(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      rollTarget = ((e.clientX - (r.left + r.width / 2)) / r.width) * 0.2;
      tiltTarget = ((e.clientY - (r.top + r.height / 2)) / r.height) * 0.14;
    });
    hero.addEventListener("pointerleave", () => { rollTarget = 0; tiltTarget = 0; });
  }

  const planeOf = (i, t, grow) => {
    const ring = RINGS[i];
    const k = Math.max(0.12, ring.k + 0.06 * Math.sin(t * 0.38 + i * 1.7) + tilt) * (1 - grow * 0.35);
    const rl = ring.roll + 0.12 * Math.sin(t * 0.24 + i * 2.1) + roll;
    return { r: ring.r * (1 + grow * 0.5), k, rl, cos: Math.cos(rl), sin: Math.sin(rl), deg: (rl * 180) / Math.PI };
  };
  const at = (pl, a) => {
    const x = pl.r * Math.cos(a), z = pl.r * Math.sin(a) * pl.k;
    return [CX + x * pl.cos - z * pl.sin, CY + x * pl.sin + z * pl.cos];
  };
  const f1 = (n) => n.toFixed(1);

  function frame(t, grow) {
    tilt += (tiltTarget - tilt) * 0.06;
    roll += (rollTarget - roll) * 0.06;
    const planes = RINGS.map((_, i) => planeOf(i, t, grow));

    // Anillos partidos en dos mitades: la de atrás pasa detrás del isotipo, la de adelante por encima
    planes.forEach((pl, i) => {
      const [x0, y0] = at(pl, 0), [x1, y1] = at(pl, Math.PI);
      const arc = `${f1(pl.r)} ${f1(pl.r * pl.k)} ${pl.deg.toFixed(2)} 0 1`;
      frontHalves[i].setAttribute("d", `M${f1(x0)} ${f1(y0)}A${arc} ${f1(x1)} ${f1(y1)}`);
      backHalves[i].setAttribute("d", `M${f1(x1)} ${f1(y1)}A${arc} ${f1(x0)} ${f1(y0)}`);
    });
    const outer = planes[2];
    far.setAttribute("rx", f1(520 * (1 + grow * 0.5)));
    far.setAttribute("ry", f1(520 * outer.k * 0.6));
    far.setAttribute("transform", `rotate(${(outer.deg * 0.6).toFixed(2)} ${CX} ${CY})`);

    // Ondas que salen del centro, como el clic de la mira
    const mid = planes[1];
    ripples.forEach((rp, i) => {
      const p = (t * 0.28 + i * 0.5) % 1;
      const r = 70 + p * 420;
      rp.setAttribute("rx", f1(r));
      rp.setAttribute("ry", f1(r * mid.k));
      rp.setAttribute("transform", `rotate(${mid.deg.toFixed(2)} ${CX} ${CY})`);
      rp.style.opacity = ((1 - p) * 0.32).toFixed(3);
    });

    // Satélites
    sats.forEach((s) => {
      const pl = planes[s.ring];
      const a = RINGS[s.ring].start + s.off + RINGS[s.ring].speed * t;
      const [x, y] = at(pl, a);
      const depth = Math.sin(a);
      s.el.setAttribute("cx", f1(x));
      s.el.setAttribute("cy", f1(y));
      s.el.setAttribute("r", (1.6 + 1.6 * ((depth + 1) / 2)).toFixed(2));
      s.el.style.opacity = (0.25 + 0.6 * ((depth + 1) / 2)).toFixed(2);
      const layer = depth < 0 ? satsBack : satsFront;
      if (s.el.parentNode !== layer) layer.appendChild(s.el);
    });

    // Estrellas
    const th = t * 0.05 + roll * 2, ph = 0.32 + tilt;
    const ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
    stars.forEach((s) => {
      const x = s.x * ct + s.z * st;
      const z1 = -s.x * st + s.z * ct;
      const y = s.y * cp - z1 * sp;
      const z = s.y * sp + z1 * cp;
      const persp = 900 / (900 + z);
      s.el.setAttribute("cx", f1(CX + x * persp * (1 + grow * 0.6)));
      s.el.setAttribute("cy", f1(CY + y * persp * (1 + grow * 0.6)));
      s.el.setAttribute("r", (s.size * persp).toFixed(2));
      const twinkle = 0.55 + 0.45 * Math.sin(t * 1.6 + s.tw);
      s.el.style.opacity = Math.max(0, Math.min(0.85, (persp - 0.55) * 1.1 * twinkle)).toFixed(2);
    });

    // Puntos con nombre: posición, estela y etiqueta en un lugar libre
    const info = nodes.map((node, i) => {
      const pl = planes[i];
      const a = RINGS[i].start + RINGS[i].speed * t;
      const [px, py] = at(pl, a);
      const depth = Math.sin(a);
      const scale = 0.8 + 0.36 * ((depth + 1) / 2);
      const dir = Math.sign(RINGS[i].speed);
      trails[i].forEach((seg, j) => {
        const [ax, ay] = at(pl, a - dir * j * 0.05);
        const [bx, by] = at(pl, a - dir * (j + 1) * 0.05);
        seg.setAttribute("x1", f1(ax)); seg.setAttribute("y1", f1(ay));
        seg.setAttribute("x2", f1(bx)); seg.setAttribute("y2", f1(by));
        const fade = 1 - j / TRAIL;
        seg.setAttribute("stroke-width", (0.6 + 3.4 * fade * scale).toFixed(2));
        seg.style.opacity = (fade * fade * (0.25 + 0.5 * ((depth + 1) / 2))).toFixed(3);
      });
      const m = labelBox[i] || { w: 150, lh: 15, ch: 16 };
      return { node, i, px, py, depth, scale, w: (m.w + 26) * scale, lh: m.lh, ch: m.ch, right: px >= CX, below: false };
    });
    const box = (n, right, below) => {
      const x0 = right ? n.px + 24 * n.scale : n.px - 24 * n.scale - n.w;
      const top = below ? 22 : -(n.lh + 12);
      const height = n.lh + (n.ch ? n.ch + 10 : 4);
      return [x0, n.py + top * n.scale, x0 + n.w, n.py + (top + height) * n.scale];
    };
    const hit = (p, r) => p[0] < r[2] && r[0] < p[2] && p[1] < r[3] && r[1] < p[3];
    const core = [CX - 106, CY - 106, CX + 106, CY + 106];
    // Cada etiqueta elige el lugar con menos problemas: nunca encima de otra,
    // nunca sobre el texto del hero, y en lo posible fuera del isotipo
    const placed = [];
    [...info].sort((p, r) => r.depth - p.depth).forEach((n) => {
      const options = [[n.right, false], [n.right, true], [!n.right, false], [!n.right, true]];
      let best = options[0], bestScore = Infinity;
      options.forEach((opt, order) => {
        const b = box(n, opt[0], opt[1]);
        const score =
          placed.filter((r) => hit(b, r)).length * 100 +
          (b[0] < safe.x0 || b[2] > safe.x1 ? 60 : 0) +
          (hit(b, core) ? 20 : 0) +
          order;
        if (score < bestScore) { bestScore = score; best = opt; }
      });
      [n.right, n.below] = best;
      // Si no hay lugar limpio (el punto pasa detrás del texto o de otra etiqueta), su nombre se apaga un momento
      n.muted = bestScore >= 60;
      if (!n.muted) placed.push(box(n, n.right, n.below));
    });
    info.forEach((n) => {
      n.node.setAttribute("transform", `translate(${f1(n.px)} ${f1(n.py)}) scale(${n.scale.toFixed(3)})`);
      n.node.style.opacity = (0.5 + 0.5 * ((n.depth + 1) / 2)).toFixed(3);
      const tag = tags[n.i];
      tag.setAttribute("transform", `translate(${f1(n.px)} ${f1(n.py)}) scale(${n.scale.toFixed(3)})`);
      tag.style.opacity = (0.65 + 0.35 * ((n.depth + 1) / 2)).toFixed(3);
      const [label, caption] = tag.querySelectorAll("text");
      const x = n.right ? 24 : -24;
      [label, caption].forEach((txt) => {
        txt.setAttribute("text-anchor", n.right ? "start" : "end");
        txt.setAttribute("x", x);
      });
      label.setAttribute("y", n.below ? 22 + n.lh : -12);
      caption.setAttribute("y", n.below ? 22 + n.lh + 8 + n.ch : 6 + n.ch * 0.6);
      // En pantallas chicas solo se nombran los puntos que pasan por delante
      const hide = (compact && n.depth < -0.1) || n.muted;
      label.style.opacity = hide ? "0" : "1";
      caption.style.opacity = hide ? "0" : "1";
      const layer = n.depth < 0 ? back : front;
      if (n.node.parentNode !== layer) layer.appendChild(n.node);
      links[n.i].setAttribute("d", `M${f1(n.px)} ${f1(n.py)}L${CX} ${CY}`);
    });
  }

  // Transición al bajar: la órbita se abre, baja un poco y se desvanece
  const headerH = () => document.querySelector(".site-header")?.offsetHeight || 0;
  function scrollGrow() {
    const r = stage.getBoundingClientRect();
    return Math.max(0, Math.min(1, (headerH() - r.top) / (r.height * 0.9)));
  }

  if (reducedMotion) { frame(0, 0); return; }
  let running = true;
  const t0 = performance.now();
  function loop(now) {
    if (running && !document.hidden) {
      const g = scrollGrow();
      stage.style.opacity = (1 - g * 0.85).toFixed(3);
      stage.style.transform = `translate3d(0, ${(g * 36).toFixed(1)}px, 0) scale(${(1 + g * 0.14).toFixed(3)})`;
      frame((now - t0) / 1000, g);
    }
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { running = e.isIntersecting; }).observe(stage);
  frame(0, 0);
  requestAnimationFrame(loop);
})();

/* ---------- Identidad: el librito como libro que se hojea ---------- */
(function flipbook() {
  const book = document.getElementById("flipbook");
  const tpl = document.getElementById("book-pages");
  if (!book || !tpl) return;
  const holder = book.querySelector(".fb-pages");
  const pages = [...tpl.content.children];
  const prevBtn = document.getElementById("fb-prev");
  const nextBtn = document.getElementById("fb-next");
  const count = document.getElementById("fb-count");
  const toc = [...document.querySelectorAll(".toc [data-page]")];
  const stage = book.parentElement;
  const TOTAL = pages.length;
  let mode = null, leaves = [], state = 0, maxState = 0, touched = false, timer = null, inView = false, hovering = false;
  const moving = new Set();

  const makeLeaf = (frontPage, backPage) => {
    const leaf = document.createElement("div");
    leaf.className = "leaf";
    const f = document.createElement("div");
    f.className = "face face-front";
    f.appendChild(frontPage.cloneNode(true));
    leaf.appendChild(f);
    if (backPage) {
      const b = document.createElement("div");
      b.className = "face face-back";
      b.appendChild(backPage.cloneNode(true));
      leaf.appendChild(b);
    }
    return leaf;
  };

  function build(newMode) {
    const firstPage = mode === "spread" ? Math.max(0, state * 2 - 1) : state;
    mode = newMode;
    holder.textContent = "";
    leaves = [];
    moving.clear();
    book.classList.toggle("is-single", mode === "single");
    if (mode === "spread") {
      for (let i = 0; i < TOTAL; i += 2) leaves.push(makeLeaf(pages[i], pages[i + 1]));
      maxState = leaves.length;
    } else {
      pages.forEach((p) => leaves.push(makeLeaf(p, null)));
      maxState = leaves.length - 1;
    }
    leaves.forEach((l) => holder.appendChild(l));
    book.classList.add("no-anim");
    state = -1;
    go(mode === "spread" ? Math.ceil(firstPage / 2) : firstPage, false);
    void book.offsetWidth;
    book.classList.remove("no-anim");
  }

  function restack() {
    leaves.forEach((leaf, i) => {
      if (moving.has(i)) return;
      leaf.style.zIndex = leaf.classList.contains("is-flipped") ? i + 1 : leaves.length - i;
    });
  }

  function go(target, stagger) {
    target = Math.max(0, Math.min(maxState, target));
    if (target === state) return;
    const forward = target > state;
    state = target;
    const changing = [];
    leaves.forEach((leaf, i) => {
      if (leaf.classList.contains("is-flipped") !== i < state) changing.push(i);
    });
    if (!forward) changing.reverse();
    changing.forEach((i, n) => {
      const leaf = leaves[i];
      const delay = stagger ? n * 120 : 0;
      moving.add(i);
      leaf.style.transitionDelay = `${delay}ms`;
      leaf.style.zIndex = 200 + (forward ? n : changing.length - n);
      leaf.classList.toggle("is-flipped", i < state);
      clearTimeout(leaf._t);
      leaf._t = setTimeout(() => { leaf.style.transitionDelay = ""; moving.delete(i); restack(); }, delay + 1100);
    });
    restack();
    leaves.forEach((leaf, i) => {
      leaf.classList.toggle("is-top", i === state);
      leaf.classList.toggle("is-top-left", mode === "spread" && i === state - 1);
      leaf.querySelectorAll(".face").forEach((face) => face.setAttribute("aria-hidden", "true"));
    });
    // Caras visibles para lectores de pantalla
    const visible = mode === "spread" ? [leaves[state - 1]?.querySelector(".face-back"), leaves[state]?.querySelector(".face-front")] : [leaves[state]?.querySelector(".face-front")];
    visible.forEach((face) => face?.removeAttribute("aria-hidden"));
    book.dataset.at = mode === "spread" ? (state === 0 ? "start" : state === maxState ? "end" : "") : "";
    prevBtn.disabled = state === 0;
    nextBtn.disabled = state === maxState;
    let label;
    if (mode === "spread") label = state === 0 ? "Portada" : state === maxState ? "Contraportada" : `Págs. ${state * 2}–${state * 2 + 1} de ${TOTAL}`;
    else label = state === 0 ? "Portada" : state === maxState ? "Contraportada" : `Pág. ${state + 1} de ${TOTAL}`;
    count.textContent = label;
    const lastVisible = mode === "spread" ? Math.min(state * 2, TOTAL - 1) : state;
    let current = 0;
    toc.forEach((b, k) => { if (Number(b.dataset.page) <= lastVisible) current = k; });
    toc.forEach((b, k) => b.setAttribute("aria-current", String(k === current)));
  }

  const next = () => go(state + 1, false);
  const prev = () => go(state - 1, false);
  const userAction = (fn) => { touched = true; stopAuto(); fn(); };

  prevBtn.addEventListener("click", () => userAction(prev));
  nextBtn.addEventListener("click", () => userAction(next));
  toc.forEach((b) => b.addEventListener("click", () => userAction(() => {
    const p = Number(b.dataset.page);
    go(mode === "spread" ? Math.ceil(p / 2) : p, true);
  })));
  book.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); userAction(next); }
    if (e.key === "ArrowLeft") { e.preventDefault(); userAction(prev); }
  });
  // Tocar una página la pasa; deslizar también
  let downX = null;
  book.addEventListener("pointerdown", (e) => { downX = e.clientX; });
  book.addEventListener("pointerup", (e) => {
    if (downX === null) return;
    const dx = e.clientX - downX;
    downX = null;
    if (Math.abs(dx) > 40) { userAction(dx < 0 ? next : prev); return; }
    const leaf = e.target.closest(".leaf");
    if (!leaf) return;
    userAction(leaf.classList.contains("is-flipped") && mode === "spread" ? prev : next);
  });
  book.addEventListener("pointerenter", () => { hovering = true; });
  book.addEventListener("pointerleave", () => { hovering = false; stage.style.setProperty("--rx", "0deg"); stage.style.setProperty("--ry", "0deg"); });
  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    book.addEventListener("pointermove", (e) => {
      const r = book.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      stage.style.setProperty("--ry", `${(dx * 6).toFixed(2)}deg`);
      stage.style.setProperty("--rx", `${(-dy * 5).toFixed(2)}deg`);
    });
  }

  // Recorrido automático mientras se ve y nadie lo toca
  function stopAuto() { clearInterval(timer); timer = null; }
  function startAuto() {
    if (reducedMotion || touched || timer) return;
    timer = setInterval(() => {
      if (!inView || hovering || document.hidden) return;
      if (state < maxState) go(state + 1, false);
      else go(0, true);
    }, 3400);
  }
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) startAuto();
  }, { threshold: 0.45 }).observe(book);

  // Libro abierto (dos páginas) si hay espacio; una página en pantallas chicas
  const pick = () => (stage.clientWidth >= 560 ? "spread" : "single");
  build(pick());
  new ResizeObserver(() => { const m = pick(); if (m !== mode) build(m); }).observe(stage);
})();

/* ---------- Cada servicio a detalle: pestañas ---------- */
const detailTabs = [...document.querySelectorAll(".tabs .tab")];
function openTab(name) {
  detailTabs.forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.setAttribute("aria-selected", String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !on;
  });
}
detailTabs.forEach((tab, i) => {
  tab.addEventListener("click", () => openTab(tab.dataset.tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = detailTabs[(i + (e.key === "ArrowRight" ? 1 : -1) + detailTabs.length) % detailTabs.length];
    next.focus();
    openTab(next.dataset.tab);
  });
});
// "Ver cómo funciona" en la carta abre la pestaña de ese servicio
document.querySelectorAll(".detail-link").forEach((link) => link.addEventListener("click", () => openTab(link.dataset.tab)));
openTab("tarjetas");

// La tarjeta de presentación gira para mostrar sus dos caras
(function flipCard() {
  const card = document.querySelector(".biz-card");
  if (!card) return;
  card.addEventListener("click", () => card.classList.toggle("is-flipped"));
  if (reducedMotion) return;
  setInterval(() => {
    if (!document.getElementById("panel-tarjetas").hidden) card.classList.toggle("is-flipped");
  }, 3000);
})();

document.getElementById("year").textContent = String(new Date().getFullYear());

/* ---------- Medición opcional (Meta Pixel y Google Analytics 4) ---------- */
function track(eventName, params) {
  if (window.fbq) window.fbq("track", eventName, params);
  if (window.gtag) window.gtag("event", eventName === "Lead" ? "generate_lead" : eventName, params);
}
if (CONFIG.metaPixelId) {
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq("init", CONFIG.metaPixelId);
  window.fbq("track", "PageView");
}
if (CONFIG.ga4Id) {
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4Id)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", CONFIG.ga4Id);
}
