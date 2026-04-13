export function DemoNotice() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "0.75rem 1rem",
        fontSize: "0.875rem",
        color: "var(--muted)",
      }}
    >
      <strong style={{ color: "var(--warning)" }}>Демо-режим.</strong> Данные
      хранятся локально; вход — учётки из{" "}
      <code style={{ color: "var(--text)" }}>data/demo-users.ts</code>.
    </div>
  );
}
