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
import { Card, KpiCard, MonthFilter } from "../components/ui";
import DataTable from "../components/DataTable";

export default function Dashboard({ distribusi, retur, rokokList, tokoList }) {
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
