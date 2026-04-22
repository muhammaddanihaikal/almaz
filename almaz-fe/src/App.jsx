import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Undo2,
  Plus,
  X,
  TrendingUp,
  Wallet,
  Store,
  RotateCcw,
  Download,
  Calendar,
  Cigarette,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ============== DATA AWAL ==============
const ROKOK_AWAL = [
  { id: 1, nama: "Marlboro Red", harga_beli: 20000, harga_jual: 22500 },
  { id: 2, nama: "Sampoerna Hijau", harga_beli: 18000, harga_jual: 20000 },
  { id: 3, nama: "Dji Sam Soe", harga_beli: 15000, harga_jual: 17000 },
  { id: 4, nama: "Gudang Garam Merah", harga_beli: 16000, harga_jual: 18000 },
];

const TOKO_AWAL = [
  { id: 1, nama: "Warung Mak Siti" },
  { id: 2, nama: "Minimarket Sentosa" },
  { id: 3, nama: "Toko Budi Jaya" },
];

const DISTRIBUSI_AWAL = [
  {
    id: 1,
    tanggal: "2025-04-01",
    toko: "Warung Mak Siti",
    rokok: "Marlboro Red",
    qty: 20,
    harga: 22500,
  },
  {
    id: 2,
    tanggal: "2025-04-02",
    toko: "Minimarket Sentosa",
    rokok: "Sampoerna Hijau",
    qty: 30,
    harga: 20000,
  },
  {
    id: 3,
    tanggal: "2025-04-05",
    toko: "Toko Budi Jaya",
    rokok: "Dji Sam Soe",
    qty: 25,
    harga: 17000,
  },
];

const RETUR_AWAL = [
  {
    id: 1,
    tanggal: "2025-04-08",
    toko: "Warung Mak Siti",
    rokok: "Marlboro Red",
    qty: 3,
    alasan: "Tidak laku",
  },
  {
    id: 2,
    tanggal: "2025-04-10",
    toko: "Toko Budi Jaya",
    rokok: "Dji Sam Soe",
    qty: 5,
    alasan: "Rusak",
  },
];

const ALASAN_RETUR = ["Tidak laku", "Rusak", "Kadaluarsa", "Permintaan toko"];
const PAGE_SIZE = 10;

// ============== HELPERS ==============
const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const fmtIDR = (n) => idr.format(n || 0);

const fmtTanggal = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

const fmtBulan = (m) => {
  if (!m) return "Semua Bulan";
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

const filterByMonth = (rows, month) =>
  !month ? rows : rows.filter((r) => r.tanggal.startsWith(month));

const sortByDateDesc = (rows) =>
  [...rows].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

const getAvailableMonths = (...rowSets) => {
  const set = new Set();
  for (const rows of rowSets) {
    for (const r of rows) set.add(r.tanggal.slice(0, 7));
  }
  set.add(currentMonth());
  return [...set].sort().reverse();
};

const downloadCSV = (rows, filename, columns) => {
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

const getRokok = (rokokList, nama) => rokokList.find((r) => r.nama === nama);

const hitungProfit = (rokokList, row) => {
  const r = getRokok(rokokList, row.rokok);
  if (!r) return 0;
  return row.qty * (r.harga_jual - r.harga_beli);
};

const newId = () => Date.now() + Math.floor(Math.random() * 1000);

// ============== APP ==============
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [rokokList, setRokokList] = useState(ROKOK_AWAL);
  const [tokoList, setTokoList] = useState(TOKO_AWAL);
  const [distribusi, setDistribusi] = useState(DISTRIBUSI_AWAL);
  const [retur, setRetur] = useState(RETUR_AWAL);

  // --- CRUD Rokok (cascade nama ke distribusi & retur saat edit) ---
  const addRokok = (data) =>
    setRokokList((prev) => [...prev, { ...data, id: newId() }]);

  const updateRokok = (id, data) => {
    const old = rokokList.find((r) => r.id === id);
    setRokokList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    if (old && old.nama !== data.nama) {
      setDistribusi((prev) =>
        prev.map((d) =>
          d.rokok === old.nama ? { ...d, rokok: data.nama } : d
        )
      );
      setRetur((prev) =>
        prev.map((r) => (r.rokok === old.nama ? { ...r, rokok: data.nama } : r))
      );
    }
  };

  const deleteRokok = (id) =>
    setRokokList((prev) => prev.filter((r) => r.id !== id));

  // --- CRUD Toko ---
  const addToko = (data) =>
    setTokoList((prev) => [...prev, { ...data, id: newId() }]);

  const updateToko = (id, data) => {
    const old = tokoList.find((t) => t.id === id);
    setTokoList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    if (old && old.nama !== data.nama) {
      setDistribusi((prev) =>
        prev.map((d) => (d.toko === old.nama ? { ...d, toko: data.nama } : d))
      );
      setRetur((prev) =>
        prev.map((r) => (r.toko === old.nama ? { ...r, toko: data.nama } : r))
      );
    }
  };

  const deleteToko = (id) =>
    setTokoList((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header tab={tab} onTabChange={setTab} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "dashboard" && (
          <Dashboard
            distribusi={distribusi}
            retur={retur}
            rokokList={rokokList}
            tokoList={tokoList}
          />
        )}
        {tab === "distribusi" && (
          <DistribusiPage
            distribusi={distribusi}
            rokokList={rokokList}
            tokoList={tokoList}
            onAdd={(row) =>
              setDistribusi((prev) => [{ ...row, id: newId() }, ...prev])
            }
          />
        )}
        {tab === "retur" && (
          <ReturPage
            retur={retur}
            rokokList={rokokList}
            tokoList={tokoList}
            onAdd={(row) =>
              setRetur((prev) => [{ ...row, id: newId() }, ...prev])
            }
          />
        )}
        {tab === "toko" && (
          <TokoPage
            tokoList={tokoList}
            onAdd={addToko}
            onUpdate={updateToko}
            onDelete={deleteToko}
          />
        )}
        {tab === "rokok" && (
          <RokokPage
            rokokList={rokokList}
            onAdd={addRokok}
            onUpdate={updateRokok}
            onDelete={deleteRokok}
          />
        )}
      </main>
    </div>
  );
}

// ============== HEADER / NAV ==============
function Header({ tab, onTabChange }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "distribusi", label: "Distribusi", icon: Package },
    { id: "retur", label: "Retur", icon: Undo2 },
    { id: "toko", label: "Toko", icon: Store },
    { id: "rokok", label: "Rokok", icon: Cigarette },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold tracking-tight text-white">
            A
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">ALMAZ</div>
            <div className="text-xs text-neutral-500">
              Management Penjualan Rokok
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900")
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// ============== DASHBOARD ==============
function Dashboard({ distribusi, retur, rokokList, tokoList }) {
  const [bulan, setBulan] = useState(currentMonth());

  const months = useMemo(
    () => getAvailableMonths(distribusi, retur),
    [distribusi, retur]
  );

  const distribusiF = useMemo(
    () => filterByMonth(distribusi, bulan),
    [distribusi, bulan]
  );
  const returF = useMemo(() => filterByMonth(retur, bulan), [retur, bulan]);

  const stats = useMemo(() => {
    const totalPenjualan = distribusiF.reduce(
      (s, d) => s + d.qty * d.harga,
      0
    );
    const totalProfit = distribusiF.reduce(
      (s, d) => s + hitungProfit(rokokList, d),
      0
    );
    const totalRetur = returF.reduce((s, r) => s + r.qty, 0);
    const jumlahToko = tokoList.length;
    return { totalPenjualan, totalProfit, totalRetur, jumlahToko };
  }, [distribusiF, returF, rokokList, tokoList]);

  const trendProfit = useMemo(() => {
    const map = new Map();
    for (const d of distribusiF) {
      const p = hitungProfit(rokokList, d);
      map.set(d.tanggal, (map.get(d.tanggal) || 0) + p);
    }
    return [...map.entries()]
      .map(([tanggal, profit]) => ({
        tanggal,
        label: fmtTanggal(tanggal),
        profit,
      }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [distribusiF, rokokList]);

  const qtyPerRokok = useMemo(() => {
    const map = new Map();
    for (const d of distribusiF) {
      map.set(d.rokok, (map.get(d.rokok) || 0) + d.qty);
    }
    return rokokList.map((r) => ({
      rokok: r.nama,
      qty: map.get(r.nama) || 0,
    }));
  }, [distribusiF, rokokList]);

  const terakhir = useMemo(
    () => sortByDateDesc(distribusiF).slice(0, 5),
    [distribusiF]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ringkasan performa penjualan dan distribusi rokok
            {bulan ? ` — ${fmtBulan(bulan)}` : " — semua bulan"}.
          </p>
        </div>
        <MonthFilter value={bulan} onChange={setBulan} months={months} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label="Total Penjualan"
          value={fmtIDR(stats.totalPenjualan)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Total Profit"
          value={fmtIDR(stats.totalProfit)}
        />
        <KpiCard
          icon={Store}
          label="Jumlah Toko"
          value={stats.jumlahToko.toString()}
        />
        <KpiCard
          icon={RotateCcw}
          label="Total Retur"
          value={`${stats.totalRetur} unit`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Trend Profit Harian" subtitle="Total profit per tanggal">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendProfit}
                margin={{ top: 10, right: 16, bottom: 0, left: -8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#737373" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#737373" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v) => [fmtIDR(v), "Profit"]}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#111111"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#111111" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Qty Distribusi per Rokok"
          subtitle="Jumlah unit yang didistribusikan"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={qtyPerRokok}
                margin={{ top: 10, right: 16, bottom: 0, left: -8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="rokok"
                  tick={{ fontSize: 11, fill: "#737373" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#737373" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e5e5" }}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v) => [`${v} unit`, "Qty"]}
                />
                <Bar
                  dataKey="qty"
                  fill="#111111"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card
        title="Transaksi Distribusi Terakhir"
        subtitle="5 distribusi terbaru berdasarkan tanggal"
      >
        <DataTable
          columns={[
            {
              key: "tanggal",
              label: "Tanggal",
              render: (r) => fmtTanggal(r.tanggal),
            },
            { key: "toko", label: "Toko" },
            { key: "rokok", label: "Rokok" },
            { key: "qty", label: "Qty", align: "right" },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (r) => fmtIDR(r.qty * r.harga),
            },
          ]}
          rows={terakhir}
          empty="Belum ada transaksi distribusi."
        />
      </Card>
    </div>
  );
}

const chartTooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e5e5e5",
  fontSize: 12,
  padding: "6px 10px",
  background: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

// ============== DISTRIBUSI PAGE ==============
function DistribusiPage({ distribusi, rokokList, tokoList, onAdd }) {
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState(currentMonth());

  const months = useMemo(() => getAvailableMonths(distribusi), [distribusi]);

  const rows = useMemo(
    () => sortByDateDesc(filterByMonth(distribusi, bulan)),
    [distribusi, bulan]
  );

  const handleDownload = () => {
    const label = bulan || "semua-bulan";
    downloadCSV(rows, `distribusi-${label}.csv`, [
      { label: "Tanggal", value: (r) => r.tanggal },
      { label: "Toko", value: (r) => r.toko },
      { label: "Rokok", value: (r) => r.rokok },
      { label: "Qty", value: (r) => r.qty },
      { label: "Harga Satuan", value: (r) => r.harga },
      { label: "Total", value: (r) => r.qty * r.harga },
      { label: "Profit", value: (r) => hitungProfit(rokokList, r) },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distribusi"
        subtitle={`Daftar semua barang keluar ke toko${
          bulan ? ` — ${fmtBulan(bulan)}` : " — semua bulan"
        }.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MonthFilter value={bulan} onChange={setBulan} months={months} />
            <DownloadButton onClick={handleDownload} disabled={!rows.length} />
            <PrimaryButton onClick={() => setOpen(true)} icon={Plus}>
              Input Distribusi
            </PrimaryButton>
          </div>
        }
      />

      <Card>
        <DataTable
          key={bulan}
          pageSize={PAGE_SIZE}
          columns={[
            {
              key: "tanggal",
              label: "Tanggal",
              render: (r) => fmtTanggal(r.tanggal),
            },
            { key: "toko", label: "Toko" },
            { key: "rokok", label: "Rokok" },
            { key: "qty", label: "Qty", align: "right" },
            {
              key: "harga",
              label: "Harga Satuan",
              align: "right",
              render: (r) => fmtIDR(r.harga),
            },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (r) => fmtIDR(r.qty * r.harga),
            },
            {
              key: "profit",
              label: "Profit",
              align: "right",
              render: (r) => (
                <span className="font-medium text-neutral-900">
                  {fmtIDR(hitungProfit(rokokList, r))}
                </span>
              ),
            },
          ]}
          rows={rows}
          empty={
            bulan
              ? `Tidak ada distribusi di ${fmtBulan(bulan)}.`
              : "Belum ada distribusi."
          }
        />
      </Card>

      {open && (
        <Modal title="Input Distribusi" onClose={() => setOpen(false)}>
          <DistribusiForm
            rokokList={rokokList}
            tokoList={tokoList}
            onSubmit={(row) => {
              onAdd(row);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function DistribusiForm({ rokokList, tokoList, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [toko, setToko] = useState("");
  const [rokok, setRokok] = useState("");
  const [qty, setQty] = useState("");

  const hargaOtomatis = rokok
    ? getRokok(rokokList, rokok)?.harga_jual ?? 0
    : 0;
  const valid =
    tanggal && toko && rokok && Number(qty) > 0 && hargaOtomatis > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      tanggal,
      toko,
      rokok,
      qty: Number(qty),
      harga: hargaOtomatis,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Tanggal">
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className={inputCls}
          required
        />
      </Field>
      <Field label="Toko">
        <select
          value={toko}
          onChange={(e) => setToko(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Pilih toko</option>
          {tokoList.map((t) => (
            <option key={t.id} value={t.nama}>
              {t.nama}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Rokok">
        <select
          value={rokok}
          onChange={(e) => setRokok(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Pilih rokok</option>
          {rokokList.map((r) => (
            <option key={r.id} value={r.nama}>
              {r.nama}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Qty">
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Harga Satuan">
          <input
            type="text"
            value={rokok ? fmtIDR(hargaOtomatis) : ""}
            placeholder="Otomatis"
            className={inputCls + " bg-neutral-50 text-neutral-500"}
            readOnly
          />
        </Field>
      </div>
      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel="Simpan Distribusi"
      />
    </form>
  );
}

// ============== RETUR PAGE ==============
function ReturPage({ retur, rokokList, tokoList, onAdd }) {
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState(currentMonth());

  const months = useMemo(() => getAvailableMonths(retur), [retur]);

  const rows = useMemo(
    () => sortByDateDesc(filterByMonth(retur, bulan)),
    [retur, bulan]
  );

  const handleDownload = () => {
    const label = bulan || "semua-bulan";
    downloadCSV(rows, `retur-${label}.csv`, [
      { label: "Tanggal", value: (r) => r.tanggal },
      { label: "Toko", value: (r) => r.toko },
      { label: "Rokok", value: (r) => r.rokok },
      { label: "Qty", value: (r) => r.qty },
      { label: "Alasan", value: (r) => r.alasan },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retur"
        subtitle={`Daftar barang yang dikembalikan dari toko${
          bulan ? ` — ${fmtBulan(bulan)}` : " — semua bulan"
        }.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MonthFilter value={bulan} onChange={setBulan} months={months} />
            <DownloadButton onClick={handleDownload} disabled={!rows.length} />
            <PrimaryButton onClick={() => setOpen(true)} icon={Plus}>
              Input Retur
            </PrimaryButton>
          </div>
        }
      />

      <Card>
        <DataTable
          key={bulan}
          pageSize={PAGE_SIZE}
          columns={[
            {
              key: "tanggal",
              label: "Tanggal",
              render: (r) => fmtTanggal(r.tanggal),
            },
            { key: "toko", label: "Toko" },
            { key: "rokok", label: "Rokok" },
            { key: "qty", label: "Qty", align: "right" },
            {
              key: "alasan",
              label: "Alasan",
              render: (r) => <Badge>{r.alasan}</Badge>,
            },
          ]}
          rows={rows}
          empty={
            bulan
              ? `Tidak ada retur di ${fmtBulan(bulan)}.`
              : "Belum ada retur."
          }
        />
      </Card>

      {open && (
        <Modal title="Input Retur" onClose={() => setOpen(false)}>
          <ReturForm
            rokokList={rokokList}
            tokoList={tokoList}
            onSubmit={(row) => {
              onAdd(row);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function ReturForm({ rokokList, tokoList, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [toko, setToko] = useState("");
  const [rokok, setRokok] = useState("");
  const [qty, setQty] = useState("");
  const [alasan, setAlasan] = useState("");

  const valid = tanggal && toko && rokok && Number(qty) > 0 && alasan;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      tanggal,
      toko,
      rokok,
      qty: Number(qty),
      alasan,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Tanggal">
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className={inputCls}
          required
        />
      </Field>
      <Field label="Toko">
        <select
          value={toko}
          onChange={(e) => setToko(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Pilih toko</option>
          {tokoList.map((t) => (
            <option key={t.id} value={t.nama}>
              {t.nama}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Rokok">
        <select
          value={rokok}
          onChange={(e) => setRokok(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Pilih rokok</option>
          {rokokList.map((r) => (
            <option key={r.id} value={r.nama}>
              {r.nama}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Qty">
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          className={inputCls}
          required
        />
      </Field>
      <Field label="Alasan">
        <select
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Pilih alasan</option>
          {ALASAN_RETUR.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>
      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel="Simpan Retur"
      />
    </form>
  );
}

// ============== TOKO PAGE ==============
function TokoPage({ tokoList, onAdd, onUpdate, onDelete }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...tokoList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [tokoList]
  );

  const close = () => {
    setMode(null);
    setEditing(null);
  };

  const handleDelete = (t) => {
    if (window.confirm(`Hapus toko "${t.nama}"?\n\nData distribusi & retur tidak akan ikut terhapus.`)) {
      onDelete(t.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Toko"
        subtitle={`${tokoList.length} toko terdaftar sebagai tujuan distribusi.`}
        action={
          <PrimaryButton
            onClick={() => {
              setEditing(null);
              setMode("add");
            }}
            icon={Plus}
          >
            Tambah Toko
          </PrimaryButton>
        }
      />

      <Card>
        <DataTable
          pageSize={PAGE_SIZE}
          columns={[
            { key: "nama", label: "Nama Toko" },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (r) => (
                <RowActions
                  onEdit={() => {
                    setEditing(r);
                    setMode("edit");
                  }}
                  onDelete={() => handleDelete(r)}
                />
              ),
            },
          ]}
          rows={rows}
          empty="Belum ada toko."
        />
      </Card>

      {mode && (
        <Modal
          title={mode === "add" ? "Tambah Toko" : "Edit Toko"}
          onClose={close}
        >
          <TokoForm
            initial={editing}
            onSubmit={(data) => {
              if (mode === "add") onAdd(data);
              else onUpdate(editing.id, data);
              close();
            }}
            onCancel={close}
          />
        </Modal>
      )}
    </div>
  );
}

function TokoForm({ initial, onSubmit, onCancel }) {
  const [nama, setNama] = useState(initial?.nama || "");
  const valid = nama.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ nama: nama.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nama Toko">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Misal: Warung Mak Siti"
          className={inputCls}
          autoFocus
          required
        />
      </Field>
      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : "Tambah Toko"}
      />
    </form>
  );
}

// ============== ROKOK PAGE ==============
function RokokPage({ rokokList, onAdd, onUpdate, onDelete }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...rokokList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [rokokList]
  );

  const close = () => {
    setMode(null);
    setEditing(null);
  };

  const handleDelete = (r) => {
    if (window.confirm(`Hapus rokok "${r.nama}"?\n\nData distribusi & retur tidak akan ikut terhapus.`)) {
      onDelete(r.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rokok"
        subtitle={`${rokokList.length} jenis rokok terdaftar di master data.`}
        action={
          <PrimaryButton
            onClick={() => {
              setEditing(null);
              setMode("add");
            }}
            icon={Plus}
          >
            Tambah Rokok
          </PrimaryButton>
        }
      />

      <Card>
        <DataTable
          pageSize={PAGE_SIZE}
          columns={[
            { key: "nama", label: "Nama Rokok" },
            {
              key: "harga_beli",
              label: "Harga Beli",
              align: "right",
              render: (r) => fmtIDR(r.harga_beli),
            },
            {
              key: "harga_jual",
              label: "Harga Jual",
              align: "right",
              render: (r) => fmtIDR(r.harga_jual),
            },
            {
              key: "margin",
              label: "Margin",
              align: "right",
              render: (r) => (
                <span className="font-medium text-neutral-900">
                  {fmtIDR(r.harga_jual - r.harga_beli)}
                </span>
              ),
            },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (r) => (
                <RowActions
                  onEdit={() => {
                    setEditing(r);
                    setMode("edit");
                  }}
                  onDelete={() => handleDelete(r)}
                />
              ),
            },
          ]}
          rows={rows}
          empty="Belum ada rokok."
        />
      </Card>

      {mode && (
        <Modal
          title={mode === "add" ? "Tambah Rokok" : "Edit Rokok"}
          onClose={close}
        >
          <RokokForm
            initial={editing}
            onSubmit={(data) => {
              if (mode === "add") onAdd(data);
              else onUpdate(editing.id, data);
              close();
            }}
            onCancel={close}
          />
        </Modal>
      )}
    </div>
  );
}

function RokokForm({ initial, onSubmit, onCancel }) {
  const [nama, setNama] = useState(initial?.nama || "");
  const [hargaBeli, setHargaBeli] = useState(
    initial?.harga_beli?.toString() || ""
  );
  const [hargaJual, setHargaJual] = useState(
    initial?.harga_jual?.toString() || ""
  );

  const hb = Number(hargaBeli);
  const hj = Number(hargaJual);
  const valid =
    nama.trim().length > 0 &&
    hargaBeli !== "" &&
    hargaJual !== "" &&
    hb >= 0 &&
    hj >= 0;

  const margin = valid ? hj - hb : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      nama: nama.trim(),
      harga_beli: hb,
      harga_jual: hj,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nama Rokok">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Misal: Marlboro Red"
          className={inputCls}
          autoFocus
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga Beli">
          <input
            type="number"
            min="0"
            value={hargaBeli}
            onChange={(e) => setHargaBeli(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Harga Jual">
          <input
            type="number"
            min="0"
            value={hargaJual}
            onChange={(e) => setHargaJual(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
      </div>
      {valid && (
        <div
          className={
            "rounded-lg border px-3 py-2 text-xs " +
            (margin < 0
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-neutral-200 bg-neutral-50 text-neutral-600")
          }
        >
          Margin per unit:{" "}
          <span className="font-semibold">{fmtIDR(margin)}</span>
          {margin < 0 && " — harga jual lebih rendah dari harga beli."}
        </div>
      )}
      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : "Tambah Rokok"}
      />
    </form>
  );
}

// ============== SHARED UI ==============
const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function FormActions({ onCancel, disabled, submitLabel }) {
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

function PageHeader({ title, subtitle, action }) {
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

function PrimaryButton({ onClick, icon: Icon, children }) {
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

function MonthFilter({ value, onChange, months }) {
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

function DownloadButton({ onClick, disabled }) {
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

function RowActions({ onEdit, onDelete }) {
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

function IconButton({ onClick, icon: Icon, label, variant }) {
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

function Card({ title, subtitle, children }) {
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

function KpiCard({ icon: Icon, label, value }) {
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

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-700">
      {children}
    </span>
  );
}

// ============== DATA TABLE + PAGINATION ==============
function DataTable({ columns, rows, empty, pageSize }) {
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
        Menampilkan <span className="font-medium text-neutral-700">{start}</span>
        –<span className="font-medium text-neutral-700">{end}</span> dari{" "}
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
            <span
              key={`gap-${i}`}
              className="px-2 text-xs text-neutral-400"
            >
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

// ============== MODAL (no blur) ==============
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Lengkapi formulir di bawah ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
