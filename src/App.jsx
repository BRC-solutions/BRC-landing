import { Fragment, useEffect, useRef, useState } from "react";
import "./App.css?v=2224";

// ─── ROUTING ──────────────────────────────────────────────────────────────────

export const PAGES = {
  HOME: "home",
  TERMS: "terms",
  PRIVACY: "privacy",
  AUDIT: "audit",
  CONTACT: "contact",
  FEATURES: "features",
  FEATURE: "feature",
  CONTENT: "content",
  INDUSTRY: "industry",
  MIGRATION: "migration",
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.brcapp.io";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

const WEB_APP_URL =
  import.meta.env.VITE_APP_URL || "https://console.brcapp.io";
const SITE_URL = "https://brcapp.io";
const IOS_APP_URL =
  import.meta.env.VITE_IOS_APP_URL ||
  "https://apps.apple.com/search?term=BRC%20Business%20Reputation%20Customer%20Operations";
const ANDROID_APP_URL =
  import.meta.env.VITE_ANDROID_APP_URL ||
  "https://play.google.com/store/apps/details?id=io.brcapp.app";
const BRAND_NAME = "BRC";
const BRAND_EXPANSION = "Business Reputation & Customer Operations";
const BRAND_SHORT = "BRC";
const BRAND_TAGLINE =
  "AI Business OS for local operators.";
const BRAND_ALSO_KNOWN_AS = [
  "BRC",
  "BRC OS",
  "BRC App",
  "BRC Business OS",
  "Business Reputation & Customer Operations",
];
const LEGAL_LAST_UPDATED = "May 19, 2026";
const LEGAL_COMPANY_ADDRESS =
  "BRC Labs LTD, Unit A, 82 James Carter Road, Mildenhall, IP28 7DE, United Kingdom";

function signupUrl({
  businessName = "",
  placeId = "",
  plan = "growth",
  billing = "monthly",
  source = "prospect_audit",
} = {}) {
  const url = new URL("/login", WEB_APP_URL);
  url.searchParams.set("mode", "signup");
  url.searchParams.set("source", source);
  url.searchParams.set("plan", plan);
  url.searchParams.set("billing", billing);
  if (businessName) url.searchParams.set("businessName", businessName);
  if (placeId) url.searchParams.set("googlePlaceId", placeId);
  const attribution = currentMarketingAttribution();
  if (attribution.visitorId) url.searchParams.set("brcVisitorId", attribution.visitorId);
  if (attribution.sessionId) url.searchParams.set("brcSessionId", attribution.sessionId);
  if (attribution.source) url.searchParams.set("utm_source", attribution.source);
  if (attribution.medium) url.searchParams.set("utm_medium", attribution.medium);
  if (attribution.campaign) url.searchParams.set("utm_campaign", attribution.campaign);
  if (attribution.term) url.searchParams.set("utm_term", attribution.term);
  if (attribution.content) url.searchParams.set("utm_content", attribution.content);
  if (attribution.gclid) url.searchParams.set("gclid", attribution.gclid);
  if (attribution.fbclid) url.searchParams.set("fbclid", attribution.fbclid);
  if (attribution.ttclid) url.searchParams.set("ttclid", attribution.ttclid);
  if (attribution.rdt_cid) url.searchParams.set("rdt_cid", attribution.rdt_cid);
  if (attribution.referrer) url.searchParams.set("brcReferrer", attribution.referrer);
  if (attribution.landingPage) url.searchParams.set("brcLandingPage", attribution.landingPage);
  return url.toString();
}

function trialSignupUrl() {
  return signupUrl({ plan: "free", billing: "monthly" });
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore blocked storage; tracking still works for this event.
  }
}

function marketingId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function currentMarketingAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  let visitorId = safeStorageGet("brc_marketing_visitor_id");
  if (!visitorId) {
    visitorId = marketingId("visitor");
    safeStorageSet("brc_marketing_visitor_id", visitorId);
  }
  const attribution = {
    visitorId,
    sessionId: safeStorageGet("brc_marketing_session_id") || "",
    source:
      params.get("utm_source") ||
      safeStorageGet("brc_utm_source") ||
      (document.referrer ? "referral" : "direct"),
    medium:
      params.get("utm_medium") ||
      safeStorageGet("brc_utm_medium") ||
      (document.referrer ? "referral" : "none"),
    campaign: params.get("utm_campaign") || safeStorageGet("brc_utm_campaign") || "",
    term: params.get("utm_term") || safeStorageGet("brc_utm_term") || "",
    content: params.get("utm_content") || safeStorageGet("brc_utm_content") || "",
    gclid: params.get("gclid") || safeStorageGet("brc_gclid") || "",
    fbclid: params.get("fbclid") || safeStorageGet("brc_fbclid") || "",
    ttclid: params.get("ttclid") || safeStorageGet("brc_ttclid") || "",
    rdt_cid: params.get("rdt_cid") || safeStorageGet("brc_rdt_cid") || "",
    referrer: safeStorageGet("brc_referrer") || document.referrer || "",
    landingPage: safeStorageGet("brc_landing_page") || `${window.location.pathname}${window.location.search}`,
  };

  [
    ["brc_utm_source", attribution.source],
    ["brc_utm_medium", attribution.medium],
    ["brc_utm_campaign", attribution.campaign],
    ["brc_utm_term", attribution.term],
    ["brc_utm_content", attribution.content],
    ["brc_gclid", attribution.gclid],
    ["brc_fbclid", attribution.fbclid],
    ["brc_ttclid", attribution.ttclid],
    ["brc_rdt_cid", attribution.rdt_cid],
    ["brc_referrer", attribution.referrer],
    ["brc_landing_page", attribution.landingPage],
  ].forEach(([key, value]) => {
    if (value) safeStorageSet(key, value);
  });

  return attribution;
}

function trackMarketingEvent(eventType, metadata = {}) {
  if (typeof window === "undefined") return;
  const attribution = currentMarketingAttribution();
  const body = {
    eventType,
    visitorId: attribution.visitorId,
    sessionId: attribution.sessionId,
    attribution,
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    pagePath: `${window.location.pathname}${window.location.search}`,
    pageTitle: document.title,
    target: metadata.target || "",
    language: navigator.language || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    metadata,
  };
  const url = `${API_BASE_URL}/marketing/events`;

  const saveSessionId = (payload) => {
    if (payload?.sessionId) safeStorageSet("brc_marketing_session_id", payload.sessionId);
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  })
    .then((response) => response.ok ? response.json() : null)
    .then(saveSessionId)
    .catch(() => {});
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav({ theme = "dark", onToggleTheme, onDarkHero = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const trialHref = trialSignupUrl();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Switch to BRC", href: "/switch-pos-to-brc" },
    { label: "Features", href: "/features" },
    { label: "AI", href: "/features/ai-intelligence" },
    { label: "POS", href: "/features/pos" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className={`nav ${onDarkHero ? "nav-on-dark" : ""} ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner container">
        <a href="/" className="nav-logo">
          <img className="nav-logo-mark" src="/nav-logo-mark.svg" width="36" height="36" alt="" aria-hidden="true" />
          <span className="nav-logo-text">{BRAND_NAME}</span>
        </a>
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-knob" />
            </span>
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </button>
          <a href={WEB_APP_URL} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
            Sign In
          </a>
          <a href={trialHref} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Start Free
          </a>
        </div>
        <button
          className={`nav-hamburger ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`nav-mobile ${mobileOpen ? "nav-mobile-open" : ""}`}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="nav-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            {l.label}
          </a>
        ))}
        <a
          href={trialHref}
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: 8 }}
          onClick={() => setMobileOpen(false)}
        >
          Start Free
        </a>
        <button
          className="theme-toggle theme-toggle-mobile"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-knob" />
          </span>
          <span>{theme === "light" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

const HERO_SCREENSHOTS = {
  register: "https://cdn.brcapp.io/platform/assets/screenshots/register.webp",
  ai: "https://cdn.brcapp.io/platform/assets/screenshots/ai.webp",
  kitchen: "https://cdn.brcapp.io/platform/assets/screenshots/kitchen.webp",
  reviews: "https://cdn.brcapp.io/platform/assets/screenshots/google-reviews.webp",
};

const SCREENSHOT_CDN_BASE = "https://cdn.brcapp.io/platform/assets/screenshots/";

function screenshotUrl(name) {
  return `${SCREENSHOT_CDN_BASE}${encodeURIComponent(name)}.webp`;
}

function productScreenshot(name, alt) {
  return { name, src: screenshotUrl(name), alt };
}

const HERO_COMMAND_STATES = [
  {
    title: "Owner insight",
    src: screenshotUrl("analytics 1"),
    alt: "BRC analytics dashboard showing connected owner reporting and business signals",
    signals: [
      { className: "hero-signal-revenue", label: "Revenue", value: "+18%", detail: "Lunch recovery vs last week" },
      { className: "hero-signal-reviews", label: "Reviews recovered", value: "12", detail: "Private follow-ups closed" },
      { className: "hero-signal-staff", label: "Staff performance", value: "4.8/5", detail: "Fastest table turn: Maya" },
      { className: "hero-signal-competitor", label: "Competitor watch", value: "-0.2", detail: "Nearby rating movement" },
    ],
    ai: "Reorder oat milk, add one runner 12-2pm, and reply to 3 service-delay reviews.",
  },
  {
    title: "Live operations",
    src: screenshotUrl("operations"),
    alt: "BRC operations workspace showing live orders and service management",
    signals: [
      { className: "hero-signal-revenue", label: "Orders", value: "24", detail: "Active across pickup and tables" },
      { className: "hero-signal-reviews", label: "Kitchen load", value: "7", detail: "Tickets need prep now" },
      { className: "hero-signal-staff", label: "Shift cover", value: "3/4", detail: "One gap before lunch rush" },
      { className: "hero-signal-competitor", label: "Closeout risk", value: "Low", detail: "Cash and devices healthy" },
    ],
    ai: "Accept two pickup orders, move a runner to packing, and prepare the next table batch before 12:30.",
  },
  {
    title: "Storefront and ordering",
    src: screenshotUrl("public page 1"),
    alt: "BRC public page settings for a customer storefront and ordering setup",
    signals: [
      { className: "hero-signal-revenue", label: "Storefront", value: "Live", detail: "Styled public page ready" },
      { className: "hero-signal-reviews", label: "Ordering", value: "On", detail: "Pickup, table, and delivery flows" },
      { className: "hero-signal-staff", label: "Bookings", value: "Ready", detail: "Services and availability set" },
      { className: "hero-signal-competitor", label: "Public page", value: "Ready", detail: "Share a customer-facing ordering link" },
    ],
    ai: "Publish the lunch menu, hide two unavailable items, and turn on pickup ordering for today.",
  },
  {
    title: "Stock and finance",
    src: screenshotUrl("inventory"),
    alt: "BRC inventory dashboard showing stock and item availability",
    signals: [
      { className: "hero-signal-revenue", label: "Stock risk", value: "4", detail: "Items near reorder point" },
      { className: "hero-signal-reviews", label: "Waste", value: "-9%", detail: "Better than last week" },
      { className: "hero-signal-staff", label: "Margin", value: "31%", detail: "Menu mix improving" },
      { className: "hero-signal-competitor", label: "Payouts", value: "Clear", detail: "No finance blockers" },
    ],
    ai: "Reorder mozzarella, keep margherita available, and review the low-margin lunch bundle.",
  },
];

function HeroCommandCenter() {
  return (
    <div className="hero-command" aria-label="BRC AI operating system dashboard preview">
      <div className="hero-command-top">
        <div>
          <span>BRC OS</span>
          <strong>Owner command center</strong>
        </div>
        <div className="hero-command-status">
          <span />
          Live signals
        </div>
      </div>
      <div className="hero-command-stage">
        {HERO_COMMAND_STATES.map((state, index) => (
          <div
            className="hero-command-layer"
            key={state.title}
            style={{ "--layer-delay": `${index * 6}s` }}
          >
            <div className="hero-command-screen">
              <img
                src={state.src}
                alt={state.alt}
                loading={index === 0 ? "eager" : "lazy"}
                fetchpriority={index === 0 ? "high" : undefined}
              />
            </div>
            {state.signals.map((signal) => (
              <div className={`hero-signal ${signal.className}`} key={`${state.title}-${signal.label}`}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <small>{signal.detail}</small>
              </div>
            ))}
            <div className="hero-ai-card">
              <span>{state.title} · AI recommendation</span>
              <strong>{state.ai}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const trialHref = trialSignupUrl();

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />
        <div className="grid-overlay" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="badge-pulse" />
            Built for restaurants, cafes, retailers, salons and service businesses.
          </div>
          <h1 className="hero-h1">
            The AI Operating System for Local Businesses
          </h1>
          <p className="hero-subtitle">
            Manage reviews, orders, bookings, inventory, staff and finance from one platform.
          </p>
          <div className="hero-os-strip" aria-label="BRC complete operating system coverage">
            {[
              "POS",
              "Orders",
              "Staff",
              "Inventory",
              "AI",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="hero-p">
            Know what to fix before it costs you money.
          </p>
          <div className="hero-btns">
            <a href={trialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
              Start free — connect your business in minutes <span className="arrow">→</span>
            </a>
            <a href="/contact" className="btn btn-outline btn-lg">
              Book a 15-minute demo
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <HeroCommandCenter />
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-dot" />
      </div>
    </section>
  );
}

// ─── TRUST PROOF ──────────────────────────────────────────────────────────────

const DISCONNECTED_SYSTEMS = [
  "POS",
  "Reviews",
  "Bookings",
  "Stock",
  "Payroll",
  "Finance",
];

const BRC_ARCHITECTURE = [
  {
    label: "Customer",
    detail: "Visits, buys, books, reviews, pays, and comes back.",
  },
  {
    label: "Orders, bookings, reviews, payments",
    detail: "Every interaction becomes operational data, not another disconnected record.",
  },
  {
    label: "BRC OS",
    detail: "POS, storefront, ordering, stock, staff, finance, reputation, and market signals.",
  },
  {
    label: "AI",
    detail: "Reads the full business context instead of one isolated dashboard.",
  },
  {
    label: "Owner actions",
    detail: "Reorder, staff, recover customers, publish offers, and fix service before it costs money.",
  },
];

function TrustProof() {
  return (
    <section className="trust-proof-section">
      <div className="container trust-proof-inner">
        <div className="trust-proof-copy">
          <span>Why we are building BRC</span>
          <strong>Most local businesses run the work across 5-10 disconnected systems.</strong>
          <p>
            BRC combines the storefront, POS, operations, reputation, staff, stock,
            finance, and AI layer into one operating system.
          </p>
          <div className="trust-system-list" aria-label="Common disconnected systems BRC replaces or connects">
            {DISCONNECTED_SYSTEMS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="architecture-flow" aria-label="How customer activity becomes owner actions in BRC">
          {BRC_ARCHITECTURE.map((item, index) => (
            <article className="architecture-step" key={item.label}>
              <div className="architecture-index">{index + 1}</div>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────

const STATS = [
  { value: "Revenue", label: "Sell through POS, ordering, campaigns, rewards, and customer records." },
  { value: "Customer recovery", label: "Catch unhappy customers early with feedback, review workflows, and follow-up." },
  { value: "Operations", label: "Run bookings, tables, stock, staff, payroll, kitchen display, and closeout." },
  { value: "Owner clarity", label: "See sales, reviews, orders, stock, finance, and AI summaries together." },
  { value: "Hardware freedom", label: "Use your own devices, take payments on your phone, and add screens without extra hardware fees." },
];

function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="container stats-inner">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRODUCT PROOF ────────────────────────────────────────────────────────────

const PRODUCT_PROOF_SCREENS = [
  {
    label: "POS screen",
    title: "Fast service without a hardware trap",
    src: screenshotUrl("register"),
    alt: "BRC POS register with product tiles, cart, table controls, and checkout actions",
  },
  {
    label: "Owner dashboard",
    title: "A sharper owner brief",
    src: screenshotUrl("analytics 1"),
    alt: "BRC analytics dashboard for owner reporting and connected business signals",
  },
  {
    label: "AI answer screen",
    title: "Ask what changed during service",
    src: screenshotUrl("AI 4"),
    alt: "BRC AI Ask workflow for manager questions and next actions",
  },
  {
    label: "Review recovery flow",
    title: "Turn public risk into private recovery",
    src: screenshotUrl("review_screen"),
    alt: "BRC review detail screen with recovery context and customer issue history",
  },
  {
    label: "Stock and reorder view",
    title: "Know what needs attention before service",
    src: screenshotUrl("inventory 5"),
    alt: "BRC inventory workflow for stock and replenishment",
  },
];

function ProductProof() {
  const [expandedScreen, setExpandedScreen] = useState(null);

  return (
    <section className="product-proof-section">
      <div className="container">
        <div className="product-proof-header">
          <div>
            <div className="section-tag">Product proof</div>
            <h2 className="section-h2">
              The core screens in one place.
            </h2>
          </div>
          <p>
            Register, owner dashboard, AI answers, review recovery, and stock
            control are part of the same operating system.
          </p>
        </div>
        <div className="product-proof-grid">
          {PRODUCT_PROOF_SCREENS.map((screen) => (
            <button
              className="product-proof-card"
              key={screen.label}
              type="button"
              onClick={() => setExpandedScreen(screen)}
              aria-label={`Expand ${screen.label} screenshot`}
            >
              <div className="product-proof-image">
                <img src={screen.src} alt={screen.alt} loading="lazy" />
                <span className="product-proof-expand">Expand</span>
              </div>
              <div className="product-proof-meta">
                <span>{screen.label}</span>
                <strong>{screen.title}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>
      <ScreenshotLightbox shot={expandedScreen} onClose={() => setExpandedScreen(null)} />
    </section>
  );
}

function ScreenshotLightbox({ shot, onClose }) {
  useEffect(() => {
    if (!shot) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shot, onClose]);

  if (!shot) return null;

  const title = shot.title || shot.label || shot.name || "BRC screenshot";

  return (
    <div className="screenshot-lightbox" role="dialog" aria-modal="true" aria-label={title}>
      <button className="screenshot-lightbox-backdrop" type="button" onClick={onClose} aria-label="Close screenshot" />
      <div className="screenshot-lightbox-panel">
        <div className="screenshot-lightbox-top">
          <div>
            {shot.label ? <span>{shot.label}</span> : null}
            <strong>{title}</strong>
          </div>
          <button type="button" className="screenshot-lightbox-close" onClick={onClose} aria-label="Close screenshot">
            ×
          </button>
        </div>
        <img src={shot.src} alt={shot.alt || title} />
      </div>
    </div>
  );
}

const AI_OS_PILLARS = [
  {
    title: "Increase revenue",
    body: "BRC connects sales, tenders, stock, staffing, finance, rewards, campaigns, and item performance so owners can see what is actually driving margin, repeat visits, and wasted spend.",
  },
  {
    title: "Recover customers",
    body: "Low ratings, negative feedback, slow-service themes, stock gaps, closeout variance, offline devices, failed campaigns, and suspicious reviews become owner actions before they quietly damage revenue.",
  },
  {
    title: "Run operations",
    body: "The AI operations layer forecasts orders, prep needs, reorder pressure, and labor cover from real business signals so managers can plan before the rush instead of reacting after it.",
  },
  {
    title: "Understand the business",
    body: "Instead of only saying revenue is down, BRC AI can connect the drop to reviews, lunch traffic, item performance, rota cover, stock movement, competitor changes, and the next practical move.",
  },
];

function AiBusinessOS() {
  const trialHref = trialSignupUrl();

  return (
    <section className="ai-os-section">
      <div className="container ai-os-inner">
        <div className="ai-os-copy">
          <div className="section-tag">What makes BRC different</div>
          <h2>
            BRC shows where performance is drifting.
            <br />
            <span className="grad-text">Then it helps your team fix the cause.</span>
          </h2>
          <p>
            Traditional POS systems, review tools, campaign tools, stock tools,
            payroll tools, and finance tools all show pieces of the business.
            BRC&apos;s edge is turning those pieces into one owner brief: what is
            improving, what is slipping, what will run short, and which action
            deserves the next manager minute.
          </p>
          <a href={trialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
            Start free with BRC AI <span className="arrow">→</span>
          </a>
        </div>
        <div className="ai-os-grid">
          {AI_OS_PILLARS.map((item) => (
            <article className="ai-os-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const AI_QUESTION_PROMPTS = [
  "Why was profit low yesterday?",
  "What should I reorder today?",
  "Which menu item is wasting stock?",
  "Do I need more staff tomorrow?",
];

function AskBrcDemo() {
  return (
    <section className="ask-brc-section" id="ask-brc">
      <div className="container ask-brc-inner">
        <div className="ask-brc-copy">
          <div className="section-tag">Ask BRC</div>
          <h2>
            Ask business questions.
            <br />
            <span className="grad-text">Get operator answers.</span>
          </h2>
          <p>
            Owners should not have to open ten dashboards to understand yesterday.
            Ask BRC why profit dropped, what stock is at risk, which staff pattern
            is hurting service, or what the business needs before the next rush.
          </p>
          <div className="ask-brc-prompts">
            {AI_QUESTION_PROMPTS.map((prompt) => (
              <span key={prompt}>{prompt}</span>
            ))}
          </div>
        </div>

        <div className="ask-brc-graphic" aria-label="BRC AI product screenshot">
          <div className="ask-ai-screen">
            <img
              src={HERO_SCREENSHOTS.ai}
              alt="BRC AI showing current operating read, generated actions, manager copilot, and AI response"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const BUSINESS_FITS = [
  "Restaurants",
  "Cafes",
  "Bakeries",
  "Retail",
  "Salons",
  "Spas",
  "Gyms",
  "Clinics",
  "Service businesses",
];

function BusinessFitStrip() {
  return (
    <section className="business-fit-strip">
      <div className="container business-fit-inner">
        <span>Configured by business type</span>
        <div>
          {BUSINESS_FITS.map((item) => (
            <b key={item}>{item}</b>
          ))}
        </div>
      </div>
    </section>
  );
}

const OPERATIONS_STACK = [
  {
    eyebrow: "Increase Revenue",
    title: "Make every sale easier to understand and repeat",
    body: "Connect sales, orders, offers, rewards, finance, and item performance so owners can see what deserves promotion, pricing changes, or tighter control.",
    items: ["POS", "Orders", "Finance", "Campaigns"],
  },
  {
    eyebrow: "Recover Customers",
    title: "Turn bad moments into a managed recovery workflow",
    body: "Bring together private feedback, public reviews, reply drafts, suspicious-review context, rewards, and follow-up so unhappy customers are not left drifting.",
    items: ["Feedback", "Reviews", "Rewards", "Recovery"],
  },
  {
    eyebrow: "Run Operations",
    title: "Give managers the tools for service, staff, and stock",
    body: "Run register, tables, bookings, fulfilment, kitchen display, inventory, purchasing, rota, payroll, permissions, and closeout from the same operating layer.",
    items: ["Register", "Tables", "Stock", "Payroll"],
  },
  {
    eyebrow: "Understand Your Business",
    title: "See the story behind the numbers",
    body: "Use owner briefs, analytics, forecasts, market signals, competitor context, and reporting to understand what changed and where the next manager minute should go.",
    items: ["AI brief", "Analytics", "Forecasts", "Reports"],
  },
];

function OperationsStack() {
  const trialHref = trialSignupUrl();

  return (
    <section className="section operations-stack-section">
      <div className="container operations-stack-inner">
        <div className="operations-stack-copy">
          <div className="section-tag">All-In-One Operations</div>
          <h2 className="section-h2">
            The modules sit under four owner outcomes.
            <br />
            <span className="grad-text">No feature maze required.</span>
          </h2>
          <p className="section-p">
            BRC still gives operators POS, reviews, stock, rota, payroll,
            finance, loyalty, campaigns, analytics, orders, and controls. The
            homepage story is simpler: increase revenue, recover customers, run
            operations, and understand the business without stitching together
            another stack of subscriptions.
          </p>
          <div className="operations-stack-actions">
            <a href={trialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
              Start free <span className="arrow">→</span>
            </a>
            <a href="/features/pos" className="btn btn-outline btn-lg">
              Explore POS
            </a>
          </div>
        </div>
        <div className="operations-stack-grid">
          {OPERATIONS_STACK.map((item) => (
            <article className="operations-stack-card" key={item.title}>
              <span>{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <div className="operations-chip-row">
                {item.items.map((chip) => (
                  <strong key={chip}>{chip}</strong>
                ))}
              </div>
              <a href="/features" className="operations-card-link">
                View full features <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    slug: "pos",
    icon: "▣",
    accent: "var(--green)",
    title: "POS, table tabs, and tenders",
    body: "Browser and app-based register workflows for orders, table tabs, bills, tenders, cash drawer controls, manager overrides, customer display, and closeout.",
    tag: "POS",
    outcome: "Use your own hardware and keep sales connected to the rest of the operating system.",
  },
  {
    slug: "tables-qr",
    icon: "QR",
    accent: "var(--cyan)",
    title: "Table and QR management",
    body: "Table maps, areas, seat counts, active states, table-specific QR codes, scan testing, dine-in order links, and table-linked feedback.",
    tag: "Venue",
    outcome: "Make every table scan land in the right context for orders, service, payments, and recovery.",
  },
  {
    slug: "ordering",
    icon: "ORD",
    accent: "var(--cyan)",
    title: "Online ordering",
    body: "Branded dine-in, pickup, retail, and service ordering that feeds customer profiles, rewards, feedback, and analytics.",
    tag: "Commerce",
    outcome: "Replace marketplace dependency with direct orders you own.",
  },
  {
    slug: "delivery",
    icon: "DEL",
    accent: "var(--green)",
    title: "Delivery and pickup",
    body: "Delivery quotes, customer details, pickup slots, order tracking, and fulfilment workflows designed for local teams.",
    tag: "Fulfilment",
    outcome: "Add delivery and pickup without bolting on another subscription.",
  },
  {
    slug: "bookings",
    icon: "BK",
    accent: "var(--blue)",
    title: "Bookings and reservations",
    body: "Appointments, services, staff, tables, classes, and sessions connected to reminders, confirmations, feedback, and repeat visits.",
    tag: "Bookings",
    outcome: "Take bookings without paying for a separate scheduling tool.",
  },
  {
    slug: "feedback",
    icon: "FB",
    accent: "var(--purple)",
    title: "Private feedback",
    body: "Contextual forms tied to orders, bookings, staff, tables, products, or visits so feedback is specific enough to act on.",
    tag: "Experience",
    outcome: "Protect your rating before problems cost you new customers.",
  },
  {
    slug: "reputation",
    icon: "REV",
    accent: "var(--yellow)",
    title: "Reputation recovery",
    body: "Build positive reviews, recover low-rating experiences privately, draft replies with AI, and flag suspicious reviews for dispute workflows.",
    tag: "Reputation",
    outcome: "Win more searches while protecting your rating from avoidable damage.",
  },
  {
    slug: "campaigns",
    icon: "EMAIL",
    accent: "var(--orange)",
    title: "Campaigns and automations",
    body: "Email journeys for win-backs and customer reactivation, with SMS reserved for review and feedback prompts where configured.",
    tag: "Retention",
    outcome: "Bring customers back without manually sending every message.",
  },
  {
    slug: "rewards",
    icon: "LOY",
    accent: "var(--red)",
    title: "Rewards and loyalty",
    body: "Discount codes, redemption tracking, loyalty-style incentives, and customer return journeys linked to real activity.",
    tag: "Loyalty",
    outcome: "See which offers produce repeat visits instead of guessing.",
  },
  {
    slug: "inventory",
    icon: "STK",
    accent: "var(--green)",
    title: "Inventory, purchasing, and vendors",
    body: "Stock, recipes, vendors, purchasing, catalog availability, bundles, variants, modifiers, allergens, labels, menu versions, and AI menu import from photos or PDFs.",
    tag: "Stock",
    outcome: "Upload a menu photo or PDF to draft items, prices, variants, and modifiers instead of entering everything one by one.",
  },
  {
    slug: "staff-ops",
    icon: "STA",
    accent: "var(--purple)",
    title: "Rota and payroll",
    body: "Staff shifts, rota planning, payroll workflows, permissions, location scope, team notes, and manager-friendly access controls.",
    tag: "Staff",
    outcome: "Keep labor planning connected to the same orders, bookings, closeouts, and owner reporting.",
  },
  {
    slug: "finance",
    icon: "FIN",
    accent: "var(--blue)",
    title: "Finance and closeout",
    body: "Tender visibility, payouts, ledger-style finance views, closeout context, profitability reporting, and owner-level money controls.",
    tag: "Finance",
    outcome: "Keep the money picture connected to sales, staff, stock, payments, refunds, and daily closeout.",
  },
  {
    slug: "register-controls",
    icon: "CTL",
    accent: "var(--red)",
    title: "Controls and offline sync",
    body: "Manager PIN overrides, discounts, bill lifecycle controls, closeout, cash drawer flows, and offline sync queues for unstable service periods.",
    tag: "Controls",
    outcome: "Protect daily service when permissions, cash movement, or connectivity need tighter control.",
  },
  {
    slug: "market-signals",
    icon: "SIG",
    accent: "var(--yellow)",
    title: "Competitors and market signals",
    body: "Competitor tracking, social signal presence, public mentions, brand mentions, review movement, and reputation risk monitoring.",
    tag: "Signals",
    outcome: "Know what the market is saying while you still have time to act.",
  },
  {
    slug: "analytics",
    icon: "AI",
    accent: "var(--blue)",
    title: "Analytics and AI insights",
    body: "Review trends, competitor tracking, campaign performance, item insights, staff signals, and owner summaries in one console.",
    tag: "Insights",
    outcome: "Know what is worth fixing, promoting, or charging for.",
  },
  {
    slug: "ai-intelligence",
    icon: "AI",
    accent: "var(--purple)",
    title: "BRC AI",
    body: "Ask BRC AI why revenue changed, where sentiment may create loss risk, what to prep, what to reorder, and how to staff demand.",
    tag: "AI",
    outcome: "Turn organisation-wide trading, sentiment, stock, staff, finance, and reputation signals into next actions.",
  },
  {
    slug: "team",
    icon: "ORG",
    accent: "var(--purple)",
    title: "Team and multi-location ops",
    body: "Staff access, permissions, location-level settings, organisation reporting, notifications, and admin controls.",
    tag: "Operations",
    outcome: "Give your team one operating system instead of scattered logins.",
  },
];

function FeatureGlyph({ slug }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
  };
  const glyphs = {
    pos: (
      <>
        <rect x="4" y="5" width="16" height="12" rx="2" {...common} />
        <path d="M8 20h8M10 17v3M14 17v3M8 9h8M8 13h4" {...common} />
      </>
    ),
    "tables-qr": (
      <>
        <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" {...common} />
        <path d="M14 14h2M19 14v2M16 19h3M14 17h2v2" {...common} />
      </>
    ),
    ordering: (
      <>
        <path d="M4 5h2l2 10h9l2-7H8" {...common} />
        <circle cx="10" cy="19" r="1.4" {...common} />
        <circle cx="17" cy="19" r="1.4" {...common} />
      </>
    ),
    delivery: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" {...common} />
        <circle cx="7" cy="18" r="1.5" {...common} />
        <circle cx="18" cy="18" r="1.5" {...common} />
      </>
    ),
    bookings: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" {...common} />
        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M14 14h2M8 17h2" {...common} />
      </>
    ),
    feedback: (
      <>
        <path d="M5 5h14v10H9l-4 4V5zM9 9h6M9 12h4" {...common} />
      </>
    ),
    reputation: (
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" {...common} />
    ),
    campaigns: (
      <>
        <path d="M4 13h3l9-5v10l-9-5H4zM7 13v5M19 10a4 4 0 0 1 0 6" {...common} />
      </>
    ),
    rewards: (
      <>
        <path d="M4 10h16v10H4zM4 10l2-4h12l2 4M12 6v14M4 14h16" {...common} />
        <path d="M10 6c-2-3-5 0-2 2M14 6c2-3 5 0 2 2" {...common} />
      </>
    ),
    inventory: (
      <>
        <path d="M4 8 12 4l8 4-8 4-8-4zM4 8v8l8 4 8-4V8M12 12v8" {...common} />
      </>
    ),
    "staff-ops": (
      <>
        <circle cx="9" cy="8" r="3" {...common} />
        <path d="M3.5 20c.7-3.2 2.6-5 5.5-5s4.8 1.8 5.5 5" {...common} />
        <path d="M15 11a2.7 2.7 0 1 0 0-5M17 15c2.1.5 3.4 2.1 3.9 5" {...common} />
      </>
    ),
    finance: (
      <>
        <path d="M4 19h16M6 16V9M12 16V5M18 16v-4" {...common} />
        <path d="M5 10l7-5 7 7" {...common} />
      </>
    ),
    "register-controls": (
      <>
        <path d="M5 7h14M5 12h14M5 17h14" {...common} />
        <circle cx="9" cy="7" r="2" {...common} />
        <circle cx="15" cy="12" r="2" {...common} />
        <circle cx="11" cy="17" r="2" {...common} />
      </>
    ),
    "market-signals": (
      <>
        <circle cx="12" cy="12" r="3" {...common} />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" {...common} />
      </>
    ),
    analytics: (
      <>
        <path d="M4 19V5M4 19h16M7 15l4-4 3 3 5-7" {...common} />
      </>
    ),
    "ai-intelligence": (
      <>
        <path d="M12 3l1.4 4.2L17.5 9l-4.1 1.8L12 15l-1.4-4.2L6.5 9l4.1-1.8L12 3z" {...common} />
        <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14zM19 13l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 13z" {...common} />
      </>
    ),
    team: (
      <>
        <circle cx="12" cy="7" r="3" {...common} />
        <circle cx="6" cy="12" r="2.4" {...common} />
        <circle cx="18" cy="12" r="2.4" {...common} />
        <path d="M4 20c.6-2.5 2.1-4 4.5-4M9 20c.7-3 2.3-4.5 3-4.5s2.3 1.5 3 4.5M15.5 16c2.4 0 3.9 1.5 4.5 4" {...common} />
      </>
    ),
  };

  return (
    <svg className="feature-glyph" viewBox="0 0 24 24" aria-hidden="true">
      {glyphs[slug] || glyphs.analytics}
    </svg>
  );
}

const FEATURE_DETAIL = {
  pos: {
    headline: "POS, table tabs, and tenders inside the full business OS.",
    subhead:
      "BRC gives local teams register, order, table tab, bill, tender, customer display, kitchen, closeout, and manager-control workflows that run inside the same system as stock, staff, finance, and reputation.",
    bullets: [
      "Register surfaces for counter, table, pickup, and retail sales",
      "Table service, tabs, bills, tenders, discounts, refunds, and closeout flows",
      "Customer display and kitchen display surfaces for service visibility",
      "Cash drawer controls, manager PIN overrides, and permission checks",
      "Sales connected to catalog, inventory, purchasing, payroll, finance, and recovery workflows",
    ],
    conversion:
      "Why subscribe: POS becomes one module of BRC OS instead of a dead-end till. Every sale can connect to stock, staffing, tenders, feedback, rewards, reputation, and owner reporting.",
    proof: ["Own hardware", "Tabs and tenders", "Connected OS"],
    bestFor: "Restaurants, cafes, retail shops, and local operators that want practical POS workflows inside a broader business operating system.",
  },
  "tables-qr": {
    headline: "Table and QR code management for dine-in service.",
    subhead:
      "BRC lets venues create tables, areas, and table-specific QR codes so customer scans connect to the correct dine-in context for ordering, feedback, payments, service visibility, and recovery.",
    bullets: [
      "Table and area setup with labels, seat counts, and active states",
      "Table-specific QR codes for dine-in ordering and feedback sessions",
      "QR scan testing before codes are printed or placed in the venue",
      "Orders and feedback linked to table, area, staff, item, and payment context",
      "Deactivate, rename, or replace QR codes when the floor layout changes",
    ],
    conversion:
      "Why subscribe: table QR management turns the physical venue into part of BRC OS, so orders, tenders, feedback, recovery, and reporting keep the right table context.",
    proof: ["Table QR", "Area control", "Dine-in context"],
    bestFor: "Restaurants, cafes, bars, venues, and hospitality teams that need QR ordering, table feedback, and floor context without a separate table-link tool.",
  },
  ordering: {
    headline: "Direct ordering that becomes customer intelligence.",
    subhead:
      "BRC helps restaurants, cafes, retail stores, salons, and service businesses take orders through branded customer pages, then turns each transaction into feedback, repeat revenue, and better decisions.",
    bullets: [
      "Dine-in, pickup, retail, and service ordering flows",
      "Mobile-first catalog, cart, checkout, and order tracking",
      "Customer records connected to order history and redemptions",
      "Kitchen/preparation status and fulfilment-friendly workflows",
      "Item and category performance data for smarter offers",
    ],
    conversion:
      "Why subscribe: you keep more order data, reduce third-party dependency, and connect each sale to follow-up, reviews, and repeat revenue from the same plan.",
    proof: ["Direct customer data", "Mobile checkout", "Order-linked feedback"],
    bestFor: "Restaurants, cafes, bakeries, retail shops, and service businesses that want owned ordering instead of scattered order channels.",
  },
  delivery: {
    headline: "Delivery and pickup workflows for real local operations.",
    subhead:
      "Let customers choose delivery or collection, capture the details your team needs, quote delivery where enabled, and keep every order connected to the same customer operations engine.",
    bullets: [
      "Delivery address capture and quote support",
      "Pickup slots, preparation timing, and order notes",
      "Delivery fees and fulfilment details stored with the order",
      "Order status tracking for customers and staff",
      "Follow-up journeys after delivery or collection",
    ],
    conversion:
      "Why subscribe: delivery and pickup become part of your owned customer system instead of another isolated monthly bill.",
    proof: ["Delivery quote support", "Pickup timing", "Trackable follow-up"],
    bestFor: "Food, retail, and local operators that need pickup or delivery without turning customer data over to a marketplace.",
  },
  bookings: {
    headline: "Bookings, reservations, and appointments in the same customer loop.",
    subhead:
      "BRC supports booking flows for services, staff, tables, sessions, and events, then uses each booking record for reminders, feedback, review prompts, and repeat-customer journeys.",
    bullets: [
      "Service, staff, table, event, and appointment booking types",
      "Availability checks, confirmation flows, rescheduling, and cancellation",
      "Customer lookup and calendar invite support",
      "Booking reminders and post-visit follow-up",
      "Booking-linked analytics for services, staff, and demand",
    ],
    conversion:
      "Why subscribe: you get scheduling, reminders, feedback, and customer follow-up together, so you can replace a standalone booking tool.",
    proof: ["Availability checks", "Calendar invites", "Reminder-ready"],
    bestFor: "Restaurants, salons, spas, clinics, gyms, and service businesses that sell time, tables, or appointments.",
  },
  feedback: {
    headline: "Private feedback that is specific enough to fix.",
    subhead:
      "Generic surveys create generic answers. BRC asks about what actually happened: the order, table, product, service, staff member, booking, or location involved.",
    bullets: [
      "QR and link-based feedback collection",
      "Questions tailored to orders, bookings, staff, products, and visits",
      "Low-rating alerts and private recovery workflows",
      "Feedback rewards delivered by SMS where configured",
      "Staff, item, and service signals for daily improvement",
    ],
    conversion:
      "Why subscribe: one prevented public complaint can protect far more revenue than the monthly cost of the platform.",
    proof: ["Contextual questions", "Private issue capture", "Reward flow"],
    bestFor: "Owners who want bad experiences surfaced privately before they damage the public rating.",
  },
  reputation: {
    headline: "Recover reputation and build positive reviews.",
    subhead:
      "BRC monitors your public reputation, helps your team respond faster, routes unhappy customers into private recovery, and sends natural follow-ups after genuine positive activity.",
    bullets: [
      "Google, Yelp, and TripAdvisor monitoring by plan",
      "AI review summaries and reply draft support",
      "Positive review follow-ups after orders, bookings, or visits",
      "Low-rating recovery workflows before problems become public",
      "Suspicious or fake review flags with dispute-ready context",
      "Competitor tracking and local benchmark signals",
      "Owner alerts for urgent or low-rating reviews",
    ],
    conversion:
      "Why subscribe: stronger reviews improve the trust signals buyers check before choosing you, while recovery workflows help save customers who might otherwise leave for good.",
    proof: ["Review recovery", "Fake review flags", "AI reply drafts"],
    bestFor: "Any local business that needs more positive reviews, faster negative-review recovery, and a clearer process for challenging suspicious public reviews.",
  },
  campaigns: {
    headline: "Automations that turn customer activity into repeat revenue.",
    subhead:
      "Run campaigns and journeys from the same place your orders, bookings, feedback, and customer profiles live.",
    bullets: [
      "Email campaign and automation support",
      "Scheduled sends, automations, and win-back journeys",
      "Feedback reward and review request follow-ups",
      "Customer segments based on activity and consent",
      "Campaign reporting tied to redemptions and revenue influence",
    ],
    conversion:
      "Why subscribe: campaigns are tied to real orders, bookings, rewards, and consent, so offers are easier to target and measure.",
    proof: ["Win-back journeys", "Scheduled sends", "Redemption tracking"],
    bestFor: "Owners who want repeat business without manually remembering who to message and when.",
  },
  rewards: {
    headline: "Rewards that motivate feedback and measurable return visits.",
    subhead:
      "Use discounts, incentives, and redemption tracking to encourage customers to respond, come back, and buy again.",
    bullets: [
      "Instant discount delivery after feedback",
      "Unique, trackable codes and redemption scanning",
      "Campaign-linked offers and customer reactivation",
      "Consent-aware email rewards and review SMS prompts",
      "Performance reporting for offers and redemptions",
    ],
    conversion:
      "Why subscribe: rewards stop being random discounts and become trackable return-visit tools you can measure.",
    proof: ["Trackable codes", "Scanner support", "Offer reporting"],
    bestFor: "Businesses that already discount occasionally but want offers to be trackable instead of guesswork.",
  },
  analytics: {
    headline: "One dashboard for what customers are telling you.",
    subhead:
      "BRC combines reputation, feedback, campaign, order, booking, customer, competitor, and operational signals so owners know what deserves attention.",
    bullets: [
      "Review, feedback, order, booking, and campaign dashboards",
      "AI summaries, owner digests, and recommendation workflows",
      "Competitor and public signal monitoring",
      "Staff, service, item, and location-level performance views",
      "Exports and reports for teams that need deeper analysis",
    ],
    conversion:
      "Why subscribe: owners get one place to see what is working, where revenue is leaking, and which actions deserve attention.",
    proof: ["Owner digest", "Competitor view", "Revenue-influenced reporting"],
    bestFor: "Owners and managers who want one weekly command center instead of checking reviews, orders, campaigns, and staff performance separately.",
  },
  "ai-intelligence": {
    headline: "Ask BRC AI what is putting revenue at risk.",
    subhead:
      "BRC’s main AI layer lives in BRC AI: an AI operations manager that reads trading, sentiment, review, stock, rota, POS, finance, and location signals so owners can ask why performance changed, predict loss risk, and decide what to do next.",
    bullets: [
      "Ask why revenue dropped, which location is at risk, or what sentiment is likely to cost the business next",
      "AI owner brief that turns organisation signals into urgent manager actions",
      "Forecast orders, revenue, prep, reordering, and target labor cover from recent demand",
      "Digital twin simulations for changes such as pricing, lunch service, stations, or capacity",
      "Loss-risk triage from low ratings, negative sentiment, open replies, failed campaigns, and trading movement",
      "Supporting AI tools for review summaries, reply drafts, suspicious-review context, and catalogue setup",
    ],
    conversion:
      "Why subscribe: BRC AI becomes an owner command room, not another report. BRC helps predict where sentiment, reputation, staffing, stock, and trading movement may turn into lost revenue, then gives the manager a practical next action.",
    proof: ["Ask AI manager", "Predict loss risk", "Forecast demand"],
    bestFor: "Owners and multi-location operators who need to know which location, service issue, stock gap, rota problem, review trend, or sentiment shift is most likely to hurt revenue next.",
  },
  team: {
    headline: "Built for owners, managers, staff, and multiple locations.",
    subhead:
      "Give the right people access to the right workflows, keep locations separated where needed, and roll up the picture for owners.",
    bullets: [
      "Owner, staff, admin, and location-level permissions",
      "Multi-location organisation structure",
      "Notification preferences for reviews, orders, bookings, and support",
      "Admin/support tools and audit-friendly operations",
      "Plan gates and feature flags as the business grows",
    ],
    conversion:
      "Why subscribe: BRC can start with one location and grow with staff, permissions, plan gates, and multi-location reporting already built in.",
    proof: ["Staff permissions", "Location rollups", "Plan gates"],
    bestFor: "Growing teams that need staff access, controlled permissions, and location reporting without losing owner visibility.",
  },
  inventory: {
    headline: "Inventory, catalog, purchasing, and vendors connected to what customers buy.",
    subhead:
      "BRC links catalog setup, item availability, recipes, stock movement, purchasing, vendors, suppliers, variants, bundles, allergens, and menu versions to the same operating console. AI catalogue setup can read menu photos or PDFs and draft menu items, prices, variations, modifiers, and options so teams do not have to upload every item one by one.",
    bullets: [
      "AI menu import from photos or PDFs for draft items, prices, variations, modifiers, and options",
      "Inventory quantities, stock controls, and sold-out or hidden states",
      "Recipes, item labels, variants, bundles, modifiers, allergens, and SKUs",
      "Purchasing and vendor workflows for supplier-driven stock replenishment",
      "Catalog and menu versions for cleaner updates before service",
      "Item performance signals that connect sales, feedback, and stock decisions",
    ],
    conversion:
      "Why subscribe: stock, catalog, vendors, and ordering stay connected, and AI setup removes the slowest first step by turning an existing menu photo or PDF into reviewed catalogue drafts.",
    proof: ["AI menu import", "Stock visibility", "Vendors"],
    bestFor: "Food, retail, and inventory-led local businesses that need the public catalog, POS, and back-office stock picture to agree.",
  },
  finance: {
    headline: "Finance, tenders, closeout, and payouts in the owner view.",
    subhead:
      "BRC keeps the money layer close to the work that created it: sales, tenders, refunds, payouts, closeout, stock, staff, payroll, and profitability reporting.",
    bullets: [
      "Tender and payment context connected to order and register workflows",
      "Closeout, cash drawer, refund, discount, and manager-control visibility",
      "Finance ledger and accounting-style records for owner review",
      "Payout request and connected payment provider context",
      "Profitability reporting across orders, fees, stock, staff, and campaigns",
    ],
    conversion:
      "Why subscribe: the owner gets a clearer money picture because finance is tied to operations, not exported into yet another disconnected tool.",
    proof: ["Tenders", "Closeout", "Finance ledger"],
    bestFor: "Operators who need daily money controls, payout visibility, closeout, and profitability signals connected to the same operating system.",
  },
  "staff-ops": {
    headline: "Rota, shifts, payroll, and staff access in the operating layer.",
    subhead:
      "BRC keeps staff planning close to the real work: orders, bookings, closeouts, service periods, permissions, payroll, and owner reporting.",
    bullets: [
      "Rota planning and staff shift workflows",
      "Payroll management surfaces for operational teams",
      "Role, capability, and location-scoped staff access",
      "Manager-friendly controls for sensitive actions",
      "Owner visibility across daily service, labor, and location performance",
    ],
    conversion:
      "Why subscribe: labor planning stops living in a separate tool and starts matching what happened in bookings, orders, shifts, closeouts, and customer recovery.",
    proof: ["Rota", "Payroll", "Permissions"],
    bestFor: "Owner-led teams and multi-location operators that need staff tools without losing control over sensitive workflows.",
  },
  "register-controls": {
    headline: "Register controls and offline sync for real service conditions.",
    subhead:
      "BRC includes the control layer operators expect: cash drawer flows, manager PIN overrides, discounts, bill lifecycle states, closeout, permissions, and sync queues for shaky connections.",
    bullets: [
      "Manager PIN overrides and permission-aware register actions",
      "Cash drawer, bill lifecycle, discount, refund, and closeout controls",
      "Offline mutation queue for unstable network periods",
      "Register, kitchen, customer display, and floor screens that stay coordinated",
      "Audit-friendly state changes for managers and owners",
    ],
    conversion:
      "Why subscribe: the system is not only a menu or review tool. It helps the team keep control when money, permissions, and connectivity matter.",
    proof: ["Manager controls", "Offline queue", "Closeout"],
    bestFor: "Busy food, retail, and counter-service teams that need reliable workflows during rushes, shift changes, and patchy Wi-Fi.",
  },
  "market-signals": {
    headline: "Competitors, social presence, brand mentions, and reputation recovery.",
    subhead:
      "BRC watches the outside world as well as the inside operation: competitor movement, social signals, public mentions, brand mentions, review trends, suspicious reviews, and recovery opportunities.",
    bullets: [
      "Competitor tracking for rating, review, and public movement",
      "Social signal presence and public mention monitoring",
      "Brand mentions and local reputation context",
      "Review monitoring, suspicious-review triage, and dispute-ready context",
      "Private feedback and recovery workflows before issues become public damage",
    ],
    conversion:
      "Why subscribe: owners can see what customers and the market are saying, then connect that insight to campaigns, recovery, staff coaching, and operational fixes.",
    proof: ["Competitors", "Brand mentions", "Recovery"],
    bestFor: "Local brands that depend on trust, search visibility, reviews, and public reputation to keep customers choosing them.",
  },
};

const FEATURE_GUIDES = {
  pos: {
    setup: [
      "Choose the business modules that should be active: register, table QR, catalog, KDS, customer display, closeout, and staff shifts.",
      "Build the catalog or menu so items, prices, modifiers, bundles, allergens, and availability are ready for sales.",
      "Set register controls, payment readiness, cash drawer expectations, manager PIN rules, and staff permissions.",
      "Open the right screens for the team: register, kitchen display, customer display, operations fullscreen, and manager closeout.",
    ],
    dailyUse: [
      "Staff use register and order surfaces to create sales, move bills through status, apply allowed actions, and keep service moving.",
      "Kitchen, floor, customer display, and manager screens can stay live on separate devices.",
      "Owners can review completed orders, closeout, payments, stock impact, feedback, and campaign follow-up from the same workspace.",
    ],
    planNote: "The POS story is strongest for Pro and Enterprise operators that need multiple screens, controls, tables, stock, staff, and reporting together.",
  },
  "tables-qr": {
    setup: [
      "Create table areas such as front room, terrace, bar, counter, upstairs, or private room.",
      "Add each table with a staff-friendly label, seat count, order mode, and active state.",
      "Generate table-specific QR codes and test each scan with a phone before printing or placing it.",
      "Choose whether scans open dine-in ordering, table feedback, booking context, or a public page flow.",
      "Replace, deactivate, or regenerate QR codes when tables are renamed, removed, or rearranged.",
    ],
    dailyUse: [
      "Customers scan a code and BRC keeps the table, area, order mode, and dine-in context attached.",
      "Staff can see which table produced an order, payment, feedback response, or recovery case.",
      "Owners can review table-linked service, item, feedback, reward, and order patterns instead of guessing where issues happened.",
    ],
    planNote: "Table and QR management is a strong hospitality conversion point because it connects the room itself to ordering, feedback, payments, and reputation recovery.",
  },
  ordering: {
    setup: [
      "Create catalog categories and items, then add prices, images, variants, modifiers, availability, and hidden states where needed.",
      "Publish the branded public page and choose the customer entry point: table QR, pickup link, retail storefront, or service ordering page.",
      "Connect payment processing when online payment is required, then decide which order modes the business accepts.",
      "Use the operations screen to manage live orders, kitchen/preparation work, status changes, and order history.",
    ],
    dailyUse: [
      "New orders land in the operations console with customer, payment, table, pickup, delivery, and item details.",
      "Staff can move orders from submitted to accepted, ready, completed, cancelled, or refunded.",
      "Owners can review item performance and use order history for feedback, review requests, rewards, and campaigns.",
    ],
    planNote: "Basic ordering belongs in the entry story, while advanced order management, catalog pickup, and table ordering are positioned as Pro and Enterprise value.",
  },
  delivery: {
    setup: [
      "Enable pickup and delivery options on the public page for the right business type.",
      "Set delivery fees, preparation expectations, fulfilment rules, and customer address requirements.",
      "Use order notes and delivery notes so staff have the information they need before accepting the order.",
      "Track delivery status inside the same order record instead of running a separate fulfilment spreadsheet.",
    ],
    dailyUse: [
      "Staff see delivery address, notes, fee, fulfilment type, dispatch status, and customer contact details.",
      "Orders can move through preparation, dispatch, pickup, delivered, failed, or cancelled states.",
      "After fulfilment, BRC can trigger feedback, review requests, rewards, and win-back journeys.",
    ],
    planNote: "Delivery strengthens the subscription by making ordering more complete without forcing the owner into another delivery-management tool.",
  },
  bookings: {
    setup: [
      "Create services, staff, tables, rooms, classes, or event resources depending on the business type.",
      "Set availability, duration, party size, buffer expectations, and whether the flow is for services, staff, tables, or events.",
      "Publish booking on the public page so customers can book without downloading an app.",
      "Use confirmations, cancellation, reschedule, and calendar links to reduce manual admin.",
    ],
    dailyUse: [
      "Owners and staff see upcoming bookings in operations with customer details and booking status.",
      "Customers can manage relevant booking actions through the public flow.",
      "Completed bookings can feed feedback, review follow-up, customer profiles, campaigns, and analytics.",
    ],
    planNote: "Service bookings and table ordering are strong Pro and Enterprise plan reasons because they replace a standalone scheduling product.",
  },
  feedback: {
    setup: [
      "Create QR sessions from Boost or use order and booking events to start a feedback moment.",
      "Tie the session to staff, selected items, services, table, order, or booking context where available.",
      "Choose whether feedback earns an immediate or next-visit reward, and define discount rules.",
      "Route low ratings into the private feedback inbox so the team can respond before the issue becomes public.",
    ],
    dailyUse: [
      "Staff review open and resolved feedback, add internal notes, and reply to customers where needed.",
      "Owners see staff ratings, item/service signals, low-rating patterns, and reward claims.",
      "Happy customers can be moved into review follow-up while unhappy customers stay in private recovery.",
    ],
    planNote: "Private feedback is a core Growth plan reason because it gives the owner reputation protection from day one.",
  },
  reputation: {
    setup: [
      "Connect the business profile and fetch previous reviews within the plan allowance.",
      "Choose which review platforms matter for the plan, from the primary review profile to additional platforms on higher tiers.",
      "Set alerts for new reviews, low ratings, suspicious patterns, and owner attention.",
      "Configure private recovery steps for low-rating feedback and complaint patterns.",
      "Use AI summaries and reply drafts so managers can respond faster without starting from a blank page.",
    ],
    dailyUse: [
      "Owners monitor review volume, average rating, unresolved replies, recovery cases, and urgent review risks.",
      "Managers can use AI drafts, competitor context, suspicious-review flags, and public signal checks to decide where to act.",
      "Positive review requests can be triggered after real customer activity instead of asking everyone at random.",
      "Suspicious public reviews can be gathered into dispute-ready context for the relevant platform.",
    ],
    planNote: "Growth sells Google review recovery and positive review building; Pro and Enterprise expand the story with multi-platform, competitors, public signals, and dispute context.",
  },
  campaigns: {
    setup: [
      "Build email campaigns from Boost using customer consent, contact details, and activity history.",
      "Choose campaign type: review request, feedback discount, low-rating recovery, win-back, staff/menu-based, or scheduled send.",
      "Set audience, offer, timing, and discount behaviour.",
      "Track sent, clicked, redeemed, and revenue-influenced results.",
    ],
    dailyUse: [
      "Owners can see which campaigns are active, scheduled, sent, failed, clicked, or redeemed.",
      "Customer consent and do-not-contact rules keep messaging cleaner.",
      "Campaign results connect back to rewards, feedback, customers, and revenue-influenced reporting.",
    ],
    planNote: "Campaign basics support Growth; customer segments, advanced campaigns, and automations make Pro and Enterprise easier to justify.",
  },
  rewards: {
    setup: [
      "Set maximum discount rules and decide when rewards are immediate, next visit, or disabled.",
      "Generate unique discount codes from feedback, campaigns, or owner-created offers.",
      "Use the scanner to redeem codes at the counter when customers return.",
      "Review redemption reporting to understand which offers actually drive repeat visits.",
    ],
    dailyUse: [
      "Staff can scan or verify discount codes and see whether they were claimed.",
      "Owners can compare feedback discounts, campaign offers, redemptions, and estimated discount given.",
      "Rewards become a measurable retention tool instead of an untracked giveaway.",
    ],
    planNote: "Rewards make the subscription feel tangible because the owner can connect customer response, offer, redemption, and repeat visit.",
  },
  analytics: {
    setup: [
      "Connect reviews, feedback, campaigns, ordering, bookings, competitors, and public signals so data lands in one owner view.",
      "Enable owner digest and alerts for risk, review volume, campaign results, and operational issues.",
      "Use plan-level reporting: Growth for core insights, Pro for deeper monitoring, Enterprise for organisation reporting.",
      "Review staff, item, location, campaign, and competitor patterns before changing operations or offers.",
    ],
    dailyUse: [
      "Owners check what changed this week: reviews, low ratings, redemptions, campaign performance, and competitor movement.",
      "Managers can identify which staff, services, menu items, or locations need attention.",
      "Enterprise plans can roll up location performance and scheduled reporting.",
    ],
    planNote: "Analytics is the subscription proof layer: it shows the owner where BRC is saving time, protecting reputation, and influencing revenue.",
  },
  "ai-intelligence": {
    setup: [
      "Upload a menu photo or PDF when catalogue setup is the first job; AI can draft menu items, prices, variations, modifiers, and options before the team reviews them.",
      "Enable BRC AI on the Enterprise plan so AI operations can read the organisation scope instead of a single isolated location.",
      "Connect the signals that make the AI manager useful: orders, POS revenue, reviews, feedback sentiment, stock, recipes, rota, time off, campaigns, devices, closeout, and finance.",
      "Open the AI operations panel and review the owner brief, health score, revenue trend, forecast demand, stock alerts, labor gaps, and digital twin simulations.",
      "Use the Ask box for questions such as why sales changed, which sentiment trend may cause revenue loss, what to prep, what to reorder, or whether to adjust staffing.",
      "Keep review summaries, reply drafts, suspicious-review analysis, and AI catalogue setup enabled as supporting AI workflows around BRC AI.",
    ],
    dailyUse: [
      "Owners ask the AI manager what needs attention, why revenue changed, what loss risk is building from sentiment or low ratings, and what the next operating move should be.",
      "Managers use the AI owner brief to clear urgent actions across stock, staffing, location health, closeout variance, offline devices, and reputation risk.",
      "Teams use demand forecasts to plan prep, reorders, and labor cover before the next rush instead of reacting after sales or sentiment has already moved.",
      "Review summaries, reply drafts, suspicious-review analysis, and AI catalogue setup remain useful supporting tools, with human approval before anything customer-facing changes.",
    ],
    planNote: "BRC AI is the Enterprise plan story. Growth and Pro can still benefit from AI summaries, reply drafts, and other supporting AI features, but the main loss-risk and Ask workflow belongs in BRC AI.",
  },
  team: {
    setup: [
      "Invite owners, managers, and staff with role-based permissions.",
      "Assign capabilities and location scope so team members only access what they need.",
      "Use subscription gates and feature overrides to control which modules are active.",
      "Set notifications for reviews, feedback, orders, bookings, campaign events, support, and billing states.",
    ],
    dailyUse: [
      "Owners keep visibility across locations while managers handle local operations.",
      "Staff can work in the relevant module without seeing owner-only controls.",
      "Admin/support workflows, audit logs, and plan states keep the business manageable as it grows.",
    ],
    planNote: "Team and multi-location controls make BRC credible for businesses that start with one location but plan to grow.",
  },
  inventory: {
    setup: [
      "Upload a clear menu photo or PDF to let AI draft categories, items, prices, variations, modifiers, and options instead of entering each item one by one.",
      "Review the AI draft, then confirm categories and catalog items with prices, images, SKUs, variants, modifiers, bundles, labels, and allergen information.",
      "Turn on inventory tracking where stock matters, then set quantities, thresholds, recipes, and availability states.",
      "Use purchasing and vendor workflows to capture supplier needs and replenishment activity before busy periods.",
      "Publish menu versions or public catalog updates only when the operation is ready.",
    ],
    dailyUse: [
      "Teams can mark items unavailable, update stock, review purchasing needs, and keep public ordering aligned with what can actually be fulfilled.",
      "Owners can compare sales, item feedback, availability, and purchasing pressure before changing menus or offers.",
      "Stock-sensitive items can flow into POS, ordering, rewards, and reporting instead of living in a separate spreadsheet.",
    ],
    planNote: "Inventory, purchasing, and vendors support the BRC OS promise because operators can connect sales to stock without buying another back-office product.",
  },
  finance: {
    setup: [
      "Connect payment and tender workflows to orders, bills, refunds, discounts, and closeout.",
      "Review finance settings, payout context, and accounting-style ledger records where enabled.",
      "Use manager controls for sensitive refund, discount, cash drawer, and closeout actions.",
      "Connect finance reporting to orders, stock, staff, campaign results, and profitability signals.",
    ],
    dailyUse: [
      "Managers can close service periods with tender, bill, cash drawer, and exception context in one place.",
      "Owners can review payouts, fees, refunds, closeout, profitability, and revenue-influenced activity.",
      "Finance data stays tied to operations, so disputes and reporting have better source context.",
    ],
    planNote: "Finance makes BRC OS credible for operators because the system connects money movement to the work that created it.",
  },
  "staff-ops": {
    setup: [
      "Invite owners, managers, and staff with the right role, location scope, and capabilities.",
      "Configure rota and shift workflows for the business type and the daily service pattern.",
      "Set payroll access, notification preferences, and manager controls for sensitive staff workflows.",
      "Connect staffing expectations to bookings, orders, closeout, and owner reporting.",
    ],
    dailyUse: [
      "Managers can review staff coverage, upcoming shifts, payroll context, permissions, and operational notes.",
      "Staff work from focused screens while owner-only billing, controls, and location settings remain restricted.",
      "Owners can see labor, service, bookings, orders, recovery, and reporting in the same operating layer.",
    ],
    planNote: "Rota, payroll, and team controls make Pro and Enterprise more compelling for operators with regular staff or multiple locations.",
  },
  "register-controls": {
    setup: [
      "Set permissions for discounts, refunds, cash drawer actions, closeout, and manager PIN override flows.",
      "Choose which register, KDS, customer display, and operations screens should be open during service.",
      "Enable offline-ready mutation scope where unstable connectivity is a known risk.",
      "Train managers around closeout, bill lifecycle states, and exception handling before busy service.",
    ],
    dailyUse: [
      "Staff can keep serving while controlled actions require the right permission or manager confirmation.",
      "Offline-ready actions queue locally and sync when the connection returns.",
      "Managers can review closeout, cash movement, bill state, refunds, and exceptions with cleaner context.",
    ],
    planNote: "Controls and offline sync are conversion proof for serious operators because they make the product feel ready for real service conditions.",
  },
  "market-signals": {
    setup: [
      "Connect review channels and choose competitors that matter for the business type and local market.",
      "Enable public signal and social mention workflows where plan and configuration allow.",
      "Route low-rating reviews, suspicious reviews, and private complaints into recovery workflows.",
      "Use owner digests and alerts to surface brand mention, competitor, and reputation risks.",
    ],
    dailyUse: [
      "Owners can compare their reputation against competitors and see what changed in the market.",
      "Managers can use review, mention, and social signal context to decide what to fix, promote, or recover.",
      "Reputation recovery stays connected to customer activity, campaigns, staff signals, and operations.",
    ],
    planNote: "Market signals turn reputation into an operating workflow instead of a passive review dashboard.",
  },
};

const FEATURE_SURFACES = {
  pos: [
    "Register app: sales entry, catalog item selection, table or counter context, payments, discounts, and controlled actions.",
    "POS surface: live order flow, bills, table lifecycle, payment state, and manager-friendly status changes.",
    "Customer display and KDS: separate screens for customer-facing totals and preparation visibility.",
    "Manager closeout and cash drawer controls: shift-end accountability, drawer movement, overrides, and operational audit context.",
  ],
  "tables-qr": [
    "Tables settings create areas, table labels, seat counts, active states, and table-specific public entry points.",
    "QR management lets operators generate, test, print, replace, or deactivate codes tied to a physical table or area.",
    "Go customer pages can open with table context so dine-in ordering, feedback, payment, and service workflows stay connected.",
    "Operations screens show table context alongside order status, notes, payment state, preparation state, and recovery workflows.",
  ],
  ordering: [
    "Console operations: live orders, kitchen view, order history, status changes, table context, notes, payment state, and fulfilment detail.",
    "Catalog setup: categories, item images, variants, modifier groups, bundles, allergens, labels, stock/availability, hidden items, and currency.",
    "Go customer page: branded menu, search, item options, dine-in/pickup mode switch, cart, secure checkout, receipts, and saved reorder links.",
    "Public page settings: hero image, logo, brand copy, ordering toggles, custom domain support, legal consent copy, and payment readiness warnings.",
  ],
  delivery: [
    "Go checkout captures delivery address, postcode, customer notes, delivery quote state, fees, and unavailable-address errors.",
    "Operations stores delivery fulfilment type, provider, quote/order IDs, driver details, tracking URL, dispatch time, pickup time, delivery time, and failed/cancelled states.",
    "Settings can enable delivery as an order mode while keeping pickup and dine-in flows separate for businesses that need both.",
    "Completed delivery and pickup orders can feed private feedback, review follow-up, rewards, campaign segments, and revenue-influenced reporting.",
  ],
  bookings: [
    "Booking services support services, staff, tables, resources, capacity, duration, deposits, full price, business hours, buffers, and auto-confirm settings.",
    "Go booking flow shows live slots, resource choices, party-size table bookings, guest details, notes, deposits, payment, and confirmation states.",
    "Customers can manage bookings with lookup links, calendar invites, rescheduling, and cancellation where allowed.",
    "Operations keeps booking status, upcoming bookings, customer details, notes, and follow-up context together with the rest of the business workspace.",
  ],
  feedback: [
    "Boost creates personalised QR feedback sessions tied to selected catalog/menu items, staff, discount percentage, and reward timing.",
    "Feedback detail shows rating, comment, customer contact details, staff attribution, metric scores, reward code state, and discount claim status.",
    "Owners can reply by email, add internal notes, mark feedback resolved, and send review requests only when the customer context makes sense.",
    "Low ratings stay in private recovery so the team can fix the issue before pushing for a public review.",
  ],
  reputation: [
    "Inbox combines public review tickets and private feedback so urgent reputation work is not split across tools.",
    "Review detail includes original review text, rating, platform, reviewer context, media where available, status, AI support, and reply workflows.",
    "The console includes a Report Fake Review action and suspicious-review context; BRC helps prepare platform disputes, while Google/Yelp/TripAdvisor control removals.",
    "Review channel settings cover Google Maps, Yelp, and TripAdvisor, with competitors and public signals feeding the wider reputation picture.",
  ],
  campaigns: [
    "Boost contains campaign creation and scheduled sends for review requests, feedback discounts, low-rating recovery, win-backs, and customer reactivation.",
    "Journey analytics track low rating recovery, high rating thank-you, and inactive win-back execution states such as queued, sent, skipped, and failed.",
    "Campaign results connect sends, recipients, redemptions, discounts, and revenue-influenced reporting.",
    "Consent and contact availability keep email follow-up cleaner and more defensible; SMS stays limited to review and feedback prompts.",
  ],
  rewards: [
    "Feedback rewards can be immediate or next-visit, with maximum discount rules and unique codes generated per customer moment.",
    "The redeem-discount scanner lets staff validate and claim codes at the counter instead of treating offers as untracked discounts.",
    "Public checkout can look up discount codes and apply eligible offer value before payment.",
    "Reward reporting connects feedback, campaigns, redemptions, estimated discount given, and repeat-visit value.",
  ],
  analytics: [
    "Insights cover review volume, average rating, resolved percentage, high-risk reviews, rating distribution, platform mix, and monthly movement.",
    "Campaign analytics show recipients, sends, redemptions, redemption rate, average discount, and revenue-influenced value.",
    "Operational analytics can include staff ratings, menu/catalog performance, booking/order activity, competitor movement, public signals, and social mentions.",
    "Owner digest and alerts summarise new reviews, low ratings, open replies, campaign redemptions, risks, and suggested actions.",
  ],
  "ai-intelligence": [
    "BRC AI operations combines revenue trend, health score, owner brief, manager priorities, forecast demand, stock alerts, labor gaps, device health, closeout variance, reviews, campaigns, and location risk.",
    "The Ask manager chat answers questions about why sales changed, what needs attention, what loss risk is emerging from sentiment or low ratings, what to prep, what to reorder, and whether staffing should change.",
    "Autopilot forecasts orders, revenue, prep quantities, reorder actions, and target labor hours so owners can act before the next service period.",
    "Restaurant digital twin simulations show likely operational impact from changes such as price moves, capacity changes, station workload, table turns, or service adjustments.",
    "Supporting AI remains available around BRC AI: review summaries, editable reply drafts, suspicious-review analysis, and AI catalogue setup that drafts menu items, prices, variations, modifiers, and options from photos or PDFs.",
  ],
  team: [
    "More/settings includes business connection, locations, review channels, competitors, owner digest, notifications, public page, catalog, tables, services, delivery, finance, team, and account settings.",
    "Business type presets tailor modules for restaurants, cafes, bakeries, retail, salons, spas, gyms, clinics, and service businesses.",
    "Team access uses roles, capabilities, and location scope so owners, managers, and staff see the right tools.",
    "Billing, plan gates, trial states, subscription status, support, audit-friendly admin flows, and feature overrides are part of the operating layer.",
  ],
  inventory: [
    "AI catalogue setup can read menu photos or PDFs and draft categories, items, prices, variations, modifiers, options, and descriptions before the team reviews and publishes.",
    "Catalog setup includes categories, item images, prices, SKUs, variants, modifier groups, bundles, allergens, labels, stock/availability, hidden items, and currency.",
    "Inventory views cover quantities, recipe-linked usage, negative quantity protections, sold-out state, and replenishment signals.",
    "Purchasing and vendor surfaces support supplier-driven back-office work where stock needs to be received, planned, or ordered.",
    "Menu versions and KDS routing keep customer ordering, kitchen preparation, and catalog control aligned before service.",
  ],
  finance: [
    "Finance views cover ledger-style accounting records, profitability reporting, payout requests, payment provider context, and owner-facing money signals.",
    "Tender, payment, refund, discount, and bill state are stored with order and register context.",
    "Manager closeout and cash drawer controls help keep end-of-shift money movement reviewable.",
    "Campaign, order, staff, stock, and fee context can feed revenue-influenced and profitability reporting.",
  ],
  "staff-ops": [
    "Team settings manage owners, managers, staff, roles, capabilities, location scope, and permission gates.",
    "Rota and staff shift surfaces support scheduling and daily team visibility.",
    "Payroll settings and payroll pages give operators a dedicated place to manage pay-related workflow.",
    "Operations, bookings, orders, closeout, and notifications all depend on staff context and role-aware access.",
  ],
  "register-controls": [
    "Manager PIN override modal protects sensitive actions when a staff member needs approval.",
    "Cash drawer, bill lifecycle, register flow, closeout, discount, refund, and payment states are modeled as operational controls.",
    "Offline sync uses a scoped mutation queue so selected local actions can be retained and synced later.",
    "Permissions and audit-friendly state changes keep controls visible to owners and managers instead of hiding them inside the till.",
  ],
  "market-signals": [
    "Competitor tracking gives owners public rating, review count, movement, and benchmark context.",
    "Public signals and social mention workflows surface brand presence and reputation risks outside the app.",
    "Review monitoring covers Google, Yelp, and TripAdvisor by plan, with suspicious-review context for dispute preparation.",
    "Private feedback, campaigns, rewards, and recovery workflows turn reputation signals into owner action.",
  ],
};

const FEATURE_APP_LOCATIONS = {
  pos: [
    { area: "Register / Retail Scanner", detail: "Use sales screens for counter, retail, and item-based checkout workflows on compatible devices." },
    { area: "Operations → POS Surface", detail: "Manage live orders, tables, bills, payments, fulfilment state, and operational status changes." },
    { area: "Customer Display / Kitchen Display", detail: "Run customer-facing and preparation screens separately from the register where the workflow needs it." },
    { area: "Manager Closeout", detail: "Review shift-end controls, cash drawer context, order state, and closeout readiness." },
  ],
  "tables-qr": [
    { area: "More → Tables", detail: "Create areas, tables, labels, seat counts, active states, and table-specific QR entry points." },
    { area: "Public Page / Go App", detail: "Open dine-in ordering or feedback with the correct table context after a customer scans." },
    { area: "Operations → Tables / Orders", detail: "Review table status, order notes, payment state, fulfilment state, and service context." },
    { area: "Boost → Review QR", detail: "Use QR sessions for table-linked feedback, rewards, and private recovery where configured." },
  ],
  ordering: [
    { area: "More → Catalog / Menu", detail: "Build categories, items, prices, variants, modifiers, bundles, labels, allergens, images, and availability." },
    { area: "More → Public Page", detail: "Publish the branded customer page, enable ordering, connect the public URL or custom domain, and preview the go app." },
    { area: "Operations → Orders / Kitchen / History", detail: "Manage live orders, preparation, table context, payment state, fulfilment status, and completed order history." },
    { area: "go.brcapp.io customer page", detail: "Customers browse, search, add item options, choose dine-in or pickup, pay, receive receipts, and reorder." },
  ],
  delivery: [
    { area: "More → Business Setup / Delivery", detail: "Turn delivery on as an order mode and keep it separate from pickup or dine-in where needed." },
    { area: "go.brcapp.io checkout", detail: "Customers enter address, postcode, delivery notes, and see delivery quote or unavailable-address messaging." },
    { area: "Operations → Orders", detail: "Staff see delivery fee, fulfilment type, driver/provider details, dispatch, pickup, delivered, failed, and cancelled states." },
    { area: "Insights / Boost", detail: "Delivery orders can feed feedback, review follow-up, rewards, win-back journeys, and reporting." },
  ],
  bookings: [
    { area: "More → Booking Services", detail: "Create services, staff, tables, resources, capacity, duration, deposits, business hours, buffers, and auto-confirm rules." },
    { area: "Operations → Bookings", detail: "Manage upcoming bookings, customer details, booking notes, and status changes." },
    { area: "go.brcapp.io booking flow", detail: "Customers choose booking type, resource, date, time, party size, notes, deposits, and confirmation." },
    { area: "Customer booking link", detail: "Customers can use lookup links for management, calendar invites, rescheduling, and cancellation where enabled." },
  ],
  feedback: [
    { area: "Boost → Review QR", detail: "Create personalised QR sessions tied to staff, items, discount percentage, and reward timing." },
    { area: "Feedback tab", detail: "Open feedback tickets, review ratings/comments/metric scores, claim discount codes, add notes, and resolve issues." },
    { area: "Feedback detail → Review request", detail: "Send review requests by SMS or email after the team decides the customer experience is ready for public follow-up." },
    { area: "Feedback detail → Email thread", detail: "Owners can reply directly, keep recovery context, and document internal notes." },
  ],
  reputation: [
    { area: "Inbox → Reviews", detail: "Handle public review tickets, original review text, rating, platform, media, status, AI support, and replies." },
    { area: "Inbox → Report Fake Review", detail: "Flag suspicious reviews and collect context for a platform dispute or removal request." },
    { area: "More → Review Channels", detail: "Connect and manage Google Maps, Yelp, and TripAdvisor review sources by plan." },
    { area: "More → Competitors / Insights", detail: "Track competitor reputation, public signals, review movement, and risks that need owner attention." },
  ],
  campaigns: [
    { area: "Boost → Campaigns", detail: "Create review requests, feedback discounts, low-rating recovery, win-back, staff/menu-based, and scheduled campaigns." },
    { area: "Campaign performance", detail: "Track sent, failed, redeemed, discount value, and revenue-influenced results." },
    { area: "Insights → Journeys", detail: "Review low-rating recovery, high-rating thank-you, and inactive win-back journey executions." },
    { area: "Customer records and consent", detail: "Use available email details and consent state for campaigns; reserve SMS details for review and feedback prompts." },
  ],
  rewards: [
    { area: "Boost → Review QR rewards", detail: "Set discount percent and choose immediate, next-visit, or no reward timing for feedback sessions." },
    { area: "Feedback detail", detail: "View generated reward codes, whether they were claimed, and when the reward was redeemed." },
    { area: "Redeem Discount", detail: "Staff scan or verify codes at the counter so rewards become trackable redemptions." },
    { area: "go.brcapp.io checkout", detail: "Customers can enter eligible discount codes before payment where public checkout is enabled." },
  ],
  analytics: [
    { area: "Insights tab", detail: "Review rating trends, risk, platform mix, resolved percentage, high-risk reviews, and campaign performance." },
    { area: "Insights → Owner assistant", detail: "See digest alerts for low ratings, open replies, new reviews, redemptions, and suggested actions." },
    { area: "Insights → Competitors / Public Signals", detail: "Monitor competitor movement, public mentions, sentiment, and external reputation context." },
    { area: "Business reports", detail: "Use exports, scheduled reports, and location rollups on higher plans where deeper reporting is needed." },
  ],
  "ai-intelligence": [
    { area: "BRC AI → AI owner brief", detail: "See what needs doing now across location risk, revenue movement, stock, staffing, devices, closeout, campaigns, and reputation." },
    { area: "BRC AI → AI operations", detail: "Review health score, revenue trend, autopilot brief, inventory forecast, prep plan, reorder actions, labor forecast, and business advisor summary." },
    { area: "BRC AI → Ask", detail: "Ask why sales changed, what sentiment may cause loss, what to prep, what to reorder, what staffing needs changing, or what experiment to try next." },
    { area: "BRC AI → Digital twin", detail: "Inspect simulations, prep-station workload, table turns, and operational impacts before changing pricing, service, or capacity." },
    { area: "Inbox / Catalog support", detail: "Use review summaries, reply drafts, suspicious-review context, and AI catalogue setup that drafts menu items, prices, variations, and modifiers from photos or PDFs." },
  ],
  team: [
    { area: "More → Team", detail: "Invite owners, managers, and staff, assign roles, capabilities, and location scope." },
    { area: "More → Locations", detail: "Separate location-level settings while keeping owner visibility across the organisation." },
    { area: "More → Notifications / Owner Digest", detail: "Choose alerts for reviews, feedback, orders, bookings, campaigns, support, billing, and daily owner summaries." },
    { area: "Billing / Upgrade / Support", detail: "Manage trial state, plan gates, feature overrides, subscription status, and support workflows." },
  ],
  inventory: [
    { area: "More → Catalog / Menu", detail: "Upload a menu photo or PDF for AI setup, then review drafted categories, prices, items, variations, modifiers, bundles, images, labels, allergens, and availability states." },
    { area: "More → Inventory", detail: "Track quantities, recipes, stock movement, item availability, and inventory-sensitive workflows." },
    { area: "More → Purchasing", detail: "Plan and manage supplier purchasing activity connected to catalog and inventory needs." },
    { area: "Operations / Go page", detail: "Keep what staff can sell and what customers can order aligned with real stock and menu readiness." },
  ],
  finance: [
    { area: "More → Finance", detail: "Review ledger-style records, profitability reporting, payout context, and finance settings." },
    { area: "Operations → POS / Orders", detail: "Keep tender, payment, refund, discount, and bill state connected to the order workflow." },
    { area: "Manager Closeout", detail: "Review closeout, cash drawer movement, tenders, exceptions, and end-of-shift context." },
    { area: "Billing / Payments", detail: "Connect payment readiness, subscription state, payout signals, and owner-level controls." },
  ],
  "staff-ops": [
    { area: "More → Team", detail: "Invite staff, set roles, assign capabilities, and scope access by location." },
    { area: "More → Rota", detail: "Plan staff coverage around service periods, bookings, and day-to-day operations." },
    { area: "More → Payroll", detail: "Manage payroll workflows in the same workspace as rota, shifts, and staff permissions." },
    { area: "Operations / Manager views", detail: "Keep staff context close to orders, bookings, closeout, and customer recovery work." },
  ],
  "register-controls": [
    { area: "Register controls", detail: "Use manager PIN overrides, discounts, refunds, permissions, and controlled actions where required." },
    { area: "Manager Closeout", detail: "Review end-of-shift state, cash drawer movement, order completion, and payment context." },
    { area: "Offline Sync", detail: "Review queued local actions and sync status when connectivity returns." },
    { area: "Settings → Team / Permissions", detail: "Decide who can approve sensitive actions and which screens each role can access." },
  ],
  "market-signals": [
    { area: "More → Competitors", detail: "Track local competitors, rating movement, review count, and benchmark context." },
    { area: "Insights → Public Signals", detail: "Review public signals, social mention context, and brand presence risks where enabled." },
    { area: "Inbox → Reviews", detail: "Monitor public reviews, suspicious-review flags, reply workflows, and recovery opportunities." },
    { area: "Feedback / Boost", detail: "Turn reputation risks into private recovery, review requests, rewards, and campaigns." },
  ],
};

const FEATURE_SCREENSHOTS = {
  pos: [
    productScreenshot("register", "BRC register with product grid, cart, table controls, and checkout actions"),
    productScreenshot("register2", "BRC register with order controls and service workflow actions"),
    productScreenshot("POS tools", "BRC POS tools for operational register actions"),
    productScreenshot("POS scanner", "BRC POS scanner for product and code entry"),
    productScreenshot("customer display", "BRC customer display showing customer-facing order totals"),
    productScreenshot("Kitchen1", "BRC kitchen display for active preparation tickets"),
    productScreenshot("kitchen2", "BRC kitchen workflow with live order status"),
    productScreenshot("KDS", "BRC kitchen display system for production routing"),
    productScreenshot("cash drawer", "BRC cash drawer controls and cash movement context"),
    productScreenshot("manager closeout", "BRC manager closeout with shift-end operational checks"),
    productScreenshot("receipt", "BRC receipt settings and customer receipt workflow"),
  ],
  "tables-qr": [
    productScreenshot("tables", "BRC table management showing venue tables and service context"),
    productScreenshot("tables 2", "BRC table view with table service controls"),
    productScreenshot("table setting 1", "BRC table settings for table configuration"),
    productScreenshot("table setting 2", "BRC table settings for QR and table setup"),
  ],
  ordering: [
    productScreenshot("orders1", "BRC live orders view with order details and status actions"),
    productScreenshot("orders 2", "BRC order management screen for customer order workflows"),
    productScreenshot("order history", "BRC order history for completed and past orders"),
    productScreenshot("operations", "BRC operations workspace for live service management"),
    productScreenshot("catalouge 1", "BRC catalogue setup supporting customer ordering"),
    productScreenshot("catalouge 2", "BRC catalogue item management for ordering"),
  ],
  delivery: [
    productScreenshot("delivery", "BRC delivery settings and fulfilment controls"),
    productScreenshot("delivery 2", "BRC delivery workflow with order fulfilment context"),
  ],
  bookings: [
    productScreenshot("booking 1", "BRC booking setup for services and reservations"),
    productScreenshot("booking 2", "BRC booking settings with availability and service detail"),
    productScreenshot("booking3", "BRC booking workflow for customer reservations"),
    productScreenshot("booking4", "BRC booking screen showing scheduling and service controls"),
  ],
  feedback: [
    productScreenshot("feedback_screen", "BRC private feedback inbox showing customer feedback context"),
    productScreenshot("review_screen", "BRC review and feedback detail screen"),
    productScreenshot("boost 1", "BRC Boost feedback session setup"),
    productScreenshot("boost 2", "BRC Boost workflow for review and feedback prompts"),
  ],
  reputation: [
    productScreenshot("review_home", "BRC reputation home with review activity"),
    productScreenshot("review channels", "BRC review channel settings for connected platforms"),
    productScreenshot("review_screen", "BRC review detail screen with recovery context"),
  ],
  campaigns: [
    productScreenshot("campaign 1", "BRC campaign list and customer follow-up workflow"),
    productScreenshot("campaign 2", "BRC campaign setup for customer messaging"),
    productScreenshot("campaign 3", "BRC campaign performance and automation workflow"),
    productScreenshot("campaign 4", "BRC campaign details for scheduled follow-up"),
  ],
  rewards: [
    productScreenshot("loyality points", "BRC loyalty points and customer reward tracking"),
    productScreenshot("loyality and accounts", "BRC loyalty and customer account settings"),
    productScreenshot("gift cards", "BRC gift card management for customer rewards"),
  ],
  inventory: [
    productScreenshot("inventory", "BRC inventory dashboard for stock and item availability"),
    productScreenshot("inventory 2", "BRC inventory screen for stock management"),
    productScreenshot("inventory 3", "BRC inventory item detail with operational controls"),
    productScreenshot("inventory 4", "BRC inventory setup for catalog-linked stock"),
    productScreenshot("inventory 5", "BRC inventory workflow for stock and replenishment"),
    productScreenshot("Purchasing 1", "BRC purchasing screen for supplier workflows"),
    productScreenshot("Purchasing 2", "BRC purchasing detail for vendor and stock needs"),
    productScreenshot("Purchasing 3", "BRC purchasing workflow for back-office stock planning"),
    productScreenshot("catalouge 3", "BRC catalogue screen connected to inventory"),
    productScreenshot("catalouge 4", "BRC catalogue item setup for menu and stock"),
    productScreenshot("catalouge 5", "BRC catalogue management with item details"),
    productScreenshot("catalouge 6", "BRC catalogue workflow for publish-ready items"),
  ],
  "staff-ops": [
    productScreenshot("staff training", "BRC staff training area for team onboarding and operational learning"),
    productScreenshot("staff permissions", "BRC staff permissions and role access controls"),
    productScreenshot("staff shifts", "BRC staff shifts screen for team operations"),
    productScreenshot("staff rota", "BRC rota view for staff scheduling"),
    productScreenshot("staff rota 2", "BRC rota planning with staff coverage context"),
    productScreenshot("payroll 1", "BRC payroll screen for pay workflow management"),
    productScreenshot("payroll 2", "BRC payroll detail with staff pay context"),
    productScreenshot("payroll 3", "BRC payroll workflow for operational teams"),
    productScreenshot("payroll 4", "BRC payroll settings and team finance controls"),
  ],
  finance: [
    productScreenshot("finance 1", "BRC finance overview with money movement context"),
    productScreenshot("finance 2", "BRC finance screen for owner reporting"),
    productScreenshot("finance 3", "BRC finance ledger and transaction workflow"),
    productScreenshot("finance 4", "BRC finance detail with operational records"),
    productScreenshot("finance 5", "BRC finance reporting connected to orders and closeout"),
    productScreenshot("finance 6", "BRC finance settings and payout context"),
    productScreenshot("finance 7", "BRC finance screen for daily money review"),
    productScreenshot("finance 8", "BRC finance chart and reporting screen"),
    productScreenshot("manager closeout", "BRC manager closeout with end-of-shift finance checks"),
  ],
  "register-controls": [
    productScreenshot("offline sync", "BRC offline sync queue for service resilience"),
    productScreenshot("devices and printers 1", "BRC devices and printers setup for local operations"),
    productScreenshot("devices and printers 2", "BRC device and printer workflow for hardware readiness"),
    productScreenshot("cash drawer", "BRC cash drawer controls for register accountability"),
    productScreenshot("manager closeout", "BRC manager closeout with controlled actions"),
    productScreenshot("receipt", "BRC receipt settings for controlled customer records"),
  ],
  "market-signals": [
    productScreenshot("review_home", "BRC review home showing reputation and market context"),
    productScreenshot("review channels", "BRC review channel settings for reputation monitoring"),
    productScreenshot("analytics 8", "BRC analytics screen with market and performance signals"),
    productScreenshot("complaince", "BRC compliance screen for operational governance"),
  ],
  analytics: [
    productScreenshot("analytics 1", "BRC analytics overview for owner reporting"),
    productScreenshot("analytics 2", "BRC analytics chart with business performance signals"),
    productScreenshot("analytics3", "BRC analytics dashboard with connected operational data"),
    productScreenshot("analytics 4", "BRC analytics screen for customer and revenue insights"),
    productScreenshot("analytics 5", "BRC analytics trend view for performance review"),
    productScreenshot("analytics 6", "BRC analytics reporting screen for operational decisions"),
    productScreenshot("analytics 7", "BRC analytics detail for owner insight"),
    productScreenshot("analytics 8", "BRC analytics workflow for market and business signals"),
    productScreenshot("analytics 9", "BRC analytics report with multi-signal context"),
  ],
  "ai-intelligence": [
    productScreenshot("AI 1", "BRC AI owner brief with operational recommendations"),
    productScreenshot("AI 2", "BRC AI screen showing business intelligence and next actions"),
    productScreenshot("AI 3", "BRC AI forecast and operations panel"),
    productScreenshot("AI 4", "BRC AI Ask workflow for manager questions"),
    productScreenshot("AI 5", "BRC AI analysis screen for demand and risk signals"),
  ],
  team: [
    productScreenshot("business profile 1", "BRC business profile setup for organisation settings"),
    productScreenshot("business profile 2", "BRC business profile screen with company details"),
    productScreenshot("business profile 3", "BRC business profile settings for operators"),
    productScreenshot("business profile 4", "BRC business profile workflow for setup completion"),
    productScreenshot("multilocations", "BRC multi-location management for growing teams"),
    productScreenshot("House accoutns", "BRC house accounts screen for account-based operations"),
    productScreenshot("notifiaction", "BRC notification settings for owner and staff alerts"),
    productScreenshot("public page 1", "BRC public page settings for customer-facing workflows"),
    productScreenshot("public page 2", "BRC public page setup with brand and ordering context"),
    productScreenshot("public page 3", "BRC public page workflow for customer publishing"),
    productScreenshot("public page 4", "BRC public page controls for business information"),
    productScreenshot("public page 5", "BRC public page preview and publishing settings"),
  ],
};

function ScreenshotGallery({ eyebrow = "Product Screenshots", title, body, screenshots = [], compact = false }) {
  const [expandedShot, setExpandedShot] = useState(null);

  if (!screenshots.length) return null;

  return (
    <section className={`section screenshot-section ${compact ? "screenshot-section-compact" : ""}`}>
      <div className="container">
        <div className="section-header feature-left-header">
          <div className="section-tag">{eyebrow}</div>
          <h2 className="section-h2">{title}</h2>
          {body ? <p className="section-p">{body}</p> : null}
        </div>
        <div className="screenshot-gallery">
          {screenshots.map((shot) => (
            <button
              className="screenshot-card"
              key={shot.name}
              type="button"
              onClick={() => setExpandedShot(shot)}
              aria-label={`Expand ${shot.name} screenshot`}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              <span>Expand</span>
            </button>
          ))}
        </div>
      </div>
      <ScreenshotLightbox shot={expandedShot} onClose={() => setExpandedShot(null)} />
    </section>
  );
}

function HelpScreenshotStrip({ screenshots = [] }) {
  const [expandedShot, setExpandedShot] = useState(null);

  if (!screenshots.length) return null;

  return (
    <section className="help-article-section help-screenshot-section">
      <h3>Related screenshots</h3>
      <div className="help-screenshot-gallery">
        {screenshots.map((shot) => (
          <button
            className="help-screenshot-card"
            key={shot.name}
            type="button"
            onClick={() => setExpandedShot(shot)}
            aria-label={`Expand ${shot.name} screenshot`}
          >
            <img src={shot.src} alt={shot.alt} loading="lazy" />
            <span>Expand</span>
          </button>
        ))}
      </div>
      <ScreenshotLightbox shot={expandedShot} onClose={() => setExpandedShot(null)} />
    </section>
  );
}

function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Highlights</div>
          <h2 className="section-h2">
            Everything BRC gives
            <br />
            <span className="grad-text">local business owners</span>
          </h2>
          <p className="section-p">
            Scan the full product below. Each feature links to a dedicated
            explanation page with setup steps, day-to-day usage, and how it
            fits into the BRC console.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <a key={f.title} href={`/features/${f.slug}`} className="feature-card">
              <div
                className="feature-icon-wrap"
                style={{ "--accent": f.accent }}
              >
                <FeatureGlyph slug={f.slug} />
              </div>
              <div className="feature-tag">{f.tag}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-body">{f.body}</p>
              <div className="feature-outcome">{f.outcome}</div>
              <div className="feature-link">Explore {f.title} <span>→</span></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIndexPage({ onNavigate, theme, onToggleTheme }) {
  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="feature-page">
        <Features />
        <CTA />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// ─── REVIEW PLATFORMS ─────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    name: "Google",
    letter: "G",
    color: "#4285F4",
    reviews: "2.1M+ reviews tracked",
  },
  {
    name: "Yelp",
    letter: "Y",
    color: "#FF1A1A",
    reviews: "880k+ reviews tracked",
  },
  {
    name: "Tripadvisor",
    letter: "T",
    color: "#00AA6C",
    reviews: "590k+ reviews tracked",
  },
];

const PLATFORM_FEATURES = [
  "You choose which platform to grow",
  "Positive review building after real visits",
  "Private recovery for unhappy customers",
  "Follow-ups feel natural, not automated",
  "AI flags fake and suspicious reviews for disputes",
  "Real-time notifications for new reviews",
];

function Platforms() {
  return (
    <section className="section platforms-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Review Monitoring</div>
          <h2 className="section-h2">
            Your choice of platform.
            <br />
            <span className="grad-text">One place to manage all of them.</span>
          </h2>
          <p className="section-p">
            Choose where you want to grow your reviews. BRC follows up with
            happy customers naturally, routes unhappy customers into private
            recovery, and helps your team prepare evidence when a review looks
            fake or suspicious.
          </p>
        </div>
        <div className="platforms-grid">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="platform-card">
              <div className="platform-icon" style={{ background: p.color }}>
                {p.letter}
              </div>
              <div className="platform-name">{p.name}</div>
              <div className="platform-count">{p.reviews}</div>
            </div>
          ))}
        </div>
        <div className="platform-checklist">
          {PLATFORM_FEATURES.map((f) => (
            <div key={f} className="platform-check">
              <span className="check-icon">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

const ANALYTICS_FEATURES = [
  {
    icon: "📈",
    title: "Reputation Recovery Tracking",
    desc: "Monitor Google, Yelp, and TripAdvisor, then track rating trends, review volume, recovery status, and response times in one place.",
  },
  {
    icon: "👥",
    title: "Competitor Intelligence",
    desc: "Track competitor ratings, review counts, and sentiment. Identify market opportunities and benchmark your performance against local rivals.",
  },
  {
    icon: "🧠",
    title: "AI-Powered Review Analysis",
    desc: "Automatic sentiment analysis, fake review detection, and risk scoring. Get alerts for urgent reviews, dispute candidates, and customer emotions.",
  },
  {
    icon: "📊",
    title: "Advanced Dashboards",
    desc: "Interactive charts for feedback trends, campaign performance, staff ratings, and catalog item popularity. Export data for deeper analysis.",
  },
  {
    icon: "⚡",
    title: "Real-Time Notifications",
    desc: "Instant alerts for new reviews, low ratings, suspicious activity, or competitor changes. Never miss a chance to recover, respond, or celebrate positive feedback.",
  },
  {
    icon: "🎯",
    title: "Actionable Insights",
    desc: "Identify top-performing staff, best-selling items, and successful campaigns. Make data-driven decisions to improve your business.",
  },
];

function Analytics() {
  return (
    <section className="section analytics-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Analytics & Intelligence</div>
          <h2 className="section-h2">
            Turn data into
            <br />
            <span className="grad-text">competitive advantage</span>
          </h2>
          <p className="section-p">
            Don&apos;t just collect reviews — understand them. BRC&apos;s
            analytics give you the full picture of your reputation, competitors,
            and customers.
          </p>
        </div>
        <div className="analytics-grid">
          {ANALYTICS_FEATURES.map((f) => (
            <div key={f.title} className="analytics-card">
              <div className="analytics-icon">{f.icon}</div>
              <h3 className="analytics-title">{f.title}</h3>
              <p className="analytics-desc">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="analytics-cta">
          <a href="/#pricing" className="btn btn-primary btn-xl">
            See Analytics in Action <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

const JOURNEYS = [
  {
    icon: "💔",
    color: "#ef4444",
    label: "Private Recovery",
    desc: "Unhappy customers resolve their issue privately with your team — before it ever becomes a public complaint.",
  },
  {
    icon: "⭐",
    color: "#f59e0b",
    label: "Positive Review Builder",
    desc: "Happy customers get a natural prompt to share their experience on the platform you want to grow.",
  },
  {
    icon: "🎁",
    color: "#10b981",
    label: "Feedback Reward",
    desc: "Every customer who submits feedback gets an instant discount code. Higher submission rates, genuine data, and a reason to come back.",
  },
  {
    icon: "👋",
    color: "#8b5cf6",
    label: "Win-Back Campaign",
    desc: "Re-engage customers who haven't visited in 45 days with a compelling, personalised offer that's timed perfectly.",
  },
];

function Campaigns() {
  return (
    <section className="section campaigns-section">
      <div className="container">
        <div className="campaigns-layout">
          <div className="campaigns-copy">
            <div className="section-tag">Automated Journeys</div>
            <h2 className="section-h2">
              Set it once.
              <br />
              <span className="grad-text">Grow forever.</span>
            </h2>
            <p
              className="section-p"
              style={{ textAlign: "left", maxWidth: "none" }}
            >
              BRC runs the right communication at exactly the right
              moment: order confirmations, booking reminders, recovery,
              rewards, review requests, and win-backs without you having to
              think about it.
            </p>
            <div className="journey-list">
              {JOURNEYS.map((j) => (
                <div key={j.label} className="journey-item">
                  <div
                    className="journey-icon"
                    style={{ background: `${j.color}20`, color: j.color }}
                  >
                    {j.icon}
                  </div>
                  <div>
                    <div className="journey-label">{j.label}</div>
                    <div className="journey-desc">{j.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="campaigns-mockup">
            <div className="cm-topbar">
              <div className="cm-title">Campaign Performance</div>
              <div className="cm-badge">Last 30 days</div>
            </div>
            <div className="cm-kpis">
              <div className="cm-kpi">
                <div className="cm-kpi-val" style={{ color: "#a78bfa" }}>
                  1,284
                </div>
                <div className="cm-kpi-label">Emails Sent</div>
              </div>
              <div className="cm-kpi">
                <div className="cm-kpi-val" style={{ color: "#34d399" }}>
                  328
                </div>
                <div className="cm-kpi-label">Redeemed</div>
              </div>
              <div className="cm-kpi">
                <div className="cm-kpi-val" style={{ color: "#fbbf24" }}>
                  25.5%
                </div>
                <div className="cm-kpi-label">Rate</div>
              </div>
            </div>
            <div className="cm-chart-area">
              <div className="cm-bars">
                {[40, 65, 45, 80, 60, 95, 78].map((h, i) => (
                  <div key={i} className="cm-bar-col">
                    <div className="cm-bar" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="cm-days">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="cm-day">
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div className="cm-footer">
              <div className="cm-footer-item">
                <span className="cm-dot cm-dot-sent" />
                Top campaign: Win-Back
              </div>
              <div className="cm-footer-item cm-footer-up">
                ↑ 18% vs last month
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    desc: "For new or small operators who want to start with BRC POS, catalog, ordering, bookings, payments, and private feedback without a subscription.",
    cta: "Start free",
    highlight: true,
    badge: "Start free",
    features: [
      "1 location with basic POS/register",
      "£0 monthly subscription",
      "Customer storefront and public page setup",
      "Catalog, pickup ordering, bookings, and table requests",
      "Private feedback and review capture",
      "Use your own web, mobile, and tablet screens",
    ],
  },
  {
    name: "Growth",
    monthly: 49,
    annual: 44,
    desc: "For one location ready to run POS, storefront, ordering, bookings, AI prompts, recovery, and daily operations.",
    cta: "Start 7-day trial",
    highlight: false,
    badge: "Best value",
    features: [
      "1 location with POS, storefront, orders, and bookings",
      "0.5% BRC platform fee on BRC-powered payments",
      "AI summaries, review replies, and daily owner prompts",
      "Private feedback, recovery flows, and staff ratings",
      "Competitor tracking up to 3 businesses",
      "Customer follow-up and reputation workflows",
    ],
  },
  {
    name: "Pro",
    monthly: 99,
    annual: 89,
    desc: "For growing teams that need the full operating layer across POS, orders, staff, inventory, finance, AI, and market insights.",
    cta: "Start 7-day trial",
    highlight: false,
    badge: "Multi-location",
    features: [
      "Up to 3 locations",
      "POS register, table tabs, tenders, customer display, and KDS",
      "Online ordering, QR/table flows, pickup, and delivery",
      "Staff rota, shifts, payroll, permissions, and closeout",
      "Finance, payouts, tender visibility, and profitability reporting",
      "Advanced AI, analytics, inventory, and market insights",
    ],
  },
  {
    name: "Enterprise",
    monthly: 249,
    annual: 224,
    desc: "For operators and multi-location brands that need OS-wide views across POS, staff, stock, purchasing, finance, fulfilment, reputation, and reporting.",
    cta: "Start enterprise",
    highlight: false,
    badge: "AI powered",
    features: [
      "Up to 10 locations, then custom",
      "No BRC platform fee on BRC-powered payments",
      "Multi-location ordering, booking, pickup, and delivery views",
      "Inventory, stock, recipes, vendors, and purchasing workflows",
      "BRC AI owner brief and location comparison",
      "Brand-level recovery, campaigns, reports, and alerts",
      "Scheduled reports, exports, and onboarding support",
    ],
  },
  {
    name: "Custom",
    monthly: "Custom",
    annual: "Custom",
    desc: "For franchises, agencies, and teams with heavier POS, ordering, finance, AI, recovery, or signal-monitoring needs.",
    cta: "Talk to us",
    highlight: false,
    badge: "Scale",
    contactHref: "/contact",
    spanFull: true,
    features: [
      "More than 10 locations",
      "Custom POS, ordering, storefront, and finance setup",
      "Custom AI, brand mention, and competitor monitoring",
      "Custom review, recovery, and public signal allowance",
      "Custom operating, finance, and recovery reporting",
      "SLA, priority sync, and dedicated onboarding",
    ],
  },
];

const PLAN_DETAIL_GROUPS = [
  {
    title: "Locations and screens",
    rows: [
      ["Locations", "1", "1", "Up to 3", "Up to 10, then custom", "Custom"],
      ["Operator screens", "Own devices", "Own devices", "Unlimited supported screens", "Unlimited supported screens", "Custom estate"],
      ["Hardware lock-in", "No", "No", "No", "No", "No"],
    ],
  },
  {
    title: "Reviews and customer recovery",
    rows: [
      ["Private feedback", "Basic", "Included", "Advanced reporting", "Brand-level reports", "Custom"],
      ["Google reviews", "Manual setup", "Daily sync and up to 50 previous reviews", "Included", "Included", "Custom allowance"],
      ["Yelp and TripAdvisor", "Not included", "Not included", "Up to 500 previous reviews", "Up to 1,000 previous reviews", "Custom allowance"],
      ["Suspicious review support", "Not included", "Flags and context", "Dispute context", "Brand alerts", "Custom workflow"],
    ],
  },
  {
    title: "Operations modules",
    rows: [
      ["POS/register", "Basic", "Basic", "Register, tabs, tenders, customer display, KDS", "Multi-location queues", "Custom"],
      ["Orders, bookings, pickup, delivery", "Simple workflows", "Simple workflows", "Advanced configuration", "Multi-location views", "Custom"],
      ["Tables and QR codes", "Basic requests", "Basic setup", "Table maps, areas, dine-in scan flows", "Multi-location controls", "Custom"],
      ["Stock, purchasing, vendors", "Basic catalog", "Basic catalog", "Available by module setup", "Inventory, recipes, vendors, purchasing", "Custom"],
      ["Rota, payroll, permissions", "Basic access", "Staff ratings", "Rota, shifts, payroll, permissions", "Rollups and controls", "Custom"],
    ],
  },
  {
    title: "Money, AI, and reporting",
    rows: [
      ["BRC platform fee", "1%", "0.5%", "0.25%", "0%", "Custom"],
      ["Finance and closeout", "Basic payments context", "Basic reporting", "Payouts, tenders, profitability", "Multi-location reporting", "Custom"],
      ["BRC AI", "Not included", "AI summaries and reply drafts", "Operational insights", "Owner brief and location comparison", "Custom"],
      ["Campaigns and segments", "Not included", "Email basics", "Advanced campaigns and segments", "Multi-location campaigns", "Custom"],
      ["Onboarding", "Self-serve", "Self-serve", "Priority support", "Onboarding support", "Dedicated onboarding"],
    ],
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Pricing</div>
          <h2 className="section-h2">
            Simple pricing for one connected
            <br />
            <span className="grad-text">business operating system</span>
          </h2>
          <p className="section-p">
            Each plan shows the essentials. Start free, book a demo if you want
            help choosing, and open the full details when you need every limit.
          </p>
          <div className="billing-toggle">
            <span className={!annual ? "tgl-active" : "tgl-dim"}>Monthly</span>
            <button
              className={`tgl-btn ${annual ? "tgl-on" : ""}`}
              onClick={() => setAnnual((v) => !v)}
            >
              <span className="tgl-knob" />
            </button>
            <span className={annual ? "tgl-active" : "tgl-dim"}>
              Annual&nbsp;<span className="tgl-save">Save 10%</span>
            </span>
          </div>
        </div>

        <div className="plans-grid">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`plan-card ${p.highlight ? "plan-highlight" : ""} ${p.spanFull ? "plan-card-wide" : ""}`}
            >
              <div className="plan-main">
                {p.badge && <div className="plan-badge">{p.badge}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">
                  {typeof p.monthly === "number" && (
                    <span className="plan-curr">£</span>
                  )}
                  <span className="plan-num">
                    {annual ? p.annual : p.monthly}
                  </span>
                  {typeof p.monthly === "number" && p.monthly > 0 && (
                    <span className="plan-per">/mo</span>
                  )}
                </div>
                {annual && typeof p.monthly === "number" && p.monthly > 0 && (
                  <div className="plan-billed">
                    Billed annually · Save £{(p.monthly - p.annual) * 12}/yr
                  </div>
                )}
                <p className="plan-desc">{p.desc}</p>
                <a
                  href={p.contactHref || signupUrl({
                    plan: p.name.toLowerCase(),
                    billing: annual ? "annual" : "monthly",
                  })}
                  className={`btn ${p.highlight ? "btn-primary" : "btn-outline"} btn-block`}
                  target={p.contactHref ? undefined : "_blank"}
                  rel={p.contactHref ? undefined : "noopener noreferrer"}
                >
                  {p.cta}
                </a>
              </div>
              <ul className="plan-features">
                {p.features.slice(0, 5).map((f) => (
                  <li key={f} className="plan-feature">
                    <span className="plan-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/pricing" className="plan-details-link">
                View all features <span>→</span>
              </a>
            </div>
          ))}
        </div>

        <div className="pricing-addons">
          <div>
            <strong>Need more review SMS credits?</strong>
            <span className="addon-text">
              {" "}
              Add-on packs: 100 credits for £9 · 500 credits for £39
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanDetails() {
  return (
    <section className="section plan-details-section" id="plan-details">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Full Plan Details</div>
          <h2 className="section-h2">
            Compare the details before you choose.
          </h2>
          <p className="section-p">
            The homepage cards stay short. This page shows the practical limits,
            modules, review coverage, AI, payment fees, and onboarding differences.
          </p>
        </div>

        <div className="plan-details-table-wrap" aria-label="Full BRC plan comparison">
          <table className="plan-details-table">
            <thead>
              <tr>
                <th scope="col">Plan area</th>
                {PLANS.map((plan) => (
                  <th scope="col" key={plan.name}>{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_DETAIL_GROUPS.map((group) => (
                <Fragment key={group.title}>
                  <tr className="plan-details-group-row" key={`${group.title}-heading`}>
                    <th scope="row" colSpan={PLANS.length + 1}>{group.title}</th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={`${group.title}-${row[0]}`}>
                      <th scope="row">{row[0]}</th>
                      {row.slice(1).map((value, index) => (
                        <td key={`${row[0]}-${PLANS[index].name}`}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="plan-details-notes">
          <span>Review SMS credit packs, specialist onboarding, higher usage, and custom integrations may be charged separately.</span>
          <span>Plan packaging can vary by region, promotion, payment setup, enabled modules, and written agreement.</span>
        </div>
      </div>
    </section>
  );
}

function PricingDetailsPage({ theme, onToggleTheme, onNavigate }) {
  return (
    <div className="content-page pricing-details-page">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="content-page-main">
        <PlanDetails />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Do we need to buy BRC hardware?",
    a: "No. BRC OS is designed around web, iOS, Android, tablet, and display workflows so teams can use their own compatible devices for registers, kitchen screens, manager views, customer display, and owner access.",
  },
  {
    q: "Are POS screens limited per location?",
    a: "BRC OS is positioned around unlimited operator screens rather than charging per proprietary terminal. Plan limits still apply to locations, usage, messaging, payments, and enabled modules, but the hardware strategy is to avoid per-screen lock-in.",
  },
  {
    q: "Is BRC just POS or reputation software?",
    a: "No. POS and reputation recovery are modules inside BRC OS. The broader system also covers orders, table tabs, table and QR code management, tenders, catalog, inventory, purchasing, vendors, rota, payroll, finance, competitor tracking, social signals, brand mentions, rewards, campaigns, analytics, and customer operations.",
  },
  {
    q: "Can BRC manage table QR codes?",
    a: "Yes. BRC can manage table areas, table labels, seat counts, active states, and table-specific QR codes. Scans can carry dine-in table context into ordering, payment, feedback, rewards, and recovery workflows.",
  },
  {
    q: "What happens if the internet drops during service?",
    a: "BRC includes offline sync queue support for selected operational actions, so supported local changes can be retained and synced when connectivity returns. Payment providers, messaging, and third-party services may still require a live connection.",
  },
  {
    q: "How is the feedback form personalised to each customer?",
    a: 'When a customer scans a QR code, places an order, or completes a booking, the platform can generate questions based on what actually happened. Instead of a generic "how was your visit?", they can be asked about their dish, service, appointment, staff member, table, or collection experience.',
  },
  {
    q: "What ordering workflows are supported?",
    a: "The product is designed for dine-in, pickup, retail, and service ordering through branded customer pages. Orders can connect to customer profiles, rewards, feedback, redemptions, and item-level performance analytics.",
  },
  {
    q: "What booking workflows are supported?",
    a: "Bookings can support appointments, staff-and-service scheduling, classes, sessions, and other service-led flows. Booking records can power reminders, feedback, review follow-up, and repeat-customer campaigns.",
  },
  {
    q: "Do customers have to download an app to leave feedback?",
    a: "No. Customers scan the QR code with their phone camera and the feedback form opens instantly in their browser. No app download, no sign-up — just a quick, frictionless experience that takes under 60 seconds.",
  },
  {
    q: "How does the discount reward work?",
    a: "As soon as a customer submits their feedback, they can receive a personalised discount code by SMS where review SMS is configured. The code is unique to them, trackable, and can be set to expire after a time of your choosing. Businesses using rewards typically see 3× more feedback submissions.",
  },
  {
    q: "When and how are customers asked for public reviews?",
    a: "The platform sends a natural, well-timed follow-up message after genuine activity such as a visit, order, or booking. Happy customers can be guided toward the review platform you want to grow, while unhappy customers can be routed into private recovery first.",
  },
  {
    q: "What happens when a customer leaves negative feedback?",
    a: "Unhappy customers are given a private channel to share their concerns directly with your business before they consider posting publicly. Your team can respond personally, add notes, resolve the issue, and turn a bad experience into a reason to return.",
  },
  {
    q: "Can BRC help with fake or suspicious reviews?",
    a: "Yes. BRC can flag suspicious patterns, keep review context in one place, and help your team prepare a clearer dispute or removal request for the review platform. Final removal decisions are controlled by the third-party platform where the review was posted.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes, absolutely. Cancel any time from your account settings. You'll keep access until the end of your current billing period. No cancellation fees, no awkward phone calls.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">FAQ</div>
          <h2 className="section-h2">
            Common <span className="grad-text">questions</span>
          </h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? "faq-open" : ""}`}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{f.q}</span>
                <span className="faq-icon">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function CTA({ trialHref = trialSignupUrl() } = {}) {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-glow" />
          <div className="section-tag" style={{ marginBottom: 20 }}>
            Get Started
          </div>
          <h2 className="cta-h2">
            Start with your business,
            <br />
            <span className="grad-text">not a setup marathon.</span>
          </h2>
          <p className="cta-p">
            Create your account, connect your business, and start managing
            ordering, bookings, feedback, reputation, and customer follow-up
            from the same app today.
          </p>
          <div className="cta-btns">
            <a href={trialHref} className="btn btn-primary btn-xl" target={trialHref.startsWith("http") ? "_blank" : undefined} rel={trialHref.startsWith("http") ? "noopener noreferrer" : undefined}>
              Start Free <span className="arrow">→</span>
            </a>
            <div className="store-btns">
              <a href={IOS_APP_URL} className="store-btn" target="_blank" rel="noopener noreferrer">
                <span className="store-os">🍎</span>
                <div>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </a>
              <a href={ANDROID_APP_URL} className="store-btn" target="_blank" rel="noopener noreferrer">
                <span className="store-os">🤖</span>
                <div>
                  <small>Get it on</small>
                  <strong>Google Play</strong>
                </div>
              </a>
              <a href={WEB_APP_URL} className="store-btn" target="_blank" rel="noopener noreferrer">
                <span className="store-os">🌐</span>
                <div>
                  <small>Available on</small>
                  <strong>Web App</strong>
                </div>
              </a>
              <a href="#" className="store-btn">
                <span className="store-os">⌘</span>
                <div>
                  <small>Available for</small>
                  <strong>macOS</strong>
                </div>
              </a>
              <a href="#" className="store-btn">
                <span className="store-os">⊞</span>
                <div>
                  <small>Available for</small>
                  <strong>Windows</strong>
                </div>
              </a>
            </div>
          </div>
          <div className="cta-trust">
	            {[
	              "7-day Growth trial",
	              "No long-term contract",
	              "Cancel any time",
	            ].map((t) => (
              <span key={t} className="cta-trust-item">
                <span className="trust-check">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── INDUSTRY LANDING PAGES ──────────────────────────────────────────────────

const INDUSTRY_PAGES = {
  restaurants: {
    eyebrow: "For restaurants",
    title: "Fill tables. Own orders. Bring guests back.",
    subhead:
      "BRC helps restaurants own more of the customer journey: reservations, table QR ordering, pickup, delivery, private feedback, review requests, rewards, campaigns, and owner reporting in one operating console.",
    pain: "Restaurant teams often pay for bookings, ordering, delivery, loyalty, reviews, feedback, and campaigns separately, then still miss the moment when an unhappy customer is about to go public.",
    primaryCta: "Start Restaurant Trial",
    secondaryCta: "Get Free Restaurant Audit",
    proof: ["Bookings", "Table QR", "Pickup & delivery", "Review recovery"],
    workflows: [
      ["Capture bookings", "Let guests reserve tables, share contact details, receive confirmations, and create a customer record before they arrive."],
      ["Take direct orders", "Publish a branded menu, table QR, pickup, delivery, fees, preparation expectations, and fulfilment notes from your own customer page."],
      ["Protect your rating", "Route low-rating customers into private recovery before they become public review damage."],
      ["Bring guests back", "Send rewards, review requests, and win-back campaigns connected to real orders and visits."],
    ],
    operations: [
      ["Live order flow", "Track table, pickup, and delivery requests with status visibility for accepted, preparing, ready, completed, or cancelled work."],
      ["Menu controls", "Manage categories, items, modifiers, bundles, allergens, availability, delivery rules, and fulfilment notes from the console."],
      ["Team visibility", "Keep staff focused with customer context, booking details, order notes, feedback history, and owner-level controls."],
      ["Owner reporting", "Use daily signals for orders, reviews, recovery, campaigns, rewards, and operational bottlenecks."],
    ],
    modules: ["Operations", "Bookings", "Ordering", "Tables", "Pickup", "Delivery", "Feedback", "Reviews", "Rewards", "Campaigns", "Analytics"],
    objections: [
      ["We already use marketplaces", "BRC helps you build your owned customer relationship instead of giving every repeat journey to a marketplace."],
      ["We do not have time", "Start with one workflow: private feedback after orders or table QR ordering. Add campaigns later."],
      ["We already ask for reviews", "BRC adds timing, context, private recovery, and follow-up based on real customer activity."],
      ["We already have a POS", "BRC does not need to replace the POS on day one. It adds the customer journey layer around ordering, feedback, reviews, rewards, and follow-up."],
    ],
  },
  cafes: {
    eyebrow: "For cafes and bakeries",
    title: "Turn regulars into repeat visits.",
    subhead:
      "BRC gives cafes and bakeries a simple customer operations layer for pickup ordering, menus, private feedback, bad-review recovery, loyalty-style rewards, campaigns, and local reputation growth.",
    pain: "Cafes win through regulars, but many regular customer moments disappear without feedback, contact details, review prompts, or measurable return visits.",
    primaryCta: "Start Cafe Trial",
    secondaryCta: "Get Free Cafe Audit",
    proof: ["Pickup orders", "Bad-review recovery", "Feedback QR", "Review requests"],
    workflows: [
      ["Launch pickup ordering", "Let customers browse, order, and collect from a branded public page."],
      ["Reward useful feedback", "Offer trackable discounts after feedback and see which rewards become return visits."],
      ["Recover bad experiences", "Catch unhappy customers with private feedback, respond before they post publicly, and ask happy customers for reviews at natural moments."],
      ["Spot menu signals", "Use item, feedback, and campaign data to see what customers actually respond to."],
    ],
    operations: [
      ["Morning-ready setup", "Control menus, item availability, pickup windows, preparation expectations, and sold-out states as the day changes."],
      ["Order handling", "Give the team a clear flow for new, preparing, ready, collected, and cancelled pickup orders."],
      ["Customer context", "See feedback, reward usage, repeat activity, and review history without switching tools."],
      ["Owner digest", "Review the signals that matter: popular items, unhappy customers, reward performance, repeat visits, and campaign results."],
    ],
    modules: ["Operations", "Catalog", "Pickup", "Feedback", "Review recovery", "Reviews", "Rewards", "Campaigns", "Owner digest"],
    objections: [
      ["We are too small", "That is exactly why replacing several tools with one simple workflow matters."],
      ["We do not want complex setup", "Start with your menu, feedback QR, and one reward. The rest can grow gradually."],
      ["Our customers already know us", "Regulars are the best source of reviews, referrals, feedback, and repeat campaigns."],
      ["We already use social media", "Social posts create attention, but BRC helps turn real visits into owned customer data, reviews, rewards, and repeat orders."],
    ],
  },
  salons: {
    eyebrow: "For salons and spas",
    title: "Keep your diary full.",
    subhead:
      "BRC helps appointment-led businesses manage services, staff, bookings, deposits, reminders, private feedback, bad-review recovery, review follow-up, and win-back campaigns from one place.",
    pain: "A salon can have full diaries and still leak revenue through no-shows, weak follow-up, missed reviews, and clients who quietly stop booking.",
    primaryCta: "Start Salon Trial",
    secondaryCta: "Get Free Salon Audit",
    proof: ["Services", "Staff bookings", "Review recovery", "Win-backs"],
    workflows: [
      ["Publish services", "Create services, staff, capacity, duration, prices, deposits, buffers, and booking rules."],
      ["Reduce admin", "Use confirmations, reminders, customer notes, and booking status to keep the team aligned."],
      ["Recover bad experiences", "Follow up after appointments with private feedback, route unhappy clients to recovery, and send legitimate review requests to happy clients."],
      ["Reactivate clients", "Send win-back offers to lapsed clients by email, with SMS reserved for review and feedback prompts."],
    ],
    operations: [
      ["Service setup", "Manage services, durations, prices, deposits, buffers, staff availability, and booking rules in one place."],
      ["Diary visibility", "Track upcoming bookings, status, customer notes, confirmations, no-shows, cancellations, and follow-up needs."],
      ["Staff workflows", "Give staff the booking and customer context they need while keeping sensitive owner controls separate."],
      ["Recovery queue", "See unhappy appointment feedback, missed review opportunities, lapsed clients, and win-back actions together."],
    ],
    modules: ["Operations", "Bookings", "Services", "Staff", "Feedback", "Review recovery", "Reviews", "Campaigns", "Rewards", "Analytics"],
    objections: [
      ["We already have booking software", "BRC connects bookings to feedback, reputation, rewards, campaigns, and owner reporting."],
      ["Staff need simple tools", "Permissions and workflow views let staff focus on bookings and customer context without owner-only controls."],
      ["Clients book through Instagram", "BRC gives those clients a cleaner destination and helps you keep the relationship after the booking."],
      ["We rely on repeat clients", "That is exactly why reminders, feedback, reviews, and win-back campaigns matter: they help loyal clients keep returning and referring."],
    ],
  },
  retail: {
    eyebrow: "For local retail",
    title: "Bring local shoppers back.",
    subhead:
      "BRC helps local retailers publish a product catalog, accept pickup orders, collect feedback, recover bad experiences, build reviews, send rewards, and understand which customer actions bring people back.",
    pain: "Independent shops often have loyal customers but no owned system for catalog browsing, pickup, feedback, rewards, review growth, and reactivation.",
    primaryCta: "Start Retail Trial",
    secondaryCta: "Get Free Retail Audit",
    proof: ["Catalog", "Pickup", "Review recovery", "Customer CRM"],
    workflows: [
      ["Publish a local catalog", "Show products, categories, prices, images, variants, bundles, stock, and availability."],
      ["Take pickup orders", "Let customers reserve or buy for collection without sending every relationship to a marketplace."],
      ["Create repeat visits", "Use rewards, discount codes, and campaign follow-up tied to real customer activity."],
      ["Recover bad experiences", "Collect private feedback after purchases, handle issues before they become public reviews, and ask happy customers at the right moment."],
    ],
    operations: [
      ["Catalog controls", "Manage products, categories, variants, bundles, images, prices, visibility, and availability without a full ecommerce rebuild."],
      ["Pickup workflow", "Track reserve, prepare, ready, collected, and cancelled orders with customer details and staff notes."],
      ["Stock awareness", "Use hidden, unavailable, and featured states so customers see what the shop can actually fulfil."],
      ["Owner view", "Connect orders, feedback, rewards, reviews, and campaigns to understand what drives return visits."],
    ],
    modules: ["Operations", "Catalog", "Inventory", "Pickup", "Feedback", "Review recovery", "Reviews", "Rewards", "Campaigns", "CRM"],
    objections: [
      ["We are not ecommerce", "BRC can start as a local catalog and pickup flow, not a full warehouse ecommerce system."],
      ["We already post on social", "Social creates attention; BRC helps capture the customer relationship and follow-up."],
      ["Stock changes often", "Use hidden and unavailable states so customers see what is actually ready."],
      ["Customers prefer visiting in person", "BRC supports that by turning in-store relationships into pickup orders, feedback, rewards, reviews, and follow-up campaigns."],
    ],
  },
};

function IndustryLandingPage({ slug = "restaurants", onNavigate, theme, onToggleTheme }) {
  const page = INDUSTRY_PAGES[slug] || INDUSTRY_PAGES.restaurants;
  const trialHref = trialSignupUrl();

  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="industry-page">
        <section className="industry-hero">
          <div className="hero-bg">
            <div className="glow glow-1" />
            <div className="glow glow-2" />
            <div className="grid-overlay" />
          </div>
          <div className="container industry-hero-inner">
            <div className="industry-copy">
              <div className="section-tag">{page.eyebrow}</div>
              <h1 className="industry-title">{page.title}</h1>
              <p className="industry-subhead">{page.subhead}</p>
              <div className="hero-btns">
                <a href={trialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                  {page.primaryCta} <span className="arrow">→</span>
                </a>
                <a href="/contact" className="btn btn-outline btn-lg">
                  {page.secondaryCta}
                </a>
              </div>
            </div>
            <aside className="industry-panel">
              <span>Why it matters</span>
              <p>{page.pain}</p>
              <div className="industry-proof-list">
                {page.proof.map((item) => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="section industry-workflows">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Customer Journey</div>
              <h2 className="section-h2">
                Turn more customer moments
                <br />
                <span className="grad-text">into return visits</span>
              </h2>
            </div>
            <div className="industry-workflow-grid">
              {page.workflows.map(([title, body]) => (
                <article className="industry-workflow-card" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section industry-operations">
          <div className="container">
            <div className="industry-operations-header">
              <div>
                <div className="section-tag">Operations Console</div>
                <h2 className="section-h2">
                  Run the work behind
                  <br />
                  <span className="grad-text">every customer moment</span>
                </h2>
              </div>
              <p>
                BRC is not only a public page. It gives owners and teams the
                controls, status views, customer context, and reporting needed
                to keep daily work moving.
              </p>
            </div>
            <div className="industry-operations-grid">
              {page.operations.map(([title, body]) => (
                <article className="industry-operation-card" key={title}>
                  <span>{title}</span>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section industry-stack">
          <div className="container industry-stack-inner">
            <div>
              <div className="section-tag">Included Modules</div>
              <h2 className="section-h2">
                Built around how this
                <br />
                <span className="grad-text">business actually runs</span>
              </h2>
            </div>
            <div className="industry-module-list">
              {page.modules.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section industry-objections">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Common Questions</div>
              <h2 className="section-h2">What owners usually ask first</h2>
            </div>
            <div className="industry-objection-grid">
              {page.objections.map(([question, answer]) => (
                <article className="industry-objection-card" key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <CTA trialHref={trialHref} />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// ─── POS MIGRATION LANDING PAGE ──────────────────────────────────────────────

const MIGRATION_STEPS = [
  {
    k: "01",
    title: "Upload your current menu",
    body: "Use photos, PDFs, or menu files. BRC AI drafts items, categories, variants, modifiers, prices, and allergen notes for human review before anything goes live.",
  },
  {
    k: "02",
    title: "Map the devices you already own",
    body: "Run BRC on iOS, Android, web, Windows, Mac, tablets, phones, kitchen screens, customer displays, scanners, and supported payment devices instead of replacing your whole hardware stack.",
  },
  {
    k: "03",
    title: "Rebuild the workflows that matter",
    body: "Set register layouts, table areas, QR codes, KDS routing, receipts, discounts, staff permissions, cash controls, closeout, stock, and finance in one Business OS.",
  },
  {
    k: "04",
    title: "Go live without losing the floor",
    body: "Train staff with the built-in manual, test sample orders, keep manager approvals controlled, and switch the active service screens when the team is ready.",
  },
];

const MIGRATION_PROOFS = [
  ["AI menu OCR", "Photos and PDFs become an editable catalogue draft."],
  ["Parallel run", "Keep your old POS live while the BRC workflow is reviewed and tested."],
  ["No extra screen fees", "Add register, kitchen, floor, manager, and customer display screens without paying per screen."],
  ["Tap to Pay phones", "Compatible mobile phones can become payment terminals for card-present service."],
  ["Every system", "Use BRC on iOS, Android, web, Windows, Mac, tablets, laptops, and phones."],
];

const MIGRATION_REPLACES = [
  "Legacy POS terminals",
  "Per-screen charges",
  "Locked-down hardware",
  "Surprise add-ons",
  "Separate menu builders",
  "Standalone QR table tools",
  "Kitchen ticket workarounds",
  "Inventory spreadsheets",
  "Rota and payroll exports",
  "Disconnected review tools",
  "Manual closeout checks",
];

const MIGRATION_COST_TRAPS = [
  {
    title: "Extra screens should not become extra rent",
    body: "Open the register, KDS, customer display, tables, stock, manager, closeout, and owner screens your team needs without turning every screen into another terminal subscription.",
  },
  {
    title: "Your phone can be the payment terminal",
    body: "Use Tap to Pay on compatible mobile devices for flexible card-present payments, while still supporting dedicated terminals where the venue wants them.",
  },
  {
    title: "No hardware hostage moment",
    body: "BRC is built for iOS, Android, web, Windows, and Mac so operators can keep useful tablets, laptops, phones, displays, scanners, and back-office machines.",
  },
  {
    title: "No hidden operating-system tax",
    body: "The pitch is simple: one Business OS for POS, tables, QR, KDS, catalogue, inventory, staff, finance, reviews, rewards, campaigns, analytics, and included feature upgrades.",
  },
  {
    title: "The product keeps getting better",
    body: "You are not buying a frozen till. As BRC adds more Business OS capability to your plan, the same subscription keeps gaining long-life operational value.",
  },
];

const MIGRATION_PLATFORM_ITEMS = [
  "iOS",
  "Android",
  "Web",
  "Windows",
  "Mac",
  "Tablets",
  "Phones",
  "Laptops",
  "Kitchen displays",
  "Customer displays",
];

const MIGRATION_AI_OPS = [
  {
    title: "Tells you what is wrong",
    body: "AI owner brief and operations cards highlight sales changes, reputation risks, stock pressure, device issues, closeout exceptions, and workflow blockers before they turn into shift problems.",
  },
  {
    title: "Predicts demand and staffing gaps",
    body: "Demand forecasts, prep plans, reorder actions, station workload, and staffing-gap signals help managers decide what to prep, who to schedule, and where the next shortage is likely to hit.",
  },
  {
    title: "Advises on menu and profit",
    body: "BRC connects menu performance with orders, discounts, stock, waste, finance, reviews, and campaigns so the advice is based on your real metrics, not generic restaurant guesses.",
  },
];

const MIGRATION_SETUP_ITEMS = [
  {
    icon: "menu",
    title: "Current menu",
    body: "Photos, PDFs, exported item lists, allergens, modifier groups, prices, and service notes.",
  },
  {
    icon: "devices",
    title: "Device list",
    body: "Registers, tablets, phones, kitchen screens, customer displays, printers, scanners, and payment devices.",
  },
  {
    icon: "layout",
    title: "Service layout",
    body: "Tables, areas, stations, fulfilment routes, pickup points, and customer QR entry points.",
  },
  {
    icon: "team",
    title: "Team controls",
    body: "Staff roles, manager approvals, discounts, cash controls, closeout steps, and training needs.",
  },
];

const MIGRATION_HARDWARE_ITEMS = [
  {
    icon: "counter",
    title: "Counter",
    body: "Register, cash, tender, receipt, Tap to Pay, customer display",
  },
  {
    icon: "kitchen",
    title: "Kitchen",
    body: "KDS stations, routing, recall, ready states",
  },
  {
    icon: "floor",
    title: "Floor",
    body: "Tables, QR orders, bills, splits, service notes",
  },
  {
    icon: "backOffice",
    title: "Back office",
    body: "Web, Windows, Mac, catalog, inventory, rota, payroll, finance",
  },
];

const MIGRATION_FAQS = [
  {
    q: "Can I keep my current hardware?",
    a: "BRC is designed for browser, tablet, mobile, kitchen, customer display, and back-office workflows across iOS, Android, web, Windows, and Mac. Specific printers, scanners, terminals, Tap to Pay, and local-hub device workflows still need compatibility checks before go-live.",
  },
  {
    q: "Do I have to turn off my old POS immediately?",
    a: "No. The practical migration path is to import and review the catalogue, test sample orders, map devices and staff controls, then keep the old POS running until the new service workflow has been checked.",
  },
  {
    q: "How does AI menu OCR work?",
    a: "You upload menu photos, PDFs, or files. BRC AI prepares a catalogue draft with categories, items, variants, modifiers, prices, and allergen notes. A human reviews and approves the draft before anything customer-facing goes live.",
  },
  {
    q: "Do I need to switch payments?",
    a: "BRC can support payment workflows such as Tap to Pay on compatible phones and supported dedicated terminals where configured. Payment setup, verification, tender rules, and receipt behavior should be confirmed before paid orders go live.",
  },
];

function MigrationSetupIcon({ name }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
  };

  const paths = {
    menu: (
      <>
        <path {...common} d="M7 4.8h8.5L19 8.3v10.9H7z" />
        <path {...common} d="M15.5 4.8v3.5H19" />
        <path {...common} d="M10 11h6" />
        <path {...common} d="M10 14h6" />
        <path {...common} d="M10 17h3.4" />
      </>
    ),
    devices: (
      <>
        <path {...common} d="M4.8 6.2h12.4v8.5H4.8z" />
        <path {...common} d="M9.5 18.5h3" />
        <path {...common} d="M11 14.7v3.8" />
        <path {...common} d="M18.8 9.4h3.4v9.1h-3.4z" />
        <path {...common} d="M20.5 16.8h.01" />
      </>
    ),
    layout: (
      <>
        <path {...common} d="M5.2 5.4h6.2v6.2H5.2z" />
        <path {...common} d="M14 5.4h4.8v4.8H14z" />
        <path {...common} d="M5.2 14h4.8v4.8H5.2z" />
        <path {...common} d="M12.6 16.4h6.2" />
        <path {...common} d="M16.4 12.6v6.2" />
      </>
    ),
    team: (
      <>
        <path {...common} d="M9.4 11.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path {...common} d="M4.8 19.2c.5-2.8 2.2-4.2 5.2-4.2s4.7 1.4 5.2 4.2" />
        <path {...common} d="M16.6 11.2a2.4 2.4 0 1 0 0-4.8" />
        <path {...common} d="M16.6 15.2c1.9.2 3.1 1.4 3.6 3.5" />
      </>
    ),
    counter: (
      <>
        <path {...common} d="M5 9.2h14v9.3H5z" />
        <path {...common} d="M7.2 5.5h9.6l1.2 3.7H6z" />
        <path {...common} d="M8.4 12.4h4.6" />
        <path {...common} d="M15.4 12.4h1.2" />
        <path {...common} d="M8.4 15.2h8.2" />
      </>
    ),
    kitchen: (
      <>
        <path {...common} d="M7 4.8h10" />
        <path {...common} d="M8.2 4.8v8.3a3.8 3.8 0 0 0 7.6 0V4.8" />
        <path {...common} d="M10 8.6h4" />
        <path {...common} d="M12 16.8v2.4" />
        <path {...common} d="M8.8 19.2h6.4" />
      </>
    ),
    floor: (
      <>
        <path {...common} d="M6.2 7.2h7.2v5.6H6.2z" />
        <path {...common} d="M15.8 5.4h2.8v2.8h-2.8z" />
        <path {...common} d="M15.8 15.8h2.8v2.8h-2.8z" />
        <path {...common} d="M9.8 12.8v3.8h6" />
        <path {...common} d="M13.4 8.2h2.4" />
      </>
    ),
    backOffice: (
      <>
        <path {...common} d="M4.8 6.4h14.4v9.2H4.8z" />
        <path {...common} d="M9.6 19.2h4.8" />
        <path {...common} d="M12 15.6v3.6" />
        <path {...common} d="M8 9.4h8" />
        <path {...common} d="M8 12.3h5.2" />
      </>
    ),
  };

  return (
    <span className="migration-setup-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths[name] || paths.menu}
      </svg>
    </span>
  );
}

function MigrationMockup() {
  return (
    <div className="migration-console" aria-label="BRC migration preview">
      <div className="migration-console-top">
        <span />
        <strong>Menu import draft</strong>
        <em>Enterprise plan</em>
      </div>
      <div className="migration-upload">
        <div>
          <strong>Uploaded menu.pdf</strong>
          <p>AI extracted 48 items, 9 categories, 17 modifiers</p>
        </div>
        <span>OCR</span>
      </div>
      <div className="migration-console-metrics">
        {[
          ["0", "extra screen fees"],
          ["5", "systems supported"],
          ["48", "items drafted"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="migration-draft-list">
        {[
          ["Lunch mains", "12 items", "Review prices"],
          ["Allergens", "7 notes", "Needs approval"],
          ["KDS routing", "4 stations", "Ready to map"],
        ].map(([title, meta, status]) => (
          <div className="migration-draft-row" key={title}>
            <div>
              <strong>{title}</strong>
              <span>{meta}</span>
            </div>
            <em>{status}</em>
          </div>
        ))}
      </div>
      <div className="migration-device-grid">
        {["Register", "Kitchen", "Customer display", "Manager"].map((item) => (
          <div key={item}>
            <span />
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function PosMigrationPage({ onNavigate, theme, onToggleTheme }) {
  const businessTrialHref = signupUrl({
    plan: "enterprise",
    billing: "monthly",
    source: "pos_migration",
  });

  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={onToggleTheme} onDarkHero />
      <main className="migration-page">
        <section className="migration-hero">
          <div className="migration-hero-media" aria-hidden="true" />
          <div className="container migration-hero-inner">
            <div className="migration-copy">
              <div className="section-tag">Switch From Your Current POS</div>
              <h1 className="migration-title">
                Switch POS without rebuilding your menu or replacing your hardware.
              </h1>
              <p className="migration-subhead">
                Upload your existing menu, let AI OCR prepare the catalogue draft, review every item, then run POS, QR tables, KDS, stock, staff, finance, reviews, payments, and campaigns on the devices you already own.
              </p>
              <div className="hero-btns">
                <a href={businessTrialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                  Start Enterprise Trial <span className="arrow">→</span>
                </a>
                <a href="/contact" className="btn btn-outline btn-lg">
                  Plan My Migration
                </a>
              </div>
              <div className="migration-assurance">
                <span>AI menu setup</span>
                <span>Run both during setup</span>
                <span>No extra screen fees</span>
                <span>Tap to Pay on phones</span>
              </div>
            </div>
            <MigrationMockup />
          </div>
        </section>

        <section className="migration-proof-strip">
          <div className="container migration-proof-grid">
            {MIGRATION_PROOFS.map(([title, body]) => (
              <article key={title}>
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section migration-section">
          <div className="container migration-split">
            <div>
              <div className="section-tag">Why Switch Now</div>
              <h2 className="section-h2">
                Your POS should be the start of the operating system, not another isolated bill.
              </h2>
              <p className="migration-lede">
                BRC is built for operators who are tired of terminal-first POS stacks that turn every screen, add-on, integration, and back-office workflow into another conversation about cost. Start with the migration pieces that save the most time and money: AI catalogue setup, hardware reuse, no extra screen fees, and mobile Tap to Pay.
              </p>
              <a href={businessTrialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                Import My Menu With AI <span className="arrow">→</span>
              </a>
            </div>
            <div className="migration-replace-panel">
              <span>Replace or reduce</span>
              <div>
                {MIGRATION_REPLACES.map((item) => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section migration-cost-section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Beat The POS Lock-In</div>
              <h2 className="section-h2">
                Stop letting old POS economics
                <br />
                decide how your floor runs.
              </h2>
              <p className="section-p">
                If your current setup makes you hesitate before adding a kitchen screen, customer display, manager laptop, handheld, back-office device, or another included workflow, it is not built like a Business OS.
              </p>
            </div>
            <div className="migration-cost-grid">
              {MIGRATION_COST_TRAPS.map((item) => (
                <article className="migration-cost-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
            <div className="migration-platform-panel">
              <div>
                <span>Runs where your team already works</span>
                <h3>iOS, Android, web, Windows, Mac, phones, tablets, laptops, and service displays.</h3>
              </div>
              <div className="migration-platform-list">
                {MIGRATION_PLATFORM_ITEMS.map((item) => (
                  <strong key={item}>{item}</strong>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section migration-ops-ai-section">
          <div className="container migration-ops-ai-inner">
            <div className="migration-ops-ai-copy">
              <div className="section-tag">Embedded AI Operations</div>
              <h2 className="section-h2">
                BRC AI sits inside the business, not beside it as a generic chat box.
              </h2>
              <p className="migration-lede">
                In BRC AI, BRC turns trading, stock, rota, staff, devices, finance, reviews, campaigns, and menu signals into next actions. It can show what is wrong, forecast demand, warn about staffing pressure, suggest prep, and advise on menu profitability using your actual business data.
              </p>
              <a href={businessTrialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                Get The AI Business OS <span className="arrow">→</span>
              </a>
            </div>
            <div className="migration-ops-ai-grid">
              {MIGRATION_AI_OPS.map((item) => (
                <article className="migration-ops-ai-card" key={item.title}>
                  <span />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section migration-ai-section">
          <div className="container migration-ai-grid">
            <div className="migration-ai-card">
              <span>AI OCR setup</span>
              <h2>Menu photos and PDFs become a reviewed BRC catalogue draft.</h2>
              <p>
                BRC AI prepares categories, items, prices, descriptions, modifiers, variants, and allergen notes. Your manager reviews the draft, selects what to apply, then tests it in Register, QR ordering, KDS routing, inventory, and receipts.
              </p>
            </div>
            <div className="migration-checklist">
              {[
                "Import menus, retail catalogues, service lists, or PDFs.",
                "Match existing items before creating duplicates.",
                "Approve selected items only when prices and allergens are right.",
                "Route items to kitchen stations and availability channels.",
                "Keep the old POS running until the new workflow is checked.",
              ].map((item) => (
                <div key={item}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section migration-setup-section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">What We Need</div>
              <h2 className="section-h2">A cleaner switch starts with the right inputs.</h2>
              <p className="section-p">
                Bring the pieces that usually slow POS migrations down. BRC turns them into a reviewed setup plan before the floor depends on it.
              </p>
            </div>
            <div className="migration-setup-grid">
              {MIGRATION_SETUP_ITEMS.map((item) => (
                <article className="migration-setup-card" key={item.title}>
                  <MigrationSetupIcon name={item.icon} />
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section migration-steps-section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Migration Path</div>
              <h2 className="section-h2">A practical switch plan for busy operators</h2>
              <p className="section-p">
                Start with the work that creates the most switching friction, then turn on live service workflows when the team has checked them.
              </p>
            </div>
            <div className="migration-step-grid">
              {MIGRATION_STEPS.map((step) => (
                <article className="migration-step-card" key={step.title}>
                  <span>{step.k}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section migration-hardware-section">
          <div className="container migration-hardware-inner">
            <div>
              <div className="section-tag">Hardware Freedom</div>
              <h2 className="section-h2">
                Keep useful devices. Add screens where the team needs them.
              </h2>
              <p className="migration-lede">
                BRC is designed for browser, tablet, mobile, kitchen, customer display, and manager workflows. Use supported printers, scanners, terminals, Tap to Pay on compatible phones, and local-hub device discovery where configured, without treating every new screen as a whole new POS contract.
              </p>
            </div>
            <div className="migration-hardware-grid">
              {MIGRATION_HARDWARE_ITEMS.map((item) => (
                <article key={item.title}>
                  <MigrationSetupIcon name={item.icon} />
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section migration-faq-section">
          <div className="container migration-faq-inner">
            <div className="migration-faq-copy">
              <div className="section-tag">Switching POS FAQ</div>
              <h2 className="section-h2">Answers before you move service screens.</h2>
            </div>
            <div className="migration-faq-list">
              {MIGRATION_FAQS.map((item) => (
                <article className="migration-faq-card" key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="migration-final-cta">
          <div className="container migration-final-inner">
            <div>
              <span>Ready to switch?</span>
              <h2>Start with your menu. Keep your hardware. Let the same subscription keep improving your operation.</h2>
            </div>
            <div className="hero-btns">
              <a href={businessTrialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                Start Enterprise Trial <span className="arrow">→</span>
              </a>
              <a href="/features/inventory" className="btn btn-outline btn-lg">
                See Inventory & Catalogue
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// ─── FEATURE DETAIL PAGES ────────────────────────────────────────────────────

function FeatureDetailPage({ slug = "ordering", onNavigate, theme, onToggleTheme }) {
  const feature = FEATURES.find((item) => item.slug === slug) || FEATURES[0];
  const detail = FEATURE_DETAIL[feature.slug] || FEATURE_DETAIL.ordering;
  const trialHref = trialSignupUrl();
  const guide = FEATURE_GUIDES[feature.slug] || FEATURE_GUIDES.ordering;
  const surfaces = FEATURE_SURFACES[feature.slug] || FEATURE_SURFACES.ordering;
  const appLocations = FEATURE_APP_LOCATIONS[feature.slug] || FEATURE_APP_LOCATIONS.ordering;
  const featureScreenshots = FEATURE_SCREENSHOTS[feature.slug] || [];
  const related = FEATURES.filter((item) => item.slug !== feature.slug).slice(0, 3);

  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="feature-page">
        <section className="feature-hero">
          <div className="hero-bg">
            <div className="glow glow-1" />
            <div className="glow glow-2" />
            <div className="grid-overlay" />
          </div>
          <div className="container feature-hero-inner">
            <div className="feature-hero-copy">
              <div className="feature-eyebrow-row">
                <a href="/features" className="feature-back">← All features</a>
                <div className="section-tag">{feature.tag}</div>
              </div>
              <h1 className="feature-page-title">
                {detail.headline}
              </h1>
              <p className="feature-page-subhead">{detail.subhead}</p>
              <div className="hero-btns">
                <a href={trialHref} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                  Start Free <span className="arrow">→</span>
                </a>
                <a href={WEB_APP_URL} className="btn btn-outline btn-lg" target="_blank" rel="noopener noreferrer">
                  Open Web App
                </a>
              </div>
            </div>
            <div className="feature-proof-panel">
              <div className="feature-proof-icon" style={{ "--accent": feature.accent }}>
                <FeatureGlyph slug={feature.slug} />
              </div>
              <h2>{feature.title}</h2>
              <p>{feature.outcome}</p>
              <div className="feature-best-for">
                <span>Best for</span>
                <p>{detail.bestFor}</p>
              </div>
              <div className="feature-proof-list">
                {detail.proof.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section feature-detail-section">
          <div className="container feature-detail-grid">
            <div>
              <div className="section-tag">Owner Value</div>
              <h2 className="section-h2">
                What this module is
                <br />
                <span className="grad-text">really doing for the business</span>
              </h2>
              <p className="feature-conversion">{detail.conversion}</p>
            </div>
            <div className="feature-bullet-card">
              {detail.bullets.map((item) => (
                <div key={item} className="feature-bullet">
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ScreenshotGallery
          title={`${feature.title} in BRC`}
          body="These screenshots show the corresponding BRC screens for this feature area, using the same CDN assets prepared for upload."
          screenshots={featureScreenshots}
        />

        {feature.slug === "analytics" ? <Analytics /> : null}
        {feature.slug === "campaigns" ? <Campaigns /> : null}
        {feature.slug === "reputation" ? <Platforms /> : null}

        <section className="section feature-howto-section">
          <div className="container">
            <div className="section-header feature-left-header">
              <div className="section-tag">How To Set It Up</div>
              <h2 className="section-h2">
                The practical setup path
                <br />
                <span className="grad-text">inside BRC</span>
              </h2>
              <p className="section-p">
                This is the operational path an owner or manager follows after
                starting free. The details change by business type, but
                the setup logic stays consistent.
              </p>
            </div>
            <div className="feature-howto-grid">
              {guide.setup.map((item, index) => (
                <article className="feature-howto-card" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section feature-use-section">
          <div className="container feature-use-grid">
            <div>
              <div className="section-tag">Day To Day</div>
              <h2 className="section-h2">
                What the owner and team
                <br />
                <span className="grad-text">actually use</span>
              </h2>
            </div>
            <div className="feature-use-list">
              {guide.dailyUse.map((item) => (
                <div className="feature-use-item" key={item}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
              <div className="feature-plan-note">
                <strong>Subscription logic</strong>
                <p>{guide.planNote}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section feature-surface-section">
          <div className="container">
            <div className="section-header feature-left-header">
              <div className="section-tag">Real Product Detail</div>
              <h2 className="section-h2">
                The screens and workflows
                <br />
                <span className="grad-text">behind the promise</span>
              </h2>
              <p className="section-p">
                These are the actual BRC surfaces this feature relies on across
                the console, customer go app, and owner workflows.
              </p>
            </div>
            <div className="feature-surface-grid">
              {surfaces.map((item, index) => (
                <article className="feature-surface-card" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section feature-flow-section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Inside BRC</div>
              <h2 className="section-h2">
                Where this fits
                <br />
                <span className="grad-text">inside the actual app</span>
              </h2>
              <p className="section-p">
                Use this as the app map. It shows the console tab, settings
                page, or customer surface where this workflow lives.
              </p>
            </div>
            <div className="conversion-flow">
              {appLocations.map((item, index) => (
                <div key={item.area} className="flow-step">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.area}</strong>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section feature-related-section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Next Features</div>
              <h2 className="section-h2">Explore the connected workflows</h2>
            </div>
            <div className="features-grid">
              {related.map((item) => (
                <a key={item.slug} href={`/features/${item.slug}`} className="feature-card compact">
                  <div className="feature-icon-wrap" style={{ "--accent": item.accent }}>
                    <FeatureGlyph slug={item.slug} />
                  </div>
                  <div className="feature-tag">{item.tag}</div>
                  <h3 className="feature-title">{item.title}</h3>
                  <p className="feature-body">{item.body}</p>
                  <div className="feature-link">Read more <span>→</span></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function ContactPage({ onNavigate, theme, onToggleTheme }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    category: "general",
    subject: "",
    message: "",
    companyWebsite: "",
  });
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const resetTurnstile = () => {
    setTurnstileToken("");
    if (window.turnstile && turnstileWidgetId.current !== null) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  };

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      setStatus({
        type: "error",
        message: "Contact security check is not configured.",
      });
      return;
    }

    const renderTurnstile = () => {
      if (!turnstileRef.current || !window.turnstile || turnstileWidgetId.current !== null) return;
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
        theme: theme === "dark" ? "dark" : "light",
      });
    };

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const existingScript = document.querySelector("script[data-turnstile-script]");
    if (existingScript) {
      existingScript.addEventListener("load", renderTurnstile, { once: true });
      return () => existingScript.removeEventListener("load", renderTurnstile);
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.addEventListener("load", renderTurnstile, { once: true });
    document.head.appendChild(script);

    return () => script.removeEventListener("load", renderTurnstile);
  }, [theme]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitContact = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/contact/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startedAt,
          turnstileToken,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not send your message.");
      trackMarketingEvent("contact_submit", {
        target: "contact_form",
        category: form.category,
        businessNameProvided: Boolean(form.businessName.trim()),
      });
      setStatus({
        type: "success",
        message: `Thanks. Your message is in our support queue as ticket ${payload.ticket?.id || ""}. We will reply by email.`,
      });
      setForm({
        name: "",
        email: "",
        businessName: "",
        category: "general",
        subject: "",
        message: "",
        companyWebsite: "",
      });
      resetTurnstile();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Could not send your message. Please try again.",
      });
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="hero-bg">
            <div className="glow glow-1" />
            <div className="glow glow-2" />
          </div>
          <div className="container contact-grid">
            <div className="contact-copy">
              <div className="section-tag">Contact BRC</div>
              <h1 className="contact-title">
                Talk to the team
                <br />
                <span className="grad-text">behind the app.</span>
              </h1>
              <p>
                Ask about plans, onboarding, reputation recovery, billing,
                partnerships, or technical support. Messages from this page go
                into the same support queue our platform team uses for console
                support.
              </p>
              <div className="contact-promises">
                <span>Admin support inbox</span>
                <span>Email replies threaded</span>
                <span>Bot checks enabled</span>
              </div>
            </div>

            <form className="contact-form" onSubmit={submitContact}>
              <div className="contact-form-row">
                <label>
                  Name
                  <input
                    required
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your name"
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label>
                Business name
                <input
                  value={form.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <div className="contact-form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="verification">Verification</option>
                  </select>
                </label>
                <label>
                  Subject
                  <input
                    required
                    value={form.subject}
                    onChange={(event) => updateField("subject", event.target.value)}
                    placeholder="How can we help?"
                  />
                </label>
              </div>
              <label>
                Message
                <textarea
                  required
                  rows={7}
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Tell us what you need help with."
                />
              </label>
              <label className="contact-honeypot" aria-hidden="true">
                Company website
                <input
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.companyWebsite}
                  onChange={(event) => updateField("companyWebsite", event.target.value)}
                />
              </label>
              <div className="contact-captcha">
                <div ref={turnstileRef} className="turnstile-widget" />
              </div>
              {status.message ? (
                <div className={`contact-status contact-status-${status.type}`}>
                  {status.message}
                </div>
              ) : null}
              <button className="btn btn-primary btn-block" type="submit" disabled={submitting || !turnstileToken}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

// ─── TERMS OF SERVICE ─────────────────────────────────────────────────────────

function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using BRC, you
              accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              BRC provides Business Reputation &amp; Customer Operations services including:
            </p>
            <ul>
              <li>Private feedback collection and analysis via QR codes</li>
              <li>
                Review monitoring and aggregation across Google, Yelp, and
                TripAdvisor
              </li>
              <li>
                AI-powered sentiment analysis and review authenticity detection
              </li>
              <li>Competitor intelligence and benchmarking</li>
              <li>Automated email campaigns, win-back messaging, and review SMS prompts</li>
              <li>Staff performance tracking and analytics</li>
              <li>Menu item performance insights</li>
              <li>Multi-location business management</li>
              <li>Team collaboration tools</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Use License</h2>
            <p>
              Permission is granted to temporarily use BRC for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul>
              <li>modify or copy the materials</li>
              <li>
                use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                attempt to decompile or reverse engineer any software contained
                on BRC
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials
              </li>
              <li>use BRC to collect or process illegal content</li>
              <li>violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. User Accounts and Data</h2>
            <p>
              To use certain features of BRC, you must register for an account.
              You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>
                Be responsible for all data collected through your use of BRC
              </li>
              <li>Ensure compliance with applicable data protection laws</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Collection and Processing</h2>
            <p>BRC collects and processes various types of data:</p>
            <ul>
              <li>
                <strong>Customer Data:</strong> Feedback, contact information,
                and transaction details provided through QR code interactions
              </li>
              <li>
                <strong>Review Data:</strong> Public reviews and ratings from
                integrated platforms (Google, Yelp, TripAdvisor)
              </li>
              <li>
                <strong>Business Data:</strong> Business information, staff
                details, and operational metrics
              </li>
              <li>
                <strong>Analytics Data:</strong> Usage patterns, performance
                metrics, and insights generated by AI analysis
              </li>
            </ul>
            <p>
              You are responsible for ensuring you have legal rights to collect
              and process all data within BRC.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Third-Party Integrations</h2>
            <p>BRC integrates with third-party services including:</p>
            <ul>
              <li>
                Google Maps API for business verification and location data
              </li>
              <li>
                Review platforms (Yelp, TripAdvisor) for review
                aggregation
              </li>
              <li>External providers for SMS messaging services</li>
              <li>External providers for AI-powered analysis</li>
              <li>External providers for subscription management</li>
            </ul>
            <p>
              Your use of these integrations is subject to the respective
              third-party terms of service.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. SMS and Communication Services</h2>
            <p>BRC provides SMS messaging capabilities for:</p>
            <ul>
              <li>Automated discount delivery to customers</li>
              <li>Review request follow-ups</li>
              <li>Review and feedback prompts</li>
              <li>Customer communication</li>
            </ul>
            <p>
              You agree to use SMS services in compliance with applicable
              telecommunications laws, including TCPA in the United States and
              similar regulations elsewhere.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. AI and Automated Analysis</h2>
            <p>BRC uses artificial intelligence for:</p>
            <ul>
              <li>Review sentiment analysis</li>
              <li>Fake review detection</li>
              <li>Automated reply suggestions</li>
              <li>Performance insights and recommendations</li>
            </ul>
            <p>
              AI-generated content and analysis are provided as suggestions and
              should be reviewed by humans before use. BRC is not liable for
              decisions made based on AI recommendations.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Payment Terms</h2>
            <p>Some services require payment through subscription plans:</p>
            <ul>
              <li>
                <strong>Growth Plan:</strong> Advanced features for growing
                single-location businesses
              </li>
              <li>
                <strong>Pro Plan:</strong> Advanced features for small
                multi-location businesses
              </li>
              <li>
                <strong>Business Plan:</strong> Higher allowances and reporting
                for multi-location brands
              </li>
            </ul>
            <p>By subscribing, you agree to:</p>
            <ul>
              <li>Pay all applicable fees</li>
              <li>Automatic billing for recurring subscriptions</li>
              <li>30-day notice for price changes</li>
              <li>No refunds for partial months except as required by law</li>
              <li>Additional charges for review SMS credits and overages</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. Data Privacy and Compliance</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy,
              which also governs your use of BRC, to understand our practices.
              You agree to:
            </p>
            <ul>
              <li>
                Comply with all applicable data protection laws (GDPR, CCPA,
                etc.)
              </li>
              <li>Obtain necessary consents for data collection</li>
              <li>Honor data subject rights (access, deletion, portability)</li>
              <li>Implement appropriate security measures</li>
              <li>Report data breaches in accordance with applicable laws</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>11. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality
              are and will remain the exclusive property of BRC and its
              licensors. The service is protected by copyright, trademark, and
              other laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if you breach the Terms. Upon termination, your
              right to use the service will cease immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Disclaimer</h2>
            <p>
              The information on BRC is provided on an 'as is' basis. BRC
              disclaims all warranties, express or implied, including but not
              limited to warranties of merchantability, fitness for a particular
              purpose and noninfringement. BRC does not warrant that the service
              will be uninterrupted or error-free.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Limitations</h2>
            <p>
              In no event shall BRC or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or
              profit, or due to business interruption) arising out of the use or
              inability to use BRC, even if BRC has been advised of the
              possibility of such damages.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless BRC and its officers,
              directors, employees, and agents from and against any claims,
              actions, or demands arising from your use of BRC or violation of
              these terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of [Your
              State/Country], without regard to conflict of law provisions.
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will try to
              provide at least 30 days notice prior to any new terms taking
              effect.
            </p>
          </section>

          <section className="legal-section">
            <h2>18. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at legal@brcapp.io
            </p>
          </section>
        </div>

        <div className="legal-back">
          <a
            href="#"
            className="btn btn-outline"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy describes how BRC (Business Reputation Center)
              collects, uses, and protects your information when you use our
              mobile application, web platform, and related services. We are
              committed to protecting your privacy and complying with applicable
              data protection laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>We collect information in the following categories:</p>

            <h3>2.1 Information You Provide Directly</h3>
            <ul>
              <li>
                <strong>Account Information:</strong> Business name, email
                address, phone number, and password when you create an account
              </li>
              <li>
                <strong>Business Data:</strong> Business details, location
                information, staff information, and operational data
              </li>
              <li>
                <strong>Customer Data:</strong> Feedback, contact information,
                and transaction details collected through QR code interactions
              </li>
              <li>
                <strong>Communication Data:</strong> Messages, support requests,
                and feedback submitted through our platform
              </li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li>
                <strong>Usage Data:</strong> App usage patterns, feature
                interactions, and performance metrics
              </li>
              <li>
                <strong>Device Information:</strong> Device type, operating
                system, app version, and unique device identifiers
              </li>
              <li>
                <strong>Location Data:</strong> IP addresses and general
                location information for business verification
              </li>
              <li>
                <strong>Review Data:</strong> Public reviews and ratings from
                integrated platforms (Google, Yelp, TripAdvisor)
              </li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <ul>
              <li>
                <strong>Review Platforms:</strong> Public review data, ratings,
                and customer feedback from connected platforms
              </li>
              <li>
                <strong>Payment Processors:</strong> Billing information and
                transaction data from payment and subscription providers
              </li>
              <li>
                <strong>Analytics Services:</strong> Usage analytics and
                performance data
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information for the following purposes:</p>

            <h3>3.1 Service Provision</h3>
            <ul>
              <li>Provide, maintain, and improve BRC services</li>
              <li>Process and analyze customer feedback</li>
              <li>Generate AI-powered insights and recommendations</li>
              <li>Send review SMS prompts and operational notifications</li>
              <li>Monitor review platforms and track reputation metrics</li>
            </ul>

            <h3>3.2 Communication</h3>
            <ul>
              <li>Send service-related communications and updates</li>
              <li>
                Deliver SMS messages to customers (discount codes, review
                requests, etc.)
              </li>
              <li>Provide customer support and technical assistance</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>

            <h3>3.3 Analytics and Improvement</h3>
            <ul>
              <li>Analyze usage patterns and service performance</li>
              <li>Detect fake reviews and suspicious activity</li>
              <li>Generate business intelligence and competitor analysis</li>
              <li>Improve our AI models and service features</li>
            </ul>

            <h3>3.4 Legal Compliance</h3>
            <ul>
              <li>Comply with applicable laws and regulations</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect against fraud and abuse</li>
              <li>Respond to legal requests and investigations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Information Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share information
              in the following circumstances:
            </p>

            <h3>4.1 Service Providers</h3>
            <ul>
              <li>
                <strong>Infrastructure providers:</strong> Database hosting and authentication
                services
              </li>
              <li>
                <strong>Communication providers:</strong> SMS messaging and communication
                services
              </li>
              <li>
                <strong>AI providers:</strong> AI-powered analysis and processing
              </li>
              <li>
                <strong>Payment providers:</strong> Subscription and payment processing
              </li>
              <li>
                <strong>Google Maps API:</strong> Business verification and
                location services
              </li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <ul>
              <li>To comply with legal obligations and court orders</li>
              <li>To protect our rights, property, and safety</li>
              <li>To prevent fraud, abuse, or illegal activity</li>
              <li>In connection with legal proceedings or investigations</li>
            </ul>

            <h3>4.3 Business Transfers</h3>
            <ul>
              <li>
                In connection with a merger, acquisition, or sale of assets
              </li>
              <li>With your explicit consent for specific purposes</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We implement comprehensive security measures to protect your
              information:
            </p>
            <ul>
              <li>
                <strong>Encryption:</strong> Data encrypted in transit and at
                rest using industry-standard protocols
              </li>
              <li>
                <strong>Access Controls:</strong> Strict access controls and
                authentication requirements
              </li>
              <li>
                <strong>Regular Audits:</strong> Security audits and
                vulnerability assessments
              </li>
              <li>
                <strong>Incident Response:</strong> Established procedures for
                responding to security incidents
              </li>
              <li>
                <strong>Employee Training:</strong> Regular security awareness
                training for our team
              </li>
            </ul>
            <p>
              While we implement strong security measures, no system is
              completely secure. We cannot guarantee absolute security of your
              data.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Data Retention</h2>
            <p>We retain your information for the following periods:</p>
            <ul>
              <li>
                <strong>Account Data:</strong> Retained while your account is
                active and for a reasonable period after closure
              </li>
              <li>
                <strong>Customer Feedback:</strong> Retained for analytics
                purposes and as required for service improvement
              </li>
              <li>
                <strong>Review Data:</strong> Cached for performance but
                refreshed regularly from source platforms
              </li>
              <li>
                <strong>Usage Analytics:</strong> Aggregated and anonymized for
                service improvement
              </li>
              <li>
                <strong>Legal Compliance:</strong> Retained as required by
                applicable laws and regulations
              </li>
            </ul>
            <p>
              You may request deletion of your personal information subject to
              legal and legitimate business requirements.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have the following rights:
            </p>

            <h3>7.1 Access and Portability</h3>
            <ul>
              <li>Request access to your personal information</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>Review how your data is processed</li>
            </ul>

            <h3>7.2 Correction and Updates</h3>
            <ul>
              <li>Correct inaccurate or incomplete information</li>
              <li>Update your account and business information</li>
              <li>Modify your communication preferences</li>
            </ul>

            <h3>7.3 Deletion and Restriction</h3>
            <ul>
              <li>Request deletion of your personal information</li>
              <li>Restrict processing of your data</li>
              <li>Object to certain processing activities</li>
            </ul>

            <h3>7.4 Consent Management</h3>
            <ul>
              <li>Withdraw consent for marketing communications</li>
              <li>Opt-out of non-essential data processing</li>
              <li>Control SMS messaging preferences</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Authenticate users and maintain sessions</li>
              <li>Remember user preferences and settings</li>
              <li>Analyze usage patterns and improve performance</li>
              <li>Provide personalized features and recommendations</li>
            </ul>
            <p>
              You can control cookie preferences through your browser settings
              or device privacy controls.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Third-Party Integrations</h2>
            <p>
              BRC integrates with various third-party services. Your use of
              these integrations is subject to their respective privacy
              policies:
            </p>
            <ul>
              <li>
                <strong>Review Platforms:</strong> Google, Yelp, and TripAdvisor
                collect and process review data according to
                their policies
              </li>
              <li>
                <strong>Payment services:</strong> External providers process payment
                information according to their privacy policy
              </li>
              <li>
                <strong>Communication services:</strong> External providers handle SMS
                delivery according to their privacy policy
              </li>
              <li>
                <strong>AI services:</strong> External providers process data for analysis
                according to their privacy policy
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              for international transfers, including:
            </p>
            <ul>
              <li>
                Standard contractual clauses approved by regulatory authorities
              </li>
              <li>
                Adequacy decisions by relevant data protection authorities
              </li>
              <li>Binding corporate rules for intra-group transfers</li>
              <li>Certification schemes and codes of conduct</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>11. Children's Privacy</h2>
            <p>
              BRC is not intended for children under 13 years of age. We do not
              knowingly collect personal information from children under 13. If
              we become aware that we have collected personal information from a
              child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. SMS and Communication Compliance</h2>
            <p>
              Our SMS communications comply with applicable telecommunications
              regulations:
            </p>
            <ul>
              <li>
                <strong>TCPA (US):</strong> We obtain appropriate consent and
                provide opt-out mechanisms
              </li>
              <li>
                <strong>CTIA Guidelines:</strong> We follow industry best
                practices for SMS messaging
              </li>
              <li>
                <strong>GDPR:</strong> We ensure lawful basis for electronic
                communications
              </li>
              <li>
                <strong>CAN-SPAM:</strong> We provide clear identification and
                opt-out options
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>13. AI Data Processing</h2>
            <p>When using AI services for analysis:</p>
            <ul>
              <li>
                Data is processed securely and temporarily for analysis purposes
              </li>
              <li>
                AI-generated insights are reviewed and validated by human
                operators
              </li>
              <li>
                We do not use personal data to train AI models without explicit
                consent
              </li>
              <li>You can opt-out of AI processing for your specific data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>14. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We will:
            </p>
            <ul>
              <li>Post the updated policy on our website</li>
              <li>Update the "Last updated" date</li>
              <li>
                Provide notice of material changes via email or in-app
                notifications
              </li>
              <li>Give you time to review changes before they take effect</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>15. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data
              practices:
            </p>
            <ul>
              <li>
                <strong>Email:</strong> privacy@brcapp.io
              </li>
              <li>
                <strong>Address:</strong> [Your Registered Business Address]
              </li>
              <li>
                <strong>Data Protection Officer:</strong> dpo@brcapp.io
              </li>
            </ul>
            <p>
              We will respond to your inquiries within 30 days or as required by
              applicable law.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Complaints and Dispute Resolution</h2>
            <p>If you have concerns about our privacy practices:</p>
            <ul>
              <li>Contact us first to resolve the issue</li>
              <li>
                You have the right to lodge a complaint with your local data
                protection authority
              </li>
              <li>
                We will cooperate with regulatory investigations and provide
                necessary information
              </li>
            </ul>
          </section>
        </div>

        <div className="legal-back">
          <a
            href="#"
            className="btn btn-outline"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── ENHANCED LEGAL PAGES ────────────────────────────────────────────────────

function LegalBackLink() {
  return (
    <div className="legal-back">
      <a
        href="/"
        className="btn btn-outline"
        onClick={(e) => {
          e.preventDefault();
          window.history.back();
        }}
      >
        &larr; Back to Home
      </a>
    </div>
  );
}

function LegalCloseButton() {
  return (
    <a href="/" className="legal-close-button" aria-label="Close legal page">
      x
    </a>
  );
}

function EnhancedTermsOfService() {
  return (
    <div className="legal-page">
      <LegalCloseButton />
      <div className="container">
        <div className="legal-header">
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">Last updated: {LEGAL_LAST_UPDATED}</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement and parties</h2>
            <p>
              These Terms of Service govern access to BRC, including brcapp.io,
              the BRC console, go.brcapp.io customer pages, mobile apps, APIs,
              support channels, and related services (the "Services"). "BRC",
              "we", "us", and "our" mean BRC Labs LTD. "Customer", "you", and
              "your" mean the business, organisation, or person using the
              Services.
            </p>
            <p>
              By creating an account, starting a trial, paying for a plan,
              using the Services, or authorising someone to use the Services on
              your behalf, you agree to these Terms and our Privacy Policy. If
              you use the Services for a company, you confirm that you have
              authority to bind that company.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. What BRC provides</h2>
            <p>
              BRC is business reputation and customer operations software for
              local teams. Depending on your plan and enabled modules, the
              Services may include:
            </p>
            <ul>
              <li>ordering, table ordering, pickup, delivery, and payment workflows;</li>
              <li>booking, calendar, deposit, reminder, and customer lookup workflows;</li>
              <li>feedback collection, customer inboxes, support, and follow-up tools;</li>
              <li>review monitoring, review request flows, reply drafting, and reputation reporting;</li>
              <li>tools to identify suspicious, fake, or policy-breaching reviews and prepare dispute materials;</li>
              <li>email campaigns, rewards, win-back messages, review SMS prompts, and owner digests;</li>
              <li>analytics, staff, menu, location, competitor, and performance insights; and</li>
              <li>admin, billing, plan-gating, audit, and support tools.</li>
            </ul>
            <p>
              BRC is a technology provider. We do not operate your business,
              make your products, fulfil your orders, provide your services,
              employ your staff, or control third-party review platforms.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Your account and users</h2>
            <p>
              You must provide accurate account, business, billing, and contact
              information and keep it up to date. You are responsible for all
              activity under your account, including actions by owners,
              managers, staff, contractors, and integrations you authorise.
            </p>
            <ul>
              <li>Keep credentials secure and use strong access controls.</li>
              <li>Assign user roles only to people who need that access.</li>
              <li>Promptly remove access for staff who leave or change roles.</li>
              <li>Notify us immediately if you suspect unauthorised access.</li>
              <li>Do not share, sell, lease, or sublicense your account.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Your responsibilities</h2>
            <p>
              You are responsible for your business operations and lawful use of
              the Services. This includes:
            </p>
            <ul>
              <li>all products, menus, prices, taxes, service descriptions, availability, staff assignments, policies, and fulfilment promises you publish;</li>
              <li>all customer consents, privacy notices, refund terms, delivery terms, booking terms, and consumer disclosures you are required to provide;</li>
              <li>all customer data, order data, booking data, feedback data, review data, and campaign data you enter, upload, import, or collect through BRC;</li>
              <li>compliance with data protection, consumer protection, marketing, telecoms, accessibility, employment, tax, food, alcohol, health, licensing, and sector-specific laws that apply to your business; and</li>
              <li>reviewing, approving, and supervising any automated, suggested, or AI-assisted output before you send, publish, dispute, or rely on it.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Customer data and data protection</h2>
            <p>
              As between you and BRC, you retain ownership of the business and
              customer data you submit to the Services. You grant BRC the rights
              needed to host, process, transmit, analyse, secure, and display
              that data so we can provide, protect, support, and improve the
              Services.
            </p>
            <p>
              For customer data we process on your behalf through ordering,
              bookings, feedback, CRM, campaigns, and support workflows, you are
              usually the controller or business, and BRC is usually your
              processor or service provider. For account, billing, website,
              contact, security, product analytics, and legal compliance data,
              BRC is usually an independent controller.
            </p>
            <ul>
              <li>You must have a lawful basis to collect and use personal data in BRC.</li>
              <li>You must honour access, correction, deletion, objection, unsubscribe, and other individual rights that apply to your customers.</li>
              <li>You must not upload sensitive data unless it is necessary, lawful, and supported by appropriate safeguards.</li>
              <li>You must not use BRC to build unlawful marketing lists, scrape private data, or contact people without required permission.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Ordering, bookings, payments, and fulfilment</h2>
            <p>
              BRC helps you present ordering and booking flows, collect customer
              details, route requests, connect payments, and manage status
              updates. Unless we expressly state otherwise in writing, you are
              the seller, service provider, merchant, and business of record for
              your customers.
            </p>
            <ul>
              <li>You are responsible for accepting, rejecting, preparing, delivering, refunding, and supporting orders and bookings.</li>
              <li>You must keep prices, fees, deposits, availability, delivery areas, opening hours, allergens, restrictions, and terms accurate.</li>
              <li>Payments may be handled through external payment, subscription, banking, card network, marketplace, or checkout providers, and their terms also apply.</li>
              <li>Delivery quotes, driver details, tracking, or third-party fulfilment integrations are operational tools, not guarantees.</li>
              <li>BRC may show payment, payout, refund, and fee information based on provider data, but payment providers and banks control settlement timing.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Messaging, campaigns, and consent</h2>
            <p>
              BRC can send or help you send service messages, receipts,
              reminders, feedback requests, review requests, reward messages,
              review SMS prompts, email, and campaign messages. You are responsible for making
              sure each message is lawful, accurate, non-deceptive, and sent
              with any consent or opt-out mechanism required by law.
            </p>
            <ul>
              <li>Do not send spam, harassment, deceptive offers, unlawful review incentives, or messages to people who have opted out.</li>
              <li>Comply with TCPA, CAN-SPAM, CTIA guidance, UK PECR, GDPR, ePrivacy rules, and equivalent laws where they apply.</li>
              <li>Use accurate sender names, business identity, offer terms, expiry dates, and unsubscribe instructions.</li>
              <li>BRC may suspend messaging if we see abuse, excessive complaints, provider blocks, unlawful content, or platform risk.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Reviews, reputation recovery, and public platforms</h2>
            <p>
              BRC helps you monitor reviews, collect private feedback, encourage
              legitimate positive reviews, respond to customer concerns, recover
              negative experiences, and prepare dispute evidence for reviews
              that may be fake, suspicious, defamatory, abusive, irrelevant,
              conflicted, or otherwise against platform rules.
            </p>
            <ul>
              <li>BRC does not guarantee removal, suppression, ranking changes, rating changes, review publication, or platform action.</li>
              <li>Google, Yelp, Tripadvisor, Meta, Apple, and other platforms control their own listings, reviews, APIs, policies, rankings, and moderation decisions.</li>
              <li>You must not buy reviews, gate reviews unlawfully, pressure customers, post fake reviews, review competitors dishonestly, or offer prohibited incentives.</li>
              <li>AI, authenticity signals, dispute templates, and reply drafts are decision-support tools and must be reviewed by a human.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. AI, automation, and analytics</h2>
            <p>
              BRC may use automated systems and AI providers to classify
              feedback, summarise reviews, draft replies, detect themes,
              identify suspicious review patterns, suggest actions, estimate
              performance, or prioritise operational work. These outputs may be
              incomplete, inaccurate, biased, out of date, or unsuitable for
              your specific situation.
            </p>
            <ul>
              <li>You are responsible for reviewing AI-assisted content before sending or publishing it.</li>
              <li>Do not use AI output as legal, medical, financial, safety, HR, or other professional advice.</li>
              <li>Do not submit data to BRC that you are not permitted to process with automated tools or subprocessors.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. Plans, trials, billing, and taxes</h2>
            <p>
              Paid features require an active plan, trial, add-on, or usage
              allowance. Prices, plan limits, modules, overages, review SMS credits,
              storage limits, and included features may vary by plan, region,
              sales channel, promotion, or written agreement.
            </p>
            <ul>
              <li>Subscriptions renew automatically for the selected billing period unless cancelled before the renewal date through the BRC billing page, an external billing portal, marketplace subscription settings, or another channel we make available.</li>
              <li>Cancellation stops future renewals; it does not create a refund or credit for the current billing period unless required by law or expressly agreed in writing.</li>
              <li>You authorise BRC and its external payment, subscription, banking, card network, and marketplace providers to charge fees, taxes, overages, add-ons, review SMS credits, renewal amounts, and failed-payment retries.</li>
              <li>Trials may expire, convert to paid subscriptions, be limited, or be withdrawn if abused. You are responsible for cancelling before a trial converts if you do not want paid access.</li>
              <li>Fees, setup charges, review SMS credits, add-ons, overages, and partial billing periods are non-refundable and non-transferable except where required by law or expressly stated in your plan, order form, or written agreement.</li>
              <li>Downgrades, cancelled modules, unused credits, unused capacity, unused time, or reduced usage do not entitle you to a refund, cash credit, or carried-forward allowance unless we expressly say otherwise.</li>
              <li>If payment fails, is reversed, charged back, disputed, or becomes overdue, we may retry payment, suspend paid features, restrict messaging, pause public checkout or booking tools, downgrade access, recover collection costs, or terminate the account.</li>
              <li>We may change prices or plan packaging with reasonable notice for paid renewals. Continued use after the effective date means you accept the new pricing.</li>
              <li>You are responsible for taxes, chargebacks, payment disputes, accurate billing details, and any fees charged by banks, marketplaces, payment processors, subscription providers, or card networks.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>11. Third-party services</h2>
            <p>
              The Services connect to or rely on external providers for
              hosting, databases, authentication, payments, subscriptions,
              messaging, email delivery, AI processing, error monitoring,
              security checks, maps, business listings, review platforms,
              analytics, app marketplaces, infrastructure, and other
              integrations. Third-party terms, privacy notices, rate limits,
              outages, review policies, data rules, and account decisions may
              apply.
            </p>
            <ul>
              <li>We are not responsible for third-party services we do not control.</li>
              <li>You must keep connected accounts authorised and compliant.</li>
              <li>Features may change or stop working if a third party changes its service, terms, API, pricing, permissions, or availability.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>12. Acceptable use</h2>
            <p>You must not misuse the Services. Prohibited activity includes:</p>
            <ul>
              <li>breaking the law or infringing others' rights;</li>
              <li>uploading malware, attempting unauthorised access, probing security, bypassing limits, or disrupting the Services;</li>
              <li>scraping, crawling, copying, reverse engineering, or benchmarking the Services except where law permits and cannot be waived;</li>
              <li>sending spam, misleading campaigns, unlawful incentives, abusive messages, or prohibited review requests;</li>
              <li>collecting, storing, or sharing personal data without required permission;</li>
              <li>misrepresenting your identity, business, reviews, products, services, or customer communications; or</li>
              <li>using the Services to compete with BRC, resell the Services, or provide a substantially similar platform without written permission.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>13. Security, uptime, and support</h2>
            <p>
              We use reasonable technical and organisational measures to protect
              the Services and we strive to maintain 99.9% service uptime.
              This is an operational target, not a warranty, service level
              agreement, or promise of compensation unless a separate written
              agreement signed by BRC expressly says otherwise.
            </p>
            <p>
              No online service is perfectly secure or always available.
              Maintenance, outages, provider failures, hosting issues, database
              issues, payment provider downtime, review platform changes,
              telecoms disruption, marketplace disruption, internet disruption,
              malicious activity, data corruption, data loss, force majeure,
              emergencies, or beta features may affect availability, data
              freshness, deliverability, orders, bookings, messages, reports, or
              connected workflows.
            </p>
            <p>
              To the fullest extent permitted by law, BRC will not provide
              refunds, credits, service credits, compensation, damages, or other
              remedies for downtime, loss of data, loss of access, delayed
              messages, missed orders, missed bookings, lost revenue, lost
              profits, reputational impact, or business interruption caused by
              events outside BRC's reasonable control or by third-party
              services, networks, infrastructure, platforms, integrations, or
              providers.
            </p>
            <p>
              Support channels, response times, service levels, and onboarding
              help depend on your plan or written agreement. We may monitor,
              investigate, throttle, or suspend activity to protect the
              Services, customers, third parties, or BRC.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Intellectual property</h2>
            <p>
              BRC, its software, designs, workflows, dashboards, text, graphics,
              logos, know-how, models, documentation, and service content are
              owned by BRC or its licensors. We grant you a limited, revocable,
              non-exclusive, non-transferable right to use the Services during
              your active subscription for your internal business operations.
            </p>
            <p>
              You own your business content. You grant BRC a licence to use
              your names, logos, data, content, feedback, and configuration only
              as needed to provide, secure, support, market, and improve the
              Services, subject to our confidentiality and privacy obligations.
              If you give us feedback, we may use it without restriction or
              compensation.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Confidentiality</h2>
            <p>
              Each party may receive non-public information from the other. The
              receiving party must protect confidential information using
              reasonable care, use it only for the relationship under these
              Terms, and disclose it only to personnel, contractors,
              subprocessors, advisers, or authorities who need it and are bound
              by appropriate obligations. This does not apply to information
              that is public, independently developed, lawfully received from
              another source, or required to be disclosed by law.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Suspension and termination</h2>
            <p>
              You may cancel according to your plan or billing provider rules.
              We may suspend or terminate access if you breach these Terms,
              create security or legal risk, fail to pay, misuse messaging or
              review tools, harm the Services, or if continued service would
              expose BRC, customers, or third parties to risk.
            </p>
            <p>
              After termination, your access ends. We may retain, export, or
              delete data according to the Privacy Policy, product settings,
              legal obligations, backups, security needs, and any data
              processing agreement that applies.
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Disclaimers</h2>
            <p>
              The Services are provided "as is" and "as available" to the
              fullest extent permitted by law. BRC disclaims warranties of
              merchantability, fitness for a particular purpose,
              non-infringement, availability, accuracy, and uninterrupted or
              error-free operation. We do not guarantee revenue, review removal,
              rating improvement, customer behaviour, platform ranking, search
              visibility, deliverability, conversion, payout timing, or legal
              compliance outcomes.
            </p>
          </section>

          <section className="legal-section">
            <h2>18. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, BRC and its affiliates,
              directors, employees, contractors, suppliers, and licensors will
              not be liable for indirect, incidental, special, consequential,
              exemplary, punitive, or lost-profit damages, or for loss of data,
              goodwill, revenue, business opportunity, reputation, or business
              interruption.
            </p>
            <p>
              To the fullest extent permitted by law, BRC's total aggregate
              liability for all claims relating to the Services or these Terms
              will not exceed the fees you paid to BRC for the Services giving
              rise to the claim during the three months before the event giving
              rise to liability, or GBP 100 if you used free Services.
            </p>
            <p>
              Nothing in these Terms limits liability that cannot legally be
              limited, including liability for fraud, fraudulent
              misrepresentation, or death or personal injury caused by
              negligence.
            </p>
          </section>

          <section className="legal-section">
            <h2>19. Indemnity</h2>
            <p>
              You will defend, indemnify, and hold harmless BRC and its
              affiliates, directors, employees, contractors, suppliers, and
              licensors from claims, losses, damages, fines, penalties, costs,
              and expenses arising from your business, your content, your
              customers, your products or services, your messaging or review
              activity, your breach of these Terms, your misuse of the
              Services, or your violation of law or third-party rights.
            </p>
          </section>

          <section className="legal-section">
            <h2>20. Governing law and disputes</h2>
            <p>
              These Terms are governed by the laws of England and Wales,
              excluding conflict-of-law rules. The courts of England and Wales
              will have exclusive jurisdiction, except that BRC may seek
              injunctive or equitable relief in any court with jurisdiction to
              protect the Services, confidential information, security, or
              intellectual property.
            </p>
          </section>

          <section className="legal-section">
            <h2>21. Changes and contact</h2>
            <p>
              We may update these Terms from time to time. If changes are
              material, we will use reasonable efforts to notify account owners
              by email, in-app notice, or website notice before or when the
              changes take effect. Continued use after the effective date means
              you accept the updated Terms.
            </p>
            <p>
              Legal notices should be sent to legal@brcapp.io or {LEGAL_COMPANY_ADDRESS}.
            </p>
          </section>
        </div>

        <LegalBackLink />
      </div>
    </div>
  );
}

function EnhancedPrivacyPolicy() {
  return (
    <div className="legal-page">
      <LegalCloseButton />
      <div className="container">
        <div className="legal-header">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">Last updated: {LEGAL_LAST_UPDATED}</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Who we are</h2>
            <p>
              This Privacy Policy explains how BRC Labs LTD ("BRC", "we", "us",
              and "our") collects, uses, shares, and protects personal data
              through brcapp.io, the BRC console, go.brcapp.io customer pages,
              mobile apps, support channels, contact forms, and related
              services.
            </p>
            <p>
              Contact: privacy@brcapp.io or {LEGAL_COMPANY_ADDRESS}. If you
              need help with an account or support ticket, contact
              support@brcapp.io.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Our privacy roles</h2>
            <p>
              BRC can act in different privacy roles depending on the data and
              purpose. For account, billing, website, contact, security,
              analytics, support, product improvement, marketing, and legal
              compliance data, BRC is usually an independent controller.
            </p>
            <p>
              For customer data that a business collects or manages through BRC
              ordering, bookings, feedback, CRM, campaigns, review requests,
              receipts, and support workflows, the business is usually the
              controller or business, and BRC is usually its processor or
              service provider. If you are a customer of a business using BRC,
              that business is normally the first place to exercise rights about
              your order, booking, feedback, or marketing preferences.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Personal data we collect</h2>
            <ul>
              <li><strong>Account and business data:</strong> name, email, phone, password or login method, business name, address, website, profile links, staff roles, permissions, verification material, plan, billing status, and settings.</li>
              <li><strong>Customer and operational data:</strong> customer names, email addresses, phone numbers, order details, booking details, delivery addresses, table numbers, notes, receipts, feedback, rewards, campaign history, support tickets, and communication preferences.</li>
              <li><strong>Review and public signal data:</strong> public reviews, ratings, reviewer names or handles, review text, platform metadata, public listing details, competitor signals, and dispute notes.</li>
              <li><strong>Payment and billing data:</strong> subscription state, invoices, plan changes, credits, payment provider identifiers, payout status, connected payout account status, and transaction metadata. Full card details are handled by payment providers, not stored by BRC.</li>
              <li><strong>Support and contact data:</strong> messages, attachments, requester details, admin replies, email metadata, issue history, and internal notes.</li>
              <li><strong>Device, usage, and security data:</strong> IP address, browser, device, app version, pages viewed, feature events, logs, crash data, identifiers, cookie data, bot-prevention challenge data, and fraud or abuse signals.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Sources of data</h2>
            <p>
              We collect data directly from you, from businesses using BRC,
              from customers interacting with BRC-powered pages, from authorised
              users and team members, from connected payment and communication
              providers, from support messages, from device and usage events,
              and from public or connected review, map, place, and business
              listing sources.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. How we use personal data</h2>
            <ul>
              <li>provide, operate, secure, troubleshoot, and improve the Services;</li>
              <li>create accounts, authenticate users, manage roles, and verify businesses;</li>
              <li>process orders, bookings, receipts, deposits, payments, payouts, refunds, and billing events;</li>
              <li>send transactional messages, service updates, reminders, review requests, support replies, owner digests, and permitted campaigns;</li>
              <li>collect feedback, monitor reputation, analyse reviews, identify suspicious review patterns, draft replies, and prepare dispute materials;</li>
              <li>generate analytics, reporting, insights, recommendations, plan gates, and product diagnostics;</li>
              <li>prevent fraud, spam, abuse, unauthorised access, and security incidents;</li>
              <li>respond to support, legal requests, regulatory duties, disputes, chargebacks, and policy enforcement; and</li>
              <li>send BRC marketing where permitted, with unsubscribe controls.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Legal bases</h2>
            <p>
              Where UK GDPR, EU GDPR, or similar laws apply, we rely on one or
              more legal bases depending on the context:
            </p>
            <ul>
              <li><strong>Contract:</strong> to provide accounts, subscriptions, support, ordering, bookings, billing, and requested Services.</li>
              <li><strong>Legitimate interests:</strong> to secure the Services, prevent abuse, improve product quality, understand usage, support customers, monitor public reputation data, and operate BRC as a business.</li>
              <li><strong>Consent:</strong> for certain marketing, cookies, optional communications, or processing where consent is required.</li>
              <li><strong>Legal obligation:</strong> for tax, accounting, consumer, telecoms, regulatory, sanctions, law enforcement, and dispute obligations.</li>
              <li><strong>Vital or public interests:</strong> only where legally applicable and necessary.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. AI and automated tools</h2>
            <p>
              BRC may use automated systems and AI providers to summarise,
              classify, translate, detect themes, draft responses, assess
              review authenticity signals, prioritise support, and generate
              operational insights. These tools support human decision-making;
              BRC does not intend to make solely automated decisions that
              produce legal or similarly significant effects about individuals.
            </p>
            <p>
              Businesses remain responsible for deciding whether to send,
              publish, dispute, refund, escalate, or rely on any AI-assisted
              output. We do not knowingly use your customer personal data to
              train third-party foundation models unless we say so and have a
              valid legal basis.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Cookies and security checks</h2>
            <p>
              We use cookies, local storage, logs, and similar technologies for
              authentication, preferences, analytics, performance, fraud
              prevention, and security. You can control many cookies through
              your browser, but blocking necessary cookies may break parts of
              the Services.
            </p>
            <p>
              Our public contact form uses an external bot-prevention provider
              to distinguish genuine users from automated abuse. That provider
              may process client-side signals such as IP address, browser data,
              TLS fingerprint, user-agent, site key, and origin for bot
              detection, security, and service improvement as described in its
              own notices.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. When we share data</h2>
            <p>
              We do not sell personal data. We share personal data only as
              needed for the Services, with appropriate restrictions, or where
              permitted or required by law.
            </p>
            <ul>
              <li><strong>Service providers and subprocessors:</strong> hosting, database, authentication, email, SMS, payment, app subscription, support, analytics, monitoring, AI, fraud prevention, and security providers.</li>
              <li><strong>Connected platforms:</strong> payment providers, marketplaces, review platforms, map and place services, delivery or fulfilment tools, and integrations you connect or use.</li>
              <li><strong>Businesses and their users:</strong> data shown to the business account that collected or manages it, subject to roles and permissions.</li>
              <li><strong>Legal and safety recipients:</strong> courts, regulators, law enforcement, advisers, insurers, banks, payment networks, or others where necessary to protect rights, safety, security, or compliance.</li>
              <li><strong>Business transfers:</strong> in connection with a merger, acquisition, financing, restructuring, or sale of assets, subject to appropriate safeguards.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. International transfers</h2>
            <p>
              We and our providers may process personal data in the United
              Kingdom, United States, European Economic Area, and other
              countries. Where required, we use appropriate safeguards such as
              adequacy regulations, standard contractual clauses, data
              processing agreements, transfer risk assessments, or equivalent
              protections.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Retention</h2>
            <p>
              We keep personal data for as long as needed for the purposes in
              this Policy, including to provide the Services, keep business
              records, resolve disputes, enforce terms, comply with legal
              obligations, maintain backups, detect abuse, and support security.
              Retention depends on the data type, account status, plan,
              business settings, legal requirements, and whether data is held as
              controller or processor.
            </p>
            <ul>
              <li>Account and billing records are usually kept while the account is active and for a reasonable period after closure for tax, dispute, audit, and compliance needs.</li>
              <li>Order, booking, feedback, campaign, and customer records follow the business's settings, our processor obligations, and operational retention needs.</li>
              <li>Public review and listing data may be refreshed, cached, archived, or deleted as platform data changes and product needs require.</li>
              <li>Security logs, abuse signals, and backups may be retained for limited periods after active data is removed.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>12. Security</h2>
            <p>
              We use reasonable technical and organisational safeguards,
              including access controls, encryption in transit, provider
              security controls, monitoring, backups, permissioning, and
              incident response processes. No service can guarantee absolute
              security. If you believe your account or data is at risk, contact
              support@brcapp.io immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Your rights and choices</h2>
            <p>
              Depending on your location and the context, you may have rights to
              access, correct, delete, export, restrict, object to processing,
              withdraw consent, opt out of marketing, or appeal certain
              decisions. To exercise rights for BRC account, website, contact,
              or support data, email privacy@brcapp.io. For customer data held
              on behalf of a business using BRC, contact that business first;
              we will support the business where required.
            </p>
            <p>
              You can unsubscribe from marketing emails using the unsubscribe
              link, opt out of SMS where an opt-out command is provided, adjust
              available account preferences, or disconnect integrations where
              supported. We may need to verify your identity before fulfilling a
              request.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. US state privacy notices</h2>
            <p>
              We do not sell personal data or knowingly share personal data for
              cross-context behavioural advertising. If a US state privacy law
              applies to your personal data, you may have rights to access,
              delete, correct, obtain a copy, opt out of certain processing, or
              appeal a denial. We will not discriminate against you for
              exercising privacy rights.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Children</h2>
            <p>
              BRC is intended for businesses and is not directed to children. We
              do not knowingly collect personal data from children under 13, or
              under 16 where that higher age applies, without appropriate
              permission. If you believe a child provided personal data to BRC,
              contact privacy@brcapp.io.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Complaints, changes, and contact</h2>
            <p>
              If you have a privacy concern, please contact us first at
              privacy@brcapp.io. If UK data protection law applies, you also
              have the right to complain to the Information Commissioner's
              Office. If another regulator applies in your location, you may
              contact that regulator.
            </p>
            <p>
              We may update this Privacy Policy to reflect changes in law,
              product features, providers, or data practices. If changes are
              material, we will use reasonable efforts to notify account owners
              by email, in-app notice, or website notice.
            </p>
          </section>
        </div>

        <LegalBackLink />
      </div>
    </div>
  );
}

// ─── PUBLIC AUDIT ─────────────────────────────────────────────────────────────

function PublicAuditPage() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    audit: null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("t") || params.get("token");
    if (!token) {
      setState({
        loading: false,
        error: "This audit link is missing its access token.",
        audit: null,
      });
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE_URL}/public/prospect-audit/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Audit not found");
        return json.audit;
      })
      .then((audit) => {
        if (!cancelled) setState({ loading: false, error: "", audit });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load this audit.",
            audit: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="audit-page">
        <div className="container audit-shell">
          <div className="audit-loading">Loading audit notes...</div>
        </div>
      </div>
    );
  }

  if (state.error || !state.audit) {
    return (
      <div className="audit-page">
        <div className="container audit-shell">
          <div className="audit-error">
            <h1>Audit link unavailable</h1>
            <p>{state.error || "This audit could not be found."}</p>
            <a href="/" className="btn btn-primary">Back to BRC</a>
          </div>
        </div>
      </div>
    );
  }

  const audit = state.audit;
  const place = audit.place || {};
  const businessName = audit.businessName || place.name || "your business";
  const reviewCount = place.reviewCount || audit.reviewsAnalyzed || 0;
  const lowReviews = audit.lowReviews || [];
  const themes = audit.lowReviewThemes || [];
  const competitors = audit.competitors || [];
  const distribution = audit.ratingDistribution || [];
  const publicSignals = audit.publicSignals || [];
  const oneStarCount =
    audit.oneStarReviewCount ??
    lowReviews.filter((review) => Number(review.rating) <= 1).length;
  const averageSampleRating = audit.averageSampleRating || null;
  const topCompetitor = competitors[0] || null;
  const competitorRatingGap =
    topCompetitor &&
    Number.isFinite(Number(topCompetitor.rating)) &&
    Number.isFinite(Number(place.rating))
      ? Math.round((Number(topCompetitor.rating) - Number(place.rating)) * 10) / 10
      : null;
  const signupBase = {
    businessName,
    placeId: audit.placeId || place.placeId || place.place_id || "",
  };
  const recommendedActions = [
    {
      title: "Capture private feedback before it becomes public",
      body: "Use QR feedback after each visit so unhappy customers can tell the team directly while there is still time to recover the experience.",
    },
    {
      title: "Reply to the reviews that shape first impressions",
      body: "Prioritise low-rating reviews with specific complaints, then use consistent replies to show future customers the business is attentive.",
    },
    {
      title: "Follow up for honest reviews after good visits",
      body: "A steady review follow-up workflow helps happy customers share their experience without pressuring them or sounding automated.",
    },
    {
      title: "Watch nearby competitors and repeated themes",
      body: "Track rating gaps, review volume, and recurring complaints so the team knows what to fix first.",
    },
  ];
  const weekPlan = [
    {
      day: "Day 1",
      title: "Connect the business",
      body: "Bring the public review profile into BRC and confirm the key platforms the team wants to monitor.",
    },
    {
      day: "Day 2",
      title: "Set up private feedback",
      body: "Create a QR feedback flow so customers can raise problems directly before they become public reviews.",
    },
    {
      day: "Day 3",
      title: "Prioritise review replies",
      body: "Use the audit themes to decide which low-rating reviews need a thoughtful owner response first.",
    },
    {
      day: "Day 5",
      title: "Start review follow-up",
      body: "Send natural, honest review requests after good visits so happy customers are more likely to share.",
    },
    {
      day: "Day 7",
      title: "Review the dashboard",
      body: "Check feedback, review movement, competitor context, and the next recommended actions for the team.",
    },
  ];
  const planCards = [
    {
      plan: "free",
      label: "Free",
      price: "£0/mo",
      bestFor: "Start without risk",
      items: ["Basic POS and catalog", "Simple ordering", "1% platform fee"],
    },
    {
      plan: "growth",
      label: "Growth",
      price: "£49/mo",
      bestFor: "Best first step",
      items: ["Review sync", "AI reply drafts", "Basic campaign tracking"],
    },
    {
      plan: "pro",
      label: "Pro",
      price: "£99/mo",
      bestFor: "For deeper monitoring",
      items: ["More review platforms", "Competitor tracking", "Public signals"],
    },
    {
      plan: "enterprise",
      label: "Business",
      price: "£249/mo",
      bestFor: "For teams and locations",
      items: ["Scheduled campaigns", "Automations", "Brand-level workflows"],
    },
  ];

  return (
    <div className="audit-page">
      <div className="container audit-shell">
        <div className="audit-topbar">
          <a href="/" className="audit-brand">
            <img src="/logo-mark.svg" width="34" height="34" alt="" />
            BRC
          </a>
          <a
            href={signupUrl({ ...signupBase, plan: "free" })}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start Free
          </a>
        </div>

        <header className="audit-hero">
          <div className="section-tag">Public Review Notes</div>
          <h1>A few notes on {businessName}&apos;s public reviews</h1>
          <p>
            This snapshot uses public review information customers can already
            see before they decide where to go. It highlights reputation risks,
            review patterns, and practical next steps for the team.
          </p>
          <div className="audit-meta">
            {place.address && <span>{place.address}</span>}
            {audit.createdAt && (
              <span>
                Prepared {new Date(audit.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </header>

        <section className="audit-kpis">
          <div className="audit-kpi">
            <span>Google rating</span>
            <strong>{place.rating || "N/A"}</strong>
          </div>
          <div className="audit-kpi">
            <span>Public reviews</span>
            <strong>{Number(reviewCount || 0).toLocaleString()}</strong>
          </div>
          <div className="audit-kpi warning">
            <span>Needs attention</span>
            <strong>{lowReviews.length}</strong>
          </div>
          <div className="audit-kpi">
            <span>Sample checked</span>
            <strong>{audit.reviewsAnalyzed || 0}</strong>
          </div>
        </section>

        <section className="audit-summary">
          <div>
            <span className="audit-eyebrow">Executive summary</span>
            <h2>
              {lowReviews.length
                ? `${lowReviews.length} review${lowReviews.length === 1 ? "" : "s"} in this sample could affect trust before a customer visits.`
                : "This sample is mostly positive, which makes consistency the next opportunity."}
            </h2>
          </div>
          <div className="audit-summary-list">
            <p>
              <strong>{oneStarCount}</strong> one-star review{oneStarCount === 1 ? "" : "s"} found in the low-rating sample.
            </p>
            <p>
              <strong>{themes.length || "No"}</strong> repeated theme{themes.length === 1 ? "" : "s"} detected
              {themes.length ? `: ${themes.slice(0, 3).join(", ")}.` : " in this quick scan."}
            </p>
            <p>
              <strong>{topCompetitor ? topCompetitor.name : "No benchmark"}</strong>
              {topCompetitor
                ? ` is the nearby comparison point in this report${competitorRatingGap !== null ? `, with a ${competitorRatingGap > 0 ? "+" : ""}${competitorRatingGap} rating gap.` : "."}`
                : " stood out in this quick check."}
            </p>
          </div>
        </section>

        <section className="audit-grid">
          <article className="audit-panel">
            <h2>What stood out</h2>
            <p>
              {lowReviews.length
                ? `${lowReviews.length} low-rating review${lowReviews.length === 1 ? "" : "s"} stood out as worth a closer look.`
                : "No low-rating reviews stood out in this sample."}
            </p>
            {themes.length > 0 && (
              <div className="audit-tags">
                {themes.map((theme) => (
                  <span key={theme}>{theme}</span>
                ))}
              </div>
            )}
          </article>

          <article className="audit-panel">
            <h2>Review pattern</h2>
            {averageSampleRating && (
              <p className="audit-note">
                Average rating in this checked sample: {averageSampleRating}.
              </p>
            )}
            <div className="audit-bars">
              {distribution.length ? (
                distribution.map((row) => (
                  <div className="audit-bar-row" key={row.star}>
                    <span>{row.star} star</span>
                    <div>
                      <i style={{ width: `${row.percent || 0}%` }} />
                    </div>
                    <b>{row.count}</b>
                  </div>
                ))
              ) : (
                <p>No rating distribution available for this sample.</p>
              )}
            </div>
          </article>
        </section>

        {lowReviews.length > 0 && (
          <section className="audit-section">
            <h2>Examples from the public sample</h2>
            <div className="audit-review-list">
              {lowReviews.slice(0, 4).map((review, index) => (
                <article className="audit-review" key={`${review.customerName}-${index}`}>
                  <div className="audit-stars">{review.rating || "N/A"} star</div>
                  <p>{review.text || "No written review text available."}</p>
                  <span>{review.customerName || "Google reviewer"}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="audit-grid">
          <article className="audit-panel">
            <h2>Nearby benchmark</h2>
            {topCompetitor ? (
              <>
                <p>
                  {topCompetitor.name} shows {topCompetitor.rating || "N/A"} stars
                  from {topCompetitor.reviewCount || 0} reviews.
                </p>
                {competitorRatingGap !== null && (
                  <div className="audit-benchmark">
                    <span>Rating gap</span>
                    <strong>{competitorRatingGap > 0 ? "+" : ""}{competitorRatingGap}</strong>
                    <small>
                      {competitorRatingGap > 0
                        ? "The benchmark currently rates higher."
                        : competitorRatingGap < 0
                          ? `${businessName} currently rates higher.`
                          : "Ratings are currently level."}
                    </small>
                  </div>
                )}
              </>
            ) : (
              <p>No nearby benchmark stood out in this quick check.</p>
            )}
          </article>

          <article className="audit-panel">
            <h2>Public signals</h2>
            <p>
              {publicSignals.length
                ? `${publicSignals.length} public web mention${publicSignals.length === 1 ? "" : "s"} appeared in this check.`
                : "No additional public web mentions stood out in this check."}
            </p>
            {publicSignals.length > 0 && (
              <div className="audit-signal-list">
                {publicSignals.slice(0, 3).map((signal, index) => (
                  <div className="audit-signal" key={`${signal.url || signal.title}-${index}`}>
                    <strong>{signal.platform || "Web"}</strong>
                    <span>{signal.title || signal.snippet || "Public mention"}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="audit-section">
          <h2>What BRC would help the team do next</h2>
          <div className="audit-actions-grid">
            {recommendedActions.map((action, index) => (
              <article className="audit-action" key={action.title}>
                <div className="audit-action-num">{index + 1}</div>
                <h3>{action.title}</h3>
                <p>{action.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="audit-workflow">
          <div className="audit-workflow-card before">
            <span>Without a system</span>
            <h2>Problems often appear publicly first</h2>
            <p>
              A customer has a poor visit, leaves without speaking to the team,
              and the business only finds out when the review is already public.
            </p>
          </div>
          <div className="audit-workflow-arrow">→</div>
          <div className="audit-workflow-card after">
            <span>With {BRAND_SHORT}</span>
            <h2>Issues can be caught privately earlier</h2>
            <p>
              The customer orders, books, or scans a QR code, shares private
              feedback, the team follows up, and happy customers are asked for
              honest public reviews.
            </p>
          </div>
        </section>

        <section className="audit-section">
          <div className="audit-section-heading">
            <div>
              <h2>What the first 7 days would look like</h2>
              <p>
                This gives the owner a practical path from this audit to a working
                feedback and review process.
              </p>
            </div>
            <a
              href={signupUrl({ ...signupBase, plan: "free" })}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Free
            </a>
          </div>
          <div className="audit-timeline">
            {weekPlan.map((step) => (
              <article className="audit-timeline-step" key={step.day}>
                <span>{step.day}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="audit-section">
          <h2>Choose where to start</h2>
          <div className="audit-plan-grid">
            {planCards.map((plan) => (
              <article className="audit-plan" key={plan.plan}>
                <div className="audit-plan-top">
                  <span>{plan.bestFor}</span>
                  <strong>{plan.label}</strong>
                  <b>{plan.price}</b>
                </div>
                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  href={signupUrl({ ...signupBase, plan: plan.plan })}
                  className={`btn ${plan.plan === "growth" ? "btn-primary" : "btn-outline"} btn-block`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start {plan.label}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="audit-cta">
          <div>
            <h2>Want to organise feedback and reviews for {businessName}?</h2>
            <p>
              Start with BRC on web, connect the business, then choose
              the plan that fits your team. The signup form will be prefilled
              from this audit.
            </p>
          </div>
          <div className="audit-plan-actions">
            <a href={signupUrl({ ...signupBase, plan: "growth" })} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Start with Growth
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

const CONTENT_PAGES = {
  features: {
    title: "Features",
    subtitle: "The BRC OS modules built for local business operations.",
    sections: [
      {
        title: "What BRC brings together",
        body: "BRC OS combines POS, orders, table tabs, table and QR code management, tenders, catalog, inventory, purchasing, vendors, rota, payroll, finance, competitor tracking, social signals, brand mentions, reputation recovery, campaigns, rewards, analytics, and support workflows in one operating console.",
        items: [
          "POS tools for registers, table tabs, table-specific QR codes, tenders, customer display, kitchen display, cash drawer controls, manager overrides, closeout, and offline sync queues.",
          "Back-office tools for catalog, inventory, vendors, purchasing, item availability, recipes, staff rota, payroll, finance, permissions, and location-aware operations.",
          "Market and reputation tools for competitor tracking, social signal presence, brand mentions, review monitoring, private feedback, suspicious review triage, and recovery workflows.",
          "Ordering and booking flows for go.brcapp.io customer pages, deposits, reminders, receipts, and fulfilment status.",
          "Campaigns, rewards, owner digests, customer follow-up, reporting, and admin controls.",
        ],
      },
      {
        title: "Feature pages",
        body: "Detailed pages are available for the core workflows that are already represented on the landing site.",
        links: [
          { label: "POS", href: "/features/pos" },
          { label: "Tables and QR", href: "/features/tables-qr" },
          { label: "Inventory", href: "/features/inventory" },
          { label: "Rota and payroll", href: "/features/staff-ops" },
          { label: "Finance", href: "/features/finance" },
          { label: "AI intelligence", href: "/features/ai-intelligence" },
          { label: "Market signals", href: "/features/market-signals" },
          { label: "Ordering", href: "/features/ordering" },
          { label: "Bookings", href: "/features/bookings" },
          { label: "Reputation", href: "/features/reputation" },
        ],
      },
    ],
  },
  pricing: {
    title: "Full Plan Details",
    subtitle: "Compare BRC plan limits, modules, review coverage, AI, payment fees, and onboarding.",
    sections: [
      {
        title: "Plan comparison",
        body: "The dedicated pricing page compares BRC plan limits, modules, review coverage, AI, payment fees, onboarding, and billing notes.",
        links: [
          { label: "View Pricing", href: "/#pricing" },
          { label: "See Full Plan Details", href: "/pricing" },
        ],
      },
      {
        title: "Billing notes",
        body: "Subscriptions renew automatically unless cancelled before renewal. Add-ons such as review SMS credits, higher usage, onboarding, or specialist setup may be charged separately.",
      },
    ],
  },
  changelog: {
    title: "Changelog",
    subtitle: "Product updates, fixes, and launch notes.",
    underConstruction: true,
    sections: [
      {
        title: "Coming soon",
        body: "A public changelog is under construction. For now, release notes are shared directly with customers when changes affect active workflows.",
      },
    ],
  },
  roadmap: {
    title: "Roadmap",
    subtitle: "What BRC is working toward next.",
    underConstruction: true,
    sections: [
      {
        title: "Planned direction",
        body: "The roadmap page is under construction. Current priorities include deeper reputation recovery, more review evidence workflows, richer owner digests, stronger public-page configuration, and smoother multi-location operations.",
      },
    ],
  },
  about: {
    title: "About",
    subtitle: "BRC helps local businesses turn customer activity into better operations, stronger reviews, and faster recovery.",
    sections: [
      {
        title: "What we are building",
        body: "BRC is Business Reputation & Customer Operations software for local teams. The product brings together ordering, bookings, customer feedback, review building, reputation recovery, campaigns, rewards, analytics, and support workflows so businesses can run the customer side of the operation from one place.",
      },
      {
        title: "Why it exists",
        body: "Most local businesses are forced to stitch together disconnected tools. One app takes orders, another handles bookings, another sends messages, another tracks reviews, and the owner is left trying to understand what actually happened. BRC is built around the real customer journey: someone discovers the business, places an order or booking, leaves feedback, receives follow-up, and may become a repeat customer or public advocate.",
      },
      {
        title: "The reputation problem",
        body: "A single unfair review can sit beside years of good service. At the same time, happy customers often leave quietly without writing anything. BRC helps businesses collect private feedback earlier, recover negative experiences before they become permanent damage, guide satisfied customers toward legitimate public reviews, and keep evidence organised when a fake or policy-breaking review needs to be disputed.",
      },
      {
        title: "How the app is organised",
        body: "BRC is arranged around practical areas of work: the dashboard for today’s priorities, Go pages for customer-facing ordering and booking, inbox and review tools for feedback and reputation, campaigns and rewards for follow-up, analytics for owner reporting, and admin settings for staff, billing, notifications, verification, and support.",
      },
      {
        title: "Who it is for",
        body: "BRC is designed for restaurants, cafes, salons, clinics, gyms, retailers, service businesses, local multi-location operators, and owner-led teams that need professional systems without running five different subscriptions.",
      },
      {
        title: "Our principles",
        body: "We build for clarity, recovery, and accountability. Customer data should be useful without becoming messy. Automation should save time without pretending humans are unnecessary. Review growth should be legitimate. Reputation recovery should start privately and respectfully. Business owners should be able to see what is happening without digging through separate tools.",
      },
      {
        title: "Company details",
        body: `${BRAND_NAME} is operated by BRC Labs LTD. Legal notices may be sent to ${LEGAL_COMPANY_ADDRESS}.`,
        links: [{ label: "Contact Us", href: "/contact" }],
      },
    ],
  },
  blog: {
    title: "Blog",
    subtitle: "Guides and product thinking for local operators.",
    underConstruction: true,
    sections: [
      {
        title: "Under construction",
        body: "The BRC blog is being prepared. Planned topics include review recovery, positive review building, local ordering, bookings, loyalty, and owner reporting.",
      },
    ],
  },
  careers: {
    title: "Careers",
    subtitle: "Work on customer operations software for local businesses.",
    underConstruction: true,
    sections: [
      {
        title: "No open roles yet",
        body: "The careers page is under construction and there are no public vacancies listed right now. Future roles will be posted here when hiring opens.",
      },
    ],
  },
  press: {
    title: "Press",
    subtitle: "Company information and media contact.",
    underConstruction: true,
    sections: [
      {
        title: "Press resources coming soon",
        body: "The press page is under construction. For media, partnership, or company enquiries, contact the team through the contact page.",
        links: [{ label: "Contact Us", href: "/contact" }],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    subtitle: "How BRC uses cookies and similar technologies.",
    sections: [
      {
        title: "Essential cookies",
        body: "BRC uses essential cookies, local storage, and similar technologies to keep users signed in, remember preferences, protect sessions, prevent abuse, and operate the website and console.",
      },
      {
        title: "Analytics and diagnostics",
        body: "We may use analytics, logs, error monitoring, and diagnostic tools to understand performance, improve product quality, detect problems, and protect the service.",
      },
      {
        title: "Security checks",
        body: "The contact form uses an external bot-prevention provider to help distinguish genuine users from automated abuse. The provider may process browser and device signals for security checks.",
      },
      {
        title: "Your choices",
        body: "You can control many cookies through your browser settings. Blocking essential cookies may stop parts of BRC from working correctly.",
      },
    ],
  },
  gdpr: {
    title: "GDPR",
    subtitle: "Data protection information for UK and EU users.",
    sections: [
      {
        title: "Controller and processor roles",
        body: "For account, billing, website, contact, support, security, analytics, and legal compliance data, BRC is usually an independent controller. For customer data that a business manages through BRC ordering, bookings, feedback, campaigns, and review workflows, BRC is usually the business's processor.",
      },
      {
        title: "Rights requests",
        body: "You may have rights to access, correct, delete, export, restrict, or object to processing. For BRC account or website data, email privacy@brcapp.io. For data held by a business using BRC, contact that business first.",
      },
      {
        title: "Data processing",
        body: "BRC uses subprocessors for hosting, database, authentication, payments, email, SMS, analytics, monitoring, AI, and security. Transfers outside the UK or EEA are handled using appropriate safeguards where required.",
      },
      {
        title: "More detail",
        body: "The Privacy Policy contains the full privacy notice and should be read together with this GDPR summary.",
        links: [{ label: "Privacy Policy", href: "/privacy" }],
      },
    ],
  },
  help: {
    title: "Help Center",
    subtitle: "Search guides for setup, reputation, ordering, bookings, campaigns, analytics, billing, and support.",
    sections: [],
  },
  status: {
    title: "System Status",
    subtitle: "Availability information for BRC services.",
    underConstruction: true,
    sections: [
      {
        title: "Public status page coming soon",
        body: "A public system status page is under construction. BRC strives to maintain 99.9% service uptime, but the Terms of Service explain that this is an operational target rather than a compensation promise.",
      },
      {
        title: "Need help now?",
        body: "If you are experiencing an outage or urgent service issue, contact support so the team can investigate.",
        links: [{ label: "Contact Us", href: "/contact" }],
      },
    ],
  },
  api: {
    title: "API Docs",
    subtitle: "Developer documentation for BRC integrations.",
    underConstruction: true,
    sections: [
      {
        title: "Private beta",
        body: "Public API documentation is under construction. BRC APIs and integration endpoints are currently used for approved internal, customer, and partner workflows.",
      },
      {
        title: "Integration enquiries",
        body: "For partner or integration access, contact the BRC team with the use case, business profile, and expected data flow.",
        links: [{ label: "Contact Us", href: "/contact" }],
      },
    ],
  },
};

const FOOTER_LINKS = {
  Features: "/features",
  Pricing: "/pricing",
  Changelog: "/changelog",
  Roadmap: "/roadmap",
  About: "/about",
  Blog: "/blog",
  Careers: "/careers",
  Press: "/press",
  "Privacy Policy": "/privacy",
  "Terms of Service": "/terms",
  "Cookie Policy": "/cookies",
  GDPR: "/gdpr",
  "Help Center": "/help",
  "Contact Us": "/contact",
  "System Status": "/status",
  "API Docs": "/api-docs",
};

const HELP_ARTICLES = [
  {
    id: "getting-started",
    category: "Getting started",
    title: "Getting started with BRC",
    summary: "Set up your business profile, choose modules, invite your team, and publish the customer-facing page.",
    overview:
      "Start with the pieces customers will see first, then connect the operational workflows your team will use every day. A clean setup usually means the business profile, public Go page, team roles, notifications, and one live customer workflow are working before you add more modules.",
    steps: [
      "Create your account and confirm the business name, address, contact details, and business type.",
      "Choose the modules you want to use first: reputation, feedback, ordering, bookings, campaigns, rewards, analytics, or team operations.",
      "Review your public Go page settings, including logo, hero image, business copy, available order modes, booking options, and consent text.",
      "Invite owners, managers, and staff with the correct roles so each person only sees the tools they need.",
      "Run a small internal test: place a sample order or booking, submit feedback, check notifications, and confirm the dashboard updates.",
    ],
    details: [
      "Business type controls sensible defaults for menus, services, ordering, bookings, table flows, pickup, and customer wording.",
      "Your public Go page is the customer-facing home for orders, bookings, feedback, rewards, and follow-up journeys.",
      "Verification, billing, subscription state, and enabled modules can affect whether a feature is visible or ready to publish.",
      "Use internal tests before sharing QR codes or links with customers, especially when payments, deposits, delivery, or staff notifications are involved.",
    ],
    tips: [
      "Launch one workflow well before turning on every module.",
      "Keep a test customer record handy so your team can rehearse the full customer journey.",
      "Check mobile layout, consent copy, and opening hours before publishing links publicly.",
    ],
    related: ["Public page", "Team roles", "Notifications", "Billing"],
  },
  {
    id: "dashboard",
    category: "Dashboard",
    title: "Using the dashboard",
    summary: "The dashboard gives owners and managers a quick view of customer activity and urgent work.",
    overview:
      "The dashboard is the daily command view. It helps owners and managers spot work that needs attention without opening every module: unresolved feedback, review changes, orders, bookings, campaign activity, billing warnings, verification tasks, and owner digest highlights.",
    steps: [
      "Use the dashboard to scan orders, bookings, review changes, feedback, campaign activity, and owner digest highlights.",
      "Treat priority cards as the work queue for the day: unresolved feedback, negative reviews, pending replies, failed messages, and billing or verification warnings.",
      "Open a card to move into the correct workflow, then return to the dashboard to continue through the next item.",
      "Use plan and module warnings to see which features are available and what needs setup before going live.",
    ],
    details: [
      "Dashboard cards are designed to move you into the right workflow quickly, not replace the full detail screens.",
      "Owner digest information is useful for a regular management rhythm: what changed, what needs a reply, and where revenue or reputation may be at risk.",
      "If a business has several modules enabled, the dashboard helps surface the work that crosses boundaries, such as an order that led to negative feedback.",
    ],
    tips: [
      "Use the dashboard at opening, mid-shift, and close of business.",
      "Do not leave negative feedback or public review replies sitting without an owner.",
      "Use warnings as setup prompts before assuming a workflow is broken.",
    ],
    related: ["Analytics", "Feedback", "Notifications", "Owner digest"],
  },
  {
    id: "ai-intelligence",
    category: "AI",
    title: "Using BRC AI",
    summary: "Ask BRC AI about revenue changes, sentiment loss risk, forecasts, stock, staffing, and next actions.",
    overview:
      "BRC AI brings the main AI operations experience into the product. The AI operations manager turns trading, POS, sentiment, review, stock, rota, campaign, finance, device, and location signals into an owner brief, forecasts, digital twin simulations, and an Ask box for questions about what changed and what to do next.",
    steps: [
      "Open BRC AI and review the AI owner brief for urgent actions across locations, stock, staffing, devices, closeout, campaigns, and reputation.",
      "Check the AI operations panel for health score, revenue trend, sales forecast, prep plan, reorder actions, labor forecast, and business advisor summary.",
      "Use Ask to question BRC AI: why sales changed, what sentiment may cause loss, which location needs attention, what to prep, what to reorder, or whether staffing should change.",
      "Review digital twin simulations before changing prices, service periods, capacity, prep stations, or table strategy.",
      "Use supporting AI features such as review summaries, reply drafts, suspicious-review context, and catalogue setup when the dashboard points to a reputation or catalogue action.",
    ],
    details: [
      "Loss-risk answers are decision support. The AI manager can connect sentiment, low ratings, open replies, failed campaigns, and revenue movement, but owners should check the source records before making major changes.",
      "Forecasts are based on available order, POS, stock, rota, and review data. They improve when the business keeps catalog, recipes, stock levels, shifts, and review channels current.",
      "Digital twin simulations are planning prompts, not guarantees. Use them to compare options before changing pricing, labor, menu availability, stations, or opening patterns.",
      "Reply drafts and catalogue setup should be approved by a human before anything customer-facing is posted, copied, priced, or published.",
    ],
    tips: [
      "Ask specific questions: “What sentiment is likely to cost us revenue this week?” is better than “How are we doing?”",
      "Compare the AI brief with the dashboard metrics before acting on a staffing, stock, or pricing recommendation.",
      "Use repeated sentiment or review themes as operations signals for staff coaching, menu changes, recovery campaigns, or service process fixes.",
    ],
    related: ["BRC AI", "Ask AI manager", "Forecasts", "Sentiment risk"],
  },
  {
    id: "reputation-recovery",
    category: "Reputation",
    title: "Recovering negative experiences",
    summary: "Use private feedback and follow-up workflows to fix customer issues before they become public damage.",
    overview:
      "BRC is built around the idea that many unhappy customers can be helped before they become a lasting public reputation problem. Private feedback gives your team context, a calmer place to respond, and a record of what was done.",
    steps: [
      "Ask for feedback after a real visit, order, booking, or service interaction.",
      "Route unhappy customers into private recovery instead of immediately asking for a public review.",
      "Review the customer’s order, booking, notes, rating, and message history before replying.",
      "Send a calm, specific response that acknowledges the issue and offers the next practical step.",
      "Mark the case with the right status so the team knows whether it is open, waiting, resolved, or escalated.",
    ],
    details: [
      "Feedback records can include ratings, comments, customer contact details, metric scores, staff attribution, reward code state, and linked order or booking context.",
      "Recovery work is strongest when the reply is specific: mention the problem, explain what happens next, and keep the tone human.",
      "Use statuses consistently so managers can see which cases still need attention.",
      "Private recovery should never be used to silence legitimate criticism; it is a way to resolve real problems respectfully.",
    ],
    tips: [
      "Reply quickly when a customer has given contact details.",
      "Avoid defensive language; customers usually want acknowledgement before explanation.",
      "Use recurring feedback themes as operations signals, not just customer service tasks.",
    ],
    related: ["Feedback inbox", "Reviews", "Campaigns", "Analytics"],
  },
  {
    id: "positive-reviews",
    category: "Reputation",
    title: "Building positive reviews legitimately",
    summary: "Guide happy customers toward public review platforms without fake incentives or review gating.",
    overview:
      "Positive review growth should come from real customers and honest timing. BRC helps you ask at the right moment, track the workflow, and keep unhappy customers supported through private feedback instead of pushing everyone through the same message.",
    steps: [
      "Use genuine customer activity as the trigger, such as a completed booking, fulfilled order, or resolved support moment.",
      "Send review requests at a natural time, when the customer has actually experienced the business.",
      "Keep the message honest and neutral. Do not pressure the customer or offer prohibited incentives for a positive review.",
      "Choose which review destination matters most for the business, then track lift and response quality over time.",
      "Keep private feedback enabled so unhappy customers can still be heard and recovered respectfully.",
    ],
    details: [
      "Review requests work best when they follow a meaningful interaction: a collected order, completed appointment, successful table visit, or resolved support moment.",
      "BRC can help organise public review destinations and show reputation movement over time.",
      "Different platforms have different review policies; the business is responsible for following the rules of each platform.",
      "Neutral wording protects trust and reduces the risk of platform policy issues.",
    ],
    tips: [
      "Ask soon enough that the visit is fresh, but not while the customer is still waiting for service.",
      "Do not offer discounts in exchange for a positive review.",
      "Track review quality as well as review volume.",
    ],
    related: ["Google reviews", "Feedback", "Rewards", "Analytics"],
  },
  {
    id: "fake-review-disputes",
    category: "Reputation",
    title: "Handling suspicious or fake reviews",
    summary: "Organise review context and prepare clearer dispute material for third-party platforms.",
    overview:
      "BRC helps your team collect context and prepare a clearer platform dispute when a review looks suspicious, abusive, irrelevant, conflicted, or unsupported by customer records. The third-party review platform always controls the final removal decision.",
    steps: [
      "Open the review detail and check the original text, rating, date, platform, reviewer context, and any linked customer history.",
      "Look for concrete signals: no matching customer record, abusive content, conflict of interest, irrelevant claims, duplicate language, or impossible timing.",
      "Collect evidence inside the review workflow before submitting a dispute or removal request.",
      "Use BRC’s draft support as a starting point, then have a human review the final wording.",
      "Remember that BRC helps organise and prepare the case; the third-party review platform controls the final decision.",
    ],
    details: [
      "Useful evidence can include order history, booking history, customer messages, timestamps, staff notes, duplicate wording, and proof that a claim does not match the business record.",
      "A strong dispute is factual and concise. Avoid speculation, insults, or emotional wording.",
      "If a review appears genuine but negative, treat it as a recovery opportunity rather than a fake-review case.",
      "Keep records even if the platform rejects the removal request, because repeated patterns may matter later.",
    ],
    tips: [
      "Separate policy violations from ordinary negative opinions.",
      "Have one manager review disputes before submission.",
      "Keep public replies professional even when a dispute is active.",
    ],
    related: ["Review detail", "Evidence", "Public replies", "Support"],
  },
  {
    id: "ordering",
    category: "Ordering",
    title: "Setting up ordering",
    summary: "Configure menus, item options, order modes, payments, fulfilment rules, and customer receipts.",
    overview:
      "Ordering connects your catalog, customer Go page, payment settings, fulfilment workflow, notifications, and staff screens. The goal is to make it easy for customers to order and easy for staff to accept, prepare, deliver, complete, or refund orders.",
    steps: [
      "Create categories and items, then add prices, descriptions, modifiers, availability, and images where needed.",
      "Choose which order modes are available: dine-in, table ordering, pickup, delivery, or a combination.",
      "Set preparation expectations, delivery rules, fulfilment notes, and unavailable-address behaviour.",
      "Connect payment processing if online payment is required, then test checkout and receipts before publishing.",
      "Use the order dashboard to update statuses, view customer notes, and keep staff aligned.",
    ],
    details: [
      "Catalog items can include categories, prices, descriptions, images, SKUs, inventory tracking, availability, variants, bundles, and allergen information where configured.",
      "Table QR ordering can link a customer session to a specific table, area, and dine-in context.",
      "Pickup flows need clear time expectations, opening hours, preparation time, and customer contact details.",
      "Delivery workflows can include address capture, notes, fees, fulfilment type, dispatch state, provider references, and tracking links where available.",
      "Kitchen and order views help staff move orders through submitted, accepted, ready, completed, cancelled, or refunded states.",
    ],
    tips: [
      "Keep item names short and descriptions useful on mobile.",
      "Test every enabled order mode before adding QR codes to tables or social profiles.",
      "Make unavailable items hidden or clearly disabled before service starts.",
    ],
    related: ["Catalog", "Tables", "Delivery", "Payments", "Kitchen display"],
  },
  {
    id: "bookings",
    category: "Bookings",
    title: "Setting up bookings",
    summary: "Create services, tables, resources, staff availability, deposits, reminders, and confirmation flows.",
    overview:
      "Bookings support appointment-led and reservation-led businesses: salons, clinics, gyms, restaurants, spas, service providers, classes, sessions, and events. The setup should make availability clear and give staff the information they need before the customer arrives.",
    steps: [
      "Add bookable services, tables, classes, sessions, or resources depending on the business type.",
      "Set duration, capacity, buffer time, availability, price, deposit rules, and auto-confirm preferences.",
      "Collect customer details and notes that staff need before the appointment or reservation.",
      "Turn on reminders to reduce no-shows and keep confirmation messages clear.",
      "After the booking, use feedback and review follow-up to understand the customer experience.",
    ],
    details: [
      "Services can include duration, price, deposits, staff assignment, capacity, buffers, and business-hour constraints.",
      "Auto-confirm works best for simple services with reliable availability. Manual confirmation is safer for complex requests.",
      "Customer notes are useful for allergies, access needs, preferences, prior consultation details, or special occasion context.",
      "Booking records can feed reminders, feedback requests, review prompts, rewards, and win-back campaigns.",
    ],
    tips: [
      "Use buffers when staff need reset, travel, cleanup, or preparation time.",
      "Keep cancellation and deposit wording visible before the customer submits.",
      "Review no-show patterns in analytics before changing deposit rules.",
    ],
    related: ["Services", "Staff", "Reminders", "Feedback"],
  },
  {
    id: "campaigns-rewards",
    category: "Campaigns",
    title: "Campaigns, rewards, and win-back messages",
    summary: "Send customer follow-up that is connected to real activity and measurable results.",
    overview:
      "Campaigns and rewards are for careful follow-up, not blasting every customer. BRC helps connect messages to customer activity such as orders, bookings, reward claims, feedback, review moments, lapsed visits, and repeat-customer opportunities.",
    steps: [
      "Choose the audience carefully, such as recent visitors, lapsed customers, reward claimants, or booking customers.",
      "Write a clear offer with terms, expiry, and any restrictions.",
    "Use email campaigns and review SMS prompts only where you have the right permission and an opt-out path.",
      "Track code usage, replies, review lift, repeat activity, and customer recovery outcomes.",
      "Avoid sending too frequently; owner trust and customer trust both depend on restraint.",
    ],
    details: [
      "Campaign records can include offer names, recipients, message channels, delivery state, redemption state, and linked customer history.",
      "Rewards can be used after feedback, review requests, staff QR sessions, or specific customer journeys depending on configuration.",
      "Consent and contact availability decide whether email campaigns or review SMS prompts are appropriate.",
      "Good campaign reporting looks at redemption, repeat activity, customer recovery, and long-term reputation impact.",
    ],
    tips: [
      "Write offers with plain terms: amount, expiry, exclusions, and redemption method.",
      "Segment by useful behaviour instead of sending the same message to everyone.",
      "Pause campaigns if staff cannot handle the extra demand.",
    ],
    related: ["Rewards", "Customer consent", "SMS", "Email", "Analytics"],
  },
  {
    id: "analytics",
    category: "Analytics",
    title: "Understanding analytics and owner digests",
    summary: "Use reporting to see what is working across reviews, feedback, orders, bookings, campaigns, and teams.",
    overview:
      "Analytics turns customer operations into owner-level decisions. BRC brings together reputation, feedback, orders, bookings, campaigns, rewards, staff attribution, and location signals so the business can see what is improving and what needs attention.",
    steps: [
      "Start with trend direction rather than a single day: review rating, review volume, feedback sentiment, repeat customers, and campaign response.",
      "Compare customer actions with business outcomes, such as order lift after a campaign or review lift after follow-up.",
      "Use item, service, staff, and location insights to spot operational issues.",
      "Treat AI summaries as a fast briefing, then check the underlying records before making important decisions.",
      "Enable owner digests for a regular summary of what needs attention.",
    ],
    details: [
      "Useful signals include review movement, feedback themes, low-rating reasons, popular items, booking demand, campaign redemptions, repeat customers, and unresolved recovery cases.",
      "Owner digests are designed to reduce dashboard checking while still surfacing meaningful changes.",
      "Multi-location teams should compare trends carefully; one location may have different volume, staffing, hours, or customer expectations.",
      "AI summaries help with scanning, but the source records remain the authority.",
    ],
    tips: [
      "Look for repeated patterns before changing operations.",
      "Combine quantitative metrics with customer comments.",
      "Share simple weekly summaries with managers so insights turn into action.",
    ],
    related: ["Dashboard", "Owner digest", "Reviews", "Campaigns"],
  },
  {
    id: "team-roles",
    category: "Admin",
    title: "Team roles and permissions",
    summary: "Give each team member the right access without exposing unnecessary data or controls.",
    overview:
      "Permissions protect the business and make the console easier to use. Owners should keep financial and sensitive controls tight while giving managers and staff the workflows they need for the day.",
    steps: [
      "Owners should manage billing, modules, verification, sensitive settings, and full reporting.",
      "Managers can handle daily operations, replies, orders, bookings, campaigns, and customer recovery.",
      "Staff should only access the workflows needed for their role, such as orders, bookings, or support queues.",
      "Remove access promptly when a staff member leaves or changes role.",
      "Review permissions regularly, especially before adding new locations or modules.",
    ],
    details: [
      "Staff records can support roles, invitations, locations, capabilities, and workflow-specific access.",
      "Sensitive areas include billing, subscription management, business verification, public page identity, customer exports, and admin overrides.",
      "For multi-location operations, location-specific access keeps staff focused and reduces accidental changes.",
      "Role reviews are especially important after seasonal staffing changes.",
    ],
    tips: [
      "Use shared operational roles sparingly; named users are easier to audit.",
      "Do not give billing access to staff who only need orders or bookings.",
      "Check notification preferences when changing someone’s role.",
    ],
    related: ["Staff", "Locations", "Billing", "Security"],
  },
  {
    id: "staff-training",
    category: "Admin",
    title: "Staff training area",
    summary: "Use the staff training area to keep onboarding, daily workflows, and operating standards visible to the team.",
    overview:
      "The staff training area gives operators a shared place for practical team guidance: how to use service screens, where manager approvals are needed, what to check before a shift, and how staff should handle customer workflows without exposing owner-only controls.",
    steps: [
      "Open the staff training area from the team or operations workspace.",
      "Review training items for the workflows the staff member will use, such as orders, bookings, register actions, feedback, table service, or closeout support.",
      "Pair training with role permissions so staff can practise only the screens they are allowed to use.",
      "Use manager notes and operating standards to explain when a staff member should escalate rather than force an action.",
      "Update training whenever modules, policies, devices, table layouts, or service procedures change.",
    ],
    details: [
      "Training works best when it is specific to the business workflow rather than a generic product manual.",
      "Sensitive actions such as refunds, discounts, manager PIN overrides, billing, finance, and public page publishing should remain role-gated.",
      "New staff should be walked through live order, booking, feedback, and table scenarios before customer-facing service.",
      "Training should be reviewed after rota, payroll, permissions, or closeout processes change.",
    ],
    tips: [
      "Keep the first training pass focused on the screens used during a normal shift.",
      "Review permissions immediately after training so access matches responsibility.",
      "Use the staff training area as part of onboarding and seasonal refreshers.",
    ],
    related: ["Team roles", "Rota", "Payroll", "Manager controls"],
  },
  {
    id: "billing",
    category: "Billing",
    title: "Plans, billing, trials, and cancellation",
    summary: "Understand plan access, renewals, review SMS credits, add-ons, and cancellation behaviour.",
    overview:
      "Billing controls which modules and limits are available to the business. Trial state, subscription status, billing provider, plan level, renewal timing, add-ons, and payment health can all affect access.",
    steps: [
      "Plan access depends on the selected subscription, billing period, modules, usage limits, and add-ons.",
      "Trials may convert to paid access unless cancelled before the renewal or conversion date.",
      "Cancelling stops future renewals but does not automatically refund the current billing period.",
      "Review SMS credits, add-ons, overages, and setup charges may be separate from the base plan.",
      "If payment fails or is disputed, paid features can be restricted until billing is resolved.",
    ],
    details: [
      "Growth, Pro, Enterprise, or custom arrangements can expose different feature sets, usage levels, locations, onboarding options, and support levels.",
      "Some features can show upgrade gates when the business is not subscribed, expired, suspended, or outside plan limits.",
      "Billing emails and account notices should be watched by an owner or finance contact.",
      "For app-store or external billing providers, cancellation and refund handling can depend on that provider’s terms.",
    ],
    tips: [
      "Review plan access before relying on a module for a live launch.",
      "Keep billing owner contact details current.",
      "Contact support before a major migration or multi-location rollout if plan limits are unclear.",
    ],
    related: ["Plans", "Trials", "Review SMS credits", "Upgrade gates"],
  },
  {
    id: "catalog-menu",
    category: "Catalog",
    title: "Catalog, menu, services, variants, and bundles",
    summary: "Build or import the items customers see, including categories, prices, images, variants, modifiers, bundles, allergens, labels, and availability.",
    overview:
      "The catalog is the source of truth for customer ordering, public menu browsing, pickup, table ordering, and many reporting views. AI catalogue setup can draft menu items, prices, variations, modifiers, options, and descriptions from clear photos or PDFs so the team does not have to upload the menu one item at a time. For service businesses, the same setup discipline applies to service lists, durations, prices, and availability.",
    steps: [
      "Start by uploading a clear menu photo or PDF when available, then review the AI-generated draft before publishing anything.",
      "Create or confirm clear categories so customers can scan the menu or service list quickly.",
      "Add each item with a short name, useful description, price, image, SKU if needed, and availability state.",
      "Use variants and modifiers for size, style, add-ons, toppings, sides, removals, or option changes that alter price or inventory.",
      "Use bundles when one sellable item is made from multiple catalog items, such as meal deals, sets, packages, or grouped services.",
      "Add allergens, labels, hidden states, stock tracking, and sort order before publishing the public page.",
    ],
    details: [
      "AI-imported catalogue drafts should be checked carefully for prices, spelling, variants, modifiers, allergens, tax, and availability before they go live.",
      "Categories help organise public browsing and internal reporting.",
      "Variants are best for customer choices attached to one item, while bundles are best for grouped offers or packages.",
      "Allergen and dietary information should be kept accurate and reviewed when recipes, suppliers, or preparation methods change.",
      "Hidden items can stay in the back office without appearing publicly, while unavailable items can remain visible but not orderable if the workflow supports it.",
      "Inventory tracking is useful only when staff update stock consistently; stale stock data can create customer disappointment.",
    ],
    tips: [
      "Keep mobile item names compact and put detail in the description.",
      "Review prices, allergens, and bundle contents before every major menu change.",
      "Use images for high-value or hard-to-describe items, not as decoration.",
    ],
    related: ["Ordering", "Public page", "Inventory", "Allergens"],
  },
  {
    id: "inventory-availability",
    category: "Catalog",
    title: "Inventory, stock, hidden items, and availability",
    summary: "Control what customers can order and what staff can sell when stock, service capacity, or item readiness changes.",
    overview:
      "Availability controls protect the customer experience. BRC lets teams separate items that are visible, hidden, available, unavailable, or stock-tracked so customers do not order something the business cannot fulfil.",
    steps: [
      "Decide which items should be public, hidden, temporarily unavailable, or fully removed.",
      "Turn on stock tracking only for items where staff can keep quantities current.",
      "Set inventory quantities before busy service periods and update them when stock is received or sold out.",
      "Use hidden states for draft items, seasonal items, discontinued products, or internal-only records.",
      "Check the public Go page after changing availability so customer-facing behaviour matches your expectation.",
    ],
    details: [
      "Unavailable items can reduce confusion when customers recognise a product but it is temporarily out of stock.",
      "Hidden items are better for draft setup, old products, internal bundles, or items that should not appear publicly.",
      "Stock tracking can support operational discipline, but it should not replace human checks for perishable or fast-moving goods.",
      "Service availability may depend on staff, resources, business hours, buffers, and booking capacity rather than physical stock.",
    ],
    tips: [
      "Create an opening checklist for stock and availability.",
      "Avoid deleting historical items if you need reporting continuity.",
      "Use clear staff ownership for stock updates during service.",
    ],
    related: ["Catalog", "Ordering", "Bookings", "Analytics"],
  },
  {
    id: "tables-qr",
    category: "Tables",
    title: "Tables, areas, and table QR codes",
    summary: "Create dine-in tables, organise areas, print QR codes, and connect customer sessions to table context.",
    overview:
      "Tables let restaurants and venues connect a customer's scan to a physical table or area. This helps staff understand where an order came from, which table needs attention, and how feedback relates to the dine-in experience.",
    steps: [
      "Create each table with a clear label, area, seat count, and active state.",
      "Generate or print the table-specific QR code and test it with a phone before placing it in the venue.",
      "Confirm the customer flow shows the correct table context and order mode.",
      "Train staff to check table labels, notes, payment state, and order status before preparing or delivering items.",
      "Deactivate or replace QR codes when tables are renamed, removed, or rearranged.",
    ],
    details: [
      "Table QR codes are most useful when the code is specific to one physical location.",
      "Areas help organise larger venues, outdoor seating, rooms, bars, or event spaces.",
      "Seat count helps reporting and staff context, but should not be treated as a legal capacity system.",
      "Table orders can feed feedback, review requests, rewards, staff attribution, and item-level insight.",
    ],
    tips: [
      "Print QR codes with enough contrast and test them in venue lighting.",
      "Use table labels staff already recognise.",
      "Keep spare printed codes for replacements.",
    ],
    related: ["Ordering", "Kitchen display", "Feedback", "Public page"],
  },
  {
    id: "kitchen-display",
    category: "Operations",
    title: "Kitchen display and live order operations",
    summary: "Manage submitted, accepted, ready, completed, cancelled, and refunded orders from a live operations view.",
    overview:
      "The operations and kitchen views help staff move orders from customer submission through preparation and completion. They are designed for repeated daily use, quick scanning, and clear status changes.",
    steps: [
      "Open Operations when service starts and keep the live order view visible for the active team.",
      "Review new orders for customer name, contact details, table, pickup time, delivery address, payment state, item lines, modifiers, and notes.",
      "Move orders through accepted, ready, completed, cancelled, or refunded states as the work changes.",
      "Use the kitchen-focused view when preparation staff only need item, note, timing, and status context.",
      "Review history after service to handle refunds, customer questions, reporting, or recovery follow-up.",
    ],
    details: [
      "Live order statuses keep front-of-house, kitchen, and managers aligned.",
      "Order lines can include item snapshots, variants, modifiers, quantities, notes, prices, table context, pickup details, and delivery details.",
      "Payment status should be checked before handing over paid orders or issuing refunds.",
      "Completed, cancelled, and refunded orders can still matter for customer support, analytics, feedback, and campaign segmentation.",
    ],
    tips: [
      "Use one shared status language across the team.",
      "Do not mark an order completed until the customer handoff or delivery state is genuinely complete.",
      "Keep order notes short, practical, and visible to the people preparing the order.",
    ],
    related: ["Ordering", "Delivery", "Tables", "Finance"],
  },
  {
    id: "delivery-dispatch",
    category: "Delivery",
    title: "Delivery settings, dispatch, providers, and own drivers",
    summary: "Configure delivery as an order mode, set fees and radius rules, capture addresses, and track dispatch status.",
    overview:
      "Delivery in BRC is part of the owned customer journey. It connects public checkout, address capture, delivery rules, fees, provider or own-driver fulfilment, order status, tracking, feedback, and reporting.",
    steps: [
      "Enable delivery as an order mode only when the business is ready to fulfil it.",
      "Set delivery fee, delivery radius, country code, provider settings, pickup instructions, and fallback behaviour.",
      "Confirm the Go checkout collects customer address, postcode, phone, delivery notes, and unavailable-address messaging.",
      "Choose fulfilment type: own driver, provider, or an unassigned state until staff decide.",
      "Track dispatch, driver assignment, pickup, delivered, failed, and cancelled states from the order record.",
    ],
    details: [
      "Own-driver delivery can use fixed fees, driver member assignment, driver name, driver phone, and internal dispatch notes.",
      "Provider delivery can store provider name, quote ID, provider order ID, tracking URL, and provider-specific status.",
      "Delivery address and notes should be visible to staff before acceptance so they can spot issues early.",
      "Delivery orders can trigger the same feedback, review, reward, CRM, and campaign workflows as pickup or dine-in orders.",
    ],
    tips: [
      "Test address entry and unavailable-address behaviour before publishing delivery.",
      "Keep pickup instructions practical for drivers and providers.",
      "Pause delivery if staff cannot fulfil it reliably during peak service.",
    ],
    related: ["Ordering", "Finance", "Operations", "Public page"],
  },
  {
    id: "pickup",
    category: "Ordering",
    title: "Pickup and collection workflows",
    summary: "Let customers order ahead for collection while staff manage preparation times, notes, payment, and handoff.",
    overview:
      "Pickup is often the simplest owned ordering workflow. It still needs clear preparation expectations, customer contact details, payment readiness, and a staff process for accepting, preparing, and completing orders.",
    steps: [
      "Enable pickup on the public page and confirm the catalog or menu is ready.",
      "Set preparation expectations and any customer-facing collection instructions.",
      "Check that checkout collects name, contact details, notes, requested pickup time where supported, and payment state.",
      "Use Operations to accept orders, mark them ready, and complete them at handoff.",
      "Use completed pickup orders for feedback, rewards, review requests, and win-back campaigns.",
    ],
    details: [
      "Pickup should stay separate from delivery and table ordering so staff know exactly how to fulfil the order.",
      "Customer notes can carry allergies, preferences, substitutions, or collection instructions, but staff should verify important details.",
      "Payment can be online, counter, cash, card, or another configured method depending on business setup.",
      "Missed or late pickup orders should be reviewed as operational signals.",
    ],
    tips: [
      "Make collection instructions visible and short.",
      "Check peak-time preparation promises against actual kitchen capacity.",
      "Do not ask for more customer information than staff need.",
    ],
    related: ["Ordering", "Kitchen display", "Campaigns", "Feedback"],
  },
  {
    id: "finance-payouts",
    category: "Finance",
    title: "Finance, payouts, fees, and payment readiness",
    summary: "Understand payment verification, transactions, payout status, platform fees, and finance permissions.",
    overview:
      "Finance helps owners understand payment readiness and money movement. Paid ordering and paid bookings may require verification with a payment provider before customers can pay online.",
    steps: [
      "Open Finance before launching paid orders, deposits, or paid booking services.",
      "Complete any payment-provider verification checks requested for the business.",
      "Review connected account status, payment readiness, combined platform fee, transaction records, and payout state.",
      "Make sure owners or authorised finance users understand refunds, disputes, and payout timing.",
      "Check Finance if paid workflows are blocked, warnings appear, or customer checkout does not allow payment.",
    ],
    details: [
      "BRC can show a combined platform fee that includes payment processing and the BRC platform fee where configured.",
      "Customers may see one checkout amount while the business reviews fees and payout information internally.",
      "Paid services and deposits may be blocked until verification is complete.",
      "Finance access should be limited to owners or trusted managers because it includes sensitive business information.",
    ],
    tips: [
      "Complete payment checks before announcing online ordering or paid bookings.",
      "Keep the legal business name and bank details accurate.",
      "Review failed or disputed payments before contacting the customer.",
    ],
    related: ["Billing", "Ordering", "Bookings", "Refunds"],
  },
  {
    id: "refunds-disputes",
    category: "Finance",
    title: "Refunds, cancellations, disputes, and customer issues",
    summary: "Handle payment and fulfilment problems cleanly across orders, bookings, delivery, and customer support.",
    overview:
      "Refund and dispute handling sits between operations, finance, and customer recovery. The goal is to keep records accurate, respond clearly, and avoid changing payment state without understanding the order or booking context.",
    steps: [
      "Open the order, booking, or transaction record and review status, payment state, customer details, notes, and fulfilment history.",
      "Decide whether the issue is operational, payment-related, customer-service related, or a platform/provider issue.",
      "Update order or booking status only when it reflects what actually happened.",
      "Use support or customer messages to explain the next step and keep a record.",
      "Review Finance for refund, payout, fee, or dispute implications.",
    ],
    details: [
      "Cancelled and refunded are different states and should not be used interchangeably.",
      "Delivery failures may involve provider state, own-driver state, customer address issues, or preparation delays.",
      "Booking deposits and cancellation terms should match the customer-facing policy shown before booking.",
      "Chargebacks or disputes may require evidence from orders, bookings, messages, receipts, and fulfilment timestamps.",
    ],
    tips: [
      "Write customer replies in plain language and avoid blaming internal systems.",
      "Keep screenshots, receipts, and timestamps attached where useful.",
      "Review repeat refund reasons in analytics.",
    ],
    related: ["Finance", "Support", "Delivery", "Bookings"],
  },
  {
    id: "locations",
    category: "Admin",
    title: "Locations and multi-location management",
    summary: "Manage business locations, local settings, staff access, reporting context, and rollout discipline.",
    overview:
      "Location management helps teams keep settings, staff access, reputation signals, and operational reporting organised when a business has more than one venue, branch, service area, or operating site.",
    steps: [
      "Create or review each location with the correct name, address, contact details, and public context.",
      "Assign staff and managers to the locations they actually operate.",
      "Check location-specific review channels, competitors, opening hours, delivery rules, and public-page expectations.",
      "Compare performance by location carefully, accounting for volume, staffing, service type, and local customer behaviour.",
      "Roll out new modules one location at a time when the operational risk is high.",
    ],
    details: [
      "Locations can affect permissions, reporting, public signals, customer expectations, and operational routing.",
      "Multi-location reputation work should separate local issues from brand-wide patterns.",
      "Campaigns should avoid mixing audiences when offers, opening hours, or fulfilment differ by location.",
      "Billing, support level, feature limits, and plan access may differ for larger location counts.",
    ],
    tips: [
      "Use consistent naming so reports are easy to scan.",
      "Pilot complex workflows at one location before a wider launch.",
      "Give local managers access to the workflows they can act on.",
    ],
    related: ["Team roles", "Analytics", "Competitors", "Public page"],
  },
  {
    id: "review-channels",
    category: "Reputation",
    title: "Review channels and public reputation sources",
    summary: "Connect and manage Google, Yelp, TripAdvisor, and other review destinations where available.",
    overview:
      "Review channels help BRC organise the public places customers use to judge the business. Keeping channels current makes review monitoring, reply workflows, public signals, and review-building campaigns more useful.",
    steps: [
      "Add the business's public review links or connected profiles where supported.",
      "Confirm the channel points to the correct location, brand, and public listing.",
      "Review new public feedback from the inbox or reputation workflow.",
      "Use reply drafts carefully and have a human approve anything posted publicly.",
      "Update channels when a business moves, rebrands, adds locations, or changes review destinations.",
    ],
    details: [
      "Review channels may include Google Maps, Yelp, TripAdvisor, or other public reputation sources depending on the business.",
      "Third-party platforms control profile availability, review visibility, reply permissions, and removal decisions.",
      "BRC can help monitor, organise, summarise, and prepare replies or disputes, but it does not control external platforms.",
      "Correct channel setup improves analytics and reduces confusion when multiple locations have similar names.",
    ],
    tips: [
      "Check review links from a customer device, not only from an admin browser.",
      "Keep public replies short, specific, and professional.",
      "Do not connect a competitor or old listing by mistake.",
    ],
    related: ["Positive reviews", "Fake review disputes", "Competitors", "Analytics"],
  },
  {
    id: "competitors",
    category: "Insights",
    title: "Competitors and public signal tracking",
    summary: "Track nearby or relevant competitors so owners understand local reputation movement and market context.",
    overview:
      "Competitor tracking gives owners context for reputation and customer operations. It helps compare public ratings, review movement, local signals, and risks that may not be obvious from internal data alone.",
    steps: [
      "Add competitors manually or use suggested competitors where available.",
      "Check each competitor for the correct public listing, location, and business type.",
      "Refresh or review competitor rating movement as part of owner reporting.",
      "Compare trends rather than obsessing over one review or one day's movement.",
      "Use competitor context to improve operations, positioning, and review response quality.",
    ],
    details: [
      "Suggested competitors are a starting point and should be reviewed by a human.",
      "Competitor data can be affected by public listing quality, platform changes, name similarity, and location ambiguity.",
      "The goal is not copying competitors; it is understanding the local standard customers are comparing you against.",
      "Competitor insights can support reputation strategy, campaign timing, and owner digest context.",
    ],
    tips: [
      "Track a small set of relevant competitors instead of every nearby business.",
      "Refresh context before making strategic decisions.",
      "Use competitor movement as a prompt for investigation, not a final conclusion.",
    ],
    related: ["Analytics", "Review channels", "Owner digest", "Locations"],
  },
  {
    id: "crm-customers",
    category: "CRM",
    title: "Customer records, CRM, consent, and message history",
    summary: "Understand customer profiles, contact details, consent state, order history, bookings, feedback, campaigns, and conversations.",
    overview:
      "Customer records connect activity across BRC. A customer may have orders, bookings, feedback, rewards, campaigns, support messages, consent preferences, and contact details that help the business respond with context.",
    steps: [
      "Use customer records to understand the history behind feedback, review requests, orders, bookings, and campaign responses.",
      "Check consent and contact availability before sending marketing messages.",
      "Keep customer replies, support context, and operational notes factual and useful.",
      "Use segments carefully when building campaigns or win-back messages.",
      "Respect privacy rights and remove or correct data where legally required.",
    ],
    details: [
      "Customer records may include name, email, phone, order history, booking history, feedback, reward state, message threads, and communication preferences.",
      "Transactional messages and marketing messages can have different legal requirements.",
      "Consent-aware communication protects both the customer and the business.",
      "CRM context is useful for recovery because staff can see what happened before replying.",
    ],
    tips: [
      "Do not use customer records as a dumping ground for sensitive notes.",
      "Keep segmentation tied to real customer behaviour.",
      "Review unsubscribe and consent state before sending campaigns.",
    ],
    related: ["Campaigns", "Feedback", "Security", "Support"],
  },
  {
    id: "staff-services",
    category: "Bookings",
    title: "Staff, services, resources, deposits, and booking capacity",
    summary: "Set up service-led workflows for salons, spas, clinics, gyms, classes, appointments, and reservations.",
    overview:
      "Booking quality depends on accurate service and staff setup. BRC can support services, duration, price, deposits, resources, capacity, buffers, business hours, and auto-confirm rules so customers can book without creating chaos for the team.",
    steps: [
      "Create each service with a clear name, duration, price, deposit requirement, capacity, and description.",
      "Assign staff, resources, rooms, tables, or capacity rules where needed.",
      "Add buffers for preparation, cleanup, travel, handover, or consultation time.",
      "Choose auto-confirm for simple workflows and manual confirmation for complex or high-risk bookings.",
      "Test booking submission, reminder messaging, staff visibility, and post-booking feedback.",
    ],
    details: [
      "Deposits and paid services may require Finance verification before they can be used live.",
      "Capacity can represent seats, spaces, equipment, rooms, staff availability, or class limits depending on the business.",
      "Buffers reduce back-to-back scheduling problems but can reduce available slots.",
      "Customer notes should ask for useful information without collecting unnecessary sensitive details.",
    ],
    tips: [
      "Use different services for materially different durations or prices.",
      "Keep deposit and cancellation wording simple.",
      "Review booking analytics before changing capacity rules.",
    ],
    related: ["Bookings", "Finance", "Notifications", "Feedback"],
  },
  {
    id: "owner-digest",
    category: "Analytics",
    title: "Owner digest and recurring summaries",
    summary: "Receive regular summaries of reputation, feedback, orders, bookings, campaigns, billing, and support work.",
    overview:
      "Owner digest is for leaders who need the truth without living inside the console all day. It summarises meaningful changes, open work, and trends that deserve attention.",
    steps: [
      "Choose who should receive owner summaries and confirm their contact details.",
      "Decide which operational areas matter most: reputation, feedback, orders, bookings, campaigns, support, billing, or public signals.",
      "Use the digest as a starting point, then open the source records for any important decision.",
      "Share digest themes with managers in weekly operating reviews.",
      "Adjust notification and digest settings when roles, locations, or modules change.",
    ],
    details: [
      "Digest content can include review movement, unresolved feedback, order or booking trends, campaign outcomes, support updates, billing warnings, and public signal context.",
      "A digest is not a replacement for live operational queues during service.",
      "Summaries are most useful when the business has clean setup, current staff roles, and accurate modules.",
      "AI or automated summaries should be reviewed against source records before major action.",
    ],
    tips: [
      "Use digests for management rhythm, not emergency response.",
      "Keep recipients limited to people who can act on the information.",
      "Turn repeated digest warnings into process improvements.",
    ],
    related: ["Dashboard", "Analytics", "Notifications", "Competitors"],
  },
  {
    id: "upgrade-gates",
    category: "Billing",
    title: "Upgrade gates, modules, trials, and feature access",
    summary: "Understand why a feature may be locked, hidden, expired, suspended, or waiting for setup.",
    overview:
      "Feature access in BRC can depend on plan, trial state, subscription status, business type, enabled modules, verification, payment readiness, role permissions, or account restrictions. A locked feature is not always a bug.",
    steps: [
      "Check whether the business has an active trial or subscription.",
      "Review the plan level and whether the specific module is included.",
      "Confirm the user's role has permission to access the workflow.",
      "Check setup requirements such as Finance verification, public page readiness, delivery settings, or review channel setup.",
      "Contact support if a feature should be available but remains locked after setup checks.",
    ],
    details: [
      "Upgrade gates can appear for campaigns, advanced analytics, menu insights, white-label public pages, custom domains, multi-location features, or higher usage levels.",
      "Expired, suspended, blocked, or unpaid accounts can lose access to paid workflows.",
      "Business type modules decide whether catalog, services, tables, pickup, delivery, bookings, or rewards are relevant.",
      "Role permissions can hide owner-only settings from managers and staff.",
    ],
    tips: [
      "Check account state before troubleshooting a feature deeply.",
      "Document which plan a customer is on before opening support.",
      "Avoid promising a workflow to customers until the gate is cleared.",
    ],
    related: ["Billing", "Team roles", "Public page", "Support"],
  },
  {
    id: "business-verification",
    category: "Admin",
    title: "Business verification, suspension, and blocked accounts",
    summary: "Understand verification status, proof uploads, account notices, and restrictions on suspended or blocked businesses.",
    overview:
      "Verification and account trust controls protect customers, businesses, and the platform. Some workflows may require proof that the business is legitimate or that billing, payment, and public identity details are accurate.",
    steps: [
      "Review verification status from settings or account notices.",
      "Upload requested proof clearly, using a file name and document that support the business identity.",
      "Check verification notes if a request is pending, rejected, or needs more information.",
      "Resolve suspension or blocked-account notices before relying on customer-facing workflows.",
      "Contact support from the signed-in console if the business cannot operate normally.",
    ],
    details: [
      "Verification states can include unverified, pending, verified, or rejected.",
      "Suspended or blocked businesses may see notices explaining the reason or next step.",
      "Payment verification and business verification are related but not always the same process.",
      "Accurate business name, address, contact details, website, review links, and public page identity help verification.",
    ],
    tips: [
      "Use current documents that match the business profile.",
      "Do not create duplicate accounts to bypass restrictions.",
      "Keep support tickets focused on the specific verification issue.",
    ],
    related: ["Finance", "Billing", "Support", "Public page"],
  },
  {
    id: "local-hub",
    category: "Local hub",
    title: "Local Hub for on-premise operations",
    summary: "Use BRC Local Hub to coordinate supported in-store devices, hardware discovery, and local network workflows.",
    overview:
      "BRC Local Hub is the on-premise bridge for operators who want browser, tablet, display, and hardware workflows to work together on the local network. It is designed for venues that run counter, kitchen, manager, customer display, and hardware-adjacent screens during service and need a local coordination point alongside the cloud console.",
    steps: [
      "Choose the device that will run Local Hub during service, such as a back-office computer, manager laptop, or supported always-on workstation.",
      "Connect the hub device to the same trusted local network as the screens and hardware you want BRC to discover or coordinate.",
      "Start Local Hub before service and confirm the console shows the hub as reachable for the business or location.",
      "Open the relevant BRC screens: register, POS surface, kitchen display, customer display, manager closeout, offline sync, or device settings.",
      "Run a discovery check, assign friendly names to devices, and confirm which workflows should use each discovered endpoint.",
    ],
    details: [
      "Local Hub complements the BRC cloud service; it does not replace account login, billing, payments, review sync, messaging, or cloud reporting.",
      "The strongest Local Hub use cases are local device discovery, hardware visibility, screen coordination, and service resilience when the venue has several operator screens.",
      "The hub device should stay awake, connected to power, and on the same network segment as the devices it needs to discover.",
      "Firewalls, guest Wi-Fi isolation, VPNs, captive portals, and router client-isolation settings can prevent discovery even when the internet connection works.",
      "Use location-specific naming for hubs and devices so managers can tell which register, kitchen screen, display, or workstation they are looking at.",
    ],
    tips: [
      "Run Local Hub on a stable device, not a staff phone that may leave the premises.",
      "Keep guest Wi-Fi separate from the trusted operations network.",
      "Do a quick discovery check before each busy service period if hardware is business-critical.",
    ],
    related: ["Hardware discovery", "Offline sync", "POS", "Customer display", "Kitchen display"],
  },
  {
    id: "offline-sync",
    category: "Local hub",
    title: "Offline sync and queued local actions",
    summary: "Understand which actions can be queued locally, how sync resumes, and what staff should check after connectivity returns.",
    overview:
      "Offline sync helps supported BRC workflows survive patchy Wi-Fi, temporary internet drops, or short service interruptions. The goal is to keep selected operational actions captured locally, show staff what is waiting, and sync those actions back when the device or hub can reach BRC again.",
    steps: [
      "Confirm the business has offline-ready workflows enabled for the relevant screens, such as register controls, order status changes, or selected operational updates.",
      "Train staff to watch the offline sync strip or status view when the connection changes.",
      "Continue only with supported offline actions and avoid workflows that clearly require live providers, such as online payments, messaging, review sync, or external delivery quotes.",
      "When connectivity returns, open Offline Sync and review queued, syncing, completed, and failed actions.",
      "Resolve conflicts or failed sync items before closeout so managers know which records reached the cloud system.",
    ],
    details: [
      "Offline sync is scoped; it is not a promise that every feature works without internet.",
      "Payment providers, bank checks, subscription state, SMS, email, review platforms, map services, delivery providers, and AI workflows may require a live connection.",
      "Queued actions should keep enough context for managers to understand the screen, user, location, and time involved.",
      "If two devices change the same record while offline, the final cloud state may need human review.",
      "Closeout is the right moment to check that local actions have synced and no failed queue items need attention.",
    ],
    tips: [
      "Keep a manager responsible for sync review during any known outage.",
      "Do not repeatedly retry payments or provider actions unless the payment provider confirms the state.",
      "Document the start and end time of a serious outage in manager notes.",
    ],
    related: ["Local Hub", "Register controls", "Manager closeout", "Finance", "Support"],
  },
  {
    id: "hardware-discovery",
    category: "Local hub",
    title: "Hardware discovery and device setup",
    summary: "Find supported local devices, name them clearly, assign workflows, and troubleshoot discovery problems.",
    overview:
      "Hardware discovery helps BRC find supported devices and screens on the local network so operators can attach them to practical workflows: register stations, kitchen displays, customer displays, local peripherals, and service devices. Discovery works best when the network is simple, trusted, and prepared before service.",
    steps: [
      "Put the hub device and supported hardware on the same trusted operations network.",
      "Power on the devices you want BRC to discover and wait for them to join the network fully.",
      "Open device and printer settings or the relevant hardware discovery screen in the console.",
      "Run discovery, then assign a clear name such as Front Register 1, Kitchen Screen, Bar Display, or Manager Laptop.",
      "Test the workflow that will use the device before relying on it with customers.",
      "If discovery fails, check network isolation, firewall prompts, VPN state, device sleep mode, and whether the hardware is on guest Wi-Fi.",
    ],
    details: [
      "Discovery depends on local network visibility; guest networks and client isolation commonly block it.",
      "A device being online does not always mean it is discoverable by local services.",
      "Friendly names matter because staff need to choose the right endpoint quickly during service.",
      "Discovery should be tested after router changes, device replacements, operating-system updates, and venue network changes.",
      "Some hardware may still require vendor drivers, firmware updates, pairing steps, or manual configuration outside BRC.",
    ],
    tips: [
      "Label physical devices with the same names used in BRC.",
      "Avoid changing router settings right before a busy shift.",
      "Keep a simple network diagram for venues with multiple registers or screens.",
    ],
    related: ["Local Hub", "Offline sync", "POS", "Tables", "Support"],
  },
  {
    id: "public-page",
    category: "Public page",
    title: "Configuring the public Go page",
    summary: "Control the branded customer page for ordering, bookings, feedback, rewards, and business information.",
    overview:
      "The public Go page is the customer-facing layer of BRC. It should look like the business, explain what customers can do, and only show workflows that are actually ready.",
    steps: [
      "Upload a clear logo, hero image, and short business description.",
      "Check address, contact details, opening hours, order modes, booking availability, delivery settings, and customer terms.",
      "Choose which modules appear publicly: catalog, ordering, pickup, delivery, tables, bookings, services, rewards, and feedback.",
      "Review consent wording, privacy links, refund terms, cancellation wording, allergen notices, and any required customer disclosures.",
      "Open the page on mobile and desktop before sharing links, QR codes, or custom domains.",
    ],
    details: [
      "Public slugs and custom domains affect how customers reach the page.",
      "Hidden, unavailable, or incomplete catalog items should not appear to customers.",
      "Payment readiness warnings should be resolved before asking customers to pay online.",
      "The public page should stay accurate when menus, prices, staff hours, delivery areas, or services change.",
    ],
    tips: [
      "Use plain, specific copy instead of marketing filler.",
      "Preview customer flows after every major settings change.",
      "Keep legal and allergen information visible where customers make decisions.",
    ],
    related: ["Ordering", "Bookings", "Catalog", "Custom domains"],
  },
  {
    id: "notifications",
    category: "Admin",
    title: "Notifications and owner digest",
    summary: "Choose which alerts your team receives for reviews, feedback, orders, bookings, campaigns, billing, and support.",
    overview:
      "Notifications keep the right people aware without overwhelming everyone. BRC supports operational alerts for time-sensitive workflows and owner digest summaries for regular management review.",
    steps: [
      "Open notification settings and review each event type.",
      "Enable urgent alerts for workflows that require quick action, such as orders, bookings, low feedback, support replies, billing problems, and review changes.",
      "Decide which users should receive owner digests and how often they should review them.",
      "Test notification delivery after inviting new managers or changing roles.",
      "Turn off alerts that create noise but do not lead to action.",
    ],
    details: [
      "Notification events can include platform announcements, feedback alerts, public reviews, campaign updates, orders, bookings, payouts, support, billing, and owner summaries.",
      "Push, email, and in-app behaviour may vary by platform, permissions, browser settings, and device state.",
      "A missed notification should not be the only control for critical workflows; staff should also check the relevant queue.",
    ],
    tips: [
      "Give one person clear ownership for urgent alerts each shift.",
      "Use owner digests for trends and notifications for tasks.",
      "Review settings after adding new modules.",
    ],
    related: ["Dashboard", "Support", "Orders", "Bookings"],
  },
  {
    id: "security-privacy",
    category: "Admin",
    title: "Security, privacy, and customer data",
    summary: "Handle customer records, consent, staff access, and business settings responsibly.",
    overview:
      "BRC stores operational data that may include customer contact details, order history, booking notes, feedback, support messages, campaign consent, and staff activity. Treat access and messaging rules with care.",
    steps: [
      "Give users the minimum access they need for their role.",
      "Collect only the customer details needed for the workflow.",
      "Use consent-aware email workflows for campaigns and review SMS prompts only for review or feedback follow-up.",
      "Keep business privacy notices, refund terms, delivery terms, booking terms, and consent copy accurate.",
      "Contact support immediately if you believe an account, staff login, or customer record is at risk.",
    ],
    details: [
      "The business is usually responsible for how customer data is collected and used in ordering, bookings, campaigns, and feedback workflows.",
      "BRC provides tools to support lawful operations, but the business must follow applicable privacy, consumer, marketing, and platform rules.",
      "Sensitive notes should only be added when necessary and appropriate.",
      "Remove staff access promptly when someone leaves.",
    ],
    tips: [
      "Avoid putting payment card details or unnecessary sensitive data in notes.",
      "Use role reviews as part of staff onboarding and offboarding.",
      "Keep customer-facing terms aligned with how the business actually operates.",
    ],
    related: ["Privacy Policy", "Terms", "Team roles", "Campaign consent"],
  },
  {
    id: "support",
    category: "Support",
    title: "Getting support",
    summary: "Use the support workflow for account, billing, technical, setup, and product questions.",
    overview:
      "Support is most effective when the request includes the business context, the affected workflow, what happened, and what you expected instead. Signed-in support is best for account-specific issues because it carries more context.",
    steps: [
      "Signed-in users should open support from the BRC console when possible, because it includes account context.",
      "Use the public Contact Us page for sales, partnership, access, or account-recovery questions.",
      "Include the business name, affected workflow, screenshots if useful, customer/order/booking reference if relevant, and what you expected to happen.",
      "Support replies are sent through the same support workflow so your team can track the conversation.",
    ],
    details: [
      "Useful ticket categories include general, verification, billing, campaigns, and technical issues.",
      "Attachments can help with screenshots, PDFs, documents, error messages, customer receipts, or platform evidence.",
      "For urgent operational issues, include the time the problem started, whether customers are affected, and any workaround your team is using.",
      "If the business is suspended or blocked, support can show the relevant account notice and next step.",
    ],
    tips: [
      "Include IDs or links when you have them.",
      "Keep one issue per ticket where possible so each problem can be tracked cleanly.",
      "Reply in the existing ticket instead of opening duplicates.",
    ],
    related: ["Contact", "Billing", "Verification", "Technical issues"],
  },
];

const HELP_SCREENSHOTS_BY_ID = {
  "getting-started": [
    productScreenshot("business profile 1", "BRC business profile setup for first-time configuration"),
    productScreenshot("setup", "BRC setup screen for business onboarding"),
    productScreenshot("setup 2", "BRC setup workflow for configuring modules"),
    productScreenshot("public page 1", "BRC public page setup for customer-facing launch"),
    productScreenshot("staff permissions", "BRC staff permissions during setup"),
  ],
  dashboard: [
    productScreenshot("analytics 1", "BRC dashboard and analytics overview"),
    productScreenshot("operations", "BRC operations workspace for daily work"),
    productScreenshot("review_home", "BRC review home for reputation activity"),
  ],
  "ai-intelligence": FEATURE_SCREENSHOTS["ai-intelligence"],
  "reputation-recovery": [
    productScreenshot("feedback_screen", "BRC private feedback screen for customer recovery"),
    productScreenshot("review_screen", "BRC review detail screen for recovery context"),
    productScreenshot("boost 2", "BRC Boost workflow for follow-up prompts"),
  ],
  "positive-reviews": [
    productScreenshot("review_home", "BRC review home for public reputation work"),
    productScreenshot("review channels", "BRC review channel settings"),
  ],
  "fake-review-disputes": [
    productScreenshot("review_screen", "BRC review detail for suspicious review context"),
    productScreenshot("review channels", "BRC connected review platforms"),
  ],
  ordering: FEATURE_SCREENSHOTS.ordering,
  bookings: FEATURE_SCREENSHOTS.bookings,
  "campaigns-rewards": [
    ...FEATURE_SCREENSHOTS.campaigns,
    productScreenshot("loyality points", "BRC loyalty points reward screen"),
    productScreenshot("gift cards", "BRC gift card reward workflow"),
  ],
  analytics: FEATURE_SCREENSHOTS.analytics,
  "team-roles": [
    productScreenshot("staff permissions", "BRC staff permission settings"),
    productScreenshot("multilocations", "BRC multi-location staff access context"),
    productScreenshot("notifiaction", "BRC notification settings for team alerts"),
  ],
  "staff-training": [
    productScreenshot("staff training", "BRC staff training area"),
    productScreenshot("staff shifts", "BRC staff shifts for daily team workflow"),
    productScreenshot("staff rota", "BRC rota screen for team scheduling"),
    productScreenshot("staff permissions", "BRC permissions connected to staff training"),
  ],
  billing: [
    productScreenshot("finance 1", "BRC finance overview connected to billing context"),
    productScreenshot("finance 8", "BRC finance reporting screen"),
  ],
  "catalog-menu": [
    productScreenshot("catalouge 1", "BRC catalogue setup for menu items"),
    productScreenshot("catalouge 4", "BRC catalogue detail for item setup"),
    productScreenshot("AI 1", "BRC AI support for catalogue setup"),
  ],
  "inventory-availability": FEATURE_SCREENSHOTS.inventory.slice(0, 5),
  "tables-qr": FEATURE_SCREENSHOTS["tables-qr"],
  "kitchen-display": [
    productScreenshot("KDS", "BRC kitchen display system"),
    productScreenshot("Kitchen1", "BRC kitchen ticket screen"),
    productScreenshot("kitchen2", "BRC kitchen workflow screen"),
  ],
  "delivery-dispatch": FEATURE_SCREENSHOTS.delivery,
  pickup: [
    productScreenshot("orders1", "BRC order screen for pickup workflows"),
    productScreenshot("order history", "BRC order history for pickup tracking"),
  ],
  "finance-payouts": FEATURE_SCREENSHOTS.finance,
  "refunds-disputes": [
    productScreenshot("finance 4", "BRC finance detail for refund context"),
    productScreenshot("manager closeout", "BRC manager closeout for exceptions"),
    productScreenshot("review_screen", "BRC review detail for dispute context"),
  ],
  locations: [
    productScreenshot("multilocations", "BRC multi-location settings"),
    productScreenshot("business profile 2", "BRC business profile location context"),
  ],
  "review-channels": [
    productScreenshot("review channels", "BRC review channel settings"),
    productScreenshot("review_home", "BRC review home"),
  ],
  competitors: FEATURE_SCREENSHOTS["market-signals"],
  "crm-customers": [
    productScreenshot("loyality and accounts", "BRC loyalty and customer account context"),
    productScreenshot("House accoutns", "BRC house accounts for customer records"),
    productScreenshot("order history", "BRC customer order history"),
  ],
  "staff-services": [
    ...FEATURE_SCREENSHOTS.bookings,
    productScreenshot("staff permissions", "BRC staff access for service workflows"),
  ],
  "owner-digest": [
    productScreenshot("analytics 5", "BRC analytics trend screen for owner digest"),
    productScreenshot("notifiaction", "BRC notification and owner digest settings"),
  ],
  "upgrade-gates": [
    productScreenshot("business profile 4", "BRC business profile and plan readiness"),
    productScreenshot("finance 6", "BRC finance settings connected to access readiness"),
  ],
  "business-verification": [
    productScreenshot("business profile 3", "BRC business profile verification context"),
    productScreenshot("complaince", "BRC compliance and verification screen"),
  ],
  "local-hub": [
    productScreenshot("devices and printers 1", "BRC devices and printers for local operations"),
    productScreenshot("devices and printers 2", "BRC hardware setup for local workflows"),
    productScreenshot("customer display", "BRC customer display as a local operations screen"),
  ],
  "offline-sync": FEATURE_SCREENSHOTS["register-controls"].slice(0, 1),
  "hardware-discovery": [
    productScreenshot("devices and printers 1", "BRC device discovery settings"),
    productScreenshot("devices and printers 2", "BRC devices and printers setup"),
  ],
  "public-page": [
    productScreenshot("public page 1", "BRC public page settings"),
    productScreenshot("public page 2", "BRC public page setup"),
    productScreenshot("public page 3", "BRC customer-facing page workflow"),
    productScreenshot("public page 4", "BRC public page controls"),
    productScreenshot("public page 5", "BRC public page publishing settings"),
  ],
  notifications: [
    productScreenshot("notifiaction", "BRC notification settings"),
    productScreenshot("review_home", "BRC review alert context"),
  ],
  "security-privacy": [
    productScreenshot("staff permissions", "BRC staff permissions for secure access"),
    productScreenshot("complaince", "BRC compliance screen"),
  ],
  support: [
    productScreenshot("operations", "BRC operations screen context for support requests"),
    productScreenshot("business profile 1", "BRC business profile context for support"),
  ],
};

function MarketingContentPage({ slug, articleId, theme, onToggleTheme, onNavigate }) {
  const normalizedSlug = slug === "api-docs" ? "api" : slug;
  if (normalizedSlug === "help") {
    return (
      <HelpCentrePage
        initialArticleId={articleId}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
      />
    );
  }
  if (normalizedSlug === "pricing") {
    return (
      <PricingDetailsPage
        theme={theme}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
      />
    );
  }
  const page = CONTENT_PAGES[normalizedSlug] || CONTENT_PAGES.help;

  return (
    <div className="content-page">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="legal-page content-page-main">
        <div className="container">
          <div className="legal-header">
            {page.underConstruction ? (
              <div className="section-eyebrow">Under construction</div>
            ) : null}
            <h1 className="legal-title">{page.title}</h1>
            <p className="legal-subtitle">{page.subtitle}</p>
          </div>

          <div className="legal-content">
            {page.sections.map((section) => (
              <section key={section.title} className="legal-section">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.items ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.links ? (
                  <div className="content-link-row">
                    {section.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="btn btn-outline"
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

function HelpCentrePage({ initialArticleId, theme, onToggleTheme, onNavigate }) {
  const [query, setQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("search") || "";
    } catch {
      return "";
    }
  });
  const [activeArticleId, setActiveArticleId] = useState(
    initialArticleId || HELP_ARTICLES[0]?.id || ""
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const normalizedQuery = query.trim().toLowerCase();
  const categories = ["All", ...new Set(HELP_ARTICLES.map((article) => article.category))];
  const quickStats = [
    { label: "Guides", value: HELP_ARTICLES.length },
    { label: "Areas", value: categories.length - 1 },
    { label: "Support", value: "Console + web" },
  ];

  const filteredArticles = HELP_ARTICLES.filter((article) => {
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    const searchable = [
      article.title,
      article.category,
      article.summary,
      article.overview,
      ...(article.steps || []),
      ...(article.details || []),
      ...(article.tips || []),
      ...(article.related || []),
    ]
      .join(" ")
      .toLowerCase();
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  const activeArticle =
    filteredArticles.find((article) => article.id === activeArticleId) ||
    HELP_ARTICLES.find((article) => article.id === initialArticleId) ||
    filteredArticles[0] ||
    HELP_ARTICLES[0];
  const activeArticleScreenshots = HELP_SCREENSHOTS_BY_ID[activeArticle?.id] || [];

  useEffect(() => {
    if (initialArticleId && HELP_ARTICLES.some((article) => article.id === initialArticleId)) {
      setActiveArticleId(initialArticleId);
      setActiveCategory("All");
      setQuery("");
    }
  }, [initialArticleId]);

  return (
    <div className="content-page help-page">
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="legal-page content-page-main">
        <div className="container">
          <header className="help-hero">
            <div>
              <div className="section-tag">Knowledge base</div>
              <h1 className="legal-title">Help Center</h1>
              <p className="legal-subtitle">
                Learn how to set up BRC, run customer workflows, manage reputation,
                publish ordering and booking journeys, understand analytics, and get support.
              </p>
              <div className="help-hero-actions">
                <a href={WEB_APP_URL} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  Open Web App
                </a>
                <a href="/contact" className="btn btn-outline">
                  Contact Support
                </a>
              </div>
            </div>
            <div className="help-hero-card" aria-label="Help center coverage">
              {quickStats.map((stat) => (
                <div key={stat.label} className="help-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </header>

          <section className="help-search-panel">
            <div className="help-search-row">
              <label className="help-search-label" htmlFor="help-search">
                Search help articles
              </label>
              <span>{filteredArticles.length} result{filteredArticles.length === 1 ? "" : "s"}</span>
            </div>
            <div className="help-search-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                id="help-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reputation, ordering, bookings, billing, permissions..."
              />
            </div>
            <div className="help-category-row" aria-label="Help categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`help-category ${activeCategory === category ? "help-category-active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="help-layout">
            <aside className="help-results" aria-label="Help article results">
              <div className="help-results-count">
                Browse articles
              </div>
              {filteredArticles.length ? (
                filteredArticles.map((article) => (
                  <a
                    key={article.id}
                    href={`/help/${article.id}`}
                    className={`help-result ${activeArticle?.id === article.id ? "help-result-active" : ""}`}
                    onClick={() => setActiveArticleId(article.id)}
                  >
                    <span>{article.category}</span>
                    <strong>{article.title}</strong>
                    <small>{article.summary}</small>
                  </a>
                ))
              ) : (
                <div className="help-empty">
                  No articles matched that search. Try a broader term or contact support.
                </div>
              )}
            </aside>

            {activeArticle ? (
              <article className="help-article">
                <div className="help-article-header">
                  <div className="section-eyebrow">{activeArticle.category}</div>
                  <h2>{activeArticle.title}</h2>
                  <p>{activeArticle.summary}</p>
                </div>

                {activeArticle.overview ? (
                  <section className="help-article-section help-overview">
                    <h3>Overview</h3>
                    <p>{activeArticle.overview}</p>
                  </section>
                ) : null}

                <HelpScreenshotStrip screenshots={activeArticleScreenshots} />

                <section className="help-article-section">
                  <h3>How to use it</h3>
                  <ol>
                    {activeArticle.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </section>

                {activeArticle.details?.length ? (
                  <section className="help-article-section">
                    <h3>What to know</h3>
                    <div className="help-detail-grid">
                      {activeArticle.details.map((detail) => (
                        <div key={detail} className="help-detail">
                          <span aria-hidden="true">✓</span>
                          <p>{detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {activeArticle.tips?.length ? (
                  <section className="help-article-section">
                    <h3>Good practice</h3>
                    <ul className="help-tip-list">
                      {activeArticle.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {activeArticle.related?.length ? (
                  <div className="help-related" aria-label="Related topics">
                    {activeArticle.related.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}

                <div className="content-link-row">
                  <a href="/contact" className="btn btn-outline">
                    Contact Support
                  </a>
                  <a href={WEB_APP_URL} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                    Open Web App
                  </a>
                </div>
              </article>
            ) : null}
          </section>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

const FOOTER_COLS = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  },
  {
    heading: "Support",
    links: ["Help Center", "Contact Us", "System Status", "API Docs"],
  },
];

function Footer({ onNavigate }) {
  const handleLinkClick = (link) => {
    if (link === "Terms of Service") {
      onNavigate(PAGES.TERMS);
    } else if (link === "Privacy Policy") {
      onNavigate(PAGES.PRIVACY);
    } else if (link === "Contact Us") {
      onNavigate(PAGES.CONTACT);
    } else if (FOOTER_LINKS[link]) {
      onNavigate(PAGES.CONTENT, { slug: FOOTER_LINKS[link].replace(/^\//, "") });
    } else {
      // Handle other links normally
      console.log("Navigate to:", link);
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <a href="/" className="nav-logo">
            <img className="nav-logo-mark" src="/nav-logo-mark.svg" width="36" height="36" alt="" aria-hidden="true" />
            <span className="nav-logo-text">{BRAND_NAME}</span>
          </a>
          <p className="footer-tagline">
            {BRAND_TAGLINE}
            <br />
            Available on iOS, Android, Web, macOS &amp; Windows.
          </p>
          <div className="footer-socials">
            {["X", "IG", "LI"].map((s) => (
              <a key={s} href="#" className="social-btn">
                {s}
              </a>
            ))}
          </div>
        </div>
        {FOOTER_COLS.map((col) => (
          <div key={col.heading} className="footer-col">
            <div className="footer-col-h">{col.heading}</div>
            {col.links.map((l) => (
              <a
                key={l}
                href={FOOTER_LINKS[l] || "#"}
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(l);
                }}
              >
                {l}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span className="footer-copy">
            © {new Date().getFullYear()} BRC. All rights reserved.
          </span>
          <div className="footer-app-links">
            <a href={IOS_APP_URL} className="footer-app-link" target="_blank" rel="noopener noreferrer">
              🍎 App Store
            </a>
            <a href={ANDROID_APP_URL} className="footer-app-link" target="_blank" rel="noopener noreferrer">
              🤖 Google Play
            </a>
            <a href={WEB_APP_URL} className="footer-app-link" target="_blank" rel="noopener noreferrer">
              🌐 Web App
            </a>
            <a href="#" className="footer-app-link">
              ⌘ macOS
            </a>
            <a href="#" className="footer-app-link">
              ⊞ Windows
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function upsertJsonLd(id, graph) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(graph);
}

function uniqueKeywords(values) {
  return [...new Set(values.filter(Boolean).flatMap((value) =>
    String(value)
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean)
  ))].join(", ");
}

export function routePath(route) {
  if (route.page === PAGES.TERMS) return "/terms";
  if (route.page === PAGES.PRIVACY) return "/privacy";
  if (route.page === PAGES.CONTACT) return "/contact";
  if (route.page === PAGES.FEATURES) return "/features";
  if (route.page === PAGES.FEATURE) return `/features/${route.slug || "pos"}`;
  if (route.page === PAGES.INDUSTRY) return `/${route.slug || "restaurants"}`;
  if (route.page === PAGES.MIGRATION) return "/switch-pos-to-brc";
  if (route.page === PAGES.CONTENT) {
    if (route.slug === "help" && route.articleId) return `/help/${route.articleId}`;
    return `/${route.slug || "help"}`;
  }
  return "/";
}

export function seoForRoute(route) {
  const path = routePath(route);
  const base = {
    title: "BRC OS | POS, Ordering, Local Hub, Offline Sync, and Reputation Software",
    description:
      "BRC OS helps local businesses run POS, table QR ordering, inventory, staff, finance, local hub hardware discovery, offline sync, reputation recovery, reviews, rewards, and analytics.",
    keywords:
      "BRC OS, local business POS, offline sync POS, local hub, hardware discovery, table QR ordering, reputation management, review recovery, inventory, rota, payroll",
    type: "website",
    image: absoluteUrl("/og-image.png"),
    path,
  };

  if (route.page === PAGES.FEATURE) {
    const feature = FEATURES.find((item) => item.slug === route.slug) || FEATURES[0];
    const detail = FEATURE_DETAIL[feature.slug] || FEATURE_DETAIL.ordering;
    return {
      ...base,
      title: `${feature.title} | BRC OS Feature Guide`,
      description: detail.subhead,
      keywords: uniqueKeywords([
        feature.title,
        `BRC ${feature.tag}`,
        detail.proof.join(", "),
        "local business software",
      ]),
    };
  }

  if (route.page === PAGES.FEATURES) {
    return {
      ...base,
      title: "BRC OS Features | POS, Reviews, Stock, Staff, Finance, AI",
      description:
        "Explore every BRC OS module across POS, table QR, ordering, bookings, reviews, reputation, campaigns, rewards, inventory, rota, payroll, finance, analytics, and BRC AI.",
      keywords:
        "BRC features, BRC OS modules, POS features, reputation management features, inventory software, rota payroll finance AI",
    };
  }

  if (route.page === PAGES.INDUSTRY) {
    const page = INDUSTRY_PAGES[route.slug] || INDUSTRY_PAGES.restaurants;
    return {
      ...base,
      title: `${page.eyebrow.replace("For ", "")} software | BRC OS`,
      description: page.subhead,
      keywords: `${page.modules.join(", ")}, ${page.proof.join(", ")}, BRC for ${route.slug}`,
    };
  }

  if (route.page === PAGES.MIGRATION) {
    return {
      ...base,
      title: "Switch From Your Current POS to BRC Business OS | AI Menu OCR and Own Hardware",
      description:
        "Move from your current POS to BRC Business OS with AI menu OCR, no extra screen fees, Tap to Pay on compatible phones, own hardware support, embedded AI operations, and included feature improvements.",
      keywords:
        "switch POS, POS migration, AI menu OCR, no extra screen fees POS, Tap to Pay POS, own hardware POS, iOS Android web Windows Mac POS, embedded AI operations, AI demand forecast, AI staffing gaps, menu profit AI, replace legacy POS, BRC Business OS",
    };
  }

  if (route.page === PAGES.CONTENT) {
    if (route.slug === "help") {
      const article = HELP_ARTICLES.find((item) => item.id === route.articleId);
      if (article) {
        return {
          ...base,
          title: `${article.title} | BRC Help Center`,
          description: article.summary,
          keywords: `${article.category}, ${article.related.join(", ")}, BRC help, ${article.title}`,
          type: "article",
        };
      }
      return {
        ...base,
        title: "BRC Help Center | Setup Guides for Local Business Operations",
        description:
          "Search BRC help articles for Local Hub, hardware discovery, offline sync, POS, ordering, bookings, reputation recovery, campaigns, analytics, billing, and support.",
        keywords:
          "BRC help center, local hub setup, hardware discovery help, offline sync guide, POS help, ordering setup, reputation recovery help",
      };
    }
    const normalizedSlug = route.slug === "api-docs" ? "api" : route.slug;
    const page = CONTENT_PAGES[normalizedSlug] || CONTENT_PAGES.features;
    return {
      ...base,
      title: `${page.title} | BRC`,
      description: page.subtitle,
      keywords: `${page.title}, BRC, local business operations, POS, reputation, ordering, bookings`,
    };
  }

  if (route.page === PAGES.CONTACT) {
    return {
      ...base,
      title: "Contact BRC | Sales, Support, Billing, and Technical Help",
      description:
        "Contact BRC for local business software support, onboarding, billing, verification, technical help, Local Hub setup, ordering, POS, and reputation workflows.",
      keywords: "contact BRC, BRC support, BRC billing, BRC technical help, BRC onboarding",
    };
  }

  if (route.page === PAGES.TERMS) {
    return {
      ...base,
      title: "BRC Terms of Service",
      description: "Read the BRC Terms of Service for business accounts, subscriptions, ordering, bookings, payments, messaging, reviews, AI, and acceptable use.",
      keywords: "BRC terms, BRC terms of service, business software terms",
    };
  }

  if (route.page === PAGES.PRIVACY) {
    return {
      ...base,
      title: "BRC Privacy Policy",
      description: "Read how BRC collects, uses, shares, secures, and retains account, customer, operational, review, billing, support, and device data.",
      keywords: "BRC privacy, BRC privacy policy, customer data, business data protection",
    };
  }

  return base;
}

export function buildStructuredData(route, seo) {
  const canonical = absoluteUrl(seo.path);
  const breadcrumbs = seo.path
    .split("/")
    .filter(Boolean)
    .reduce(
      (items, part, index, parts) => [
        ...items,
        {
          "@type": "ListItem",
          position: index + 2,
          name: part
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          item: absoluteUrl(`/${parts.slice(0, index + 1).join("/")}`),
        },
      ],
      [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }]
    );
  const graph = [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "BRC",
      alternateName: BRAND_ALSO_KNOWN_AS,
      legalName: "BRC Labs LTD",
      url: SITE_URL,
      email: "support@brcapp.io",
      address: LEGAL_COMPANY_ADDRESS,
      logo: absoluteUrl("/logo-mark.svg"),
      sameAs: [IOS_APP_URL, ANDROID_APP_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "BRC",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/help?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "BRC OS",
      alternateName: BRAND_ALSO_KNOWN_AS,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android, macOS, Windows",
      url: SITE_URL,
      downloadUrl: [IOS_APP_URL, ANDROID_APP_URL, WEB_APP_URL],
      installUrl: [IOS_APP_URL, ANDROID_APP_URL, WEB_APP_URL],
      description: seo.description,
      offers: PLANS.filter((plan) => typeof plan.monthly === "number").map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} plan`,
        price: String(plan.monthly),
        priceCurrency: "USD",
        url: absoluteUrl("/pricing"),
      })),
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "MobileApplication",
      "@id": `${SITE_URL}/#ios-app`,
      name: "BRC",
      alternateName: BRAND_ALSO_KNOWN_AS,
      applicationCategory: "BusinessApplication",
      operatingSystem: "iOS",
      url: IOS_APP_URL,
      downloadUrl: IOS_APP_URL,
      installUrl: IOS_APP_URL,
      isPartOf: { "@id": `${SITE_URL}/#software` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "MobileApplication",
      "@id": `${SITE_URL}/#android-app`,
      name: "BRC",
      alternateName: BRAND_ALSO_KNOWN_AS,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Android",
      url: ANDROID_APP_URL,
      downloadUrl: ANDROID_APP_URL,
      installUrl: ANDROID_APP_URL,
      isPartOf: { "@id": `${SITE_URL}/#software` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    },
  ];

  if (route.page === PAGES.CONTENT && route.slug === "help" && route.articleId) {
    const article = HELP_ARTICLES.find((item) => item.id === route.articleId);
    if (article) {
      graph.push({
        "@type": "TechArticle",
        headline: article.title,
        description: article.summary,
        url: canonical,
        articleSection: article.category,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: canonical,
      });
    }
  } else if (route.page === PAGES.HOME) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: FAQS.slice(0, 8).map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  } else if (route.page === PAGES.MIGRATION) {
    graph.push({
      "@type": "WebPage",
      name: "Switch From Your Current POS to BRC Business OS",
      description: seo.description,
      url: canonical,
      mainEntity: {
        "@type": "HowTo",
        name: "How to migrate from your current POS to BRC Business OS",
        step: MIGRATION_STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
        })),
      },
    });
    graph.push({
      "@type": "FAQPage",
      mainEntity: MIGRATION_FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function applySeo(route) {
  const seo = seoForRoute(route);
  const canonical = absoluteUrl(seo.path);
  document.title = seo.title;
  upsertLink("canonical", canonical);
  upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
  upsertMeta('meta[name="keywords"]', { name: "keywords", content: seo.keywords });
  upsertMeta('meta[name="robots"]', { name: "robots", content: route.page === PAGES.AUDIT ? "noindex, nofollow" : "index, follow, max-image-preview:large" });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: seo.type });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: seo.image });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: seo.image });
  upsertJsonLd("brc-route-structured-data", buildStructuredData(route, seo));
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export function getPrerenderRoutes() {
  const contentSlugs = [
    "pricing",
    "changelog",
    "roadmap",
    "about",
    "blog",
    "careers",
    "press",
    "cookies",
    "gdpr",
    "help",
    "status",
    "api-docs",
  ];

  return [
    { page: PAGES.HOME },
    { page: PAGES.CONTACT },
    { page: PAGES.TERMS },
    { page: PAGES.PRIVACY },
    { page: PAGES.MIGRATION },
    { page: PAGES.FEATURES },
    ...Object.keys(INDUSTRY_PAGES).map((slug) => ({ page: PAGES.INDUSTRY, slug })),
    ...FEATURES.map((feature) => ({ page: PAGES.FEATURE, slug: feature.slug })),
    ...contentSlugs.map((slug) => ({ page: PAGES.CONTENT, slug })),
    ...HELP_ARTICLES.map((article) => ({
      page: PAGES.CONTENT,
      slug: "help",
      articleId: article.id,
    })),
  ];
}

export default function App({ initialRoute = null }) {
  const readRoute = () => {
    if (typeof window === "undefined") return initialRoute || { page: PAGES.HOME };
    const pathname = window.location.pathname;
    if (pathname === "/audit") return { page: PAGES.AUDIT };
    if (pathname === "/contact") return { page: PAGES.CONTACT };
    if (pathname === "/terms") return { page: PAGES.TERMS };
    if (pathname === "/privacy") return { page: PAGES.PRIVACY };
    if (pathname === "/switch-pos-to-brc") return { page: PAGES.MIGRATION };
    if (pathname.startsWith("/help/")) {
      return {
        page: PAGES.CONTENT,
        slug: "help",
        articleId: pathname.replace("/help/", "").replace(/\/$/, ""),
      };
    }
    const contentSlug = pathname.replace(/^\//, "").replace(/\/$/, "");
    if (INDUSTRY_PAGES[contentSlug]) {
      return { page: PAGES.INDUSTRY, slug: contentSlug };
    }
    if (pathname === "/features" || pathname === "/features/") {
      return { page: PAGES.FEATURES };
    }
    if (
      [
        "pricing",
        "changelog",
        "roadmap",
        "about",
        "blog",
        "careers",
        "press",
        "cookies",
        "gdpr",
        "help",
        "status",
        "api-docs",
      ].includes(contentSlug)
    ) {
      return { page: PAGES.CONTENT, slug: contentSlug };
    }
    if (pathname.startsWith("/features/")) {
      return {
        page: PAGES.FEATURE,
        slug: pathname.replace("/features/", "").replace(/\/$/, ""),
      };
    }
    return { page: PAGES.HOME };
  };
  const [route, setRoute] = useState(() => initialRoute || readRoute());
  const currentPage = route.page;
  const [pendingHash, setPendingHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash || ""
  );
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("brc-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("brc-theme", theme);
    } catch {
      // Ignore storage failures; the visual switch still works for this visit.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((value) => (value === "light" ? "dark" : "light"));
  };

  const navigateTo = (page, options = {}) => {
    setRoute({ page, ...options });
    const path =
      page === PAGES.TERMS
        ? "/terms"
        : page === PAGES.PRIVACY
          ? "/privacy"
          : page === PAGES.CONTACT
            ? "/contact"
            : page === PAGES.FEATURES
              ? "/features"
            : page === PAGES.CONTENT && options.slug
              ? `/${options.slug}`
            : "/";
    window.history.pushState({}, "", path);
    setPendingHash("");
    window.scrollTo(0, 0);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setRoute(readRoute());
      setPendingHash(window.location.hash || "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleInternalNavigation = (event) => {
      const link = event.target.closest?.("a");
      if (!link || link.target || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const isLandingRoute =
        url.pathname === "/" ||
        url.pathname === "/audit" ||
        url.pathname === "/contact" ||
        url.pathname === "/terms" ||
        url.pathname === "/privacy" ||
        url.pathname === "/switch-pos-to-brc" ||
        [
          "/features",
          "/pricing",
          "/changelog",
          "/roadmap",
          "/about",
          "/blog",
          "/careers",
          "/press",
          "/cookies",
          "/gdpr",
          "/help",
          "/status",
          "/api-docs",
          "/restaurants",
          "/cafes",
          "/salons",
          "/retail",
        ].includes(url.pathname) ||
        url.pathname.startsWith("/help/") ||
        url.pathname.startsWith("/features/");
      if (!isLandingRoute) return;

      event.preventDefault();
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      setRoute(readRoute());
      setPendingHash(url.hash || "");
      if (!url.hash) window.scrollTo({ top: 0, behavior: "smooth" });
    };

    document.addEventListener("click", handleInternalNavigation);
    return () => document.removeEventListener("click", handleInternalNavigation);
  }, []);

  useEffect(() => {
    if (!pendingHash) return;
    let cancelled = false;
    let attempts = 0;
    const scrollToHash = () => {
      if (cancelled) return;
      const target = document.querySelector(pendingHash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        setPendingHash("");
        return;
      }
      attempts += 1;
      if (attempts < 6) requestAnimationFrame(scrollToHash);
      else setPendingHash("");
    };
    requestAnimationFrame(scrollToHash);
    return () => {
      cancelled = true;
    };
  }, [route, pendingHash]);

  useEffect(() => {
    applySeo(route);
  }, [route]);

  useEffect(() => {
    trackMarketingEvent("page_view", {
      route: currentPage,
      slug: route.slug || "",
      articleId: route.articleId || "",
    });
  }, [currentPage, route.slug, route.articleId]);

  useEffect(() => {
    const handleMarketingClick = (event) => {
      const link = event.target.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const label = (link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 140);
      let eventType = "cta_click";
      if (href.includes("#pricing")) eventType = "pricing_click";
      if (href.includes("/audit")) eventType = "audit_click";
      if (href.includes("mode=signup") || label.toLowerCase().includes("trial")) {
        eventType = "trial_click";
      }
      if (link.hostname && link.hostname !== window.location.hostname) {
        eventType = eventType === "trial_click" ? "trial_click" : "outbound_click";
      }
      trackMarketingEvent(eventType, {
        target: href,
        label,
        location: link.closest("nav") ? "nav" : link.closest("footer") ? "footer" : "page",
      });
    };
    document.addEventListener("click", handleMarketingClick, true);
    return () => document.removeEventListener("click", handleMarketingClick, true);
  }, []);

  if (currentPage === PAGES.TERMS) {
    return <EnhancedTermsOfService />;
  }

  if (currentPage === PAGES.PRIVACY) {
    return <EnhancedPrivacyPolicy />;
  }

  if (currentPage === PAGES.AUDIT) {
    return <PublicAuditPage />;
  }

  if (currentPage === PAGES.CONTACT) {
    return (
      <ContactPage
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentPage === PAGES.MIGRATION) {
    return (
      <PosMigrationPage
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentPage === PAGES.FEATURE) {
    return (
      <FeatureDetailPage
        slug={route.slug}
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentPage === PAGES.FEATURES) {
    return (
      <FeatureIndexPage
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentPage === PAGES.INDUSTRY) {
    return (
      <IndustryLandingPage
        slug={route.slug}
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (currentPage === PAGES.CONTENT) {
    return (
      <MarketingContentPage
        slug={route.slug}
        articleId={route.articleId}
        onNavigate={navigateTo}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <TrustProof />
        <AskBrcDemo />
        <StatsBar />
        <ProductProof />
        <AiBusinessOS />
        <BusinessFitStrip />
        <OperationsStack />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
