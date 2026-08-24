(() => {
  const CHANNEL = "reproreport-page";

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || !data.entry) return;
    try {
      chrome.runtime.sendMessage({ type: "console-entry", entry: data.entry });
    } catch {
      // extension context invalidated (e.g. reloaded) — nothing to relay to
    }
  });
})();
