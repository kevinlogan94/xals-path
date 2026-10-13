function isStandalone(): boolean {
  return (
    matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function needsGate(): boolean {
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return false;
  if (isStandalone()) return false;
  return matchMedia('(max-width: 767px) and (orientation: portrait)').matches;
}

function isEmbedded(): boolean {
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|Snapchat|TikTok|; wv\)/i.test(
    navigator.userAgent,
  );
}

export function passInstallGate(): Promise<void> {
  if (!needsGate()) return Promise.resolve();
  const el = document.getElementById('install-gate');
  if (!el) return Promise.resolve();
  el.hidden = false;
  if (isEmbedded()) el.classList.add('embedded');
  return new Promise((resolve) => {
    el.querySelector('[data-play]')?.addEventListener(
      'click',
      () => {
        el.remove();
        resolve();
      },
      { once: true },
    );
    el.querySelector('[data-open]')?.addEventListener('click', () => {
      const path = `${location.host}${location.pathname}${location.search}${location.hash}`;
      location.href = /android/i.test(navigator.userAgent)
        ? `intent://${path}#Intent;scheme=${location.protocol.replace(':', '')};action=android.intent.action.VIEW;end`
        : `x-safari-https://${path}`;
    });
  });
}
