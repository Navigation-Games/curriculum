// Google Apps Script bound to the advisor conversation log spreadsheet.
// Once a week, emails Navigation Games staff a list of teachers in the course
// (from the tutor conversations and the Submissions tab), where each one is,
// and who has gone quiet, with a suggested check-in email for each quiet one.
// Staff send the check-ins themselves: they know things the log doesn't,
// such as a teacher's teaching dates in the Kickstart Tracker.
// See "Weekly course check-in email" in ai-advisor/README.md for setup.

const CHECKIN_RECIPIENT = 'president@navigationgames.org';
const SUBMISSIONS_TAB = 'Submissions';
// Staff accounts that try the course are left out of the list
const IGNORE_DOMAINS = ['navigationgames.org'];
// Days without any tutor activity before a teacher counts as quiet
const QUIET_DAYS_BEFORE_KIT = 7;   // working through Units 0 to 4
const QUIET_DAYS_TEACHING = 14;    // sent their unit plan, not finished yet
const COURSE_URL = 'https://curriculum.navigationgames.org/training/';

function weeklyCourseCheckin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const teachers = {};
  const teacher = (email) => (teachers[email] = teachers[email] || { email: email, name: '', last: null, units: {}, sent: {} });

  // Conversation log columns: timestamp, conversation_id, msg_number, role,
  // content, model, input_tokens, output_tokens, user_name, user_email, user_org
  const rows = ss.getSheets()[0].getDataRange().getValues();
  rows.forEach(function (row) {
    const id = String(row[1]);
    const email = String(row[9]).trim().toLowerCase();
    const match = id.match(/^tutor-(unit-\d+)-/);
    if (!match || !email || ignored(email)) return;
    const t = teacher(email);
    const when = parseTime(row[0]);
    if (when && (!t.last || when > t.last)) t.last = when;
    if (row[8]) t.name = String(row[8]);
    t.units[match[1]] = true;
  });

  // Submissions columns: timestamp, email, name, unit, kind, conversation_id, text
  const submissions = ss.getSheetByName(SUBMISSIONS_TAB);
  if (submissions) {
    submissions.getDataRange().getValues().slice(1).forEach(function (row) {
      const email = String(row[1]).trim().toLowerCase();
      if (!email || ignored(email)) return;
      const t = teacher(email);
      t.sent[String(row[3])] = true;
      if (row[2]) t.name = String(row[2]);
    });
  }

  const now = new Date();
  const quiet = [];
  const everyone = [];
  Object.keys(teachers).sort().forEach(function (email) {
    const t = teachers[email];
    const days = t.last ? Math.floor((now - t.last) / 86400000) : null;
    let stage, limit;
    if (t.sent['unit-7']) {
      stage = 'finished (sent Unit 7)';
    } else if (t.sent['unit-4']) {
      stage = 'teaching (sent their unit plan)';
      limit = QUIET_DAYS_TEACHING;
    } else {
      stage = 'before the kit (Units 0 to 4)';
      limit = QUIET_DAYS_BEFORE_KIT;
    }
    const units = Object.keys(t.units).sort().join(', ') || 'none';
    const line = (t.name ? t.name + ' <' + email + '>' : email) + ': ' + stage + '; units opened: ' + units +
      '; last active ' + (days === null ? 'never' : days + ' days ago');
    everyone.push(line);
    if (limit && (days === null || days >= limit)) quiet.push({ t: t, line: line, teaching: Boolean(t.sent['unit-4']) });
  });

  if (!everyone.length) return; // nobody in the course yet

  const body = ['Teachers in the course: ' + everyone.length + '. Quiet: ' + quiet.length + '.', ''];
  if (quiet.length) {
    body.push('QUIET (check the Kickstart Tracker first, then send a check-in if it fits):', '');
    quiet.forEach(function (q) {
      body.push('- ' + q.line, '  Suggested email:', indent(suggestedCheckin(q.t, q.teaching)), '');
    });
  }
  body.push('EVERYONE:', '');
  everyone.forEach(function (line) { body.push('- ' + line); });
  body.push('', 'Conversation log: ' + ss.getUrl());

  MailApp.sendEmail(CHECKIN_RECIPIENT, 'Course check-in: ' + quiet.length + ' quiet teacher' + (quiet.length === 1 ? '' : 's'), body.join('\n'));
}

function suggestedCheckin(t, teaching) {
  const first = t.name ? t.name.split(' ')[0] : 'there';
  if (teaching) {
    return 'Hi ' + first + ', how is your orienteering unit going? If you\'ve taught a class, a 5-minute reflection ' +
      'in Unit 6 (' + COURSE_URL + 'unit-6/) helps us a lot. If your plans or dates have changed, just reply ' +
      'and tell me what you\'re doing now.';
  }
  return 'Hi ' + first + ', I noticed you haven\'t been back to the course in a while. Is anything getting in the way? ' +
    'You can pick up where you left off at ' + COURSE_URL + ', and I\'m happy to help by email or a short call.';
}

function ignored(email) {
  return IGNORE_DOMAINS.some(function (domain) { return email.endsWith('@' + domain); });
}

// The backend writes timestamps like "2026-10-24 22:05:31 UTC"
function parseTime(value) {
  if (value instanceof Date) return value;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  return match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6])) : null;
}

function indent(text) {
  return '    ' + text;
}
