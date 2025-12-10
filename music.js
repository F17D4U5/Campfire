const playlist = [
    "opening.mp3",
    "music1.mp3"
];

let currentTrackIndex = 0;
const bgmAudio = new Audio();
bgmAudio.loop = false;
bgmAudio.volume = 1;

const gameOverAudio = new Audio("GameOver.mp3");
gameOverAudio.loop = true;
gameOverAudio.volume = 1;

// === TAMBAHAN: UI Tombol Volume ===
const volumeUI = document.createElement("div");
volumeUI.id = "volume-control";
volumeUI.className = "fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-2xl border border-amber-600/50";
volumeUI.innerHTML = `
    <button id="volume-toggle" class="text-2xl text-amber-400 hover:text-amber-300 transition">Volume On</button>
    <input type="range" id="volume-slider" min="0" max="100" value="70" class="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500">
    <span id="volume-percent" class="text-white text-sm w-12 text-right">70%</span>
`;
document.body.appendChild(volumeUI);

// Event tombol mute/unmute
document.getElementById("volume-toggle").addEventListener("click", () => {
    if (bgmAudio.volume > 0 || gameOverAudio.volume > 0) {
        // MUTE semua
        bgmAudio.volume = 0;
        gameOverAudio.volume = 0;
        document.getElementById("volume-toggle").textContent = "Volume Off";
        document.getElementById("volume-slider").value = 0;
        document.getElementById("volume-percent").textContent = "0%";
    } else {
        // UNMUTE
        bgmAudio.volume = document.getElementById("volume-slider").value / 100;
        gameOverAudio.volume = 1;
        document.getElementById("volume-toggle").textContent = "Volume On";
        document.getElementById("volume-percent").textContent = document.getElementById("volume-slider").value + "%";
    }
});

// Event slider
document.getElementById("volume-slider").addEventListener("input", (e) => {
    const vol = e.target.value / 100;
    bgmAudio.volume = vol;
    gameOverAudio.volume = vol;

    document.getElementById("volume-percent").textContent = e.target.value + "%";
    document.getElementById("volume-toggle").textContent = vol > 0 ? "Volume On" : "Volume Off";
});

// === Fungsi Playlist ===
function playNextTrack() {
    bgmAudio.src = playlist[currentTrackIndex];
    bgmAudio.play().catch(e => console.error("Gagal memutar BGM:", e));
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
}

bgmAudio.addEventListener("ended", () => {
    if (!gameOverAudio.playing && bgmAudio.volume > 0) {
        playNextTrack();
    }
});

function startBGM() {
    if (bgmAudio.paused && !bgmAudio.src) {
        playNextTrack();
    }
}

// Game Over
function playGameOverMusic() {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmAudio.src = "";

    gameOverAudio.play().catch(e => console.error("Gagal memutar musik Game Over:", e));
}

document.addEventListener("click", startBGM, { once: true });

window.playGameOverMusic = playGameOverMusic;
window.resumeBGM = resumeBGM;