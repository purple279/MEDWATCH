import React from "react";
import {
  Search,
  Bell,
  AlertTriangle,
  Menu,
  RotateCcw,
  Cpu,
  User,
} from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  criticalAlertsCount: number;
  isSimulating: boolean;
  onResetSimulation: () => void;
  onOpenMobileMenu: () => void;
  onAlertClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  pageSubtitle,
  searchQuery,
  onSearchChange,
  criticalAlertsCount,
  isSimulating,
  onResetSimulation,
  onOpenMobileMenu,
  onAlertClick,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-none hidden sm:block truncate mt-0.5">
                {pageSubtitle}
              </p>
            </div>
          </div>

          {/* Center/Large: Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search medicines, facilities, districts..."
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Notifications, Alert Indicator, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Simulation Active Indicator */}
            {isSimulating && (
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Stress Active</span>
                <button
                  onClick={onResetSimulation}
                  className="ml-1 text-[11px] underline hover:text-amber-950 cursor-pointer font-bold"
                  title="Reset simulation to baseline"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Alert Indicator */}
            <button
              onClick={onAlertClick}
              className={`relative p-2 rounded-lg transition-colors flex items-center justify-center ${
                criticalAlertsCount > 0
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              title={`${criticalAlertsCount} active critical stock alerts`}
            >
              <AlertTriangle className="w-4 h-4" />
              {criticalAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600"></span>
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </button>

            {/* User Profile Trigger */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                SC
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
