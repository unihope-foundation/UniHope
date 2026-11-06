const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../convex/donations.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = `    // Retrieve Founder Handwritten Signature PNG from Convex Storage if configured
    let signatureBytes: Uint8Array | null = null;
    const rawStorageId = process.env.FOUNDER_SIGNATURE_STORAGE_ID;
    if (rawStorageId) {
      try {
        const storageId = rawStorageId as Id<"_storage">;
        const fileBlob = await ctx.storage.get(storageId);
        if (fileBlob) {
          const ab = await fileBlob.arrayBuffer();
          signatureBytes = new Uint8Array(ab);
        } else {
          console.warn("Storage blob not found for FOUNDER_SIGNATURE_STORAGE_ID:", rawStorageId);
        }
      } catch (storageErr) {
        console.warn("Error retrieving founder signature from Convex storage:", storageErr);
      }
    } else {
      console.warn("FOUNDER_SIGNATURE_STORAGE_ID is not configured in Convex environment variables.");
    }`;

const replacement = `    // Retrieve Official Organization Logo PNG from Convex Storage if configured
    let logoBytes: Uint8Array | null = null;
    const rawLogoStorageId = process.env.ORG_LOGO_STORAGE_ID;
    if (rawLogoStorageId) {
      try {
        const logoStorageId = rawLogoStorageId as Id<"_storage">;
        const logoBlob = await ctx.storage.get(logoStorageId);
        if (logoBlob) {
          const ab = await logoBlob.arrayBuffer();
          logoBytes = new Uint8Array(ab);
        } else {
          console.warn("Storage blob not found for ORG_LOGO_STORAGE_ID:", rawLogoStorageId);
        }
      } catch (logoErr) {
        console.warn("Error retrieving logo from Convex storage:", logoErr);
      }
    }

    // Retrieve Founder Handwritten Signature PNG from Convex Storage if configured
    let signatureBytes: Uint8Array | null = null;
    const rawStorageId = process.env.FOUNDER_SIGNATURE_STORAGE_ID;
    if (rawStorageId) {
      try {
        const storageId = rawStorageId as Id<"_storage">;
        const fileBlob = await ctx.storage.get(storageId);
        if (fileBlob) {
          const ab = await fileBlob.arrayBuffer();
          signatureBytes = new Uint8Array(ab);
        } else {
          console.warn("Storage blob not found for FOUNDER_SIGNATURE_STORAGE_ID:", rawStorageId);
        }
      } catch (storageErr) {
        console.warn("Error retrieving founder signature from Convex storage:", storageErr);
      }
    } else {
      console.warn("FOUNDER_SIGNATURE_STORAGE_ID is not configured in Convex environment variables.");
    }`;

const buildCallTarget = `      const pdfBytes = await buildDonationReceiptPdf({
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        anonymous: donation.anonymous,
        amount: donation.amount,
        purpose: donation.purpose,
        razorpayPaymentId: donation.razorpayPaymentId,
        razorpayOrderId: donation.razorpayOrderId,
        formattedDate,
        formattedAmount,
        signatureBytes,
        orgDetails,
        taxDetails,
      });`;

const buildCallReplacement = `      const pdfBytes = await buildDonationReceiptPdf({
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        anonymous: donation.anonymous,
        amount: donation.amount,
        purpose: donation.purpose,
        razorpayPaymentId: donation.razorpayPaymentId,
        razorpayOrderId: donation.razorpayOrderId,
        formattedDate,
        formattedAmount,
        logoBytes,
        signatureBytes,
        orgDetails,
        taxDetails,
      });`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normBuildTarget = buildCallTarget.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
  console.error('Target not found in donations.ts');
  process.exit(1);
}

let updated = normContent.replace(normTarget, replacement.replace(/\r\n/g, '\n'));
updated = updated.replace(normBuildTarget, buildCallReplacement.replace(/\r\n/g, '\n'));

fs.writeFileSync(filePath, updated);
console.log('Successfully updated convex/donations.ts');

