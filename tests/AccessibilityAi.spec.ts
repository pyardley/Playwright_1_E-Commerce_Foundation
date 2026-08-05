import { test } from "@fixtures/fixtures";
import { navigateToProductsAndVerify } from "@support/steps";
import { evaluateAltTextWithAI } from "@support/a11yAi";

// Rule-based scanners (axe-core included, see tests/Accessibility.spec.ts)
// can only confirm an alt attribute exists, not whether it's actually
// meaningful. This demo asks a vision-capable Claude model to judge that
// directly for a handful of product images - the guide's "Semantic Visual
// Evaluation" idea. It's opt-in (skipped without ANTHROPIC_API_KEY, and not
// run by CI unless that secret is configured) and, like the rest of this
// suite's accessibility checks, report-only: an LLM judgment isn't a
// deterministic gate, so this never fails the test on its own.
test.describe("Accessibility (AI-assisted)", () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(
      !process.env.ANTHROPIC_API_KEY,
      "ANTHROPIC_API_KEY not set - skipping AI-assisted accessibility check",
    );
  });

  test(
    "Product image alt text is semantically meaningful",
    { tag: ["@ai-a11y"] },
    async ({ page, homePage, productsPage }) => {
      await homePage.goto();
      await navigateToProductsAndVerify(page, homePage, productsPage);

      const productCount = Math.min(
        3,
        await productsPage.productList.getProductCount(),
      );

      for (let i = 0; i < productCount; i++) {
        await test.step(`Evaluate alt text for product ${i + 1}`, async () => {
          const productCard = await productsPage.productList.getProductCard(i);
          const { name: productName } = await productCard.getSummary();

          const image = await productCard.getImage();
          const [imageBuffer, altText] = await Promise.all([
            image.screenshot(),
            image.getAttribute("alt"),
          ]);

          const verdict = await evaluateAltTextWithAI({
            imageBuffer,
            altText: altText ?? "",
            productName,
          });

          const testInfo = test.info();
          await testInfo.attach(`alt-text-check-product-${i + 1}.png`, {
            body: imageBuffer,
            contentType: "image/png",
          });

          if (verdict) {
            await testInfo.attach(`alt-text-check-product-${i + 1}.json`, {
              body: JSON.stringify(
                { productName, altText, ...verdict },
                null,
                2,
              ),
              contentType: "application/json",
            });
            testInfo.annotations.push({
              type: verdict.meaningful ? "a11y-ai-alt-ok" : "a11y-ai-alt-issue",
              description: `${productName}: alt="${altText}" - ${verdict.reasoning}`,
            });
          } else {
            testInfo.annotations.push({
              type: "a11y-ai-alt-skipped",
              description: `${productName}: AI evaluation failed - see console output`,
            });
          }
        });
      }
    },
  );
});
