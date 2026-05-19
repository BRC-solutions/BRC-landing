import { useEffect, useState } from "react";
import "./App.css?v=2222";

// ─── ROUTING ──────────────────────────────────────────────────────────────────

const PAGES = {
  HOME: "home",
  TERMS: "terms",
  PRIVACY: "privacy",
  AUDIT: "audit",
  FEATURE: "feature",
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.brcapp.io";

const WEB_APP_URL =
  import.meta.env.VITE_APP_URL || "https://console.brcapp.io";
const BRAND_NAME = "BRC";
const BRAND_EXPANSION = "Business Reputation & Customer Operations";
const BRAND_SHORT = "BRC";
const BRAND_TAGLINE =
  "Business Reputation & Customer Operations for local teams.";

function signupUrl({
  businessName = "",
  placeId = "",
  plan = "growth",
  billing = "monthly",
} = {}) {
  const url = new URL("/login", WEB_APP_URL);
  url.searchParams.set("mode", "signup");
  url.searchParams.set("source", "prospect_audit");
  url.searchParams.set("plan", plan);
  url.searchParams.set("billing", billing);
  if (businessName) url.searchParams.set("businessName", businessName);
  if (placeId) url.searchParams.set("googlePlaceId", placeId);
  return url.toString();
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav({ theme = "dark", onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "/#features" },
    { label: "Ordering", href: "/features/ordering" },
    { label: "Bookings", href: "/features/bookings" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner container">
        <a href="#" className="nav-logo">
          <img src="/logo-mark.svg" width="36" height="36" alt="" aria-hidden="true" />
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
          <a href="#pricing" className="btn btn-primary">
            Start Trial
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
          href="#pricing"
          className="btn btn-primary"
          style={{ marginTop: 8 }}
          onClick={() => setMobileOpen(false)}
        >
          Start Trial
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

function PhoneMockup() {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-header">
          <div className="phone-header-logo">
            <img src="/logo-mark.svg" width="14" height="14" alt="" aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 4 }} />
            {BRAND_SHORT}
          </div>
          <div className="phone-header-sub">Marco&apos;s Bistro</div>
        </div>
        <div className="phone-body">
          <div className="phone-order-tag">Your order · Table 7</div>
          <div className="phone-biz">How was your Margherita Pizza?</div>
          <div className="phone-stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`star ${i <= 4 ? "star-on" : "star-half"}`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="phone-divider" />
          <div className="phone-metrics">
            {[
              ["Flavour", 95],
              ["Temperature", 100],
              ["Presentation", 78],
            ].map(([label, pct]) => (
              <div key={label} className="metric-row">
                <span className="metric-label">{label}</span>
                <div className="metric-track">
                  <div className="metric-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <textarea
            className="phone-comment"
            readOnly
            value="Loved the crust, sauce was perfect!"
          />
          <button className="phone-cta">Submit &amp; Claim My Reward →</button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
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
            One subscription for customer operations
          </div>
          <h1 className="hero-h1">
            Stop paying for five tools
            <br />
            <span className="grad-text">to run one business.</span>
          </h1>
          <p className="hero-p">
            BRC gives local business owners ordering, booking, delivery,
            feedback, reviews, rewards, campaigns, and analytics in one app.
            Replace disconnected subscriptions, save admin time, protect your
            reputation, and see which customer actions are actually bringing
            money back.
          </p>
          <div className="hero-btns">
            <a href="#pricing" className="btn btn-primary btn-lg">
              Start 7-Day Trial <span className="arrow">→</span>
            </a>
            <a href="#features" className="btn btn-outline btn-lg">
              See What You Get
            </a>
          </div>
          <div className="hero-social-proof">
            <div className="sp-avatars">
              {["M", "J", "S", "A", "R"].map((l) => (
                <div key={l} className="sp-avatar">
                  {l}
                </div>
              ))}
            </div>
            <div className="sp-text">
              <span className="sp-stars">★★★★★</span>
              <span>
                Trusted by <strong>2,400+</strong> local businesses
              </span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <PhoneMockup />

          <div className="float-card fc-review">
            <div className="fc-platform">
              <span className="fc-discount-tag">🎁</span>
              <span className="fc-platform-name">Reward sent</span>
            </div>
            <div className="fc-stars-sm">★★★★★</div>
            <div className="fc-quote">
              Code <strong>SAVE15</strong> delivered via SMS
            </div>
          </div>

          <div className="float-card fc-sms">
            <div className="fc-sms-icon">💬</div>
            <div className="fc-sms-body">
              <div className="fc-sms-title">Follow-up sent · 3 days later</div>
              <div className="fc-sms-sub">
                Review request delivered naturally
              </div>
            </div>
            <div className="fc-sms-check">✓</div>
          </div>

          <div className="float-card fc-stat">
            <div className="fc-stat-val">+67%</div>
            <div className="fc-stat-label">Review lift this month</div>
            <div className="fc-stat-spark">
              {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                <div
                  key={i}
                  className="spark-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-dot" />
      </div>
    </section>
  );
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────

const STATS = [
  { value: "48k+", label: "Customer feedback records" },
  { value: "18.5k+", label: "SMS win-back campaigns" },
  { value: "9.7k+", label: "Tracked orders and redemptions" },
  { value: "+67%", label: "Average review lift" },
  { value: "2.1M+", label: "Reviews analyzed across platforms" },
  { value: "99.5%", label: "Fake review detection accuracy" },
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

const OWNER_REASONS = [
  {
    title: "Replace disconnected tools",
    body: "Ordering, bookings, delivery, feedback, reviews, rewards, campaigns, and analytics sit in one subscription instead of separate dashboards and bills.",
  },
  {
    title: "Get value in the first week",
    body: "Start with the Growth trial, connect the business, publish the customer links, and use the first feedback, reviews, and campaign data to see where BRC pays back.",
  },
  {
    title: "Know what is making money",
    body: "BRC ties customer activity to redemptions, repeat visits, campaigns, reviews, and revenue-influenced reporting so owners can see what deserves attention.",
  },
];

function OwnerReasons() {
  return (
    <section className="owner-reasons">
      <div className="container owner-reasons-grid">
        <div className="owner-reasons-copy">
          <div className="section-tag">Why Owners Subscribe</div>
          <h2>
            Built to earn its place
            <br />
            on your monthly bill.
          </h2>
        </div>
        {OWNER_REASONS.map((item) => (
          <div key={item.title} className="owner-reason-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
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

// ─── FEATURES ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    slug: "ordering",
    icon: "🛒",
    accent: "var(--cyan)",
    title: "Online ordering",
    body: "Branded dine-in, pickup, retail, and service ordering that feeds customer profiles, rewards, feedback, and analytics.",
    tag: "Commerce",
    outcome: "Replace marketplace dependency with direct orders you own.",
  },
  {
    slug: "delivery",
    icon: "🚚",
    accent: "var(--green)",
    title: "Delivery and pickup",
    body: "Delivery quotes, customer details, pickup slots, order tracking, and fulfilment workflows designed for local teams.",
    tag: "Fulfilment",
    outcome: "Add delivery and pickup without bolting on another subscription.",
  },
  {
    slug: "bookings",
    icon: "📅",
    accent: "var(--blue)",
    title: "Bookings and reservations",
    body: "Appointments, services, staff, tables, classes, and sessions connected to reminders, confirmations, feedback, and repeat visits.",
    tag: "Bookings",
    outcome: "Take bookings without paying for a separate scheduling tool.",
  },
  {
    slug: "feedback",
    icon: "📋",
    accent: "var(--purple)",
    title: "Private feedback",
    body: "Contextual forms tied to orders, bookings, staff, tables, products, or visits so feedback is specific enough to act on.",
    tag: "Experience",
    outcome: "Protect your rating before problems cost you new customers.",
  },
  {
    slug: "reputation",
    icon: "⭐",
    accent: "var(--yellow)",
    title: "Review growth",
    body: "Monitor Google, Yelp, and TripAdvisor, draft replies with AI, and send natural review follow-ups at the right moment.",
    tag: "Reputation",
    outcome: "Win more searches with stronger reviews and faster replies.",
  },
  {
    slug: "campaigns",
    icon: "📣",
    accent: "var(--orange)",
    title: "Campaigns and automations",
    body: "SMS and email journeys for feedback rewards, review requests, win-backs, reminders, and customer reactivation.",
    tag: "Retention",
    outcome: "Bring customers back without manually sending every message.",
  },
  {
    slug: "rewards",
    icon: "🎁",
    accent: "var(--red)",
    title: "Rewards and loyalty",
    body: "Discount codes, redemption tracking, loyalty-style incentives, and customer return journeys linked to real activity.",
    tag: "Loyalty",
    outcome: "See which offers produce repeat visits instead of guessing.",
  },
  {
    slug: "analytics",
    icon: "📊",
    accent: "var(--blue)",
    title: "Analytics and AI insights",
    body: "Review trends, competitor tracking, campaign performance, item insights, staff signals, and owner summaries in one console.",
    tag: "Insights",
    outcome: "Know what is worth fixing, promoting, or charging for.",
  },
  {
    slug: "team",
    icon: "👥",
    accent: "var(--purple)",
    title: "Team and multi-location ops",
    body: "Staff access, permissions, location-level settings, organisation reporting, notifications, and admin controls.",
    tag: "Operations",
    outcome: "Give your team one operating system instead of scattered logins.",
  },
];

const FEATURE_DETAIL = {
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
    fits: [
      "Catalog setup in the console",
      "Branded public page on go.brcapp.io or custom domain",
      "Orders dashboard, kitchen view, history, and status changes",
      "Feedback, rewards, campaigns, and item performance after purchase",
    ],
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
    fits: [
      "Delivery and pickup settings on the public ordering page",
      "Customer address, notes, fee, and fulfilment data saved to the order",
      "Preparation, dispatch, pickup, delivered, failed, and cancelled states",
      "Post-order review, reward, and win-back campaigns",
    ],
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
    fits: [
      "Booking services and resources in operations",
      "Public booking flow for tables, services, staff, sessions, or events",
      "Availability checks, confirmations, reschedules, and cancellations",
      "Booking reminders, feedback, review prompts, and repeat-customer journeys",
    ],
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
    fits: [
      "QR sessions tied to staff, menu items, orders, bookings, or visits",
      "Private inbox for low ratings and customer replies",
      "Discount codes and reward timing for feedback completion",
      "Staff, service, and item insights for daily improvements",
    ],
    bestFor: "Owners who want bad experiences surfaced privately before they damage the public rating.",
  },
  reputation: {
    headline: "Review growth without awkward review begging.",
    subhead:
      "BRC monitors your public reputation, helps your team respond faster, and sends natural follow-ups after genuine customer activity.",
    bullets: [
      "Google, Yelp, and TripAdvisor monitoring by plan",
      "AI review summaries and reply draft support",
      "Review request follow-ups after orders, bookings, or visits",
      "Competitor tracking and local benchmark signals",
      "Owner alerts for urgent or low-rating reviews",
    ],
    conversion:
      "Why subscribe: stronger reviews improve the trust signals buyers check before choosing you, while AI drafts save owner and manager time.",
    proof: ["AI reply drafts", "Competitor tracking", "Review alerts"],
    fits: [
      "Google reviews on Growth, with Yelp and TripAdvisor on higher plans",
      "Daily review sync, AI summaries, and AI reply drafts",
      "Competitor tracking and public signal monitoring by plan",
      "Owner alerts and campaign follow-up after real customer activity",
    ],
    bestFor: "Any local business where new customers check ratings before calling, booking, ordering, or walking in.",
  },
  campaigns: {
    headline: "Automations that turn customer activity into repeat revenue.",
    subhead:
      "Run campaigns and journeys from the same place your orders, bookings, feedback, and customer profiles live.",
    bullets: [
      "SMS and email campaign support",
      "Scheduled sends, automations, and win-back journeys",
      "Feedback reward and review request follow-ups",
      "Customer segments based on activity and consent",
      "Campaign reporting tied to redemptions and revenue influence",
    ],
    conversion:
      "Why subscribe: campaigns are tied to real orders, bookings, rewards, and consent, so offers are easier to target and measure.",
    proof: ["Win-back journeys", "Scheduled sends", "Redemption tracking"],
    fits: [
      "SMS and email campaigns from Boost",
      "Review request, feedback discount, low-rating recovery, and win-back journeys",
      "Consent and do-not-contact tracking",
      "Campaign analytics, redemptions, and revenue-influenced reporting",
    ],
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
      "Consent-aware SMS and email reward delivery",
      "Performance reporting for offers and redemptions",
    ],
    conversion:
      "Why subscribe: rewards stop being random discounts and become trackable return-visit tools you can measure.",
    proof: ["Trackable codes", "Scanner support", "Offer reporting"],
    fits: [
      "Feedback discounts delivered after customer responses",
      "Camera-based discount code scanner",
      "Campaign offer redemptions tied to customers",
      "Revenue-influenced campaign and reward reporting",
    ],
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
    fits: [
      "Review, feedback, staff, item, campaign, competitor, and public signal analytics",
      "Owner assistant digest with alerts and suggested actions",
      "Location comparison and organisation rollups by plan",
      "Scheduled reports and exports for Business plans",
    ],
    bestFor: "Owners and managers who want one weekly command center instead of checking reviews, orders, campaigns, and staff performance separately.",
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
    fits: [
      "Owner, manager, staff, and admin roles",
      "Capability flags and location-level permissions",
      "Multi-location organisation model",
      "Plan gates, feature overrides, subscription states, and support workflows",
    ],
    bestFor: "Growing teams that need staff access, controlled permissions, and location reporting without losing owner visibility.",
  },
};

const FEATURE_GUIDES = {
  ordering: {
    setup: [
      "Create catalog categories and items, then add prices, images, variants, modifiers, availability, and hidden states where needed.",
      "Publish the branded public page and choose the customer entry point: table QR, pickup link, retail storefront, or service ordering page.",
      "Connect Stripe when online payment is required, then decide which order modes the business accepts.",
      "Use the operations screen to manage live orders, kitchen/preparation work, status changes, and order history.",
    ],
    dailyUse: [
      "New orders land in the operations console with customer, payment, table, pickup, delivery, and item details.",
      "Staff can move orders from submitted to accepted, ready, completed, cancelled, or refunded.",
      "Owners can review item performance and use order history for feedback, review requests, rewards, and campaigns.",
    ],
    planNote: "Basic ordering belongs in the entry story, while advanced order management, catalog pickup, and table ordering are positioned as Pro and Business value.",
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
    planNote: "Service bookings and table ordering are strong Pro and Business plan reasons because they replace a standalone scheduling product.",
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
      "Choose which review platforms matter for the plan: Google first, then Yelp and TripAdvisor on higher tiers.",
      "Set alerts for new reviews, low ratings, and owner attention.",
      "Use AI summaries and reply drafts so managers can respond faster without starting from a blank page.",
    ],
    dailyUse: [
      "Owners monitor review volume, average rating, unresolved replies, and urgent review risks.",
      "Managers can use AI drafts, competitor context, and public signal checks to decide where to act.",
      "Review requests can be triggered after real customer activity instead of asking everyone at random.",
    ],
    planNote: "Growth sells Google review management; Pro and Business expand the story with multi-platform, competitors, and public signals.",
  },
  campaigns: {
    setup: [
      "Build campaigns from Boost using SMS or email depending on customer consent and contact details.",
      "Choose campaign type: review request, feedback discount, low-rating recovery, win-back, staff/menu-based, or scheduled send.",
      "Set audience, offer, timing, and discount behaviour.",
      "Track sent, clicked, redeemed, revenue-influenced results, and credit usage.",
    ],
    dailyUse: [
      "Owners can see which campaigns are active, scheduled, sent, failed, clicked, or redeemed.",
      "Customer consent and do-not-contact rules keep messaging cleaner.",
      "Campaign results connect back to rewards, feedback, customers, and revenue-influenced reporting.",
    ],
    planNote: "Campaign basics support Growth; customer segments, advanced campaigns, and automations make Pro and Business easier to justify.",
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
      "Use plan-level reporting: Growth for core insights, Pro for deeper monitoring, Business for organisation reporting.",
      "Review staff, item, location, campaign, and competitor patterns before changing operations or offers.",
    ],
    dailyUse: [
      "Owners check what changed this week: reviews, low ratings, redemptions, campaign performance, and competitor movement.",
      "Managers can identify which staff, services, menu items, or locations need attention.",
      "Business plans can roll up location performance and scheduled reporting.",
    ],
    planNote: "Analytics is the subscription proof layer: it shows the owner where BRC is saving time, protecting reputation, and influencing revenue.",
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
};

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
                <span className="feature-emoji">{f.icon}</span>
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

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Customers Order, Book, or Scan",
    body: "Use branded ordering pages, booking links, QR codes, receipts, or counters. Customers can place an order, book a service, or answer questions about the exact experience they had.",
    tip: "Feedback forms can be generated dynamically from the order, booking, staff member, service, or item involved.",
    visual: (
      <div className="step-visual sv-setup">
        <div className="sv-qr">
          <div className="qr-grid">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`qr-cell ${[0, 1, 2, 5, 6, 7, 8, 9, 12, 16, 17, 19, 20, 21, 22, 24].includes(i) ? "qr-on" : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="sv-label">Scan → Your order, your questions</div>
      </div>
    ),
  },
  {
    num: "02",
    title: "They Get Rewarded Instantly",
    body: "As soon as feedback is submitted, the customer receives a personalised discount code via SMS. They feel valued — and you get genuine, honest feedback worth acting on.",
    tip: "Businesses offering a reward see 3× more feedback submissions.",
    visual: (
      <div className="step-visual sv-scan">
        <div className="sv-reward">
          <div className="sv-reward-icon">🎁</div>
          <div className="sv-reward-code">SAVE15</div>
          <div className="sv-reward-label">Delivered via SMS · Instantly</div>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Follow-Up Happens Naturally",
    body: "Days after their visit, order, or booking, the system sends a warm, well-timed message asking them to share their experience on the review platform you choose.",
    tip: "Average businesses see a 67% lift in public reviews within 90 days.",
    visual: (
      <div className="step-visual sv-grow">
        <div className="sv-chart">
          {[20, 35, 30, 55, 50, 75, 70, 90].map((h, i) => (
            <div key={i} className="sv-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="sv-chart-label">Public reviews over time ↑</div>
      </div>
    ),
  },
];

function HowItWorks() {
  return (
    <section className="section hiw-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">How It Works</div>
          <h2 className="section-h2">
            Three steps.
            <br />
            <span className="grad-text">Running before lunch.</span>
          </h2>
        </div>
        <div className="hiw-grid">
          {STEPS.map((s, i) => (
            <div key={s.num} className="hiw-card">
              <div className="hiw-num">{s.num}</div>
              {s.visual}
              <h3 className="hiw-title">{s.title}</h3>
              <p className="hiw-body">{s.body}</p>
              <div className="hiw-tip">
                <span className="tip-icon">💡</span>
                {s.tip}
              </div>
              {i < STEPS.length - 1 && <div className="hiw-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
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
  "Follow-ups feel natural, not automated",
  "AI flags fake & suspicious reviews",
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
            customers on your behalf — naturally, and on the platform that
            matters most to your business.
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
    title: "Multi-Platform Review Tracking",
    desc: "Monitor your reputation across Google, Yelp, and TripAdvisor in real-time. See rating trends, review volume, and response times all in one place.",
  },
  {
    icon: "👥",
    title: "Competitor Intelligence",
    desc: "Track competitor ratings, review counts, and sentiment. Identify market opportunities and benchmark your performance against local rivals.",
  },
  {
    icon: "🧠",
    title: "AI-Powered Review Analysis",
    desc: "Automatic sentiment analysis, fake review detection, and risk scoring. Get alerts for urgent reviews and insights into customer emotions.",
  },
  {
    icon: "📊",
    title: "Advanced Dashboards",
    desc: "Interactive charts for feedback trends, campaign performance, staff ratings, and catalog item popularity. Export data for deeper analysis.",
  },
  {
    icon: "⚡",
    title: "Real-Time Notifications",
    desc: "Instant alerts for new reviews, low ratings, or competitor changes. Never miss a chance to respond or celebrate positive feedback.",
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
          <a href="#pricing" className="btn btn-primary btn-xl">
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
                <div className="cm-kpi-label">SMS Sent</div>
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
    name: "Growth",
    monthly: 49,
    annual: 44,
    desc: "For one active location managing reviews, feedback, orders, bookings, and campaigns.",
    cta: "Start 7-Day Trial",
    highlight: true,
    badge: "Most Popular",
    features: [
      "1 location",
      "Google reviews only",
      "Previous review fetching included: up to 50 reviews",
      "Daily review sync",
      "AI summaries and reply drafts",
      "Competitor tracking up to 3",
      "Private feedback and staff ratings",
      "Basic ordering and booking workflows",
      "Campaign basics and feedback discounts",
      "SMS prompts, credits paid separately",
    ],
  },
  {
    name: "Pro",
    monthly: 99,
    annual: 89,
    desc: "For growing businesses with a few locations and advanced insights.",
    cta: "Start 7-Day Trial",
    highlight: false,
    badge: null,
    features: [
      "Up to 3 locations",
      "Everything in Growth",
      "Yelp and TripAdvisor",
      "Previous review fetching included: up to 500 reviews",
      "Menu/product performance insights",
      "Advanced ordering and booking configuration",
      "Public Signals monitoring",
      "Competitor tracking up to 10",
      "Advanced campaigns and customer segments",
      "Team notes and collaboration",
      "Location comparison and priority support",
    ],
  },
  {
    name: "Business",
    monthly: 249,
    annual: 224,
    desc: "For multi-location brands that need organisation-wide reporting.",
    cta: "Start Business",
    highlight: false,
    badge: "Multi-location",
    features: [
      "Up to 10 locations, then custom",
      "Everything in Pro",
      "Previous review fetching included: up to 1,000 reviews",
      "Organisation dashboard",
      "Brand-level reputation reports",
      "Multi-location alerts and campaigns",
      "Ordering and booking reporting",
      "Scheduled reports and exports",
      "10 manual Public Signal scans/day",
      "Higher review sync allowance",
      "Onboarding support",
    ],
  },
  {
    name: "Custom",
    monthly: "Custom",
    annual: "Custom",
    desc: "For agencies, franchises, and teams with heavier scan volumes.",
    cta: "Talk to Us",
    highlight: false,
    badge: "Enterprise",
    features: [
      "More than 10 locations",
      "Custom Public Signal scan volume",
      "Custom review sync allowance",
      "Custom previous review fetching allowance",
      "SLA and priority data sync",
      "White-label or custom reports",
      "Dedicated onboarding and support",
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
            Simple, transparent
            <br />
            <span className="grad-text">pricing</span>
          </h2>
          <p className="section-p">
            Start with a 7-day Growth trial. Upgrade when your team needs more
            locations or deeper monitoring.
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
              className={`plan-card ${p.highlight ? "plan-highlight" : ""}`}
            >
              {p.badge && <div className="plan-badge">{p.badge}</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">
                {typeof p.monthly === "number" && (
                  <span className="plan-curr">$</span>
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
                  Billed annually · Save ${(p.monthly - p.annual) * 12}/yr
                </div>
              )}
              <p className="plan-desc">{p.desc}</p>
              <a
                href={signupUrl({
                  plan: p.name.toLowerCase() === "custom" ? "business" : p.name.toLowerCase(),
                  billing: annual ? "annual" : "monthly",
                })}
                className={`btn ${p.highlight ? "btn-primary" : "btn-outline"} btn-block`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.cta}
              </a>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f} className="plan-feature">
                    <span className="plan-check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pricing-addons">
          <div className="addon-icon">💬</div>
          <div>
            <strong>Need more SMS credits?</strong>
            <span className="addon-text">
              {" "}
              Add-on packs: 100 credits for $9 · 500 credits for $39
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
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
    a: "As soon as a customer submits their feedback, they receive a personalised discount code via SMS. The code is unique to them, trackable, and can be set to expire after a time of your choosing. Businesses using rewards typically see 3× more feedback submissions.",
  },
  {
    q: "When and how are customers asked for public reviews?",
    a: "The platform sends a natural, well-timed follow-up message a few days after the visit, order, or booking. The message feels like a genuine check-in rather than an automated prompt, and directs customers to whichever platform you want to grow: Google, Yelp, or TripAdvisor.",
  },
  {
    q: "What happens when a customer leaves negative feedback?",
    a: "Unhappy customers are given a private channel to share their concerns directly with your business — before they consider posting a public review. Your team can resolve the issue, respond personally, and turn a bad experience into a reason to return.",
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

function CTA() {
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
            <a href="#pricing" className="btn btn-primary btn-xl">
              Start 7-Day Trial <span className="arrow">→</span>
            </a>
            <div className="store-btns">
              <a href="#" className="store-btn">
                <span className="store-os">🍎</span>
                <div>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </a>
              <a href="#" className="store-btn">
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

// ─── FEATURE DETAIL PAGES ────────────────────────────────────────────────────

function FeatureDetailPage({ slug = "ordering", onNavigate, theme, onToggleTheme }) {
  const feature = FEATURES.find((item) => item.slug === slug) || FEATURES[0];
  const detail = FEATURE_DETAIL[feature.slug] || FEATURE_DETAIL.ordering;
  const guide = FEATURE_GUIDES[feature.slug] || FEATURE_GUIDES.ordering;
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
              <a href="/#features" className="feature-back">← All features</a>
              <div className="section-tag">{feature.tag}</div>
              <h1 className="feature-page-title">
                {detail.headline}
              </h1>
              <p className="feature-page-subhead">{detail.subhead}</p>
              <div className="hero-btns">
                <a href="#pricing" className="btn btn-primary btn-lg">
                  Start 7-Day Trial <span className="arrow">→</span>
                </a>
                <a href={WEB_APP_URL} className="btn btn-outline btn-lg" target="_blank" rel="noopener noreferrer">
                  Open Web App
                </a>
              </div>
            </div>
            <div className="feature-proof-panel">
              <div className="feature-proof-icon" style={{ "--accent": feature.accent }}>
                {feature.icon}
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
                starting the trial. The details change by business type, but
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
                These pages are not describing isolated features. They map to
                real BRC modules: public pages, QR flows, operations,
                feedback, campaigns, analytics, subscriptions, and team access.
              </p>
            </div>
            <div className="conversion-flow">
              {detail.fits.map((item, index) => (
                <div key={item} className="flow-step">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
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
                    <span className="feature-emoji">{item.icon}</span>
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
              <li>Automated SMS campaigns and win-back messaging</li>
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
              <li>Twilio for SMS messaging services</li>
              <li>OpenAI for AI-powered analysis</li>
              <li>RevenueCat for subscription management</li>
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
              <li>Win-back campaigns</li>
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
              <li>Additional charges for SMS credits and overages</li>
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
                transaction data from RevenueCat
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
              <li>Send automated SMS campaigns and notifications</li>
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
                <strong>Supabase:</strong> Database hosting and authentication
                services
              </li>
              <li>
                <strong>Twilio:</strong> SMS messaging and communication
                services
              </li>
              <li>
                <strong>OpenAI:</strong> AI-powered analysis and processing
              </li>
              <li>
                <strong>RevenueCat:</strong> Subscription and payment processing
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
                <strong>Payment Services:</strong> RevenueCat processes payment
                information according to their privacy policy
              </li>
              <li>
                <strong>Communication Services:</strong> Twilio handles SMS
                delivery according to their privacy policy
              </li>
              <li>
                <strong>AI Services:</strong> OpenAI processes data for analysis
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
      plan: "growth",
      label: "Growth",
      price: "$49/mo",
      bestFor: "Best first step",
      items: ["Private feedback capture", "Review follow-up", "Basic campaign tracking"],
    },
    {
      plan: "pro",
      label: "Pro",
      price: "$99/mo",
      bestFor: "For deeper monitoring",
      items: ["More review platforms", "Competitor tracking", "Public signals"],
    },
    {
      plan: "business",
      label: "Business",
      price: "$249/mo",
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
            href={signupUrl(signupBase)}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start trial
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
              href={signupUrl({ ...signupBase, plan: "growth" })}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start the 7-day trial
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
    } else {
      // Handle other links normally
      console.log("Navigate to:", link);
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <a href="#" className="nav-logo">
            <span className="logo-mark" />
            <span className="nav-logo-text">{BRAND_NAME}</span>
          </a>
          <p className="footer-tagline">
            {BRAND_TAGLINE}
            <br />
            Available on iOS, Android &amp; Web.
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
                href="#"
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
            <a href="#" className="footer-app-link">
              🍎 App Store
            </a>
            <a href="#" className="footer-app-link">
              🤖 Google Play
            </a>
            <a href={WEB_APP_URL} className="footer-app-link" target="_blank" rel="noopener noreferrer">
              🌐 Web App
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const readRoute = () => {
    const pathname = window.location.pathname;
    if (pathname === "/audit") return { page: PAGES.AUDIT };
    if (pathname.startsWith("/features/")) {
      return {
        page: PAGES.FEATURE,
        slug: pathname.replace("/features/", "").replace(/\/$/, ""),
      };
    }
    return { page: PAGES.HOME };
  };
  const [route, setRoute] = useState(readRoute);
  const currentPage = route.page;
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

  const navigateTo = (page) => {
    setRoute({ page });
    window.scrollTo(0, 0);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setRoute(readRoute());
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
        url.pathname.startsWith("/features/");
      if (!isLandingRoute) return;

      event.preventDefault();
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      setRoute(readRoute());
      requestAnimationFrame(() => {
        if (url.hash) {
          document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    };

    document.addEventListener("click", handleInternalNavigation);
    return () => document.removeEventListener("click", handleInternalNavigation);
  }, []);

  if (currentPage === PAGES.TERMS) {
    return <TermsOfService />;
  }

  if (currentPage === PAGES.PRIVACY) {
    return <PrivacyPolicy />;
  }

  if (currentPage === PAGES.AUDIT) {
    return <PublicAuditPage />;
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

  return (
    <div className="app">
      <Nav theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <OwnerReasons />
        <Features />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
