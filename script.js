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
    ".section-head, .approach, .svc-filter, .svc-layout, .route, .process-step, .id-layout, .tabs, .audience, .faq-layout > *, .contact-layout > *",
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
const targetKicker = document.getElementById("target-kicker");
const targetName = document.getElementById("target-name");
const targetNote = document.getElementById("target-note");
const targetDefault = { kicker: targetKicker?.textContent, name: targetName?.textContent, note: targetNote?.textContent };

function showOnTarget(svc) {
  if (!target) return;
  if (!svc) {
    target.dataset.active = "";
    targetKicker.textContent = targetDefault.kicker;
    targetName.textContent = targetDefault.name;
    targetNote.textContent = targetDefault.note;
    return;
  }
  target.dataset.active = svc.dataset.ring;
  targetKicker.textContent = svc.dataset.kicker;
  targetName.textContent = svc.querySelector(".svc-name").textContent;
  targetNote.textContent = svc.dataset.note;
}
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
    const withTarget = window.matchMedia("(min-width: 1101px)").matches;
    const destination = withTarget
      ? document.getElementById("carta")
      : services.find((s) => s.dataset.primary === link.dataset.goal) || document.getElementById("carta");
    destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }),
);

/* ---------------------------------------------------------
   Órbita del hero: tres anillos en perspectiva alrededor del isotipo.
   Los puntos 01, 02 y 03 giran; el plano se inclina con el tiempo y con el cursor.
   --------------------------------------------------------- */
(function orbit() {
  const svg = document.getElementById("orbit");
  if (!svg) return;
  const CX = 320, CY = 235;
  // Cada anillo tiene su propio plano: inclinación (k) y giro (roll), como un giroscopio
  const RINGS = [
    { r: 128, k: 0.64, roll: -0.42, speed: 0.22, start: 2.6 },
    { r: 190, k: 0.5, roll: 0.26, speed: -0.15, start: 0.2 },
    { r: 252, k: 0.36, roll: -0.1, speed: 0.1, start: 1.35 },
  ];
  const rings = [...svg.querySelectorAll(".o-ring")];
  const ripples = [...svg.querySelectorAll(".o-ripple")];
  const links = [...svg.querySelectorAll(".o-link")];
  const nodes = [...svg.querySelectorAll(".o-node")];
  const back = svg.querySelector(".o-back");
  const front = svg.querySelector(".o-front");
  const floor = svg.querySelector(".o-floor");
  let tiltTarget = 0, tilt = 0, rollTarget = 0, roll = 0;
  let running = true;
  let labelWidth = [];
  let compact = false;
  const measure = () => {
    labelWidth = nodes.map((n) => Math.max(...[...n.querySelectorAll("text")].map((t) => t.getComputedTextLength())));
    compact = svg.getBoundingClientRect().width < 480;
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });
  document.fonts?.ready.then(measure);

  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const hero = document.querySelector(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      rollTarget = ((e.clientX - (r.left + r.width / 2)) / r.width) * 0.22;
      tiltTarget = ((e.clientY - (r.top + r.height / 2)) / r.height) * 0.14;
    });
    hero.addEventListener("pointerleave", () => { rollTarget = 0; tiltTarget = 0; });
  }

  function plane(i, t) {
    const ring = RINGS[i];
    const k = Math.max(0.12, ring.k + 0.05 * Math.sin(t * 0.35 + i * 1.7) + tilt);
    const rl = ring.roll + 0.1 * Math.sin(t * 0.22 + i * 2.1) + roll;
    return { k, rl, cos: Math.cos(rl), sin: Math.sin(rl), deg: (rl * 180) / Math.PI };
  }

  function frame(t) {
    tilt += (tiltTarget - tilt) * 0.06;
    roll += (rollTarget - roll) * 0.06;
    const planes = RINGS.map((_, i) => plane(i, t));

    rings.forEach((el, i) => {
      el.setAttribute("rx", RINGS[i].r);
      el.setAttribute("ry", (RINGS[i].r * planes[i].k).toFixed(1));
      el.setAttribute("transform", `rotate(${planes[i].deg.toFixed(2)} ${CX} ${CY})`);
    });
    const mid = planes[1];
    floor.setAttribute("ry", (270 * mid.k).toFixed(1));
    floor.setAttribute("transform", `rotate(${mid.deg.toFixed(2)} ${CX} ${CY})`);

    // Ondas que salen del punto, como un clic en la mira
    ripples.forEach((rp, i) => {
      const p = (t * 0.3 + i * 0.5) % 1;
      const r = 40 + p * 230;
      rp.setAttribute("rx", r.toFixed(1));
      rp.setAttribute("ry", (r * mid.k).toFixed(1));
      rp.setAttribute("transform", `rotate(${mid.deg.toFixed(2)} ${CX} ${CY})`);
      rp.style.opacity = ((1 - p) * 0.4).toFixed(3);
    });

    // 1) Posición de cada punto en su anillo
    const info = nodes.map((node, i) => {
      const { r, speed, start } = RINGS[i];
      const pl = planes[i];
      const a = start + speed * t;
      const x = r * Math.cos(a);
      const z = r * Math.sin(a) * pl.k;
      const px = CX + x * pl.cos - z * pl.sin;
      const py = CY + x * pl.sin + z * pl.cos;
      const depth = Math.sin(a); // 1 = adelante, -1 = atrás
      const scale = 0.8 + 0.34 * ((depth + 1) / 2);
      const w = (labelWidth[i] || 150) * scale;
      let right = px >= CX;
      if (right && px + 18 + w > 636) right = false;
      else if (!right && px - 18 - w < 4) right = true;
      return { node, px, py, depth, scale, w, right, below: false };
    });
    // 2) Cada etiqueta busca un lugar libre: arriba, abajo o al otro lado de su punto,
    //    sin chocar con otras etiquetas ni quedar tapada por el centro
    const box = (n, right, below) => {
      const x0 = right ? n.px + 18 : n.px - 18 - n.w;
      const y0 = below ? n.py + 14 : n.py - 30 * n.scale;
      return [x0, y0, x0 + n.w, y0 + 40 * n.scale];
    };
    const hit = (p, q) => p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3];
    const core = [CX - 78, CY - 78, CX + 78, CY + 78];
    const inside = (p) => p[0] >= 0 && p[2] <= 640;
    const placed = [];
    [...info].sort((p, q) => q.depth - p.depth).forEach((n) => {
      const options = [[n.right, false], [n.right, true], [!n.right, false], [!n.right, true]];
      let pick = options[0];
      for (const opt of options) {
        const bx = box(n, opt[0], opt[1]);
        if (inside(bx) && !hit(bx, core) && !placed.some((q) => hit(bx, q))) { pick = opt; break; }
      }
      [n.right, n.below] = pick;
      placed.push(box(n, n.right, n.below));
    });
    // 3) Dibujar
    info.forEach((n, i) => {
      n.node.setAttribute("transform", `translate(${n.px.toFixed(1)} ${n.py.toFixed(1)}) scale(${n.scale.toFixed(3)})`);
      n.node.style.opacity = (0.45 + 0.55 * ((n.depth + 1) / 2)).toFixed(3);
      const [label, caption] = n.node.querySelectorAll("text");
      [label, caption].forEach((txt) => {
        txt.setAttribute("text-anchor", n.right ? "start" : "end");
        txt.setAttribute("x", n.right ? 18 : -18);
      });
      label.setAttribute("y", n.below ? 30 : -16);
      caption.setAttribute("y", n.below ? 50 : 4);
      // En pantallas chicas, solo se nombran los puntos que pasan por delante
      const hide = compact && n.depth < -0.05;
      label.style.opacity = hide ? "0" : "1";
      caption.style.opacity = hide ? "0" : "1";
      // Los puntos de atrás pasan detrás del isotipo
      const layer = n.depth < 0 ? back : front;
      if (n.node.parentNode !== layer) layer.appendChild(n.node);
      links[i].setAttribute("d", `M${n.px.toFixed(1)} ${n.py.toFixed(1)}L${CX} ${CY}`);
    });
  }

  if (reducedMotion) { frame(0); return; }
  const t0 = performance.now();
  function loop(now) {
    if (running && !document.hidden) frame((now - t0) / 1000);
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { running = e.isIntersecting; }).observe(svg);
  frame(0);
  requestAnimationFrame(loop);
})();

/* ---------- Identidad: el librito pasa sus páginas ---------- */
(function book() {
  const pages = [...document.querySelectorAll("#book .page")];
  const tabs = [...document.querySelectorAll(".toc [data-go]")];
  if (!pages.length) return;
  let current = 0;
  let timer;
  function show(i) {
    current = (i + pages.length) % pages.length;
    pages.forEach((p, k) => {
      const pos = (k - current + pages.length) % pages.length;
      p.dataset.pos = pos === pages.length - 1 && pages.length > 3 ? -1 : pos;
      p.setAttribute("aria-hidden", String(pos !== 0));
    });
    tabs.forEach((b) => b.setAttribute("aria-selected", String(Number(b.dataset.go) === current)));
  }
  function autoplay() {
    clearInterval(timer);
    if (!reducedMotion) timer = setInterval(() => show(current + 1), 3200);
  }
  tabs.forEach((b) => b.addEventListener("click", () => { show(Number(b.dataset.go)); autoplay(); }));
  pages.forEach((p) => p.addEventListener("click", () => { show(current + 1); autoplay(); }));
  show(0);
  const stage = document.getElementById("book");
  new IntersectionObserver(([e]) => (e.isIntersecting ? autoplay() : clearInterval(timer))).observe(stage);
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
