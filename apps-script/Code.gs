/**
 * ALFABER & LENNY — RSVP BACKEND
 * Script ini menerima data RSVP dari website (POST) dan menyimpannya
 * ke Google Sheet, serta menyediakan data untuk ditampilkan di website (GET).
 *
 * CARA PAKAI: lihat README.md di root proyek, bagian "Setup RSVP & Google Sheet".
 */

const SHEET_NAME = "RSVP";

function doPost(e) {
  const sheet = getSheet_();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),                 // Timestamp server
    data.nama || "",
    data.jumlah || "",
    data.kehadiran || "",
    data.ucapan || "",
    data.dikirimKe || ""        // Alfa / Lenny — kolom internal, tidak ditampilkan di website
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // buang header

  // Hanya kirim field yang boleh tampil di website (nama, jumlah, kehadiran, ucapan)
  // Kolom "dikirimKe" (Alfa/Lenny) sengaja TIDAK disertakan.
  const result = rows
    .filter(r => r[1]) // baris dengan nama terisi
    .map(r => ({
      nama: r[1],
      jumlah: r[2],
      kehadiran: r[3],
      ucapan: r[4]
    }));

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Nama", "Jumlah Tamu", "Kehadiran", "Ucapan", "Konfirmasi WA"]);
  }
  return sheet;
}
