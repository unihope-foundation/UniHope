import { PURPOSES, type Purpose } from "@/lib/donations";
import { HELPLINE, REG_NO } from "@/content/donate";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON format." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const purpose = typeof body.purpose === "string" ? body.purpose.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const anonymous = Boolean(body.anonymous);

  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 1) {
    return Response.json(
      { error: "Please enter a valid donation amount in whole rupees." },
      { status: 400 },
    );
  }

  if (!PURPOSES.includes(purpose as Purpose)) {
    return Response.json(
      { error: "Please select a valid donation purpose." },
      { status: 400 },
    );
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return Response.json(
      { error: "Please provide a valid full name (2 to 100 characters)." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (!PHONE_RE.test(phone) || phone.length > 20) {
    return Response.json(
      { error: "Please provide a valid phone number (10 to 15 digits)." },
      { status: 400 },
    );
  }

  const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const referenceId = `BNK-${timestamp}-${randomSuffix}`;

  // Optionally email pledge instructions if Resend configured
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (apiKey && sender) {
    const emailBody = [
      `Dear ${fullName},`,
      "",
      "Thank you for pledging your support to UNIHOPE Foundation via Bank Transfer.",
      "",
      `Pledge Reference ID: ${referenceId}`,
      `Contribution Amount: ₹${amount.toLocaleString("en-IN")}`,
      `Purpose: ${purpose}`,
      `Registration No.: ${REG_NO}`,
      "",
      "Please complete your transfer via NEFT / RTGS / IMPS. To receive our verified trust account details, please reply to this email or call our helpline at " + HELPLINE + ".",
      "",
      "Once your bank transfer is credited and verified by our accounts department, your official 80G digital receipt will be emailed to you.",
      "",
      "Warm regards,",
      "UNIHOPE Foundation Team",
    ].join("\n");

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: sender,
          to: [email],
          subject: `Bank Transfer Pledge Acknowledgement — UNIHOPE Foundation (${referenceId})`,
          text: emailBody,
        }),
      });
    } catch (e) {
      console.error("Non-fatal: failed to send pledge acknowledgement email:", e);
    }
  }

  return Response.json({
    success: true,
    referenceId,
    status: "pending",
  });
}
