/**
 * ALFABER & LENNY — RSVP BACKEND
 * Menerima RSVP dari website (POST) dan menyimpan ke Google Sheet,
 * serta menyediakan data untuk ditampilkan di website (GET).
 *
 * Alur RSVP di website sekarang 2 langkah:
 *  1) Tamu isi form & klik "Kirim Konfirmasi"  -> action: "submit"  -> baris baru dibuat
 *  2) Tamu klik salah satu tombol WA (Alfa/Lenny) -> action: "updateWa" -> kolom "Konfirmasi WA"
 *     pada baris yang sama (dicari lewat rsvpId) diperbarui. Kolom ini TIDAK ditampilkan di website.
 *
 * CARA PAKAI: lihat README.md di root proyek, bagian "Setup RSVP & Google Sheet".
 */

const SHEET_NAME = "RSVP";
const COL = {
  TIMESTAMP: 1,
  RSVP_ID: 2,
  NAMA: 3,
  JUMLAH: 4,
  KEHADIRAN: 5,
  UCAPAN: 6,
  DIKIRIM_KE: 7
};

function doPost(e) {
  const sheet = getSheet_();
  const data = JSON.parse(e.postData.contents);

  if (data.action === "updateWa") {
    updateDikirimKe_(sheet, data.rsvpId, data.dikirimKe);
  } else {
    // default: action "submit" (atau payload lama tanpa action, untuk kompatibilitas)
    sheet.appendRow([
      new Date(),                 // Timestamp server
      data.rsvpId || "",
      data.nama || "",
      data.jumlah || "",
      data.kehadiran || "",
      data.ucapan || "",
      data.dikirimKe || ""        // biasanya kosong dulu, diisi lewat action "updateWa"
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // buang header

  // Hanya kirim field yang boleh tampil di website (nama, jumlah, kehadiran, ucapan)
  // Kolom rsvpId & "dikirimKe" (Alfa/Lenny) sengaja TIDAK disertakan.
  const result = rows
    .filter(r => r[COL.NAMA - 1]) // baris dengan nama terisi
    .map(r => ({
      nama: r[COL.NAMA - 1],
      jumlah: r[COL.JUMLAH - 1],
      kehadiran: r[COL.KEHADIRAN - 1],
      ucapan: r[COL.UCAPAN - 1]
    }));

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateDikirimKe_(sheet, rsvpId, dikirimKe) {
  if (!rsvpId) return;
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) { // cari dari baris terbaru
    if (rows[i][COL.RSVP_ID - 1] === rsvpId) {
      sheet.getRange(i + 1, COL.DIKIRIM_KE).setValue(dikirimKe || "");
      break;
    }
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "RSVP ID", "Nama", "Jumlah Tamu", "Kehadiran", "Ucapan", "Konfirmasi WA"]);
  }
  return sheet;
}
