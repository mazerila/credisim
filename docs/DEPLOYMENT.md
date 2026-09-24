# Deployment

| | |
|---|---|
| Live site | https://creditsimulator.web.app |
| Firebase project | `credisimulator` ([console](https://console.firebase.google.com/project/credisimulator/overview)) |
| Hosting site | `creditsimulator` (set in `firebase.json`; default project in `.firebaserc`) |
| Build output | `dist/` (static, `npm run build`) |
| Firestore | database `(default)` in **europe-west9 (Paris)**, used only for short share links (collection `links`) |

## Automatic deploys (GitHub Actions)

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/firebase-hosting-merge.yml` | every push to `main` (a merged PR or a direct push), or run by hand | type check → tests → build → deploy to the **live** site |
| `.github/workflows/firebase-hosting-pull-request.yml` | every pull request | type check → tests → build → deploy a **preview channel** (expires after 7 days); the preview URL is posted on the PR |

Both workflows use the repository secret **`FIREBASE_SERVICE_ACCOUNT_CREDISIMULATOR`** (a Google service-account key allowed to deploy to Hosting). Until it exists, the checks and build still run and the deploy step is skipped with a warning.

### One-time setup of the secret

From the project folder, in your own terminal (it is interactive and opens GitHub in the browser):

```bash
firebase init hosting:github
```

Answer:

| Question | Answer |
|---|---|
| GitHub repository | `mazerila/credisim` |
| Set up the workflow to run a build script before every deploy? | **Yes**, script `npm ci && npm run build` |
| GitHub workflow file for PR previews exists. Overwrite? | **No** |
| Set up automatic deployment to your site's live channel when a PR is merged? | **Yes**, branch `main` |
| The GitHub workflow file for deploying to the live channel already exists. Overwrite? | **No** |

This creates a service account in the Firebase project, a key for it, and stores the key as the `FIREBASE_SERVICE_ACCOUNT_CREDISIMULATOR` secret in the GitHub repository. The workflow files in the repo stay as they are.

To check: GitHub → repository → Settings → Secrets and variables → Actions. Then re-run the last "Deploy to Firebase Hosting" run (Actions tab → Run workflow).

## Build secrets

| GitHub secret | Used for |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_CREDISIMULATOR` | deploying (created by `firebase init hosting:github`) |
| `FIREBASE_WEB_API_KEY` | the Firebase **web** API key, passed to the build as `VITE_FIREBASE_API_KEY` |

Locally, put the web API key in `.env.local` (git-ignored; see `.env.example`). Without it the app still builds and runs, with short links turned off (long links are used).

### About the web API key

A Firebase web API key is not a password: it identifies the project and is always visible in the site's JavaScript. It is kept out of the repository (GitHub flagged the first commit) and protected by:

- **HTTP-referrer restriction** (Google Cloud → APIs & Services → Credentials → "Browser key (auto created by Firebase)"): only `creditsimulator.web.app`, `creditsimulator.firebaseapp.com`, `credisimulator.web.app`, `credisimulator.firebaseapp.com` and `localhost:5173 / 4173` may use it. Add a custom domain there when you add one. PR preview channels are not in the list, so previews fall back to long share links.
- **API restriction**: Firebase's default list of services (unchanged).
- **Firestore security rules** (`firestore.rules`): everything is closed except reading/creating short links.

## Short share links

The Share button stores the simulation in Firestore under a random id and gives `https://creditsimulator.web.app/s/<id>`. The code is the reusable package `packages/shortlink`. Deploy the rules after changing them:

```bash
firebase deploy --only firestore
```

## Manual deploy

```bash
firebase deploy --only hosting:creditsimulator --project credisimulator   # site
firebase deploy --only firestore        # security rules and indexes
```
`firebase.json` runs the tests and the build first (`predeploy`) for hosting.

## Caching

- `index.html`: `no-cache`, so a new deploy is picked up at once.
- `assets/*`: hashed file names, cached for a year (`immutable`).

## Analytics

PostHog (EU, cookieless, no consent banner), shared "armo products" project with Suncast and Mont Valier. Nothing to deploy: it is part of the app bundle. Details: [ANALYTICS.md](ANALYTICS.md).

## Custom domain (later)

Firebase console → Hosting → site `creditsimulator` → Add custom domain (e.g. `credisim.fr`), then add the DNS records it shows. The `web.app` address keeps working.
