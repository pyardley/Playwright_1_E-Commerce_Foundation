import type { Page } from "@playwright/test";
import type AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";
import { test } from "@fixtures/fixtures";

// axe-core rules tagged against WCAG 2.1 Level A/AA, plus axe's own
// best-practice rules (not part of WCAG, but broadly useful signal).
export const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "best-practice",
];

// automationexercise.com is a live third-party site this suite doesn't
// control, so accessibility checks are report-only by design (mirrors the
// ad-blocking rationale in the README): every scan attaches full results and
// annotates the test, but never fails it on violations alone. A test only
// fails here if the scan itself couldn't run (e.g. navigation broke).
export function formatViolations(violations: Result[]): string {
  return violations
    .map((violation) => {
      const nodeLines = violation.nodes
        .map((node) => `    - ${JSON.stringify(node.target)}\n      ${node.html}`)
        .join("\n");
      return [
        `[${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}`,
        `  ${violation.description}`,
        `  ${violation.helpUrl}`,
        `  Affected nodes (${violation.nodes.length}):`,
        nodeLines,
      ].join("\n");
    })
    .join("\n\n");
}

function countByImpact(violations: Result[]): string {
  const counts = new Map<string, number>();
  for (const violation of violations) {
    const impact = violation.impact ?? "unknown";
    counts.set(impact, (counts.get(impact) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([impact, count]) => `${count} ${impact}`)
    .join(", ");
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function runAccessibilityScan(
  axeBuilder: AxeBuilder,
  label: string,
): Promise<AxeResults> {
  const testInfo = test.info();
  const results = await axeBuilder.withTags(WCAG_TAGS).analyze();

  await testInfo.attach(`axe-${slug(label)}.json`, {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });

  if (results.violations.length > 0) {
    await testInfo.attach(`axe-${slug(label)}-summary.txt`, {
      body: formatViolations(results.violations),
      contentType: "text/plain",
    });

    const summary = `${label}: ${results.violations.length} violation(s) - ${countByImpact(results.violations)}`;
    testInfo.annotations.push({ type: "a11y-violations", description: summary });
    console.warn(`[a11y] ${summary} (see attached report for details)`);
  } else {
    testInfo.annotations.push({
      type: "a11y-clean",
      description: `${label}: no violations for tags ${WCAG_TAGS.join(", ")}`,
    });
  }

  return results;
}

// WCAG 1.4.10 Reflow: content must be usable at a 320px viewport width
// without horizontal scrolling. Report-only for the same reason as the axe
// scan above - this is the live site's own layout behaviour, not something
// this suite can fix.
export async function checkReflow(
  page: Page,
  label: string,
  width = 320,
  height = 640,
) {
  const testInfo = test.info();
  const originalSize = page.viewportSize();

  await page.setViewportSize({ width, height });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  if (originalSize) {
    await page.setViewportSize(originalSize);
  }

  const hasHorizontalScroll = overflow > 1; // tolerance for sub-pixel rounding
  const description = hasHorizontalScroll
    ? `${label}: horizontal overflow of ${overflow}px at ${width}x${height}`
    : `${label}: no horizontal overflow at ${width}x${height}`;

  testInfo.annotations.push({
    type: hasHorizontalScroll ? "a11y-reflow-issue" : "a11y-reflow-ok",
    description,
  });
  if (hasHorizontalScroll) {
    console.warn(`[a11y] ${description} (WCAG 1.4.10 Reflow)`);
  }

  return { hasHorizontalScroll, overflow };
}

export interface FocusedElementDescriptor {
  tag: string;
  role: string | null;
  accessibleText: string;
  id: string | null;
}

export async function getFocusedElementDescriptor(
  page: Page,
): Promise<FocusedElementDescriptor | null> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      accessibleText: (el.textContent ?? "").trim().slice(0, 60),
      id: el.id || null,
    };
  });
}
