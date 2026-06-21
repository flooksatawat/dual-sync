const SHEET_NAME = "DualSync";
const HEADERS = ["id", "kind", "title", "detail", "status", "url", "source", "user", "updatedAt", "deletedAt"];

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
  const normalized = normalizePayload(action, payload);

  if (action === "delete") {
    markDeleted(sheet, normalized.id);
  } else {
    upsertRecord(sheet, normalized);
  }

  if (["add_link", "status_change", "upload_file", "summary", "create", "update"].includes(action)) {
    sendLineNotification(formatLineMessage(action, normalized));
  }

  return { action, stored: true, id: normalized.id };
}

function ensureSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function normalizePayload(action, payload) {
  return {
    id: String(payload.id || Utilities.getUuid()),
    kind: String(payload.kind || payload.action || action || "item"),
    title: String(payload.title || ""),
    detail: String(payload.detail || ""),
    status: String(payload.status || ""),
    url: String(payload.url || ""),
    source: String(payload.source || "web"),
    user: String(payload.user || ""),
    updatedAt: new Date(),
    deletedAt: "",
  };
}

function upsertRecord(sheet, record) {
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[0]) === record.id);
  const row = [
    record.id,
    record.kind,
    record.title,
    record.detail,
    record.status,
    record.url,
    record.source,
    record.user,
    record.updatedAt,
    "",
  ];
  if (rowIndex === -1) {
    sheet.appendRow(row);
  } else {
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
  }
}

function markDeleted(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[0]) === String(id));
  if (rowIndex === -1) return;
  sheet.getRange(rowIndex + 1, 10).setValue(new Date());
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
