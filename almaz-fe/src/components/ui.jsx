import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  Download,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { fmtBulan } from "../utils";

export const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

export function SelectInput({ value, onChange, required, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={inputCls + " appearance-none pr-8"}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        strokeWidth={2}
      />
    </div>
  );
}

export function SearchableSelect({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div ref={wrapperRef} className="relative">
      <div 
        className={`${inputCls} cursor-pointer flex justify-between items-center pr-2 ${!selectedOption && placeholder ? 'text-neutral-500' : ''}`}
        onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder || 'Pilih...'}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="px-2 pb-2 pt-1 sticky top-0 bg-white border-b border-neutral-100">
            <input
              type="text"
              autoFocus
              className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto pt-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500">Tidak ditemukan</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-neutral-100 ${
                    String(value) === String(opt.value) ? 'bg-neutral-50 font-medium text-neutral-900' : 'text-neutral-700'
                  }`}
                  onClick={() => {
                    onChange({ target: { value: opt.value } });
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [year, monthStr] = value ? value.split('-') : ['', ''];
  const month = monthStr || '';

  const handleMonthChange = (newMonth) => {
    if (!newMonth) {
      onChange(year ? year : '');
    } else {
      const y = year || new Date().getFullYear().toString();
      onChange(`${y}-${newMonth}`);
    }
  };

  const handleYearChange = (newYear) => {
    if (!newYear) {
      onChange('');
    } else {
      onChange(month ? `${newYear}-${month}` : newYear);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative">
        <Calendar
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          strokeWidth={2}
        />
        <select
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="h-[38px] cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white pl-9 pr-8 text-sm font-medium text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
        >
          <option value="">Bulan</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const monthStr = String(m).padStart(2, '0');
            return (
              <option key={m} value={monthStr}>
                {fmtBulan(`2026-${monthStr}`).split(' ')[0]}
              </option>
            );
          })}
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

      <div className="relative">
        <select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          className="h-[38px] cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-8 text-sm font-medium text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
        >
          <option value="">Tahun</option>
          {[2026, 2027, 2028, 2029, 2030].map((y) => (
            <option key={y} value={String(y)}>
              {y}
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

export function RowActions({ onDetail, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      {onDetail && <IconButton onClick={onDetail} icon={Eye}    label="Detail" />}
      {onEdit   && <IconButton onClick={onEdit}   icon={Pencil} label="Edit" />}
      {onDelete && <IconButton onClick={onDelete} icon={Trash2} label="Hapus" variant="danger" />}
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
