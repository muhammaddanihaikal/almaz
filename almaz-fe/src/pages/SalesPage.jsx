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
  Toggle,
  inputCls,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function SalesPage({ salesList, distribusi, retur, onAdd, onUpdate, onDelete, onToggleAktif }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...salesList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [salesList]
  );

  const isUsed = (nama) =>
    (distribusi || []).some((d) => d.sales === nama) ||
    (retur || []).some((r) => r.sales === nama);

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
            { key: "no_hp", label: "No HP", render: (r) => r.no_hp || <span className="text-neutral-400">—</span> },
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
                  onEdit={() => { setEditing(r); setMode("edit"); }}
                  onDelete={() => handleDelete(r)}
                  deleteDisabled={isUsed(r.nama)}
                  deleteTitle="Sales sudah digunakan di data distribusi/retur"
                />
              ),
            },
          ]}
          rows={rows}
          empty="Belum ada sales."
          mobileRender={(r) => (
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-neutral-900">{r.nama}</p>
                {r.no_hp && <p className="text-xs text-neutral-500">{r.no_hp}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Toggle checked={r.aktif ?? true} onChange={() => onToggleAktif(r.id)} />
                <RowActions
                  onEdit={() => { setEditing(r); setMode("edit"); }}
                  onDelete={() => handleDelete(r)}
                  deleteDisabled={isUsed(r.nama)}
                  deleteTitle="Sales sudah digunakan di data distribusi/retur"
                />
              </div>
            </div>
          )}
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
  const [noHp, setNoHp] = useState(initial?.no_hp || "");

  const isDuplicate = salesList.some(
    (s) => s.nama.toLowerCase() === nama.trim().toLowerCase() && s.id !== initial?.id
  );
  const valid = nama.trim().length > 0 && !isDuplicate;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ nama: nama.trim(), no_hp: noHp.trim() });
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
      <Field label="No HP">
        <input
          type="text"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          placeholder="Misal: 0812-3456-7890"
          className={inputCls}
        />
      </Field>
      <FormActions
        onCancel={onCancel}
        disabled={!valid}
        submitLabel={initial ? "Simpan Perubahan" : "Tambah Sales"}
      />
    </form>
  );
}
