import { test as base, expect } from '@playwright/test';
import { Header } from '@pages/Header';
import { Login } from '@pages/Login';
import { Signup } from '@pages/Signup';
import { AccountCreated } from '@pages/AccountCreated';
import { AccountDeleted } from '@pages/AccountDeleted';

type Fixtures = {
  header: Header;
  login: Login;
  signup: Signup;
  accountCreated: AccountCreated;
  accountDeleted: AccountDeleted;
};

export const test = base.extend<Fixtures>({
  header: async ({ page }, use) => use(new Header(page)),
  login: async ({ page }, use) => use(new Login(page)),
  signup: async ({ page }, use) => use(new Signup(page)),
  accountCreated: async ({ page }, use) => use(new AccountCreated(page)),
  accountDeleted: async ({ page }, use) => use(new AccountDeleted(page)),
});

export { expect };
