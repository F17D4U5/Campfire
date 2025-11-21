// 1. Inisialisasi Audio Latar Belakang (BGM)
const bgmAudio = new Audio("opening.mp3");
bgmAudio.loop = true;
bgmAudio.volume = 1; // Atur volume BGM agar tidak terlalu keras

// 2. Inisialisasi Audio Game Over
const gameOverAudio = new Audio("GameOver.mp3");
gameOverAudio.loop = true;
gameOverAudio.volume = 1;

// Fungsi untuk memulai BGM setelah interaksi pengguna pertama
function startBGM() {
    if (bgmAudio.paused) {
        bgmAudio.play().catch(e => console.error("Gagal memutar BGM:", e));
    }
}

// Fungsi yang akan dipanggil saat Game Over
function playGameOverMusic() {
    // Hentikan BGM
    bgmAudio.pause();
    bgmAudio.currentTime = 0; // Reset ke awal

    // Mainkan musik Game Over
    gameOverAudio.play().catch(e => console.error("Gagal memutar musik Game Over:", e));
}

// Aturan agar musik mulai setelah klik pertama (wajib di browser modern)
document.addEventListener("click", startBGM, { once: true });