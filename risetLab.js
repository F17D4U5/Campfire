// risetLab.js
function drawRisetLab(ctx, BONFIRE_POS, TILE_SIZE, gameState) {
    if (gameState.buildings.risetLab.count < 1) return;

    const STORAGE_W = TILE_SIZE * 1.2;
    const x = BONFIRE_POS.x - 80 - STORAGE_W;
    const y = BONFIRE_POS.y + 40;

    const W = TILE_SIZE * 1.3;
    const H = 48;

    ctx.fillStyle = '#6b21a8';
    ctx.fillRect(x, y, W, H);

    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(x - 4, y - 12, W + 8, 12);

    ctx.fillStyle = '#2b1839';
    ctx.fillRect(x + W / 2 - 6, y + H - 22, 12, 22);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + W / 2, y + 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + W / 2 - 1, y + 16, 2, 12);
}

window.drawRisetLab = drawRisetLab;

window.buildRisetLab = function () {
    const b = gameState.buildings.risetLab;
    if (b.count >= 1) return gameLog("Sudah dibangun 1x saja.", true);
    if (gameState.resources.wood < b.cost.wood) return gameLog("Kayu tidak cukup!", true);

    gameState.resources.wood -= b.cost.wood;
    b.count = 1;
    gameLog("Riset Lab dibangun!");
    updateUI();
};

window.researchTraderUpgrade = function () {
    if (gameState.buildings.risetLab.count < 1) {
        gameLog("RisetLab belum dibangun!", true);
        return;
    }

    // Maksimal level 2
    if (gameState.traderUpgrade >= 2) {
        gameLog("Tidak ada lagi yang bisa diriset.");
        return;
    }

    const cost = (gameState.traderUpgrade === 0) ? 10 : 15;

    if (gameState.resources.food < cost) {
        gameLog(`❌ Makanan tidak cukup! (butuh ${cost})`, true);
        return;
    }

    gameState.resources.food -= cost;
    gameState.traderUpgrade += 1;

    if (gameState.traderUpgrade === 1) {
        gameLog("✨ Riset Lv1 selesai! Barter sekarang 10 → 7.");
    } else if (gameState.traderUpgrade === 2) {
        gameLog("💎 Riset Lv2 selesai! Barter sekarang 10 → 8.");
    }

    updateUI();
    updateTraderButtonsText();
    updateRisetButtonState();
};

window.updateRisetButtonState = function () {
    const panel = document.getElementById("riset-panel");
    const button = panel.querySelector("button");
    const text = document.getElementById("risetlab-finished-text");
    const label = document.getElementById("risetlab-label");

    // Jika riset sudah maksimal → sembunyikan tombol & label, tampilkan teks selesai
    if (gameState.traderUpgrade >= 2) {
        button.style.display = "none";
        label.style.display = "none";
        text.style.display = "block";
        return;
    }

    // Kalau masih bisa riset → tombol & label muncul, teks selesai disembunyikan
    button.style.display = "block";
    label.style.display = "block";
    text.style.display = "none";

    // Update tulisan biaya sesuai level
    const cost = (gameState.traderUpgrade === 0) ? 10 : 15;
    button.textContent = `Riset Pedagang (${cost} 🥩)`;
};

window.openRisetPanel = function () {
    document.getElementById("riset-panel").style.display = "block";
    updateRisetButtonState();
};

window.closeRisetPanel = function () {
    document.getElementById("riset-panel").style.display = "none";
};
