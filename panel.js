(() => {
  const state = {
    consoleEntries: [],
    networkEntries: [],
    consoleSelected: new Set(),
    networkSelected: new Set(),
    paused: false,
    showAll: false,
    env: { url: "", viewport: "", userAgent: "" },
    screenshotDataUrl: null,
  };

  let nextConsoleId = 1;
  let nextNetworkId = 1;

  const els = {
    btnToggle: document.getElementById("btnToggle"),
    btnClear: document.getElementById("btnClear"),
    btnScreenshot: document.getElementById("btnScreenshot"),
    btnGenerate: document.getElementById("btnGenerate"),
    count: document.getElementById("count"),
    envBar: document.getElementById("envBar"),

    consoleSelectAll: document.getElementById("consoleSelectAll"),
    consoleCount: document.getElementById("consoleCount"),
    consoleList: document.getElementById("consoleList"),
    consoleEmpty: document.getElementById("consoleEmpty"),

    networkSelectAll: document.getElementById("networkSelectAll"),
    showAllRequests: document.getElementById("showAllRequests"),
    networkCount: document.getElementById("networkCount"),
    networkBody: document.getElementById("networkBody"),
    networkEmpty: document.getElementById("networkEmpty"),

    screenshotSection: document.getElementById("screenshotSection"),
    screenshotPreview: document.getElementById("screenshotPreview"),
    btnRemoveScreenshot: document.getElementById("btnRemoveScreenshot"),

    reportSection: document.getElementById("reportSection"),
    reportOutput: document.getElementById("reportOutput"),
    btnCopyReport: document.getElementById("btnCopyReport"),
    btnDownloadReport: document.getElementById("btnDownloadReport"),
    btnDownloadScreenshot: document.getElementById("btnDownloadScreenshot"),
  };

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  function domainAndPath(url) {
    try {
      const u = new URL(url);
      return { domain: u.host, path: u.pathname + u.search };
    } catch {
      return { domain: "", path: url };
    }
  }

  function fmtTime(ms) {
    if (ms == null || ms < 0) return "-";
    if (ms < 1000) return Math.round(ms) + " ms";
    return (ms / 1000).toFixed(2) + " s";
  }

  function isFailed(r) {
    return r.status === 0 || r.status >= 400;
  }

  // ---------- Environment ----------

  function refreshEnv() {
    chrome.devtools.inspectedWindow.eval(
      "({url: location.href, viewport: innerWidth + 'x' + innerHeight, userAgent: navigator.userAgent})",
      (result) => {
        if (!result) return;
        state.env = result;
        els.envBar.textContent = `${result.url}  •  ${result.viewport}  •  ${result.userAgent}`;
      }
    );
  }

  // ---------- Console capture ----------

  const port = chrome.runtime.connect({ name: "reproreport-panel" });
  port.postMessage({ type: "subscribe", tabId: chrome.devtools.inspectedWindow.tabId });
  port.onMessage.addListener((msg) => {
    if (msg.type === "backlog") {
      for (const entry of msg.entries) addConsoleEntry(entry);
      renderConsole();
    } else if (msg.type === "entry") {
      if (state.paused) return;
      addConsoleEntry(msg.entry);
      renderConsole();
    }
  });

  function addConsoleEntry(entry) {
    state.consoleEntries.push({ id: nextConsoleId++, ...entry });
  }

  function renderConsole() {
    const entries = state.consoleEntries;
    els.consoleCount.textContent = String(entries.length);
    els.consoleEmpty.classList.toggle("visible", entries.length === 0);

    const allSelected = entries.length > 0 && entries.every((e) => state.consoleSelected.has(e.id));
    const someSelected = entries.some((e) => state.consoleSelected.has(e.id));
    els.consoleSelectAll.checked = allSelected;
    els.consoleSelectAll.indeterminate = someSelected && !allSelected;

    els.consoleList.innerHTML = "";
    for (const e of entries) {
      const row = document.createElement("div");
      row.className = "entry";
      const meta = [e.source, e.stack].filter(Boolean).join("\n");
      row.innerHTML = `
        <input type="checkbox" class="entry-select" ${state.consoleSelected.has(e.id) ? "checked" : ""} />
        <div class="entry-body">
          <span class="entry-level level-${e.level}">${e.level.toUpperCase()}</span>
          <span class="entry-message">${escapeHtml(e.message)}</span>
          ${meta ? `<div class="entry-meta">${escapeHtml(meta)}</div>` : ""}
        </div>
      `;
      row.querySelector(".entry-select").addEventListener("change", (ev) => {
        if (ev.target.checked) state.consoleSelected.add(e.id);
        else state.consoleSelected.delete(e.id);
        renderConsole();
      });
      els.consoleList.appendChild(row);
    }
    updateTotalCount();
  }

  els.consoleSelectAll.addEventListener("change", (e) => {
    if (e.target.checked) state.consoleEntries.forEach((c) => state.consoleSelected.add(c.id));
    else state.consoleSelected.clear();
    renderConsole();
  });

  // ---------- Network capture ----------

  chrome.devtools.network.onRequestFinished.addListener((harEntry) => {
    if (state.paused) return;
    const req = harEntry.request;
    const res = harEntry.response;
    const { domain, path } = domainAndPath(req.url);
    state.networkEntries.push({
      id: nextNetworkId++,
      method: req.method,
      url: req.url,
      domain,
      path,
      status: res.status,
      time: harEntry.time,
    });
    renderNetwork();
  });

  chrome.devtools.network.onNavigated.addListener(() => {
    refreshEnv();
  });

  function visibleNetworkEntries() {
    return state.showAll ? state.networkEntries : state.networkEntries.filter(isFailed);
  }

  function renderNetwork() {
    const entries = visibleNetworkEntries();
    els.networkCount.textContent = String(entries.length);
    els.networkEmpty.classList.toggle("visible", entries.length === 0);
    els.networkEmpty.textContent = state.showAll
      ? "No requests captured yet."
      : "No failed requests captured yet.";

    const allSelected = entries.length > 0 && entries.every((r) => state.networkSelected.has(r.id));
    const someSelected = entries.some((r) => state.networkSelected.has(r.id));
    els.networkSelectAll.checked = allSelected;
    els.networkSelectAll.indeterminate = someSelected && !allSelected;

    els.networkBody.innerHTML = "";
    for (const r of entries) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="col-select"><input type="checkbox" class="row-select" ${state.networkSelected.has(r.id) ? "checked" : ""} /></td>
        <td class="method method-${escapeHtml(r.method)}">${escapeHtml(r.method)}</td>
        <td class="${isFailed(r) ? "status-err" : "status-ok"}">${r.status || "-"}</td>
        <td>${escapeHtml(r.domain)}</td>
        <td title="${escapeHtml(r.path)}">${escapeHtml(r.path)}</td>
        <td>${fmtTime(r.time)}</td>
      `;
      tr.querySelector(".row-select").addEventListener("change", (e) => {
        if (e.target.checked) state.networkSelected.add(r.id);
        else state.networkSelected.delete(r.id);
        renderNetwork();
      });
      els.networkBody.appendChild(tr);
    }
    updateTotalCount();
  }

  els.networkSelectAll.addEventListener("change", (e) => {
    const entries = visibleNetworkEntries();
    if (e.target.checked) entries.forEach((r) => state.networkSelected.add(r.id));
    else entries.forEach((r) => state.networkSelected.delete(r.id));
    renderNetwork();
  });

  els.showAllRequests.addEventListener("change", (e) => {
    state.showAll = e.target.checked;
    renderNetwork();
  });

  function updateTotalCount() {
    els.count.textContent = `${state.consoleEntries.length + state.networkEntries.length} items`;
  }

  // ---------- Toolbar ----------

  els.btnToggle.addEventListener("click", () => {
    state.paused = !state.paused;
    els.btnToggle.textContent = state.paused ? "▶ Resume" : "⏸ Pause";
  });

  els.btnClear.addEventListener("click", () => {
    state.consoleEntries = [];
    state.networkEntries = [];
    state.consoleSelected.clear();
    state.networkSelected.clear();
    state.screenshotDataUrl = null;
    port.postMessage({ type: "clear", tabId: chrome.devtools.inspectedWindow.tabId });
    els.screenshotSection.hidden = true;
    els.reportSection.hidden = true;
    renderConsole();
    renderNetwork();
  });

  // ---------- Screenshot ----------

  els.btnScreenshot.addEventListener("click", () => {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) return;
        state.screenshotDataUrl = dataUrl;
        els.screenshotPreview.src = dataUrl;
        els.screenshotSection.hidden = false;
      });
    });
  });

  els.btnRemoveScreenshot.addEventListener("click", () => {
    state.screenshotDataUrl = null;
    els.screenshotSection.hidden = true;
  });

  // ---------- Report generation ----------

  function selectedOrAll(entries, selected) {
    const chosen = entries.filter((e) => selected.has(e.id));
    return chosen.length > 0 ? chosen : entries;
  }

  els.btnGenerate.addEventListener("click", () => {
    const consoleEntries = selectedOrAll(state.consoleEntries, state.consoleSelected);
    const networkEntries = selectedOrAll(visibleNetworkEntries(), state.networkSelected);

    const report = ReportBuilder.build({
      env: state.env,
      consoleEntries,
      networkEntries,
      hasScreenshot: !!state.screenshotDataUrl,
    });

    els.reportOutput.value = report;
    els.reportSection.hidden = false;
    els.btnDownloadScreenshot.hidden = !state.screenshotDataUrl;
  });

  els.btnCopyReport.addEventListener("click", () => {
    navigator.clipboard.writeText(els.reportOutput.value);
  });

  function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  els.btnDownloadReport.addEventListener("click", () => {
    download("bug-report.md", new Blob([els.reportOutput.value], { type: "text/markdown" }));
  });

  els.btnDownloadScreenshot.addEventListener("click", () => {
    if (!state.screenshotDataUrl) return;
    fetch(state.screenshotDataUrl)
      .then((res) => res.blob())
      .then((blob) => download("screenshot.png", blob));
  });

  // ---------- Init ----------

  refreshEnv();
  renderConsole();
  renderNetwork();
})();
