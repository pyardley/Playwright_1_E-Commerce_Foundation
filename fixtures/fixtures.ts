import { test as base, expect } from '@playwright/test';

// Add page objects to the Fixtures type and the extend() block below as they're created, e.g.:
// import { HomePage } from '@pages/HomePage';
// type Fixtures = { homePage: HomePage };
// export const test = base.extend<Fixtures>({
//   homePage: async ({ page }, use) => use(new HomePage(page)),
// });

export const test = base;
export { expect };
