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
  inputCls,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function TokoPage({ tokoList, onAdd, onUpdate, onDelete }) {
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
            {
              key: "tipe_harga",
              label: "Tipe Harga",
              render: (r) => (
                <span className="capitalize">{r.tipe_harga}</span>
              )
            },
            {
              key: "alamat",
              label: "Alamat",
              render: (r) => (
                <span className="text-neutral-500">{r.alamat || "—"}</span>
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
  const [tipeHarga, setTipeHarga] = useState(initial?.tipe_harga || "toko");
  const [alamat, setAlamat] = useState(initial?.alamat || "");
  const valid = nama.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ nama: nama.trim(), tipe_harga: tipeHarga, alamat: alamat.trim() });
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
      <Field label="Tipe Harga">
        <SelectInput
          value={tipeHarga}
          onChange={(e) => setTipeHarga(e.target.value)}
        >
          <option value="grosir">Grosir</option>
          <option value="toko">Toko</option>
          <option value="perorangan">Perorangan</option>
        </SelectInput>
      </Field>
      <Field label="Alamat">
        <input
          type="text"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Misal: Jl. Mawar No. 12, Bandung"
          className={inputCls}
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
