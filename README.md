# AutoApply Job App

Desktop app (Electron + Puppeteer) to open job links in Chrome and fill **guest** application forms — no sign-in or sign-up automation.

## Supported platforms (this app)

- Greenhouse
- Lever
- Ashby
- UKG / UltiPro
- Paylocity
- Rippling
- Other generic ATS forms (fallback filler)

## Workday & iCIMS → Chrome extension only

The desktop app **does not** apply on Workday or iCIMS. Use the Chrome extension in `extension/` (those two sites only).

```text
chrome://extensions → Developer mode → Load unpacked → select extension/
```

Opens in the **right side panel** next to the job page (Chrome 114+).

See [extension/README.md](extension/README.md) for setup and profile import/export.

## Setup

```bash
npm install
npm start
```

1. Open the **Profile** tab and enter your details (saved automatically to your user data folder).
2. Choose your resume PDF with **Choose file**.
3. On **Apply**, paste one job URL per line and click **Start applying**.

Auto-submit stays **off** by default so you can review each form before submitting.

## CLI mode

```bash
npm run apply:cli jobs.txt
```

Uses defaults from `src/profile.js` unless you have saved a profile in the Electron app first (CLI does not read the UI profile file by default).

To enable automatic final submit:

```bash
npm run apply:cli jobs.txt -- --submit
```

## Default profile template

`src/profile.js` holds starter defaults. The UI profile overrides these when you run from the app.

## Safety

- Sign-in / sign-up flows are **not** automated.
- Auto-submit is OFF by default. Keep it off while testing.
