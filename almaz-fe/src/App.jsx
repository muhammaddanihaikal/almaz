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

  // --- CRUD Rokok (cascade nama ke distribusi & retur saat edit) ---
  const addRokok = (data) =>
    setRokokList((prev) => [...prev, { ...data, id: newId() }]);

  const updateRokok = (id, data) => {
    const old = rokokList.find((r) => r.id === id);
    setRokokList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    if (old && old.nama !== data.nama) {
      setDistribusi((prev) =>
        prev.map((d) =>
          d.rokok === old.nama ? { ...d, rokok: data.nama } : d
        )
      );
      setRetur((prev) =>
        prev.map((r) => (r.rokok === old.nama ? { ...r, rokok: data.nama } : r))
      );
    }
  };

  const deleteRokok = (id) =>
    setRokokList((prev) => prev.filter((r) => r.id !== id));

  // --- CRUD Toko ---
  const addToko = (data) =>
    setTokoList((prev) => [...prev, { ...data, id: newId() }]);

  const updateToko = (id, data) => {
    const old = tokoList.find((t) => t.id === id);
    setTokoList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    if (old && old.nama !== data.nama) {
      setDistribusi((prev) =>
        prev.map((d) => (d.toko === old.nama ? { ...d, toko: data.nama } : d))
      );
      setRetur((prev) =>
        prev.map((r) => (r.toko === old.nama ? { ...r, toko: data.nama } : r))
      );
    }
  };

  const deleteToko = (id) =>
    setTokoList((prev) => prev.filter((t) => t.id !== id));

  // --- CRUD Distribusi ---
  const updateDistribusi = (id, data) =>
    setDistribusi((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));

  const deleteDistribusi = (id) =>
    setDistribusi((prev) => prev.filter((d) => d.id !== id));

  // --- CRUD Retur ---
  const updateRetur = (id, data) =>
    setRetur((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));

  const deleteRetur = (id) =>
    setRetur((prev) => prev.filter((r) => r.id !== id));

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
            onAdd={(rows) => {
              const newRows = Array.isArray(rows)
                ? rows.map((r) => ({ ...r, id: newId() }))
                : [{ ...rows, id: newId() }];
              setDistribusi((prev) => [...newRows, ...prev]);
            }}
            onUpdate={updateDistribusi}
            onDelete={deleteDistribusi}
          />
        )}
        {tab === "retur" && (
          <ReturPage
            retur={retur}
            rokokList={rokokList}
            tokoList={tokoList}
            onAdd={(rows) => {
              const newRows = Array.isArray(rows)
                ? rows.map((r) => ({ ...r, id: newId() }))
                : [{ ...rows, id: newId() }];
              setRetur((prev) => [...newRows, ...prev]);
            }}
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
