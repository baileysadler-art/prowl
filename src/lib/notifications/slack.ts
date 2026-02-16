/**
 * Slack webhook notification sender.
 * Formats rich Block Kit messages for price alerts and new product discoveries,
 * and posts them to a Slack incoming webhook URL.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text?: string | {
      type: string;
      text: string;
      emoji?: boolean;
    };
    url?: string;
    action_id?: string;
  }>;
  accessory?: {
    type: string;
    text?: {
      type: string;
      text: string;
      emoji?: boolean;
    };
    url?: string;
  };
}

export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

export interface PriceAlertData {
  productName: string;
  competitorName: string;
  changeType: string;
  oldPrice: number;
  newPrice: number;
  percentageChange: number;
  productUrl: string;
}

export interface NewProductAlertData {
  productName: string;
  competitorName: string;
  productUrl: string;
  price: number;
}

interface SlackResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function changeTypeEmoji(changeType: string): string {
  const emojis: Record<string, string> = {
    price_increase: ":chart_with_upwards_trend:",
    price_decrease: ":chart_with_downwards_trend:",
    new_product: ":new:",
    out_of_stock: ":warning:",
    back_in_stock: ":white_check_mark:",
    sale_started: ":tada:",
    sale_ended: ":octagonal_sign:",
  };
  return emojis[changeType] ?? ":bell:";
}

function changeTypeLabel(changeType: string): string {
  const labels: Record<string, string> = {
    price_increase: "Price Increase",
    price_decrease: "Price Decrease",
    new_product: "New Product",
    out_of_stock: "Out of Stock",
    back_in_stock: "Back in Stock",
    sale_started: "Sale Started",
    sale_ended: "Sale Ended",
  };
  return labels[changeType] ?? changeType;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends a message payload to a Slack incoming webhook URL.
 */
export async function sendSlackNotification(
  webhookUrl: string,
  message: SlackMessage
): Promise<SlackResult> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[slack] Webhook error:", response.status, errorBody);
      return {
        success: false,
        error: `Slack webhook error: ${response.status} - ${errorBody}`,
      };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error("[slack] Failed to send notification:", message);
    return { success: false, error: message };
  }
}

/**
 * Formats a price change alert into Slack Block Kit blocks.
 */
export function formatPriceAlert(data: PriceAlertData): SlackMessage {
  const {
    productName,
    competitorName,
    changeType,
    oldPrice,
    newPrice,
    percentageChange,
    productUrl,
  } = data;

  const emoji = changeTypeEmoji(changeType);
  const direction = percentageChange > 0 ? "+" : "";
  const label = changeTypeLabel(changeType);

  const text = `${label}: ${productName} (${competitorName}) - ${formatCurrency(oldPrice)} -> ${formatCurrency(newPrice)} (${direction}${percentageChange.toFixed(1)}%)`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji}  ${label}`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${productUrl}|${productName}>*\n${competitorName}`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Old Price*\n${formatCurrency(oldPrice)}`,
        },
        {
          type: "mrkdwn",
          text: `*New Price*\n${formatCurrency(newPrice)}`,
        },
        {
          type: "mrkdwn",
          text: `*Change*\n${direction}${percentageChange.toFixed(1)}%`,
        },
        {
          type: "mrkdwn",
          text: `*Type*\n${label}`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Product",
            emoji: true,
          },
          url: productUrl,
          action_id: "view_product",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Open Dashboard",
            emoji: true,
          },
          url: "https://app.prowl.io/dashboard",
          action_id: "open_dashboard",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Detected by *Prowl* at ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
        },
      ],
    },
  ];

  return { text, blocks };
}

/**
 * Formats a new product discovery alert into Slack Block Kit blocks.
 */
export function formatNewProductAlert(data: NewProductAlertData): SlackMessage {
  const { productName, competitorName, productUrl, price } = data;

  const text = `New Product: ${productName} (${competitorName}) - ${formatCurrency(price)}`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: ":new:  New Product Discovered",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${productUrl}|${productName}>*\n${competitorName}`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Price*\n${formatCurrency(price)}`,
        },
        {
          type: "mrkdwn",
          text: `*Competitor*\n${competitorName}`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Product",
            emoji: true,
          },
          url: productUrl,
          action_id: "view_product",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Open Dashboard",
            emoji: true,
          },
          url: "https://app.prowl.io/dashboard",
          action_id: "open_dashboard",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Detected by *Prowl* at ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
        },
      ],
    },
  ];

  return { text, blocks };
}
