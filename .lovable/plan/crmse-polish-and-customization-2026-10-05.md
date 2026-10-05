# CRMse polish and customization

## Goal
Turn the current salon dashboard into a more refined, space-efficient CRM while keeping its light Cloudly-style foundation and avoiding visual over-engineering.

## What will change

### 1. CRMse identity
- Rename the visible product from BookFlow to **CRMse** across login, navigation, metadata, and demo references.
- Create a compact CRMse mark that works in the sidebar, login screen, and browser favicon.
- Replace generic Instagram, Facebook, WhatsApp, and Google Calendar symbols/text treatments with recognizable official brand marks where those platforms are shown.

### 2. Editable service catalogue
- Upgrade Services into an admin workspace with clear Men/Women sections and compact service rows.
- Add a working **Add service** flow for name, category, price, and duration.
- Add edit and delete actions so the admin can maintain each service’s price and time.
- Keep the starter catalogue in the separate mock-data file; save admin changes locally so they survive refreshes in the demo.
- Make the WhatsApp flow read the customized service catalogue automatically.

### 3. Custom export center
- Add **Export** to the sidebar and mobile navigation.
- Create an export page where the admin chooses booking columns, reorders them, filters records, previews the result, and downloads a CSV.
- Include sensible presets such as Customer list, Finance, and Full booking report without forcing extra fields.

### 4. Restrained CRM UI polish
- Tighten spacing, headings, panels, tables, filters, and action placement across Bookings, Slots, Ad Analytics, WhatsApp Flow, and Services.
- Improve scanning with compact summaries, useful empty states, consistent row actions, and clearer platform/source treatments.
- Preserve the current light theme, English-only text, and compact overview; no large banners, nested cards, or decorative clutter.
- Ensure layouts stay usable on the current compact viewport and on mobile.

## Technical details
- Use existing semantic theme tokens and shared Button/input/dialog/dropdown components.
- Add a shared brand-mark component and small platform-icon assets/components.
- Add a reusable service state hook backed by local storage, seeded from `mockCrmData`.
- Build CSV output in the browser; no backend or real integrations are added.
- Update the project roadmap and architecture notes for the shared service store and export module.
- Verify add/edit/delete service flows, WhatsApp catalogue updates, column selection/order, CSV download, navigation, browser favicon, and responsive rendering.

## Not included
- Real WhatsApp, Google Calendar, advertising-platform, or database connections.
- Customer-facing pages or activation of PG/Hotel and Restaurant.
