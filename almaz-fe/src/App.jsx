import { useState } from "react";
import { ROKOK_AWAL, TOKO_AWAL, DISTRIBUSI_AWAL, RETUR_AWAL, SALES_AWAL, ABSENSI_AWAL } from "./data";
import { newId } from "./utils";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import DistribusiPage from "./pages/DistribusiPage";
import ReturPage from "./pages/ReturPage";
import TokoPage from "./pages/TokoPage";
import RokokPage from "./pages/RokokPage";
import SalesPage from "./pages/SalesPage";
import AbsensiPage from "./pages/AbsensiPage";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [rokokList, setRokokList] = useState(ROKOK_AWAL);
  const [tokoList, setTokoList] = useState(TOKO_AWAL);
  const [salesList, setSalesList] = useState(SALES_AWAL);
  const [distribusi, setDistribusi] = useState(DISTRIBUSI_AWAL);
  const [retur, setRetur] = useState(RETUR_AWAL);
  const [absensiList, setAbsensiList] = useState(ABSENSI_AWAL);

  // Adjust stok: distribusi decreases (sign=-1), retur increases (sign=+1)
  const syncStok = (prevItems, nextItems, sign) => {
    setRokokList((prev) =>
      prev.map((r) => {
        const prevQty = (prevItems || [])
          .filter((i) => i.rokok === r.nama)
          .reduce((s, i) => s + Number(i.qty), 0);
        const nextQty = (nextItems || [])
          .filter((i) => i.rokok === r.nama)
          .reduce((s, i) => s + Number(i.qty), 0);
        const delta = sign * (nextQty - prevQty);
        return delta ? { ...r, stok: Math.max(0, (r.stok ?? 0) + delta) } : r;
      })
    );
  };

  // --- CRUD Rokok (cascade nama ke items saat rename) ---
  const addRokok = (data) =>
    setRokokList((prev) => [...prev, { ...data, id: newId() }]);

  const updateRokok = (id, data) => {
    const old = rokokList.find((r) => r.id === id);
    setRokokList((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    if (old && old.nama !== data.nama) {
      const rename = (items) =>
        items.map((it) => (it.rokok === old.nama ? { ...it, rokok: data.nama } : it));
      setDistribusi((prev) => prev.map((d) => ({ ...d, items: rename(d.items) })));
      setRetur((prev) => prev.map((r) => ({ ...r, items: rename(r.items) })));
    }
  };

  const deleteRokok = (id) =>
    setRokokList((prev) => prev.filter((r) => r.id !== id));

  // --- CRUD Toko (cascade nama) ---
  const addToko = (data) =>
    setTokoList((prev) => [...prev, { ...data, id: newId() }]);

  const updateToko = (id, data) => {
    const old = tokoList.find((t) => t.id === id);
    setTokoList((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    if (old && old.nama !== data.nama) {
      const renamedToko = (rows) =>
        rows.map((r) => (r.toko === old.nama ? { ...r, toko: data.nama } : r));
      setDistribusi((prev) => renamedToko(prev));
      setRetur((prev) => renamedToko(prev));
    }
  };

  const deleteToko = (id) =>
    setTokoList((prev) => prev.filter((t) => t.id !== id));

  // --- CRUD Sales (cascade nama ke distribusi & retur) ---
  const addSales = (data) =>
    setSalesList((prev) => [...prev, { ...data, id: newId() }]);

  const updateSales = (id, data) => {
    const old = salesList.find((s) => s.id === id);
    setSalesList((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    if (old && old.nama !== data.nama) {
      const renamedSales = (rows) =>
        rows.map((r) => (r.sales === old.nama ? { ...r, sales: data.nama } : r));
      setDistribusi((prev) => renamedSales(prev));
      setRetur((prev) => renamedSales(prev));
    }
  };

  const deleteSales = (id) =>
    setSalesList((prev) => prev.filter((s) => s.id !== id));

  // --- CRUD Distribusi ---
  const addDistribusi = (data) => {
    setDistribusi((prev) => [{ ...data, id: newId() }, ...prev]);
    syncStok([], data.items, -1);
  };

  const updateDistribusi = (id, data) => {
    const old = distribusi.find((d) => d.id === id);
    setDistribusi((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
    syncStok(old?.items || [], data.items, -1);
  };

  const deleteDistribusi = (id) => {
    const old = distribusi.find((d) => d.id === id);
    setDistribusi((prev) => prev.filter((d) => d.id !== id));
    syncStok(old?.items || [], [], -1);
  };

  // --- CRUD Retur ---
  const addRetur = (data) => {
    setRetur((prev) => [{ ...data, id: newId() }, ...prev]);
    syncStok([], data.items, +1);
  };

  const updateRetur = (id, data) => {
    const old = retur.find((r) => r.id === id);
    setRetur((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    syncStok(old?.items || [], data.items, +1);
  };

  const deleteRetur = (id) => {
    const old = retur.find((r) => r.id === id);
    setRetur((prev) => prev.filter((r) => r.id !== id));
    syncStok(old?.items || [], [], +1);
  };

  // --- Absensi (save replaces all records for a date) ---
  const saveAbsensi = (tanggal, records) => {
    setAbsensiList((prev) => {
      const filtered = prev.filter((a) => a.tanggal !== tanggal);
      const newRecords = records.map((r) => ({ ...r, tanggal, id: newId() }));
      return [...filtered, ...newRecords];
    });
  };

  const deleteAbsensi = (tanggal) =>
    setAbsensiList((prev) => prev.filter((a) => a.tanggal !== tanggal));

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar tab={tab} onTabChange={setTab} />

      <div className="flex flex-1 flex-col">
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-8">
            {tab === "dashboard" && (
              <Dashboard
                distribusi={distribusi}
                retur={retur}
                rokokList={rokokList}
                tokoList={tokoList}
              />
            )}
            {tab === "distribusi" && (
              <DistribusiPage
                distribusi={distribusi}
                rokokList={rokokList}
                tokoList={tokoList}
                salesList={salesList}
                onAdd={addDistribusi}
                onUpdate={updateDistribusi}
                onDelete={deleteDistribusi}
              />
            )}
            {tab === "retur" && (
              <ReturPage
                retur={retur}
                rokokList={rokokList}
                tokoList={tokoList}
                salesList={salesList}
                onAdd={addRetur}
                onUpdate={updateRetur}
                onDelete={deleteRetur}
              />
            )}
            {tab === "toko" && (
              <TokoPage
                tokoList={tokoList}
                onAdd={addToko}
                onUpdate={updateToko}
                onDelete={deleteToko}
              />
            )}
            {tab === "rokok" && (
              <RokokPage
                rokokList={rokokList}
                onAdd={addRokok}
                onUpdate={updateRokok}
                onDelete={deleteRokok}
              />
            )}
            {tab === "sales" && (
              <SalesPage
                salesList={salesList}
                onAdd={addSales}
                onUpdate={updateSales}
                onDelete={deleteSales}
              />
            )}
            {tab === "absensi" && (
              <AbsensiPage
                absensiList={absensiList}
                salesList={salesList}
                onSave={saveAbsensi}
                onDelete={deleteAbsensi}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
