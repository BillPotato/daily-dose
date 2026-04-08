import { test, expect } from "@playwright/test";

test("sign in redirects to dashboard", async ({ page }) => {
  await page.goto("/auth/signin");

  await page.getByPlaceholder("Enter your email").fill("test@test.com");
  await page.getByPlaceholder("Enter your password").fill("password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
});