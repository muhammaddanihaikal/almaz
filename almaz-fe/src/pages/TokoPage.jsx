import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PAGE_SIZE } from "../data";
import {
  Card,
  PageHeader,
  PrimaryButton,
  RowActions,
  Field,
  FormActions,
  SelectInput,
  Toggle,
  inputCls,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function TokoPage({ tokoList, distribusi, retur, onAdd, onUpdate, onDelete, onToggleAktif }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...tokoList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [tokoList]
  );

  const isUsed = (nama) =>
    (distribusi || []).some((d) => d.toko === nama) ||
    (retur || []).some((r) => r.toko === nama);

  const close = () => {
    setMode(null);
    setEditing(null);
  };

  const handleDelete = (t) => {
    if (
      window.confirm(
        `Hapus toko "${t.nama}"?\n\nData distribusi & retur tidak akan ikut terhapus.`
      )
    ) {
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
            { key: "no", label: "No", render: (_, idx) => idx + 1 },
            { key: "nama", label: "Nama Toko" },
            { key: "no_hp", label: "No HP", render: (r) => r.no_hp || <span className="text-neutral-400">—</span> },
            {
              key: "tipe_harga",
              label: "Tipe",
              render: (r) => <span className="capitalize">{r.tipe_harga}</span>,
            },
            {
              key: "alamat",
              label: "Alamat",
              render: (r) => <span className="text-neutral-500">{r.alamat || "—"}</span>,
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
                  deleteTitle="Toko sudah digunakan di data distribusi/retur"
                />
              ),
            },
          ]}
          rows={rows}
          empty="Belum ada toko."
          mobileRender={(r) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">{r.nama}</p>
                  <p className="text-xs capitalize text-neutral-500">{r.tipe_harga}</p>
                  {r.no_hp && <p className="text-xs text-neutral-500">{r.no_hp}</p>}
                  {r.alamat && <p className="mt-1 text-xs text-neutral-500">{r.alamat}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle checked={r.aktif ?? true} onChange={() => onToggleAktif(r.id)} />
                  <RowActions
                    onEdit={() => { setEditing(r); setMode("edit"); }}
                    onDelete={() => handleDelete(r)}
                    deleteDisabled={isUsed(r.nama)}
                    deleteTitle="Toko sudah digunakan di data distribusi/retur"
                  />
                </div>
              </div>
            </div>
          )}
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
  const [tipeHarga, setTipeHarga] = useState(initial?.tipe_harga || "toko");
  const [noHp, setNoHp] = useState(initial?.no_hp || "");
  const [alamat, setAlamat] = useState(initial?.alamat || "");
  const valid = nama.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ nama: nama.trim(), tipe_harga: tipeHarga, no_hp: noHp.trim(), alamat: alamat.trim() });
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
      <Field label="No HP">
        <input
          type="text"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          placeholder="Misal: 0812-3456-7890"
          className={inputCls}
        />
      </Field>
      <Field label="Tipe">
        <SelectInput
          value={tipeHarga}
          onChange={(e) => setTipeHarga(e.target.value)}
        >
          <option value="grosir">Grosir</option>
          <option value="toko">Toko</option>
        </SelectInput>
      </Field>
      <Field label="Alamat">
        <textarea
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Misal: Jl. Mawar No. 12, Bandung"
          className={inputCls}
          rows={3}
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
