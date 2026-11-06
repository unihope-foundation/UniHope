const fs = require('fs');
const path = require('path');
const https = require('https');

async function main() {
  console.log('--- Step 1 & 2: Loading Base64 constants from convex/pdfReceipt.ts ---');
  const pdfReceiptCode = fs.readFileSync(path.join(__dirname, '../convex/pdfReceipt.ts'), 'utf8');

  // Extract Base64 strings
  const logoMatch = pdfReceiptCode.match(/export const OFFICIAL_LOGO_BASE64\s*=\s*["']([^"']+)["']/);
  const sigMatch = pdfReceiptCode.match(/export const OFFICIAL_SIGNATURE_BASE64\s*=\s*["']([^"']+)["']/);

  if (!logoMatch || !sigMatch) {
    throw new Error(`Failed to extract Base64 assets! logoMatch=${!!logoMatch}, sigMatch=${!!sigMatch}`);
  }

  const logoBase64 = logoMatch[1];
  const sigBase64 = sigMatch[1];

  console.log(`Logo Base64 string length: ${logoBase64.length} chars`);
  console.log(`Signature Base64 string length: ${sigBase64.length} chars`);

  const logoBuffer = Buffer.from(logoBase64, 'base64');
  const sigBuffer = Buffer.from(sigBase64, 'base64');

  console.log(`Decoded Logo Buffer: ${logoBuffer.length} bytes`);
  console.log(`Decoded Signature Buffer: ${sigBuffer.length} bytes`);

  // Write decoded PNGs
  const decodedLogoPath = path.join(__dirname, 'decoded_official_logo.png');
  const decodedSigPath = path.join(__dirname, 'decoded_official_signature.png');
  fs.writeFileSync(decodedLogoPath, logoBuffer);
  fs.writeFileSync(decodedSigPath, sigBuffer);
  console.log(`Saved: ${decodedLogoPath}`);
  console.log(`Saved: ${decodedSigPath}`);

  // Step 3 & 4: Inspect PNG Headers (IHDR)
  function parsePngHeader(buf, label) {
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
                  buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A;
    if (!isPng) {
      console.error(`❌ ${label} is NOT a valid PNG! Header: ${buf.slice(0, 8).toString('hex')}`);
      return null;
    }
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const bitDepth = buf[24];
    const colorType = buf[25]; // 0=grayscale, 2=RGB, 3=palette, 4=grayscale+alpha, 6=RGBA
    const colorDesc = { 0: 'Grayscale', 2: 'RGB', 3: 'Palette', 4: 'Grayscale+Alpha', 6: 'RGBA (Alpha Channel)' }[colorType] || `Type ${colorType}`;
    console.log(`✔ ${label} Valid PNG: ${width}x${height} px, Bit Depth: ${bitDepth}, Color: ${colorDesc}`);
    return { width, height, bitDepth, colorType, isPng };
  }

  const logoInfo = parsePngHeader(logoBuffer, 'Official Logo');
  const sigInfo = parsePngHeader(sigBuffer, 'Official Signature');

  // Step 5: Compare against approved reference files on disk
  console.log('\n--- Step 5: Comparing against approved local reference assets ---');
  const refLogoCandidates = ['logo_512.png', 'prod_logo.png'];
  for (const f of refLogoCandidates) {
    const fPath = path.join(__dirname, f);
    if (fs.existsSync(fPath)) {
      const refBuf = fs.readFileSync(fPath);
      const exactMatch = logoBuffer.equals(refBuf);
      console.log(`Comparison against scratch/${f}: ${refBuf.length} bytes, Exact byte match: ${exactMatch}`);
    }
  }

  const refSigCandidates = ['prod_signature.png', 'cropped_signature.png'];
  for (const f of refSigCandidates) {
    const fPath = path.join(__dirname, f);
    if (fs.existsSync(fPath)) {
      const refBuf = fs.readFileSync(fPath);
      const exactMatch = sigBuffer.equals(refBuf);
      console.log(`Comparison against scratch/${f}: ${refBuf.length} bytes, Exact byte match: ${exactMatch}`);
    }
  }

  // Step 6: Test live GET /assets/signature.png on Production
  console.log('\n--- Step 6: Testing GET /assets/signature.png on Production ---');
  await new Promise((resolve) => {
    https.get('https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png', (res) => {
      console.log(`Live HTTP Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Cache-Control: ${res.headers['cache-control']}`);
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const liveSigBuf = Buffer.concat(chunks);
        console.log(`Live Signature downloaded: ${liveSigBuf.length} bytes`);
        const matchesLocal = liveSigBuf.equals(sigBuffer);
        console.log(`Live Signature exactly matches OFFICIAL_SIGNATURE_BASE64: ${matchesLocal}`);
        fs.writeFileSync(path.join(__dirname, 'live_downloaded_signature.png'), liveSigBuf);
        resolve();
      });
    }).on('error', (err) => {
      console.error('Failed to fetch live signature:', err.message);
      resolve();
    });
  });

  // Step 7: Generate real PDF using current local production code
  console.log('\n--- Step 7: Generating sample PDF with current local production code ---');
  const { buildDonationReceiptPdf } = await import('../convex/pdfReceipt.ts');

  // Test with NO external logo/sig bytes passed in (exercising the inlined fallback)
  const sampleDataInlined = {
    donorName: 'Dr. Rajesh Sundaram',
    donorEmail: 'rajesh.sundaram@example.com',
    donorPhone: '+91 98765 43210',
    anonymous: false,
    amount: 1000,
    purpose: 'Healthcare Support',
    razorpayPaymentId: 'pay_TEST123456789',
    razorpayOrderId: 'order_TEST987654321',
    formattedDate: '06 Nov 2026, 10:30 AM',
    formattedAmount: '₹1,000',
    receiptNumber: 'UH-2026-000001',
    status: 'PAID',
    // Deliberately omit logoBytes and signatureBytes to verify Base64 inlining!
    orgDetails: {
      name: 'UNIHOPE Foundation',
      trustRegistrationNo: 'R/Chennai North Joint I/Book-4/228/2026',
      pan: 'AABTU1234F',
      registeredAddress: '2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026',
      email: 'unihopefoundation.official@gmail.com',
      website: 'unihopefoundation.org',
    },
    taxDetails: {
      approvalSection: 'Section 80G Approval',
      provisionalUrn: 'AAACU1234CF20261',
      approvalDate: '15 April 2026',
      validFrom: 'AY 2026-27',
      validUntil: 'AY 2029-30',
      statutoryWording: 'Donations to UNIHOPE Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.',
      disclaimer: 'This is a computer-generated official receipt issued by UNIHOPE Foundation. Valid without a physical seal.',
    },
  };

  const generatedPdfBytes = await buildDonationReceiptPdf(sampleDataInlined);
  const outPdfPath = path.join(__dirname, 'actual_code_generated_receipt.pdf');
  fs.writeFileSync(outPdfPath, generatedPdfBytes);
  console.log(`✔ Generated sample PDF: ${outPdfPath} (${generatedPdfBytes.length} bytes)`);

  // Step 8: Verify Email Template references
  console.log('\n--- Step 8: Verifying Email Template references ---');
  const { buildDonationReceiptEmail } = await import('../convex/emailTemplates.ts');
  const emailResult = buildDonationReceiptEmail({
    ...sampleDataInlined,
    signatureUrl: 'https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png'
  });
  console.log('Email contains HTTPS signature URL:', emailResult.html.includes('https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png'));
  console.log('Email contains cid: references (should be false):', emailResult.html.includes('cid:'));

  console.log('\n=== SUMMARY OF ASSET INTEGRITY ===');
  console.log(`Logo: ${logoInfo?.width}x${logoInfo?.height} px, Size: ${logoBuffer.length} bytes`);
  console.log(`Signature: ${sigInfo?.width}x${sigInfo?.height} px, Size: ${sigBuffer.length} bytes`);
}

main().catch(console.error);

