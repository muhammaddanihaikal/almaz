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

// ===== CSV Download =====
export const downloadCSV = (rows, filename, columns) => {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => esc(c.value(r))).join(","))
    .join("\n");
  const csv = "﻿" + head + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
