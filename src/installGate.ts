interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

function isStandalone(): boolean {
  return (
    matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function gateOverride(): string | null {
  return new URLSearchParams(location.search).get('gate');
}

function needsGate(): boolean {
  if (gateOverride()) return true;
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return false;
  if (isStandalone()) return false;
  return matchMedia('(max-width: 767px) and (orientation: portrait)').matches;
}

function isEmbedded(): boolean {
  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|Snapchat|TikTok|; wv\)/i.test(
    navigator.userAgent,
  );
}

function resolveMode(): 'ios' | 'android' | 'embedded' {
  const override = gateOverride();
  if (override === 'ios' || override === 'android' || override === 'embedded') return override;
  if (isEmbedded()) return 'embedded';
  if (/android/i.test(navigator.userAgent)) return 'android';
  return 'ios';
}

export function passInstallGate(): Promise<void> {
  if (!needsGate()) return Promise.resolve();
  const el = document.getElementById('install-gate');
  if (!el) return Promise.resolve();

  const mode = resolveMode();
  el.dataset.mode = mode;
  el.hidden = false;

  const installBtn = el.querySelector<HTMLButtonElement>('[data-install]');
  const browserPlayBtn = el.querySelector<HTMLButtonElement>('[data-for="ios android"][data-play]');

  const enableInstallBtn = () => {
    if (!installBtn || mode === 'embedded') return;
    installBtn.hidden = false;
    if (browserPlayBtn) {
      browserPlayBtn.className = 'scroll-card back-btn';
    }
  };

  if (deferredPrompt) {
    enableInstallBtn();
  } else {
    window.addEventListener('beforeinstallprompt', enableInstallBtn, { once: true });
  }

  return new Promise((resolve) => {
    const closeGate = () => {
      el.remove();
      resolve();
    };

    el.querySelectorAll('[data-play]').forEach((btn) => {
      btn.addEventListener('click', closeGate, { once: true });
    });

    installBtn?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') closeGate();
    });

    el.querySelector('[data-open]')?.addEventListener('click', () => {
      const path = `${location.host}${location.pathname}${location.search}${location.hash}`;
      location.href = /android/i.test(navigator.userAgent)
        ? `intent://${path}#Intent;scheme=${location.protocol.replace(':', '')};action=android.intent.action.VIEW;end`
        : `x-safari-https://${path}`;
    });
  });
}
