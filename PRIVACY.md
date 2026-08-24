# Privacy Policy — ReproReport

Published by Intellorbis Technology Services (https://www.intellorbis.com)

Last updated: 2026-08-24

## Summary

ReproReport does not collect, transmit, or store any data outside
your own browser. There are no servers, no analytics, and no
third-party network calls made by this extension.

## What the extension accesses

- A content script runs on every page you visit (in the page's own
  JavaScript context) to observe `console.error` / `console.warn`
  calls, uncaught exceptions, and unhandled promise rejections as they
  happen — including before DevTools is opened, so a bug that occurs
  right when a page loads isn't missed.
- While its DevTools panel is open, the extension also reads network
  request and response data (URLs, headers, status, and timing) for
  the inspected page, using Chrome's `devtools.network` API — the same
  data already visible in Chrome DevTools' own Network tab.
- With the panel's Screenshot button, it captures a single image of
  the currently visible tab using `chrome.tabs.captureVisibleTab`.

## What happens to that data

- Captured console/exception entries are buffered in the extension's
  background service worker, per tab, up to 300 entries — purely in
  memory, never written to disk by the extension.
- That buffer is cleared automatically when the tab navigates to a new
  page or is closed, and can be cleared manually with the panel's
  "Clear" button.
- Nothing is sent to any external server, by the extension or its
  author.
- When you click "Generate Report," a Markdown report is assembled
  entirely in the DevTools panel from what's currently captured (or
  just the entries you've selected). Nothing is sent anywhere as part
  of generating it.
- When you use Copy, Download .md, or Download screenshot .png, the
  report or image is copied to your clipboard or downloaded straight
  to your computer. It never passes through any server controlled by
  the extension or its author.

## Sensitive data

Console messages, stack traces, and network URLs/status codes may
include data specific to the page you're debugging (e.g. values
logged by the page, or identifiers in a URL). ReproReport does not
inspect, redact, or filter this content — it captures what the page
itself already logs or requests. You are responsible for reviewing a
generated report before sharing it, especially before pasting it into
a public issue tracker.

## Permissions

- `tabs` — used to track which buffered entries belong to which tab,
  to clear that buffer when a tab navigates or closes, and to capture
  a screenshot of the tab you're inspecting. It is not used to read
  your browsing history.
- `host_permissions: <all_urls>` — required so the content script that
  observes console errors and exceptions can run on any page you
  choose to debug, from the moment the page loads.

The extension does not read page content beyond console/error events
it hooks directly, does not access cookies or storage, and does not
make any network requests of its own.

## Changes to this policy

Any future change to what data this extension accesses will be
reflected in an updated version of this document.

## Contact

Intellorbis Technology Services
Website: https://www.intellorbis.com
Email: intellorbistech@gmail.com
