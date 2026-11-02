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
    ".section-head, .approach, .svc-filter, .svc-layout, .route, .process-step, .case-tile, .audience, .faq-layout > *, .contact-layout > *",
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
  const plan = select.value;
  const goal = form.objetivo.value.trim();
  const message =
    `Hola, equipo On Point Strategies. Me llamo ${name}.\n` +
    `Mi negocio o rubro: ${business}.\n` +
    `Me interesa: ${plan}.` +
    (goal ? `\nLo que quiero conseguir: ${goal}` : "") +
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
