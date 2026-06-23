# Playwright E-Commerce Foundation

[![Playwright Tests](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml/badge.svg)](https://github.com/pyardley/Playwright_1_E-Commerce_Foundation/actions/workflows/playwright.yml)

End-to-end test automation for [automationexercise.com](https://automationexercise.com), an e-commerce practice site, built with [Playwright](https://playwright.dev) and TypeScript.

This project is a foundation/reference implementation for structuring a Playwright suite: Page Object Model with composed components, typed fixtures, accessibility-first locators, and traceability back to a documented manual test case.

## What this demonstrates

- **Page Object Model** — each page extends a shared `BasePage` (`pages/`), exposing a `path` and behaviour methods only; no assertions live inside page objects.
- **Composed components** — the site-wide navigation bar (`components/Header.ts`) is a plain class composed into `HomePage` via its constructor, rather than being misrepresented as its own page.
- **Typed fixtures** — page objects are wired into tests through `fixtures/fixtures.ts` (`base.extend<Fixtures>`) instead of being constructed ad hoc inside test bodies.
- **Accessibility-first locators** — `getByRole`/`getByLabel`/`getByText` throughout, with `data-qa` attribute fallbacks (and documented comments) only where the application's own markup has no accessible name to query against — including a couple of real markup bugs discovered and worked around (see comments in `pages/Signup.ts`).
- **Web-first assertions** — `expect(locator).toBeVisible()` auto-retries instead of single-snapshot `textContent()` + `toBe()` checks.
- **Traceability** — `tests/RegisterUser.spec.ts` is commented step-by-step against a documented 18-step manual test case, using `test.step()` for structured, readable reporting.
- **Cross-browser coverage** — the suite runs against Chromium, Firefox, and WebKit.
- **CI** — every push and pull request runs lint, type-check, and the full suite via GitHub Actions (see badge above).

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
