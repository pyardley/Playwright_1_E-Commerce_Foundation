import { z, ZodType } from "zod";

// Schemas derived from automationexercise.com's published API docs
// (https://automationexercise.com/api_list) plus live responses observed
// while writing this file - the docs describe each endpoint's parameters and
// responseCode in prose, but don't document exact JSON field names, so the
// object shapes below are taken directly from real requests.

export const productSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  price: z.string(),
  brand: z.string(),
  category: z.object({
    usertype: z.object({
      usertype: z.string(),
    }),
    category: z.string(),
  }),
});

export const productsListResponseSchema = z.object({
  responseCode: z.literal(200),
  products: z.array(productSchema),
});

export const brandSchema = z.object({
  id: z.number().int(),
  brand: z.string(),
});

export const brandsListResponseSchema = z.object({
  responseCode: z.literal(200),
  brands: z.array(brandSchema),
});

// POST /api/searchProduct's success response is shaped identically to
// GET /api/productsList's.
export const searchProductResponseSchema = z.object({
  responseCode: z.literal(200),
  products: z.array(productSchema),
});

// Shared shape for the documented 400/404/405 error responses (missing
// params, method not supported, user not found, etc.) - every endpoint
// reports these the same way: a responseCode plus a human-readable message.
export const apiErrorResponseSchema = z.object({
  responseCode: z.number().int(),
  message: z.string(),
});

// createAccount/deleteAccount always reply HTTP 200 regardless of outcome,
// with the real result carried in this body (see fixtures/fixtures.ts) -
// responseCode is intentionally left as a plain number rather than a literal
// so the schema validates shape, and callers check the actual value.
export const createAccountResponseSchema = z.object({
  responseCode: z.number().int(),
  message: z.string(),
});

export const deleteAccountResponseSchema = z.object({
  responseCode: z.number().int(),
  message: z.string(),
});

// Throws with a readable diff on mismatch - an API contract break is a real,
// actionable regression (unlike the report-only accessibility/visual checks
// elsewhere in this suite, which cover a live third-party site's own content
// this team can't fix), so this is meant to hard-fail the caller.
export function validateResponse<T>(
  schema: ZodType<T>,
  body: unknown,
  context: string,
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `API contract violation (${context}):\n${issues}\nReceived: ${JSON.stringify(body)}`,
    );
  }
  return result.data;
}
