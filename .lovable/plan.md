
## MUST Connect Admin Portal — 3 Pages

Build a responsive admin portal matching the uploaded designs exactly, with Login, Dashboard, and Settings pages.

### Pages

**1. Login (`/login`)**
- Split layout: left blue gradient panel with MUST University logo, heading "Empowering Student Outreach at Scale." (with "at Scale." in orange), description, and copyright footer.
- Right panel: white card with "Welcome back", email + password fields (with icons), "Forgot password?" link, "Remember me" checkbox, and orange "Sign In to Dashboard →" button.
- Fully responsive: stacks vertically on mobile.

**2. Dashboard (`/`)**
- Sidebar (left): MUST Connect logo header, nav items (Dashboard, Batches, Campaigns, Sending Numbers, Media, FAQs, Chats, Settings), Admin User footer.
- Main area:
  - "Dashboard" title + welcome subtitle.
  - Campaign card: "Spring 2026 Admissions Campaign" with Active badge, description, progress bar, three stats (Sent 3,420 / Pending 1,580 / Engagement 284), "Manage Campaign" button.
  - 3 stat cards: Total Batches 12,847, Engagement 600, University Visits 142.
  - Recent Batch Uploads list with 4 entries (date, contacts, Validated/Processing status badges).

**3. Settings (`/settings`)**
- Same sidebar layout.
- Profile Settings card: Full Name, Email, Phone, Department fields + "Save Changes" button.
- Security card: Current Password, New Password, Confirm Password + "Update Password" button.

### Design System
- **Colors:** Blue primary (#1e3a8a / deep navy-blue), orange accent (#f97316), light gray-blue background, white cards.
- **Typography:** Clean sans-serif, bold headings.
- **Components:** Rounded cards with subtle shadows, status badges (green=Validated, orange=Processing, green=Active).
- Icons via `lucide-react`.

### Structure (minimal files)
- `src/routes/login.tsx` — Login page
- `src/routes/index.tsx` — Dashboard (replaces placeholder)
- `src/routes/settings.tsx` — Settings page
- `src/components/AdminSidebar.tsx` — Shared sidebar
- `src/components/AdminLayout.tsx` — Layout wrapper (sidebar + main)
- `src/styles.css` — Updated theme tokens (blue/orange palette)

### Notes
- No authentication logic — Login button just navigates to Dashboard.
- Sidebar collapses to a drawer on mobile (hamburger toggle).
- All data is static/mocked for this UI-only build.
- Uses TanStack Router (project default) — Login link navigates between routes.
