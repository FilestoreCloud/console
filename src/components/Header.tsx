import React, { useState } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useLayout } from "./layout/LayoutContext";
import { Button } from "@/components/ui/button";
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
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  User,
  Menu,
  AlertTriangle,
} from "lucide-react";

export interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const CustomHeader: React.FC<HeaderProps> = () => {
  const { data: user } = useGetIdentity<any>();
  const { mutate: logout } = useLogout();
  const { mobileSiderOpen, setMobileSiderOpen } = useLayout();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  return (
    <TooltipProvider>
      <header className="h-14 border-b bg-card text-foreground px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-sm">
        {/* Left Section: Mobile toggle, Brand Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-sider-toggle md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileSiderOpen(!mobileSiderOpen)}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <span className="font-bold text-sm sm:text-base tracking-tight text-foreground whitespace-nowrap">
            Storix Console
          </span>
        </div>

        {/* Right Section: Minimalist User Avatar Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="User account menu"
                className="h-9 px-2 hover:bg-muted flex items-center gap-2"
              >
                <Avatar className="h-7 w-7 border border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="header-user-name hidden sm:inline text-xs font-medium text-foreground">
                  {user?.name || "ADMIN"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold leading-none text-foreground truncate">
                  {user?.email || "SuperAdmin"}
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
