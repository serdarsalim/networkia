# Networkia

## Vision
Personal relationship memory system for managing professional and private acquaintances. 
Not a CRM for sales - a tool to remember what matters about people I care about.

## Tech Stack
- Next.js 15 (App Router)
- Prisma + Neon (PostgreSQL)
- NextAuth (Google OAuth)
- Tailwind CSS v4
- TypeScript (strict mode)
- React Query (server state)

## Core Features
1. **People management**: name, photo, phone, email, company, notes
2. **Interaction logging**: freeform text notes with timestamps
3. **Demo mode**: Full localStorage experience before sign-up (zero DB pollution)
4. **Live mode**: Per-user data isolation with React Query cache keys
5. **Search/filter**: Instant search across all fields
6. **Dark mode**: Manual toggle (not system preference)

## Data Model
```
Contact: name, email, phone, company, notes, userId, timestamps
Interaction: contactId, date, notes, userId
User: NextAuth standard fields
```

## Design Principles
- **Try before sign-up**: Demo mode lets users explore fully functional app
- **Low friction capture**: < 5 seconds to add a contact
- **Information density**: Show more, scroll less
- **Mobile-first**: Works great on phone, better on desktop
- **No forced structure**: All fields optional except name
- **Production-grade**: No shortcuts, zero data contamination

## Data Architecture
**Demo mode (logged out)**:
- localStorage with `demo_` prefix
- Full CRUD operations
- Sample data on first load

**Live mode (logged in)**:
- PostgreSQL database via Prisma
- React Query with user-specific cache keys: `['contacts', 'user', userId]`
- Zero cross-contamination between users
- See `DATA_ISOLATION_GUIDE.md` for details

## Current Status
✅ Next.js + Prisma + Neon + NextAuth setup
✅ Demo/live data isolation working
✅ Google OAuth authentication
✅ Dark mode toggle (manual, persisted to localStorage)
✅ Dashboard with 2-column layout (All Contacts | Recent Activity)
✅ Contact filtering (All, Overdue, by Circle: Close, Work, Family)
✅ Profile page with comprehensive contact information
✅ Date-based "Next meet" scheduling system with flexible date picker
✅ Fully editable contact profiles with dynamic fields

## Design Decisions
**Dashboard Layout**: Simplified from 3-column to 2-column layout. Removed redundant "Need to Reach Out" section in favor of an "Overdue" filter on the main contact list. This reduces visual clutter while maintaining all functionality.

**Contact Scheduling**: Moved from rigid cadence-based scheduling ("Contact every 2 weeks") to flexible date-based system ("Next meet: Jan 24"). Users can pick specific dates, use quick buttons (1 week, 2 weeks, 1 month, 3 months), or delete the date entirely. Reflects reality that relationships don't follow rigid schedules.

**Circles**: Tags from contact profiles, not separately managed entities. Simple and flexible.

## Next Up (Priority Order)
1. Wire up backend data (currently static demo data)
2. Implement functional filters (All, Overdue, by Circle)
3. Implement functional sorting (Last Contact, Name, Added Date)
4. Add interaction logging (notes with timestamps)
5. Search functionality across contacts
6. Recent activity feed with real data

## File Structure
```
app/
  page.tsx                # Dashboard: 2-column layout with contacts and activity
  chardemo2/
    page.tsx              # Profile page: comprehensive contact view with editing
  api/auth/              # NextAuth routes
  api/contacts/          # Contact CRUD API (TODO)

hooks/                   # TODO: Wire up data layer
  use-contacts.ts
  use-demo-storage.ts
  use-live-data.ts

lib/
  types.ts
  demo-data.ts
```

## Development Rules
- No abstractions until 3rd use
- TypeScript strict mode, no `any`
- Comments explain "why", not "what"
- Commit atomically (each commit = working state)
- Fix bugs before adding features

## Anti-Patterns
❌ Mixing demo and live data
❌ Generic names (Manager, Service, Helper)
❌ God components (> 300 lines)
❌ Premature optimization
❌ Feature creep

---

**Last Updated**: 2026-01-13
**Status**: Early development - demo/live working, building core features
