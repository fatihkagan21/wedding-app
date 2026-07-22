import assert from "node:assert/strict";
import test from "node:test";
import { buildRsvpNotification } from "./rsvp-notification.service.js";

const event = {
  title: "Düğün",
  brideName: "Özge",
  groomName: "Fatih",
  eventDate: new Date("2026-09-05T16:00:00+03:00"),
};

test("builds an attending RSVP notification with guest details", () => {
  const notification = buildRsvpNotification({
    eventId: "event-id",
    contactFullName: "Ayşe Yılmaz",
    attending: true,
    attendeeCount: 2,
    attendees: ["Ayşe Yılmaz", "Can Yılmaz"],
    notes: "Vejetaryen menü",
  }, event);

  assert.match(notification.subject, /Ayşe Yılmaz - Katılıyor/);
  assert.match(notification.text, /Kişi sayısı: 2/);
  assert.match(notification.text, /Ayşe Yılmaz, Can Yılmaz/);
  assert.match(notification.text, /Vejetaryen menü/);
});

test("escapes user-provided HTML in the notification", () => {
  const notification = buildRsvpNotification({
    eventId: "event-id",
    contactFullName: "<script>alert('x')</script>",
    attending: false,
    notes: "<b>not</b>",
  }, event);

  assert.doesNotMatch(notification.html, /<script>|<b>not<\/b>/);
  assert.match(notification.html, /&lt;script&gt;/);
  assert.match(notification.text, /Katılım durumu: Katılmıyor/);
});
