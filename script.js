/* =========================================================
   ALFABER & LENNY — WEDDING INVITATION SCRIPT
   ========================================================= */

// >>> GANTI dengan URL Web App Google Apps Script kamu (lihat README) <<<
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/GANTI_DENGAN_DEPLOYMENT_ID/exec";

const WA_NUMBERS = {
  alfa: "6281247770168",
  lenny: "6285859866900"
};

const WEDDING_DATE = new Date("2026-10-25T07:00:00+07:00");
const GALLERY_COUNT = 16;

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
  setTimeout(() => pre.classList.add("hidden"), 900);
});

/* ---------------- Starfield ---------------- */
(function starfield(){
  const field = document.getElementById("starfield");
  const count = 60;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.style.left = Math.random() * 100 + "%";
    star.style.bottom = -10 - Math.random() * 20 + "px";
    star.style.animationDuration = 8 + Math.random() * 14 + "s";
    star.style.animationDelay = Math.random() * 10 + "s";
    star.style.opacity = 0.3 + Math.random() * 0.5;
    field.appendChild(star);
  }
})();

/* ---------------- Gallery grid ---------------- */
(function buildGallery(){
  const grid = document.getElementById("gallery-grid");
  for (let i = 1; i <= GALLERY_COUNT; i++) {
    const item = document.createElement("div");
    item.className = "gallery-item reveal-gallery";
    item.innerHTML = `<img src="assets/gallery/${i}.jpg" alt="Kenangan ${i}" loading="lazy">`;
    grid.appendChild(item);
  }
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
    mainContent.classList.add("shown");
    document.body.style.overflow = "auto";
    initRevealObserver();
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

  // stagger gallery items
  document.querySelectorAll(".gallery-item").forEach((item, idx) => {
    item.style.transitionDelay = (idx % 8) * 0.08 + "s";
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

/* ---------------- RSVP + WhatsApp + Google Sheet ---------------- */
const rsvpForm = document.getElementById("rsvp-form");
const rsvpStatus = document.getElementById("rsvp-status");

function sendRsvpToSheet(data){
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data)
  });
}

document.querySelectorAll(".btn-wa").forEach(btn => {
  btn.addEventListener("click", () => {
    const nama = document.getElementById("rsvp-nama").value.trim();
    const jumlah = document.getElementById("rsvp-jumlah").value;
    const kehadiran = rsvpForm.querySelector('input[name="kehadiran"]:checked').value;
    const ucapan = document.getElementById("rsvp-ucapan").value.trim();

    if (!nama || !ucapan) {
      rsvpStatus.textContent = "Mohon isi nama dan ucapan terlebih dahulu.";
      return;
    }

    const target = btn.getAttribute("data-target"); // "alfa" | "lenny"
    const waNumber = WA_NUMBERS[target];

    const payload = {
      nama, jumlah, kehadiran, ucapan,
      dikirimKe: target === "alfa" ? "Alfa" : "Lenny",
      waktu: new Date().toISOString()
    };

    // simpan ke Google Sheet (tidak ditampilkan di notifikasi mana nomor WA yang dipilih)
    sendRsvpToSheet(payload);

    // buka whatsapp dengan pesan siap kirim
    const message =
`Halo, saya ingin mengonfirmasi kehadiran:
Nama: ${nama}
Jumlah Tamu: ${jumlah}
Kehadiran: ${kehadiran}
Ucapan: ${ucapan}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    rsvpStatus.textContent = "Terima kasih! Konfirmasi kamu sedang dikirim.";
    showFloatingNotif(nama, kehadiran, ucapan);
    rsvpForm.reset();
  });
});

/* ---------------- Floating notification ---------------- */
const floatingNotif = document.getElementById("floating-notif");
let notifTimer = null;

function showFloatingNotif(nama, kehadiran, ucapan){
  clearTimeout(notifTimer);
  const shortUcapan = ucapan.length > 60 ? ucapan.slice(0,60) + "…" : ucapan;
  floatingNotif.innerHTML = `<b>${escapeHtml(nama)}</b> &middot; ${escapeHtml(kehadiran)}<br><span style="color:var(--ivory-dim);font-size:0.8rem;">${escapeHtml(shortUcapan)}</span>`;
  floatingNotif.classList.add("show");
  notifTimer = setTimeout(() => floatingNotif.classList.remove("show"), 10000);
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------- Guest list (fetched from Google Sheet) ---------------- */
const toggleGuestBtn = document.getElementById("toggle-guestlist");
const guestListEl = document.getElementById("guest-list");
let guestListLoaded = false;

toggleGuestBtn.addEventListener("click", async () => {
  guestListEl.classList.toggle("open");
  if (!guestListLoaded && guestListEl.classList.contains("open")) {
    guestListEl.innerHTML = '<p style="color:var(--ivory-dim);text-align:center;">Memuat ucapan…</p>';
    try {
      const res = await fetch(APPS_SCRIPT_URL, { method: "GET" });
      const list = await res.json();
      renderGuestList(list);
      guestListLoaded = true;
    } catch (e) {
      guestListEl.innerHTML = '<p style="color:var(--ivory-dim);text-align:center;">Belum ada data / periksa koneksi.</p>';
    }
  }
});

function renderGuestList(list){
  if (!Array.isArray(list) || list.length === 0) {
    guestListEl.innerHTML = '<p style="color:var(--ivory-dim);text-align:center;">Belum ada ucapan.</p>';
    return;
  }
  guestListEl.innerHTML = list.slice().reverse().map(g => `
    <div class="guest-entry">
      <span class="g-name">${escapeHtml(g.nama || "-")}</span><span class="g-status">${escapeHtml(g.kehadiran || "-")}</span>
      <p class="g-msg">${escapeHtml(g.ucapan || "")}</p>
    </div>
  `).join("");
}
