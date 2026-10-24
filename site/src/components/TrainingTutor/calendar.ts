/**
 * Turns the tutor's ```schedule block (written at the end of Unit 4) into a
 * calendar file the teacher can open in Google Calendar, Outlook or Apple
 * Calendar. Each class gets an event, and right after it a 10-minute
 * reminder to reflect on the class in Unit 6.
 *
 * The block has one class per line, in the format the Unit 4 tutor
 * instructions ask for:
 *
 *   2026-11-03 10:15 | 45 | Session 1: Know Your Space
 *   2026-11-10 | 45 | Session 2: Match the Code      (no time: an all-day event)
 *
 * Times are "floating" (no time zone), so they show at that time wherever
 * the teacher's calendar is.
 */

export interface ClassSession {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM, or '' for no set time
  minutes: number;
  title: string;
}

const LINE = /^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}):(\d{2}))?\s*\|\s*(\d+)\s*\|\s*(.+)$/;

export function parseSchedule(text: string): ClassSession[] {
  const sessions: ClassSession[] = [];
  for (const line of text.split('\n')) {
    const match = line.trim().match(LINE);
    if (!match) continue;
    const [, date, hour, minute, minutes, title] = match;
    sessions.push({
      date,
      time: hour ? `${hour.padStart(2, '0')}:${minute}` : '',
      minutes: Number(minutes),
      title: title.trim(),
    });
  }
  return sessions;
}

// A floating local date-time, e.g. 20261103T101500
function stamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}00`
  );
}

// Commas, semicolons and backslashes must be escaped in calendar text
function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
}

export function calendarFile(sessions: ClassSession[], reflectUrl: string): string {
  const created = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'); // UTC, e.g. 20261024T224500Z
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Navigation Games//Teacher course//EN'];
  const event = (uid: string, start: string[], end: string[], summary: string, description: string) =>
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}@curriculum.navigationgames.org`,
      `DTSTAMP:${created}`,
      ...start,
      ...end,
      `SUMMARY:${escape(summary)}`,
      `DESCRIPTION:${escape(description)}`,
      'END:VEVENT',
    );

  sessions.forEach((session, i) => {
    const uid = `ng-class-${session.date}-${i}`;
    const reflect = `After class, take 5 to 10 minutes to reflect with the course tutor: ${reflectUrl}`;
    if (!session.time) {
      const day = session.date.replace(/-/g, '');
      event(uid, [`DTSTART;VALUE=DATE:${day}`], [], `Orienteering: ${session.title}`, reflect);
      return;
    }
    const start = new Date(`${session.date}T${session.time}:00`);
    const end = new Date(start.getTime() + session.minutes * 60000);
    const reflectEnd = new Date(end.getTime() + 10 * 60000);
    event(uid, [`DTSTART:${stamp(start)}`], [`DTEND:${stamp(end)}`], `Orienteering: ${session.title}`, reflect);
    event(
      `${uid}-reflect`,
      [`DTSTART:${stamp(end)}`],
      [`DTEND:${stamp(reflectEnd)}`],
      'Reflect on today\'s orienteering class',
      `5 to 10 minutes with the course tutor: ${reflectUrl}`,
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export function downloadCalendar(text: string, reflectUrl: string): void {
  const blob = new Blob([calendarFile(parseSchedule(text), reflectUrl)], {type: 'text/calendar'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'orienteering-classes.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
