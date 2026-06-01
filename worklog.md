---
Task ID: 1
Agent: Main Agent
Task: Fix BusyBeds preview not working - debug and fix build/runtime errors

Work Log:
- Audited all project files - found extensive codebase with 140+ pages, 60+ API routes, 50+ UI components
- Ran `next build` - found 10 build errors
- Fixed all 7 page files with bad function names (spaces in identifiers)
- Added missing exports: generateReferralCode, generateVerifyEmail, generateResetPasswordEmail
- Fixed useSearchParams Suspense boundary issues in reset-password and verify-email pages
- Added allowedDevOrigins config for preview system cross-origin support
- Fixed prisma/seed.ts foreign key constraint for coupon.subscriptionId
- Database seeded with realistic sample data
- Verified production build succeeds and dev server works

Stage Summary:
- All build errors fixed, project compiles and runs successfully
- Database seeded with 20 hotels, 80 coupons, 20 travelers, reviews, FAQs, blog posts
- Test accounts: admin@busybeds.com/Admin123! and owner@busybeds.com/Owner123!
