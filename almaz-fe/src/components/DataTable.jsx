import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTable({ columns, rows, empty, pageSize }) {
  const [page, setPage] = useState(1);
  const total = rows?.length ?? 0;
  const totalPages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  if (!total) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
        {empty || "Tidak ada data."}
      </div>
    );
  }

  const visible = pageSize
    ? rows.slice((page - 1) * pageSize, page * pageSize)
    : rows;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={
                    "px-3 py-2.5 " +
                    (c.align === "right" ? "text-right" : "text-left")
                  }
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={
                      "px-3 py-3 text-neutral-800 " +
                      (c.align === "right" ? "text-right tabular-nums" : "")
                    }
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onChange={setPage}
        />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, total, pageSize, onChange }) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
      <div className="text-xs text-neutral-500">
        Menampilkan{" "}
        <span className="font-medium text-neutral-700">{start}</span>–
        <span className="font-medium text-neutral-700">{end}</span> dari{" "}
        <span className="font-medium text-neutral-700">{total}</span> data
      </div>
      <div className="flex items-center gap-1">
        <PageNavButton
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          icon={ChevronLeft}
          label="Sebelumnya"
        />
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-2 text-xs text-neutral-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={
                "h-8 min-w-[32px] rounded-md px-2 text-xs font-medium transition " +
                (p === page
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")
              }
            >
              {p}
            </button>
          )
        )}
        <PageNavButton
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          icon={ChevronRight}
          label="Selanjutnya"
        />
      </div>
    </div>
  );
}

function PageNavButton({ onClick, disabled, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
