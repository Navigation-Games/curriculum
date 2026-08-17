// Google Apps Script bound to the advisor conversation log spreadsheet.
// Sends a daily email when new rows have been added to any of the log tabs
// (conversations, feedback, or page feedback). Stays quiet on days with no
// new activity. See "Daily activity email" in ai-advisor/README.md for setup.

const RECIPIENT = 'president@navigationgames.org';
const CONVERSATIONS_TAB_INDEX = 0; // first sheet: the conversation log itself
const FEEDBACK_TAB_NAME = 'Feedback';
const PAGE_FEEDBACK_TAB_NAME = 'PageFeedback';

function checkForNewActivity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  const tabs = [
    { key: 'conversations', label: 'Advisor conversations', sheet: ss.getSheets()[CONVERSATIONS_TAB_INDEX] },
    { key: 'feedback', label: 'Conversation feedback', sheet: ss.getSheetByName(FEEDBACK_TAB_NAME) },
    { key: 'pageFeedback', label: 'Page feedback', sheet: ss.getSheetByName(PAGE_FEEDBACK_TAB_NAME) },
  ];

  const lines = [];
  let total = 0;

  tabs.forEach(({ key, label, sheet }) => {
    if (!sheet) return; // tab doesn't exist yet (created lazily on first use)
    const currentRows = sheet.getLastRow();
    const previousRows = Number(props.getProperty('rows_' + key) || 0);
    const newRows = Math.max(0, currentRows - previousRows);
    if (newRows > 0) {
      lines.push(label + ': ' + newRows + ' new row' + (newRows === 1 ? '' : 's') + ' (' + currentRows + ' total)');
      total += newRows;
    }
    props.setProperty('rows_' + key, String(currentRows));
  });

  if (total === 0) return; // nothing new since the last check; don't send

  const subject = 'Navigation Games advisor: ' + total + ' new log entr' + (total === 1 ? 'y' : 'ies');
  const body = [
    'The advisor conversation log had new activity since the last check:',
    '',
  ].concat(lines.map(function (l) { return '- ' + l; })).concat([
    '',
    'View the spreadsheet: ' + ss.getUrl(),
  ]).join('\n');

  MailApp.sendEmail(RECIPIENT, subject, body);
}
