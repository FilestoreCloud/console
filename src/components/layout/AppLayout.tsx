import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useLayout } from "./LayoutContext";
import { CustomHeader } from "../Header";
import {
  Boxes,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    name: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "tenants",
    label: "Tenant Operations",
    path: "/tenants",
    icon: Boxes,
  },
];

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
}) => {
  const location = useLocation();
  const {
    mobileSiderOpen,
    setMobileSiderOpen,
    siderCollapsed,
    setSiderCollapsed,
  } = useLayout();

  const isRouteActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return (
        location.pathname === "/" ||
        location.pathname === "/dashboard"
      );
    }
    if (itemPath === "/tenants") {
      return (
        location.pathname === "/tenants" ||
        location.pathname.startsWith("/tenants/")
      );
    }
    return location.pathname.startsWith(itemPath);
  };

  const renderNavLinks = (onItemClick?: () => void) => (
    <nav className="flex flex-col space-y-1 px-2 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isRouteActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              siderCollapsed && "justify-center px-2"
            )}
            title={siderCollapsed ? item.label : undefined}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {!siderCollapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* Top Header */}
      <CustomHeader />

      <div className="flex flex-1">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r bg-card transition-all duration-300 relative select-none",
            siderCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo / Brand Bar */}
          <div className="flex h-14 items-center justify-between border-b px-3.5">
            <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
              {siderCollapsed ? (
                <img
                  src="/storix-icon.png"
                  alt="Storix"
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <img
                  src="/storix-logo.png"
                  alt="Storix"
                  className="h-7 max-w-[130px] object-contain"
                />
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setSiderCollapsed(!siderCollapsed)}
              aria-label={siderCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {siderCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>

          {/* Bottom Info / Status */}
          <div className="border-t p-3 text-xs text-muted-foreground">
            {!siderCollapsed ? (
              <div className="flex items-center justify-between">
                <span>Fleet v2.0</span>
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  ap-southeast-1
                </span>
              </div>
            ) : (
              <div className="text-center font-mono text-[9px]">v2.0</div>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer / Sheet */}
        <Sheet open={mobileSiderOpen} onOpenChange={setMobileSiderOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="flex h-14 items-center border-b px-4 gap-2">
              <img
                src="/storix-logo.png"
                alt="Storix"
                className="h-7 max-w-[140px] object-contain"
              />
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {renderNavLinks(() => setMobileSiderOpen(false))}
            </div>
            <div className="border-t p-4 text-xs text-muted-foreground">
              Storix Enterprise Control Plane
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          <div className="mx-auto max-w-7xl">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  );
};
