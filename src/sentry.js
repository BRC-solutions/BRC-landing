import * as Sentry from "@sentry/react";

function numberEnv(name, fallback = 0) {
  const parsed = Number(import.meta.env[name]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: numberEnv("VITE_SENTRY_TRACES_SAMPLE_RATE"),
  });
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
