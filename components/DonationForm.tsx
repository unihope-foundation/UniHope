"use client";

import Link from "next/link";
import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, ChevronDown, ExternalLink, Lock, QrCode } from "lucide-react";
import { HELPLINE, REG_NO, VOLUNTEER_FORM_URL } from "@/content/donate";
import {
  AMOUNT_PRESETS,
  PURPOSES,
  formatINR,
  submitDonation,
  type DonationResult,
  type PaymentMethod,
  type Purpose,
} from "@/lib/donations";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "upi", label: "UPI / QR" },
  { id: "bank", label: "Bank transfer" },
  { id: "online", label: "Online payment" },
];

type FieldKey = "amount" | "fullName" | "email" | "phone" | "consent";
type FieldErrors = Partial<Record<FieldKey, string>>;
type Status = "idle" | "submitting" | "success" | "error";

// Shared classes, so every field looks the same.
const labelClass = "text-sm font-semibold leading-[21px] text-[#3D3D3D]";
const fieldClass =
  "h-[52px] w-full rounded-xl border border-[#8A8A8A] bg-white px-4 text-[15px] text-[#3D3D3D] placeholder:text-[#5A5A5A] transition-[border-color,box-shadow] duration-150 focus:border-[#012A5F] focus:outline-none focus:ring-2 focus:ring-[#012A5F]/20 motion-reduce:transition-none aria-[invalid=true]:border-[#C62828]";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012A5F] focus-visible:ring-offset-2";
const errorClass = "mt-1 text-xs leading-[18px] text-[#C62828]";

export function DonationForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const amountRef = useRef<HTMLInputElement>(null);

  const [amountText, setAmountText] = useState("1000");
  const [purpose, setPurpose] = useState<Purpose>(PURPOSES[0]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DonationResult | null>(null);

  const amount = Number(amountText);
  const amountValid = Number.isInteger(amount) && amount >= 1;
  const matchedPreset = AMOUNT_PRESETS.find((preset) => String(preset) === amountText);
  const isOther = matchedPreset === undefined;
  const donateLabel = amountValid ? `Donate ${formatINR(amount)} →` : "Donate →";

  function onAmountChange(event: ChangeEvent<HTMLInputElement>) {
    setAmountText(event.target.value.replace(/\D/g, "").slice(0, 8));
  }

  function selectOther() {
    setAmountText("");
    amountRef.current?.focus();
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!amountValid) next.amount = "Enter an amount in rupees.";
    if (fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!PHONE_RE.test(phone.trim())) next.phone = "Enter a valid phone number.";
    if (!consent) next.consent = "Please agree to the Privacy Policy to continue.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const next = validate();
    setErrors(next);
    const order: FieldKey[] = ["amount", "fullName", "email", "phone", "consent"];
    const firstInvalid = order.find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(id(firstInvalid))?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const response = await submitDonation({
        amount,
        purpose,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        anonymous,
        paymentMethod: method,
      });
      setResult(response);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  // ---------- Thank-you state: shown only after submitDonation really resolves ----------
  if (status === "success" && result) {
    return (
      <div
        role="status"
        className="flex flex-col gap-6 rounded-[20px] border border-[#2B711B] bg-[#E2ECE0] p-5 sm:p-8"
      >
        <span className="grid size-12 place-items-center rounded-full bg-white text-[#2B711B]">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2B711B]">
            Donation received
          </p>
          <h2 className="font-outfit text-2xl font-semibold leading-9 text-[#012A5F]">
            Thank you for supporting UNIHOPE Foundation.
          </h2>
          <p className="text-[15px] leading-6 text-[#3D3D3D]">
            A receipt will be sent to your email.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-3 rounded-xl border border-[#D6D6D6] bg-white p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#5A5A5A]">Contribution</dt>
            <dd className="font-semibold text-[#012A5F]">
              {formatINR(amount)} · {purpose.split(" (")[0]}
            </dd>
          </div>
          <div>
            <dt className="text-[#5A5A5A]">Reference ID</dt>
            <dd className="break-all font-semibold text-[#012A5F]">{result.referenceId}</dd>
          </div>
          <div>
            <dt className="text-[#5A5A5A]">Date</dt>
            <dd className="font-semibold text-[#012A5F]">
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date())}
            </dd>
          </div>
          <div>
            <dt className="text-[#5A5A5A]">Registration number</dt>
            <dd className="break-words font-semibold text-[#012A5F]">{REG_NO}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className={`inline-flex h-12 items-center justify-center rounded-full border border-[#3D3D3D] px-6 text-[15px] font-semibold text-[#3D3D3D] transition-colors duration-150 hover:bg-white motion-reduce:transition-none ${focusRing}`}
          >
            Back to home
          </Link>
          <a
            href={VOLUNTEER_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#3D3D3D] px-6 text-[15px] font-semibold text-[#3D3D3D] transition-colors duration-150 hover:bg-white motion-reduce:transition-none ${focusRing}`}
          >
            Become a volunteer
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    );
  }

  // ---------- Donation form ----------
  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-[20px] border border-[#D6D6D6] bg-white p-5 shadow-[0_8px_24px_rgba(1,42,95,0.06)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6D6D6] pb-4">
        <h2 className="font-outfit text-2xl font-semibold leading-9 text-[#012A5F]">
          Make a contribution
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F6F4] px-3 py-1.5 text-xs font-medium leading-[18px] text-[#5A5A5A]">
          <Lock aria-hidden="true" className="size-3.5 text-[#012A5F]" />
          Direct Trust Transfer
        </span>
      </div>

      {/* Amount */}
      <fieldset className="flex flex-col gap-3">
        <legend className={`${labelClass} mb-3`}>Select Rupee Amount</legend>
        <div className="flex flex-wrap gap-2.5">
          {AMOUNT_PRESETS.map((preset) => {
            const selected = matchedPreset === preset;
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmountText(String(preset))}
                className={`inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none ${focusRing} ${
                  selected
                    ? "bg-[#012A5F] text-white"
                    : "border border-[#8A8A8A] bg-white text-[#3D3D3D] hover:border-[#012A5F]"
                }`}
              >
                {formatINR(preset)}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={isOther}
            onClick={selectOther}
            className={`inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none ${focusRing} ${
              isOther
                ? "bg-[#012A5F] text-white"
                : "border border-[#8A8A8A] bg-white text-[#3D3D3D] hover:border-[#012A5F]"
            }`}
          >
            Other
          </button>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={id("amount")} className={labelClass}>
          Specified Amount (INR)
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#012A5F]"
          >
            ₹
          </span>
          <input
            ref={amountRef}
            id={id("amount")}
            inputMode="numeric"
            autoComplete="off"
            value={amountText}
            onChange={onAmountChange}
            placeholder="Enter amount"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? id("amount-error") : undefined}
            className={`${fieldClass} pl-9 font-semibold text-[#012A5F]`}
          />
        </div>
        {errors.amount && (
          <p id={id("amount-error")} role="alert" className={errorClass}>
            {errors.amount}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={id("purpose")} className={labelClass}>
          Direct your contribution
        </label>
        <div className="relative">
          <select
            id={id("purpose")}
            value={purpose}
            onChange={(event) => setPurpose(event.target.value as Purpose)}
            className={`${fieldClass} appearance-none pr-10`}
          >
            {PURPOSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#012A5F]"
          />
        </div>
      </div>

      {/* Donor details */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id("fullName")} className={labelClass}>
            Full name
          </label>
          <input
            id={id("fullName")}
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? id("fullName-error") : undefined}
            className={fieldClass}
          />
          {errors.fullName && (
            <p id={id("fullName-error")} role="alert" className={errorClass}>
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={id("email")} className={labelClass}>
              Email address
            </label>
            <input
              id={id("email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? id("email-error") : undefined}
              className={fieldClass}
            />
            {errors.email && (
              <p id={id("email-error")} role="alert" className={errorClass}>
                {errors.email}
              </p>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={id("phone")} className={labelClass}>
              Phone number
            </label>
            <input
              id={id("phone")}
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Mobile number"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? id("phone-error") : undefined}
              className={fieldClass}
            />
            {errors.phone && (
              <p id={id("phone-error")} role="alert" className={errorClass}>
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 pt-1 text-sm leading-[21px] text-[#3D3D3D]">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
            className="size-[18px] shrink-0 accent-[#012A5F]"
          />
          Hide my name (donate anonymously)
        </label>
      </div>

      {/* Payment method */}
      <div className="flex flex-col gap-3 pt-2">
        <p id={id("method-label")} className={labelClass}>
          Payment Method
        </p>
        <div
          role="radiogroup"
          aria-labelledby={id("method-label")}
          className="grid grid-cols-3 gap-1 rounded-full bg-[#EEEDEC] p-1"
        >
          {METHODS.map((item) => {
            const selected = method === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMethod(item.id)}
                className={`min-h-10 rounded-full px-1 py-2 text-xs font-semibold leading-tight transition-colors duration-150 motion-reduce:transition-none sm:text-[13px] ${focusRing} ${
                  selected ? "bg-[#012A5F] text-white" : "text-[#3D3D3D] hover:bg-white/70"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#D6D6D6] bg-white p-5">
          {method === "upi" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="grid size-40 place-items-center rounded-[10px] border border-dashed border-[#8A8A8A] bg-[#F7F6F4]">
                <div className="flex flex-col items-center gap-2 text-[11px] font-semibold text-[#5A5A5A]">
                  <QrCode aria-hidden="true" className="size-10 text-[#012A5F]" />
                  [QR code to be added]
                </div>
              </div>
              <p className="text-[15px] font-semibold leading-[22.5px] text-[#012A5F]">
                UPI ID: [to be added]
              </p>
              <p className="text-[13px] leading-[19.5px] text-[#5A5A5A]">
                Scan using any UPI app (GPay, PhonePe, Paytm, BHIM)
              </p>
            </div>
          )}
          {method === "bank" && (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {["Account name", "Account number", "IFSC code", "Bank and branch"].map((term) => (
                <div key={term}>
                  <dt className="text-[#5A5A5A]">{term}</dt>
                  <dd className="font-semibold text-[#012A5F]">[to be added]</dd>
                </div>
              ))}
            </dl>
          )}
          {method === "online" && (
            <p className="text-[15px] leading-6 text-[#3D3D3D]">
              You will be taken to a secure payment page to complete your contribution.
            </p>
          )}
        </div>
      </div>

      {/* Consent */}
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-5 text-[#012A5F]">
          <input
            id={id("consent")}
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? id("consent-error") : undefined}
            className="mt-0.5 size-[18px] shrink-0 accent-[#012A5F]"
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy-policy" className="font-semibold underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            and authorize UNIHOPE Foundation to issue my contribution acknowledgement.
          </span>
        </label>
        {errors.consent && (
          <p id={id("consent-error")} role="alert" className={errorClass}>
            {errors.consent}
          </p>
        )}
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-xl border border-[#C62828] bg-white p-4 text-sm leading-6 text-[#C62828]"
        >
          Your payment did not go through and you have not been charged. Please try again, or
          contact us on {HELPLINE}.
        </p>
      )}

      {/* On mobile the button stays at the bottom of the screen while the form is in view */}
      <div className="flex flex-col gap-2 pt-2 max-lg:sticky max-lg:bottom-0 max-lg:z-10 max-lg:-mx-5 max-lg:border-t max-lg:border-[#D6D6D6] max-lg:bg-white max-lg:px-5 max-lg:py-3 sm:max-lg:-mx-8 sm:max-lg:px-8">
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`inline-flex h-12 w-full items-center justify-center rounded-full bg-[#012A5F] px-6 text-[15px] font-semibold tracking-[0.025em] text-white transition-colors duration-150 hover:bg-[#00142D] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none ${focusRing}`}
        >
          {status === "submitting" ? "Processing…" : donateLabel}
        </button>
        <p className="text-center text-xs leading-[18px] text-[#5A5A5A]">
          Your official digital receipt will be emailed immediately to you.
        </p>
      </div>
    </form>
  );
}
