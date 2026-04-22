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
  downloadCSV,
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
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [mode, setMode] = useState(null); // 'add' | 'edit'
  const [editing, setEditing] = useState(null);
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

  const close = () => {
    setMode(null);
    setEditing(null);
  };

  const handleDelete = (r) => {
    if (window.confirm(`Hapus data distribusi untuk "${r.rokok}" di "${r.toko}"?`)) {
      onDelete(r.id);
    }
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
            <PrimaryButton
              onClick={() => {
                setEditing(null);
                setMode("add");
              }}
              icon={Plus}
            >
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
          empty={
            bulan
              ? `Tidak ada distribusi di ${fmtBulan(bulan)}.`
              : "Belum ada distribusi."
          }
        />
      </Card>

      {mode && (
        <Modal
          title={mode === "add" ? "Input Distribusi" : "Edit Distribusi"}
          onClose={close}
          width={mode === "add" ? "max-w-2xl" : "max-w-md"}
        >
          <DistribusiForm
            mode={mode}
            initial={editing}
            rokokList={rokokList}
            tokoList={tokoList}
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

function DistribusiForm({ mode, initial, rokokList, tokoList, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(initial?.tanggal || today);
  const [toko, setToko] = useState(initial?.toko || "");
  
  // For 'add' mode, we use an array of items
  const [items, setItems] = useState(
    initial ? [{ rokok: initial.rokok, qty: initial.qty }] : [{ rokok: "", qty: "" }]
  );

  const addItem = () => setItems([...items, { rokok: "", qty: "" }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const valid =
    tanggal &&
    toko &&
    items.length > 0 &&
    items.every((it) => it.rokok && Number(it.qty) > 0);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;

    if (mode === "edit") {
      const it = items[0];
      onSubmit({
        tanggal,
        toko,
        rokok: it.rokok,
        qty: Number(it.qty),
        harga: getRokok(rokokList, it.rokok)?.harga_jual || 0,
      });
    } else {
      const rows = items.map((it) => ({
        tanggal,
        toko,
        rokok: it.rokok,
        qty: Number(it.qty),
        harga: getRokok(rokokList, it.rokok)?.harga_jual || 0,
      }));
      onSubmit(rows);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Daftar Rokok
          </span>
          {mode === "add" && (
            <button
              type="button"
              onClick={addItem}
              className="text-xs font-medium text-neutral-900 hover:underline"
            >
              + Tambah Baris
            </button>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-end gap-3">
              <div className="flex-1">
                <Field label={idx === 0 ? "Rokok" : ""}>
                  <select
                    value={item.rokok}
                    onChange={(e) => updateItem(idx, "rokok", e.target.value)}
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
                <Field label={idx === 0 ? "Harga" : ""}>
                  <input
                    type="text"
                    value={item.rokok ? fmtIDR(getRokok(rokokList, item.rokok)?.harga_jual) : ""}
                    className={inputCls + " bg-neutral-50 text-neutral-500"}
                    readOnly
                    placeholder="Otomatis"
                  />
                </Field>
              </div>
              {mode === "add" && items.length > 1 && (
                <div className="pb-1">
                  <IconButton
                    icon={Trash2}
                    onClick={() => removeItem(idx)}
                    variant="danger"
                    label="Hapus baris"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : `Simpan ${items.length} Distribusi`}
      />
    </form>
  );
}
