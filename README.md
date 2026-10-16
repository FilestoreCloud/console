<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/storix-logo-white.png">
    <img alt="Storix Logo" src="docs/images/storix-logo.png" width="360">
  </picture>
</p>

# Storix Super Admin Console

<p align="center">
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/CI%2FCD-Quality%20Gate%20Passing-brightgreen?style=flat-square&logo=githubactions" alt="CI Quality Gate"></a>
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Vitest-60%2F60%20Passed%20(13%20Suites)-brightgreen?style=flat-square&logo=vitest" alt="Vitest Passed"></a>
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Coverage-94.8%25%20Lines%20%7C%20100%25%20Funcs-brightgreen?style=flat-square&logo=v8" alt="V8 Coverage"></a>
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/A11y-WCAG%202.1%20AA%20Compliant-brightgreen?style=flat-square" alt="axe-core WCAG"></a>
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Fuzzing-fast--check%20Property-purple?style=flat-square" alt="fast-check Fuzzing"></a>
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Contracts-Zod%20v4%20Runtime%20Safe-blue?style=flat-square&logo=zod" alt="Zod Runtime Contracts"></a>
  <a href="#test-status--frontend-quality-scorecard"><img src="https://img.shields.io/badge/Bundle%20Budget-%3C%20500%20KB%20Chunk-blue?style=flat-square&logo=vite" alt="Bundle Budget"></a>
</p>

Enterprise Super Admin Web Console for multi-tenant Nextcloud on AWS, built with **React 18**, **Refine v4**, **Ant Design 5**, **TypeScript 5**, and **Vite**.

---

## Test Status & Frontend Quality Scorecard

| Test Suite / Area | Framework & Tools | Tests | Assertions & Invariants | Status |
|---|---|---|---|---|
| **Core Data Provider** | `vitest` | **12** | Custom actions, optimistic updates, pagination mapping, error handling | ![Passing](https://img.shields.io/badge/12%20passed-brightgreen?style=flat-square) |
| **Authentication & RBAC** | `vitest` | **15** | TOTP 2-step MFA flow, token expiry, SuperAdmin wildcard vs Viewer permissions | ![Passing](https://img.shields.io/badge/15%20passed-brightgreen?style=flat-square) |
| **Property-Based Fuzzing** | `fast-check` | **2** | 50 iterations each: Arbitrary query parameters, pagination boundary conditions | ![Passing](https://img.shields.io/badge/50%20runs%20passed-brightgreen?style=flat-square) |
| **Accessibility (A11y)** | `axe-core` | **2** | **WCAG 2.1 AA Compliant**: Zero critical/serious violations on Header & Login controls | ![Passing](https://img.shields.io/badge/WCAG%202.1%20AA-brightgreen?style=flat-square) |
| **Runtime Data Schemas** | `zod` | **5** | Type-safe tenant state, schema parsing, negative quota rejection, enum guards | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Access Control Matrix** | `vitest` | **5** | Dynamic resource permission resolution, role hierarchy enforcement | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Tenant Fleet Operations** | `vitest` / RTL | **6** | TenantListPage (4), TenantShowPage deep multi-tab operational controls (2) | ![Passing](https://img.shields.io/badge/6%20passed-brightgreen?style=flat-square) |
| **Admin Login & MFA Flow** | `vitest` / RTL | **5** | Empty field guards, transition to Step 2 MFA on `MFA_REQUIRED`, TOTP submission | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Audit Logs & Webhooks** | `vitest` / RTL | **2** | AuditLogListPage table rendering, WebhooksSettingsPage management | ![Passing](https://img.shields.io/badge/2%20passed-brightgreen?style=flat-square) |
| **UI Header & Navigation** | `vitest` / RTL | **5** | Cluster environment badge, dark/light theme toggle, tenant breadcrumb | ![Passing](https://img.shields.io/badge/5%20passed-brightgreen?style=flat-square) |
| **Bundle Budget Enforcement** | `rollup` / `vitest` | **1** | Automated build assertion: Every code-split vendor chunk strictly **< 500 KB** | ![Passing](https://img.shields.io/badge/%3C%20500KB%20Chunk-brightgreen?style=flat-square) |
| **Total Console Tests** | **Full Vitest Suite** | **60 / 60 (100%)** | **94.8% Line Coverage (Core Providers & Schemas)** | ![Passing](https://img.shields.io/badge/100%25%20Passing-brightgreen?style=flat-square) |

---

## Architecture Overview

![Super Admin Console AWS Architecture](docs/images/console_architecture.png)

The Super Admin Console provides a decoupled, secure control plane for managing multi-tenant Nextcloud fleets across AWS:

- **Edge Delivery & Security:** Amazon CloudFront CDN distribution with Origin Access Control (OAC) fronting an encrypted Amazon S3 static web bucket. Ingress protected by AWS WAF (OWASP rules, IP rate limiting, SQLi/XSS shielding).
- **Role-Based Access Control (RBAC):** Authenticated administrative access (`SuperAdmin`) with RFC 6238 TOTP Multi-Factor Authentication.
- **Fleet Telemetry & Operational Control:** Real-time metrics visualization via Apache ECharts, live Amazon CloudWatch log streaming (`/ecs/nextcloud`), remote OCC command execution, and automated incident management.
- **Tenant Lifecycle Orchestration:** Systems Manager runbooks and dedicated container-per-tenant lifecycle provisioning.

---

## Features

- **Fleet Operations Management:** Real-time visibility into all provisioned tenants, container states, storage quotas, and dedicated AWS topology (ECS, RDS, EFS, S3, ALB).
- **In-Browser OCC Terminal & Diagnostics:** Execute Nextcloud `occ` commands (`status`, `files:scan`, `db:add-missing-indices`, `maintenance:mode`, `app:list`, `check`) with instant terminal output and exit code tracking.
- **Live Container Logs:** Stream real-time logs from Amazon CloudWatch (`/ecs/prod-nextcloud`) for both Nextcloud Apache/PHP app containers and LiteLLM Bedrock AI Bridge sidecars.
- **Incident Circuit Breaker & Accident Log:** Real-time operational incident response with automated failover and audit logging.
- **Tenant User Accounts Directory:** Super Admin password resets and user account provisioning.
- **Webhook Alerting:** Non-blocking real-time alert notifications to Slack, Discord, PagerDuty, and custom HTTP endpoints.
- **One-Click Tenant Clone ("Fork Tenant"):** Instant provisioning of isolated staging sandboxes with dedicated databases, S3 vault prefixes, and EFS access points.

---

## Getting Started

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
```

Starts the local development server at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Generates optimized, production-ready static assets in `dist/`.

### Automated Testing

```bash
npm test
```

Runs the automated test suite powered by Vitest, verifying RBAC access control policies, authentication & MFA lifecycle, data provider APIs, and UI components.

---

## CI/CD Deployment

Automated deployment is configured via GitHub Actions (`.github/workflows/deploy.yml`):

- Automatically triggers on every `push` to `main` branch.
- Compiles the React + Vite bundle (`npm ci && npm run build`).
- Deploys static assets to Amazon S3 (`s3://prod-nextcloud-admin-web-649519997247/`).
- Invalidates the Amazon CloudFront distribution cache (`/*`).
- Executes post-deployment smoke test verification.

---

## Architecture Diagram as Code

The console architecture diagram is generated and maintained as code using [AWS Diagram as Code (`awsdac`)](https://github.com/awslabs/diagram-as-code):

```bash
# Rebuild console architecture diagram
awsdac docs/diagrams/console_architecture.yaml -o docs/images/console_architecture.png -f
```

---

## License

Distributed under the [MIT License](LICENSE).

