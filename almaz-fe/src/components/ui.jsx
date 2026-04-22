import {
  Calendar,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import { fmtBulan } from "../utils";

export const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      {children}
    </label>
  );
}

export function FormActions({ onCancel, disabled, submitLabel }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {submitLabel}
      </button>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700"
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={2.5} />}
      {children}
    </button>
  );
}

export function MonthFilter({ value, onChange, months }) {
  return (
    <div className="relative">
      <Calendar
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        strokeWidth={2}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[38px] cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white pl-9 pr-8 text-sm font-medium text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
      >
        <option value="">Semua Bulan</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {fmtBulan(m)}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
      </svg>
    </div>
  );
}

export function DownloadButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Download data sebagai CSV"
      className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" strokeWidth={2} />
      Download CSV
    </button>
  );
}

export function IconButton({ onClick, icon: Icon, label, variant }) {
  const base =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent transition";
  const look =
    variant === "danger"
      ? "text-neutral-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      : "text-neutral-500 hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900";
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={base + " " + look}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton onClick={onEdit} icon={Pencil} label="Edit" />
      <IconButton
        onClick={onDelete}
        icon={Trash2}
        label="Hapus"
        variant="danger"
      />
    </div>
  );
}

export function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {(title || subtitle) && (
        <header className="mb-4">
          {title && (
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

export function KpiCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-700">
      {children}
    </span>
  );
}
