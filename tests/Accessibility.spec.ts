import { test, expect } from "@fixtures/fixtures";
import {
  navigateToProductsAndVerify,
  clickSignupLoginLink,
  loginAsTestUserAndVerifyLoggedIn,
  enterNameAndEmailThenSignup,
  fillSignupFormAndCreateAccount,
  deleteAccountAndVerifyDeleted,
  payAndVerifyOrderPlaced,
} from "@support/steps";
import {
  runAccessibilityScan,
  checkReflow,
  getFocusedElementDescriptor,
} from "@support/a11y";

// automationexercise.com is a live third-party site this suite doesn't
// control, so every check below is report-only (see support/a11y.ts) - it
// attaches full results and annotates the test, but only a genuine
// setup/navigation failure fails the test itself. axe-core scans are
// DOM-based and browser-agnostic, so they only need to run once.
test.describe("Accessibility", () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(
      browserName !== "chromium",
      "axe-core scans are DOM-based and browser-agnostic - run once on chromium only",
    );
  });

  test("Home page", { tag: ["@a11y"] }, async ({ homePage, axeBuilder }) => {
    await test.step("Navigate to Home page", async () => {
      await homePage.goto();
    });

    await test.step("Run accessibility scan", async () => {
      await runAccessibilityScan(axeBuilder, "Home page");
    });
  });

  test(
    "Login page",
    { tag: ["@a11y"] },
    async ({ page, homePage, axeBuilder }) => {
      await test.step("Navigate to Login page", async () => {
        await homePage.goto();
        await clickSignupLoginLink(page, homePage.header);
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Login page");
      });
    },
  );

  test(
    "Signup page",
    { tag: ["@a11y"] },
    async ({ page, homePage, loginPage, signupPage, registrationData, axeBuilder }) => {
      await test.step("Navigate to Signup page", async () => {
        await homePage.goto();
        await clickSignupLoginLink(page, homePage.header);
        await enterNameAndEmailThenSignup(
          page,
          loginPage,
          signupPage,
          registrationData.name,
          registrationData.email,
        );
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Signup page");
      });
    },
  );

  test(
    "Products page",
    { tag: ["@a11y"] },
    async ({ page, homePage, productsPage, axeBuilder }) => {
      await test.step("Navigate to Products page", async () => {
        await homePage.goto();
        await navigateToProductsAndVerify(page, homePage, productsPage);
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Products page");
      });
    },
  );

  test(
    "Product Details page",
    { tag: ["@a11y"] },
    async ({ page, homePage, productsPage, axeBuilder }) => {
      await test.step("Navigate to a product's detail page", async () => {
        await homePage.goto();
        await navigateToProductsAndVerify(page, homePage, productsPage);
        const productCard = await productsPage.productList.getProductCard(0);
        await productCard.clickViewProduct();
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Product Details page");
      });
    },
  );

  test(
    "Cart page with an item",
    { tag: ["@a11y"] },
    async ({ page, homePage, cartPage, axeBuilder }) => {
      await test.step("Add a product to the cart and navigate to Cart page", async () => {
        await homePage.goto();
        const productCard = await homePage.productList.getProductCard(0);
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        await homePage.header.clickCartLink();
        await expect(page).toHaveURL(cartPage.path);
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Cart page");
      });
    },
  );

  test(
    "Contact Us page",
    { tag: ["@a11y"] },
    async ({ homePage, axeBuilder }) => {
      await test.step("Navigate to Contact Us page", async () => {
        await homePage.goto();
        await homePage.header.clickContactUsLink();
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Contact Us page");
      });
    },
  );

  test(
    "The Test Cases page",
    { tag: ["@a11y"] },
    async ({ homePage, axeBuilder }) => {
      await test.step("Navigate to Test Cases page", async () => {
        await homePage.goto();
        await homePage.header.clickTestCasesLink();
      });

      await test.step("Run accessibility scan", async () => {
        await runAccessibilityScan(axeBuilder, "Test Cases page");
      });
    },
  );

  test(
    "Added-to-Cart modal (open state)",
    { tag: ["@a11y"] },
    async ({ page, homePage, axeBuilder }) => {
      await test.step("Add a product to the cart and keep the modal open", async () => {
        await homePage.goto();
        const productCard = await homePage.productList.getProductCard(0);
        await productCard.hoverAndClickAddToCart();
        await expect(await homePage.addedToCartModal.getHeader()).toBeVisible();
      });

      // Component-level scan, scoped to just the modal rather than the
      // whole page behind it.
      await test.step("Run accessibility scan scoped to the modal", async () => {
        axeBuilder.include(".modal-content");
        await runAccessibilityScan(axeBuilder, "Added-to-Cart modal");
      });

      await test.step("Verify focus moved into the modal on open (WCAG 2.4.3)", async () => {
        const focusedInModal = await page.evaluate(() => {
          const modal = document.querySelector(".modal-content");
          return (
            !!modal &&
            modal.contains(document.activeElement) &&
            document.activeElement !== document.body
          );
        });
        test.info().annotations.push({
          type: focusedInModal ? "a11y-focus-ok" : "a11y-focus-issue",
          description: focusedInModal
            ? "Focus moved into the Added-to-Cart modal on open"
            : "Focus did not move into the Added-to-Cart modal on open (WCAG 2.4.3)",
        });
      });

      await test.step("Verify focus after closing the modal", async () => {
        const modal = await homePage.addedToCartModal.getModal();
        await homePage.addedToCartModal.clickContinueShoppingBtn();
        await expect(modal).toBeHidden();

        const focusDescriptor = await getFocusedElementDescriptor(page);
        test.info().annotations.push({
          type: "a11y-focus-after-close",
          description: focusDescriptor
            ? `Focus after modal close: <${focusDescriptor.tag}> "${focusDescriptor.accessibleText}"`
            : "Focus after modal close: lost (back on <body>)",
        });
      });
    },
  );

  test(
    "Checkout, Payment, and Payment Done pages",
    { tag: ["@a11y"] },
    async ({
      page,
      homePage,
      loginPage,
      cartPage,
      checkoutPage,
      paymentPage,
      paymentDonePage,
      testUser,
      axeBuilder,
    }) => {
      await test.step("Login, add a product to cart, and proceed to checkout", async () => {
        await homePage.goto();
        await clickSignupLoginLink(page, homePage.header);
        await loginAsTestUserAndVerifyLoggedIn(page, loginPage, homePage, testUser);

        const productCard = await homePage.productList.getProductCard(0);
        await productCard.hoverAndClickAddToCart();
        await homePage.addedToCartModal.clickContinueShoppingBtn();

        await homePage.header.clickCartLink();
        await cartPage.clickProceedToCheckoutButton();
        await expect(page).toHaveURL(checkoutPage.path);
      });

      await test.step("Run accessibility scan on Checkout page", async () => {
        await runAccessibilityScan(axeBuilder, "Checkout page");
      });

      await test.step("Place the order and reach Payment page", async () => {
        await checkoutPage.setCommentInput("Accessibility scan run");
        await checkoutPage.clickPlaceOrderButton();
        await expect(page).toHaveURL(paymentPage.path);
      });

      await test.step("Run accessibility scan on Payment page", async () => {
        await runAccessibilityScan(axeBuilder, "Payment page");
      });

      await test.step("Complete payment and reach Payment Done page", async () => {
        await payAndVerifyOrderPlaced(paymentPage, paymentDonePage);
      });

      await test.step("Run accessibility scan on Payment Done page", async () => {
        await runAccessibilityScan(axeBuilder, "Payment Done page");
      });
    },
  );

  test(
    "Account Created and Account Deleted pages",
    { tag: ["@a11y"] },
    async ({
      page,
      homePage,
      loginPage,
      signupPage,
      accountCreatedPage,
      accountDeletedPage,
      registrationData,
      axeBuilder,
    }) => {
      await test.step("Sign up for a new account", async () => {
        await homePage.goto();
        await clickSignupLoginLink(page, homePage.header);
        await enterNameAndEmailThenSignup(
          page,
          loginPage,
          signupPage,
          registrationData.name,
          registrationData.email,
        );
        await fillSignupFormAndCreateAccount(
          page,
          signupPage,
          accountCreatedPage,
          registrationData,
        );
      });

      await test.step("Run accessibility scan on Account Created page", async () => {
        await runAccessibilityScan(axeBuilder, "Account Created page");
      });

      await test.step("Continue, then delete the account", async () => {
        await accountCreatedPage.clickContinueButton();
        await expect(page).toHaveURL(homePage.path);
        await deleteAccountAndVerifyDeleted(page, homePage.header, accountDeletedPage);
      });

      await test.step("Run accessibility scan on Account Deleted page", async () => {
        await runAccessibilityScan(axeBuilder, "Account Deleted page");
      });
    },
  );

  test(
    "Home and Products pages reflow without horizontal scrolling at 320px",
    { tag: ["@a11y"] },
    async ({ page, homePage, productsPage }) => {
      await test.step("Check Home page reflow", async () => {
        await homePage.goto();
        await checkReflow(page, "Home page");
      });

      await test.step("Check Products page reflow", async () => {
        await navigateToProductsAndVerify(page, homePage, productsPage);
        await checkReflow(page, "Products page");
      });
    },
  );

  test(
    "Header navigation is keyboard operable",
    { tag: ["@a11y"] },
    async ({ page, homePage, productsPage }) => {
      await homePage.goto();

      const reachedProducts = await test.step(
        "Tab from the top of the page until the Products link receives focus",
        async () => {
          const productsLink = await homePage.header.getProductsLink();
          const maxTabs = 30;

          for (let tabs = 1; tabs <= maxTabs; tabs++) {
            await page.keyboard.press("Tab");
            const isFocused = await productsLink.evaluate(
              (el) => el === document.activeElement,
            );
            if (isFocused) {
              test.info().annotations.push({
                type: "a11y-keyboard-ok",
                description: `Products link reached focus after ${tabs} Tab press(es)`,
              });
              return true;
            }
          }

          test.info().annotations.push({
            type: "a11y-keyboard-issue",
            description: `Products link was not reached via Tab within ${maxTabs} presses`,
          });
          return false;
        },
      );

      if (!reachedProducts) return;

      await test.step("Activate the focused Products link with Enter and check navigation", async () => {
        await page.keyboard.press("Enter");
        await page
          .waitForURL(productsPage.path, { timeout: 5000 })
          .catch(() => undefined);

        const navigated = page.url().includes(productsPage.path as string);
        test.info().annotations.push({
          type: navigated ? "a11y-keyboard-ok" : "a11y-keyboard-issue",
          description: navigated
            ? "Enter on the focused Products link navigated to the Products page"
            : "Enter on the focused Products link did not navigate to the Products page",
        });
      });
    },
  );
});
