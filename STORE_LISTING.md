# Chrome Web Store listing — copy to paste into the Developer Dashboard

Publisher: Intellorbis Technology Services (https://www.intellorbis.com)

## Short description (max 132 chars, shown in search results)

Capture console errors, failed requests, a screenshot & env info during a repro — export a bug report, entirely offline.

(122 chars)

## Detailed description

ReproReport turns Chrome DevTools into a bug-capture tool. It records
console errors, uncaught exceptions, unhandled promise rejections, and
failed network requests as you reproduce an issue, then exports
everything as a single Markdown bug report — ready to paste into
Jira, GitHub, Linear, or wherever you track bugs.

WHY INSTALL THIS

If you've ever reproduced a bug, then gone back through DevTools by
hand to copy the console error, dig up the failing request, take a
screenshot, and write up the environment — this extension does that
step for you. Reproduce the issue once, click Generate Report, and
you have a complete writeup. Nothing you capture ever leaves your
browser: there's no server, no account, and everything is assembled
locally in the DevTools panel.

WHAT IT DOES

• Captures `console.error` / `console.warn` calls, uncaught
  exceptions, and unhandled promise rejections as they happen — even
  before DevTools is open, so bugs at page load aren't missed.
• Captures network requests DevTools sees, flagged as failed on
  status 0 or 4xx/5xx by default; toggle to see every request instead.
• Select exactly which console entries or requests to include, or
  leave nothing selected to include everything captured.
• One-click screenshot of the tab you're inspecting, attached to the
  report and downloadable separately.
• Shows page URL, viewport size, and user agent alongside the report
  so environment details don't have to be typed by hand.
• Generates a single Markdown report — Steps to Reproduce,
  Expected/Actual Result, Console Errors & Warnings, Failed Network
  Requests — with placeholders you fill in for the parts only a human
  knows.
• Copy to clipboard or download as `.md`, plus a separate screenshot
  download.

WHO IT'S FOR

Developers and QA engineers who need to turn a real repro session
into a clear, shareable bug report without manually re-collecting the
console output, failing request, and screenshot every time.

## Category

Developer Tools

## Language

English

## Single purpose statement (if asked during review)

This extension's single purpose is to capture console errors, network
failures, a screenshot, and environment info during a browser session
and let the user export them as a single bug report.

## Permission justification (if asked)

- `tabs`: used to associate captured console/exception entries with
  the correct tab, clear that buffer on navigation or tab close, and
  capture a screenshot of the inspected tab. Not used to read
  browsing history.
- `host_permissions: <all_urls>`: required so the content script that
  observes console errors and exceptions can run on any page the user
  chooses to debug, starting from page load — not just while DevTools
  happens to be open.
- `devtools_page`: adds the DevTools panel itself and uses
  `chrome.devtools.network` to read failed/successful requests for the
  inspected page, the same data already shown in DevTools' own Network
  tab.

## Privacy policy URL

Host PRIVACY.md somewhere public (e.g. GitHub Pages, a gist raw URL,
or your own site) and paste that URL into the "Privacy practices" tab.
A Markdown file on disk is not enough — Chrome Web Store requires a
live URL.

## Assets still needed before submitting

- [ ] Store icon 128×128 PNG — icons/icon128.png already exists,
      confirm it looks correct at full size (no transparency issues).
- [ ] At least one screenshot, 1280×800 or 640×800, showing the panel
      with real captured entries and a generated report (record this
      yourself — showing your own repro is better than a synthetic
      demo).
- [ ] Optional: small promo tile 440×280, marquee 1400×560.
