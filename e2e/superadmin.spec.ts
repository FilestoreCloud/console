import { test, expect } from "@playwright/test";
import crypto from "crypto";

function generateTotp(
  secret: string = process.env.SUPERADMIN_TOTP_SECRET || "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP"
): string {
  const b32alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (let i = 0; i < secret.length; i++) {
    const val = b32alphabet.indexOf(secret.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const key = Buffer.alloc(Math.floor(bits.length / 8));
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    key[i / 8] = parseInt(bits.substr(i, 8), 2);
  }
  const epoch = Math.floor(Date.now() / 1000);
  const time = Buffer.alloc(8);
  time.writeBigInt64BE(BigInt(Math.floor(epoch / 30)));
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(time);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code = ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, "0");
  return code;
}

const ADMIN_EMAIL = process.env.SUPERADMIN_USERNAME || "nhphuong.code@gmail.com";
const ADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "StorixAdmin2026!Secure";

test.describe("SuperAdmin Console Web E2E", () => {
  test("Should render SuperAdmin login page and form controls", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Filestore Cloud|Super Admin/i);

    const emailInput = page.locator('input#email, input[name="email"]');
    const passInput = page.locator('input#password, input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(passInput).toBeVisible({ timeout: 15000 });
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
  });

  test("Should authenticate SuperAdmin with MFA and enter console", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.locator('input#email, input[name="email"]');
    const passInput = page.locator('input#password, input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill(ADMIN_EMAIL);
    await passInput.fill(ADMIN_PASSWORD);
    await submitBtn.click();

    // Check for Step 2: MFA Challenge
    const mfaInput = page.locator('input#mfa_code, input[name="mfa_code"]');
    const mfaAppeared = await mfaInput
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (mfaAppeared) {
      const code = generateTotp();
      await mfaInput.fill(code);
      const verifyBtn = page.locator('button:has-text("Verify")').first();
      if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await verifyBtn.click();
      } else {
        await page.locator('button[type="submit"]').last().click();
      }
    }

    // Check for any visible UI alert error messages to surface during test
    const errorAlert = page.locator(".ant-alert-error");
    if (await errorAlert.isVisible({ timeout: 2000 }).catch(() => false)) {
      const msg = await errorAlert.textContent();
      console.error(`SuperAdmin login alert error: ${msg}`);
    }

    // Verify successful login redirection to /tenants or dashboard (SPA navigation)
    await expect(page).toHaveURL(/\/(tenants|dashboard)/, { timeout: 30000 });

    // Verify main content is loaded
    const mainContent = page.locator("table, .ant-table, main, .ant-layout-content");
    await expect(mainContent.first()).toBeVisible({ timeout: 20000 });
  });
});
