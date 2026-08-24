(() => {
  const CHANNEL = "reproreport-page";

  function post(entry) {
    try {
      window.postMessage({ channel: CHANNEL, entry }, "*");
    } catch {
      // page has a locked-down CSP for postMessage targets or is unloading; drop silently
    }
  }

  function serializeArg(arg) {
    if (arg instanceof Error) {
      return arg.stack || `${arg.name}: ${arg.message}`;
    }
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }

  for (const level of ["error", "warn"]) {
    const original = console[level];
    console[level] = function (...args) {
      post({
        kind: "console",
        level,
        message: args.map(serializeArg).join(" "),
        time: Date.now(),
      });
      return original.apply(console, args);
    };
  }

  window.addEventListener("error", (e) => {
    post({
      kind: "exception",
      level: "error",
      message: e.message || "Uncaught error",
      source: e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : "",
      stack: e.error && e.error.stack ? e.error.stack : "",
      time: Date.now(),
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    post({
      kind: "rejection",
      level: "error",
      message: "Unhandled promise rejection: " + serializeArg(reason),
      stack: reason && reason.stack ? reason.stack : "",
      time: Date.now(),
    });
  });
})();
