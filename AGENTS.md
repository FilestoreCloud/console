# AGENTS.md

> Universal AI Agent Instructions & Operating Guidelines for FilestoreCloud Super Admin Console.
> Stewarded under the open [AGENTS.md](https://agents.md) standard (Linux Foundation / AAIF).

---

## 1. Project Overview & Architecture

Enterprise Super Admin Web Portal for multi-tenant SaaS fleet operations, built with **React 18**, **Refine v4**, **Ant Design 5**, **TypeScript 5 (strict mode)**, and **Vite**.

### Key Architectural Boundaries

- **Fleet Operations Dashboard:** Real-time visibility into all provisioned tenants, container states, storage quotas, and dedicated AWS topology (ECS, RDS, EFS, S3, ALB).
- **In-Browser OCC Diagnostics:** Execute Nextcloud `occ` operational commands (`status`, `files:scan`, `db:add-missing-indices`, `maintenance:mode`, `app:list`, `check`) with instant terminal output and exit code tracking.
- **Live Container Logs:** Stream real-time logs from Amazon CloudWatch (`/ecs/prod-nextcloud`) for both Nextcloud Apache/PHP app containers and LiteLLM Bedrock AI Bridge sidecars.
- **Incident Circuit Breaker:** Operational incident response with automated failover and audit logging.
- **One-Click Tenant Clone ("Fork Tenant"):** Instant provisioning of isolated staging sandboxes with dedicated databases, S3 vault prefixes, and EFS access points.
- **Multi-Repo Federation:**
  - `FilestoreCloud/console` (This repo): React/Refine web frontend & UI assets.
  - `FilestoreCloud/infra`: CloudFormation IaC, DynamoDB Tenant Registry, SSM Lifecycle Operator.
  - `FilestoreCloud/runtime`: Golden Docker image & AI sidecar proxy.

### Directory Layout

```
.
├── src/
│   ├── components/     # Reusable layout and navigation components (Header, etc.)
│   ├── pages/          # Admin views (tenants, audit-logs, telemetry, settings)
│   ├── providers/      # Refine dataProvider, authProvider, accessControlProvider
│   ├── App.tsx         # Root application router and Refine resource config
│   └── main.tsx        # React DOM bootstrap
├── .github/
│   └── workflows/
│       └── deploy.yml       # Production build & deploy to Amazon S3 / CloudFront
├── .devsecops/         # AWS Labs DevSecOps configurations (Ferret Scan, ESLint Security, Pre-commit)
│   └── .pre-commit-config.yaml # DevSecOps master hook suite
├── .githook/           # Git hooks (Conventional Commits, branch protection)
├── index.html          # HTML entrypoint
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript 5 strict configuration
└── vite.config.ts      # Vite build configuration
```

---

## 2. Essential Commands

### Development Server

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev
```

### Production Build & Linting

```bash
# Run automated unit & integration test suite
npm test

# Type check & production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run AWS Labs DevSecOps pre-commit checks
pre-commit run --config .devsecops/.pre-commit-config.yaml --all-files
```

---

## 3. Coding Standards & Conventions

### TypeScript & React Guidelines

- Target **React 18** + **TypeScript 5 (strict mode)**.
- Use **Refine** framework with **Ant Design 5** UI components.
- **Strict Typing:** Never introduce `any` types; define explicit interfaces for tenant records, metrics, and API payloads.
- **Bundle Hygiene:** Ensure all builds pass without compiler warnings (`npm run build`).

---

## 4. Branching Strategy & Boundaries ("Never" Rules)

1. **NEVER Commit Directly to `main`:**
   - `main` is strictly protected. The pre-commit and pre-push hooks will reject direct commits or pushes.
   - Always commit to `dev` or feature branches (`feat/...`, `fix/...`). Merging to `main` is only allowed via Pull Request from `dev`.
2. **MANDATORY Conventional Commits:**
   - Validated by `.githook/commit-msg`.
   - Allowed prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`.
3. **NEVER Hardcode Secrets or Credentials:**
   - Validated by AWS Labs Ferret Scan and pre-commit checks.
   - Use environment variables (`VITE_API_ENDPOINT`, etc.).

---

## 5. Definition of Done (Verification Checklist)

Before concluding any implementation or opening a PR:

1. [ ] **Pre-commit:** `pre-commit run --config .devsecops/.pre-commit-config.yaml --all-files` passes cleanly with zero errors.
2. [ ] **Tests:** `npm test` passes cleanly with 100% test success.
3. [ ] **Build:** `npm run build` succeeds without compiler errors.
4. [ ] **Git:** Staged changes committed to `dev` with Conventional Commit message.
