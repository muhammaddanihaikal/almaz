import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { fmtIDR } from "../utils";
import { PAGE_SIZE } from "../data";
import {
  Card,
  PageHeader,
  PrimaryButton,
  RowActions,
  Field,
  FormActions,
  Toggle,
  inputCls,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function RokokPage({ rokokList, distribusi, retur, onAdd, onUpdate, onDelete, onToggleAktif }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...rokokList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [rokokList]
  );

  const isUsed = (nama) =>
    (distribusi || []).some((d) => d.items.some((it) => it.rokok === nama)) ||
    (retur || []).some((r) => r.items.some((it) => it.rokok === nama));

  const close = () => {
    setMode(null);
    setEditing(null);
  };

  const handleDelete = (r) => {
    if (
      window.confirm(
        `Hapus rokok "${r.nama}"?\n\nData distribusi & retur tidak akan ikut terhapus.`
      )
    ) {
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
            { key: "no", label: "No", render: (_, idx) => idx + 1 },
            { key: "nama", label: "Nama Rokok" },
            {
              key: "stok",
              label: "Stok",
              align: "right",
              render: (r) => r.stok ?? 0,
            },
            {
              key: "harga_beli",
              label: "Harga Beli",
              align: "right",
              render: (r) => fmtIDR(r.harga_beli),
            },
            {
              key: "harga_grosir",
              label: "Grosir",
              align: "right",
              render: (r) => (
                <div>
                  <div>{fmtIDR(r.harga_grosir)}</div>
                  <div className="text-xs text-neutral-500 font-medium">{fmtIDR(r.harga_grosir - r.harga_beli)}</div>
                </div>
              ),
            },
            {
              key: "harga_toko",
              label: "Toko",
              align: "right",
              render: (r) => (
                <div>
                  <div>{fmtIDR(r.harga_toko)}</div>
                  <div className="text-xs text-neutral-500 font-medium">{fmtIDR(r.harga_toko - r.harga_beli)}</div>
                </div>
              ),
            },
            {
              key: "harga_perorangan",
              label: "Perorangan",
              align: "right",
              render: (r) => (
                <div>
                  <div>{fmtIDR(r.harga_perorangan)}</div>
                  <div className="text-xs text-neutral-500 font-medium">{fmtIDR(r.harga_perorangan - r.harga_beli)}</div>
                </div>
              ),
            },
            {
              key: "aktif",
              label: "Aktif",
              align: "center",
              render: (r) => (
                <Toggle
                  checked={r.aktif ?? true}
                  onChange={() => onToggleAktif(r.id)}
                />
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
                  deleteDisabled={isUsed(r.nama)}
                  deleteTitle="Rokok sudah digunakan di data distribusi/retur"
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
  const [hargaBeli, setHargaBeli] = useState(initial?.harga_beli?.toString() || "");
  const [hargaGrosir, setHargaGrosir] = useState(initial?.harga_grosir?.toString() || "");
  const [hargaToko, setHargaToko] = useState(initial?.harga_toko?.toString() || "");
  const [hargaPerorangan, setHargaPerorangan] = useState(initial?.harga_perorangan?.toString() || "");
  const [stok, setStok] = useState(initial?.stok?.toString() || "0");

  const hb = Number(hargaBeli);
  const hg = Number(hargaGrosir);
  const ht = Number(hargaToko);
  const hp = Number(hargaPerorangan);

  const valid =
    nama.trim().length > 0 &&
    hargaBeli !== "" &&
    hargaGrosir !== "" &&
    hargaToko !== "" &&
    hargaPerorangan !== "" &&
    hb >= 0 &&
    hg >= hb &&
    ht >= hb &&
    hp >= hb &&
    stok !== "" &&
    Number(stok) >= 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      nama: nama.trim(),
      harga_beli: hb,
      harga_grosir: hg,
      harga_toko: ht,
      harga_perorangan: hp,
      stok: Number(stok),
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
        <Field label="Grosir">
          <input
            type="number"
            min="0"
            value={hargaGrosir}
            onChange={(e) => setHargaGrosir(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Toko">
          <input
            type="number"
            min="0"
            value={hargaToko}
            onChange={(e) => setHargaToko(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Perorangan">
          <input
            type="number"
            min="0"
            value={hargaPerorangan}
            onChange={(e) => setHargaPerorangan(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
      </div>
      <Field label="Stok">
        <input
          type="number"
          min="0"
          value={stok}
          onChange={(e) => setStok(e.target.value)}
          placeholder="0"
          className={inputCls}
          required
        />
      </Field>
      {(hargaBeli !== "" && (hg < hb || ht < hb || hp < hb)) && (
        <div className="rounded-lg border px-3 py-2 text-xs border-red-200 bg-red-50 text-red-700">
          Harga jual tidak boleh lebih rendah dari harga beli.
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
