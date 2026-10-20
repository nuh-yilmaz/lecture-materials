/**
 * Course simulations – writes pre/post test results to this Google Sheet.
 * One deployment serves every course: each course writes to its own tab (e.g. "endocrine").
 * Setup: Sheet > Extensions > Apps Script > paste this code > Deploy > New deployment >
 * Type: Web app > Execute as: Me > Who has access: Anyone.
 */
const HEADERS = ['Timestamp', 'Alias', 'Test', 'Q1 (20)', 'Q2 (20)', 'Q3 (20)', 'Q4 (20)',
  'Q5 self-score (20)', 'Auto total (80)', 'Total (incl. self-score)',
  'A1 choice', 'A2 order', 'A3 matching', 'A4 T/F (D=true, Y=false)', 'A5 open-ended answer', 'Version', 'Language'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tab = clean(d.course).replace(/[^\w -]/g, '').slice(0, 40) || 'results';
    const sheet = ss.getSheetByName(tab) || ss.insertSheet(tab);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(), clean(d.alias), clean(d.test),
      num(d.s1), num(d.s2), num(d.s3), num(d.s4), num(d.s5_self),
      num(d.auto_total), num(d.total),
      clean(d.a1), clean(d.a2), clean(d.a3), clean(d.a4), clean(d.a5), clean(d.version), clean(d.lang)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Opening the web app URL in a browser shows this message (connection check).
function doGet() {
  return ContentService.createTextOutput('Course simulations data endpoint is running.');
}

function num(v) { const n = Number(v); return isFinite(n) ? n : ''; }
// Truncates text and stops input starting with = + - @ from running as a formula.
function clean(v) {
  let s = String(v == null ? '' : v).slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
