const MAX_ENTRIES_PER_TAB = 300;

const buffers = new Map(); // tabId -> entry[]
const ports = new Map(); // tabId -> Set<Port>

function bufferFor(tabId) {
  let buf = buffers.get(tabId);
  if (!buf) {
    buf = [];
    buffers.set(tabId, buf);
  }
  return buf;
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "console-entry" || !sender.tab) return;
  const tabId = sender.tab.id;
  const entry = { ...message.entry, frameUrl: sender.url || "" };

  const buf = bufferFor(tabId);
  buf.push(entry);
  if (buf.length > MAX_ENTRIES_PER_TAB) buf.shift();

  const tabPorts = ports.get(tabId);
  if (tabPorts) {
    for (const port of tabPorts) {
      port.postMessage({ type: "entry", entry });
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) buffers.delete(tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  buffers.delete(tabId);
  ports.delete(tabId);
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "reproreport-panel") return;

  let tabId = null;

  port.onMessage.addListener((msg) => {
    if (msg?.type === "subscribe" && typeof msg.tabId === "number") {
      tabId = msg.tabId;
      if (!ports.has(tabId)) ports.set(tabId, new Set());
      ports.get(tabId).add(port);
      port.postMessage({ type: "backlog", entries: bufferFor(tabId) });
    } else if (msg?.type === "clear" && typeof msg.tabId === "number") {
      buffers.set(msg.tabId, []);
    }
  });

  port.onDisconnect.addListener(() => {
    if (tabId !== null) {
      const set = ports.get(tabId);
      if (set) set.delete(port);
    }
  });
});
