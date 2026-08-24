const ReportBuilder = (() => {
  function fmtTime(ms) {
    if (ms == null || ms < 0) return "-";
    if (ms < 1000) return Math.round(ms) + " ms";
    return (ms / 1000).toFixed(2) + " s";
  }

  function consoleSection(entries) {
    if (entries.length === 0) return "_None captured._";
    return entries
      .map((e) => {
        const ts = new Date(e.time).toLocaleTimeString();
        const lines = [`- **[${e.level.toUpperCase()}]** ${ts} — ${e.message}`];
        if (e.source) lines.push(`  - at \`${e.source}\``);
        if (e.stack) lines.push("  ```\n" + e.stack.trim() + "\n  ```");
        return lines.join("\n");
      })
      .join("\n");
  }

  function networkSection(entries) {
    if (entries.length === 0) return "_None captured._";
    return entries
      .map((r) => {
        const status = r.status || "(no response)";
        return `- **${r.method}** \`${r.url}\` → **${status}** (${fmtTime(r.time)})`;
      })
      .join("\n");
  }

  function build({ env, consoleEntries, networkEntries, hasScreenshot }) {
    const parts = [
      "# Bug Report",
      "",
      "## Environment",
      `- **URL:** ${env.url || "-"}`,
      `- **Viewport:** ${env.viewport || "-"}`,
      `- **User Agent:** ${env.userAgent || "-"}`,
      `- **Captured:** ${new Date().toLocaleString()}`,
      "",
      "## Steps to Reproduce",
      "1. _(fill in)_",
      "",
      "## Expected Result",
      "_(fill in)_",
      "",
      "## Actual Result",
      "_(fill in)_",
      "",
      `## Console Errors & Warnings (${consoleEntries.length})`,
      consoleSection(consoleEntries),
      "",
      `## Failed Network Requests (${networkEntries.length})`,
      networkSection(networkEntries),
    ];

    if (hasScreenshot) {
      parts.push("", "## Screenshot", "_Attached separately (screenshot.png)._");
    }

    parts.push("", "---", "_Generated with ReproReport — nothing in this report was sent anywhere._");

    return parts.join("\n");
  }

  return { build };
})();
