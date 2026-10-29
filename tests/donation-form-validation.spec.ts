import { test, expect } from "@playwright/test";

test.describe("Donation Form Validation & UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/donate");
  });

  test("should render the donation form with default ₹1,000 preset", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Make a contribution" })).toBeVisible();
    await expect(page.getByLabel("Specified Amount (INR)")).toHaveValue("1000");
    await expect(page.getByRole("button", { name: "Donate ₹1,000 →" })).toBeVisible();
  });

  test("should switch amount presets when clicked", async ({ page }) => {
    const amountInput = page.getByLabel("Specified Amount (INR)");

    // Test ₹500 preset
    await page.getByRole("button", { name: "₹500" }).click();
    await expect(amountInput).toHaveValue("500");
    await expect(page.getByRole("button", { name: "Donate ₹500 →" })).toBeVisible();

    // Test ₹2,500 preset
    await page.getByRole("button", { name: "₹2,500" }).click();
    await expect(amountInput).toHaveValue("2500");
    await expect(page.getByRole("button", { name: "Donate ₹2,500 →" })).toBeVisible();

    // Test ₹5,000 preset
    await page.getByRole("button", { name: "₹5,000" }).click();
    await expect(amountInput).toHaveValue("5000");
    await expect(page.getByRole("button", { name: "Donate ₹5,000 →" })).toBeVisible();

    // Test 'Other' preset button
    await page.getByRole("button", { name: "Other" }).click();
    await expect(amountInput).toHaveValue("");
    await expect(amountInput).toBeFocused();
    await expect(page.getByRole("button", { name: "Donate →" })).toBeVisible();

    // Type a custom amount
    await amountInput.fill("7500");
    await expect(page.getByRole("button", { name: "Donate ₹7,500 →" })).toBeVisible();
  });

  test("should validate required fields when submitted empty", async ({ page }) => {
    // Attempt submit with empty donor fields
    await page.getByRole("button", { name: /Donate/ }).click();

    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Enter a valid phone number.")).toBeVisible();
    await expect(page.getByText("Please agree to the Privacy Policy to continue.")).toBeVisible();
  });

  test("should validate invalid email formats", async ({ page }) => {
    const emailInput = page.getByLabel("Email address");

    await emailInput.fill("invalid-email");
    await page.getByRole("button", { name: /Donate/ }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();

    await emailInput.fill("user@domain");
    await page.getByRole("button", { name: /Donate/ }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();

    await emailInput.fill("donor@example.com");
    await page.getByRole("button", { name: /Donate/ }).click();
    await expect(page.getByText("Enter a valid email address.")).not.toBeVisible();
  });

  test("should validate invalid phone formats", async ({ page }) => {
    const phoneInput = page.getByLabel("Phone number");

    await phoneInput.fill("123");
    await page.getByRole("button", { name: /Donate/ }).click();
    await expect(page.getByText("Enter a valid phone number.")).toBeVisible();

    await phoneInput.fill("+91 91501 49339");
    await page.getByRole("button", { name: /Donate/ }).click();
    await expect(page.getByText("Enter a valid phone number.")).not.toBeVisible();
  });

  test("should validate empty or zero donation amounts", async ({ page }) => {
    const amountInput = page.getByLabel("Specified Amount (INR)");

    await amountInput.fill("");
    await page.getByRole("button", { name: "Donate →" }).click();
    await expect(page.getByText("Enter an amount in rupees.")).toBeVisible();

    await amountInput.fill("0");
    await page.getByRole("button", { name: "Donate →" }).click();
    await expect(page.getByText("Enter an amount in rupees.")).toBeVisible();
  });

  test("should allow selecting different contribution causes", async ({ page }) => {
    const purposeSelect = page.getByLabel("Direct your contribution");
    await purposeSelect.selectOption("Healthcare");
    await expect(purposeSelect).toHaveValue("Healthcare");

    await purposeSelect.selectOption("Hunger Relief");
    await expect(purposeSelect).toHaveValue("Hunger Relief");
  });

  test("should allow toggling anonymous donation checkbox", async ({ page }) => {
    const anonymousCheckbox = page.getByLabel("Hide my name (donate anonymously)");
    await expect(anonymousCheckbox).not.toBeChecked();
    await anonymousCheckbox.check();
    await expect(anonymousCheckbox).toBeChecked();
  });
});

