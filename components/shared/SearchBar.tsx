import type { ChangeEvent } from "react";

export function SearchBar({
  placeholder = "Поиск…",
  name = "q",
  value,
  onChange,
  disabled,
}: {
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="search"
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      {...(value !== undefined ? { value } : {})}
      className="w-full rounded-xl border border-edge bg-panel-muted/95 px-4 py-3 text-sm text-ink outline-none ring-accent/35 transition-all duration-200 placeholder:text-sub-deep focus:border-accent/45 focus:ring-2 focus:ring-accent/35 focus:ring-offset-2 focus:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}
