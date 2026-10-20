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
  paymentMethod: PaymentMethod;
};

export type DonationResult = {
  referenceId: string;
};

export const formatINR = (value: number): string =>
  `₹${new Intl.NumberFormat("en-IN").format(value)}`;

/**
 * TODO: connect this to your payment provider or an API route.
 * It must resolve ONLY after the donation is genuinely recorded. Until then it throws,
 * so the form shows an error and never a fake success message.
 */
export async function submitDonation(_payload: DonationPayload): Promise<DonationResult> {
  void _payload;
  throw new Error("Donation submission is not connected yet.");
}
