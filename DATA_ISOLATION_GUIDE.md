# Data Isolation Strategy - LocalStorage First

## Overview

This app implements a **zero-contamination** data architecture where demo (logged-out) data and live (logged-in) data are completely isolated from each other using localStorage keyscopes.

## The Problem This Solves

In many apps, mixing demo and live data causes:
- Demo data appearing in production databases
- User data being accidentally stored in localStorage
- Cache collisions between different users
- Confusion about which data is real vs demo

## Our Solution

### Two Separate Data Layers

#### 1. Demo Mode (Logged Out)
- **Storage**: localStorage with `demo_` prefix
- **Keys**: `demo_full_contacts`, `demo_quick_contacts`
- **Behavior**: Fully functional CRUD operations
- **Persistence**: Survives page refresh, isolated to browser
- **Use case**: User can try the app before signing up

#### 2. Live Mode (Logged In)
- **Storage**: localStorage with `live_` + email prefix
- **Keys**: `live_full_contacts_<email>`, `live_quick_contacts_<email>`
- **Behavior**: Fully functional CRUD operations
- **Persistence**: Per-user, per-browser
- **Use case**: Logged-in users keep data isolated by account

## Architecture

```
┌─────────────────────────────────────────────────┐
│         useScopedLocalStorage() Hook            │
│        (Auto-selects demo/live keys)            │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
  Not Signed In    Signed In
        │               │
        ▼               ▼
  demo_* keys       live_*_<email> keys
    (local)             (local)
```

## Key Files

### Hooks
- `hooks/use-scoped-local-storage.ts` - Unified hook for demo/live localStorage

## How It Works

### 1. Single Import Pattern

```tsx
import { useScopedLocalStorage } from "@/hooks/use-scoped-local-storage";

function MyComponent() {
  const { value: contacts, setValue: setContacts } =
    useScopedLocalStorage({
      demoKey: "demo_full_contacts",
      liveKeyPrefix: "live_full_contacts_",
      initialValue: [],
    });
}
```

### 2. Key Isolation

**Demo mode:**
```javascript
// localStorage key
"demo_full_contacts" → [{ id: 'demo-1', name: 'Sarah Chen' }]
```

**Live mode (User A):**
```javascript
// localStorage key
"live_full_contacts_alice@example.com" → [{ id: '123', name: 'Real Contact' }]
```

**Live mode (User B):**
```javascript
// localStorage key - completely separate!
"live_full_contacts_bob@example.com" → [{ id: '456', name: 'Different Contact' }]
```

### 3. Zero Cross-Contamination

- Demo data stays in `localStorage` with `demo_` prefix
- Live data stored in per-user localStorage keys
- Keys include `email` for per-user isolation
- No shared state between logged-in and logged-out modes
- No shared state between different logged-in users

## Benefits

### User Experience
- Try full app functionality before signing up
- No data loss when experimenting in demo mode
- Smooth transition from demo to real account
- Clear visual indicator of demo vs live mode

### Developer Experience
- Single hook API (`useScopedLocalStorage`) for all components
- Automatic mode switching based on auth state
- Easy to test both modes independently

### Production Quality
- No data mixing between demo/live or between users
- Clear separation of concerns

## Usage Examples

### Basic CRUD Operations

```tsx
function ContactList() {
  const { value: contacts, setValue: setContacts } =
    useScopedLocalStorage({
      demoKey: "demo_full_contacts",
      liveKeyPrefix: "live_full_contacts_",
      initialValue: [],
    });

  // Add contact (works in both modes)
  const handleAdd = () => {
    setContacts((current) => [
      ...current,
      { id: Date.now().toString(), name: "John Doe" },
    ]);
  };

  // Delete contact (works in both modes)
  const handleDelete = (id: string) => {
    setContacts((current) => current.filter((contact) => contact.id !== id));
  };

  return (
    <div>
      {contacts.map(contact => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

## Testing the Isolation

### Test 1: Demo Mode Persistence
1. Log out
2. Add some contacts
3. Refresh page
4. Contacts should persist (stored in localStorage)
5. Check DevTools → Application → Local Storage → `demo_full_contacts`

### Test 2: Login Transition
1. In demo mode, add contacts
2. Sign in with Google
3. Demo contacts disappear (they're still in localStorage, just not shown)
4. Your live contacts (if any) appear

### Test 3: Multi-User Isolation
1. Sign in as User A, add contacts
2. Sign out
3. Sign in as User B
4. User A's contacts should NOT appear
5. Each user has their own cache key

### Test 4: Key Verification
Open DevTools → Application → Local Storage and check:
- Logged out: `demo_*` keys
- Logged in: `live_*_<email>` keys

## Future Enhancements

### Optional: Import Demo Data on Sign Up
Allow users to migrate their demo data later:

```tsx
function onSignUpComplete() {
  const demoData = localStorage.getItem('demo_full_contacts');
  if (demoData) {
    // Prompt user: "Import your demo contacts?"
    await importDemoContacts(JSON.parse(demoData));
  }
}
```

## Security Considerations

✅ **Safe:**
- Demo data in localStorage (client-side only)
- Per-user cache keys prevent data leaks
- No sensitive data in demo mode

⚠️ **Important:**
- Don't store PII in demo mode
- Demo data is visible in browser DevTools
- Clear demo data if it contains test PII

## Troubleshooting

### Demo data not persisting
- Check browser localStorage quota
- Verify `demo_contacts` key exists in DevTools
- Check console for localStorage errors

### Live data not loading
- Verify user is authenticated (`session` exists)
- Verify `live_*_<email>` keys are being written

### Data mixing between users
- Should never happen if email is in the key
- Check `useScopedLocalStorage` prefixes are correct

## Summary

This architecture provides:
- **Complete isolation** between demo and live data
- **Per-user isolation** for logged-in users
- **Simple API** for developers
- **Great UX** for users trying before signing up

No data ever crosses the boundary between demo and live modes.
