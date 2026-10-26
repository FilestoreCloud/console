## 📌 Description / Context
<!-- Provide a clear summary of changes made to the Storix SuperAdmin Web Console. -->


## 🔗 Related Issues / Tickets
- Fixes #

---

## 📋 Type of Change
- [ ] 🐛 **Bug Fix** (Non-breaking fix resolving a UI/UX, routing, or state issue)
- [ ] ✨ **New Feature** (New dashboard widget, tenant management action, modal, or page)
- [ ] 🎨 **UI / Styling** (Tailwind CSS, dark/light theme, typography, responsive design)
- [ ] ⚡ **Performance** (Bundle splitting, lazy loading, re-render reduction, asset caching)
- [ ] ♿ **Accessibility (a11y)** (Screen reader support, ARIA tags, keyboard navigation)
- [ ] 🧪 **Tests** (Vitest unit tests, Playwright E2E specs, mock data)
- [ ] 🔧 **Tooling / Refactoring** (Vite config, TypeScript types, Refine provider cleanup)

---

## 💻 Area of the Application Affected
- [ ] `src/pages/` (Login, Tenants, TenantDetail, AuditLogs, Metrics, Settings)
- [ ] `src/components/` (Modals, Charts, CommandPalette, StatCards, Layout)
- [ ] `src/providers/` (dataProvider, authProvider, notificationProvider)
- [ ] `src/types/` (TypeScript schema definitions & interfaces)
- [ ] `src/mock/` (Mock server, seed data, devMockPlugin)
- [ ] `e2e/` (Playwright end-to-end test suites)

---

## 📸 Screenshots / Video Walkthrough (if UI changed)
| Before | After |
| :---: | :---: |
| *(Image/GIF)* | *(Image/GIF)* |

---

## 🧪 Testing & Verification
- [ ] **Type Check**: `npm run type-check` (`tsc --noEmit`) completed with zero errors
- [ ] **Unit Tests**: `npm test` (`vitest run`) passed 100%
- [ ] **Coverage Gate**: `npm run test:coverage` meets the > 85% coverage threshold
- [ ] **Bundle Budget**: `npm run build` completed within chunk budgets (< 500 KB per chunk)
- [ ] **Playwright E2E**: `npx playwright test` executed against local/preview server
- [ ] **Cross-Browser & Responsive**: Verified on Chrome, Firefox, Safari and mobile viewport

---

## 🛡️ DevSecOps & Security Checklist
- [ ] No hardcoded passwords, tokens, or live production URLs
- [ ] User input properly sanitized with Zod validation schemas
- [ ] MFA / TOTP authentication flows properly tested
- [ ] Commits follow Conventional Commits standard
