import { test, expect } from "@fixtures/fixtures";
import { dismissCookieConsent } from "@components/dismissCookieConsent";
import { checkTrackingCookiesBeforeConsent } from "@support/trackingCookies";

// automationexercise.com renders its cookie-consent dialog via
// fundingchoicesmessages.google.com (see support/adBlocklist.ts) - one of
// the root ad domains the blockAdDomains auto-fixture aborts in smoke mode -
// so the banner only has a chance to appear with ad-domain blocking off.
// Run this file with `npm run test:compliance` (TEST_SUITE=e2e, chromium
// only): under smoke mode the banner never appears and there's nothing to
// check.
//
// Fail policy mirrors tests/Accessibility.spec.ts's report-only rationale,
// with one exception. Whether a tracking cookie fires before consent, or
// whether the banner appears at all, is the live ad network's own
// geo/session-dependent behaviour - not something this team controls, so
// it's report-only (attach + annotate, don't fail). But once the banner
// *has* appeared and the user clicks Consent, whether that choice survives a
// reload is the site's own first-party consent-management behaviour - that
// part is deterministic and actionable, so it hard-fails.
test.describe("Cookie & regulatory compliance", () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(
      browserName !== "chromium",
      "Cookie-consent behaviour is the live site's own front-end logic, not browser-engine-specific - run once on chromium only, same as tests/Accessibility.spec.ts",
    );
  });

  test(
    "No known tracking cookies are present before cookie consent is given",
    { tag: ["@compliance"] },
    async ({ homePage, context }) => {
      // Every test gets a fresh, isolated context by default (no
      // storageState configured in playwright.config.ts) - this is already
      // a logged-out session with no prior consent choice.
      await homePage.goto();

      await checkTrackingCookiesBeforeConsent(context);
    },
  );

  test(
    "Cookie consent choice persists across a reload",
    { tag: ["@compliance"] },
    async ({ page, homePage }) => {
      await homePage.goto();

      const consentButton = page.getByRole("button", { name: "Consent" });
      const bannerAppeared = await consentButton
        .waitFor({ state: "visible", timeout: 5000 })
        .then(() => true)
        .catch(() => false);

      test.skip(
        !bannerAppeared,
        "Cookie consent banner did not appear on this run (the live ad network's own geo/session logic) - nothing to verify persistence of",
      );

      await dismissCookieConsent(page);
      await expect(consentButton).toBeHidden();

      const testInfo = test.info();
      await testInfo.attach("post-consent-state.json", {
        body: JSON.stringify(
          {
            cookies: await page.context().cookies(),
            localStorage: await page.evaluate(() =>
              Object.fromEntries(Object.entries(localStorage)),
            ),
          },
          null,
          2,
        ),
        contentType: "application/json",
      });

      await page.reload();

      // The deterministic, hard-fail signal: the site's own consent-
      // management UI shouldn't ask again once a choice has been made.
      await expect(consentButton).not.toBeVisible({ timeout: 5000 });

      testInfo.annotations.push({
        type: "compliance-consent-persisted",
        description: "Consent banner did not reappear after reload",
      });
    },
  );
});
