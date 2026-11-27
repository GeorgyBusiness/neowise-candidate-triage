import assert from "node:assert/strict";
import test from "node:test";
import { triage } from "./triage.mjs";

const manualReview = { status: "manual_review", topic: null, draft: null };

test("пустой, отсутствующий, нестроковый ввод и битый JSON", async () => {
  for (const body of ["", "{", "null", "{}", "[]", '{"text":42}', '{"text":""}', '{"text":"  "}']) {
    assert.deepEqual(await triage(body), { status: "invalid_input" }, body);
  }
});

test("обычная заявка получает тему и непустой черновик", async () => {
  for (const [text, topic] of [
    ["  Когда доставка?  ", "delivery"],
    ["Какая стоимость заказа?", "pricing"],
    ["Как вас найти?", "other"],
  ]) {
    const result = await triage(JSON.stringify({ text }));
    assert.equal(result.status, "ready");
    assert.equal(result.topic, topic);
    assert.equal(typeof result.draft, "string");
    assert.ok(result.draft.trim());
  }
});

for (const text of ["[error]", "[bad-json]", "[bad-topic]", "[empty-draft]"]) {
  test(`${text} отправляет заявку на ручной разбор без черновика`, async () => {
    assert.deepEqual(await triage(JSON.stringify({ text })), manualReview);
  });
}

test("таймаут возвращает ручной разбор до завершения задержки имитатора", { timeout: 1000 }, async () => {
  assert.deepEqual(await triage('{"text":"[timeout]"}'), manualReview);
});
