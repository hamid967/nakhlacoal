import { useEffect, useState } from "react";

type LogEntry = {
  id: number;
  time: string;
  level: "error" | "warn" | "unhandledrejection" | "window.error";
  message: string;
  stack?: string;
  source?: string;
};

let counter = 0;
const listeners = new Set<(e: LogEntry) => void>();
const buffer: LogEntry[] = [];
const MAX = 100;

function push(entry: Omit<LogEntry, "id" | "time">) {
  const full: LogEntry = {
    ...entry,
    id: ++counter,
    time: new Date().toLocaleTimeString(),
  };
  buffer.push(full);
  if (buffer.length > MAX) buffer.shift();
  listeners.forEach((l) => l(full));
}

let installed = false;
function install() {
  if (installed) return;
  installed = true;

  const origError = console.error.bind(console);
  const origWarn = console.warn.bind(console);

  console.error = (...args: unknown[]) => {
    const errArg = args.find((a) => a instanceof Error) as Error | undefined;
    push({
      level: "error",
      message: args.map(fmt).join(" "),
      stack: errArg?.stack,
    });
    origError(...args);
  };
  console.warn = (...args: unknown[]) => {
    push({ level: "warn", message: args.map(fmt).join(" ") });
    origWarn(...args);
  };

  window.addEventListener("error", (e) => {
    push({
      level: "window.error",
      message: e.message || String(e.error),
      stack: e.error?.stack,
      source: e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : undefined,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    push({
      level: "unhandledrejection",
      message: reason?.message ?? String(reason),
      stack: reason?.stack,
    });
  });
}

function fmt(v: unknown): string {
  if (v instanceof Error) return v.message;
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function DevErrorPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>(buffer.slice());
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    install();
    const l = (e: LogEntry) => setEntries((prev) => [...prev.slice(-MAX + 1), e]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const errorCount = entries.filter((e) => e.level !== "warn").length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle error log panel"
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          zIndex: 2147483646,
          background: errorCount ? "#b91c1c" : "#111827",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 999,
          padding: "6px 12px",
          fontSize: 12,
          fontFamily: "ui-monospace, monospace",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        🐞 {errorCount}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Error log"
          style={{
            position: "fixed",
            bottom: 56,
            left: 12,
            width: "min(560px, calc(100vw - 24px))",
            maxHeight: "60vh",
            zIndex: 2147483647,
            background: "#0b0f19",
            color: "#e5e7eb",
            border: "1px solid #1f2937",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              borderBottom: "1px solid #1f2937",
            }}
          >
            <strong>Error Log ({entries.length})</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  buffer.length = 0;
                  setEntries([]);
                  setExpanded(null);
                }}
                style={btnStyle}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = entries
                    .map(
                      (e) =>
                        `[${e.time}] ${e.level}: ${e.message}${e.source ? `\n  @ ${e.source}` : ""}${e.stack ? `\n${e.stack}` : ""}`,
                    )
                    .join("\n\n");
                  navigator.clipboard?.writeText(text);
                }}
                style={btnStyle}
              >
                Copy all
              </button>
              <button type="button" onClick={() => setOpen(false)} style={btnStyle}>
                Close
              </button>
            </div>
          </header>

          <div style={{ overflow: "auto", padding: 4 }}>
            {entries.length === 0 && (
              <div style={{ padding: 12, opacity: 0.6 }}>No errors captured yet.</div>
            )}
            {entries
              .slice()
              .reverse()
              .map((e) => {
                const color =
                  e.level === "warn"
                    ? "#f59e0b"
                    : e.level === "unhandledrejection"
                      ? "#f472b6"
                      : "#ef4444";
                const isOpen = expanded === e.id;
                return (
                  <div
                    key={e.id}
                    style={{
                      borderBottom: "1px solid #111827",
                      padding: "6px 10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : e.id)}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "block",
                        width: "100%",
                      }}
                    >
                      <span style={{ color, marginRight: 8 }}>[{e.level}]</span>
                      <span style={{ opacity: 0.6, marginRight: 8 }}>{e.time}</span>
                      <span>{e.message}</span>
                    </button>
                    {isOpen && (
                      <pre
                        style={{
                          margin: "6px 0 0",
                          padding: 8,
                          background: "#020617",
                          borderRadius: 6,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          maxHeight: 240,
                          overflow: "auto",
                        }}
                      >
                        {e.source ? `@ ${e.source}\n` : ""}
                        {e.stack || "(no stack trace)"}
                      </pre>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#1f2937",
  color: "#e5e7eb",
  border: "1px solid #374151",
  borderRadius: 6,
  padding: "3px 8px",
  fontSize: 11,
  cursor: "pointer",
  fontFamily: "inherit",
};
