# ReproReport

A Chrome DevTools panel that captures console errors, uncaught
exceptions, failed network requests, a screenshot, and environment
info during a repro session, then exports a ready-to-paste **bug
report** — entirely offline. Nothing captured ever leaves your browser.

Published by [Intellorbis Technology Services](https://www.intellorbis.com).

## Features

- Captures `console.error` / `console.warn` calls, uncaught exceptions,
  and unhandled promise rejections as they happen on the page — not
  just while DevTools is open
- Captures every network request DevTools sees, flagged as failed on
  status `0` or `>= 400`; toggle to show all requests instead
- Select individual console entries or requests to include, or leave
  nothing selected to include everything
- Pause/resume capture, and clear everything captured so far
- One-click screenshot of the inspected tab, attached to the report
- Environment bar: page URL, viewport size, user agent
- Generates a single Markdown bug report with sections for Steps to
  Reproduce, Expected/Actual Result, Console Errors & Warnings, and
  Failed Network Requests — copy it or download as `.md`
- Requests no permissions beyond the DevTools panel APIs plus `tabs`
  (used for screenshotting and per-tab buffering, not browsing history)

## Install

### From the Chrome Web Store

Not yet published. Until then, install from source (below).

### From source (unpacked)

1. Clone this repo:
   ```
   git clone https://github.com/IOTS-DevLab/REPRO-REPORT.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (toggle, top right).
4. Click **Load unpacked** and select the cloned `REPRO-REPORT` folder.
5. Confirm the "ReproReport" card shows up with its toggle on and no
   red "Errors" button.

This extension has no toolbar icon or popup — it only adds a panel
inside DevTools, so there's nothing to click in the toolbar after
installing.

## Usage

1. Open any regular webpage (not a `chrome://` page — DevTools
   extensions can't run there).
2. Open DevTools (`Cmd+Option+I` on Mac, `F12` / `Ctrl+Shift+I` on
   Windows/Linux).
3. Find the **Bug Report** tab in the DevTools tab row (Elements,
   Console, Network, ...). If the window is narrow, it may be hidden
   behind the `»` overflow chevron at the end of the tab row.
4. Reproduce the bug. Console errors, uncaught exceptions, unhandled
   rejections, and failed requests are captured as they happen.
5. Use the toolbar to:
   - **⏸ Pause / ▶ Resume** — stop or resume capturing new entries
   - **🗑 Clear** — discard everything captured so far
   - **📷 Screenshot** — capture the visible tab and attach it
6. Optionally check individual console entries or network rows to
   narrow what goes into the report — otherwise everything captured
   (or, for network requests, everything currently failed / matching
   "show all") is included.
7. Click **📝 Generate Report** to build the Markdown report, then:
   - **📋 Copy** — copy it to the clipboard
   - **⬇ Download .md** — save the report to disk
   - **⬇ Download screenshot .png** — save the attached screenshot

## Privacy

See [PRIVACY.md](PRIVACY.md). Short version: no data collection, no
network calls made by the extension, everything stays local until you
choose to export a file to disk.

## License

All rights reserved — see [LICENSE](LICENSE).
