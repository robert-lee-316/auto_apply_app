# Job platform components (desktop app)

Each job site has its own folder. Shared helpers live in `shared/`. Routing is in `registry.js`.

```text
platforms/
  registry.js       # detectPlatform, applyForPlatform
  shared/
    common.js       # openApplicationForm
    fill-generic.js # generic field filler
    guest-apply.js  # factory for guest-apply sites
  greenhouse/index.js
  lever/index.js
  ashby/index.js
  ultipro/index.js
  paylocity/index.js
  rippling/index.js
  generic/index.js  # fallback
  workday/index.js  # extension only (desktop skips)
  icims/index.js    # extension only (desktop skips)
```

## Add a new site

1. Create `platforms/<site-id>/index.js`
2. Use `createGuestPlatform()` from `shared/guest-apply.js` or implement `apply()` yourself
3. Register the import in `registry.js` (before `generic`)

Each module exports:

- `id` — platform key
- `label` — display name
- `channel` — `"desktop"` or `"extension"`
- `match(url)` — returns true if URL belongs to this site
- `apply(page, profile, log)` — optional; Puppeteer fill logic
