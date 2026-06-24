# Playwright E-Commerce Foundation

[![Playwright Tests](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml/badge.svg)](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml)

End-to-end test automation for [automationexercise.com](https://automationexercise.com), an e-commerce practice site, built with [Playwright](https://playwright.dev) and TypeScript.

This project is a foundation/reference implementation for structuring a Playwright suite: Page Object Model with composed components, typed fixtures, accessibility-first locators, and traceability back to a documented manual test case.

## What this demonstrates

- **Page Object Model** — each page extends a shared `BasePage` (`pages/`), exposing a `path` and behaviour methods only; no assertions live inside page objects.
- **Composed components** — the site-wide navigation bar (`components/Header.ts`) is a plain class composed into `HomePage` via its constructor, rather than being misrepresented as its own page.
- **Typed fixtures** — page objects are wired into tests through `fixtures/fixtures.ts` (`base.extend<Fixtures>`) instead of being constructed ad hoc inside test bodies.
- **API-driven test data setup and teardown** — the `testUser` fixture (`fixtures/fixtures.ts`) provisions a real account via `POST /api/createAccount` before any test that needs one, and tears it down via `DELETE /api/deleteAccount` afterwards, tolerating an already-deleted account (e.g. when the test itself deletes it through the UI) rather than failing teardown. This keeps UI tests focused on the behaviour actually under test instead of re-running a full signup flow just to get a logged-in user, and stops the site's test database from accumulating orphaned accounts every CI run. Getting there involved a real debugging exercise: the API only reads classic form-encoded fields, not a JSON body — a JSON request fails with "name parameter is missing" even though the field is present — and it always replies with HTTP 200, with the real outcome carried in the response body's `responseCode` field instead.
- **Switchable test data source** — `support/testData.ts`'s `buildRegistrationData()` returns today's fixed, deterministic literals by default (used by `npm run test:smoke`), or `@faker-js/faker`-generated values when `TEST_DATA_MODE=faker` is set (used by `npm run test:e2e`). The same registration/account fields (name, address, DOB, etc.) flow through either mode without changing which Playwright tags a test carries — see [Test data modes](#test-data-modes) below.
- **Accessibility-first locators** — `getByRole`/`getByLabel`/`getByText` throughout, with `data-qa` attribute fallbacks (and documented comments) only where the application's own markup has no accessible name to query against — including a couple of real markup bugs discovered and worked around (see comments in `pages/Signup.ts`).
- **Web-first assertions** — `expect(locator).toBeVisible()` auto-retries instead of single-snapshot `textContent()` + `toBe()` checks.
- **Traceability** — every spec file is commented step-by-step against a documented manual test case, using `test.step()` for structured, readable reporting (see [Test coverage](#test-coverage) below).
- **Cross-browser coverage** — the suite runs against Chromium, Firefox, and WebKit.
- **CI** — every push and pull request runs lint, type-check, and the full suite via GitHub Actions (see badge above).

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

## Test data modes

Registration/account data (name, email, password, address, date of birth, etc.) comes from a single factory, `buildRegistrationData()` in `support/testData.ts`, consumed by the `testUser` and `registrationData` fixtures in `fixtures/fixtures.ts`. Which values it returns depends on the `TEST_DATA_MODE` environment variable:

| Mode | How to run | Full underlying command | Data source |
| --- | --- | --- | --- |
| Fixed (default) | `npm run test:smoke`, `npm test` | `playwright test --grep @smoke` | Today's exact hardcoded literals — deterministic, easy to read straight out of a failure message |
| Faker | `npm run test:e2e` | `cross-env TEST_DATA_MODE=faker playwright test --grep @e2e` | `@faker-js/faker`-generated values — broader input coverage, a fresh name/address/etc. every run |

Every test still carries both `@smoke` and `@e2e` tags; the mode is chosen by which npm script runs the suite, not by which tag matched. `country` is restricted to the seven options the site's signup dropdown actually renders (`India`, `United States`, `Canada`, `Australia`, `Israel`, `New Zealand`, `Singapore`), since an unconstrained Faker country would have no matching `<option>`. Email stays uniquified with a timestamp suffix in both modes, since the suite runs `fullyParallel`. The newsletter/special-offers checkboxes are also randomized in Faker mode (both default to checked in fixed mode).

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
| Faker.js-generated test data (name, address, payment, etc.) | mmislej, **This project** (opt-in via `TEST_DATA_MODE=faker` / `npm run test:e2e`) | Tests never collide on shared literals; broader, more realistic input coverage for free | One more dependency; a failure is slightly harder to reproduce exactly without logging the generated values |
| Hardcoded literal test data, made unique only where needed (e.g. email) | **This project** (default / `npm run test:smoke`), telverneck | Simple, deterministic, easy to read straight out of a failure message | Doesn't exercise the same input variety a fuzzed/faker-driven suite would |
| Block ad/consent domains at the network level (`page.route(adDomainRegex, route => route.abort())`) | mmislej | Directly prevents the exact Google Vignette interstitial that intercepted a click in our own `ContactUs.spec.ts`; works identically across all three browsers | Requires maintaining a domain blocklist; could in theory mask a real bug if the app under test legitimately depended on a blocked script |
| Custom Chrome extension for ad-blocking, loaded via a persistent browser context | AppmetryTech | Blocks at the request level before the page even renders | Chromium-only — extensions don't load the same way in Firefox/WebKit; a persistent context also gives up some of the isolation a fresh context-per-test provides |
| Dismiss known overlays defensively, accept the rest as flaky and lean on CI `retries` | **This project** | No added dependency or maintenance surface; matches our own `playwright-anti-patterns` skill's guidance not to over-engineer for a single intermittent flake source | Doesn't prevent the interception, just absorbs it after the fact |
| `getByPlaceholder()` as the primary locator for unlabeled fields | mmislej | Explicit about *why* the locator works — no implicit reliance on accessible-name-from-placeholder fallback rules | Placeholders are themselves a known accessibility anti-pattern (they vanish once typing starts, and screen-reader support is inconsistent); leaning on them doesn't surface that the app lacks real labels |
| `getByRole(..., { name })` relying on the browser's placeholder-as-accessible-name fallback | **This project** | Surfaces missing-label accessibility gaps in the app under test as a side effect of writing the test | More exposed to exact-text/substring collisions — we hit two of these (`Email`, the success-message text) on the Contact Us form alone |
| `data-qa` attributes as the *primary* locator strategy site-wide | mmislej, AppmetryTech | Very stable, since the site ships these attributes specifically for automation | Bypasses real accessibility signals entirely as a default, rather than only as a documented last resort |
| Locators declared once as `readonly` constructor-default properties | mmislej | Less ceremony — no unnecessary `async`/`await` around a synchronous `getByRole`/`locator()` call | Computed once at construction instead of freshly per call (rarely matters here, but is a real semantic difference) |
| Locators returned from `async` getter methods | **This project**, afeefahmedprof93-sy | Consistent call style everywhere; easy to layer scoping logic in later | Unnecessary `async`/`await` ceremony throughout, since `getByRole`/`locator()` were never actually asynchronous |
| One fixtures file per concern (page objects, test data, API client) | mmislej | Each file stays small and focused | More files/imports to navigate for a suite this size |
| A single `fixtures/fixtures.ts` for everything | **This project**, afeefahmedprof93-sy | Simple, everything in one place at this scale | Would need splitting if the suite grew substantially |
| Dedicated API test suite with JSON Schema (AJV) response validation | mmislej | Catches backend contract drift independently of the UI | Meaningful extra surface (schema files, custom matchers) to maintain |
| API calls used only for test-data setup/teardown, not as their own test subject | **This project** | Minimal extra surface; keeps the suite focused on UI behaviour | Doesn't independently verify the API's own response contract |
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
| `npm run test:smoke` | Run only tests tagged `@smoke` (fixed test data)         |
| `npm run test:e2e`   | Run only tests tagged `@e2e` with Faker-generated test data (`TEST_DATA_MODE=faker`) |
| `npm run test:ui`    | Run tests in Playwright's UI mode             |
| `npm run test:headed`| Run tests in headed (visible) browser mode    |
| `npm run report`     | Open the last HTML report                     |
| `npm run lint`       | Run ESLint                                    |
| `npm run typecheck`  | Run the TypeScript compiler in check-only mode |

## License

[MIT](LICENSE)
