import { expect } from "@fixtures/fixtures";
import type { Page } from "@playwright/test";
import type { HomePage } from "@pages/HomePage";
import type { LoginPage } from "@pages/LoginPage";
import type { AccountDeletedPage } from "@pages/AccountDeletedPage";
import type { ProductsPage } from "@pages/ProductsPage";
import type { TestUser } from "@fixtures/fixtures";

export async function navigateToHomeAndVerify(page: Page, homePage: HomePage) {
  await homePage.goto();
  await expect(page).toHaveURL("/");
  const homeLink = await homePage.header.getHomeLink();
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveCSS("color", "rgb(255, 165, 0)");
}

export async function clickSignupLoginLink(page: Page, homePage: HomePage) {
  await homePage.header.clickLoginLink();
  await expect(page).toHaveURL("/login");
}

export async function navigateToProductsAndVerify(
  page: Page,
  homePage: HomePage,
  productsPage: ProductsPage,
) {
  await homePage.header.clickProductsLink();
  await expect(page).toHaveURL("/products");
  await expect(await productsPage.getAllProductsHeading()).toBeVisible();
}

export async function loginAsTestUserAndVerifyLoggedIn(
  page: Page,
  loginPage: LoginPage,
  homePage: HomePage,
  testUser: TestUser,
) {
  await loginPage.setEmailInput(testUser.email);
  await loginPage.setPasswordInput(testUser.password);
  await loginPage.clickLoginButton();
  await expect(page).toHaveURL(homePage.path);
  expect(await homePage.header.getLoggedInName()).toBe(testUser.name);
}

export async function deleteAccountAndVerifyDeleted(
  page: Page,
  homePage: HomePage,
  accountDeletedPage: AccountDeletedPage,
) {
  await homePage.header.clickDeleteAccountLink();
  await expect(page).toHaveURL(accountDeletedPage.path);
  await expect(await accountDeletedPage.getAccountDeletedHeading()).toBeVisible();
}
