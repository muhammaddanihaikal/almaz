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
  inputCls,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function RokokPage({ rokokList, onAdd, onUpdate, onDelete }) {
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => [...rokokList].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
    [rokokList]
  );

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
            { key: "nama", label: "Nama Rokok" },
            {
              key: "harga_beli",
              label: "Harga Beli",
              align: "right",
              render: (r) => fmtIDR(r.harga_beli),
            },
            {
              key: "harga_jual",
              label: "Harga Jual",
              align: "right",
              render: (r) => fmtIDR(r.harga_jual),
            },
            {
              key: "margin",
              label: "Margin",
              align: "right",
              render: (r) => (
                <span className="font-medium text-neutral-900">
                  {fmtIDR(r.harga_jual - r.harga_beli)}
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
  const [hargaBeli, setHargaBeli] = useState(
    initial?.harga_beli?.toString() || ""
  );
  const [hargaJual, setHargaJual] = useState(
    initial?.harga_jual?.toString() || ""
  );

  const hb = Number(hargaBeli);
  const hj = Number(hargaJual);
  const valid =
    nama.trim().length > 0 &&
    hargaBeli !== "" &&
    hargaJual !== "" &&
    hb >= 0 &&
    hj >= 0;

  const margin = valid ? hj - hb : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      nama: nama.trim(),
      harga_beli: hb,
      harga_jual: hj,
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
        <Field label="Harga Jual">
          <input
            type="number"
            min="0"
            value={hargaJual}
            onChange={(e) => setHargaJual(e.target.value)}
            placeholder="0"
            className={inputCls}
            required
          />
        </Field>
      </div>
      {valid && (
        <div
          className={
            "rounded-lg border px-3 py-2 text-xs " +
            (margin < 0
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-neutral-200 bg-neutral-50 text-neutral-600")
          }
        >
          Margin per unit:{" "}
          <span className="font-semibold">{fmtIDR(margin)}</span>
          {margin < 0 && " — harga jual lebih rendah dari harga beli."}
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
