export const AMOUNT_PRESETS = [500, 1000, 2500, 5000] as const;

export const PURPOSES = [
  "General Fund (Most urgent community needs)",
  "Education",
  "Healthcare",
  "Hunger Relief",
  "Community Welfare",
  "Environment",
  "Empowerment",
  "Specific campaign",
] as const;

export type Purpose = (typeof PURPOSES)[number];
export type PaymentMethod = "upi" | "bank" | "online";

export type DonationPayload = {
  amount: number;
  purpose: Purpose;
  fullName: string;
  email: string;
  phone: string;
  anonymous: boolean;
  paymentMethod?: PaymentMethod;
};

export type DonationResult = {
  referenceId: string;
  method?: PaymentMethod;
  status?: "confirmed" | "pending";
  amount?: number;
  purpose?: Purpose;
};

export const formatINR = (value: number): string =>
  `₹${new Intl.NumberFormat("en-IN").format(value)}`;

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    escape?: boolean;
    animation?: boolean;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (data: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/**
 * Dynamically loads the official Razorpay Checkout script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (typeof window.Razorpay === "function") {
      resolve(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      if (typeof window.Razorpay === "function") {
        resolve(true);
      } else {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Handles donation submissions using Razorpay Checkout.
 * All payment instruments (UPI, QR code, Cards, Net Banking, Wallets) are selected
 * directly inside Razorpay's secure modal.
 */
export async function submitDonation(payload: DonationPayload): Promise<DonationResult> {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded || typeof window.Razorpay !== "function") {
    throw new Error(
      "Unable to load secure payment gateway. Please check your internet connection and try again.",
    );
  }

  // Create order on backend
  const orderRes = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      paymentMethod: payload.paymentMethod || "online",
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.orderId) {
    throw new Error(orderData.error || "Could not initialize donation payment order.");
  }

  return new Promise<DonationResult>((resolve, reject) => {
    let isHandled = false;

    const options: RazorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "UNIHOPE Foundation",
      description: `Donation: ${payload.purpose.split(" (")[0]}`,
      order_id: orderData.orderId,
      prefill: {
        name: payload.anonymous ? "" : payload.fullName,
        email: payload.email,
        contact: payload.phone,
      },
      notes: {
        purpose: payload.purpose,
      },
      theme: {
        color: "#012A5F",
      },
      modal: {
        ondismiss: () => {
          if (!isHandled) {
            isHandled = true;
            reject(
              new Error("Payment was cancelled before completion. You have not been charged."),
            );
          }
        },
        confirm_close: true,
      },
      handler: async (response: RazorpaySuccessResponse) => {
        isHandled = true;
        try {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(
              verifyData.error ||
                "Payment verification could not be confirmed. Please contact support with reference: " +
                  response.razorpay_payment_id,
            );
          }

          resolve({
            referenceId: response.razorpay_payment_id,
            method: payload.paymentMethod || "online",
            status: "confirmed",
            amount: payload.amount,
            purpose: payload.purpose,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Payment verification failed.";
          reject(new Error(msg));
        }
      },
    };

    try {
      const RazorpayConstructor = window.Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Razorpay Checkout failed to initialize.");
      }

      const rzp = new RazorpayConstructor(options);

      rzp.on("payment.failed", (failData: unknown) => {
        if (!isHandled) {
          isHandled = true;
          const desc =
            typeof failData === "object" && failData !== null && "error" in failData
              ? (failData as { error?: { description?: string } }).error?.description
              : "Payment failed at the gateway.";
          reject(new Error(desc || "Payment was not successful. Please try again."));
        }
      });

      rzp.open();
    } catch (err: unknown) {
      if (!isHandled) {
        isHandled = true;
        const msg = err instanceof Error ? err.message : "Failed to open checkout window.";
        reject(new Error(msg));
      }
    }
  });
}
