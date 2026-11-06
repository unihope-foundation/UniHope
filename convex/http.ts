import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { OFFICIAL_SIGNATURE_BASE64, base64ToUint8Array } from "./pdfReceipt";

const http = httpRouter();

/**
 * Public HTTP endpoint to serve the official cropped founder signature
 * to email clients (Gmail, Outlook, Apple Mail) over reliable public HTTPS.
 */
http.route({
  path: "/assets/signature.png",
  method: "GET",
  handler: httpAction(async () => {
    const bytes = base64ToUint8Array(OFFICIAL_SIGNATURE_BASE64);
    return new Response(bytes.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;
