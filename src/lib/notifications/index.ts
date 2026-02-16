/**
 * Unified notification dispatcher.
 * Matches detected product changes against alert_configs, looks up
 * notification_settings for the organization, and dispatches to the
 * appropriate channels (email, Slack, in-app).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";
import { sendPriceAlert, sendNewProductAlert } from "./email";
import {
  sendSlackNotification,
  formatPriceAlert,
  formatNewProductAlert,
} from "./slack";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChangeType = Tables<"product_changes">["change_type"];
type AlertConfigRow = Tables<"alert_configs">;
type NotificationSettingsRow = Tables<"notification_settings">;

export interface AlertContext {
  changeType: ChangeType;
  oldValue: string | null;
  newValue: string | null;
  percentageChange: number | null;
}

interface DispatchResult {
  configId: string;
  channels: {
    email: { sent: boolean; error?: string };
    slack: { sent: boolean; error?: string };
    in_app: { sent: boolean; error?: string };
  };
}

export interface NotificationResult {
  dispatched: DispatchResult[];
  skipped: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines whether a given alert_config matches the detected change.
 * Checks change type compatibility (including the "any_change" wildcard),
 * competitor scope, and percentage-based thresholds.
 */
function configMatchesChange(
  config: AlertConfigRow,
  changeType: ChangeType,
  competitorId: string,
  percentageChange: number | null
): boolean {
  // Must be active
  if (!config.is_active) return false;

  // Check change type match (any_change matches everything)
  if (config.alert_type !== "any_change" && config.alert_type !== changeType) {
    return false;
  }

  // Check competitor scope (null = all competitors)
  if (config.competitor_id !== null && config.competitor_id !== competitorId) {
    return false;
  }

  // Check threshold for percentage-based changes
  if (
    config.threshold !== null &&
    percentageChange !== null &&
    Math.abs(percentageChange) < config.threshold
  ) {
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

/**
 * Processes a detected change and dispatches notifications to all matching
 * channels. This is the main entry point for the notification engine.
 *
 * Flow:
 * 1. Query alert_configs for the org that match the change type / competitor / threshold.
 * 2. Query notification_settings for the org to determine enabled channels and webhook URLs.
 * 3. For each matching config, send notifications through the channels listed on that config
 *    (filtered by what is actually enabled in notification_settings).
 * 4. For the "in_app" channel, insert a row into the alerts table.
 * 5. Return a summary of what was dispatched and any errors encountered.
 */
export async function processAlertNotification(
  alert: AlertContext,
  product: Tables<"products">,
  competitor: Tables<"competitors">,
  orgId: string
): Promise<NotificationResult> {
  const supabase = createAdminClient();
  const errors: string[] = [];
  const dispatched: DispatchResult[] = [];
  let skipped = 0;

  // ------------------------------------------------------------------
  // 1. Load alert configs for this organization
  // ------------------------------------------------------------------
  const { data: alertConfigs, error: configsError } = await supabase
    .from("alert_configs")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_active", true);

  if (configsError) {
    errors.push(`Failed to load alert configs: ${configsError.message}`);
    return { dispatched, skipped: 0, errors };
  }

  if (!alertConfigs || alertConfigs.length === 0) {
    return { dispatched, skipped: 0, errors };
  }

  // ------------------------------------------------------------------
  // 2. Load notification settings for this organization
  // ------------------------------------------------------------------
  const { data: notifSettings, error: settingsError } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("organization_id", orgId)
    .single();

  if (settingsError || !notifSettings) {
    errors.push(
      `Failed to load notification settings: ${settingsError?.message ?? "not found"}`
    );
    return { dispatched, skipped: 0, errors };
  }

  // ------------------------------------------------------------------
  // 3. Load org members' email addresses (for email notifications)
  // ------------------------------------------------------------------
  const { data: orgUsers } = await supabase
    .from("users")
    .select("email, role")
    .eq("organization_id", orgId);

  const recipientEmails = (orgUsers ?? []).map((u) => u.email);

  // ------------------------------------------------------------------
  // 4. Filter matching configs
  // ------------------------------------------------------------------
  const matchingConfigs = alertConfigs.filter((config) =>
    configMatchesChange(
      config,
      alert.changeType,
      competitor.id,
      alert.percentageChange
    )
  );

  if (matchingConfigs.length === 0) {
    return { dispatched, skipped: alertConfigs.length, errors };
  }

  // ------------------------------------------------------------------
  // 5. Build shared payload data
  // ------------------------------------------------------------------
  const isNewProduct = alert.changeType === "new_product";

  const priceAlertData = {
    productName: product.name,
    competitorName: competitor.name,
    changeType: alert.changeType,
    oldPrice: alert.oldValue ? parseFloat(alert.oldValue) : 0,
    newPrice: alert.newValue ? parseFloat(alert.newValue) : 0,
    percentageChange: alert.percentageChange ?? 0,
    productUrl: product.url,
  };

  const newProductData = {
    productName: product.name,
    competitorName: competitor.name,
    productUrl: product.url,
    price: alert.newValue ? parseFloat(alert.newValue) : product.current_price ?? 0,
  };

  // ------------------------------------------------------------------
  // 6. Dispatch to each matching config's channels
  // ------------------------------------------------------------------
  for (const config of matchingConfigs) {
    const result: DispatchResult = {
      configId: config.id,
      channels: {
        email: { sent: false },
        slack: { sent: false },
        in_app: { sent: false },
      },
    };

    // ---- Email channel ----
    if (
      config.channels.includes("email") &&
      notifSettings.email_enabled &&
      recipientEmails.length > 0
    ) {
      // For instant frequency, send immediately; otherwise skip (batched emails
      // would be handled by a separate scheduled job).
      if (notifSettings.email_frequency === "instant") {
        for (const email of recipientEmails) {
          try {
            const emailResult = isNewProduct
              ? await sendNewProductAlert(email, newProductData)
              : await sendPriceAlert(email, priceAlertData);

            if (!emailResult.success) {
              errors.push(
                `Email to ${email} failed: ${emailResult.error}`
              );
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Email to ${email} threw: ${msg}`);
          }
        }
        result.channels.email = { sent: true };
      } else {
        // Non-instant: email will be batched by the frequency scheduler
        result.channels.email = { sent: false, error: "deferred (non-instant frequency)" };
      }
    }

    // ---- Slack channel ----
    if (
      config.channels.includes("slack") &&
      notifSettings.slack_enabled &&
      notifSettings.slack_webhook_url
    ) {
      try {
        const slackMessage = isNewProduct
          ? formatNewProductAlert(newProductData)
          : formatPriceAlert(priceAlertData);

        const slackResult = await sendSlackNotification(
          notifSettings.slack_webhook_url,
          slackMessage
        );

        result.channels.slack = {
          sent: slackResult.success,
          error: slackResult.error,
        };

        if (!slackResult.success) {
          errors.push(`Slack notification failed: ${slackResult.error}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Slack notification threw: ${msg}`);
        result.channels.slack = { sent: false, error: msg };
      }
    }

    // ---- In-app channel ----
    if (config.channels.includes("in_app")) {
      try {
        const changeTypeLabels: Record<string, string> = {
          price_increase: "Price Increase",
          price_decrease: "Price Decrease",
          new_product: "New Product",
          out_of_stock: "Out of Stock",
          back_in_stock: "Back in Stock",
          sale_started: "Sale Started",
          sale_ended: "Sale Ended",
        };

        const title = isNewProduct
          ? `New Product: ${product.name}`
          : `${changeTypeLabels[alert.changeType] ?? alert.changeType}: ${product.name}`;

        const message = isNewProduct
          ? `${competitor.name} added a new product "${product.name}" priced at ${newProductData.price ? `£${newProductData.price.toFixed(2)}` : "N/A"}.`
          : `${product.name} (${competitor.name}) changed from £${priceAlertData.oldPrice.toFixed(2)} to £${priceAlertData.newPrice.toFixed(2)} (${priceAlertData.percentageChange > 0 ? "+" : ""}${priceAlertData.percentageChange.toFixed(1)}%).`;

        const severity: "info" | "warning" | "critical" =
          alert.changeType === "out_of_stock"
            ? "warning"
            : alert.percentageChange !== null && Math.abs(alert.percentageChange) > 20
              ? "critical"
              : "info";

        const { error: alertError } = await supabase.from("alerts").insert({
          organization_id: orgId,
          alert_config_id: config.id,
          product_id: product.id,
          competitor_id: competitor.id,
          title,
          message,
          severity,
          change_type: alert.changeType,
          is_read: false,
        });

        if (alertError) {
          errors.push(`In-app alert insert failed: ${alertError.message}`);
          result.channels.in_app = { sent: false, error: alertError.message };
        } else {
          result.channels.in_app = { sent: true };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`In-app alert threw: ${msg}`);
        result.channels.in_app = { sent: false, error: msg };
      }
    }

    dispatched.push(result);
  }

  skipped = alertConfigs.length - matchingConfigs.length;

  return { dispatched, skipped, errors };
}

// Re-export email and slack utilities for direct usage
export {
  sendPriceAlert,
  sendNewProductAlert,
  sendWeeklyReport,
  sendWelcomeEmail,
} from "./email";
export type {
  PriceAlertData as EmailPriceAlertData,
  NewProductAlertData as EmailNewProductAlertData,
  WeeklyReportData,
  WelcomeEmailData,
} from "./email";

export {
  sendSlackNotification,
  formatPriceAlert as formatSlackPriceAlert,
  formatNewProductAlert as formatSlackNewProductAlert,
} from "./slack";
export type {
  SlackMessage,
  SlackBlock,
  PriceAlertData as SlackPriceAlertData,
  NewProductAlertData as SlackNewProductAlertData,
} from "./slack";
