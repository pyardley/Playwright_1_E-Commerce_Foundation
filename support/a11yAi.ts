import Anthropic from "@anthropic-ai/sdk";

export interface AltTextVerdict {
  meaningful: boolean;
  reasoning: string;
}

export interface EvaluateAltTextParams {
  imageBuffer: Buffer;
  altText: string;
  productName: string;
}

// Despite being asked for "ONLY a JSON object, no other text", Claude models
// commonly still wrap structured replies in a ```json ... ``` fence. Strip
// that (and fall back to the outermost {...} span) before parsing, rather
// than failing every single call on cosmetic formatting.
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1];

  const braces = text.match(/\{[\s\S]*\}/);
  return braces ? braces[0] : text;
}

// Rule-based scanners (axe-core included) can only confirm an alt attribute
// exists - not whether it actually describes the image. This asks a vision
// model to judge that directly, matching each screenshot 1:1 with its own
// alt text so there's no ambiguity about which image is being judged.
// Never throws: any API/parse failure is logged and returns null, since an
// LLM judgment isn't a deterministic gate this suite should fail a test on.
export async function evaluateAltTextWithAI({
  imageBuffer,
  altText,
  productName,
}: EvaluateAltTextParams): Promise<AltTextVerdict | null> {
  const model = process.env.A11Y_AI_MODEL ?? "claude-haiku-4-5-20251001";

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: imageBuffer.toString("base64"),
              },
            },
            {
              type: "text",
              text: [
                `This image is a product photo for "${productName}".`,
                `Its HTML alt text is: ${altText ? JSON.stringify(altText) : "(empty/missing)"}`,
                "Judge whether the alt text is meaningful - i.e. it actually describes what's",
                "shown, rather than being generic, keyword-stuffed, or missing entirely.",
                'Reply with ONLY a JSON object of the exact shape {"meaningful": boolean, "reasoning": string}, no other text.',
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock) {
      console.warn("[a11y-ai] Response had no text content block");
      return null;
    }

    return JSON.parse(extractJson(textBlock.text)) as AltTextVerdict;
  } catch (error) {
    console.warn(`[a11y-ai] Failed to evaluate alt text via ${model}: ${error}`);
    return null;
  }
}
