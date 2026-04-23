import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  fmtTanggal,
  currentMonth,
  fmtBulan,
  filterByMonth,
  sortByDateDesc,
  getAvailableMonths,
  downloadExcel,
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

export default function ReturPage({
  retur,
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

  const months = useMemo(() => getAvailableMonths(retur), [retur]);

  const [tokoFilter, setTokoFilter] = useState("");

  const rows = useMemo(() => {
    let filtered = filterByMonth(retur, bulan);
    if (tokoFilter) filtered = filtered.filter((r) => r.toko === tokoFilter);
    return sortByDateDesc(filtered);
  }, [retur, bulan, tokoFilter]);

  const handleDownload = () => {
    const label = bulan || "semua-bulan";
    const flat = rows.flatMap((r) =>
      r.items.map((it) => ({
        tanggal: r.tanggal,
        toko: r.toko,
        sales: r.sales || "",
        rokok: it.rokok,
        qty: it.qty,
        alasan: r.alasan || "",
      }))
    );
    downloadExcel(flat, `retur-${label}`, [
      { label: "Tanggal", value: (r) => r.tanggal },
      { label: "Toko",    value: (r) => r.toko },
      { label: "Sales",   value: (r) => r.sales },
      { label: "Rokok",   value: (r) => r.rokok },
      { label: "Qty",     value: (r) => r.qty },
      { label: "Alasan",  value: (r) => r.alasan },
    ]);
  };

  const close = () => { setMode(null); setEditing(null); };

  const handleDelete = (r) => {
    const names = r.items.map((it) => it.rokok).join(", ");
    if (window.confirm(`Hapus retur dari "${r.toko}"?\n(${names})`))
      onDelete(r.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retur"
        subtitle={`Daftar barang yang dikembalikan dari toko${
          bulan ? ` — ${fmtBulan(bulan)}` : " — semua bulan"
        }${tokoFilter ? ` (${tokoFilter})` : ""}.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DownloadButton onClick={handleDownload} disabled={!rows.length} />
            <PrimaryButton onClick={() => { setEditing(null); setMode("add"); }} icon={Plus}>
              Input Retur
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
              label: "Barang Retur",
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
              key: "alasan",
              label: "Alasan",
              render: (r) => <span className="text-sm text-neutral-500">{r.alasan || "—"}</span>,
            },
            {
              key: "total_qty",
              label: "Total Qty",
              align: "right",
              render: (r) => r.items.reduce((s, it) => s + it.qty, 0),
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
          empty={bulan ? `Tidak ada retur di ${fmtBulan(bulan)}.` : "Belum ada retur."}
        />
      </Card>

      {detail && (
        <Modal title="Detail Retur" onClose={() => setDetail(null)} width="max-w-lg">
          <ReturDetail record={detail} />
        </Modal>
      )}

      {mode && (
        <Modal
          title={mode === "add" ? "Input Retur" : "Edit Retur"}
          onClose={close}
          width="max-w-2xl"
        >
          <ReturForm
            initial={editing}
            existing={retur}
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

function ReturDetail({ record }) {
  const totalQty = record.items.reduce((s, it) => s + it.qty, 0);

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

      {record.alasan && (
        <div className="text-sm">
          <p className="text-xs text-neutral-500">Alasan</p>
          <p className="font-medium">{record.alasan}</p>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Daftar Barang Retur
        </p>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2 text-left">Rokok</th>
                <th className="px-3 py-2 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {record.items.map((item, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="px-3 py-2.5">{item.rokok}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{item.qty}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-neutral-200 bg-neutral-50">
                <td className="px-3 py-2.5 text-xs font-semibold text-neutral-500">Total</td>
                <td className="px-3 py-2.5 text-right text-xs font-semibold text-neutral-900 tabular-nums">{totalQty}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReturForm({ initial, existing, rokokList, tokoList, salesList, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(initial?.tanggal || today);
  const [toko, setToko]       = useState(initial?.toko || "");
  const [sales, setSales]     = useState(initial?.sales || "");
  const [alasan, setAlasan]   = useState(initial?.alasan || "");
  const [items, setItems] = useState(
    initial
      ? initial.items.map((it) => ({ rokok: it.rokok, qty: it.qty }))
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
      (r) => r.tanggal === tanggal && r.toko === toko && r.id !== initial?.id
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
      alasan: alasan.trim(),
      items: items.map((it) => ({ rokok: it.rokok, qty: Number(it.qty) })),
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
            Sudah ada retur untuk toko ini pada tanggal yang sama.
          </p>
        )}
      </Field>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Daftar Barang Retur
        </span>
        <div className="space-y-3">
          {items.map((item, idx) => (
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
              {items.length > 1 && (
                <div className="pb-1">
                  <IconButton icon={Trash2} onClick={() => removeItem(idx)} variant="danger" label="Hapus baris" />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-lg border border-dashed border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-500 transition hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
        >
          + Tambah Baris
        </button>
      </div>

      <Field label="Alasan (opsional)">
        <input
          type="text"
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Misal: Tidak laku, Rusak, Kadaluarsa..."
          className={inputCls}
        />
      </Field>

      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : "Simpan Retur"}
      />
    </form>
  );
}
