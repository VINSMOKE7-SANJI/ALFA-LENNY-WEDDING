/* =========================================================
   ALFABER & LENNY — WEDDING INVITATION SCRIPT
   ========================================================= */

// >>> GANTI dengan URL Web App Google Apps Script kamu (lihat README) <<<
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKRWeJDz96k9IuSM_4BFyB2EG4mB3j0hmBnwMqGFvA9nVvTHd67jJ_jI9e-Hd_pXEZrw/exec";

const WA_NUMBERS = {
  alfa: "6281247770168",
  lenny: "6285859866900"
};

const WEDDING_DATE = new Date("2026-10-25T07:00:00+07:00");

// pembagian galeri jadi 3 kelompok cerita (total 16 foto)
const GALLERY_GROUPS = [
  { id: "gallery-grid-1", start: 1, end: 5 },
  { id: "gallery-grid-2", start: 6, end: 11 },
  { id: "gallery-grid-3", start: 12, end: 16 }
];

/* ---------------- Guest name from URL (?to=Nama) ---------------- */
(function personalize(){
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  if (to) {
    document.getElementById("guest-name").textContent = decodeURIComponent(to.replace(/\+/g, " "));
  }
})();

/* ---------------- Preloader ---------------- */
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  setTimeout(() => {
    pre.classList.add("hidden");
    document.getElementById("cover").classList.add("opening");
  }, 1100);
});
// kalau foto loading belum diupload / gagal dimuat, sembunyikan supaya tidak tampil ikon rusak
(function preloaderImgFallback(){
  const img = document.getElementById("preloader-img");
  if (img) {
    img.addEventListener("error", () => { img.style.display = "none"; });
  }
})();

/* ---------------- Falling leaves (botanical ambience) ---------------- */
(function leafField(){
  const field = document.getElementById("starfield");
  const count = 26;
  for (let i = 0; i < count; i++) {
    const leaf = document.createElement("span");
    leaf.style.left = Math.random() * 100 + "%";
    leaf.style.top = -10 - Math.random() * 20 + "px";
    leaf.style.animationDuration = 10 + Math.random() * 12 + "s";
    leaf.style.animationDelay = Math.random() * 10 + "s";
    leaf.style.opacity = 0.35 + Math.random() * 0.4;
    leaf.style.transform = `scale(${0.7 + Math.random() * 0.6})`;
    field.appendChild(leaf);
  }
})();

/* ---------------- Gallery grid (3 kelompok + animasi masuk berselang-seling) ---------------- */
(function buildGallery(){
  GALLERY_GROUPS.forEach(group => {
    const grid = document.getElementById(group.id);
    if (!grid) return;
    for (let i = group.start; i <= group.end; i++) {
      const item = document.createElement("div");
      const fromLeft = (i - group.start) % 2 === 0;
      item.className = "gallery-item reveal-gallery " + (fromLeft ? "from-left" : "from-right");
      item.innerHTML = `<img src="assets/gallery/${i}.jpg" alt="Kenangan ${i}" loading="lazy">`;
      grid.appendChild(item);
    }
  });
})();

/* ---------------- Open invitation ---------------- */
const openBtn = document.getElementById("open-invitation");
const cover = document.getElementById("cover");
const mainContent = document.getElementById("main-content");
const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

openBtn.addEventListener("click", () => {
  music.play().catch(() => {});
  musicToggle.classList.add("playing");
  cover.classList.add("closing");
  setTimeout(() => {
    cover.style.display = "none";
    mainContent.style.display = "block";
    // paksa reflow supaya transisi opacity berjalan
    void mainContent.offsetHeight;
    mainContent.classList.add("shown");
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
    initRevealObserver();
    loadRecap();
  }, 950);
});

musicToggle.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(() => {});
    musicToggle.classList.add("playing");
  } else {
    music.pause();
    musicToggle.classList.remove("playing");
  }
});

/* ---------------- Scroll reveal ---------------- */
function initRevealObserver(){
  const targets = document.querySelectorAll(".reveal, .reveal-gallery");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => obs.observe(t));

  // stagger tiap kelompok galeri
  GALLERY_GROUPS.forEach(group => {
    const grid = document.getElementById(group.id);
    if (!grid) return;
    Array.from(grid.children).forEach((item, idx) => {
      item.style.transitionDelay = (idx % 6) * 0.09 + "s";
    });
  });
}

/* ---------------- Countdown ---------------- */
function updateCountdown(){
  const now = new Date();
  let diff = WEDDING_DATE - now;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins = Math.floor((diff / (1000*60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  document.getElementById("cd-days").textContent = String(days).padStart(2,"0");
  document.getElementById("cd-hours").textContent = String(hours).padStart(2,"0");
  document.getElementById("cd-mins").textContent = String(mins).padStart(2,"0");
  document.getElementById("cd-secs").textContent = String(secs).padStart(2,"0");
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ---------------- Copy to clipboard ---------------- */
document.querySelectorAll(".btn-copy").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.getAttribute("data-copy");
    navigator.clipboard.writeText(val).then(() => {
      const original = btn.innerHTML;
      btn.classList.add("copied");
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = original;
      }, 1800);
    });
  });
});

/* ---------------- RSVP (2 langkah): 1) Kirim Konfirmasi  2) Pilih WA ---------------- */
const rsvpForm = document.getElementById("rsvp-form");
const rsvpStatus = document.getElementById("rsvp-status");
const rsvpSubmitBtn = document.getElementById("rsvp-submit");
const waChoiceWrap = document.getElementById("wa-choice-wrap");

let pendingRsvp = null; // menyimpan data RSVP terakhir yang sudah dikirim, menunggu dipilih WA-nya

function sendToSheet(payload){
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
}

rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nama = document.getElementById("rsvp-nama").value.trim();
  const jumlah = document.getElementById("rsvp-jumlah").value;
  const kehadiran = rsvpForm.querySelector('input[name="kehadiran"]:checked').value;
  const ucapan = document.getElementById("rsvp-ucapan").value.trim();

  if (!nama || !ucapan) {
    rsvpStatus.textContent = "Mohon isi nama dan ucapan terlebih dahulu.";
    return;
  }

  const rsvpId = "rsvp_" + Date.now();
  pendingRsvp = { rsvpId, nama, jumlah, kehadiran, ucapan };

  sendToSheet({ action: "submit", ...pendingRsvp });

  rsvpStatus.textContent = "Terima kasih, " + nama + "! Silakan lanjutkan konfirmasi via WhatsApp di bawah ini.";
  rsvpSubmitBtn.disabled = true;
  rsvpSubmitBtn.style.opacity = "0.6";
  waChoiceWrap.classList.add("show");

  showFloatingNotif(nama, kehadiran, ucapan);
  updateRecapLocally(kehadiran);
});

document.querySelectorAll(".btn-wa").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!pendingRsvp) return;

    const target = btn.getAttribute("data-target"); // "alfa" | "lenny"
    const waNumber = WA_NUMBERS[target];
    const dikirimKe = target === "alfa" ? "Alfa" : "Lenny";

    // update baris RSVP yang sudah ada di Google Sheet (kolom internal, tidak tampil di website)
    sendToSheet({ action: "updateWa", rsvpId: pendingRsvp.rsvpId, dikirimKe });

    const message =
`Halo, saya ingin mengonfirmasi kehadiran:
Nama: ${pendingRsvp.nama}
Jumlah Tamu: ${pendingRsvp.jumlah}
Kehadiran: ${pendingRsvp.kehadiran}
Ucapan: ${pendingRsvp.ucapan}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    rsvpStatus.textContent = "Konfirmasi kamu sudah terkirim. Terima kasih banyak!";
    waChoiceWrap.classList.remove("show");
    rsvpSubmitBtn.disabled = false;
    rsvpSubmitBtn.style.opacity = "1";
    rsvpForm.reset();
    pendingRsvp = null;
  });
});

/* ---------------- Floating notification ---------------- */
const floatingNotif = document.getElementById("floating-notif");
let notifTimer = null;

function showFloatingNotif(nama, kehadiran, ucapan){
  clearTimeout(notifTimer);
  const shortUcapan = ucapan.length > 60 ? ucapan.slice(0,60) + "…" : ucapan;
  floatingNotif.innerHTML = `<b>${escapeHtml(nama)}</b> &middot; ${escapeHtml(kehadiran)}<br><span>${escapeHtml(shortUcapan)}</span>`;
  floatingNotif.classList.add("show");
  notifTimer = setTimeout(() => floatingNotif.classList.remove("show"), 10000);
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------- Rekap Hadir / Tidak Hadir / Ragu-ragu ---------------- */
const recapEls = {
  hadir: document.getElementById("recap-hadir"),
  tidak: document.getElementById("recap-tidak"),
  ragu: document.getElementById("recap-ragu")
};
let cachedGuestList = null;

function countRecap(list){
  const counts = { hadir: 0, tidak: 0, ragu: 0 };
  (list || []).forEach(g => {
    const k = (g.kehadiran || "").toLowerCase();
    if (k === "hadir") counts.hadir++;
    else if (k === "tidak hadir") counts.tidak++;
    else if (k.startsWith("ragu")) counts.ragu++;
  });
  return counts;
}

function renderRecap(counts){
  recapEls.hadir.textContent = counts.hadir;
  recapEls.tidak.textContent = counts.tidak;
  recapEls.ragu.textContent = counts.ragu;
}

// naikkan angka rekap seketika (optimistic) sebelum data server ter-refresh
function updateRecapLocally(kehadiran){
  const k = kehadiran.toLowerCase();
  if (k === "hadir") recapEls.hadir.textContent = (parseInt(recapEls.hadir.textContent) || 0) + 1;
  else if (k === "tidak hadir") recapEls.tidak.textContent = (parseInt(recapEls.tidak.textContent) || 0) + 1;
  else if (k.startsWith("ragu")) recapEls.ragu.textContent = (parseInt(recapEls.ragu.textContent) || 0) + 1;
}

async function loadRecap(){
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "GET" });
    const list = await res.json();
    cachedGuestList = list;
    renderRecap(countRecap(list));
  } catch (e) {
    // biarkan default 0 kalau belum sempat setup Apps Script
  }
}

/* ---------------- Guest list (fetched from Google Sheet) ---------------- */
const toggleGuestBtn = document.getElementById("toggle-guestlist");
const guestListEl = document.getElementById("guest-list");

toggleGuestBtn.addEventListener("click", async () => {
  guestListEl.classList.toggle("open");
  if (guestListEl.classList.contains("open")) {
    if (cachedGuestList) {
      renderGuestList(cachedGuestList);
      return;
    }
    guestListEl.innerHTML = '<p class="guest-list-msg">Memuat ucapan…</p>';
    try {
      const res = await fetch(APPS_SCRIPT_URL, { method: "GET" });
      const list = await res.json();
      cachedGuestList = list;
      renderRecap(countRecap(list));
      renderGuestList(list);
    } catch (e) {
      guestListEl.innerHTML = '<p class="guest-list-msg">Belum ada data / periksa koneksi.</p>';
    }
  }
});

function renderGuestList(list){
  if (!Array.isArray(list) || list.length === 0) {
    guestListEl.innerHTML = '<p class="guest-list-msg">Belum ada ucapan.</p>';
    return;
  }
  guestListEl.innerHTML = list.slice().reverse().map(g => `
    <div class="guest-entry">
      <span class="g-name">${escapeHtml(g.nama || "-")}</span><span class="g-status">${escapeHtml(g.kehadiran || "-")}</span>
      <p class="g-msg">${escapeHtml(g.ucapan || "")}</p>
    </div>
  `).join("");
}
