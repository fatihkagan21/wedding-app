import nodemailer from "nodemailer";
import { CreateRsvpDto } from "./dto/create-rsvp.dto.js";

type EventDetails = {
  title: string;
  brideName: string;
  groomName: string;
  eventDate: Date;
};

const escapeHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const optionalText = (value?: string): string => value?.trim() || "Belirtilmedi";

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

export const sendRsvpNotification = async (data: CreateRsvpDto, event: EventDetails): Promise<boolean> => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, RSVP_NOTIFICATION_EMAIL } = process.env;
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

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port <= 0) {
    console.error("RSVP email notification skipped: SMTP_PORT is invalid", {
      smtpPort: process.env.SMTP_PORT,
      eventId: data.eventId,
    });
    return false;
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const content = buildRsvpNotification(data, event);
  const from = process.env.SMTP_FROM || SMTP_USER;

  console.info("Sending RSVP email notification", {
    eventId: data.eventId,
    attending: data.attending,
    attendeeCount: data.attending ? data.attendeeCount ?? 0 : 0,
    smtpHost: SMTP_HOST,
    smtpPort: port,
    smtpSecure: secure,
    from: maskEmail(from),
    to: maskEmailList(RSVP_NOTIFICATION_EMAIL),
  });

  const info = await transporter.sendMail({
    from,
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
