---
Task ID: 1
Agent: Main Agent
Task: Fix Railway build failure and all TypeScript errors

Work Log:
- Analyzed Railway build error: bun.lock was stale (dependencies added via npm, not bun)
- Deleted package-lock.json to prevent package manager confusion
- Ran `rm -rf node_modules bun.lock && bun install` to regenerate fresh bun.lock
- Fixed all 56 TypeScript errors across src/:
  - Next.js 16 breaking change: Updated 19 API route handlers to use `params: Promise<...>` with `await params`
  - Fixed getSession(request) → getSession() in /api/auth/me/route.ts (function takes no args)
  - Added `await` to hashPassword() calls in register and reset-password routes (returns Promise<string>)
  - Updated Stripe API version from '2024-12-18.acacia' to '2026-05-27.dahlia'
  - Fixed Stripe webhook: removed stripeInvoiceId from Invoice create, cast event data properly
  - Added `reference` field to PesapalPaymentParams interface
  - Fixed getEffectiveDiscount call: parse JSON discountRules, pass context object instead of boolean
  - Fixed isWithinDateRange: remove extra argument, handle nullable Date fields
  - Added phone/address fields to Hotel type definition
  - Removed nonexistent ReviewIcon import from owner dashboard
- Added /admin redirect page (was missing, caused 404)
- Committed and pushed to main branch

Stage Summary:
- All 56 → 0 TypeScript errors in src/
- Next.js build succeeds locally
- Changes pushed to GitHub (commit f6261f2)
- Railway deployment should succeed on next build
