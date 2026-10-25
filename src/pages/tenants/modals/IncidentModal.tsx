import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

export interface IncidentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  confirmLoading: boolean;
  form?: any;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
}) => {
  const [status, setStatus] = useState("DEGRADED");
  const [severity, setSeverity] = useState("SEV-2");
  const [incidentState, setIncidentState] = useState("INVESTIGATING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStatus("DEGRADED");
      setSeverity("SEV-2");
      setIncidentState("INVESTIGATING");
      setTitle("");
      setDescription("");
      setRootCause("");
      setActionTaken("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Please provide incident title");
      return;
    }
    setError(null);
    onSubmit({
      status,
      severity,
      incident_state: incidentState,
      title,
      description,
      root_cause: rootCause,
      action_taken: actionTaken,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Incident Management &amp; Status Circuit Breaker</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="space-y-1">
            <Label htmlFor="inc-status" className="text-xs font-semibold">
              Tenant Circuit State *
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="inc-status" className="h-9 text-xs">
                <SelectValue placeholder="Select circuit state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE (Normal Operation)</SelectItem>
                <SelectItem value="DEGRADED">DEGRADED (Elevated Latency / Issues)</SelectItem>
                <SelectItem value="INCIDENT">INCIDENT (Severe Outage / Accident)</SelectItem>
                <SelectItem value="MAINTENANCE">MAINTENANCE (Emergency Maintenance Mode)</SelectItem>
                <SelectItem value="SUSPENDED">SUSPENDED (Compute Scaled to 0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="inc-sev" className="text-xs font-semibold">
                Severity Level
              </Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger id="inc-sev" className="h-9 text-xs">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEV-1">SEV-1 Critical Outage</SelectItem>
                  <SelectItem value="SEV-2">SEV-2 Major Degradation</SelectItem>
                  <SelectItem value="SEV-3">SEV-3 Minor Impairment</SelectItem>
                  <SelectItem value="Notice">Operational Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="inc-res-state" className="text-xs font-semibold">
                Resolution State
              </Label>
              <Select value={incidentState} onValueChange={setIncidentState}>
                <SelectTrigger id="inc-res-state" className="h-9 text-xs">
                  <SelectValue placeholder="Select resolution state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVESTIGATING">INVESTIGATING</SelectItem>
                  <SelectItem value="IDENTIFIED">IDENTIFIED</SelectItem>
                  <SelectItem value="MITIGATING">MITIGATING</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="inc-title" className="text-xs font-semibold">
              Incident Title / Summary *
            </Label>
            <Input
              id="inc-title"
              required
              placeholder="e.g. High memory utilization in Storix worker container"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inc-desc" className="text-xs font-semibold">
              Incident Details
            </Label>
            <Textarea
              id="inc-desc"
              rows={2}
              placeholder="Explain observed symptoms, error codes, and customer impact"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inc-rc" className="text-xs font-semibold">
              Root Cause Analysis
            </Label>
            <Textarea
              id="inc-rc"
              rows={2}
              placeholder="e.g. DB connection leak, EFS IOPS burst capacity exhausted, large sync storm"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inc-action" className="text-xs font-semibold">
              Remediation / Corrective Action
            </Label>
            <Textarea
              id="inc-action"
              rows={2}
              placeholder="e.g. Triggered container task rolling restart, scaled resources, isolated tenant traffic"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={confirmLoading}
              className="bg-red-600 hover:bg-red-600/90 text-white"
            >
              {confirmLoading ? "Updating..." : "Update Incident Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
