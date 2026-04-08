import { expect, test } from "@playwright/test";

test("feeling analyzer shows AI feedback after submit", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("token", "e2e-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "E2E User",
        email: "e2e@example.com",
      }),
    );
    localStorage.setItem("tasks", "[]");
  });

  let generateApiCalls = 0;
  await page.route("**/api/generate", async (route) => {
    generateApiCalls += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        issue: "Stress-related fatigue",
        recommendations: [
          "Take a short walk and hydrate every 2 hours.",
          "Try a 10-minute breathing session before bedtime.",
        ],
        severity: "medium",
        emoji: "😊",
        color: "green",
        source: "gemini",
        timestamp: new Date().toISOString(),
        tasks: [
          {
            summary: "Evening breathing exercise",
            description: "10-minute relaxation routine",
            location: "Home",
            start: { dateTime: "2026-04-08T20:00:00.000Z" },
            end: { dateTime: "2026-04-08T20:30:00.000Z" },
          },
        ],
      }),
    });
  });

  await page.goto("/feeling-analyzer");

  await page
    .getByPlaceholder("Describe your symptoms, emotions, or concerns in detail...")
    .fill("I feel stressed, low energy, and cannot focus at work.");

  await page.getByRole("button", { name: "Generate Calendar Tasks" }).click();

  await expect(page.getByRole("heading", { name: "Analysis Complete" })).toBeVisible();
  await expect(page.getByText("Stress-related fatigue", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Take a short walk and hydrate every 2 hours.", { exact: true }),
  ).toBeVisible();

  expect(generateApiCalls).toBeGreaterThanOrEqual(1);
});