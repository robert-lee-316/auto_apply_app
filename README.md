# AutoApply Job App

Standalone desktop-style app using Electron + Puppeteer.

## Setup

```bash
npm install
npm start
```

## CLI mode

```bash
npm run apply:cli jobs.txt
```

To enable automatic final submit:

```bash
npm run apply:cli jobs.txt -- --submit
```

## Edit your profile

Open `src/profile.js` and replace the placeholder data.

## Resume upload

Put your resume in the project folder and set `resumeFilePath` in `src/profile.js`.

## Safety

Auto-submit is OFF by default. Keep it off while testing.
