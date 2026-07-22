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
    console.warn("RSVP email notification skipped: SMTP configuration is incomplete");
    return false;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port <= 0) {
    console.error("RSVP email notification skipped: SMTP_PORT is invalid");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const content = buildRsvpNotification(data, event);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || SMTP_USER,
    to: RSVP_NOTIFICATION_EMAIL,
    ...content,
  });
  return true;
};
