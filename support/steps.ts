import { expect } from "@fixtures/fixtures";
import type { Page } from "@playwright/test";
import type { HomePage } from "@pages/Home";
import type { Login } from "@pages/Login";
import type { AccountDeleted } from "@pages/AccountDeleted";
import type { Products } from "@pages/Products";
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
  products: Products,
) {
  await homePage.header.clickProductsLink();
  await expect(page).toHaveURL("/products");
  await expect(await products.getAllProductsHeading()).toBeVisible();
}

export async function loginAsTestUserAndVerifyLoggedIn(
  page: Page,
  login: Login,
  homePage: HomePage,
  testUser: TestUser,
) {
  await login.setEmailInput(testUser.email);
  await login.setPasswordInput(testUser.password);
  await login.clickLoginButton();
  await expect(page).toHaveURL(homePage.path);
  expect(await homePage.header.getLoggedInName()).toBe(testUser.name);
}

export async function deleteAccountAndVerifyDeleted(
  page: Page,
  homePage: HomePage,
  accountDeleted: AccountDeleted,
) {
  await homePage.header.clickDeleteAccountLink();
  await expect(page).toHaveURL(accountDeleted.path);
  await expect(await accountDeleted.getAccountDeletedHeading()).toBeVisible();
}
