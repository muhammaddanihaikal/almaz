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
  ChevronDown,
  ChevronRight,
  Folder,
  Database
} from "lucide-react";

const MENUS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "group-operasional",
    label: "Operasional",
    icon: Folder,
    items: [
      { id: "distribusi", label: "Distribusi", icon: Package },
      { id: "retur", label: "Retur", icon: Undo2 },
    ]
  },
  {
    id: "group-master",
    label: "Master",
    icon: Database,
    items: [
      { id: "toko", label: "Toko", icon: Store },
      { id: "rokok", label: "Rokok", icon: Cigarette },
      { id: "sales", label: "Sales", icon: Users },
    ]
  },
  { id: "absensi", label: "Absensi", icon: CalendarCheck },
];

export default function Sidebar({ tab, onTabChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({ "group-operasional": true, "group-master": true });

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = (item, depth = 0) => {
    if (item.items) {
      const isOpen = openGroups[item.id];
      const activeChild = item.items.some(i => i.id === tab);
      
      return (
        <div key={item.id} className="mb-1 space-y-1">
          <button
            onClick={() => toggleGroup(item.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-neutral-700 hover:bg-neutral-100 ${activeChild ? 'bg-neutral-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={2} />
              <span className="hidden lg:inline">{item.label}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 hidden lg:block" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 hidden lg:block" />
            )}
          </button>
          
          {isOpen && (
            <div className="space-y-0.5 lg:pl-4">
              {item.items.map(subItem => navItem(subItem.id, subItem.label, subItem.icon, 1))}
            </div>
          )}
        </div>
      );
    }

    return navItem(item.id, item.label, item.icon, depth);
  };

  const navItem = (id, label, Icon, depth = 0) => {
    const active = tab === id;
    return (
      <a
        key={id}
        href={`#${id}`}
        onClick={(e) => {
          e.preventDefault();
          onTabChange(id);
          setMobileOpen(false);
        }}
        className={
          `flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            depth > 0 ? "pl-9 pr-3 lg:pl-3" : "px-3"
          } ` +
          (active
            ? "bg-neutral-900 text-white"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900")
        }
      >
        <Icon className={`h-4 w-4 shrink-0 ${active && depth > 0 ? 'text-white' : depth > 0 ? 'text-neutral-400' : ''}`} strokeWidth={2} />
        <span className={depth > 0 ? "inline" : "hidden lg:inline"}>{label}</span>
      </a>
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
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {MENUS.map((item) => renderItem(item))}
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-neutral-200 px-4 py-3 lg:block">
          <p className="text-xs text-neutral-400">© 2026 ALMAZ</p>
        </div>
      </aside>
    </>
  );
}
