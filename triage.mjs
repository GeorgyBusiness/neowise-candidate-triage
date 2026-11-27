import { classify } from "./mock-ai.mjs";

const topics = new Set(["delivery", "pricing", "other"]);
const manualReview = { status: "manual_review", topic: null, draft: null };

export async function triage(body) {
  let text;
  try {
    text = JSON.parse(body)?.text;
  } catch {
    return { status: "invalid_input" };
  }
  if (typeof text !== "string" || !text.trim()) {
    return { status: "invalid_input" };
  }

  try {
    const output = await classify(text.trim(), { signal: AbortSignal.timeout(300) });
    const result = JSON.parse(output);
    if (!topics.has(result?.topic) || typeof result.draft !== "string" || !result.draft.trim()) {
      return manualReview;
    }
    return { status: "ready", topic: result.topic, draft: result.draft.trim() };
  } catch {
    return manualReview;
  }
}
