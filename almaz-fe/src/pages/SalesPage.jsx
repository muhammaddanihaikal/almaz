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

export default function SalesPage({ salesList, onAdd, onUpdate, onDelete }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...salesList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [salesList]
  );

  const close = () => { setMode(null); setEditing(null); };

  const handleDelete = (s) => {
    if (window.confirm(`Hapus sales "${s.nama}"?\n\nData distribusi & retur tidak akan ikut terhapus.`))
      onDelete(s.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        subtitle={`${salesList.length} sales terdaftar.`}
        action={
          <PrimaryButton onClick={() => { setEditing(null); setMode("add"); }} icon={Plus}>
            Tambah Sales
          </PrimaryButton>
        }
      />

      <Card>
        <DataTable
          pageSize={PAGE_SIZE}
          columns={[
            { key: "no",   label: "No",        render: (_, idx) => idx + 1 },
            { key: "nama", label: "Nama Sales" },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (r) => (
                <RowActions
                  onEdit={() => { setEditing(r); setMode("edit"); }}
                  onDelete={() => handleDelete(r)}
                />
              ),
            },
          ]}
          rows={rows}
          empty="Belum ada sales."
        />
      </Card>

      {mode && (
        <Modal
          title={mode === "add" ? "Tambah Sales" : "Edit Sales"}
          onClose={close}
        >
          <SalesForm
            initial={editing}
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

function SalesForm({ initial, salesList, onSubmit, onCancel }) {
  const [nama, setNama] = useState(initial?.nama || "");

  const isDuplicate = salesList.some(
    (s) => s.nama.toLowerCase() === nama.trim().toLowerCase() && s.id !== initial?.id
  );
  const valid = nama.trim().length > 0 && !isDuplicate;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ nama: nama.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nama Sales">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Misal: Budi Santoso"
          className={inputCls}
          autoFocus
          required
        />
        {isDuplicate && (
          <p className="mt-1 text-xs text-red-600">Nama sales sudah terdaftar.</p>
        )}
      </Field>
      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : "Tambah Sales"}
      />
    </form>
  );
}
