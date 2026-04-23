import { useMemo, useState } from "react";
import { Wallet, TrendingUp, Store, RotateCcw } from "lucide-react";
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
import {
  fmtIDR,
  fmtTanggal,
  currentMonth,
  fmtBulan,
  filterByMonth,
  sortByDateDesc,
  getAvailableMonths,
  hitungProfit,
} from "../utils";
import { Card, KpiCard, MonthFilter, RowActions } from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function Dashboard({ distribusi, retur, rokokList, tokoList }) {
  const [bulan, setBulan] = useState(currentMonth());
  const [detail, setDetail] = useState(null);

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
      (s, d) => s + d.items.reduce((ss, it) => ss + it.qty * it.harga, 0),
      0
    );
    const totalProfit = distribusiF.reduce(
      (s, d) => s + hitungProfit(rokokList, d),
      0
    );
    const totalRetur = returF.reduce(
      (s, r) => s + r.items.reduce((ss, it) => ss + it.qty, 0),
      0
    );
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
      for (const item of d.items) {
        map.set(item.rokok, (map.get(item.rokok) || 0) + item.qty);
      }
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
        <KpiCard icon={Wallet}    label="Total Penjualan" value={fmtIDR(stats.totalPenjualan)} />
        <KpiCard icon={TrendingUp} label="Total Profit"   value={fmtIDR(stats.totalProfit)} />
        <KpiCard icon={Store}     label="Jumlah Toko"     value={stats.jumlahToko.toString()} />
        <KpiCard icon={RotateCcw} label="Total Retur"     value={`${stats.totalRetur} unit`} />
      </div>

      {/* Trend profit — full width */}
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

      {/* Qty per rokok — full width below */}
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

      <Card
        title="Transaksi Distribusi Terakhir"
        subtitle="5 distribusi terbaru berdasarkan tanggal"
      >
        <DataTable
          columns={[
            { key: "no", label: "No", render: (_, idx) => idx + 1 },
            {
              key: "tanggal",
              label: "Tanggal",
              render: (r) => fmtTanggal(r.tanggal),
            },
            { key: "toko", label: "Toko" },
            {
              key: "rokok",
              label: "Rokok",
              render: (r) => (
                <div className="space-y-0.5">
                  {r.items.map((item, i) => (
                    <div key={i} className="text-xs text-neutral-700">
                      {i + 1}. {item.rokok} ×{item.qty}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (r) =>
                fmtIDR(r.items.reduce((s, it) => s + it.qty * it.harga, 0)),
            },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (r) => (
                <RowActions onDetail={() => setDetail(r)} onDelete={undefined} />
              ),
            },
          ]}
          rows={terakhir}
          empty="Belum ada transaksi distribusi."
        />
      </Card>

      {detail && (
        <Modal
          title="Detail Distribusi"
          onClose={() => setDetail(null)}
          width="max-w-lg"
        >
          <DistribusiDetail record={detail} rokokList={rokokList} />
        </Modal>
      )}
    </div>
  );
}

function DistribusiDetail({ record, rokokList }) {
  const total = record.items.reduce((s, it) => s + it.qty * it.harga, 0);
  const profit = hitungProfit(rokokList, record);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Tanggal</p>
          <p className="font-medium">{fmtTanggal(record.tanggal)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Toko</p>
          <p className="font-medium">{record.toko}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Daftar Rokok
        </p>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2 text-left">Rokok</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Harga</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {record.items.map((item, i) => {
                return (
                  <tr key={i} className="border-b border-neutral-100 last:border-0">
                    <td className="px-3 py-2.5">{item.rokok}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{item.qty}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtIDR(item.harga)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtIDR(item.qty * item.harga)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between rounded-lg bg-neutral-50 px-4 py-3 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Total</p>
          <p className="font-semibold">{fmtIDR(total)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Profit</p>
          <p className="font-semibold text-neutral-900">{fmtIDR(profit)}</p>
        </div>
      </div>
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
