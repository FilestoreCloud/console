import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

export interface TenantFilterBarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  canCreate?: boolean;
  onOpenCreateModal: () => void;
}

export const TenantFilterBar: React.FC<TenantFilterBarProps> = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  canCreate,
  onOpenCreateModal,
}) => {
  return (
    <Card className="border-border shadow-sm mb-4">
      <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Tenant ID, domain, email..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={onStatusFilterChange}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active Only</SelectItem>
                <SelectItem value="PROVISIONING">Provisioning Only</SelectItem>
                <SelectItem value="DELETING">Deleting Only</SelectItem>
                <SelectItem value="SUSPENDING">Suspending Only</SelectItem>
                <SelectItem value="RESUMING">Resuming Only</SelectItem>
                <SelectItem value="SUSPENDED">Suspended Only</SelectItem>
                <SelectItem value="FAILED">Failed Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {canCreate && (
            <Button
              size="sm"
              onClick={onOpenCreateModal}
              className="h-9 text-xs bg-[#1652f0] hover:bg-[#1652f0]/90 text-white flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Provision Dedicated Tenant</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
