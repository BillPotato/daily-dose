import { expect, test } from "@playwright/test";

test("medication parser creates tasks visible in medication tracker", async ({ page }) => {
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

  await page.goto("/medication-parser");

  const medicationInput = page.locator("textarea[placeholder*='Example:']");
  await medicationInput.fill(
    "Lisinopril 10mg - once daily\nMetformin 500mg - twice daily with meals",
  );

  await page.getByRole("button", { name: "Parse Medications" }).click();

  await expect(page.getByRole("heading", { name: /Parsed Medications \(2\)/i })).toBeVisible();
  await expect(page.getByText("Lisinopril 10mg - once daily", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Metformin 500mg - twice daily with meals", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Save 2 Tasks" }).click();

  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: /^💊\s*Medications$/ }).click();
  await expect(page.getByRole("heading", { name: "Medication Tracker" })).toBeVisible();
  await expect(page.getByText("2 pending", { exact: true })).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Lisinopril 10mg - once daily" }),
  ).toHaveCount(2);
  await expect(
    page.getByRole("heading", { name: "Metformin 500mg - twice daily with meals" }),
  ).toHaveCount(2);
});