import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  fmtIDR,
  fmtTanggal,
  currentMonth,
  fmtBulan,
  filterByMonth,
  sortByDateDesc,
  getAvailableMonths,
  hitungProfit,
  downloadExcel,
  getRokok,
} from "../utils";
import { PAGE_SIZE } from "../data";
import {
  Card,
  PageHeader,
  MonthFilter,
  DownloadButton,
  PrimaryButton,
  Field,
  FormActions,
  SelectInput,
  SearchableSelect,
  inputCls,
  RowActions,
  IconButton,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function DistribusiPage({
  distribusi,
  rokokList,
  tokoList,
  salesList,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [bulan, setBulan] = useState(currentMonth());

  const months = useMemo(() => getAvailableMonths(distribusi), [distribusi]);

  const [tokoFilter, setTokoFilter] = useState("");

  const rows = useMemo(() => {
    let filtered = filterByMonth(distribusi, bulan);
    if (tokoFilter) filtered = filtered.filter((r) => r.toko === tokoFilter);
    return sortByDateDesc(filtered);
  }, [distribusi, bulan, tokoFilter]);

  const handleDownload = () => {
    const label = bulan || "semua-bulan";
    const flat = rows.flatMap((d) =>
      d.items.map((it) => ({
        tanggal: d.tanggal,
        toko: d.toko,
        sales: d.sales || "",
        rokok: it.rokok,
        qty: it.qty,
        harga: it.harga,
        total: it.qty * it.harga,
        profit:
          it.qty *
          ((getRokok(rokokList, it.rokok)?.harga_jual || 0) -
            (getRokok(rokokList, it.rokok)?.harga_beli || 0)),
      }))
    );
    downloadExcel(flat, `distribusi-${label}`, [
      { label: "Tanggal",      value: (r) => r.tanggal },
      { label: "Toko",         value: (r) => r.toko },
      { label: "Sales",        value: (r) => r.sales },
      { label: "Rokok",        value: (r) => r.rokok },
      { label: "Qty",          value: (r) => r.qty },
      { label: "Harga Satuan", value: (r) => r.harga },
      { label: "Total",        value: (r) => r.total },
      { label: "Profit",       value: (r) => r.profit },
    ]);
  };

  const close = () => { setMode(null); setEditing(null); };

  const handleDelete = (r) => {
    const names = r.items.map((it) => it.rokok).join(", ");
    if (window.confirm(`Hapus distribusi ke "${r.toko}"?\n(${names})`))
      onDelete(r.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distribusi"
        subtitle={`Daftar semua barang keluar ke toko${
          bulan ? ` — ${fmtBulan(bulan)}` : " — semua bulan"
        }${tokoFilter ? ` (${tokoFilter})` : ""}.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DownloadButton onClick={handleDownload} disabled={!rows.length} />
            <PrimaryButton onClick={() => { setEditing(null); setMode("add"); }} icon={Plus}>
              Input Distribusi
            </PrimaryButton>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-neutral-600">Bulan:</label>
          <MonthFilter value={bulan} onChange={setBulan} months={months} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-neutral-600">Toko:</label>
          <div className="w-56">
            <SearchableSelect
              value={tokoFilter}
              onChange={(e) => setTokoFilter(e.target.value)}
              placeholder="Semua Toko"
              options={[
                { value: "", label: "Semua Toko" },
                ...tokoList.map((t) => ({ value: t.nama, label: t.nama })),
              ]}
            />
          </div>
        </div>
      </div>

      <Card>
        <DataTable
          key={`${bulan}-${tokoFilter}`}
          pageSize={PAGE_SIZE}
          columns={[
            { key: "no",      label: "No",      render: (_, idx) => idx + 1 },
            { key: "tanggal", label: "Tanggal", render: (r) => fmtTanggal(r.tanggal) },
            { key: "toko",    label: "Toko" },
            { key: "sales",   label: "Sales",   render: (r) => r.sales || <span className="text-neutral-400">—</span> },
            {
              key: "items",
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
              render: (r) => fmtIDR(r.items.reduce((s, it) => s + it.qty * it.harga, 0)),
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
            {
              key: "actions",
              label: "",
              align: "right",
              render: (r) => (
                <RowActions
                  onDetail={() => setDetail(r)}
                  onEdit={() => { setEditing(r); setMode("edit"); }}
                  onDelete={() => handleDelete(r)}
                />
              ),
            },
          ]}
          rows={rows}
          empty={bulan ? `Tidak ada distribusi di ${fmtBulan(bulan)}.` : "Belum ada distribusi."}
        />
      </Card>

      {detail && (
        <Modal title="Detail Distribusi" onClose={() => setDetail(null)} width="max-w-lg">
          <DistribusiDetail record={detail} rokokList={rokokList} />
        </Modal>
      )}

      {mode && (
        <Modal
          title={mode === "add" ? "Input Distribusi" : "Edit Distribusi"}
          onClose={close}
          width="max-w-2xl"
        >
          <DistribusiForm
            initial={editing}
            existing={distribusi}
            rokokList={rokokList}
            tokoList={tokoList}
            salesList={salesList}
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

function DistribusiDetail({ record, rokokList }) {
  const total    = record.items.reduce((s, it) => s + it.qty * it.harga, 0);
  const totalQty = record.items.reduce((s, it) => s + it.qty, 0);
  const profit   = hitungProfit(rokokList, record);

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
        {record.sales && (
          <div>
            <p className="text-xs text-neutral-500">Sales</p>
            <p className="font-medium">{record.sales}</p>
          </div>
        )}
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
                <th className="px-3 py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {record.items.map((item, i) => {
                const r = getRokok(rokokList, item.rokok);
                const itemProfit = r ? item.qty * (r.harga_jual - r.harga_beli) : 0;
                return (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="px-3 py-2.5">{item.rokok}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{item.qty}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtIDR(item.harga)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtIDR(item.qty * item.harga)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-neutral-600">{fmtIDR(itemProfit)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-neutral-200 bg-neutral-50">
                <td colSpan="1" className="px-3 py-2.5 text-xs font-semibold text-neutral-500">Total</td>
                <td className="px-3 py-2.5 text-right text-xs font-semibold text-neutral-900 tabular-nums">{totalQty}</td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5 text-right text-xs font-semibold text-neutral-900 tabular-nums">{fmtIDR(total)}</td>
                <td className="px-3 py-2.5 text-right text-xs font-semibold text-neutral-900 tabular-nums">{fmtIDR(profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DistribusiForm({ initial, existing, rokokList, tokoList, salesList, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(initial?.tanggal || today);
  const [toko, setToko]       = useState(initial?.toko || "");
  const [sales, setSales]     = useState(initial?.sales || "");
  const [items, setItems] = useState(
    initial
      ? initial.items.map((it) => ({ ...it }))
      : [{ rokok: "", qty: "" }, { rokok: "", qty: "" }]
  );

  const addItem    = () => setItems([...items, { rokok: "", qty: "" }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) =>
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));

  const isDuplicate =
    tanggal &&
    toko &&
    (existing || []).some(
      (d) => d.tanggal === tanggal && d.toko === toko && d.id !== initial?.id
    );

  const valid =
    !isDuplicate &&
    tanggal &&
    toko &&
    items.length > 0 &&
    items.every((it) => it.rokok && Number(it.qty) > 0);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      tanggal,
      toko,
      sales,
      items: items.map((it) => ({
        rokok: it.rokok,
        qty: Number(it.qty),
        harga: getRokok(rokokList, it.rokok)?.harga_jual || 0,
      })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tanggal">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputCls}
            required
          />
        </Field>
        <Field label="Sales (opsional)">
          <SearchableSelect
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            placeholder="Pilih sales"
            options={[
              { value: "", label: "— Tidak dipilih —" },
              ...salesList.map((s) => ({ value: s.nama, label: s.nama })),
            ]}
          />
        </Field>
      </div>

      <Field label="Toko">
        <SearchableSelect
          value={toko}
          onChange={(e) => setToko(e.target.value)}
          placeholder="Pilih toko"
          options={tokoList.map((t) => ({ value: t.nama, label: t.nama }))}
        />
        {isDuplicate && (
          <p className="mt-1 text-xs text-red-600">
            Sudah ada distribusi untuk toko ini pada tanggal yang sama.
          </p>
        )}
      </Field>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Daftar Rokok
        </span>
        <div className="space-y-3">
          {items.map((item, idx) => {
            const rokokData = getRokok(rokokList, item.rokok);
            const totalHarga = rokokData && item.qty ? rokokData.harga_jual * Number(item.qty) : null;
            return (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1">
                  <Field label={idx === 0 ? "Rokok" : ""}>
                    <SelectInput
                      value={item.rokok}
                      onChange={(e) => updateItem(idx, "rokok", e.target.value)}
                      required
                    >
                      <option value="">Pilih rokok</option>
                      {rokokList.map((r) => (
                        <option key={r.id} value={r.nama}>
                          {r.nama} (stok: {r.stok ?? 0})
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <div className="w-24">
                  <Field label={idx === 0 ? "Qty" : ""}>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", e.target.value)}
                      placeholder="0"
                      className={inputCls}
                      required
                    />
                  </Field>
                </div>
                <div className="w-32">
                  <Field label={idx === 0 ? "Total" : ""}>
                    <input
                      type="text"
                      value={totalHarga !== null ? fmtIDR(totalHarga) : ""}
                      className={inputCls + " bg-neutral-50 text-neutral-500"}
                      readOnly
                      placeholder="Otomatis"
                    />
                  </Field>
                </div>
                {items.length > 1 && (
                  <div className="pb-1">
                    <IconButton icon={Trash2} onClick={() => removeItem(idx)} variant="danger" label="Hapus baris" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-lg border border-dashed border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-500 transition hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
        >
          + Tambah Baris
        </button>
      </div>

      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : "Simpan Distribusi"}
      />
    </form>
  );
}
