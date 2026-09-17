import React from "react";
import {
  LayoutDashboard,
  Boxes,
  Network,
  AlertTriangle,
  ArrowLeftRight,
  Zap,
  FileText,
  Settings,
  Activity,
  User,
  X,
} from "lucide-react";

export type NavSection =
  | "dashboard"
  | "inventory"
  | "network"
  | "alerts"
  | "redistribution"
  | "stresstest"
  | "reports";

interface SidebarProps {
  activeNav: NavSection;
  onSelectNav: (section: NavSection) => void;
  criticalCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  criticalCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: NavSection; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "network", label: "Regional Network", icon: Network },
    { id: "alerts", label: "Shortage Alerts", icon: AlertTriangle, badge: criticalCount },
    { id: "redistribution", label: "Redistribution", icon: ArrowLeftRight },
    { id: "stresstest", label: "Stress Test", icon: Zap },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  const handleItemClick = (id: NavSection) => {
    onSelectNav(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    MEDWATCH
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  Healthcare Supply Intelligence
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1 flex-1">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? "bg-rose-600 text-white"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Settings & User Profile */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-1">
          <button
            onClick={() => onSelectNav("dashboard")}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 mt-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              SC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">Dr. Sarah Chen</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">Regional Supply Lead</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
