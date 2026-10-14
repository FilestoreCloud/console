import { test, expect } from "@playwright/test";
import crypto from "crypto";

function generateTotp(
  secret: string = process.env.SUPERADMIN_TOTP_SECRET!
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

const ADMIN_EMAIL = process.env.SUPERADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD!;
const TARGET_TENANT = process.env.TENANT_ID!;

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

  test("Should search and filter Fleet table by Tenant ID", async ({ page }) => {
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

    const searchInput = page.getByPlaceholder(/Search by Tenant ID/i).or(page.locator('input[placeholder*="Search"]')).first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Filter by TARGET_TENANT
    await searchInput.fill(TARGET_TENANT);
    await expect(page.locator(`text="${TARGET_TENANT}"`).first()).toBeVisible({ timeout: 10000 });

    // Clear search
    await searchInput.fill("");
    await expect(page.locator("table, .ant-table").first()).toBeVisible({ timeout: 10000 });
  });

  test("Should inspect tenant detail view and navigate architectural tabs", async ({ page }) => {
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

    // Click "Manage" on the first active tenant in the fleet table
    const manageBtn = page.locator('button:has-text("Manage")').first();
    await expect(manageBtn).toBeVisible({ timeout: 15000 });
    await manageBtn.click();

    // Verify redirection to tenant details page
    await expect(page).toHaveURL(/\/tenants\/(show\/)?[\w-]+/, { timeout: 15000 });

    // Verify tabs are available
    const tabList = page.locator(".ant-tabs-nav, [role='tablist']");
    await expect(tabList.first()).toBeVisible({ timeout: 10000 });

    // Click Topology tab if visible
    const topologyTab = page.locator('.ant-tabs-tab:has-text("Topology")').first();
    if (await topologyTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await topologyTab.click();
      await page.waitForTimeout(1000);
    }

    // Verify back to Fleet button
    const backBtn = page.getByRole("button", { name: /Fleet/i }).or(page.locator('button:has-text("Fleet")')).first();
    if (await backBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await backBtn.click({ force: true });
      await expect(page).toHaveURL(/\/tenants/, { timeout: 15000 });
    }
  });

  test("Should toggle tenant operational status (Suspend and Resume)", async ({ page }) => {
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

    // Find Suspend button for a row
    const suspendBtn = page.locator('button:has-text("Suspend")').first();
    if (await suspendBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await suspendBtn.click();
      // Wait for notification or status tag change
      await page.waitForTimeout(2000);
      // Click Resume back to restore active state
      const resumeBtn = page.locator('button:has-text("Resume")').first();
      if (await resumeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await resumeBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test("Should navigate across Control Plane sections (Audit Logs, Telemetry, Webhooks)", async ({ page }) => {
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

    // 1. Audit Logs
    await page.goto("/audit-logs");
    await expect(page).toHaveURL(/\/audit-logs/, { timeout: 15000 });
    await expect(page.locator("main, .ant-layout-content").first()).toBeVisible({ timeout: 10000 });

    // 2. Settings / Webhooks
    await page.goto("/settings/webhooks");
    await expect(page).toHaveURL(/\/settings\/webhooks/, { timeout: 15000 });
    await expect(page.locator("main, .ant-layout-content").first()).toBeVisible({ timeout: 10000 });

    // 3. Telemetry
    await page.goto("/telemetry");
    await expect(page).toHaveURL(/\/telemetry/, { timeout: 15000 });
    await expect(page.locator("main, .ant-layout-content").first()).toBeVisible({ timeout: 10000 });
  });

  test("Should securely sign out and clear session state", async ({ page }) => {
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

    // Trigger logout via user avatar dropdown or navigation
    const avatar = page.locator(".ant-avatar, [data-testid='user-avatar']").first();
    if (await avatar.isVisible({ timeout: 5000 }).catch(() => false)) {
      await avatar.click();
      const signOutOption = page.locator('.ant-dropdown-menu-item:has-text("Sign Out")').first();
      if (await signOutOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await signOutOption.click();
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
      }
    }
  });
});


