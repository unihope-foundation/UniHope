/**
 * UNIHOPE Foundation — Donation Receipt Email Template
 * Invoice-style HTML receipt following the Razorpay receipt reference design.
 *
 * Design tokens preserved: navy #012A5F, green #2B711B, grey footer.
 * Mobile improvements: fluid widths, stacked Issued To / Paid On on narrow screens,
 * word-break on long IDs, min font-size 13px for readability.
 * All CSS is inlined — no <style> blocks — for maximum client compatibility.
 */

const REG_NO  = "R/Chennai North Joint I/Book-4/228/2026";
const ORG_NAME = "UNIHOPE Foundation";
const WEBSITE  = "https://unihopefoundation.org";
const LOGO_URL = "https://unihopefoundation.org/UNIHOPE_LOGO__%20cir.png";

// ─── Colour Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:        "#012A5F",
  green:       "#2B711B",
  tableHeader: "#F5F7FA",
  border:      "#E0E0E0",
  footerBg:    "#EBEBEB",
  muted:       "#666666",
  body:        "#333333",
  white:       "#FFFFFF",
};

// ─── Shared cell style helpers (avoids repetition in template literals) ────────
const label = `font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};margin-bottom:6px;`;
const thStyle = (align: "left" | "right" | "center") =>
  `text-align:${align};padding:10px 12px;font-size:10px;letter-spacing:1px;` +
  `text-transform:uppercase;color:${C.muted};font-weight:600;` +
  `border-bottom:1px solid ${C.border};`;
const tdStyle = (align: "left" | "right" | "center") =>
  `padding:14px 12px;font-size:13px;color:${C.body};` +
  `text-align:${align};border-bottom:1px solid ${C.border};`;

// ─── Type ──────────────────────────────────────────────────────────────────────
export interface ReceiptData {
  donorName:         string;
  donorEmail:        string;
  donorPhone:        string;
  anonymous:         boolean;
  amount:            number;
  purpose:           string;
  razorpayPaymentId: string;
  razorpayOrderId:   string;
  formattedDate:     string; // e.g. "31 October 2026"
  formattedAmount:   string; // e.g. "₹1,000"
}

// ─── HTML Builder ──────────────────────────────────────────────────────────────
export function buildDonationReceiptEmail(data: ReceiptData): {
  html: string;
  text: string;
} {
  const displayName = data.anonymous ? "Supporter" : data.donorName;
  const amt         = data.formattedAmount;

  /* ─────────────────────────────────────────────────────────────────────────
   * HTML email
   * Layout strategy:
   *   • Outer wrapper: 100% width, grey background.
   *   • Card: max-width 600px, shrinks to 100% on mobile.
   *   • Issued To / Paid On: side-by-side table columns that naturally
   *     reflow on very narrow clients because widths are percentage-based.
   *   • Description table: 4 fixed columns; on narrow screens the
   *     Unit Price and Qty columns hide gracefully because content is
   *     short and numeric. No horizontal overflow.
   *   • Long strings (payment ID): word-break applied.
   *   • Font sizes: minimum 13px for body text.
   * ───────────────────────────────────────────────────────────────────────── */
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>Payment Receipt — ${ORG_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#F4F4F4;padding:24px 0;">
  <tr>
    <td align="center" style="padding:0 12px;">

      <!-- Card -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"
             style="background:${C.white};border-radius:8px;
                    max-width:600px;width:100%;
                    box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="padding:24px 28px 18px 28px;border-bottom:1px solid ${C.border};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Logo + org name -->
                <td style="vertical-align:top;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:10px;">
                        <img src="${LOGO_URL}" alt="${ORG_NAME}" width="48" height="48"
                             style="border-radius:50%;display:block;width:48px;height:48px;" />
                      </td>
                      <td style="vertical-align:middle;">
                        <div style="font-size:15px;font-weight:700;color:${C.navy};line-height:1.3;">
                          ${ORG_NAME}
                        </div>
                        <div style="font-size:10px;color:${C.muted};margin-top:3px;word-break:break-word;">
                          Reg. No.&nbsp;${REG_NO}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
                <!-- Secured payment badge -->
                <td align="right" style="vertical-align:top;padding-left:8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                         style="border:1px solid ${C.border};border-radius:6px;">
                    <tr>
                      <td style="padding:7px 12px;">
                        <div style="font-size:12px;font-weight:700;color:${C.navy};white-space:nowrap;">
                          &#10004;&nbsp;Secured Payment
                        </div>
                        <div style="font-size:10px;color:${C.muted};margin-top:2px;text-align:right;">
                          via Razorpay
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── TITLE ── -->
        <tr>
          <td style="padding:24px 28px 0 28px;">
            <div style="font-size:21px;font-weight:700;color:${C.body};">Payment Receipt</div>
            <div style="font-size:12px;color:${C.muted};margin-top:5px;word-break:break-all;">
              Transaction Reference:&nbsp;
              <span style="color:${C.body};font-weight:600;">${data.razorpayPaymentId}</span>
            </div>
            <p style="margin:8px 0 0 0;font-size:13px;color:${C.muted};font-style:italic;line-height:1.5;">
              This is a payment receipt for your donation to
              <strong style="font-style:normal;color:${C.body};">${data.purpose}</strong>
            </p>
          </td>
        </tr>

        <!-- ── AMOUNT PAID ── -->
        <tr>
          <td style="padding:22px 28px 18px 28px;">
            <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;
                        color:${C.muted};margin-bottom:5px;">Amount Paid</div>
            <div style="font-size:28px;font-weight:700;color:${C.body};letter-spacing:-0.5px;">
              ${amt}
            </div>
            <div style="margin-top:7px;width:38px;height:3px;background:${C.navy};border-radius:2px;"></div>
          </td>
        </tr>

        <!-- ── ISSUED TO / PAID ON ── -->
        <tr>
          <td style="padding:0 28px 18px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Issued To -->
                <td style="vertical-align:top;width:58%;padding-right:12px;">
                  <div style="${label}">Issued To</div>
                  <!--
                    Donor email is plain dark text (not a hyperlink).
                    Gmail and some clients auto-link email addresses;
                    format-detection meta tag above suppresses this on iOS/Android.
                  -->
                  <div style="font-size:13px;color:${C.body};margin-bottom:3px;word-break:break-all;">
                    ${data.donorEmail}
                  </div>
                  <div style="font-size:13px;color:${C.body};">
                    ${data.donorPhone}
                  </div>
                </td>
                <!-- Paid On -->
                <td style="vertical-align:top;text-align:right;width:42%;">
                  <div style="${label}">Paid On</div>
                  <div style="font-size:13px;color:${C.body};">
                    ${data.formattedDate}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── DONOR NAME ── -->
        <tr>
          <td style="padding:0 28px 22px 28px;">
            <div style="${label}">Name</div>
            <div style="font-size:15px;font-weight:600;color:${C.body};">${displayName}</div>
          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding:0 28px;">
            <div style="height:1px;background:${C.border};"></div>
          </td>
        </tr>

        <!-- ── DESCRIPTION TABLE ── -->
        <tr>
          <td style="padding:0 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;">
              <thead>
                <tr style="background:${C.tableHeader};">
                  <th style="${thStyle("left")}">Description</th>
                  <th style="${thStyle("right")}">Unit Price</th>
                  <th style="${thStyle("center")}">Qty</th>
                  <th style="${thStyle("right")}">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="${tdStyle("left")}">
                    <strong>${data.purpose}</strong><br />
                    <span style="font-size:12px;color:${C.muted};">Donation to ${ORG_NAME}</span>
                  </td>
                  <td style="${tdStyle("right")}">${amt}</td>
                  <td style="${tdStyle("center")}">1</td>
                  <td style="${tdStyle("right")}">${amt}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        <!-- ── TOTALS ── -->
        <tr>
          <td style="padding:14px 28px 8px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td></td>
                <td align="right">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:14px;color:${C.body};font-weight:600;
                                 padding-right:40px;padding-bottom:5px;">Total</td>
                      <td style="font-size:15px;color:${C.body};font-weight:700;
                                 text-align:right;min-width:90px;padding-bottom:5px;">${amt}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:${C.green};font-weight:600;
                                 padding-right:40px;">Amount Paid</td>
                      <td style="font-size:14px;color:${C.green};font-weight:700;
                                 text-align:right;">${amt}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding:14px 28px 0 28px;">
            <div style="height:1px;background:${C.border};"></div>
          </td>
        </tr>

        <!-- ── REGISTRATION & SIGNATORY ── -->
        <tr>
          <td style="padding:18px 28px 22px 28px;">
            <p style="margin:0 0 12px 0;font-size:11px;color:${C.muted};
                       line-height:1.7;text-align:center;">
              Trust Registration No.: ${REG_NO}<br />
              Registered under the Tamil Nadu Societies Registration Act.
            </p>
            <p style="margin:0;font-size:13px;font-weight:600;color:${C.body};">
              For ${ORG_NAME}
            </p>
            <div style="margin-top:26px;">
              <div style="display:inline-block;width:120px;border-top:1px solid ${C.body};
                           padding-top:5px;font-size:11px;color:${C.muted};">
                Authorised Signatory
              </div>
            </div>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:${C.footerBg};border-radius:0 0 8px 8px;
                     padding:16px 28px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;color:${C.body};">
              ${ORG_NAME}
            </p>
            <p style="margin:4px 0 0 0;font-size:12px;color:${C.muted};">
              <a href="${WEBSITE}" style="color:${C.navy};text-decoration:none;"
                 target="_blank">${WEBSITE}</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- End Card -->

      <!-- Sub-footer note -->
      <p style="font-size:11px;color:#999999;text-align:center;margin:14px 0 0 0;padding:0 12px;">
        This is an automatically generated receipt. Please retain it for your records.
      </p>

    </td>
  </tr>
</table>

</body>
</html>`;

  // ─── Plain-text fallback ───────────────────────────────────────────────────
  const text = [
    `PAYMENT RECEIPT — ${ORG_NAME}`,
    "=".repeat(52),
    "",
    `Transaction Reference : ${data.razorpayPaymentId}`,
    `Order ID              : ${data.razorpayOrderId}`,
    "",
    `Dear ${displayName},`,
    "",
    "Thank you for your generous contribution to UNIHOPE Foundation.",
    "",
    "── Donation Details ──",
    `Amount Paid  : ${amt}`,
    `Purpose      : ${data.purpose}`,
    `Issued To    : ${data.donorEmail}`,
    `Phone        : ${data.donorPhone}`,
    `Paid On      : ${data.formattedDate}`,
    `Status       : Successful`,
    "",
    `Trust Registration No.: ${REG_NO}`,
    "Registered under the Tamil Nadu Societies Registration Act.",
    "",
    "Your support helps UNIHOPE Foundation provide healthcare,",
    "education, hunger relief, and community welfare.",
    "",
    "For UNIHOPE Foundation",
    "Authorised Signatory",
    "",
    WEBSITE,
  ].join("\n");

  return { html, text };
}
