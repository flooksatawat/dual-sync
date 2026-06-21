# Dual Sync

Web app สำหรับแชร์ข้อมูลร่วมกันระหว่าง 2 คน โดยใช้หน้าเว็บเป็นจุดใช้งานหลักทั้งหมด ส่วน Google Sheets ใช้เป็นที่เก็บข้อมูลกลางเท่านั้น และส่งแจ้งเตือนผ่าน LINE เมื่อมีการเพิ่มลิงก์, เปลี่ยนสถานะ, หรืออัปโหลดไฟล์

## บัญชีหลัก

- Google account: `satawatbuttrakas@gmail.com`

## โครงสร้างข้อมูล

- `Google Sheets` เป็นฐานข้อมูลกลางสำหรับเก็บข้อมูลเท่านั้น
- `Google Drive` เก็บรูปและไฟล์แนบ
- `LINE Messaging API` ใช้ส่งแจ้งเตือน

## ไฟล์สำคัญ

- [`index.html`](./index.html) - หน้าเว็บหลัก
- [`apps-script/Code.gs`](./apps-script/Code.gs) - Apps Script backend
- [`apps-script/appsscript.json`](./apps-script/appsscript.json) - manifest

## วิธีเริ่มใช้งานจริง

### 1) สร้าง Google Sheet

1. ล็อกอินด้วยบัญชี `satawatbuttrakas@gmail.com`
2. สร้าง Google Sheet ใหม่ เช่น `Dual Sync`
3. เปิด Apps Script แบบ standalone หรือ bound script

### 2) วางโค้ด Apps Script

1. คัดลอกไฟล์ใน `apps-script/Code.gs` ไปวางในโปรเจกต์ Apps Script
2. วาง `appsscript.json` เป็น manifest ของโปรเจกต์
3. บันทึกโปรเจกต์

### 3) ตั้ง Script Properties

ไปที่ Project Settings > Script properties แล้วเพิ่ม:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_TARGET_ID`

ถ้ายังไม่ต้องใช้ LINE ให้เว้นค่านี้ไว้ได้ backend จะยังบันทึกลงชีตได้ปกติ

### 4) Deploy เป็น Web App

อ้างอิงจากเอกสารทางการของ Google Apps Script เรื่อง Web Apps และ Deployments:

- Apps Script web app ต้องมี `doGet(e)` หรือ `doPost(e)`
- เมื่อ deploy เป็น web app สามารถเลือกการรันแบบ versioned deployment ได้

ขั้นตอน:

1. เปิด Deploy > New deployment
2. เลือกประเภทเป็น `Web app`
3. ตั้ง `Execute as` ตามที่ต้องการ
4. ตั้ง `Who has access` ให้เหมาะกับการใช้งาน
5. กด Deploy
6. คัดลอก Web App URL

### 5) ผูกหน้าเว็บกับ Apps Script

หน้าเว็บอ่าน URL จาก `localStorage` key:

- `duosync_backend_url`

คุณตั้งได้จาก browser console หรือเพิ่ม UI ตั้งค่า URL ภายหลัง

ตัวอย่าง:

```js
localStorage.setItem('duosync_backend_url', 'https://script.google.com/macros/s/xxxxx/exec')
```

### 6) ทดสอบการเชื่อมต่อ

ในหน้าเว็บ:

- กด `เพิ่มลิงก์ Drive`
- เปลี่ยนสถานะงาน
- อัปโหลดไฟล์

ถ้าเชื่อม backend แล้ว Apps Script จะ:

- append ข้อมูลลง Google Sheets
- ส่ง LINE แจ้งเตือนตาม action

ผู้ใช้ทำงานทั้งหมดผ่านหน้าเว็บ `https://flooksatawat.github.io/dual-sync/`

## โครงคอลัมน์ในชีต

Sheet จะถูกสร้าง/ใช้งานด้วย headers:

- `timestamp`
- `type`
- `title`
- `detail`
- `source`
- `user`
- `url`

## หมายเหตุสำคัญ

- Google Apps Script มี quota และข้อจำกัดการใช้งาน
- การส่ง LINE ต้องมี Channel Access Token และ target ID ที่ถูกต้อง
- Web App URL ต้องเป็นเวอร์ชันที่ deploy แล้ว ไม่ใช่ URL หน้า editor

## ลิงก์อ้างอิง

- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Apps Script Deployments](https://developers.google.com/apps-script/concepts/deployments)
- [Properties Service](https://developers.google.com/apps-script/guides/properties)
- [SpreadsheetApp reference](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)
- [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)
