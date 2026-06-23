# Playwright E-Commerce Foundation

[![Playwright Tests](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml/badge.svg)](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml)

End-to-end test automation for [automationexercise.com](https://automationexercise.com), an e-commerce practice site, built with [Playwright](https://playwright.dev) and TypeScript.

This project is a foundation/reference implementation for structuring a Playwright suite: Page Object Model with composed components, typed fixtures, accessibility-first locators, and traceability back to a documented manual test case.

## What this demonstrates

- **Page Object Model** — each page extends a shared `BasePage` (`pages/`), exposing a `path` and behaviour methods only; no assertions live inside page objects.
- **Composed components** — the site-wide navigation bar (`components/Header.ts`) is a plain class composed into `HomePage` via its constructor, rather than being misrepresented as its own page.
- **Typed fixtures** — page objects are wired into tests through `fixtures/fixtures.ts` (`base.extend<Fixtures>`) instead of being constructed ad hoc inside test bodies.
- **API-driven test data setup and teardown** — the `testUser` fixture (`fixtures/fixtures.ts`) provisions a real account via `POST /api/createAccount` before any test that needs one, and tears it down via `DELETE /api/deleteAccount` afterwards, tolerating an already-deleted account (e.g. when the test itself deletes it through the UI) rather than failing teardown. This keeps UI tests focused on the behaviour actually under test instead of re-running a full signup flow just to get a logged-in user, and stops the site's test database from accumulating orphaned accounts every CI run. Getting there involved a real debugging exercise: the API only reads classic form-encoded fields, not a JSON body — a JSON request fails with "name parameter is missing" even though the field is present — and it always replies with HTTP 200, with the real outcome carried in the response body's `responseCode` field instead.
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

## Project structure

```
pages/        Page objects (extend BasePage; path + behaviour methods, no assertions)
components/   Shared widgets composed into page objects (e.g. the nav bar)
fixtures/     Typed Playwright fixtures wiring page objects into tests
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
| `npm run test:smoke` | Run only tests tagged `@smoke`                |
| `npm run test:ui`    | Run tests in Playwright's UI mode             |
| `npm run test:headed`| Run tests in headed (visible) browser mode    |
| `npm run report`     | Open the last HTML report                     |
| `npm run lint`       | Run ESLint                                    |
| `npm run typecheck`  | Run the TypeScript compiler in check-only mode |

## License

[MIT](LICENSE)
