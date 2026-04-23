import * as XLSX from "xlsx";

// ===== Format =====
const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const fmtIDR = (n) => idr.format(n || 0);

export const fmtTanggal = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const fmtBulan = (m) => {
  if (!m) return "Semua Bulan";
  const [y, mo] = m.split("-");
  if (!mo) return y;
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

// ===== Filters / sort =====
export const filterByMonth = (rows, month) =>
  !month ? rows : rows.filter((r) => r.tanggal.startsWith(month));

export const sortByDateDesc = (rows) =>
  [...rows].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

export const getAvailableMonths = (...rowSets) => {
  const set = new Set();
  for (const rows of rowSets) {
    for (const r of rows) set.add(r.tanggal.slice(0, 7));
  }
  set.add(currentMonth());
  return [...set].sort().reverse();
};

// ===== Domain =====
export const getRokok = (rokokList, nama) =>
  rokokList.find((r) => r.nama === nama);

export const hitungProfit = (rokokList, distribusi) =>
  (distribusi.items || []).reduce((sum, item) => {
    const r = getRokok(rokokList, item.rokok);
    return r ? sum + item.qty * (r.harga_jual - r.harga_beli) : sum;
  }, 0);

export const newId = () => Date.now() + Math.floor(Math.random() * 1000);

// ===== Excel Download =====
export const downloadExcel = (rows, filename, columns) => {
  const header = columns.map((c) => c.label);
  const data = rows.map((r) => columns.map((c) => c.value(r)));
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  // Auto column width
  const colWidths = columns.map((c, ci) => ({
    wch: Math.max(
      c.label.length,
      ...data.map((row) => String(row[ci] ?? "").length)
    ) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : filename + ".xlsx");
};
