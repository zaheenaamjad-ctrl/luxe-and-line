declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_ID = "G-0XSNYRRKHN";

function isGtagReady(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

export function trackPageView(path: string, title?: string): void {
  if (!isGtagReady()) return;
  window.gtag("config", GA_ID, {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isGtagReady()) return;
  window.gtag("event", eventName, params);
}
