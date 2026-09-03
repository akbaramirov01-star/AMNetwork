/**
 * AM Network intake v3. Install in EACH form's existing Apps Script project.
 * Script Properties: FORM_KIND=apply|waitlist; optional SHEET_ID.
 * WEB3FORMS_CAPTCHA_REQUIRED=true ONLY after enabling mandatory hCaptcha in
 * Web3Forms for that form. Shared CAPTCHA token is verified exactly once there.
 * Publish a NEW VERSION; Git push alone does not deploy Apps Script.
 * See docs/security-deployment.md. No MailApp or unverified write path.
 */
var INTAKE_VERSION = '3.0';
var INTAKE_KEYS = {
  apply:'b73ec38b-f236-4692-b664-28aaf039d222',
  waitlist:'e895783d-8868-41ba-8b9d-fa4aa6a47628'
}; // Public form identifiers, not secrets.
var INTAKE_FIELDS = ['name','email','country','city','members','children','income',
  'expenses','categories','duration','description','needs','mosque','lang','role'];

function config_() {
  var p = PropertiesService.getScriptProperties(), kind = p.getProperty('FORM_KIND');
  return {properties:p, kind:kind, ready:(kind === 'apply' || kind === 'waitlist') &&
    p.getProperty('WEB3FORMS_CAPTCHA_REQUIRED') === 'true'};
}
function doGet() {
  var c=config_();
  return json_({version:INTAKE_VERSION, ready:c.ready, kind:c.kind});
}
function doPost(e) {
  var c=config_(), d;
  if (!c.ready) return json_({success:false,code:'not_configured'});
  try { d=validate_(e,c.kind); } catch (_) { return json_({success:false,code:'invalid_submission'}); }
  var lock=LockService.getScriptLock();
  if (!lock.tryLock(1000)) return json_({success:false,code:'busy',retry_after:5});
  try {
    var now=Date.now(), props=c.properties;
    cleanExpired_(props,now);
    var fingerprint=digest_(JSON.stringify(INTAKE_FIELDS.map(function(k){return d[k];})));
    var requestKey='AM_REQUEST_'+d.ref, record=read_(props,requestKey);
    if (record && record.fingerprint !== fingerprint) return json_({success:false,code:'reference_conflict'});
    if (record && record.saved) return json_({success:true,ref:d.ref,duplicate:true});
    var duplicate=read_(props,'AM_DUP_'+fingerprint);
    if (duplicate) return json_({success:true,ref:duplicate.ref,duplicate:true});
    // Global budgets cannot be bypassed by changing an email or request header.
    if (!reserve_(props,'AM_ATTEMPTS_MINUTE',30,60000,now) ||
        !reserve_(props,'AM_ATTEMPTS_DAY',300,86400000,now))
      return json_({success:false,code:'rate_limited',retry_after:60});
    var emailKey='AM_EMAIL_'+digest_(d.email.toLowerCase()), emailCount=read_(props,emailKey);
    if (!record && emailCount && emailCount.n >= 3)
      return json_({success:false,code:'rate_limited',retry_after:3600});
    var sheet=getSheet_(props); // Validate destination BEFORE provider delivery.
    if (!record) {
      if (!deliverVerified_(d,c.kind)) return json_({success:false,code:'verification_failed'});
      record={fingerprint:fingerprint,saved:false,expires:now+86400000};
      // A Sheets retry must not send the email / consume the CAPTCHA twice.
      props.setProperty(requestKey,JSON.stringify(record));
      props.setProperty(emailKey,JSON.stringify({n:(emailCount ? emailCount.n : 0)+1,expires:now+86400000}));
    }
    // Covers a crash after append but before committing the deduplication record.
    var found=sheet.getLastRow() > 0 && sheet.getRange(1,2,sheet.getLastRow(),1)
      .createTextFinder(d.ref).matchEntireCell(true).findNext();
    if (!found) {
      var values=c.kind === 'apply'
        ? [d.ref,d.name,d.email,d.country,d.city,d.members,d.children,d.income,d.expenses,
           d.categories,d.duration,d.description,d.needs,d.mosque,d.lang,'']
        : [d.ref,d.name,d.email,d.role,d.country,d.lang];
      sheet.appendRow([new Date()].concat(values.map(safeCell_)));
      SpreadsheetApp.flush();
    }
    record.saved=true;
    props.setProperty(requestKey,JSON.stringify(record));
    props.setProperty('AM_DUP_'+fingerprint,JSON.stringify({ref:d.ref,expires:now+86400000}));
    return json_({success:true,ref:d.ref});
  } catch (_) {
    return json_({success:false,code:'temporarily_unavailable'});
  } finally { lock.releaseLock(); }
}
function validate_(e,kind) {
  if (!e || !e.postData || !e.postData.contents || e.postData.contents.length > 24000) throw Error('body');
  var p=e.parameter;
  if ((e.postData.type || '').indexOf('application/json') === 0) p=JSON.parse(e.postData.contents);
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw Error('object');
  if (p.website || p.botcheck || p.kind !== kind || p.consent !== 'true') throw Error('consent');
  if (typeof p.ref !== 'string' || !/^AM-[A-Za-z0-9-]{16,80}$/.test(p.ref)) throw Error('reference');
  var token=p['h-captcha-response'];
  if (typeof token !== 'string' || token.length < 10 || token.length > 12000) throw Error('captcha');
  var d={ref:p.ref,token:token};
  INTAKE_FIELDS.forEach(function(k){
    var v=p[k] === undefined ? '' : p[k], limit=k === 'description' ? 5000 : 500;
    if (typeof v !== 'string' || v.length > limit || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v)) throw Error('field');
    d[k]=v.trim();
  });
  if (!d.name || d.name.length > 120 || d.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw Error('contact');
  if (!/^(en|ru|ar|tj|id|tr|zh|ms|de)$/.test(d.lang)) throw Error('language');
  if (kind === 'waitlist' && !d.role) throw Error('role');
  if (kind === 'apply') {
    if (!d.country || !d.city || !d.description) throw Error('required');
    ['members','children','income','expenses'].forEach(function(k){
      if (!/^\d+(\.\d{1,2})?$/.test(d[k]) || Number(d[k]) > 1e9) throw Error('number');
    });
    if (+d.members < 1 || +d.members > 100 || +d.children > +d.members ||
        !Number.isInteger(+d.members) || !Number.isInteger(+d.children)) throw Error('household');
  }
  return d;
}
function deliverVerified_(d,kind) {
  var payload={access_key:INTAKE_KEYS[kind],subject:'AM Network '+kind+' '+d.ref,
    from_name:'AM Network',reference:d.ref,'h-captcha-response':d.token};
  INTAKE_FIELDS.forEach(function(k){payload[k]=d[k];});
  var response=UrlFetchApp.fetch('https://api.web3forms.com/submit',{
    method:'post',contentType:'application/json',payload:JSON.stringify(payload),
    muteHttpExceptions:true,followRedirects:false
  });
  return response.getResponseCode() === 200 && JSON.parse(response.getContentText()).success === true;
}
function safeCell_(v) {
  var text=String(v === undefined || v === null ? '' : v);
  return /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'"+text : text;
}
function getSheet_(props) {
  var id=props.getProperty('SHEET_ID');
  return (id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
}
function digest_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8)
    .map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');
}
function read_(props,key) { var v=props.getProperty(key); return v ? JSON.parse(v) : null; }
function reserve_(props,key,limit,period,now) {
  var r=read_(props,key);
  if (!r || r.expires <= now) r={n:0,expires:now+period};
  if (r.n >= limit) return false;
  r.n++; props.setProperty(key,JSON.stringify(r)); return true;
}
function cleanExpired_(props,now) {
  var all=props.getProperties();
  Object.keys(all).filter(function(k){return /^AM_(REQUEST_|DUP_|EMAIL_|ATTEMPTS_)/.test(k);})
    .forEach(function(k){if(JSON.parse(all[k]).expires <= now) props.deleteProperty(k);});
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
