# Logo and favicon setup

The app uses one image for both the **logo** and **favicon** (the Mkulima Pro emblem with the farmer and produce).

## Use your image

1. Copy your logo image (the one with the farmer, crate, and "Mkulima Pro" text) into the project’s **`public`** folder as:
   - **`public/logo.png`** – used in the header, auth pages, and PWA.
   - **`public/favicon.png`** – used as the browser tab icon (and in metadata).

2. You can use the same file for both: same image, two copies with these exact names.

3. Restart the dev server if it’s running so the new images are picked up.

## Where they’re used

- **`app/layout.tsx`** – metadata `icons` (favicon + logo).
- **`app/page.tsx`** – homepage logo.
- **`app/auth/layout.tsx`** – login/signup logo.
- **`components/dashboard-nav.tsx`** – sidebar and top nav logo.
- **`public/manifest.json`** – PWA icons.

All of these reference `/logo.png` and `/favicon.png`, so putting your image in `public/` with those names is enough.
