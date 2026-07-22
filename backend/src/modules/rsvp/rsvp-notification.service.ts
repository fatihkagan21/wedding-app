import { resolve4 } from "node:dns/promises";
import { isIP } from "node:net";
import nodemailer from "nodemailer";
import { CreateRsvpDto } from "./dto/create-rsvp.dto.js";

type EventDetails = {
  title: string;
  brideName: string;
  groomName: string;
  eventDate: Date;
};

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

const escapeHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const optionalText = (value?: string): string => value?.trim() || "Belirtilmedi";

const getPositiveIntegerEnv = (key: string, fallback: number): number => {
  const value = Number(process.env[key]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const shouldForceIpv4 = (): boolean => process.env.SMTP_FORCE_IPV4 !== "false";

const resolveSmtpHost = async (host: string): Promise<{ host: string; servername?: string; family: "ipv4" | "default" }> => {
  if (!shouldForceIpv4() || isIP(host)) {
    return { host, family: "default" };
  }

  try {
    const [address] = await resolve4(host);
    if (address) {
      return { host: address, servername: host, family: "ipv4" };
    }
  } catch (error) {
    console.warn("SMTP IPv4 resolution failed, falling back to hostname", {
      smtpHost: host,
      error,
    });
  }

  return { host, family: "default" };
};

const maskEmail = (email: string): string => {
  const trimmed = email.trim();
  const [localPart, domain] = trimmed.split("@");

  if (!localPart || !domain) {
    return trimmed ? "[invalid-email]" : "[empty-email]";
  }

  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
  return `${visiblePrefix}***@${domain}`;
};

const maskEmailList = (emails: string): string => emails
  .split(",")
  .map(maskEmail)
  .join(",");

const parseEmailList = (emails: string): string[] => emails
  .split(",")
  .map(email => email.trim())
  .filter(Boolean);

export const buildRsvpNotification = (data: CreateRsvpDto, event: EventDetails) => {
  const attendanceLabel = data.attending ? "Katılıyor" : "Katılmıyor";
  const attendeeNames = data.attending && data.attendees?.length
    ? data.attendees.join(", ")
    : "-";
  const attendeeCount = data.attending ? String(data.attendeeCount ?? 0) : "0";
  const eventDate = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(event.eventDate);

  const subject = `Yeni katılım bildirimi: ${data.contactFullName} - ${attendanceLabel}`;
  const text = [
    `Etkinlik: ${event.title} (${event.brideName} & ${event.groomName})`,
    `Tarih: ${eventDate}`,
    `İletişim kişisi: ${data.contactFullName}`,
    `Katılım durumu: ${attendanceLabel}`,
    `Kişi sayısı: ${attendeeCount}`,
    `Katılımcılar: ${attendeeNames}`,
    `Not: ${optionalText(data.notes)}`,
  ].join("\n");

  const rows = [
    ["Etkinlik", `${event.title} (${event.brideName} & ${event.groomName})`],
    ["Tarih", eventDate],
    ["İletişim kişisi", data.contactFullName],
    ["Katılım durumu", attendanceLabel],
    ["Kişi sayısı", attendeeCount],
    ["Katılımcılar", attendeeNames],
    ["Not", optionalText(data.notes)],
  ];
  const htmlRows = rows.map(([label, value]) => `
    <tr>
      <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #eee">${escapeHtml(label)}</th>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(value)}</td>
    </tr>`).join("");

  return {
    subject,
    text,
    html: `<h2>Yeni katılım bildirimi</h2><table style="border-collapse:collapse">${htmlRows}</table>`,
  };
};

const sendBrevoNotification = async (params: {
  content: EmailContent;
  eventId: string;
  from: string;
  to: string;
}): Promise<boolean> => {
  const { BREVO_API_KEY } = process.env;
  if (!BREVO_API_KEY) {
    return false;
  }

  const recipients = parseEmailList(params.to).map(email => ({ email }));
  if (!recipients.length) {
    console.error("RSVP email notification skipped: recipient list is empty", {
      eventId: params.eventId,
    });
    return false;
  }

  const senderEmail = process.env.BREVO_FROM || params.from;
  const senderName = process.env.BREVO_SENDER_NAME || "RSVP Bildirimi";
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: recipients,
      subject: params.content.subject,
      htmlContent: params.content.html,
    }),
    signal: AbortSignal.timeout(getPositiveIntegerEnv("EMAIL_API_TIMEOUT_MS", 10000)),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Brevo email API failed with ${response.status}: ${responseBody}`);
  }

  console.info("RSVP email notification sent via Brevo", {
    eventId: params.eventId,
    response: responseBody,
    from: maskEmail(senderEmail),
    to: maskEmailList(params.to),
  });
  return true;
};

export const sendRsvpNotification = async (data: CreateRsvpDto, event: EventDetails): Promise<boolean> => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, RSVP_NOTIFICATION_EMAIL } = process.env;
  const content = buildRsvpNotification(data, event);
  const from = process.env.SMTP_FROM || SMTP_USER;

  if (process.env.BREVO_API_KEY && RSVP_NOTIFICATION_EMAIL && from) {
    return sendBrevoNotification({
      content,
      eventId: data.eventId,
      from,
      to: RSVP_NOTIFICATION_EMAIL,
    });
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !RSVP_NOTIFICATION_EMAIL) {
    const missingKeys = [
      ["SMTP_HOST", SMTP_HOST],
      ["SMTP_USER", SMTP_USER],
      ["SMTP_PASS", SMTP_PASS],
      ["RSVP_NOTIFICATION_EMAIL", RSVP_NOTIFICATION_EMAIL],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    console.warn("RSVP email notification skipped: SMTP configuration is incomplete", {
      missingKeys,
      eventId: data.eventId,
    });
    return false;
  }

  const smtpFrom = from || SMTP_USER;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port <= 0) {
    console.error("RSVP email notification skipped: SMTP_PORT is invalid", {
      smtpPort: process.env.SMTP_PORT,
      eventId: data.eventId,
    });
    return false;
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const smtpTarget = await resolveSmtpHost(SMTP_HOST);
  const transporter = nodemailer.createTransport({
    host: smtpTarget.host,
    port,
    secure,
    connectionTimeout: getPositiveIntegerEnv("SMTP_CONNECTION_TIMEOUT_MS", 10000),
    greetingTimeout: getPositiveIntegerEnv("SMTP_GREETING_TIMEOUT_MS", 10000),
    socketTimeout: getPositiveIntegerEnv("SMTP_SOCKET_TIMEOUT_MS", 15000),
    dnsTimeout: getPositiveIntegerEnv("SMTP_DNS_TIMEOUT_MS", 10000),
    tls: smtpTarget.servername ? { servername: smtpTarget.servername } : undefined,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  console.info("Sending RSVP email notification", {
    eventId: data.eventId,
    attending: data.attending,
    attendeeCount: data.attending ? data.attendeeCount ?? 0 : 0,
    smtpHost: SMTP_HOST,
    smtpPort: port,
    smtpSecure: secure,
    smtpAddressFamily: smtpTarget.family,
    from: maskEmail(smtpFrom),
    to: maskEmailList(RSVP_NOTIFICATION_EMAIL),
  });

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: RSVP_NOTIFICATION_EMAIL,
    ...content,
  });

  console.info("RSVP email notification sent", {
    eventId: data.eventId,
    messageId: info.messageId,
    acceptedCount: Array.isArray(info.accepted) ? info.accepted.length : undefined,
    rejectedCount: Array.isArray(info.rejected) ? info.rejected.length : undefined,
  });
  return true;
};
