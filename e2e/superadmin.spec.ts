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
    const mfaInput = page.getByPlaceholder("000000").or(page.locator('input[placeholder="000000"], input#mfa_code')).first();
    try {
      await mfaInput.waitFor({ state: "visible", timeout: 8000 });
      const code = generateTotp();
      await mfaInput.fill(code);
      const verifyBtn = page.getByRole("button", { name: /Verify/i }).or(page.locator('button:has-text("Verify")')).first();
      await verifyBtn.click();
    } catch {}

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

  test("Should provision a new tenant from UI and verify it appears in Fleet table", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator('input#email, input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input#password, input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();

    const mfaInput = page.getByPlaceholder("000000").or(page.locator('input[placeholder="000000"], input#mfa_code')).first();
    try {
      await mfaInput.waitFor({ state: "visible", timeout: 8000 });
      await mfaInput.fill(generateTotp());
      await page.getByRole("button", { name: /Verify/i }).click();
    } catch {}

    await expect(page).toHaveURL(/\/(tenants|dashboard)/, { timeout: 30000 });

    // Open Modal
    const provisionBtn = page.getByRole("button", { name: /Provision Dedicated Tenant/i }).or(page.locator('button:has-text("Provision")')).first();
    await provisionBtn.click();

    // Verify modal elements
    const modal = page.locator(".ant-modal");
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    // Fill form
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTenantId = `console-test-${randomSuffix}`;

    const tenantIdInput = modal.locator('input#tenant_id, input[placeholder*="acme-corp"]').first();
    await tenantIdInput.fill(newTenantId);

    const emailInput = modal.locator('input#admin_email, input[placeholder*="admin@"]').first();
    await emailInput.fill(`admin@${newTenantId}.com`);

    // Submit modal
    const submitBtn = modal.locator('button:has-text("Launch Tenant Instance")').first();
    await submitBtn.click();

    // Verify modal closes
    await expect(modal).not.toBeVisible({ timeout: 15000 });

    // Search for newly created tenant
    const searchInput = page.getByPlaceholder(/Search by Tenant ID/i).or(page.locator('input[placeholder*="Search"]')).first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill(newTenantId);
    }

    // Verify tenant row appears in the table!
    const newTenantRow = page.locator(`text="${newTenantId}"`);
    await expect(newTenantRow.first()).toBeVisible({ timeout: 15000 });
  });
});

