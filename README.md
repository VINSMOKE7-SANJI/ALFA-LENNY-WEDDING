# 💍 Undangan Digital — Alfaber & Lenny

Undangan pernikahan digital tema **Dark Romantic** (navy & gold), lengkap dengan
musik, video cinematic, galeri foto animasi, RSVP terhubung WhatsApp + Google Sheet,
dan amplop digital.

---

## 1. Struktur File

```
undangan-alfaber-lenny/
├── index.html          → halaman utama
├── style.css            → semua styling (tema dark romantic)
├── script.js             → semua interaktivitas
├── manifest.json         → agar bisa "Add to Home Screen"
├── apps-script/Code.gs   → backend RSVP (Google Apps Script)
└── assets/
    ├── gallery/          → taruh foto di sini (lihat poin 2)
    ├── music/             → taruh musik latar di sini
    ├── video/             → taruh video cinematic di sini
    └── icons/             → icon untuk manifest.json (opsional)
```

## 2. Isi Konten Kamu Sendiri (WAJIB sebelum di-publish)

### a. Foto
- Foto mempelai pria → `assets/gallery/groom.jpg`
- Foto mempelai wanita → `assets/gallery/bride.jpg`
- 16 foto kenangan → `assets/gallery/1.jpg` sampai `assets/gallery/16.jpg`
  (nama file harus persis angka, sesuai urutan yang kamu mau tampilkan)

### b. Musik
- Taruh file musik (mp3) di `assets/music/wedding-song.mp3`
- Nama file harus persis sama, atau ubah path-nya di `index.html` pada tag `<audio>`

### c. Video cinematic (opsional tapi direkomendasikan)
- Taruh video pendek (mp4, idealnya 10–20 detik, tanpa suara penting karena akan diberi overlay teks) di `assets/video/intro.mp4`
- Screenshot pertama video sebagai poster: `assets/video/poster.jpg`

> Semua foto/video/musik **tidak aku sertakan** karena aku tidak bisa membuat konten pribadi kalian — tinggal drag & drop ke folder yang sesuai lewat GitHub web atau lewat komputer kamu.

## 3. Setup RSVP (Google Sheet + Apps Script) — WAJIB agar RSVP berfungsi

1. Buka **Google Sheets**, buat spreadsheet baru, kasih nama misalnya "RSVP Alfaber & Lenny".
2. Klik menu **Extensions → Apps Script**.
3. Hapus semua kode default di editor, lalu **copy-paste seluruh isi** file `apps-script/Code.gs` dari proyek ini.
4. Klik **Deploy → New deployment**.
   - Klik ikon gear ⚙️ di samping "Select type" → pilih **Web app**.
   - **Execute as**: Me (akun kamu)
   - **Who has access**: **Anyone** (wajib, supaya website bisa mengirim data)
   - Klik **Deploy**, lalu izinkan akses (Authorize access) dengan akun Google kamu.
5. Setelah deploy, kamu akan dapat **Web app URL** seperti:
   `https://script.google.com/macros/s/xxxxxxxxxxxxx/exec`
6. Buka file `script.js`, cari baris paling atas:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/GANTI_DENGAN_DEPLOYMENT_ID/exec";
   ```
   Ganti dengan URL Web App kamu dari langkah 5.
7. Setiap kali RSVP dikirim, data otomatis masuk ke sheet bernama **"RSVP"** di spreadsheet kamu dengan kolom: Timestamp, Nama, Jumlah Tamu, Kehadiran, Ucapan, Konfirmasi WA (kolom terakhir untuk kamu sendiri — tidak muncul di website).

> Setiap kali kamu **mengedit ulang** kode `Code.gs`, kamu harus **Deploy → Manage deployments → Edit (ikon pensil) → Version: New version → Deploy** lagi supaya perubahan berlaku.

## 4. Sesuaikan Nomor WhatsApp & Rekening

Semua sudah aku isi sesuai data yang kamu berikan (nomor WA Alfa/Lenny, rekening BRI/BCA).
Kalau ada yang perlu diubah, edit langsung di `script.js` (bagian `WA_NUMBERS`) dan
`index.html` (bagian "DIGITAL ENVELOPE" & data-copy).

## 5. Publish ke GitHub Pages

1. Buat repository baru di GitHub, misal `undangan-alfaber-lenny` (bisa public).
2. Upload **semua file & folder** di proyek ini ke repo tersebut
   (lewat "Add file → Upload files" di GitHub, atau via Git kalau kamu terbiasa command line).
3. Buka tab **Settings → Pages** di repo kamu.
4. Di bagian **Branch**, pilih `main` dan folder `/ (root)`, klik **Save**.
5. Tunggu 1–2 menit, GitHub akan memberi URL seperti:
   `https://<username-kamu>.github.io/undangan-alfaber-lenny/`
6. Itulah link undangan digital kamu yang siap dibagikan!

### Personalisasi nama tamu (opsional, biar terasa premium)
Kamu bisa kirim link dengan nama tamu berbeda-beda, contoh:
```
https://<username>.github.io/undangan-alfaber-lenny/?to=Bapak+Budi
```
Nama "Bapak Budi" otomatis muncul di halaman cover sebagai tamu yang dituju.

## 6. Checklist Sebelum Dibagikan ke Tamu

- [ ] Semua foto (groom.jpg, bride.jpg, 1.jpg–16.jpg) sudah diupload
- [ ] Musik latar sudah diupload dan diputar dengan benar
- [ ] Video cinematic sudah diupload (atau hapus section-nya kalau tidak dipakai)
- [ ] `APPS_SCRIPT_URL` di `script.js` sudah diganti dengan URL Web App kamu
- [ ] Tes kirim RSVP sendiri → cek muncul di Google Sheet & WhatsApp terbuka dengan benar
- [ ] Tes buka undangan dari HP (bukan cuma laptop)
- [ ] Link Google Maps pemberkatan & resepsi sudah benar
- [ ] Link GitHub Pages sudah aktif (buka dari browser, bukan cuma dari GitHub)

---

Selamat, tinggal isi konten & deploy — undangan digitalnya siap dipakai! 🤍✨
