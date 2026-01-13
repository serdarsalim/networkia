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
✅ Dark mode toggle
✅ Basic contact CRUD (add, delete)

## Next Up (Priority Order)
1. Add edit contact functionality
2. Add more contact fields (phone, company, tags)
3. Add interaction logging (notes with timestamps)
4. Search and filter contacts
5. Contact detail view
6. Interaction history timeline

## File Structure
```
hooks/
  use-contacts.ts         # Auto-switches demo/live based on auth
  use-demo-storage.ts     # localStorage for demo
  use-live-data.ts        # React Query for server

lib/
  types.ts                # Core TypeScript types
  demo-data.ts            # Sample data generator

app/
  providers.tsx           # React Query + NextAuth
  page.tsx                # Main contact list
  api/auth/              # NextAuth routes
  api/contacts/          # Contact CRUD API (TODO)
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
