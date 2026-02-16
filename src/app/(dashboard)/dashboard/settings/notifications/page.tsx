"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<{
    id: string;
    email_enabled: boolean;
    email_frequency: string;
    slack_enabled: boolean;
    slack_webhook_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("users")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      const profile = profileData as any;
      if (!profile?.organization_id) return;

      const { data } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .single();

      if (data) setSettings(data as any);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!settings) return;
    setLoading(true);

    const { error } = await (supabase
      .from("notification_settings") as any)
      .update({
        email_enabled: settings.email_enabled,
        email_frequency: settings.email_frequency,
        slack_enabled: settings.slack_enabled,
        slack_webhook_url: settings.slack_webhook_url,
      })
      .eq("id", settings.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Notification settings saved");
    }
    setLoading(false);
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notifications" description="Configure how you receive alerts" />
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Loading settings...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Configure how you receive alerts" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Notifications</CardTitle>
            <CardDescription>
              Receive alerts and reports via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable email notifications</Label>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(v) =>
                  setSettings({ ...settings, email_enabled: v })
                }
              />
            </div>
            {settings.email_enabled && (
              <div className="space-y-2">
                <Label>Email Frequency</Label>
                <Select
                  value={settings.email_frequency}
                  onValueChange={(v) =>
                    setSettings({ ...settings, email_frequency: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Slack Integration</CardTitle>
            <CardDescription>
              Send alerts to a Slack channel via webhook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Slack notifications</Label>
              <Switch
                checked={settings.slack_enabled}
                onCheckedChange={(v) =>
                  setSettings({ ...settings, slack_enabled: v })
                }
              />
            </div>
            {settings.slack_enabled && (
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slack_webhook_url || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      slack_webhook_url: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-slate-500">
                  Create an Incoming Webhook in your Slack workspace settings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
