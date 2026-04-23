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

export const getDateRanges = () => {
  const today = new Date();
  
  // Hari Ini
  const todayStr = today.toISOString().split("T")[0];
  
  // Minggu Ini (Senin sampai Minggu)
  const day = today.getDay();
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  // Bulan Ini
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const fmt = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    hari_ini: { start: fmt(today), end: fmt(today) },
    minggu_ini: { start: fmt(startOfWeek), end: fmt(endOfWeek) },
    bulan_ini: { start: fmt(startOfMonth), end: fmt(endOfMonth) },
  };
};

// ===== Filters / sort =====
export const filterByDateRange = (rows, range) => {
  if (!range || !range.start || !range.end) return rows;
  return rows.filter((r) => r.tanggal >= range.start && r.tanggal <= range.end);
};

export const defaultDateRange = (type = "bulan_ini") => {
  const ranges = getDateRanges();
  return { preset: type, ...ranges[type] };
};

export const sortByDateDesc = (rows) =>
  [...rows].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
// ===== Domain =====
export const getRokok = (rokokList, nama) =>
  rokokList.find((r) => r.nama === nama);

export const hitungProfit = (rokokList, distribusi) =>
  (distribusi.items || []).reduce((sum, item) => {
    const r = getRokok(rokokList, item.rokok);
    return r ? sum + item.qty * ((item.harga || 0) - r.harga_beli) : sum;
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
