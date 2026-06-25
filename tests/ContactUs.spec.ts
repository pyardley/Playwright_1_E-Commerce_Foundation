import { test, expect } from "@fixtures/fixtures";
import { navigateToHomeAndVerify } from "@support/steps";

// Test Case 6: Contact Us Form
test(
  "Contact Us Form",
  { tag: ["@smoke", "@e2e"] },
  async ({ page, homePage, contactUsPage }) => {
    // Step 1: Launch browser
    // Handled automatically by Playwright's `page` fixture - no action needed.

    await test.step("Steps 2-3: Navigate to url and verify that home page is visible successfully", async () => {
      await navigateToHomeAndVerify(page, homePage);
    });

    await test.step("Steps 4-5: Click 'Contact Us' button and verify 'GET IN TOUCH' is visible", async () => {
      // Step 4: Click on 'Contact Us' button
      await homePage.header.clickContactUsLink();
      await expect(page).toHaveURL(contactUsPage.path);

      // Step 5: Verify 'GET IN TOUCH' is visible
      await expect(await contactUsPage.getGetInTouchHeading()).toBeVisible();
    });

    await test.step("Steps 6-10: Enter details, upload a file, submit, and verify the success message is visible", async () => {
      // Step 6: Enter name, email, subject and message
      await contactUsPage.setNameInput("John Doe");
      await contactUsPage.setEmailInput("john.doe@example.com");
      await contactUsPage.setSubjectInput("Test Subject");
      await contactUsPage.setMessageInput(
        "This is a test message for the Contact Us form.",
      );

      // Step 7: Upload file
      await contactUsPage.setFileUpload(
        "attachment.txt",
        "This is a test attachment for the Contact Us form.",
      );

      // Step 8: Click 'Submit' button
      // Step 9: Click OK button - the native browser confirm() dialog is
      // accepted automatically inside clickSubmitButton(), since Playwright
      // must register the dialog listener before the click that triggers it.
      await contactUsPage.clickSubmitButton();

      // Step 10: Verify success message 'Success! Your details have been
      // submitted successfully.' is visible
      await expect(await contactUsPage.getSuccessMessage()).toBeVisible();
    });

    await test.step("Steps 11: Click 'Home' button and verify that landed to home page successfully", async () => {
      // Step 11: Click 'Home' button and verify that landed to home page successfully
      await contactUsPage.clickHomeButton();
      await expect(page).toHaveURL(homePage.path);
    });
  },
);
