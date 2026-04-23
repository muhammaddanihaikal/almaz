import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Undo2,
  Store,
  Cigarette,
  Users,
  CalendarCheck,
  Menu,
  X,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { id: "distribusi", label: "Distribusi", icon: Package },
  { id: "retur",     label: "Retur",       icon: Undo2 },
  { id: "toko",      label: "Toko",        icon: Store },
  { id: "rokok",     label: "Rokok",       icon: Cigarette },
  { id: "sales",     label: "Sales",       icon: Users },
  { id: "absensi",   label: "Absensi",     icon: CalendarCheck },
];

export default function Sidebar({ tab, onTabChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItem = (id, label, Icon) => {
    const active = tab === id;
    return (
      <button
        key={id}
        onClick={() => { onTabChange(id); setMobileOpen(false); }}
        className={
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
          (active
            ? "bg-neutral-900 text-white"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900")
        }
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="hidden lg:inline">{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">ALMAZ</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          "fixed top-0 left-0 z-30 flex h-full flex-col border-r border-neutral-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-56 " +
          (mobileOpen ? "w-56 translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold tracking-tight text-white">
            A
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-semibold tracking-tight">ALMAZ</div>
            <div className="text-xs text-neutral-400">Management Penjualan</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
          {TABS.map(({ id, label, icon: Icon }) => navItem(id, label, Icon))}
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-neutral-200 px-4 py-3 lg:block">
          <p className="text-xs text-neutral-400">© 2026 ALMAZ</p>
        </div>
      </aside>
    </>
  );
}
