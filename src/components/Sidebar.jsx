import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  AlertTriangle,
  CreditCard,
  Bell,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/dashboard/attendance", icon: CalendarCheck, label: "Attendance" },
  { path: "/dashboard/academic", icon: GraduationCap, label: "Academic Performance" },
  { path: "/dashboard/backlogs", icon: AlertTriangle, label: "Backlogs" },
  { path: "/dashboard/fees", icon: CreditCard, label: "Fee Status" },
  { path: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { path: "/dashboard/chatbot", icon: MessageCircle, label: "Chatbot Assistant" },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-slate-900 dark:bg-gray-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
