import type { BrowserContext } from "@playwright/test";
import { test } from "@fixtures/fixtures";

// Known ad/analytics tracking-cookie name prefixes, checked for presence
// before cookie consent is given (see tests/CookieCompliance.spec.ts).
// Unlike support/adBlocklist.ts's domain list - verified live against this
// exact target - these are well-documented public cookie names used by
// Google Analytics/Ads/DoubleClick and Meta Pixel: automationexercise.com's
// own ad network is Google-based (see support/adBlocklist.ts's
// AD_DOMAIN_PATTERN), so the Google-prefixed patterns are the most relevant
// here. Whether any of these actually get set on a given run depends on the
// live ad network's own consent/geo logic, which this team doesn't control -
// that's exactly why the check built on this pattern is report-only, not a
// hard fail.
export const TRACKING_COOKIE_PATTERN =
  /^(_ga|_gid|_gat|_gcl_au|_fbp|_fbc|__gads|__gpi|IDE|test_cookie|NID|ANID|DSID|IABTCF_|FCNEC|FCCDCF)/;

// Report-only, mirroring support/a11y.ts's runAccessibilityScan/checkReflow:
// attaches the full cookie jar and annotates the test, but never fails it -
// whether the live ad network sets a tracking cookie before the user has
// consented is that network's own behaviour, not something this team can
// fix, even though it's the exact thing regulatory cookie-consent rules
// (e.g. GDPR/ePrivacy) require sites to avoid.
export async function checkTrackingCookiesBeforeConsent(
  context: BrowserContext,
) {
  const testInfo = test.info();
  const cookies = await context.cookies();
  const trackingCookies = cookies.filter((cookie) =>
    TRACKING_COOKIE_PATTERN.test(cookie.name),
  );

  await testInfo.attach("pre-consent-cookies.json", {
    body: JSON.stringify(cookies, null, 2),
    contentType: "application/json",
  });

  if (trackingCookies.length > 0) {
    const names = trackingCookies.map((cookie) => cookie.name).join(", ");
    testInfo.annotations.push({
      type: "compliance-tracking-cookie-issue",
      description: `Tracking cookie(s) present before consent: ${names}`,
    });
    console.warn(
      `[compliance] Tracking cookie(s) present before consent: ${names}`,
    );
  } else {
    testInfo.annotations.push({
      type: "compliance-tracking-cookie-ok",
      description: "No known tracking cookies present before consent",
    });
  }

  return { cookies, trackingCookies };
}
