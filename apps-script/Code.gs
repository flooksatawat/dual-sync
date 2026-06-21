const SHEET_NAME = "DualSync";
const HEADERS = ["timestamp", "type", "title", "detail", "source", "user", "url"];

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "dual-sync", message: "Apps Script backend is running" }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = String(payload.action || "").toLowerCase();
    const result = handleAction(action, payload);
    return json({ ok: true, ...result });
  } catch (error) {
    return json({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function handleAction(action, payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheet(ss);
  const row = [
    new Date(),
    action,
    payload.title || "",
    payload.detail || "",
    payload.source || "web",
    payload.user || "",
    payload.url || "",
  ];
  sheet.appendRow(row);

  if (["add_link", "status_change", "upload_file", "summary"].includes(action)) {
    sendLineNotification(formatLineMessage(action, payload));
  }

  return { action, stored: true };
}

function ensureSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatLineMessage(action, payload) {
  const title = payload.title ? `\n${payload.title}` : "";
  const detail = payload.detail ? `\n${payload.detail}` : "";
  switch (action) {
    case "add_link":
      return `Dual Sync\nเพิ่มลิงก์ใหม่${title}${detail}`;
    case "status_change":
      return `Dual Sync\nเปลี่ยนสถานะงาน${title}${detail}`;
    case "upload_file":
      return `Dual Sync\nอัปโหลดไฟล์${title}${detail}`;
    case "summary":
      return `Dual Sync\nสรุปสถานะประจำวัน${title}${detail}`;
    default:
      return `Dual Sync\nอัปเดตใหม่${title}${detail}`;
  }
}

function sendLineNotification(message) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("LINE_CHANNEL_ACCESS_TOKEN");
  const groupId = props.getProperty("LINE_TARGET_ID");
  if (!token || !groupId) return;

  const url = "https://api.line.me/v2/bot/message/push";
  const payload = {
    to: groupId,
    messages: [{ type: "text", text: message }],
  };

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: `Bearer ${token}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

