import { Page } from "@playwright/test";

export async function dismissCookieConsent(page: Page) {
  const consentButton = page.getByRole("button", { name: "Consent" });

  try {
    // Wait up to 3000ms for the button to appear and click it
    await consentButton.click({ timeout: 3000 });
    console.log("Cookie consent dismissed.");
  } catch (e) {
    // If it times out, the pop-up didn't appear (like in Firefox).
    // We safely log it and let the test continue.
    console.log("Cookie consent banner did not appear, skipping.");
  }
}
