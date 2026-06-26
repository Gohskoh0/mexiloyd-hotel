## LakeWood Hotel — v1 build plan

### 1. Confirm hotel identity
Multiple "Lakewood Hotel" listings exist on Google Maps. Before hard-coding contact/photos, I need you to confirm **which location** (e.g. Lakewood Hotel Asaba, Nigeria / Lagos / Accra / other). Share the Google Maps link or city and I'll pull the address, phone, and a representative photo from there.

Until confirmed, I'll scaffold with placeholders for address/phone and a hero image generated to match the vibe (lakeside, warm modern — see §2).

### 2. Brand & design
You didn't specify colors, so I'll go with **warm modern lakeside**: deep teal primary, soft sand neutrals, brass accent, serif display + clean sans body. Tagline default: *"Where the water meets warm hospitality."* Tell me if you'd rather pick from rendered design directions and I'll switch to that flow.

### 3. Pages (public)
- `/` — Home: hero, intro, room highlights, amenities, CTA to book
- `/rooms` — All room types with photos, price, availability
- `/rooms/$slug` — Room detail + booking widget
- `/gallery` — Photo grid
- `/about` — Story + location/map
- `/contact` — Address, phone, email, contact form
- `/booking/$id` — Booking summary + payment
- `/booking/$id/success` — Confirmation
- `/auth` — Guest + admin login

### 4. Rooms with inventory
Schema:
- `room_types` — name, slug, description, base_price, max_occupancy, images[], amenities[], total_units
- `bookings` — guest info, room_type_id, check_in, check_out, nights, total, payment_option, payment_status, status
- Availability = `total_units − count(overlapping confirmed bookings)` per date range

### 5. Paystack — 3 payment options at booking
1. **Pay full** now via Paystack
2. **Pay deposit** (30%) now, balance at hotel
3. **Pay at hotel** (reserve only, no card)

Implementation: Paystack inline checkout on the frontend; server function verifies the transaction reference with Paystack's API before marking the booking paid. Webhook at `/api/public/paystack-webhook` with signature verification as backup.

Needs two secrets (I'll request them after you approve):
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY` (publishable, stored as `VITE_PAYSTACK_PUBLIC_KEY`)

### 6. Admin
- Default credentials seeded: **username `admin` / password `lakewood123`** (changeable from dashboard)
- Admin dashboard at `/admin`:
  - Bookings list (filter by status/date/payment), mark paid, check-in/check-out, cancel
  - Room types CRUD (add/edit/delete, set inventory, upload images, pricing)
  - Settings: change admin username + password, hotel contact info, tagline
- Auth: Lovable Cloud email/password (admin email = `admin@lakewood.local` mapped to the username), role stored in `user_roles` table with `has_role()` security-definer function. Route guard at `/_authenticated/admin`.

### 7. Tech notes
- Lovable Cloud (database, auth, storage for room images)
- TanStack Start server functions for Paystack verify + bookings
- Public Paystack webhook under `/api/public/`
- Tailwind v4 design tokens in `src/styles.css`

---

### What I need from you to proceed
1. **Which Lakewood Hotel?** Share the Google Maps URL or city.
2. **Brand vibe OK?** Warm modern lakeside (deep teal + sand + brass), or want me to generate design directions to pick from?
3. **Approve default admin credentials** `admin` / `lakewood123` (you can change after first login)?

Once confirmed I'll enable Lovable Cloud, request the Paystack keys, and build it out.