import { test, expect } from "@playwright/test";
import { injectMockRazorpay, mockDonationApis } from "./helpers/mock-razorpay";

test.describe("Donation Razorpay Mocked Payment Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/donate");
  });

  async function fillValidDonationForm(page: any, overrides?: { name?: string; email?: string; phone?: string; anonymous?: boolean }) {
    await page.getByLabel("Full name").fill(overrides?.name ?? "Arun Kumar");
    await page.getByLabel("Email address").fill(overrides?.email ?? "arun.kumar@example.com");
    await page.getByLabel("Phone number").fill(overrides?.phone ?? "+91 91501 49339");
    if (overrides?.anonymous) {
      await page.getByLabel("Hide my name (donate anonymously)").check();
    }
    await page.getByLabel(/I agree to the/).check();
  }

  test("should complete a successful donation without live payment and show thank-you screen", async ({ page }) => {
    const mockPaymentId = "pay_mock_test_998877";
    const mockOrderId = "order_mock_test_112233";

    await injectMockRazorpay(page, {
      action: "success",
      paymentId: mockPaymentId,
      orderId: mockOrderId,
    });
    await mockDonationApis(page);

    await page.getByRole("button", { name: "₹1,000" }).click();
    await page.getByLabel("Direct your contribution").selectOption("Healthcare");
    await fillValidDonationForm(page);

    const donateButton = page.getByRole("button", { name: "Donate ₹1,000 →" });
    await expect(donateButton).toBeEnabled();

    // Click donate and verify loading state
    await donateButton.click();

    // Verify thank-you confirmation appears only after successful verification
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByText("Donation received")).toBeVisible();
    await expect(page.getByText("Thank you for supporting UNIHOPE Foundation.")).toBeVisible();
    await expect(page.getByText("A receipt will be sent to your email.")).toBeVisible();

    // Verify donation summary details
    await expect(page.getByText("₹1,000 · Healthcare")).toBeVisible();
    await expect(page.getByText(mockPaymentId)).toBeVisible();
    await expect(page.getByText("R/Chennai North Joint I/Book-4/228/2026")).toBeVisible();

    // Verify navigation links on thank-you screen
    await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "Become a volunteer" })).toHaveAttribute("target", "_blank");
  });

  test("should prefill donor details into Razorpay checkout options", async ({ page }) => {
    await injectMockRazorpay(page, { action: "success" });
    await mockDonationApis(page);

    await fillValidDonationForm(page, {
      name: "Lakshmi Narayanan",
      email: "lakshmi@example.org",
      phone: "+91 98765 43210",
    });

    await page.getByRole("button", { name: /Donate/ }).click();

    // Check captured options passed into window.Razorpay constructor
    const capturedOptions = await page.evaluate(() => (window as any).__mockRazorpayCalls?.[0]);
    expect(capturedOptions).toBeDefined();
    expect(capturedOptions.name).toBe("UNIHOPE Foundation");
    expect(capturedOptions.prefill.name).toBe("Lakshmi Narayanan");
    expect(capturedOptions.prefill.email).toBe("lakshmi@example.org");
    expect(capturedOptions.prefill.contact).toBe("+91 98765 43210");
  });

  test("should handle user dismissal/cancellation cleanly without showing thank-you screen", async ({ page }) => {
    await injectMockRazorpay(page, { action: "dismiss" });
    await mockDonationApis(page);

    await fillValidDonationForm(page);
    await page.getByRole("button", { name: /Donate/ }).click();

    // User dismissed the checkout modal -> Form displays error alert and resets button
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("Payment was cancelled before completion. You have not been charged.");

    // Thank-you screen must NOT appear
    await expect(page.getByText("Donation received")).not.toBeVisible();

    // Button should be restored to enabled state
    await expect(page.getByRole("button", { name: /Donate/ })).toBeEnabled();
  });

  test("should display gateway failure message when card is declined", async ({ page }) => {
    const failureReason = "Transaction declined by card issuer. Insufficient funds.";

    await injectMockRazorpay(page, {
      action: "failure",
      failureMessage: failureReason,
    });
    await mockDonationApis(page);

    await fillValidDonationForm(page);
    await page.getByRole("button", { name: /Donate/ }).click();

    // Form displays the gateway failure error
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(failureReason);

    // Thank-you screen must NOT appear
    await expect(page.getByText("Donation received")).not.toBeVisible();
  });

  test("should prevent thank-you page if server verification fails (signature mismatch)", async ({ page }) => {
    await injectMockRazorpay(page, { action: "success" });

    // Mock verify-payment to return 400 Bad Request with signature failure
    await mockDonationApis(page, {
      verifyPayment: {
        status: 400,
        body: { error: "Payment verification failed: signature mismatch." },
      },
    });

    await fillValidDonationForm(page);
    await page.getByRole("button", { name: /Donate/ }).click();

    // Form displays verification failure error
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("Payment verification failed: signature mismatch.");

    // Thank-you screen must NEVER appear
    await expect(page.getByText("Donation received")).not.toBeVisible();
  });

  test("should handle order creation failure gracefully", async ({ page }) => {
    await injectMockRazorpay(page, { action: "success" });

    // Mock create-order to return 500 Internal Server Error
    await mockDonationApis(page, {
      createOrder: {
        status: 500,
        body: { error: "Payment gateway is not currently configured. Please try again later." },
      },
    });

    await fillValidDonationForm(page);
    await page.getByRole("button", { name: /Donate/ }).click();

    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("Payment gateway is not currently configured");

    // Checkout modal must not have been opened
    const wasOpened = await page.evaluate(() => (window as any).__mockRazorpayOpened);
    expect(wasOpened).toBeFalsy();
    await expect(page.getByText("Donation received")).not.toBeVisible();
  });
});

