"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { changeTypeLabels } from "@/lib/constants";

interface AlertConfig {
  id: string;
  name: string;
  alert_type: string;
  threshold: number | null;
  competitor_id: string | null;
  channels: string[];
  is_active: boolean;
  competitors: { name: string } | null;
}

interface AlertRulesManagerProps {
  alertConfigs: AlertConfig[];
  competitors: { id: string; name: string }[];
  organizationId: string;
}

export function AlertRulesManager({
  alertConfigs: initial,
  competitors,
  organizationId,
}: AlertRulesManagerProps) {
  const [configs, setConfigs] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [alertType, setAlertType] = useState("any_change");
  const [threshold, setThreshold] = useState("");
  const [competitorId, setCompetitorId] = useState("all");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const supabase = createClient();

  async function handleCreate() {
    const { data, error } = await supabase
      .from("alert_configs")
      .insert({
        organization_id: organizationId,
        name,
        alert_type: alertType,
        threshold: threshold ? parseFloat(threshold) : null,
        competitor_id: competitorId === "all" ? null : competitorId,
        channels,
      })
      .select("*, competitors(name)")
      .single();

    if (error) {
      toast.error("Failed to create alert rule");
      return;
    }

    setConfigs((prev) => [data, ...prev]);
    setDialogOpen(false);
    setName("");
    setAlertType("any_change");
    setThreshold("");
    setCompetitorId("all");
    toast.success("Alert rule created");
  }

  async function toggleActive(id: string, isActive: boolean) {
    const { error } = await supabase
      .from("alert_configs")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      setConfigs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !isActive } : c))
      );
    }
  }

  async function deleteRule(id: string) {
    const { error } = await supabase
      .from("alert_configs")
      .delete()
      .eq("id", id);

    if (!error) {
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      toast.success("Alert rule deleted");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Alert Rules</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g. Price drops over 10%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any_change">Any Change</SelectItem>
                    <SelectItem value="price_increase">Price Increase</SelectItem>
                    <SelectItem value="price_decrease">Price Decrease</SelectItem>
                    <SelectItem value="new_product">New Product</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="back_in_stock">Back in Stock</SelectItem>
                    <SelectItem value="sale_started">Sale Started</SelectItem>
                    <SelectItem value="sale_ended">Sale Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(alertType === "price_increase" || alertType === "price_decrease") && (
                <div className="space-y-2">
                  <Label>Threshold (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    Only alert when change exceeds this percentage
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Competitor</Label>
                <Select value={competitorId} onValueChange={setCompetitorId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Competitors</SelectItem>
                    {competitors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={channels.includes("email")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setChannels([...channels, "email"]);
                        } else {
                          setChannels(channels.filter((c) => c !== "email"));
                        }
                      }}
                      className="rounded"
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={channels.includes("slack")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setChannels([...channels, "slack"]);
                        } else {
                          setChannels(channels.filter((c) => c !== "slack"));
                        }
                      }}
                      className="rounded"
                    />
                    Slack
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={channels.includes("in_app")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setChannels([...channels, "in_app"]);
                        } else {
                          setChannels(channels.filter((c) => c !== "in_app"));
                        }
                      }}
                      className="rounded"
                    />
                    In-App
                  </label>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!name}
              >
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            No alert rules configured. Create one to start receiving notifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Switch
                  checked={config.is_active}
                  onCheckedChange={() =>
                    toggleActive(config.id, config.is_active)
                  }
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{config.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {changeTypeLabels[config.alert_type] || config.alert_type}
                    </Badge>
                    {config.threshold && (
                      <Badge variant="outline" className="text-xs">
                        &gt; {config.threshold}%
                      </Badge>
                    )}
                    {config.competitors?.name && (
                      <Badge variant="outline" className="text-xs">
                        {config.competitors.name}
                      </Badge>
                    )}
                    {config.channels.map((ch) => (
                      <Badge key={ch} variant="outline" className="text-xs capitalize">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRule(config.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
