import React from "react";
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

  const role = user?.role || "SuperAdmin";

  return (
    <TooltipProvider>
      <header
        className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-2 border-primary bg-[#071736] px-4 text-white shadow-md sm:px-6"
        style={{
          borderBottomColor: "#1652f0",
        }}
      >
        {/* Left Section: Mobile Toggle, Brand & Status */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation menu"
            className="mobile-sider-toggle text-white hover:bg-white/10 md:hidden"
            onClick={() => {
              if (setMobileSiderOpen) {
                setMobileSiderOpen(!mobileSiderOpen);
              }
            }}
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>

          <img
            src="/storix-icon.png"
            alt="Storix"
            className="h-7 w-7 object-contain flex-shrink-0"
          />
          <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
            Storix Console
          </span>

          <Badge
            variant="outline"
            className="header-region-tag hidden sm:inline-flex items-center gap-1 border-slate-700 bg-slate-800 text-slate-300 font-normal"
          >
            <Globe className="h-3 w-3 text-slate-400" />
            <span>Region: ap-southeast-1</span>
          </Badge>

          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-medium"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="header-online-text">Online</span>
          </Badge>
        </div>

        {/* Right Section: Tools, CW link, Theme, Role, Profile */}
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
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
};
