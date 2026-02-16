/**
 * Email notification sender using the Resend API.
 * Sends transactional emails for price alerts, new products, weekly reports,
 * and welcome messages via simple HTML templates.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "Prowl <notifications@prowl.io>";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export interface WeeklyReportTopMover {
  productName: string;
  competitorName: string;
  changeType: string;
  percentageChange: number;
  oldPrice: number;
  newPrice: number;
}

export interface WeeklyReportData {
  orgName: string;
  periodStart: string;
  periodEnd: string;
  totalChanges: number;
  topMovers: WeeklyReportTopMover[];
}

export interface WelcomeEmailData {
  fullName: string;
  orgName: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return key;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[email] Resend API error:", response.status, errorBody);
      return { success: false, error: `Resend API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[email] Failed to send email:", message);
    return { success: false, error: message };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
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

function changeTypeColor(changeType: string): string {
  if (changeType === "price_decrease" || changeType === "back_in_stock") {
    return "#059669";
  }
  if (changeType === "price_increase" || changeType === "out_of_stock") {
    return "#dc2626";
  }
  return "#2563eb";
}

// ---------------------------------------------------------------------------
// Shared template wrapper
// ---------------------------------------------------------------------------

function wrapInLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Prowl</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                You received this email because of your notification settings in Prowl.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">
                <a href="https://app.prowl.io/dashboard/alerts/settings" style="color: #64748b; text-decoration: underline;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends a price alert email when a product's price changes.
 */
export async function sendPriceAlert(
  to: string,
  data: PriceAlertData
): Promise<SendEmailResult> {
  const { productName, competitorName, changeType, oldPrice, newPrice, percentageChange, productUrl } = data;
  const color = changeTypeColor(changeType);
  const direction = percentageChange > 0 ? "+" : "";
  const arrow = percentageChange > 0 ? "&uarr;" : "&darr;";

  const subject = `${changeTypeLabel(changeType)}: ${productName} (${competitorName})`;

  const body = `
    <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #0f172a;">
      Price Alert
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #64748b;">
      A price change was detected for a product you're monitoring.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Product</p>
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0f172a;">${productName}</p>

          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Competitor</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">${competitorName}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%">
                <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b;">Old Price</p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #334155;">${formatCurrency(oldPrice)}</p>
              </td>
              <td width="33%" style="text-align: center;">
                <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b;">New Price</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${color};">${formatCurrency(newPrice)}</p>
              </td>
              <td width="33%" style="text-align: right;">
                <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b;">Change</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${color};">${arrow} ${direction}${percentageChange.toFixed(1)}%</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius: 6px; background-color: #0f172a;">
          <a href="${productUrl}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">
            View Product
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail(to, subject, wrapInLayout(subject, body));
}

/**
 * Sends a notification when a new competitor product is discovered.
 */
export async function sendNewProductAlert(
  to: string,
  data: NewProductAlertData
): Promise<SendEmailResult> {
  const { productName, competitorName, productUrl, price } = data;

  const subject = `New Product: ${productName} (${competitorName})`;

  const body = `
    <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #0f172a;">
      New Product Discovered
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #64748b;">
      A new product has been detected from one of your monitored competitors.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Product</p>
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0f172a;">${productName}</p>

          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Competitor</p>
          <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">${competitorName}</p>

          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Price</p>
          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #2563eb;">${formatCurrency(price)}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius: 6px; background-color: #0f172a;">
          <a href="${productUrl}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">
            View Product
          </a>
        </td>
      </tr>
    </table>
  `;

  return sendEmail(to, subject, wrapInLayout(subject, body));
}

/**
 * Sends a weekly summary report email.
 */
export async function sendWeeklyReport(
  to: string,
  data: WeeklyReportData
): Promise<SendEmailResult> {
  const { orgName, periodStart, periodEnd, totalChanges, topMovers } = data;

  const subject = `Weekly Report: ${orgName} (${periodStart} - ${periodEnd})`;

  const moverRows = topMovers
    .map(
      (mover) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">
          ${mover.productName}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">
          ${mover.competitorName}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: ${changeTypeColor(mover.changeType)}; font-weight: 600; text-align: right;">
          ${mover.percentageChange > 0 ? "+" : ""}${mover.percentageChange.toFixed(1)}%
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: right;">
          ${formatCurrency(mover.oldPrice)} &rarr; ${formatCurrency(mover.newPrice)}
        </td>
      </tr>`
    )
    .join("");

  const topMoversSection =
    topMovers.length > 0
      ? `
    <p style="margin: 24px 0 12px; font-size: 15px; font-weight: 600; color: #0f172a;">Top Movers</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <tr style="background-color: #f8fafc;">
        <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
        <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Competitor</th>
        <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Change</th>
        <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
      </tr>
      ${moverRows}
    </table>`
      : "";

  const body = `
    <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #0f172a;">
      Weekly Report
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #64748b;">
      Here's your competitive pricing summary for ${orgName}.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td width="50%" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b;">Period</p>
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">${periodStart} &ndash; ${periodEnd}</p>
        </td>
        <td width="16"></td>
        <td width="50%" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 500; color: #64748b;">Total Changes</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #0f172a;">${totalChanges}</p>
        </td>
      </tr>
    </table>

    ${topMoversSection}

    <div style="margin-top: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-radius: 6px; background-color: #0f172a;">
            <a href="https://app.prowl.io/dashboard" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">
              View Full Dashboard
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  return sendEmail(to, subject, wrapInLayout(subject, body));
}

/**
 * Sends a welcome email to a new user.
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<SendEmailResult> {
  const { fullName, orgName } = data;
  const firstName = fullName.split(" ")[0] || fullName;

  const subject = `Welcome to Prowl, ${firstName}!`;

  const body = `
    <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #0f172a;">
      Welcome to Prowl
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #64748b;">
      Hi ${firstName}, you're all set up with <strong>${orgName}</strong>.
    </p>

    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Prowl helps you stay on top of your competitors' pricing. Here's how to get started:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px;">
                <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background-color: #0f172a; color: #ffffff; border-radius: 50%; font-size: 13px; font-weight: 600;">1</span>
              </td>
              <td>
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #0f172a;">Add Competitors</p>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Add the websites you want to monitor and configure their product pages.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 16px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px;">
                <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background-color: #0f172a; color: #ffffff; border-radius: 50%; font-size: 13px; font-weight: 600;">2</span>
              </td>
              <td>
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #0f172a;">Set Up Alerts</p>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Configure alert rules so you're notified when prices change beyond your thresholds.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>
      <tr>
        <td style="padding: 16px; background-color: #f8fafc; border-radius: 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px;">
                <span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background-color: #0f172a; color: #ffffff; border-radius: 50%; font-size: 13px; font-weight: 600;">3</span>
              </td>
              <td>
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #0f172a;">Review Reports</p>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Get weekly summaries and dive into pricing trends from your dashboard.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius: 6px; background-color: #0f172a;">
          <a href="https://app.prowl.io/dashboard/competitors/new" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">
            Add Your First Competitor
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">
      If you have any questions, reply to this email and we'll be happy to help.
    </p>
  `;

  return sendEmail(to, subject, wrapInLayout(subject, body));
}
