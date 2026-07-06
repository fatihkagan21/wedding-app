import type { Event } from '../../generated/prisma/client.js';

const CRLF = '\r\n';
const ISTANBUL_TIME_ZONE = 'Europe/Istanbul';

const formatICSDateUtc = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

const formatICSDate = (date: Date, timeZone: string): string => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {} as Record<string, string>);

  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
};

export const escapeICSText = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
};

export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

const foldICSLine = (line: string): string => {
  const folded: string[] = [];
  let current = '';
  let byteLimit = 75;

  for (const character of line) {
    if (Buffer.byteLength(current + character, 'utf8') > byteLimit) {
      folded.push(current);
      current = character;
      byteLimit = 74;
    } else {
      current += character;
    }
  }

  folded.push(current);
  return folded.map((part, index) => (index === 0 ? part : ` ${part}`)).join(CRLF);
};

const foldICSLines = (lines: string[]): string => {
  return lines.map(foldICSLine).join(CRLF) + CRLF;
};

export const createEventCalendarICS = (event: Event, publicUrl: string): string => {
  const eventDate = new Date(event.eventDate);
  const start = eventDate;
  const end = addHours(start, 4);
  const dtstamp = formatICSDateUtc(new Date());
  const dtstart = formatICSDate(start, ISTANBUL_TIME_ZONE);
  const dtend = formatICSDate(end, ISTANBUL_TIME_ZONE);
  const uid = `${event.id}@wedding-app`;
  const location = escapeICSText(`${event.venueName}, ${event.venueAddress}`);
  const description = escapeICSText(
    [
      `Davetiye linki: ${publicUrl}`,
      `${event.brideName} & ${event.groomName} düğünü`,
      `${event.venueName} - ${event.venueAddress}`,
      event.description,
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n')
  );
  const summary = escapeICSText(`${event.brideName} & ${event.groomName} Düğünü`);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Istanbul',
    'X-LIC-LOCATION:Europe/Istanbul',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0300',
    'TZNAME:GMT+3',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${summary}`,
    `DTSTART;TZID=${ISTANBUL_TIME_ZONE}:${dtstart}`,
    `DTEND;TZID=${ISTANBUL_TIME_ZONE}:${dtend}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    `URL:${publicUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return foldICSLines(lines);
};
