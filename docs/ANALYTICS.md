# Analytics — what Credisim measures, and how

Product analytics run on **PostHog (EU cloud)**, **cookieless**, exactly like Suncast and Mont Valier: no cookie, no localStorage, nothing to consent to, so there is **no banner**. The integration is one file, `src/lib/analytics.ts`; the app only ever calls `track(event, props)`.

| | |
|---|---|
| Project | "armo products", id `280761` (shared with Suncast and Mont Valier; every Credisim event carries `product = credisim`, dashboards filter on it) |
| Dashboard | <https://eu.posthog.com/project/280761/dashboard/970853> (Credisim) · <https://eu.posthog.com/project/280761/dashboard/970855> (All products — Overview; Credisim's "engaged session" = `share_link_created`) |
| Host | `https://eu.i.posthog.com` (EU data residency) |
| Token | `phc_rDzj…` in `analytics.ts`: a **public, write-only** project key. It can only send events, not read them, so it is fine in the repo and on the site. |
| Library | `posthog-js` (npm), loaded on demand after the first paint |

Google Analytics (Firebase) was used briefly on 2026-09-23 and removed; `analytics.ts` deletes its leftovers on load (`_ga*` cookies and the old consent choice).

## When it is on

- **On** on `creditsimulator.web.app` (and any other public hostname).
- **Off** on `localhost`, `127.*`, private LAN ranges and `file:`: `track` is a no-op, so local testing never pollutes the numbers.
- `?analytics=1` forces it on anywhere. Those events carry `is_test = true` and the dashboards exclude them. It also turns on PostHog's debug log and exposes the instance as `window.__posthog`, to test the pipeline end to end.
- PostHog drops events from bots, including headless Chrome. For automated tests, override the user agent.

## What every event carries (super properties)

| Property | Values | Meaning |
|---|---|---|
| `product` | `credisim` | Which product in the shared project |
| `locale` | `en` · `fr` | UI language, kept in sync when it changes |
| `is_test` | `true` · absent | Set when `?analytics=1` forced analytics on |

PostHog's defaults add browser/OS, screen size and `$timezone`. **Every URL-like property is scrubbed** before sending (see Privacy).

## Page views

Sent by the app on real navigations only (`capture_pageview: false`), because the address bar is rewritten on every edit. Each `$pageview` carries `route`:

| `route` | Page |
|---|---|
| `/` | Simulator |
| `/tools`, `/tools/<tool>` | Tools index, one tool (e.g. `/tools/check-offer`) |
| `/learn`, `/learn/<topic>` | How it works, one article |

`$pageleave` is on (time on page, bounce rate).

## Custom events

| Event | Properties | Fired when |
|---|---|---|
| `app_started` | `credit_type`; `scenarios` (count); `mode` (`quick` · `expert`); `view` (`sim` · `tools` · `learn`); `start` (`shared_link` · `fresh`); `theme` | Once per load |
| `simulation_opened` | `source` (`short_link` · `saved`); `found` (short link only) | A shared short link or a saved simulation was opened |
| `credit_type_selected` | `credit_type` (`mortgage` · `personal` · `car` · `works`); `embed` (true in the widget) | A credit type was picked |
| `embed_loaded` | `host` (the embedding site's hostname); `credit_type` | The widget was shown on another site (page view `/embed`) |
| `embed_opened` | `host` | "Open the full simulation in Credisim" clicked in the widget |
| `mode_changed` | `mode` | Quick / Detailed switched |
| `scenario_added` | `count` | "Compare with another scenario" |
| `share_link_created` | `short` (true: `/s/<id>`, false: long link) | Share panel opened |
| `share_link_copied` | `short` | "Copy" in the share panel |
| `share_sheet_opened` | `short` | "Share with…" (native share) |
| `simulation_saved` | — | Saved in the browser |
| `report_printed` | — | Print / PDF |
| `schedule_exported` | `format` (`csv`) | CSV export |
| `rental_mode_changed` | `mode` (`simple` · `advanced`) | Rental investment tool: level of detail switched |
| `language_changed` | `from`; `to` | Language switched by hand (automatic detection does not fire it) |
| `theme_changed` | `from`; `to` (`system` · `light` · `dark`) | Theme button clicked |

Deliberately **never** in any event: amounts, rates, incomes, the simulation fragment, short-link ids, or anything typed into a field.

## Adding an event

```ts
import { track } from './lib/analytics';
track('thing_happened', { how: 'button' });
```

- Names: `snake_case`, noun first, past tense (`share_link_created`).
- Properties: short enum strings, booleans and counts. Never a figure the user typed.
- `from` / `to` are reserved for language codes across the project (`language_changed`); use `source` for where something came from.
- `track` is always safe to call (no-op when off). Add the event to the table above.

## Cookieless mode

`posthog.init` runs with `cookieless_mode: 'always'` and `person_profiles: 'never'`, and the project setting **Cookieless tracking** is on (shared with Suncast). The server derives a daily visitor id from a hash of IP + user agent + host with a daily salt: nothing identifying in the browser, no cross-day join. Unique visitors are per day; use sessions and page views for week/month trends. No session replay, no GeoIP (`$timezone` is the country proxy).

## Privacy

- **No cookie, no localStorage, no consent banner.**
- **No person profiles, no `identify`.**
- **Simulations never leave the browser through analytics.** `before_send` scrubs every URL-like property (`$current_url`, `$referrer`, `$pathname`, initial-URL fields…): it drops the `#c=…` / `#s=…` fragment and masks `/s/<id>` as `/s/:id`. `#learn/…` and `#tools/…` are kept (they are page names). Tested in `src/lib/analytics.test.ts`.
- Autocapture masks form inputs; it still records the text of clicked buttons, browser/OS, screen size and time zone.
- The token is write-only; anyone could send junk events with it (true of all browser analytics). Dashboards filter on `product = credisim` and drop `is_test`.
