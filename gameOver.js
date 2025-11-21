// gameOver.js
function gameOver(reason) {
    clearInterval(timeIntervalId);
    clearInterval(cityIntervalId);
    cancelAnimationFrame(animationFrameId);

    // Panggil fungsi musik Game Over (sesuai permintaan sebelumnya)
    if (typeof playGameOverMusic === 'function') {
        playGameOverMusic();
    }

    let message = "";
    let survived = gameState.time.dayCount || 0;

    if (reason === "starvation") {
        message = "❌ Semua penduduk meninggal karena kelaparan.";
    }
    else if (reason === "raid") {
        message = "❌ Desa hancur saat penyerangan malam hari.";
    }
    else {
        message = "❌ Populasi habis — permainan berakhir.";
    }

    gameLog(message, true);
    showGameOverOverlay(message, survived);
}
function showGameOverOverlay(message, survivedDays) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.color = "white";
    overlay.style.fontSize = "24px";
    overlay.style.zIndex = 99999;
    overlay.style.textAlign = "center";
    overlay.style.padding = "20px";

    overlay.innerHTML = `
        <div>
            <p style="font-size:28px; margin-bottom:20px;">
                ${message}
            </p>
            <p style="font-size:22px; margin-bottom:30px;">
                🌿 Kamu bertahan selama <b>${survivedDays}</b> hari.
            </p>

            <button 
                onclick="restartGame()" 
                style="
                    margin-top:10px;
                    padding:12px 25px;
                    background:#ef4444;
                    color:white;
                    font-size:20px;
                    border-radius:10px;
                    cursor:pointer;
                ">
                Main Lagi
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

// Restart hanya reload halaman (reset total game)
function restartGame() {
    location.reload();
}