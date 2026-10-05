# Project architecture rules

- Keep demo business data in `src/data/mockCrmData.ts`; UI files consume it rather than duplicating fixtures.
- Persist editable demo services through the shared service catalogue hook so Services and WhatsApp always use one source.
- Generate configurable CSV exports entirely in the browser because the current export feature uses demo data only.
- Persist editable demo appointments through the shared booking catalogue so Bookings and Customers stay synchronized.
