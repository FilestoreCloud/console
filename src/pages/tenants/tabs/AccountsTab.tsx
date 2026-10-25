import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Key,
  MoreHorizontal,
  UserX,
  UserCheck,
  Search,
} from "lucide-react";

export interface AccountsTabProps {
  accounts: any[];
  onAddAccount: () => void;
  onResetPassword: (username: string) => void;
  onToggleAccountStatus: (username: string, status: string) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  onAddAccount,
  onResetPassword,
  onToggleAccountStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAccounts = accounts.filter((acc) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (acc.username || "").toLowerCase().includes(q) ||
      (acc.display_name || "").toLowerCase().includes(q) ||
      (acc.email || "").toLowerCase().includes(q) ||
      (acc.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="py-3 px-4 sm:px-6 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold">
            Tenant User Accounts ({accounts.length})
          </CardTitle>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button
            size="sm"
            onClick={onAddAccount}
            className="h-8 text-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Account</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[380px] overflow-auto">
          <Table>
            <TableHeader className="bg-card sticky top-0 z-10 border-b">
              <TableRow>
                <TableHead className="font-semibold text-xs">Username</TableHead>
                <TableHead className="font-semibold text-xs">Display Name</TableHead>
                <TableHead className="font-semibold text-xs">Email</TableHead>
                <TableHead className="font-semibold text-xs">Role</TableHead>
                <TableHead className="font-semibold text-xs">Storage Quota</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="font-semibold text-xs">MFA</TableHead>
                <TableHead className="font-semibold text-xs">Last Login</TableHead>
                <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    {searchTerm
                      ? "No accounts match your search."
                      : "No user accounts configured."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((record) => (
                <TableRow key={record.username} className="text-xs">
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{record.username}</span>
                      {record.role === "TenantAdmin" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1 font-bold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                        >
                          ADMIN
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.display_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {record.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.storage_used_gb || 0} GB / {record.quota_gb || 50} GB
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.status === "ACTIVE" ? "outline" : "secondary"}
                      className={`text-xs ${
                        record.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : ""
                      }`}
                    >
                      {record.status === "ACTIVE" ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.mfa_enabled ? "outline" : "secondary"}
                      className={`text-xs ${
                        record.mfa_enabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : ""
                      }`}
                    >
                      {record.mfa_enabled ? "ENABLED" : "NONE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[11px]">
                    {record.last_login || "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label="User actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => onResetPassword(record.username)}
                          className="cursor-pointer text-xs"
                        >
                          <Key className="h-3.5 w-3.5 mr-2 text-primary" />
                          <span>Reset Password</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            onToggleAccountStatus(record.username, record.status)
                          }
                          className={`cursor-pointer text-xs ${
                            record.status === "ACTIVE"
                              ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                              : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                          }`}
                        >
                          {record.status === "ACTIVE" ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-2" />
                              <span>Disable Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-2" />
                              <span>Enable Account</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
};
