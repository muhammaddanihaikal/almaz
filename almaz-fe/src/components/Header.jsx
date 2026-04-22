import { LayoutDashboard, Package, Undo2, Store, Cigarette } from "lucide-react";

export default function Header({ tab, onTabChange }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "distribusi", label: "Distribusi", icon: Package },
    { id: "retur", label: "Retur", icon: Undo2 },
    { id: "toko", label: "Toko", icon: Store },
    { id: "rokok", label: "Rokok", icon: Cigarette },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold tracking-tight text-white">
            A
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">ALMAZ</div>
            <div className="text-xs text-neutral-500">
              Management Penjualan Rokok
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900")
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
