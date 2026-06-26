import { expect } from "@fixtures/fixtures";
import type { Page } from "@playwright/test";
import type { HomePage } from "@pages/HomePage";
import type { LoginPage } from "@pages/LoginPage";
import type { Header } from "@components/Header";
import type { AccountDeletedPage } from "@pages/AccountDeletedPage";
import type { AccountCreatedPage } from "@pages/AccountCreatedPage";
import type { ProductsPage } from "@pages/ProductsPage";
import type { SignupPage } from "@pages/SignupPage";
import type { AddressDetails } from "@pages/CheckoutPage";
import type { TestUser } from "@fixtures/fixtures";
import type { RegistrationData } from "@support/testData";

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
  header: Header,
  accountDeletedPage: AccountDeletedPage,
) {
  await header.clickDeleteAccountLink();
  await expect(page).toHaveURL(accountDeletedPage.path);
  await expect(
    await accountDeletedPage.getAccountDeletedHeading(),
  ).toBeVisible();
}

export async function enterNameAndEmailThenSignup(
  page: Page,
  loginPage: LoginPage,
  signupPage: SignupPage,
  name: string,
  email: string,
) {
  await loginPage.setNewUserNameInput(name);
  await loginPage.setNewUserEmailInput(email);
  await loginPage.clickSignupButton();
  await expect(page).toHaveURL(signupPage.path);
}

export async function fillSignupFormAndCreateAccount(
  page: Page,
  signupPage: SignupPage,
  accountCreatedPage: AccountCreatedPage,
  registrationData: RegistrationData,
) {
  const setTitle: Record<typeof registrationData.title, () => Promise<void>> = {
    Mr: () => signupPage.setTitleToMr(),
    Mrs: () => signupPage.setTitleToMrs(),
  };
  await setTitle[registrationData.title]();
  await signupPage.setPasswordInput(registrationData.password);
  await signupPage.setDateOfBirth(
    registrationData.birthDate,
    registrationData.birthMonthName,
    registrationData.birthYear,
  );

  await signupPage.setNewsletterCheckbox(registrationData.newsletter);
  await signupPage.setOffersCheckbox(registrationData.offers);

  await signupPage.setFirstNameInput(registrationData.firstname);
  await signupPage.setLastNameInput(registrationData.lastname);
  await signupPage.setCompanyInput(registrationData.company);
  await signupPage.setAddress1Input(registrationData.address1);
  await signupPage.setAddress2Input(registrationData.address2);
  await signupPage.setCountrySelect(registrationData.country);
  await signupPage.setStateInput(registrationData.state);
  await signupPage.setCityInput(registrationData.city);
  await signupPage.setZipcodeInput(registrationData.zipcode);
  await signupPage.setMobileNumberInput(registrationData.mobileNumber);

  await signupPage.clickCreateAccountButton();
  await expect(page).toHaveURL(accountCreatedPage.path);
  await expect(
    await accountCreatedPage.getAccountCreatedHeading(),
  ).toBeVisible();
}

export async function verifyAddressMatchesRegistrationData(
  addr: AddressDetails,
  registrationData: RegistrationData,
) {
  // The site renders the title with a trailing period ("Mr."/"Mrs."),
  // but registrationData.title stores it without one (it's matched
  // against radio button accessible names elsewhere as "Mr."/"Mrs." too,
  // just not stored that way).
  expect(await addr.getFullName()).toBe(
    `${registrationData.title}. ${registrationData.firstname} ${registrationData.lastname}`,
  );
  expect(await addr.getAddressLine(0)).toBe(registrationData.company);
  expect(await addr.getAddressLine(1)).toBe(registrationData.address1);
  expect(await addr.getAddressLine(2)).toBe(registrationData.address2);
  expect(await addr.getCityStateZip()).toBe(
    `${registrationData.city} ${registrationData.state} ${registrationData.zipcode}`,
  );
  expect(await addr.getCountry()).toBe(registrationData.country);
  expect(await addr.getPhoneNumber()).toBe(registrationData.mobileNumber);
}
