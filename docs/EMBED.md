# Embeddable widget

Any website (a blog, an estate agent, a bank comparison page) can show a compact Credisim simulator.

## Snippet

```html
<div data-credisim data-lang="fr" data-country="FR" data-type="mortgage"></div>
<script src="https://creditsimulator.web.app/embed.js" async></script>
```

The loader (`public/embed.js`, about 1 kB, no dependencies) replaces every `[data-credisim]` element with an iframe of `/embed` and resizes it to its content. Several widgets can share one script.

| Attribute | Values | Default |
|---|---|---|
| `data-lang` | `en` `fr` `de` `es` `it` | visitor's browser language |
| `data-country` | `FR` `BE` `DE` `ES` `IT` `NL` | visitor's time zone / language |
| `data-type` | `mortgage` `personal` `car` `works` | `mortgage` |
| `data-theme` | `light` `dark` | visitor's system setting |
| `data-title` | iframe title for screen readers | "Credisim loan simulator" |

## Without the script

```html
<iframe src="https://creditsimulator.web.app/embed?lang=fr&type=mortgage" title="Credisim" style="width:100%;height:1000px;border:0"></iframe>
```

A fixed height works; to resize it yourself, listen for the widget's message:

```js
window.addEventListener('message', (e) => {
  if (e.origin === 'https://creditsimulator.web.app' && e.data?.type === 'credisim:height') iframe.style.height = e.data.height + 'px';
});
```

A full simulation can be preset by adding a share fragment: `/embed#c=…` (copy it from the address bar of the simulator).

## What the widget shows
Credit type, the input panel (Quick / Detailed), the four key figures (monthly payment, TAEG with the legal maximum in France, cost of credit, debt ratio), the cost breakdown, and a link **Open the full simulation in Credisim** that opens the same numbers in a new tab with charts, schedule and tools. ⓘ links open the explainers on Credisim.

## Privacy and behaviour
- Everything is calculated in the visitor's browser; nothing typed is sent to the host page or to Credisim.
- The widget does not change the visitor's saved Credisim language or theme.
- Analytics are cookieless (see [ANALYTICS.md](ANALYTICS.md)): a `/embed` page view, `embed_loaded` with the host's hostname, and `embed_opened`.

## Code
- `src/lib/embed.ts`: `isEmbed`, `siteHref`, `reportHeight`
- `src/Embed.svelte`: the widget layout
- `src/main.ts`: mounts `Embed` on `/embed` (Firebase serves `index.html` for every path)
- `public/embed.js`: the loader
