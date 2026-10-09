import { publicOrigin } from "./public-origin";

const VIEWER_MARKUP = `<style>
      :host { color-scheme: light; }
      * { box-sizing: border-box; }
      .badge { display:flex; flex-direction:column; align-items:flex-start; gap:8px; font:500 12px/1.4 system-ui,sans-serif; color:#173f38; }
      a,button { -webkit-tap-highlight-color:transparent; }
      a { display:flex; align-items:center; gap:7px; min-height:40px; padding:4px 12px 4px 4px; border:1px solid #d8d2c6; border-radius:24px; background:#f6f1e7; box-shadow:0 3px 12px #28251f20; color:inherit; text-decoration:none; }
      img { width:30px; height:30px; border-radius:50%; object-fit:cover; }
      a:hover { background:#ebe5d8; }
      a:focus-visible,button:focus-visible { outline:2px solid #287566; outline-offset:3px; }
      .notice { max-width:min(320px,calc(100vw - 24px)); padding:12px 14px; border:1px solid #d8d2c6; border-radius:12px; background:#f6f1e7; box-shadow:0 4px 16px #28251f26; }
      [hidden] { display:none!important; }
      p { margin:0 0 8px; font-size:13px; }
      button { min-height:36px; padding:7px 12px; border:0; border-radius:6px; background:#287566; color:#fff; font:600 12px/1.4 system-ui,sans-serif; cursor:pointer; }
      button:hover { background:#173f38; }
    </style><div class="badge"><div class="notice" hidden><p role="status" aria-live="polite"></p><button type="button">Refresh</button></div><a target="_blank" rel="noopener noreferrer" aria-label="Shared with showmeatsack.com"><img alt="" width="30" height="30"><span>showmeatsack.com</span></a></div>`;

// Kept inside a shadow root so an uploaded page's CSS cannot restyle the controls.
const VIEWER_SCRIPT = String.raw`
(() => {
  const config = __CONFIG__;
  const mount = () => {
    if (window.top !== window.self) return;
    const host = document.createElement('div');
    host.setAttribute('data-showmeatsack-viewer', '');
    host.style.cssText = 'all:initial!important;position:fixed!important;left:max(12px,env(safe-area-inset-left))!important;bottom:max(12px,env(safe-area-inset-bottom))!important;z-index:2147483647!important;display:block!important;max-width:calc(100vw - 24px)!important;';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = __MARKUP__;
    const link = root.querySelector('a');
    link.href = config.productOrigin;
    root.querySelector('img').src = config.productOrigin + '/plugin-icon.png';
    const notice = root.querySelector('.notice');
    const message = root.querySelector('p');
    root.querySelector('button').addEventListener('click', () => window.location.reload());
    document.documentElement.appendChild(host);
    if (!config.revision) return;
    let checking = false;
    let finished = false;
    const check = async () => {
      if (checking || finished || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const response = await fetch(new URL(config.revisionPath, window.location.origin), {
          method: 'HEAD', cache: 'no-store', credentials: 'omit',
          signal: AbortSignal.timeout(10000)
        });
        const revision = response.headers.get('X-Showmeatsack-Revision');
        if (response.ok && revision && revision !== config.revision) {
          notice.hidden = false;
          message.textContent = 'New version available';
          finished = true;
        } else if (response.status === 404 || response.status === 410) {
          notice.hidden = false;
          message.textContent = response.status === 410 ? 'This share has expired' : 'This share is no longer available';
          finished = true;
        }
      } catch { /* A temporary network failure leaves the current page readable. */ }
      finally { checking = false; }
    };
    const timer = window.setInterval(() => { if (finished) window.clearInterval(timer); else void check(); }, 30000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    void check();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
})();`;

export function withShareViewer(html: string, shareId: string, revision?: string): string {
  const config = JSON.stringify({
    productOrigin: publicOrigin(),
    revisionPath: `/s/${encodeURIComponent(shareId)}/`,
    revision,
  }).replace(/</g, "\\u003c");
  // Resolve against the actual view origin, independent of an uploaded <base> tag.
  const script = VIEWER_SCRIPT.replace("__CONFIG__", () => config).replace("__MARKUP__", () =>
    JSON.stringify(VIEWER_MARKUP),
  );
  const widget = `<script data-showmeatsack-viewer>${script}</script>`;
  return `${html}\n${widget}`;
}
