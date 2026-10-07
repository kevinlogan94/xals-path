declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params?: Record<string, string | number>): void {
  window.gtag?.('event', name, params);
}
