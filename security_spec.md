# MarketPulse Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Identity Ownership Invariant**: Every document across `/users/{userId}`, `/users/{userId}/private/{docId}`, `/users/{userId}/budgets/{budgetId}`, `/trips/{tripId}`, and `/trips/{tripId}/items/{itemId}` MUST have `uid == request.auth.uid`. Users can never create, read, update, or delete records belonging to another UID.
2. **Email Verification Invariant**: All write operations (`create`, `update`, `delete`) require `request.auth.token.email_verified == true`.
3. **PII Split Isolation Invariant**: Personal Identifiable Information (`email`, `phone`, `contact`) is strictly isolated in `/users/{userId}/private/{docId}` and never exposed on `/users/{userId}` or readable by non-owners.
4. **Master Gate Relational Invariant**: A `/trips/{tripId}/items/{itemId}` document cannot be created, read (`get`), updated, or deleted unless the parent `/trips/{tripId}` document exists and its `uid` equals `request.auth.uid`.
5. **Strict Schema & No Shadow Fields Invariant**: Every `create` and `update` operation enforces exact allowed keys via `hasAll` and `hasOnly` plus action-based `affectedKeys().hasOnly(...)` gates.
6. **Temporal Integrity & Immutability Invariant**: `createdAt` and `updatedAt` must equal `request.time` on creation; on update, `createdAt` and `uid` (and `tripId` for items) are strictly immutable, while `updatedAt == request.time`.
7. **ID & Boundary Hardening Invariant**: All path document IDs must satisfy `^[a-zA-Z0-9_\-]+$` with length `<= 128`, and every string field is bounded by its blueprint `maxLength`.

---

## 2. The "Dirty Dozen" Payloads

### Payload 1: Identity Spoofing on Trip Creation
```json
{
  "uid": "victim-uid-999",
  "market": "Mile 12 Market",
  "date": "Today, 24 Oct",
  "rawDate": "2026-10-24T12:00:00Z",
  "itemsCount": 2,
  "total": 15000,
  "syncStatus": "synced",
  "pctChange": 0,
  "isPositiveChange": false,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: `PERMISSION_DENIED` (`data.uid != request.auth.uid`).

### Payload 2: Shadow Field Injection on UserProfile
```json
{
  "uid": "user-123",
  "name": "Adanna Okafor",
  "household": "My Household",
  "location": "Lagos, Nigeria",
  "activeRegionId": "lagos",
  "avatarInitials": "AO",
  "twoFactorEnabled": true,
  "biometricLock": true,
  "isSecured": true,
  "syncState": "synced",
  "isAdmin": true,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: `PERMISSION_DENIED` (`hasOnly` rejects `isAdmin`).

### Payload 3: Unverified Email Write Attempt
Authenticated as `user-123` with `email_verified: false` attempting to create `/trips/trip-1`.
*Expected Result*: `PERMISSION_DENIED` (`isVerified()` fails).

### Payload 4: Cross-User PII Read Attempt
Authenticated as `attacker-456` attempting `get` on `/users/user-123/private/info`.
*Expected Result*: `PERMISSION_DENIED` (`isOwner(userId)` fails).

### Payload 5: Orphaned TripItem Creation (Non-existent Parent Trip)
Creating `/trips/non-existent-trip/items/item-1` with valid `TripItem` fields.
*Expected Result*: `PERMISSION_DENIED` (`exists(/databases/$(database)/documents/trips/$(tripId))` fails).

### Payload 6: Hijacked Parent TripItem Creation (Parent Trip Owned by Another User)
Authenticated as `attacker-456` creating `/trips/victim-trip-1/items/item-1` where `item.uid == "attacker-456"`, but `victim-trip-1.uid == "user-123"`.
*Expected Result*: `PERMISSION_DENIED` (Master Gate `get(.../trips/$(tripId)).data.uid == request.auth.uid` fails).

### Payload 7: Immutable `createdAt` Tampering on Trip Update
Updating `/trips/trip-1` with a modified `createdAt` timestamp.
*Expected Result*: `PERMISSION_DENIED` (`incoming().createdAt == existing().createdAt` and `affectedKeys().hasOnly(...)` fail).

### Payload 8: Forged Client Timestamp (`updatedAt` in the Past/Future)
Updating `/users/user-123` with `updatedAt: Timestamp.fromMillis(1700000000000)` instead of `request.time`.
*Expected Result*: `PERMISSION_DENIED` (`incoming().updatedAt == request.time` fails).

### Payload 9: String Overflow / Denial-of-Wallet Payload
Creating `/trips/trip-1` with `market` set to a 5,000-character string.
*Expected Result*: `PERMISSION_DENIED` (`data.market.size() <= 100` fails).

### Payload 10: ID Poisoning Attack
Creating a trip at `/trips/invalid$id!with*special(chars)` with valid payload.
*Expected Result*: `PERMISSION_DENIED` (`isValidId(tripId)` regex guard fails).

### Payload 11: Value Poisoning on Update (Invalid Enum / Negative Price)
Updating `/trips/trip-1` with `total: -5000` or `syncStatus: "hacked"`.
*Expected Result*: `PERMISSION_DENIED` (`isValidTrip()` validation helper blocks negative totals and invalid enum values).

### Payload 12: Unauthorized Blanket Collection List Scraping
Authenticated as `attacker-456` executing an unfiltered `list` query on `/trips` without `where('uid', '==', 'attacker-456')`.
*Expected Result*: `PERMISSION_DENIED` (`allow list` requires `existing().uid == request.auth.uid`).
