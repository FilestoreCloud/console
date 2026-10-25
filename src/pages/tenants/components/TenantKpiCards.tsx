import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Boxes,
  CheckCircle2,
  PauseCircle,
  HardDrive,
} from "lucide-react";

export interface TenantKpiCardsProps {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalQuota: number;
}

export const TenantKpiCards: React.FC<TenantKpiCardsProps> = ({
  totalTenants,
  activeTenants,
  suspendedTenants,
  totalQuota,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            TOTAL REGISTERED TENANTS
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Boxes className="h-6 w-6 text-blue-500" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {totalTenants}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ACTIVE DEPLOYMENTS
          </div>
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {activeTenants}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            SUSPENDED DEPLOYMENTS
          </div>
          <div className="mt-2 flex items-center gap-2">
            <PauseCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {suspendedTenants}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ALLOCATED STORAGE
          </div>
          <div className="mt-2 flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-sky-500" />
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
              {totalQuota}
              <span className="text-base font-normal text-muted-foreground ml-1">
                GB
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
