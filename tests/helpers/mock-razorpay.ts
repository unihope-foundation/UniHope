import { Page } from "@playwright/test";

export interface MockRazorpayConfig {
  action: "success" | "dismiss" | "failure";
  paymentId?: string;
  orderId?: string;
  signature?: string;
  failureMessage?: string;
}

/**
 * Injects a mock implementation of window.Razorpay into the browser context.
 * This guarantees that NO live Razorpay checkout script is contacted and
 * NO actual monetary transactions occur during testing.
 */
export async function injectMockRazorpay(
  page: Page,
  config: MockRazorpayConfig = { action: "success" },
) {
  await page.addInitScript((cfg) => {
    (window as any).__mockRazorpayCalls = [];
    (window as any).__mockRazorpayOpened = false;

    (window as any).Razorpay = class MockRazorpay {
      options: any;
      private _failureHandler?: (error: any) => void;

      constructor(options: any) {
        this.options = options;
        (window as any).__mockRazorpayCalls.push(options);
      }

      open() {
        (window as any).__mockRazorpayOpened = true;
        // Simulate real-world asynchronous modal interaction
        setTimeout(() => {
          if (cfg.action === "success") {
            if (this.options.handler) {
              this.options.handler({
                razorpay_payment_id: cfg.paymentId || "pay_mock_success_123456",
                razorpay_order_id: cfg.orderId || this.options.order_id || "order_mock_123456",
                razorpay_signature: cfg.signature || "mock_signature_hash_valid",
              });
            }
          } else if (cfg.action === "dismiss") {
            if (this.options.modal?.ondismiss) {
              this.options.modal.ondismiss();
            }
          } else if (cfg.action === "failure") {
            if (this._failureHandler) {
              this._failureHandler({
                error: {
                  code: "PAYMENT_FAILED",
                  description: cfg.failureMessage || "Payment was declined by the issuing bank.",
                },
              });
            }
          }
        }, 50);
      }

      on(event: string, handler: (data: any) => void) {
        if (event === "payment.failed") {
          this._failureHandler = handler;
        }
      }
    };
  }, config);
}

/**
 * Intercepts internal API routes to provide predictable, isolated test responses.
 */
export async function mockDonationApis(
  page: Page,
  overrides?: {
    createOrder?: { status?: number; body?: any };
    verifyPayment?: { status?: number; body?: any };
  },
) {
  await page.route("**/api/razorpay/create-order", async (route) => {
    if (overrides?.createOrder) {
      await route.fulfill({
        status: overrides.createOrder.status ?? 200,
        contentType: "application/json",
        body: JSON.stringify(overrides.createOrder.body),
      });
      return;
    }

    const postData = route.request().postData();
    const data = postData ? JSON.parse(postData) : {};
    const amount = Number(data.amount) || 1000;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        orderId: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        keyId: "rzp_test_mockKeyId9876",
      }),
    });
  });

  await page.route("**/api/razorpay/verify-payment", async (route) => {
    if (overrides?.verifyPayment) {
      await route.fulfill({
        status: overrides.verifyPayment.status ?? 200,
        contentType: "application/json",
        body: JSON.stringify(overrides.verifyPayment.body),
      });
      return;
    }

    const postData = route.request().postData();
    const data = postData ? JSON.parse(postData) : {};

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        referenceId: data.razorpay_payment_id || "pay_mock_success_123456",
        orderId: data.razorpay_order_id,
        amount: 1000,
      }),
    });
  });
}

