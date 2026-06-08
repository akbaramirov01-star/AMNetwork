/**
 * AM Network — Apply Form backend (Google Apps Script)
 * ----------------------------------------------------
 * What it does on every form submission:
 *   1. Appends the application to the bound Google Sheet
 *   2. Sends a confirmation email to the APPLICANT (with reference number)
 *   3. Sends a notification email to contact@amnetwork.io
 *
 * IMPORTANT — how to make changes take effect:
 *   After editing this code you MUST publish a NEW version, otherwise the
 *   live URL keeps running the OLD code:
 *     Deploy  ->  Manage deployments  ->  (pencil/Edit)  ->
 *     Version: "New version"  ->  Deploy
 *
 * First-time authorization:
 *   Run testEmail() once from the editor and approve the permission dialog.
 */

// ====== CONFIG ======
var SHEET_ID = '';                 // optional: paste Sheet ID if script is standalone
var TEAM_EMAIL = 'contact@amnetwork.io';
// ====================

function doPost(e) {
  var data = {};
  try { data = parseBody_(e); } catch (_) {}

  // Each step is isolated: a failure in one must NOT block the others.
  // Emails go FIRST so a sheet problem can never stop them.

  // 1) Email the applicant (only if they gave a valid email)
  try {
    var email = (data.email || '').trim();
    if (email && /\S+@\S+\.\S+/.test(email)) sendApplicantEmail_(email, data);
  } catch (e1) {}

  // 2) Notify the team
  try { sendTeamEmail_(data); } catch (e2) {}

  // 3) Save to sheet (optional — never blocks email)
  try { appendRow_(data); } catch (e3) {}

  return json_({ status: 'ok', ref: data.ref || '' });
}

function parseBody_(e) {
  // The website sends a JSON body. Fall back to form params just in case.
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (_) {}
  }
  return (e && e.parameter) ? e.parameter : {};
}

function getSheet_() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function appendRow_(d) {
  var sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    d.ref || '',
    d.name || '',
    d.email || '',
    d.country || '',
    d.city || '',
    d.members || '',
    d.children || '',
    d.income || '',
    d.expenses || '',
    d.categories || '',
    d.duration || '',
    d.description || '',
    d.needs || '',
    d.mosque || '',
    d.lang || '',
    d.score || ''
  ]);
}

function sendApplicantEmail_(to, d) {
  var ref = d.ref || '—';
  var subject = 'AM Network — Application Received (' + ref + ')';
  var body =
    'Assalamu alaikum,\n\n' +
    'We have received your application for assistance.\n\n' +
    'Your reference number: ' + ref + '\n\n' +
    'What happens next:\n' +
    '  1. Our AI reviews your situation (score 0-100).\n' +
    '  2. A local imam or partner NGO verifies your eligibility.\n' +
    '  3. If approved, you appear in the verified recipients list.\n\n' +
    'Please keep this reference number. We will contact you at this email.\n\n' +
    'May Allah ease your affairs.\n\n' +
    'AM Network\n' +
    'contact@amnetwork.io\n' +
    'https://amnetwork.io';
  MailApp.sendEmail(to, subject, body);
}

function sendTeamEmail_(d) {
  var subject = 'New Application: ' + (d.ref || '') + ' — ' + (d.country || '');
  var body =
    'Ref: ' + (d.ref || '') + '\n' +
    'Name: ' + (d.name || '') + '\n' +
    'Email: ' + (d.email || '') + '\n' +
    'Country: ' + (d.country || '') + '\n' +
    'City: ' + (d.city || '') + '\n' +
    'Household members: ' + (d.members || '') + '\n' +
    'Children: ' + (d.children || '') + '\n' +
    'Income: ' + (d.income || '') + '\n' +
    'Expenses: ' + (d.expenses || '') + '\n' +
    'Categories: ' + (d.categories || '') + '\n' +
    'Duration: ' + (d.duration || '') + '\n' +
    'Needs: ' + (d.needs || '') + '\n' +
    'Mosque: ' + (d.mosque || '') + '\n' +
    'Lang: ' + (d.lang || '') + '\n' +
    'Score: ' + (d.score || '') + '\n\n' +
    'Description:\n' + (d.description || '');
  MailApp.sendEmail(TEAM_EMAIL, subject, body);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor to authorize sending and verify it works.
function testEmail() {
  MailApp.sendEmail(TEAM_EMAIL, 'AM Network test', 'If you got this, MailApp works.');
}
