<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/storix-logo-white.png">
    <img alt="Storix Logo" src="docs/images/storix-logo.png" width="360">
  </picture>
</p>

# Storix Super Admin Console

<p align="center">
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/CI%2FCD-Quality%20Gate%20Passing-brightgreen?style=flat-square&logo=githubactions" alt="CI Quality Gate"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Vitest-68%2F68%20Passed%20(15%20Suites)-brightgreen?style=flat-square&logo=vitest" alt="Vitest Passed"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Coverage-94.8%25%20Lines%20%7C%20100%25%20Funcs-brightgreen?style=flat-square&logo=v8" alt="V8 Coverage"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Passkeys-WebAuthn%20%2B%20FIDO2-blue?style=flat-square&logo=fido" alt="WebAuthn Passkeys"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Responsive-Mobile%20%2B%20Tablet%20Ready-brightgreen?style=flat-square" alt="Responsive Design"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Smart%20Polling-Page%20Visibility%20API-blue?style=flat-square" alt="Smart Polling"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Async%20OCC-Streaming%20Terminal-purple?style=flat-square" alt="Async OCC"></a>
  <a href="#-test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Bundle%20Budget-%3C%20500%20KB%20Chunk-blue?style=flat-square&logo=vite" alt="Bundle Budget"></a>
</p>

<p align="center">
  <a href="#-architecture-overview"><strong>Architecture</strong></a> ·
  <a href="#-key-features"><strong>Key Features</strong></a> ·
  <a href="#-responsive-design--mobile-experience"><strong>Responsive Design</strong></a> ·
  <a href="#-test-status--frontend-quality-scorecard"><strong>Quality Scorecard</strong></a> ·
  <a href="#-getting-started"><strong>Quickstart</strong></a> ·
  <a href="https://github.com/FilestoreCloud/docs"><strong>Documentation</strong></a>
</p>

---

Enterprise Super Admin Web Console for multi-tenant Nextcloud on AWS, built with **React 18**, **Refine v4**, **Ant Design 5**, **TypeScript 5**, and **Vite**.

---

## 📊 Test Status & Frontend Quality Scorecard

| Test Suite / Area | Framework & Tools | Tests | Assertions & Invariants | Status |
|---|---|---|---|---|
| **Core Data Provider** | `vitest` | **12** | Custom actions, optimistic updates, pagination mapping, error handling | ![Passing](https://img.shields.io/badge/12%20passed-brightgreen?style=flat-square) |
| **Authentication & RBAC** | `vitest` | **15** | TOTP 2-step MFA flow, token expiry, SuperAdmin wildcard vs Viewer permissions, HttpOnly session | ![Passing](https://img.shields.io/badge/15%20passed-brightgreen?style=flat-square) |
| **Smart Polling & Page Visibility** | `vitest` | **4** | `usePageVisibility`, `useSmartInterval` tab hide auto-pause, 2-minute user inactivity backoff | ![Passing](https://img.shields.io/badge/4%20passed-brightgreen?style=flat-square) |
| **Property-Based Fuzzing** | `fast-check` | **2** | 50 iterations each: Arbitrary query parameters, pagination boundary conditions | ![Passing](https://img.shields.io/badge/50%20runs%20passed-brightgreen?style=flat-square) |
| **Accessibility (A11y)** | `axe-core` | **2** | **WCAG 2.1 AA Compliant**: Zero critical/serious violations on Header & Login controls | ![Passing](https://img.shields.io/badge/WCAG%202.1%20AA-brightgreen?style=flat-square) |
| **Responsive Layout & CSS Audit** | `vitest` / RTL | **3** | Mobile drawer toggle button accessibility, table touch scrolling container, responsive breakpoints | ![Passing](https://img.shields.io/badge/3%20passed-brightgreen?style=flat-square) |
| **Runtime Data Schemas** | `zod` | **5** | Type-safe tenant state, schema parsing, negative quota rejection, enum guards | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Access Control Matrix** | `vitest` | **5** | Dynamic resource permission resolution, role hierarchy enforcement | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Tenant Fleet Operations** | `vitest` / RTL | **6** | TenantListPage (4), TenantShowPage deep multi-tab operational controls (2) | ![Passing](https://img.shields.io/badge/6%20passed-brightgreen?style=flat-square) |
| **Admin Login & Passkey Flow** | `vitest` / RTL | **5** | Empty field guards, transition to Step 2 MFA on `MFA_REQUIRED`, WebAuthn Passkeys button | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Audit Logs & Webhooks** | `vitest` / RTL | **2** | AuditLogListPage table rendering, WebhooksSettingsPage management | ![Passing](https://img.shields.io/badge/2%20passed-brightgreen?style=flat-square) |
| **UI Header & Navigation** | `vitest` / RTL | **6** | Cluster environment badge, dark/light theme toggle, tenant breadcrumb, mobile sider toggle | ![Passing](https://img.shields.io/badge/6%20passed-brightgreen?style=flat-square) |
| **Bundle Budget Enforcement** | `rollup` / `vitest` | **1** | Automated build assertion: Every code-split vendor chunk strictly **< 500 KB** | ![Passing](https://img.shields.io/badge/%3C%20500KB%20Chunk-brightgreen?style=flat-square) |
| **Total Console Tests** | **Full Vitest Suite** | **68 / 68 (100%)** | **94.8% Line Coverage (Core Providers & Schemas) · 15 Test Suites** | ![Passing](https://img.shields.io/badge/100%25%20Passing-brightgreen?style=flat-square) |

---

## 🏗️ Architecture Overview

![Super Admin Console AWS Architecture](docs/images/console_architecture.png)

The Super Admin Console provides a decoupled, secure control plane for managing multi-tenant Nextcloud fleets across AWS:

- **Edge Delivery & Security:** Amazon CloudFront CDN distribution with Origin Access Control (OAC) fronting an encrypted Amazon S3 static web bucket. Ingress protected by AWS WAF (OWASP rules, IP rate limiting, SQLi/XSS shielding).
- **Authentication & Biometrics:** Authenticated administrative access with WebAuthn / Passkeys (Touch ID, Face ID, FIDO2) and RFC 6238 TOTP Multi-Factor Authentication.
- **Smart Polling & Inactivity Backoff:** Custom hooks `usePageVisibility` and `useSmartInterval` automatically pause polling when the tab is hidden and throttle polling frequency when the user is inactive for > 2 minutes.
- **Async OCC Command Job Engine:** Execute heavy administrative OCC operations (`files:scan`, `db:add-missing-indices`) asynchronously without API Gateway timeout constraints.
- **Fleet Telemetry & Operational Control:** Real-time metrics visualization via Apache ECharts, live Amazon CloudWatch log streaming (`/ecs/nextcloud`), and automated incident management.
- **Tenant Lifecycle Orchestration:** Step Functions SAGAs and dedicated container-per-tenant lifecycle provisioning.

---

## 📱 Responsive Design & Mobile Experience

The console features a comprehensive mobile and tablet responsive layout system (`src/responsive.css`):

1. **Collapsible Mobile Sider Drawer:**
   - Under `992px` viewport width, the fixed desktop sidebar transforms into an accessible slide-over Drawer toggled via the Header menu button.
2. **Horizontal Touch Scrolling on Data Tables:**
   - All high-density fleet tables (`TenantTable`, `AuditLog`, `Telemetry`, `FinOps`) are wrapped with `-webkit-overflow-scrolling: touch` and fixed column widths, preventing outer viewport overflow.
3. **Responsive Cards & Metric Displays:**
   - Card headers automatically wrap (`flex-wrap: wrap`) on screens `< 768px`, ensuring action buttons, filters, and refresh toggles remain accessible without truncation.
4. **Adaptive Modal Sizing:**
   - Modals (`TenantForkModal`, `CreateModal`, `CloneModal`, `IncidentModal`) dynamically adapt to `95vw` on mobile screens with responsive action buttons.

---

## 🌟 Key Features

- **Fleet Operations Management:** Real-time visibility into all provisioned tenants, container states, storage quotas, and dedicated AWS topology (ECS, RDS, EFS, S3, ALB).
- **In-Browser Async OCC Terminal:** Execute Nextcloud `occ` commands (`status`, `files:scan`, `db:add-missing-indices`, `maintenance:mode`, `app:list`, `check`) asynchronously with streaming web terminal.
- **Live Container Logs:** Stream real-time logs from Amazon CloudWatch (`/ecs/nextcloud`) for both Nextcloud Apache/PHP app containers and LiteLLM Bedrock AI Bridge sidecars.
- **FinOps Cost Attribution:** Visualize per-tenant vCPU-hours, RAM allocation, EFS storage, and S3 Intelligent-Tiering consumption with soft-cap and hard-cap controls.
- **Passkey Biometrics & MFA:** Biometric authentication via WebAuthn alongside time-based one-time password (TOTP) MFA.
- **Webhook Alerting:** Non-blocking real-time alert notifications to Slack, Discord, PagerDuty, and custom HTTP endpoints.
- **One-Click Tenant Clone ("Fork Tenant"):** Instant provisioning of isolated staging sandboxes with dedicated databases, S3 vault prefixes, and EFS access points.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
# Starts local development server at http://localhost:5173
```

### Production Build

```bash
npm run build
# Runs type checking (tsc --noEmit) and generates optimized production assets in dist/
```

### Automated Testing

```bash
npm test
# Runs 68/68 Vitest tests across 15 suites with code coverage and a11y verification
```

---

## 📜 Architecture Diagrams as Code

```bash
# Rebuild Super Admin Console architecture diagram
awsdac docs/diagrams/console_architecture.yaml -o docs/images/console_architecture.png -f
```

---

## 📂 Related Repositories

- [**`FilestoreCloud/infra`**](https://github.com/FilestoreCloud/infra): Modular CloudFormation IaC, Step Functions SAGAs & Lambda Control Plane.
- [**`FilestoreCloud/runtime`**](https://github.com/FilestoreCloud/runtime): Docker Golden Image, Bedrock AI Sidecar & AWS SOCI indexing.
- [**`FilestoreCloud/docs`**](https://github.com/FilestoreCloud/docs): Platform documentation site.

---

## License

Licensed under the [MIT License](LICENSE).
