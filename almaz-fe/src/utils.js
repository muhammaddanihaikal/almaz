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
// value(row, index) — index is 0-based row number (excludes meta/header rows)
const buildSheet = (rows, columns, meta = [], options = {}) => {
  const header = columns.map((c) => c.label);
  const data = rows.map((r, i) => columns.map((c) => c.value(r, i)));

  const sheetRows = [];
  if (meta.length > 0) {
    meta.forEach(([label, value]) => sheetRows.push([label, value ?? ""]));
    sheetRows.push([]);
  }
  sheetRows.push(header);
  data.forEach((row) => sheetRows.push(row));

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);

  const colWidths = columns.map((c, ci) => {
    const dataMax = data.length > 0
      ? Math.max(...data.map((row) => String(row[ci] ?? "").length))
      : 0;
    return { wch: Math.max(c.label.length, dataMax) + 2 };
  });
  if (meta.length > 0 && colWidths.length >= 2) {
    colWidths[0].wch = Math.max(colWidths[0].wch, ...meta.map(([l]) => String(l).length + 2));
    colWidths[1].wch = Math.max(colWidths[1].wch, ...meta.map(([, v]) => String(v ?? "").length + 2));
  }
  ws["!cols"] = colWidths;

  if (options.centered && ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[addr]) ws[addr].s = { alignment: { horizontal: "center", vertical: "center" } };
      }
    }
  }

  return ws;
};

// Single-sheet download
export const downloadExcel = (rows, filename, columns, meta = []) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(rows, columns, meta), "Data");
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : filename + ".xlsx");
};

// Multi-sheet download: sheets = [{ name, rows, columns, meta?, centered? }]
export const downloadExcelMultiSheet = (sheets, filename) => {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows, columns, meta = [], centered = false }) => {
    XLSX.utils.book_append_sheet(wb, buildSheet(rows, columns, meta, { centered }), name);
  });
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : filename + ".xlsx");
};
