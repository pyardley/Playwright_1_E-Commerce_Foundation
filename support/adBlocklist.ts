// Root ad/RTB-auction domains observed driving automationexercise.com's real-time-bidding
// ad system. The long tail of 15-20+ vendor domains seen per page load is unpredictable and
// different on every reload, but it's only ever triggered as a consequence of these ~6 root
// domains succeeding - blocking these is sufficient to suppress the entire long tail and is
// far more maintainable than enumerating an ever-changing vendor list (verified live: two
// consecutive unblocked reloads pulled in completely different vendor sets, both downstream
// of the same root calls; blocking the root calls eliminated the long tail entirely).
// fundingchoicesmessages.google.com also renders the cookie-consent dialog itself -
// components/dismissCookieConsent.ts already handles "banner never appears" gracefully.
export const AD_DOMAIN_PATTERN =
  /doubleclick\.net|googlesyndication\.com|2mdn\.net|adtrafficquality\.google|fundingchoicesmessages\.google\.com|imasdk\.googleapis\.com/;
