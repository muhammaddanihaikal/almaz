import { useState } from "react";
import { ROKOK_AWAL, TOKO_AWAL, DISTRIBUSI_AWAL, RETUR_AWAL } from "./data";
import { newId } from "./utils";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import DistribusiPage from "./pages/DistribusiPage";
import ReturPage from "./pages/ReturPage";
import TokoPage from "./pages/TokoPage";
import RokokPage from "./pages/RokokPage";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [rokokList, setRokokList] = useState(ROKOK_AWAL);
  const [tokoList, setTokoList] = useState(TOKO_AWAL);
  const [distribusi, setDistribusi] = useState(DISTRIBUSI_AWAL);
  const [retur, setRetur] = useState(RETUR_AWAL);

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
        items.map((it) =>
          it.rokok === old.nama ? { ...it, rokok: data.nama } : it
        );
      setDistribusi((prev) =>
        prev.map((d) => ({ ...d, items: rename(d.items) }))
      );
      setRetur((prev) =>
        prev.map((r) => ({ ...r, items: rename(r.items) }))
      );
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header tab={tab} onTabChange={setTab} />
      <main className="mx-auto max-w-7xl px-6 py-8">
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
      </main>
    </div>
  );
}
