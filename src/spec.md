# Specification

## Summary
**Goal:** Create a basic admin dashboard structure with access control limited to a single hardcoded admin principal.

**Planned changes:**
- Add AdminDashboardPage.tsx with welcome message and placeholder sections for future admin features (Stripe settings, user management, revenue analytics)
- Implement backend isAdmin() query method that checks if the caller matches the hardcoded admin principal (gwnln-jmtc7-rdrpt-tzrrg-cygwh-k27i2-hlppl-3v4wb-holfc-ezwwn-3qe)
- Create useIsAdmin React Query hook to fetch admin status from backend
- Add access control to AdminDashboardPage that shows dashboard content only to the admin principal and displays access denied message to all other users

**User-visible outcome:** The admin principal can access a basic admin dashboard page with placeholder sections for future features, while non-admin users see an access denied message when attempting to visit the admin route.
