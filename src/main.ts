import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { parseRoute } from './lib/router.svelte';
import { isShortPath, stateFromShortPath } from './lib/shortlinks';
import { applyShared, detectCountry, loadHash } from './lib/state.svelte';
import { i18n } from './lib/i18n/index.svelte';
import { track } from './lib/analytics';

// Load a shared simulation before the first render: a short link (/s/<id>) or a fragment (#c=… / #s=…).
async function start() {
  if (isShortPath()) {
    const s = await stateFromShortPath();
    if (s) applyShared(s);
    track('simulation_opened', { source: 'short_link', found: !!s });
    // Continue at the root: from now on the address bar holds the live simulation.
    history.replaceState(null, '', '/' + location.hash);
  } else if (parseRoute() || !(await loadHash())) {
    // No shared simulation: start from the visitor's likely country.
    detectCountry(i18n.lang);
  }
  mount(App, { target: document.getElementById('app')! });
}

void start();
