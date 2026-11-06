/**
 * UNIHOPE Foundation — Premium Donation Receipt Email Template
 * Responsive, email-client-safe HTML + Plain-text email receipt matching
 * the approved A4 PDF Donation Receipt visual design identity.
 *
 * Design Tokens (Strict UNIHOPE Brand Specifications):
 *   Navy:        #102C50 (Primary headers, card borders, footer)
 *   Teal:        #168C86 (Accent bars, badges, table underlines)
 *   Light BG:    #F3F6FA (Outer email background, amount card, amount paid box)
 *   Body Text:   #263445 (Primary text, values, details)
 *   Muted Text:  #64748B (Secondary labels, registration numbers, metadata)
 *   Border:      #E2E8F0 (Subtle dividers, table borders, card outlines)
 *   Success:     #168C55 (Verified PAID badge, checkmarks)
 *   White:       #FFFFFF (Card canvas)
 */

export const BRAND_COLORS = {
  navy: "#102C50",
  teal: "#168C86",
  lightBg: "#F3F6FA",
  body: "#263445",
  muted: "#64748B",
  border: "#E2E8F0",
  cardBorder: "#CBD5E1",
  success: "#168C55",
  white: "#FFFFFF",
} as const;

export interface OrgDetails {
  name?: string;
  trustRegistrationNo?: string;
  pan?: string;
  registeredAddress?: string;
  email?: string;
  website?: string;
}

export interface TaxDetails {
  approvalSection?: string;
  provisionalUrn?: string;
  approvalDate?: string;
  validFrom?: string;
  validUntil?: string;
  statutoryWording?: string;
  disclaimer?: string;
}

export interface ReceiptData {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  anonymous: boolean;
  amount: number;
  purpose: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  formattedDate: string; // e.g. "04 Nov 2026, 10:30 AM"
  formattedAmount: string; // e.g. "₹1,000" or "INR 1,000.00"
  receiptNumber?: string;
  status?: string;
  currency?: string;
  orgDetails?: OrgDetails;
  taxDetails?: TaxDetails;
  logoUrl?: string;
  signatureUrl?: string;
  signatureCid?: string;
}

const DEFAULT_ORG: Required<OrgDetails> = {
  name: "UNIHOPE Foundation",
  trustRegistrationNo: "R/Chennai North Joint I/Book-4/228/2026",
  pan: "AABTU1234F",
  registeredAddress:
    "2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026",
  email: "unihopefoundation.official@gmail.com",
  website: "unihopefoundation.org",
};

const DEFAULT_TAX: Required<TaxDetails> = {
  approvalSection: "Section 80G Approval",
  provisionalUrn: "AAACU1234CF20261",
  approvalDate: "15 April 2026",
  validFrom: "AY 2026-27",
  validUntil: "AY 2029-30",
  statutoryWording:
    "Donations to UNIHOPE Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.",
  disclaimer:
    "This is a computer-generated official receipt issued by UNIHOPE Foundation. Valid without a physical seal.",
};

const DEFAULT_LOGO_URL =
  "https://unihopefoundation.org/UNIHOPE_LOGO__%20cir.png";

const DEFAULT_SIGNATURE_URL =
  "https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png";

export function buildDonationReceiptEmail(data: ReceiptData): {
  html: string;
  text: string;
} {
  const org: Required<OrgDetails> = {
    name: data.orgDetails?.name || DEFAULT_ORG.name,
    trustRegistrationNo:
      data.orgDetails?.trustRegistrationNo || DEFAULT_ORG.trustRegistrationNo,
    pan: data.orgDetails?.pan || DEFAULT_ORG.pan,
    registeredAddress:
      data.orgDetails?.registeredAddress || DEFAULT_ORG.registeredAddress,
    email: data.orgDetails?.email || DEFAULT_ORG.email,
    website: data.orgDetails?.website || DEFAULT_ORG.website,
  };

  const tax: Required<TaxDetails> = {
    approvalSection:
      data.taxDetails?.approvalSection || DEFAULT_TAX.approvalSection,
    provisionalUrn:
      data.taxDetails?.provisionalUrn || DEFAULT_TAX.provisionalUrn,
    approvalDate: data.taxDetails?.approvalDate || DEFAULT_TAX.approvalDate,
    validFrom: data.taxDetails?.validFrom || DEFAULT_TAX.validFrom,
    validUntil: data.taxDetails?.validUntil || DEFAULT_TAX.validUntil,
    statutoryWording:
      data.taxDetails?.statutoryWording || DEFAULT_TAX.statutoryWording,
    disclaimer: data.taxDetails?.disclaimer || DEFAULT_TAX.disclaimer,
  };

  const displayName = data.anonymous ? "Anonymous Supporter" : data.donorName;
  const currency = data.currency || "INR";
  const numAmount = typeof data.amount === "number" ? data.amount : 0;
  const formattedInr = `${currency} ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)}`;

  const rawId = (data.razorpayPaymentId || "UH000000")
    .replace(/^pay_/, "")
    .toUpperCase();
  const year = new Date().getFullYear();
  const receiptNo =
    data.receiptNumber || `UH-${year}-${rawId.slice(-6).padStart(6, "0")}`;
  const transactionRef = data.razorpayPaymentId || "N/A";
  const orderId = data.razorpayOrderId || "N/A";
  const purpose = data.purpose || "General Donation";
  const status = (data.status || "PAID").toUpperCase();

  const logoUrl = data.logoUrl || DEFAULT_LOGO_URL;
  const sigSrc = data.signatureUrl || DEFAULT_SIGNATURE_URL;

  // Plain-text Fallback
  const text = `
================================================================================
UNIHOPE Foundation — DONATION RECEIPT
Official Donation Receipt / Payment Acknowledgement
================================================================================

Receipt No.:      ${receiptNo}
Transaction Ref:  ${transactionRef}
Payment Status:   ${status}
Payment Date:     ${data.formattedDate}
Amount Received:  ${formattedInr}

DONOR DETAILS
--------------------------------------------------------------------------------
Donor Name:       ${displayName}
Email Address:    ${data.donorEmail}
Phone Number:     ${data.donorPhone || "N/A"}

PAYMENT DETAILS
--------------------------------------------------------------------------------
Payment Date:     ${data.formattedDate}
Payment Status:   ${status}
Payment ID:       ${transactionRef}
Order ID:         ${orderId}

DONATION DETAILS
--------------------------------------------------------------------------------
Description:      Donation to ${org.name} - ${purpose}
Unit Price:       ${formattedInr}
Quantity:         1
Amount Paid:      ${formattedInr}

STATUTORY / TAX APPROVAL DETAILS
--------------------------------------------------------------------------------
Approval Section: ${tax.approvalSection}
Provisional URN:  ${tax.provisionalUrn}
Approval Date:    ${tax.approvalDate}
Validity Period:  ${tax.validFrom} to ${tax.validUntil}
${tax.statutoryWording}
${tax.disclaimer}

ORGANIZATION
--------------------------------------------------------------------------------
${org.name}
Trust Reg. No.:   ${org.trustRegistrationNo}
PAN:              ${org.pan}
Address:          ${org.registeredAddress}
Email:            ${org.email}
Website:          https://${org.website}

Authorized Signatory
Founder, ${org.name}

Note: An official print-ready PDF receipt is attached to this email.
================================================================================
`.trim();

  // Premium Responsive HTML Email
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>Donation Receipt — ${receiptNo} — ${org.name}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset & base styling */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    /* Mobile responsive adjustments */
    @media only screen and (max-width: 620px) {
      .container-table {
        width: 100% !important;
        max-width: 100% !important;
      }
      .stack-column {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        box-sizing: border-box !important;
      }
      .stack-spacer {
        height: 16px !important;
      }
      .header-right {
        text-align: left !important;
        margin-top: 12px !important;
      }
      .mobile-padding {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .amount-title {
        font-size: 24px !important;
      }
      .hide-mobile {
        display: none !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_COLORS.lightBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; color: ${BRAND_COLORS.body};">

  <!-- Outer Canvas Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_COLORS.lightBg}; padding: 24px 8px 36px 8px;">
    <tr>
      <td align="center">

        <!-- Main Card Container (600px Max) -->
        <table role="presentation" class="container-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: ${BRAND_COLORS.white}; border-radius: 8px; border: 1px solid ${BRAND_COLORS.border}; box-shadow: 0 4px 16px rgba(16, 44, 80, 0.06); overflow: hidden;">

          <!-- Top Brand Accent Bar (Navy & Teal) -->
          <tr>
            <td style="height: 5px; background-color: ${BRAND_COLORS.navy}; font-size: 1px; line-height: 1px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="70%" style="height: 5px; background-color: ${BRAND_COLORS.navy};"></td>
                  <td width="30%" style="height: 5px; background-color: ${BRAND_COLORS.teal};"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 1. HEADER: Logo, Trust Info & Verification Status -->
          <tr>
            <td class="mobile-padding" style="padding: 24px 28px 20px 28px; border-bottom: 1px solid ${BRAND_COLORS.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Official Logo & Organization Info -->
                  <td style="vertical-align: top;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 14px;">
                          <img src="${logoUrl}" alt="${org.name}" width="52" height="52" style="display: block; width: 52px; height: 52px; border-radius: 50%;" />
                        </td>
                        <td style="vertical-align: top;">
                          <div style="font-size: 18px; font-weight: 800; color: ${BRAND_COLORS.navy}; line-height: 1.25; letter-spacing: -0.2px;">
                            ${org.name}
                          </div>
                          <div style="font-size: 10.5px; color: ${BRAND_COLORS.muted}; margin-top: 4px; line-height: 1.4;">
                            Trust Reg. No.: ${org.trustRegistrationNo}${org.pan ? ` &nbsp;|&nbsp; PAN: ${org.pan}` : ""}
                          </div>
                          <div style="font-size: 9.5px; color: ${BRAND_COLORS.muted}; margin-top: 2px; line-height: 1.35; max-width: 330px;">
                            ${org.registeredAddress}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Right: Razorpay Verification & Status Badge -->
                  <td align="right" style="vertical-align: top; padding-left: 10px;">
                    <!-- Razorpay Badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block;">
                      <tr>
                        <td style="background-color: ${BRAND_COLORS.white}; border: 1px solid ${BRAND_COLORS.border}; border-radius: 12px; padding: 4px 10px; font-size: 10.5px; font-weight: 600; color: ${BRAND_COLORS.navy}; white-space: nowrap;">
                          <span style="color: ${BRAND_COLORS.teal}; font-weight: 800; font-size: 11px;">&#10004;</span>&nbsp;Verified by Razorpay
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 6px;">
                      <span style="font-size: 9px; font-weight: 700; color: ${BRAND_COLORS.muted}; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 2px;">PAYMENT STATUS</span>
                      <span style="display: inline-block; background-color: ${BRAND_COLORS.success}; color: ${BRAND_COLORS.white}; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 4px; letter-spacing: 0.5px;">PAID</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. DOCUMENT TITLE & METADATA -->
          <tr>
            <td class="mobile-padding" style="padding: 20px 28px 16px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Heading -->
                  <td style="vertical-align: top;">
                    <div style="font-size: 22px; font-weight: 800; color: ${BRAND_COLORS.navy}; letter-spacing: 0.8px; text-transform: uppercase; line-height: 1.2;">
                      DONATION RECEIPT
                    </div>
                    <div style="font-size: 11px; color: ${BRAND_COLORS.muted}; margin-top: 4px;">
                      Official Donation Receipt / Payment Acknowledgement
                    </div>
                  </td>

                  <!-- Right: Metadata -->
                  <td align="right" style="vertical-align: top;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size: 11px; line-height: 1.5;">
                      <tr>
                        <td align="right" style="color: ${BRAND_COLORS.muted}; padding-right: 8px;">Receipt No.:</td>
                        <td align="right" style="color: ${BRAND_COLORS.navy}; font-weight: 700;">${receiptNo}</td>
                      </tr>
                      <tr>
                        <td align="right" style="color: ${BRAND_COLORS.muted}; padding-right: 8px;">Transaction Ref:</td>
                        <td align="right" style="color: ${BRAND_COLORS.body}; font-weight: 600; font-family: monospace;">${transactionRef}</td>
                      </tr>
                      <tr>
                        <td align="right" style="color: ${BRAND_COLORS.muted}; padding-right: 8px;">Donation Purpose:</td>
                        <td align="right" style="color: ${BRAND_COLORS.body}; font-weight: 600;">${purpose}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. AMOUNT RECEIVED HERO CARD (Teal Accent Border & Background) -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_COLORS.lightBg}; border-left: 4px solid ${BRAND_COLORS.teal}; border-radius: 6px; padding: 16px 20px;">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 700; color: ${BRAND_COLORS.navy}; text-transform: uppercase; letter-spacing: 1.2px;">
                      AMOUNT RECEIVED
                    </div>
                    <div class="amount-title" style="font-size: 28px; font-weight: 800; color: ${BRAND_COLORS.navy}; line-height: 1.15; margin-top: 4px; letter-spacing: -0.5px;">
                      ${formattedInr}
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="font-size: 15px; font-weight: 800; color: ${BRAND_COLORS.success}; line-height: 1.2;">
                      &#10004;&nbsp;PAID
                    </div>
                    <div style="font-size: 10.5px; color: ${BRAND_COLORS.muted}; margin-top: 3px;">
                      Payment received successfully
                    </div>
                    <div style="font-size: 10.5px; color: ${BRAND_COLORS.body}; margin-top: 1px; font-weight: 500;">
                      ${data.formattedDate}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4. DONOR & PAYMENT DETAILS (Two-Column Grid) -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Donor Details -->
                  <td class="stack-column" width="48%" style="vertical-align: top; padding-right: 12px;">
                    <div style="font-size: 11px; font-weight: 800; color: ${BRAND_COLORS.navy}; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid ${BRAND_COLORS.teal}; padding-bottom: 5px; margin-bottom: 10px;">
                      DONOR DETAILS
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11.5px; line-height: 1.6;">
                      <tr>
                        <td style="color: ${BRAND_COLORS.muted}; font-size: 10px; text-transform: uppercase;">Donor Full Name</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.body}; font-weight: 700; font-size: 13px; padding-bottom: 6px;">${displayName}</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.muted}; font-size: 10px; text-transform: uppercase;">Email Address</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.body}; word-break: break-all; padding-bottom: 6px;">${data.donorEmail}</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.muted}; font-size: 10px; text-transform: uppercase;">Phone Number</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.body};">${data.donorPhone || "N/A"}</td>
                      </tr>
                    </table>
                  </td>

                  <!-- Spacer for mobile stack -->
                  <td class="stack-spacer hide-mobile" width="4%"></td>

                  <!-- Right: Payment Details -->
                  <td class="stack-column" width="48%" style="vertical-align: top; padding-left: 12px;">
                    <div style="font-size: 11px; font-weight: 800; color: ${BRAND_COLORS.navy}; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid ${BRAND_COLORS.teal}; padding-bottom: 5px; margin-bottom: 10px;">
                      PAYMENT DETAILS
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11.5px; line-height: 1.6;">
                      <tr>
                        <td style="color: ${BRAND_COLORS.muted}; font-size: 10px; text-transform: uppercase;">Payment Date</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.body}; font-weight: 600; padding-bottom: 6px;">${data.formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.muted}; font-size: 10px; text-transform: uppercase;">Razorpay Payment ID</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.body}; font-family: monospace; word-break: break-all; padding-bottom: 6px;">${transactionRef}</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.muted}; font-size: 10px; text-transform: uppercase;">Razorpay Order ID</td>
                      </tr>
                      <tr>
                        <td style="color: ${BRAND_COLORS.body}; font-family: monospace; word-break: break-all;">${orderId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5. DONATION DETAILS TABLE -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 20px 28px;">
              <div style="font-size: 11px; font-weight: 800; color: ${BRAND_COLORS.navy}; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid ${BRAND_COLORS.teal}; padding-bottom: 5px; margin-bottom: 10px;">
                DONATION DETAILS
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-size: 11.5px;">
                <thead>
                  <tr style="border-bottom: 1px solid ${BRAND_COLORS.border};">
                    <th align="left" style="padding: 8px 6px; font-size: 10px; color: ${BRAND_COLORS.navy}; font-weight: 700; text-transform: uppercase;">Description</th>
                    <th align="right" style="padding: 8px 6px; font-size: 10px; color: ${BRAND_COLORS.navy}; font-weight: 700; text-transform: uppercase;">Unit Price</th>
                    <th align="center" style="padding: 8px 6px; font-size: 10px; color: ${BRAND_COLORS.navy}; font-weight: 700; text-transform: uppercase;">Qty</th>
                    <th align="right" style="padding: 8px 6px; font-size: 10px; color: ${BRAND_COLORS.navy}; font-weight: 700; text-transform: uppercase;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid ${BRAND_COLORS.border};">
                    <td align="left" style="padding: 12px 6px; vertical-align: top;">
                      <div style="font-weight: 700; color: ${BRAND_COLORS.navy};">Donation to ${org.name}</div>
                      <div style="font-size: 10.5px; color: ${BRAND_COLORS.muted}; margin-top: 2px;">${purpose}</div>
                    </td>
                    <td align="right" style="padding: 12px 6px; vertical-align: top; color: ${BRAND_COLORS.body};">${formattedInr}</td>
                    <td align="center" style="padding: 12px 6px; vertical-align: top; color: ${BRAND_COLORS.body};">1</td>
                    <td align="right" style="padding: 12px 6px; vertical-align: top; font-weight: 600; color: ${BRAND_COLORS.body};">${formattedInr}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Totals Breakdown & Highlighted Amount Paid -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
                <tr>
                  <td></td>
                  <td align="right" style="width: 240px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11.5px; line-height: 1.8;">
                      <tr>
                        <td align="right" style="color: ${BRAND_COLORS.muted}; padding-right: 14px;">Total Amount:</td>
                        <td align="right" style="color: ${BRAND_COLORS.navy}; font-weight: 700;">${formattedInr}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 4px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_COLORS.lightBg}; border: 1px solid ${BRAND_COLORS.border}; border-radius: 4px; padding: 8px 12px;">
                            <tr>
                              <td align="left" style="font-size: 12px; font-weight: 800; color: ${BRAND_COLORS.navy};">Amount Paid</td>
                              <td align="right" style="font-size: 13.5px; font-weight: 800; color: ${BRAND_COLORS.navy};">${formattedInr}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. STATUTORY / TAX APPROVAL DETAILS (Structured Box) -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid ${BRAND_COLORS.border}; border-radius: 6px; padding: 14px 16px;">
                <tr>
                  <td>
                    <div style="font-size: 10.5px; font-weight: 800; color: ${BRAND_COLORS.navy}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">
                      STATUTORY / TAX APPROVAL DETAILS
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 10px; line-height: 1.5; margin-bottom: 10px;">
                      <tr>
                        <td style="width: 50%; padding-bottom: 6px; vertical-align: top;">
                          <div style="color: ${BRAND_COLORS.muted}; text-transform: uppercase; font-size: 9px;">Provisional URN</div>
                          <div style="color: ${BRAND_COLORS.navy}; font-weight: 700;">${tax.provisionalUrn}</div>
                        </td>
                        <td style="width: 50%; padding-bottom: 6px; vertical-align: top;">
                          <div style="color: ${BRAND_COLORS.muted}; text-transform: uppercase; font-size: 9px;">Approval Reference</div>
                          <div style="color: ${BRAND_COLORS.body}; font-weight: 600;">${tax.approvalSection}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top;">
                          <div style="color: ${BRAND_COLORS.muted}; text-transform: uppercase; font-size: 9px;">Approval Date</div>
                          <div style="color: ${BRAND_COLORS.body}; font-weight: 600;">${tax.approvalDate}</div>
                        </td>
                        <td style="vertical-align: top;">
                          <div style="color: ${BRAND_COLORS.muted}; text-transform: uppercase; font-size: 9px;">Validity Period</div>
                          <div style="color: ${BRAND_COLORS.body}; font-weight: 600;">${tax.validFrom} to ${tax.validUntil}</div>
                        </td>
                      </tr>
                    </table>
                    <div style="border-top: 1px solid ${BRAND_COLORS.border}; padding-top: 8px; font-size: 9.5px; color: ${BRAND_COLORS.muted}; line-height: 1.45;">
                      <div>${tax.statutoryWording}</div>
                      <div style="margin-top: 3px; font-style: italic;">${tax.disclaimer}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. ORGANIZATION & AUTHORIZED SIGNATORY BLOCK -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Organization summary -->
                  <td class="stack-column" width="55%" style="vertical-align: bottom;">
                    <div style="font-size: 11px; font-weight: 800; color: ${BRAND_COLORS.navy};">${org.name}</div>
                    <div style="font-size: 9.5px; color: ${BRAND_COLORS.muted}; margin-top: 2px;">
                      Trust Reg. No.: ${org.trustRegistrationNo}<br />
                      ${org.pan ? `PAN: ${org.pan}<br />` : ""}
                      ${org.registeredAddress}
                    </div>
                  </td>

                  <!-- Right: Genuine Founder Handwritten Signature & Seal -->
                  <td class="stack-column" width="45%" align="right" style="vertical-align: bottom; text-align: right;">
                    ${
                      sigSrc
                        ? `
                    <div style="margin-bottom: 2px;">
                      <img src="${sigSrc}" alt="Authorized Signatory" width="140" height="70" style="display: block; width: 140px; height: auto; margin-left: auto;" />
                    </div>`
                        : `
                    <div style="height: 48px;"></div>`
                    }
                    <div style="border-top: 1px solid ${BRAND_COLORS.navy}; width: 170px; margin-left: auto;"></div>
                    <div style="font-size: 11px; font-weight: 800; color: ${BRAND_COLORS.navy}; margin-top: 5px;">
                      Authorized Signatory
                    </div>
                    <div style="font-size: 9.5px; color: ${BRAND_COLORS.muted}; margin-top: 1px;">
                      Founder, ${org.name}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 8. ATTACHMENT NOTICE BANNER -->
          <tr>
            <td class="mobile-padding" style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND_COLORS.lightBg}; border: 1px dashed ${BRAND_COLORS.teal}; border-radius: 6px; padding: 12px 16px;">
                <tr>
                  <td align="center" style="font-size: 11px; color: ${BRAND_COLORS.body}; line-height: 1.5;">
                    <strong style="color: ${BRAND_COLORS.navy};">&#128206; Official PDF Receipt Attached:</strong> A print-ready, digitally verified A4 PDF donation receipt is attached to this email for your financial records and 80G tax exemption.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 9. BRAND FOOTER (Navy background with Teal top border) -->
          <tr>
            <td class="mobile-padding" style="background-color: ${BRAND_COLORS.navy}; border-top: 3px solid ${BRAND_COLORS.teal}; padding: 22px 28px 24px 28px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 12px; font-weight: 800; color: ${BRAND_COLORS.white}; letter-spacing: 0.5px;">
                      ${org.name}
                    </div>
                    <div style="font-size: 10.5px; color: #CBD5E1; margin-top: 4px;">
                      <a href="https://${org.website}" style="color: #93C5FD; text-decoration: none;">${org.website}</a>
                      &nbsp;&bull;&nbsp;
                      <a href="mailto:${org.email}" style="color: #93C5FD; text-decoration: none;">${org.email}</a>
                    </div>
                    <div style="font-size: 10px; color: #94A3B8; margin-top: 10px; font-style: italic;">
                      Thank you for your generous support. Together, we create meaningful change.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Main Card Container -->

      </td>
    </tr>
  </table>
  <!-- /Outer Canvas Wrapper -->

</body>
</html>`.trim();

  return { html, text };
}
