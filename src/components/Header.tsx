import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useLayout } from "./layout/LayoutContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShieldCheck,
  LogOut,
  Globe,
  CheckCircle2,
  LineChart,
  User,
  Sun,
  Moon,
  Menu,
  AlertTriangle,
} from "lucide-react";

export interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const CustomHeader: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const { mobileSiderOpen, setMobileSiderOpen } = useLayout();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const role = user?.role || "SuperAdmin";

  return (
    <TooltipProvider>
      <header className="h-14 border-b bg-[#0f172a] text-white px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left Section: Mobile toggle, Brand Title, Region */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-sider-toggle md:hidden h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => setMobileSiderOpen(!mobileSiderOpen)}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
              Storix Console
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              v2.0
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 ml-2 border-l border-slate-700 pl-3 text-xs text-slate-300">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span className="header-region-text font-mono text-[11px]">
              Region: ap-southeast-1
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
            <span className="text-[11px] text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        {/* Right Section: CloudWatch quick link, Theme Toggle, Role Badge, User Avatar */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="header-cmd-btn hidden md:inline-flex h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs px-2.5"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
          >
            ⌘K Palette
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-100 hover:bg-white/10 hover:text-white px-2 h-8"
              >
                <a
                  href="https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards/dashboard/prod-Storix-SaaS-Control-Plane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <LineChart className="h-4 w-4 text-amber-400" />
                  <span className="header-cw-text hidden lg:inline text-xs font-medium">
                    CloudWatch Dashboard ↗
                  </span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open AWS CloudWatch Dashboard</p>
            </TooltipContent>
          </Tooltip>

          {onToggleTheme && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleTheme}
                  className="h-8 border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white px-2.5 text-xs flex items-center gap-1"
                >
                  {isDark ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-slate-300" />
                  )}
                  <span className="header-theme-text font-medium">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {isDark ? "Light" : "Dark"} Mode</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="destructive"
                className="hidden sm:inline-flex items-center gap-1 bg-red-600/90 hover:bg-red-600 text-white font-medium cursor-default"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="header-role-text">
                  SuperAdmin (Full Control)
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Role: {role}</p>
            </TooltipContent>
          </Tooltip>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="User account menu"
                className="h-9 px-2 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Avatar className="h-7 w-7 border border-blue-400/30">
                  <AvatarFallback className="bg-[#1652f0] text-white text-xs">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="header-user-name hidden sm:inline text-xs font-medium">
                  {user?.name || "ADMIN"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {user?.email || "SuperAdmin"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Role: {role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>MFA: Verified</span>
              </div>
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
      </header>
    </TooltipProvider>
  );
};
