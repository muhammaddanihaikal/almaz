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
