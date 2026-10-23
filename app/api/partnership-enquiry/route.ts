type PartnershipEnquiry = {
  organisationName: string;
  contactPerson: string;
  workEmail: string;
  phone: string;
  message: string;
};

type ContactEnquiry = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const CONTACT_SUBJECTS = [
  "General enquiry",
  "Volunteer Opportunities",
  "CSR & Institutional Partnerships",
  "Donations & Tax Exemptions",
  "Community Camp Request",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
  optional = false,
): string | null {
  const value = body[key];
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (optional && !trimmed) return "";
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return (
    value.length <= 30 &&
    /^\+?[0-9().\-\s]+$/.test(value) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

function providerErrorDetails(value: unknown): { name: string; message: string } {
  if (!isRecord(value)) {
    return { name: "unknown", message: "No structured provider error was returned." };
  }

  const error = isRecord(value.error) ? value.error : value;
  return {
    name:
      typeof error.name === "string" ? error.name.slice(0, 100) : "unknown",
    message:
      typeof error.message === "string"
        ? error.message.slice(0, 1000)
        : "No provider error message was returned.",
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "The form submission was not valid JSON. Please try again." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return Response.json({ error: "Unable to process this enquiry." }, { status: 400 });
  }

  if (
    body.formType !== undefined &&
    body.formType !== "contact" &&
    body.formType !== "partnership"
  ) {
    return Response.json(
      { error: "This form submission type is not supported." },
      { status: 400 },
    );
  }

  const isContactForm = body.formType === "contact";
  let replyTo: string;
  let emailSubject: string;
  let emailText: string;

  if (isContactForm) {
    const enquiry: ContactEnquiry = {
      fullName: readText(body, "fullName", 150) ?? "",
      email: readText(body, "email", 254) ?? "",
      phone: readText(body, "phone", 30, true) ?? "",
      subject: readText(body, "subject", 80) ?? "",
      message: readText(body, "message", 5000) ?? "",
    };
    const errors: string[] = [];

    if (!enquiry.fullName) errors.push("full name");
    if (!isValidEmail(enquiry.email)) errors.push("a valid email address");
    if (body.phone !== undefined && body.phone !== "" && !isValidPhone(enquiry.phone)) {
      errors.push("a valid phone number");
    }
    if (!CONTACT_SUBJECTS.includes(enquiry.subject)) errors.push("a valid subject");
    if (!enquiry.message) errors.push("message");
    if (body.agreedToPrivacy !== true) errors.push("privacy policy consent");

    if (errors.length) {
      return Response.json(
        { error: `Please provide ${errors.join(", ")}.` },
        { status: 400 },
      );
    }

    replyTo = enquiry.email;
    emailSubject = `Contact enquiry: ${enquiry.subject}`;
    emailText = [
      "New contact form message",
      "",
      `Name: ${enquiry.fullName}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone || "Not provided"}`,
      `Subject: ${enquiry.subject}`,
      "",
      "Message:",
      enquiry.message,
      "",
      "Privacy policy accepted: Yes",
    ].join("\n");
  } else {
    const enquiry: PartnershipEnquiry = {
      organisationName: readText(body, "organisationName", 200) ?? "",
      contactPerson: readText(body, "contactPerson", 150) ?? "",
      workEmail: readText(body, "workEmail", 254) ?? "",
      phone: readText(body, "phone", 30) ?? "",
      message: readText(body, "message", 5000) ?? "",
    };
    const errors: string[] = [];

    if (!enquiry.organisationName) errors.push("organization name");
    if (!enquiry.contactPerson) errors.push("contact person");
    if (!isValidEmail(enquiry.workEmail)) errors.push("a valid work email address");
    if (!isValidPhone(enquiry.phone)) errors.push("a valid phone number");
    if (!enquiry.message) errors.push("message");
    if (body.agreedToPrivacy !== true) errors.push("privacy policy consent");

    if (errors.length) {
      return Response.json(
        { error: `Please provide ${errors.join(", ")}.` },
        { status: 400 },
      );
    }

    replyTo = enquiry.workEmail;
    emailSubject = "New UNIHOPE partnership enquiry";
    emailText = [
      "New partnership enquiry",
      "",
      `Organisation: ${enquiry.organisationName}`,
      `Contact person: ${enquiry.contactPerson}`,
      `Work email: ${enquiry.workEmail}`,
      `Phone: ${enquiry.phone}`,
      "",
      "How they would like to work with UNIHOPE:",
      enquiry.message,
      "",
      "Privacy policy accepted: Yes",
    ].join("\n");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  const recipient = process.env.CONTACT_TO_EMAIL || process.env.CONTACT_EMAIL;
  if (
    !apiKey ||
    !sender ||
    !isValidEmail(sender) ||
    !recipient ||
    !isValidEmail(recipient)
  ) {
    const invalidConfiguration = [
      !apiKey && "RESEND_API_KEY",
      (!sender || !isValidEmail(sender)) && "RESEND_FROM_EMAIL",
      (!recipient || !isValidEmail(recipient)) && "CONTACT_TO_EMAIL",
    ].filter((name): name is string => Boolean(name));
    console.error("Email delivery configuration is missing or invalid.", {
      variables: invalidConfiguration,
    });
    return Response.json(
      { error: "Email delivery is not configured yet. Please contact us directly." },
      { status: 503 },
    );
  }

  let resendResponse: Response;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: replyTo,
        subject: emailSubject,
        text: emailText,
      }),
    });
  } catch (error) {
    console.error("Unable to reach the email delivery service.", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : "Unknown network error.",
    });
    return Response.json(
      { error: "We could not send your enquiry. Please try again shortly." },
      { status: 502 },
    );
  }

  if (!resendResponse.ok) {
    let responseBody: unknown;
    try {
      responseBody = await resendResponse.json();
    } catch {
      responseBody = null;
    }

    const details = providerErrorDetails(responseBody);
    console.error("Email delivery service rejected the request.", {
      httpStatus: resendResponse.status,
      providerErrorName: details.name,
      providerErrorMessage: details.message,
    });

    if (resendResponse.status === 401) {
      return Response.json(
        { error: "Email service authentication failed. Please contact us directly." },
        { status: 502 },
      );
    }

    if (resendResponse.status === 403 || resendResponse.status === 422) {
      return Response.json(
        {
          error:
            "The email service could not accept this enquiry. Please try again later or contact us directly.",
        },
        { status: 502 },
      );
    }

    if (resendResponse.status === 429) {
      return Response.json(
        { error: "Too many enquiries were sent at once. Please wait and try again." },
        { status: 429 },
      );
    }

    return Response.json(
      { error: "We could not send your enquiry. Please try again shortly." },
      { status: 502 },
    );
  }

  return Response.json({ success: true });
}
