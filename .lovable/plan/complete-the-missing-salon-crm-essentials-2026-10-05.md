# Complete the missing Salon CRM essentials

## Goal
Keep the current CRMse design and completed screens unchanged, then add only the useful Version 1 features present in the uploaded salon document but missing from the demo.

## What will be added

### 1. Customer CRM
- Add a **Customers** page to the sidebar.
- Show searchable customer profiles with phone, booking source, visit count, total spend, last/upcoming appointment, and notes.
- Open a compact customer detail view with appointment history and services taken.

### 2. Practical appointment management
- Upgrade **Bookings** with a working **New booking** form for walk-ins, phone, referral, and WhatsApp bookings.
- Include customer, one or more services, date, time, discount, source, and notes; calculate duration and final amount automatically.
- Add compact row actions for edit, reschedule, complete, cancel, and mark as no-show.
- Add the missing **Rescheduled** and **No show** statuses and summary counts without replacing the current booking table design.

### 3. Service availability
- Add an active/inactive switch to each service and its edit form.
- Inactive services remain visible to the admin but are hidden from the WhatsApp booking flow.
- Continue using the existing shared service catalogue so edits stay synchronized.

### 4. More complete WhatsApp flow preview
- Extend the existing preview with location, multiple-service selection, date, time, and a complete price/duration summary.
- Add demo choices for **Book**, **View**, **Reschedule**, and **Cancel appointment**.
- Keep this clearly simulated; no real WhatsApp or Google Calendar connection will be introduced.

### 5. Focused dashboard additions
- Add compact owner metrics already requested in the document: completed, cancelled, no-show, walk-in, new/returning customers, and top service.
- Add a small branch-performance section using demo branches, without enlarging the existing top area.

## Data and behaviour
- Put all new demo branches, customers, appointment statuses, and history in the existing central mock-data file.
- Keep user-created demo appointments and service edits in browser storage so they survive refreshes.
- Keep the app light, English-only, compact, and premium.

## Not included now
- Real WhatsApp, reminders, notifications, Google Calendar sync, roles/permissions, media uploads, or multi-tenant backend.
- Offers, payments, loyalty, memberships, inventory, facilities, or a customer-facing website, since the document marks these as future/out of scope.
