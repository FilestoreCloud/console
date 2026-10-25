import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Boxes,
  ShieldCheck,
  Activity,
  Bell,
  Sun,
  Moon,
  Zap,
} from "lucide-react";

export interface CommandPaletteProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

interface CommandItem {
  key: string;
  category: "Navigation" | "Action" | "Quick Setting";
  title: string;
  description: string;
  icon: React.ReactNode;
  handler: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isDark,
  onToggleTheme,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    {
      key: "nav-dashboard",
      category: "Navigation",
      title: "Control Plane Dashboard",
      description: "Overview metrics, fleet telemetry, and Cloud Audit Trail",
      icon: <Activity className="h-5 w-5 text-primary" />,
      handler: () => {
        navigate("/dashboard");
        setOpen(false);
      },
    },
    {
      key: "nav-tenants",
      category: "Navigation",
      title: "Fleet Tenants",
      description: "Manage tenant instances, sandbox staging, and scaling",
      icon: <Boxes className="h-5 w-5 text-blue-500" />,
      handler: () => {
        navigate("/tenants");
        setOpen(false);
      },
    },
    {
      key: "act-theme",
      category: "Quick Setting",
      title: `Switch to ${isDark ? "Light" : "Dark"} Mode`,
      description: "Toggle dynamic light/dark color theme",
      icon: isDark ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-500" />
      ),
      handler: () => {
        if (onToggleTheme) onToggleTheme();
        setOpen(false);
      },
    },
    {
      key: "act-suspend",
      category: "Action",
      title: "Emergency Suspend: dev-tenant",
      description: "Scale ECS Fargate tasks to 0 for FinOps cost reduction",
      icon: <Zap className="h-5 w-5 text-red-500" />,
      handler: () => {
        navigate("/tenants");
        setOpen(false);
      },
    },
    {
      key: "act-resume",
      category: "Action",
      title: "Resume Fleet: dev-tenant",
      description: "Scale ECS Fargate tasks to 1 for active user traffic",
      icon: <Zap className="h-5 w-5 text-teal-500" />,
      handler: () => {
        navigate("/tenants");
        setOpen(false);
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type a command or search (e.g. Tenants, Audit, Theme, Suspend)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 h-11 text-base border-none shadow-none focus-visible:ring-0 bg-transparent"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto px-2 pb-2 divide-y divide-border/50">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.key}
                onClick={item.handler}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded bg-muted/60">{item.icon}</div>
                  <div>
                    <div className="font-medium text-sm text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    item.category === "Navigation"
                      ? "info"
                      : item.category === "Action"
                      ? "destructive"
                      : "warning"
                  }
                  className="text-[11px] font-normal"
                >
                  {item.category}
                </Badge>
              </div>
            ))
          )}
        </div>

        <div className="border-t bg-muted/40 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Use <b>↑</b> <b>↓</b> to navigate, <b>ESC</b> to dismiss</span>
          <span>Storix Command Palette <b>Cmd + K</b></span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
