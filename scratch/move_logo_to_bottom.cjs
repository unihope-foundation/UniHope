const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../convex/pdfReceipt.ts");
const content = fs.readFileSync(filePath, "utf8");

// Match line 2-6: /** ... */ export const OFFICIAL_LOGO_BASE64 = "...";
const regex = /\/\*\*[\s\S]*?\*\/\s*export const OFFICIAL_LOGO_BASE64 = "([^"]+)";\s*/;
const match = content.match(regex);

if (!match) {
  console.error("Pattern not found!");
  process.exit(1);
}

const logoBase64 = match[1];
console.log("Found logoBase64 with length:", logoBase64.length);

// Remove from top
let newContent = content.replace(regex, "\n");

// Append cleanly at bottom
const bottomSection = `\n// ─────────────────────────────────────────────────────────────────────────────\n// OFFICIAL ASSET DATA\n// ─────────────────────────────────────────────────────────────────────────────\n/**\n * Official UNIHOPE circular logo (512x512 high-resolution transparent PNG).\n * Built-in logo for official donation receipts.\n */\nexport const OFFICIAL_LOGO_BASE64 = "${logoBase64}";\n`;

newContent = newContent.trimEnd() + "\n" + bottomSection;

fs.writeFileSync(filePath, newContent, "utf8");
console.log("Successfully moved OFFICIAL_LOGO_BASE64 to bottom of pdfReceipt.ts");

