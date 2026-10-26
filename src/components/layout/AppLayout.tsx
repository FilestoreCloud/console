import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useLayout } from "./LayoutContext";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Boxes,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const {
    mobileSiderOpen,
    setMobileSiderOpen,
    siderCollapsed,
    setSiderCollapsed,
  } = useLayout();
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const isRouteActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return (
        location.pathname === "/" || location.pathname === "/dashboard"
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
    <div className="h-screen w-full flex overflow-hidden bg-background text-foreground antialiased">
      {/* Desktop Sticky Sidebar — sticky and does not scroll when content scrolls */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full border-r bg-card transition-all duration-300 relative select-none flex-shrink-0 z-20",
          siderCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo / Brand Bar */}
        <div className="flex h-14 items-center justify-between border-b px-3.5 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto py-1">{renderNavLinks()}</div>

        {/* Bottom Section: Version Info & User Account */}
        <div className="border-t flex-shrink-0 bg-card">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
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

          {/* Account Profile at bottom of sidebar */}
          <div className={cn("p-2", siderCollapsed ? "flex justify-center" : "")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="User account menu"
                  className={cn(
                    "hover:bg-muted flex items-center gap-2.5 h-10 w-full",
                    siderCollapsed ? "px-0 justify-center w-10" : "px-2 justify-start"
                  )}
                >
                  <Avatar className="h-7 w-7 border border-primary/20 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  {!siderCollapsed && (
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-xs font-semibold text-foreground truncate leading-tight">
                        {user?.name || "SuperAdmin"}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate leading-tight">
                        {user?.email || "admin@storix.cloud"}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={siderCollapsed ? "right" : "top"}
                align="start"
                className="w-56"
              >
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold leading-none text-foreground truncate">
                    {user?.name || "SuperAdmin"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {user?.email || "admin@storix.cloud"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
                  onClick={() => setConfirmLogoutOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
          <div className="border-t p-3 bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{user?.email || "SuperAdmin"}</span>
              <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                ap-southeast-1
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              onClick={() => {
                setMobileSiderOpen(false);
                setConfirmLogoutOpen(true);
              }}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Mobile top bar with hamburger menu (only shown on small screens) */}
        <header className="md:hidden h-14 border-b bg-card px-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileSiderOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-bold text-sm tracking-tight text-foreground">
              Storix Console
            </span>
          </div>
          <Avatar className="h-7 w-7 border border-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              <User className="h-3.5 w-3.5" />
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
          <div className="mx-auto max-w-7xl">{children ?? <Outlet />}</div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Sign Out
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Are you sure you want to end your SuperAdmin control plane session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmLogoutOpen(false);
                logout();
              }}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
