/**
 * Embedded widget (/embed): a compact simulator for other sites, loaded in an iframe.
 * Options come from the query string: ?lang, ?country, ?type (mortgage|personal|car|works), ?theme (light|dark).
 * Nothing is saved to the visitor's preferences, and links to Credisim open in a new tab.
 */
export const isEmbed = typeof location !== 'undefined' && /^\/embed\/?$/.test(location.pathname);

/** Full Credisim URL for a path inside the app (e.g. '#learn/taeg'): relative on the site, absolute in the widget. */
export function siteHref(hash: string): string {
  return isEmbed ? `${location.origin}/${hash}` : hash;
}

/** Tell the host page how tall the widget is, so the loader script can size the iframe. */
export function reportHeight(el: HTMLElement): () => void {
  if (window.parent === window) return () => {};
  let last = 0;
  const send = () => {
    const h = Math.ceil(el.getBoundingClientRect().height);
    if (h === last) return;
    last = h;
    window.parent.postMessage({ type: 'credisim:height', height: h }, '*');
  };
  const ro = new ResizeObserver(send);
  ro.observe(el);
  send();
  return () => ro.disconnect();
}
