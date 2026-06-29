## Goal
Rebuild `/auth` as a luxury split-screen experience that feels native to Palm Charcoal — keeping the existing tokens, fonts, glass system, and `AuthContext` — and route users to the right dashboard based on their role.

## Scope: ship now vs. needs your input

I can ship the full UI/UX, animations, RTL/LTR, dark/light, accessibility, and role-based routing immediately on top of the current Lovable Cloud auth. A few methods need a one-time configuration step from you before they can actually authenticate users — I'll wire the UI and backend gates now and flip them on the moment the prerequisites are in place.

### ✅ Ship in this pass (no extra config)
- Split-screen layout: left cinematic brand canvas (palm/charcoal hero, gold rim glass, parallax), right glass auth card.
- Tabs: **Email + Password**, **Magic Link**, **Phone OTP** *(UI + flow; activates once SMS provider is enabled)*.
- **Google Sign-In** (managed OAuth — already supported).
- **Remember Me** (persist vs. session storage toggle).
- **Forgot Password** dialog → `/reset-password` page.
- RTL/LTR via existing i18n, dark/light via existing `ThemeToggle`, Framer Motion entrance + tab transitions, WCAG AA contrast using design tokens.
- Responsive: split on ≥lg, stacked hero header on mobile.
- Role-based post-login redirect with a sanitized `?from=` fallback.

### ⚙️ Needs your confirmation before they work end-to-end
1. **Apple Sign-In** — managed Apple auth is available; I'll enable the provider via `configure_social_auth` if you confirm. The UI button ships either way.
2. **Phone OTP** — needs SMS provider (Twilio/MessageBird) configured in Cloud → Auth. UI ships now; flow goes live as soon as it's set.
3. **2FA (TOTP)** — I'll add an "Enable 2FA" flow on `/profile/security` using Supabase MFA (`enroll` → QR → `verify`) and a challenge step on login when the user has a factor. No external secret needed.
4. **Invisible reCAPTCHA** — requires a Google reCAPTCHA v3 site key + secret key. I'll wire the client widget and pass the token to a `verify-captcha` edge function; tell me to proceed and I'll request both keys via `add_secret`.

### 🗄️ Role model migration (required for the 7 roles)
Current enum is `admin | wholesale | user`. Plan:
```sql
ALTER TYPE public.app_role ADD VALUE 'super_admin';
ALTER TYPE public.app_role ADD VALUE 'sales';
ALTER TYPE public.app_role ADD VALUE 'warehouse';
ALTER TYPE public.app_role ADD VALUE 'accountant';
ALTER TYPE public.app_role ADD VALUE 'distributor';
-- keep 'admin' and 'user'; map legacy 'wholesale' → 'distributor' via data migration
```
Then update `AuthContext` `AppRole` type and `ProtectedRoute` to know all 7.

Redirect table after sign-in (first matching role wins):
```text
super_admin / admin          → /admin
sales                        → /admin/orders
warehouse                    → /admin/inventory
accountant                   → /admin/reports
distributor                  → /portal/wholesale
customer (default 'user')    → /portal
```

## Files

```text
src/pages/Auth.tsx                 (rebuilt — split-screen shell)
src/pages/ResetPassword.tsx        (new — recovery handler)
src/features/auth/
  ├─ AuthCard.tsx                  (glass card + tabs)
  ├─ EmailPasswordForm.tsx
  ├─ MagicLinkForm.tsx
  ├─ PhoneOtpForm.tsx
  ├─ OAuthButtons.tsx              (Google + Apple)
  ├─ TwoFactorChallenge.tsx
  ├─ BrandCanvas.tsx               (left cinematic panel)
  ├─ useRoleRedirect.ts            (post-login routing)
  └─ schemas.ts                    (zod validators, length caps)
src/contexts/AuthContext.tsx       (expand AppRole union)
supabase/migrations/<ts>_roles_expand.sql
.lovable/design-lint-baseline.json (regenerated if needed)
tests/visual/auth_visual.py        (light/dark × LTR/RTL × mobile/desktop)
src/features/auth/__tests__/       (vitest: schema validation, role redirect map)
```

## Technical notes
- Reuse `lovable.auth.signInWithOAuth` (Google/Apple) — never call `supabase.auth.signInWithOAuth` directly.
- Validate every input with zod (`trim`, length caps) before calling Supabase.
- All inputs labelled; icon-only buttons get `aria-label`; status messages in `aria-live="polite"`; honor `prefers-reduced-motion`.
- Use only design tokens (`bg-background`, `text-foreground`, glass utilities) — design-lint will gate this.
- `redirect_uri: window.location.origin` for OAuth; intended path stored separately and consumed after `onAuthStateChange` confirms a session.
- Tests: unit tests for role→route mapping and zod schemas; Playwright smoke that `/auth` renders both panels and the `from=` redirect survives an unauth `/admin` hit.

## Two questions before I start

1. **Apple + reCAPTCHA setup** — proceed with `configure_social_auth(['apple'])` now, and request the reCAPTCHA v3 keys via `add_secret`? (Yes / Skip Apple / Skip reCAPTCHA / Skip both)
2. **Role migration** — OK to add `super_admin / sales / warehouse / accountant / distributor` to `app_role` and map legacy `wholesale → distributor`? (Yes / Keep current 3 roles / Different mapping)

Reply with answers (or "go with defaults: yes to both") and I'll build it in one pass.