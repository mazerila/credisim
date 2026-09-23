# Deployment

| | |
|---|---|
| Live site | https://creditsimulator.web.app |
| Firebase project | `credisimulator` ([console](https://console.firebase.google.com/project/credisimulator/overview)) |
| Hosting site | `creditsimulator` (set in `firebase.json`; default project in `.firebaserc`) |
| Build output | `dist/` (static, `npm run build`) |

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

## Manual deploy

```bash
firebase deploy --only hosting
```
`firebase.json` runs the tests and the build first (`predeploy`).

## Caching

- `index.html`: `no-cache`, so a new deploy is picked up at once.
- `assets/*`: hashed file names, cached for a year (`immutable`).

## Analytics and consent

Google Analytics (Firebase, measurement ID `G-HPYXNLX87L`) is loaded **only on the production build and only after the visitor clicks "Accept"** in the consent banner (CNIL rules). The choice is stored in the browser (`credisim.consent`) and can be changed with "Cookie settings" in the footer.

What is sent: page views (route only, e.g. `/tools/check-offer`, never the `#s=` simulation) and feature events: `select_credit_type`, `add_scenario`, `share`, `save_simulation`, `print`, `export_csv`. No amounts, rates or other figures.

The Firebase web config in `src/lib/firebase/config.ts` is public by design (it identifies the app; it is not a secret).

## Custom domain (later)

Firebase console → Hosting → site `creditsimulator` → Add custom domain (e.g. `credisim.fr`), then add the DNS records it shows. The `web.app` address keeps working.
