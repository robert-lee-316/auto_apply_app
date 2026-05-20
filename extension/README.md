# AutoApply Chrome Extension

**Workday and iCIMS only.** For Greenhouse, Lever, Ashby, and other sites, use the desktop app (`npm start`).

## Supported sites

| Site | URLs |
|------|------|
| **Workday** | `*.myworkdayjobs.com`, `*.workdayjobs.com`, `*.workday.com` (job pages) |
| **iCIMS** | `*.icims.com` |

## Layout

```text
extension/platforms/
  workday/     apply.js + index.js
  icims/       apply.js + index.js
  shared/dom.js
  registry.js
```

## Install

1. `chrome://extensions` → **Developer mode** → **Load unpacked**
2. Select this `extension/` folder

## Use

1. Open a Workday or iCIMS job/application page in the **main browser window**.
2. Click the extension icon — the **side panel** opens on the right with your profile.
3. Edit profile and upload resume in the side panel while the application stays visible on the left.
4. Click **Fill application** — the main tab is filled; review and submit manually.

Requires Chrome 114+ (Side Panel API).

No sign-in or sign-up automation.
