import { faker } from "@faker-js/faker";

export type RegistrationData = {
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  title: "Mr" | "Mrs";
  birthDate: string;
  birthMonth: string;
  birthMonthName: string;
  birthYear: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
  newsletter: boolean;
  offers: boolean;
};

// The site's <select data-qa="country"> only ever renders these 7 options
// (verified against the live signup form) - Faker must pick from this exact
// set, since an unconstrained faker.location.country() value would have no
// matching <option> and selectOption() would throw.
const SUPPORTED_COUNTRIES = [
  "India",
  "United States",
  "Canada",
  "Australia",
  "Israel",
  "New Zealand",
  "Singapore",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fixedRegistrationData(): RegistrationData {
  return {
    name: "John Doe",
    firstname: "John",
    lastname: "Doe",
    email: `john.doe.${Date.now()}@example.com`,
    password: "password123",
    title: "Mr",
    birthDate: "1",
    birthMonth: "1",
    birthMonthName: "January",
    birthYear: "1990",
    company: "Example Inc.",
    address1: "123 Main St",
    address2: "Apt 4B",
    country: "United States",
    state: "California",
    city: "Los Angeles",
    zipcode: "90001",
    mobileNumber: "+1-555-123-4567",
    newsletter: true,
    offers: true,
  };
}

// Faker-generated equivalents for the @e2e suite. Field values are not
// validated/constrained beyond the country allowlist above - if a generated
// value ever trips up the site's loose backend validation, that's an
// accepted trade-off of using randomized input, not a bug in this factory.
function fakerRegistrationData(): RegistrationData {
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const birthMonth = faker.number.int({ min: 1, max: 12 });

  return {
    name: `${firstname} ${lastname}`,
    firstname,
    lastname,
    email: `${faker.internet.username({ firstName: firstname, lastName: lastname }).toLowerCase()}.${Date.now()}@example.com`,
    password: faker.internet.password(),
    title: faker.helpers.arrayElement(["Mr", "Mrs"]),
    birthDate: String(faker.number.int({ min: 1, max: 28 })),
    birthMonth: String(birthMonth),
    birthMonthName: MONTH_NAMES[birthMonth - 1],
    birthYear: String(faker.number.int({ min: 1950, max: 2005 })),
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: faker.helpers.arrayElement(SUPPORTED_COUNTRIES),
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode(),
    mobileNumber: faker.phone.number(),
    newsletter: faker.datatype.boolean(),
    offers: faker.datatype.boolean(),
  };
}

export function buildRegistrationData(): RegistrationData {
  return process.env.TEST_SUITE === "e2e"
    ? fakerRegistrationData()
    : fixedRegistrationData();
}
