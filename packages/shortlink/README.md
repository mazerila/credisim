# @credisim/shortlink

Short share links for client-side apps, with no server of your own:

- **Codec:** any JSON → compressed, URL-safe string (`deflate-raw` + base64url, built-in browser APIs, no dependency).
- **Short IDs:** store that string under a random 8-character ID and read it back → `https://your.app/s/k7Pq2xZa`.
- **Backends:** Firestore (included), in-memory (tests), or your own with two methods.

Used by Credisim for its "Share" button. Nothing in this package depends on Credisim.

## Install

In this monorepo it is an npm workspace (`packages/shortlink`). In another project, copy the folder or install from git:

```bash
npm install firebase   # only if you use the Firestore backend
```

## Use

```ts
import { createShortLinks, encode, decode } from '@credisim/shortlink';
import { firestoreBackend } from '@credisim/shortlink/firestore';

const links = createShortLinks({
  backend: firestoreBackend(firebaseConfig),   // or an initialised FirebaseApp
  namespace: 'my-app',                         // keeps apps sharing a database apart
  version: 1,                                  // your payload format version
});

// Share
const id = await links.create(await encode(state));
const url = `${location.origin}/s/${id}`;

// Open /s/<id>
const found = await links.resolve(id);          // { payload, version } | null
if (found) state = await decode(found.payload);
```

Serve `index.html` for `/s/**` (Firebase Hosting: `"rewrites": [{ "source": "**", "destination": "/index.html" }]`) and read the id from `location.pathname`.

### Without a database

`encode(state)` alone makes a compact link you can put in the URL fragment (`#c=...`): nothing is stored anywhere, but the link is longer.

## API

| | |
|---|---|
| `encode(value): Promise<string>` | JSON → `z…` (deflated) or `j…` (plain, when compression streams are missing) |
| `decode<T>(s): Promise<T>` | back to the value; throws on malformed input |
| `createShortLinks({ backend, namespace, idLength?, version?, maxLength? })` | returns `{ create(payload), resolve(id) }` |
| `firestoreBackend(appOrConfig, collection = 'links')` | Firestore Lite, loaded only on first use |
| `memoryBackend()` | in-memory store for tests |
| `randomId(length)`, `ID_PATTERN` | 8 characters from an alphabet without 0/O/1/l/I |

A backend implements `get(id)` and `create(id, record)`; `create` must fail if the id exists. `create` retries with a new id on failure.

## Firestore security rules

Anyone may read one link by id or create a new one; nothing can be listed, changed or deleted:

```
match /links/{id} {
  allow get: if id.matches('^[A-Za-z0-9]{6,16}$');
  allow create: if id.matches('^[A-Za-z0-9]{6,16}$')
    && request.resource.data.keys().hasOnly(['d', 'ns', 'v', 'at'])
    && request.resource.data.d is string && request.resource.data.d.size() <= 8000
    && request.resource.data.ns is string && request.resource.data.ns.size() <= 40
    && request.resource.data.v is int
    && request.resource.data.at == request.time;
  allow list, update, delete: if false;
}
```

Optional: set a [TTL policy](https://firebase.google.com/docs/firestore/ttl) on field `at` to delete old links automatically.

## Tests

```bash
npx vitest run packages/shortlink
```
