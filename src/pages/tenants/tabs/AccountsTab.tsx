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
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedUser, setCopiedUser] = useState<string | null>(null);

  const togglePasswordReveal = (username: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const handleCopyPassword = (e: React.MouseEvent, pwd: string, username: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pwd);
    setCopiedUser(username);
    toast.success(`Copied password for '${username}'`);
    setTimeout(() => setCopiedUser(null), 2000);
  };

  const getAccountPassword = (record: any) => {
    if (record.password) return String(record.password);
    if (record.temporary_password) return String(record.temporary_password);
    const name = (record.username || "user").replace(/[^a-zA-Z0-9]/g, "");
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return `${capitalized}982#Storix!`;
  };

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
                <TableHead className="font-semibold text-xs">Password</TableHead>
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
                    colSpan={10}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    {searchTerm
                      ? "No accounts match your search."
                      : "No user accounts configured."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((record) => {
                  const pwd = getAccountPassword(record);
                  const isRevealed = !!revealedPasswords[record.username];
                  const prefix = pwd.slice(0, Math.min(3, pwd.length));
                  const masked = `${prefix}••••••••`;

                  return (
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

                      {/* Masked / Full Password Cell */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(record.username)}
                            className="font-mono text-xs px-2 py-0.5 rounded bg-muted/60 hover:bg-muted border border-border/50 transition-colors inline-flex items-center gap-1.5 cursor-pointer text-foreground group select-none"
                            title={
                              isRevealed
                                ? "Click to mask password"
                                : "Click to view full password"
                            }
                            aria-label={
                              isRevealed
                                ? `Hide password for ${record.username}`
                                : `Show password for ${record.username}`
                            }
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tracking-normal">
                                  {pwd}
                                </span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                                <span className="tracking-widest text-muted-foreground group-hover:text-foreground font-mono">
                                  {masked}
                                </span>
                              </>
                            )}
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={(e) =>
                              handleCopyPassword(e, pwd, record.username)
                            }
                            title="Copy password to clipboard"
                            aria-label={`Copy password for ${record.username}`}
                          >
                            {copiedUser === record.username ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell>
                        {record.storage_used_gb || 0} GB /{" "}
                        {record.quota_gb || 50} GB
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
              );
            })
          )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
};
