import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Key } from "lucide-react";

export interface AccountsTabProps {
  accounts: any[];
  onAddAccount: () => void;
  onResetPassword: (username: string) => void;
  onToggleAccountStatus: (username: string, currentStatus: string) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts = [],
  onAddAccount,
  onResetPassword,
  onToggleAccountStatus,
}) => {
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span>User Accounts Directory ({accounts.length})</span>
        </CardTitle>
        <Button
          size="sm"
          onClick={onAddAccount}
          className="h-8 text-xs bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Account</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-xs">Username</TableHead>
              <TableHead className="font-semibold text-xs">Display Name</TableHead>
              <TableHead className="font-semibold text-xs">Email</TableHead>
              <TableHead className="font-semibold text-xs">Role</TableHead>
              <TableHead className="font-semibold text-xs">Quota / Storage</TableHead>
              <TableHead className="font-semibold text-xs">Status</TableHead>
              <TableHead className="font-semibold text-xs">MFA</TableHead>
              <TableHead className="font-semibold text-xs">Last Login</TableHead>
              <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No user accounts configured.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((record) => (
                <TableRow key={record.username} className="text-xs">
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{record.username}</span>
                      {record.role === "TenantAdmin" && (
                        <Badge
                          variant="warning"
                          className="text-[10px] py-0 px-1 font-bold"
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
                    <Badge variant="info" className="text-xs">
                      {record.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.storage_used_gb || 0} GB / {record.quota_gb || 50} GB
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.status === "ACTIVE" ? "success" : "outline"}
                      className="text-xs"
                    >
                      {record.status === "ACTIVE" ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.mfa_enabled ? "success" : "outline"}
                      className="text-xs"
                    >
                      {record.mfa_enabled ? "ENABLED" : "NONE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[11px]">
                    {record.last_login || "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResetPassword(record.username)}
                        className="h-7 text-xs flex items-center gap-1"
                      >
                        <Key className="h-3 w-3" />
                        <span>
                          {record.role === "TenantAdmin"
                            ? "Set / Reset Password"
                            : "Reset Password"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onToggleAccountStatus(record.username, record.status)
                        }
                        className="h-7 text-xs"
                      >
                        {record.status === "ACTIVE" ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
