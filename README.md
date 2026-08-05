# Playwright E-Commerce Foundation

[![Playwright Tests](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml/badge.svg)](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml)

End-to-end test automation for [automationexercise.com](https://automationexercise.com), an e-commerce practice site, built with [Playwright](https://playwright.dev) and TypeScript.

This project is a foundation/reference implementation for structuring a Playwright suite: Page Object Model with composed components, typed fixtures, accessibility-first locators, and traceability back to a documented manual test case.

## What this demonstrates

- **Page Object Model** — each page extends a shared `BasePage` (`pages/`), exposing a `path` and behaviour methods only; no assertions live inside page objects.
- **Composed components** — the site-wide navigation bar (`components/Header.ts`) is a plain class composed into `HomePage` via its constructor, rather than being misrepresented as its own page.
- **Typed fixtures** — page objects are wired into tests through `fixtures/fixtures.ts` (`base.extend<Fixtures>`) instead of being constructed ad hoc inside test bodies.
- **API-driven test data setup and teardown** — the `testUser` fixture (`fixtures/fixtures.ts`) provisions a real account via `POST /api/createAccount` before any test that needs one, and tears it down via `DELETE /api/deleteAccount` afterwards, tolerating an already-deleted account (e.g. when the test itself deletes it through the UI) rather than failing teardown. This keeps UI tests focused on the behaviour actually under test instead of re-running a full signup flow just to get a logged-in user, and stops the site's test database from accumulating orphaned accounts every CI run. Getting there involved a real debugging exercise: the API only reads classic form-encoded fields, not a JSON body — a JSON request fails with "name parameter is missing" even though the field is present — and it always replies with HTTP 200, with the real outcome carried in the response body's `responseCode` field instead.
- **Switchable test data source, ad-blocking, and retries — all driven by one `TEST_SUITE` env var** — `support/testData.ts`'s `buildRegistrationData()` returns today's fixed, deterministic literals by default (used by `npm run test:smoke`), or `@faker-js/faker`-generated values when `TEST_SUITE=e2e` is set (used by `npm run test:e2e`). The same variable also toggles ad-domain network blocking (on for smoke, off for e2e) and Playwright `retries` (0 for smoke, 2 for e2e). See [Test suites](#test-suites-test_suitesmokee2e) below.
- **Accessibility-first locators** — `getByRole`/`getByLabel`/`getByText` throughout, with `data-qa` attribute fallbacks (and documented comments) only where the application's own markup has no accessible name to query against — including a couple of real markup bugs discovered and worked around (see comments in `pages/SignupPage.ts`).
- **Web-first assertions** — `expect(locator).toBeVisible()` auto-retries instead of single-snapshot `textContent()` + `toBe()` checks.
- **Traceability** — every spec file is commented step-by-step against a documented manual test case, using `test.step()` for structured, readable reporting (see [Test coverage](#test-coverage) below).
- **Cross-browser coverage** — the suite runs against Chromium, Firefox, and WebKit.
- **CI** — every push and pull request runs lint, type-check, then both the smoke suite (fixed data) and the e2e suite (Faker-generated data) as separate staged steps, each uploading its own HTML report artifact, via GitHub Actions (see badge above).
- **Automated accessibility auditing, rule-based and AI-assisted** — `tests/Accessibility.spec.ts` runs an [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.1 A/AA + best-practice) scan against every reachable page and the Added-to-Cart modal, plus a keyboard-operability check and a 320px reflow check (WCAG 1.4.10) it doesn't cover. `tests/AccessibilityAi.spec.ts` goes a step further for the one thing static rules can't judge — whether an image's alt text is actually *meaningful* — by asking a vision-capable Claude model to evaluate it directly. See [Accessibility testing](#accessibility-testing) below.
- **API contract & schema validation** — `support/schemas.ts` defines [Zod](https://zod.dev) schemas for every API endpoint this suite touches (`createAccount`, `deleteAccount`, `productsList`, `brandsList`, `searchProduct`), derived from automationexercise.com's own [published API docs](https://automationexercise.com/api_list) plus live responses. `validateResponse()` is wired directly into the `testUser` fixture's `createUserViaApi`/`deleteUserViaApi` calls (`fixtures/fixtures.ts`) — every test that uses that fixture is protected with zero changes to the test itself — and `tests/Api.spec.ts` adds explicit, intentional coverage of the read-only endpoints. See [API contract validation](#api-contract-validation) below.
- **Per-test performance trending, local-only** — a custom reporter (`reporters/perfReporter.ts`) and an auto-fixture (`capturePerf` in `fixtures/fixtures.ts`) capture every test's execution duration plus real browser page-load performance (Navigation Timing, Largest Contentful Paint, Cumulative Layout Shift) and persist it to a local Postgres database — with zero changes needed in any individual test. Deliberately never collected in CI. See [Performance data](#performance-data) below.

## Test coverage

| Spec file | Test case |
| --- | --- |
| `tests/RegisterUser.spec.ts` | Register User |
| `tests/RegisterUser.spec.ts` | Register User with existing email |
| `tests/LoginUser.spec.ts` | Login User with correct email and password |
| `tests/LoginUser.spec.ts` | Login User with incorrect email and password |
| `tests/LoginUser.spec.ts` | Logout User |
| `tests/ContactUs.spec.ts` | Contact Us Form |
| `tests/seed.spec.ts` | Baseline connectivity smoke check |

## Test suites (`TEST_SUITE=smoke|e2e`)

A single environment variable, `TEST_SUITE`, drives three independent concerns at once: registration/account test data source (`buildRegistrationData()` in `support/testData.ts`), ad-domain network blocking (`blockAdDomains` auto-fixture in `fixtures/fixtures.ts`, using the pattern in `support/adBlocklist.ts`), and Playwright `retries` (`playwright.config.ts`).

| Mode | How to run | Full underlying command | Data source | Ad-domain blocking | Retries |
| --- | --- | --- | --- | --- | --- |
| `smoke` (default) | `npm run test:smoke`, `npm test` | `cross-env TEST_SUITE=smoke playwright test --grep @smoke` | Today's exact hardcoded literals — deterministic, easy to read straight out of a failure message | **On** — root ad/RTB domains aborted via `page.route()` | 0 |
| `e2e` | `npm run test:e2e` | `cross-env TEST_SUITE=e2e playwright test --grep @e2e` | `@faker-js/faker`-generated values — broader input coverage, a fresh name/address/etc. every run | **Off** | 2 |

Every test still carries both `@smoke` and `@e2e` tags; the mode is chosen by which npm script runs the suite, not by which tag matched. An `auto: true` fixture (`blockAdDomains`) applies the ad-block decision to every test's `page` automatically — no test or page object opts in/out individually. `country` is restricted to the seven options the site's signup dropdown actually renders (`India`, `United States`, `Canada`, `Australia`, `Israel`, `New Zealand`, `Singapore`), since an unconstrained Faker country would have no matching `<option>`. Email stays uniquified with a timestamp suffix in both modes, since the suite runs `fullyParallel`. The newsletter/special-offers checkboxes are also randomized in `e2e` mode (both default to checked in `smoke` mode).

### Why block ad domains for smoke but not e2e

automationexercise.com runs a real ad-tech/RTB auction system that's the root cause of much of this suite's observed flakiness (intercepted clicks, ad redirects hijacking navigation, the cookie-consent overlay). An unblocked page load pulls in 15-20+ ad/RTB vendor domains that are completely different and unpredictable between two consecutive reloads of the *same* page — verified live: one reload pulled in `tribalfusion.com`, `criteo.com`, `outbrain.com`, `rfihub.com`, and a dozen others; the very next reload pulled in a totally different set (`applovin.com`, `adform.net`, `smartadserver.com`, etc.). Both reloads, however, shared the exact same ~6 *root* domains (`doubleclick.net`, `googlesyndication.com`, `2mdn.net`, `adtrafficquality.google`, `fundingchoicesmessages.google.com`, `imasdk.googleapis.com`). Blocking just those roots made the entire unpredictable long tail disappear — so the blocklist in `support/adBlocklist.ts` stays small and maintainable rather than trying to enumerate an ever-changing vendor list.

`fundingchoicesmessages.google.com` also renders the cookie-consent dialog itself, so in `smoke` mode the banner typically never appears at all — `components/dismissCookieConsent.ts`'s existing try/catch (already built for "banner didn't appear, e.g. in Firefox") handles this gracefully with no extra code.

`e2e` mode deliberately leaves ad traffic unblocked and compensates with `retries: 2` instead — broader, more realistic conditions at the cost of occasional retries, mirroring how that suite already accepts broader Faker-driven input variety over `smoke`'s determinism.

## Accessibility testing

`tests/Accessibility.spec.ts` runs an [axe-core](https://github.com/dequelabs/axe-core) scan (via [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright)'s `AxeBuilder`, tagged `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`best-practice`) against every reachable page - Home, Login, Signup, Products, Product Details, Cart, Checkout, Payment, Payment Done, Account Created, Account Deleted, Contact Us, Test Cases - plus a component-scoped scan of the Added-to-Cart modal in its open state. It also runs two checks axe-core doesn't cover: a keyboard-operability check (can the header's Products link be reached by `Tab` and activated with `Enter`?) and a 320px-viewport reflow check (WCAG 1.4.10 - does the page avoid horizontal scrolling at mobile width?).

### Report-only by design

Every one of these checks is **report-only**: it attaches full results (raw JSON, and a formatted violation summary) to the HTML report and adds a Playwright annotation, but it never fails the test on a violation alone. A test only fails here if the setup/navigation itself breaks. This is a deliberate mirror of the [ad-blocking rationale](#why-block-ad-domains-for-smoke-but-not-e2e) above: `automationexercise.com` is a live third-party site this suite doesn't control, so a hard-fail policy would just make the suite permanently red for defects nobody here can fix. Two real ones already exist and are worked around elsewhere in this codebase - see the comments in `pages/SignupPage.ts` on the Day/Month/Year selects (no accessible name) and the mislabeled Zipcode `<label for="city">` - and this scan is what would have caught them automatically instead of by hand.

Run it with `npm run test:a11y`, then `npm run report -- playwright-report-a11y` (or open `playwright-report-a11y/index.html`) to see the attachments and annotations per test.

### AI-assisted check

`tests/AccessibilityAi.spec.ts` targets the one gap rule-based scanning structurally can't close: axe-core can confirm a product image *has* alt text, but not whether that text actually describes the image. This test screenshots each of the first three product images and asks a vision-capable Claude model to judge whether the alt text is meaningful or just generic/keyword-stuffed/missing, attaching the image and the model's verdict (with reasoning) to the report - report-only for the same reason as above, plus an LLM judgment isn't a deterministic pass/fail signal in the first place.

It's entirely opt-in: `test.skip()`s cleanly (not a failure) without an `ANTHROPIC_API_KEY` in `.env`, and the CI step that runs it (`npm run test:a11y:ai`) only executes if that key is configured as a repository secret - otherwise it's a no-op, same as the commented-out `webServer` block in `playwright.config.ts`.

### What's out of scope (for now)

The rest of the "AI-assisted" accessibility techniques worth knowing about - comparing visual layout order against DOM order (WCAG 1.3.2), simulating a screen-reader user through dynamic focus traps, judging whether a form's validation error message is actually *helpful* rather than just present - aren't implemented here. They'd need either much heavier per-test tooling (visual diffing, an accessibility-tree-to-screen-reader simulation) or a subjective LLM judgment call on something this suite doesn't have a strong opinion on yet. The one AI check above was chosen because it has a clean, bounded, one-image-in-one-verdict-out shape; the rest are a reasonable next step, not a gap in today's coverage.

## API contract validation

`support/schemas.ts` defines a [Zod](https://zod.dev) schema for every automationexercise.com API endpoint this suite calls: `createAccount`, `deleteAccount` (used by the `testUser` fixture), plus the read-only `productsList`, `brandsList`, and `searchProduct`. Schemas are derived from the site's own [published API list](https://automationexercise.com/api_list) - which documents each endpoint's parameters and `responseCode` in prose, but not exact JSON field names - cross-checked against real responses observed while building this file, rather than reverse-engineered from scratch.

### Hard-fail by design

Unlike the accessibility and (future) visual-regression checks, API contract validation **hard-fails**: `validateResponse()` throws a readable diff (the failing field paths, the Zod error messages, and the raw response body) the moment a response doesn't match its schema. This is deliberately the opposite policy to [Accessibility testing](#accessibility-testing)'s report-only stance - a broken API contract on this site's own documented endpoints is a real, actionable regression this team can respond to, not noise from third-party page content nobody here controls.

### Where it's wired in

- **`fixtures/fixtures.ts`** - `createUserViaApi`/`deleteUserViaApi` (used by the `testUser` fixture) validate every response before checking its `responseCode`. This is the highest-leverage part: every test that consumes `testUser` is protected without changing a single test file. It's also exactly the failure mode this suite already hit once for real - the form-vs-JSON body quirk documented above - just caught automatically next time instead of by hand.
- **`tests/Api.spec.ts`** (tagged `@api`) - explicit, intentional coverage of the read-only endpoints: a successful `productsList`/`brandsList`/`searchProduct` call against their success schema, plus `searchProduct`'s documented 400 (missing `search_product`) against a shared error schema. Run with `npm run test:api`.

## Performance data

Every test run (locally) writes one row per test to a local Postgres database via `reporters/perfReporter.ts`: execution duration, status, retry count, git SHA/branch, and — for tests that navigate a page — a `web_vitals` JSON array with one entry per navigation (`ttfbMs`, `domContentLoadedMs`, `loadMs`, `lcpMs`, `cls`). Capturing those web vitals is `capturePerf`, an `auto: true` fixture in `fixtures/fixtures.ts`: it injects a `PerformanceObserver`-based script (`support/perf.ts`) before every navigation via `page.addInitScript()`, and reads it back after a settle frame following each `domcontentloaded` event, all without any individual test needing to opt in.

### Local-only by design

This is deliberately **never collected in CI** — `reporters/perfReporter.ts` is only added to `playwright.config.ts`'s `reporter` array when `process.env.CI` is unset, and `capturePerf` no-ops immediately when it is. There's no Postgres instance on a CI runner to write to, and instrumenting every page load adds real overhead to already-somewhat-slow live-site CI runs for no benefit if nothing's there to receive it.

### Getting started

```bash
npm run perf:db:up          # starts a local Postgres in Docker (docker-compose.yml)
cp .env.example .env         # PERF_DB_URL already matches the compose defaults
npm run test:smoke           # or any other test script - perf data is captured automatically
```

The table (`perf_results`, schema in `db/schema.sql`) is created automatically on first run if it doesn't exist. Point Grafana's built-in PostgreSQL data source at the same `PERF_DB_URL` — no plugin needed — for a query like:

```sql
SELECT recorded_at AS time, duration_ms
FROM perf_results
WHERE title = 'Home page'
ORDER BY recorded_at;
```

### Known limitations

- **CLS is Chromium-only; LCP works everywhere.** Both metrics are feature-detected via `PerformanceObserver.supportedEntryTypes` rather than assumed, so nothing throws either way — but verified live, `layout-shift` is only implemented in Chromium (`cls` is `null` on Firefox/WebKit), while `largest-contentful-paint` is actually supported on all three. Navigation Timing (`ttfbMs`/`domContentLoadedMs`/`loadMs`) always works.
- **Captured on `domcontentloaded`, not `load` — and that's deliberate.** `load` only fires once every sub-resource (every product thumbnail on an image-heavy grid page, for example) has finished, and a multi-navigation test typically clicks through to the next page as soon as the DOM is ready - so the browser can end up never dispatching `load` at all for an intermediate page navigated away from first (verified live on the Products page). `domcontentloaded` fires much earlier and isn't subject to that race. The tradeoff: `loadMs` reads as `0` whenever the real `load` event genuinely hadn't fired yet at capture time - expected for pages the test only passes through, not a bug.
- **A snapshot, not full RUM.** LCP and CLS both keep accumulating until a visibility change or user input, not just until `domcontentloaded` - this suite reads them shortly after, plus one settle frame, which typically undercounts both versus a real user-monitoring measurement. This is trend visibility for local dev runs, not a Lighthouse/RUM replacement, and is called out here rather than presented as lab-grade.
- **No config beyond a running Postgres.** Without `PERF_DB_URL` set (or without Postgres reachable), the suite still runs and passes normally — the reporter logs a one-line notice and skips persistence rather than failing the run.

## How this compares to other automationexercise.com Playwright suites

automationexercise.com is a niche QA-practice target, not a widely-starred open-source project — there's no single dominant framework for it. Searching GitHub for Playwright suites against this site (as of June 2026) turned up mostly 0–1★ student exercises; the four most-starred Playwright-specific ones are reviewed below:

| Repo | Stars | Notes |
| --- | --- | --- |
| [mmislej/playwright-automation-framework-portfolio](https://github.com/mmislej/playwright-automation-framework-portfolio) | 9 | The most complete of the four: 26 UI scenarios + a separate API layer with JSON Schema validation |
| [AppmetryTech/Playwright_js_Framework](https://github.com/AppmetryTech/Playwright_js_Framework) | 3 | JS, adds visual regression testing and a custom ad-blocking browser extension |
| [telverneck/playwright-automationexercise](https://github.com/telverneck/playwright-automationexercise) | 3 | Allure reporting, multi-environment config (`ENV=staging`) |
| [afeefahmedprof93-sy/playwright-ui-automation-lab](https://github.com/afeefahmedprof93-sy/playwright-ui-automation-lab) | 2 | Closest in scope/structure to this project; adds a mobile (Pixel 5) viewport project |

### Approaches compared

| Approach | Seen in | Advantage | Disadvantage |
| --- | --- | --- | --- |
| Faker.js-generated test data (name, address, payment, etc.) | mmislej, **This project** (opt-in via `TEST_SUITE=e2e` / `npm run test:e2e`) | Tests never collide on shared literals; broader, more realistic input coverage for free | One more dependency; a failure is slightly harder to reproduce exactly without logging the generated values |
| Hardcoded literal test data, made unique only where needed (e.g. email) | **This project** (default / `npm run test:smoke`), telverneck | Simple, deterministic, easy to read straight out of a failure message | Doesn't exercise the same input variety a fuzzed/faker-driven suite would |
| Block ad/consent domains at the network level (`page.route(adDomainRegex, route => route.abort())`) | mmislej, **This project** (`smoke` mode only, via the `blockAdDomains` auto-fixture + `support/adBlocklist.ts`) | Directly prevents the exact Google Vignette interstitial that intercepted a click in our own `ContactUs.spec.ts`; works identically across all three browsers | Requires maintaining a domain blocklist; could in theory mask a real bug if the app under test legitimately depended on a blocked script |
| Custom Chrome extension for ad-blocking, loaded via a persistent browser context | AppmetryTech | Blocks at the request level before the page even renders | Chromium-only — extensions don't load the same way in Firefox/WebKit; a persistent context also gives up some of the isolation a fresh context-per-test provides |
| Dismiss known overlays defensively, accept the rest as flaky and lean on `retries` | **This project** (`e2e` mode, where ad-blocking is deliberately off) | No added dependency or maintenance surface beyond the blocklist already used for `smoke`; matches our own `playwright-anti-patterns` skill's guidance not to over-engineer for a single intermittent flake source | Doesn't prevent the interception, just absorbs it after the fact |
| `getByPlaceholder()` as the primary locator for unlabeled fields | mmislej | Explicit about *why* the locator works — no implicit reliance on accessible-name-from-placeholder fallback rules | Placeholders are themselves a known accessibility anti-pattern (they vanish once typing starts, and screen-reader support is inconsistent); leaning on them doesn't surface that the app lacks real labels |
| `getByRole(..., { name })` relying on the browser's placeholder-as-accessible-name fallback | **This project** | Surfaces missing-label accessibility gaps in the app under test as a side effect of writing the test | More exposed to exact-text/substring collisions — we hit two of these (`Email`, the success-message text) on the Contact Us form alone |
| `data-qa` attributes as the *primary* locator strategy site-wide | mmislej, AppmetryTech | Very stable, since the site ships these attributes specifically for automation | Bypasses real accessibility signals entirely as a default, rather than only as a documented last resort |
| Locators declared once as `readonly` constructor-default properties | mmislej | Less ceremony — no unnecessary `async`/`await` around a synchronous `getByRole`/`locator()` call | Computed once at construction instead of freshly per call (rarely matters here, but is a real semantic difference) |
| Locators returned from `async` getter methods | **This project**, afeefahmedprof93-sy | Consistent call style everywhere; easy to layer scoping logic in later | Unnecessary `async`/`await` ceremony throughout, since `getByRole`/`locator()` were never actually asynchronous |
| One fixtures file per concern (page objects, test data, API client) | mmislej | Each file stays small and focused | More files/imports to navigate for a suite this size |
| A single `fixtures/fixtures.ts` for everything | **This project**, afeefahmedprof93-sy | Simple, everything in one place at this scale | Would need splitting if the suite grew substantially |
| Dedicated API test suite with JSON Schema (AJV) response validation | mmislej | Catches backend contract drift independently of the UI | Meaningful extra surface (schema files, custom matchers) to maintain |
| API contract validation wired into both the test-data fixture and a dedicated read-only test suite (Zod, hard-fail) | **This project** (`support/schemas.ts`, `tests/Api.spec.ts` - see [API contract validation](#api-contract-validation)) | Protects every test using `testUser` for free, plus explicit coverage of the read-only endpoints, with a TypeScript-first schema library (no separate JSON Schema files) | Meaningful extra surface (schema file, `validateResponse` helper) to maintain, same as mmislej's approach |
| Auto-deploy the HTML report to GitHub Pages on every run | mmislej | A live, clickable report link for a portfolio — not just a pass/fail badge | Extra CI permissions/steps; publishes trace/screenshot data publicly, which may not always be desirable |
| Playwright's built-in HTML reporter only | **This project**, mmislej (also), afeefahmedprof93-sy | Zero extra dependency, already gitignored | Less rich cross-run trend/history view than a dedicated reporting tool |
| Mobile viewport project (e.g. `devices['Pixel 5']`) | afeefahmedprof93-sy | Responsive-layout coverage for free | Multiplies CI time; only worth it if the app's mobile layout genuinely differs |

### Anti-patterns observed in the wild

Two of the four repos illustrate risks worth naming explicitly, rather than treating as reasonable tradeoffs:

- **A committed `storageState`-style file containing real session cookies.** AppmetryTech's repo includes an `auth.json` at the repo root with live-looking session cookie values, not excluded by `.gitignore`. This is the exact risk our own `playwright-anti-patterns` skill flags under "shared/committed `storageState`" — auth state files should never be committed, since they can be replayed to impersonate a session.
- **Generated test-output directories committed to git.** telverneck's repo has an `allure-results/`/`allure-report/` tree with hundreds of generated files (including `.webm` recordings) checked in; afeefahmedprof93-sy's has a committed `test-results/` (screenshots, `trace.zip`, video) plus stray `.DS_Store` files. Neither is a flaw in Allure or Playwright's reporter — it's a `.gitignore` gap. This project's `.gitignore` already excludes `test-results/`, `playwright-report/`, and `.env`, so it doesn't have this problem.

## Project structure

```
pages/        Page objects (extend BasePage; path + behaviour methods, no assertions)
components/   Shared widgets composed into page objects (e.g. the nav bar)
fixtures/     Typed Playwright fixtures wiring page objects into tests
support/      Shared test.step bodies and the test data factory (no fixtures of their own)
reporters/    Custom Playwright reporters (perf data -> local Postgres, local-only)
db/           SQL schema for the local performance-data Postgres database
tests/        Spec files
.claude/      Agent definitions for plan -> generate -> heal workflows (optional tooling)
```

## Getting started

```bash
npm install
npx playwright install
cp .env.example .env
npm test
```

## Available scripts

| Script               | Description                                  |
| -------------------- | --------------------------------------------- |
| `npm test`           | Run the full suite across all browsers        |
| `npm run test:smoke` | Run only tests tagged `@smoke` (`TEST_SUITE=smoke`: fixed test data, ad-domain blocking on, 0 retries) |
| `npm run test:e2e`   | Run only tests tagged `@e2e` (`TEST_SUITE=e2e`: Faker-generated test data, ad-domain blocking off, 2 retries) |
| `npm run test:ui`    | Run tests in Playwright's UI mode             |
| `npm run test:headed`| Run tests in headed (visible) browser mode    |
| `npm run test:a11y`  | Run the axe-core accessibility scan (`@a11y`, Chromium only, report-only - see [Accessibility testing](#accessibility-testing)) |
| `npm run test:a11y:ai` | Run the AI-assisted alt-text check (`@ai-a11y`, Chromium only, skips without `ANTHROPIC_API_KEY`) |
| `npm run test:api`   | Run the API contract/schema validation tests (`@api`, Chromium only, hard-fail - see [API contract validation](#api-contract-validation)) |
| `npm run perf:db:up` | Start the local Postgres container for performance data (see [Performance data](#performance-data)) |
| `npm run perf:db:down` | Stop the local Postgres container |
| `npm run report`     | Open the last HTML report                     |
| `npm run lint`       | Run ESLint                                    |
| `npm run typecheck`  | Run the TypeScript compiler in check-only mode |

## Known gaps

- **No flake budget.** There's no documented retry-rate threshold or quarantine policy for chronically flaky tests (this suite hits a live third-party site, so some flakiness is expected — see the parallel-load notes in commit history). If a test starts failing intermittently, decide explicitly whether to fix it, quarantine it with a linked issue, or accept the flake rate, rather than letting it linger unaddressed.
- **No cross-run trend visibility in CI.** The HTML reporter (`npm run report`) only shows the most recent run, and CI doesn't persist anything beyond that. Locally, [Performance data](#performance-data) now gives duration/status/web-vitals trending via Postgres + Grafana - but that's local-only by design (see the section above for why), so CI itself still has no dashboard tracking pass-rate or flake-rate across runs over time. Worth revisiting if flakiness becomes a recurring problem rather than an occasional one.

## License

[MIT](LICENSE)
