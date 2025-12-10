let wandererCanvasElement = null;

let wanderer = {
    x: -50,
    y: 0,
    targetX: 0,
    state: 'idle',
    speed: 2
};

function initWandererSystem() {
    gameLog("Sistem pengembara sudah aktif.");
}

function spawnWanderer() {
    const currentHour = gameState.time.hour;

    if (!gameState.events.isWandererPresent && 
        gameState.time.dayCount > 1 && 
        !gameState.time.isNight && 
        currentHour >= 7 && 
        currentHour <= 12) {
        
        if (Math.random() < 0.20) {
            gameState.events.isWandererPresent = true;
            gameState.events.wandererArrivalHour = currentHour;

			createWandererPanelIfNotExists();
			document.getElementById('wanderer-panel').style.display = 'block';

            gameLog(`Seorang pengembara tiba! beri makanan agar tinggal.`);
            drawWandererAppearance();
        }
    }

    if (gameState.events.isWandererPresent && currentHour === 17) {
        rejectWanderer(true);
    }
}

function createWandererPanelIfNotExists() {
    const oldPanel = document.getElementById('wanderer-panel');
    if (oldPanel) oldPanel.remove();

    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    const panel = document.createElement('div');
    panel.id = 'wanderer-panel';
    panel.className = 'bg-yellow-800 text-white p-2 rounded-lg shadow-lg absolute top-1/2 -translate-y-1/2 right-4 z-40 max-w-xs';
    panel.style.display = 'none';

    panel.innerHTML = `
        <div class="text-center mb-1">
            <p class="text-lg font-semibold mb-1 animate-pulse">Pengembara Tiba!</p>
        </div>
                <p class="text-sm mb-1">Orang ini kelaparan dan meminta <span id="wanderer-cost">3</span>🥩 Makanan untuk menetap.</p>
        <div class="grid grid-cols-2 gap-3">
            <button onclick="acceptWanderer()" class="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded-lg font-bold transition">
                Terima
            </button>
            <button onclick="rejectWanderer()" class="bg-red-700 hover:bg-red-600 px-2 py-1 rounded-lg font-bold transition">
                Tolak
            </button>
        </div>
    `;

    wrapper.appendChild(panel);
}

function acceptWanderer() {
    if (gameState.resources.food < gameState.events.wandererFoodCost) {
        gameLog(`Makanan tidak cukup! Butuh ${gameState.events.wandererFoodCost} makanan.`, true);
        return;
    }

    gameState.resources.food -= gameState.events.wandererFoodCost;
    gameState.population++;
    gameState.maxWorkers++;
    gameState.freeWorkers++;

    gameLog(`Pengembara diterima! Populasi sekarang ${gameState.population}.`);

    const panel = document.getElementById('wanderer-panel');
    if (panel) panel.style.display = 'none';
    gameState.events.isWandererPresent = false;
    wandererCanvasElement = null;
	wanderer.state = "idle";

    syncVisualWorkers();
    updateUI();
}

function rejectWanderer(automatic = false) {
    const msg = automatic 
        ? "Pengembara pergi karena tidak diberi makanan saat matahari terbenam."
        : "Pengembara ditolak dan pergi meninggalkan kamp.";

    gameLog(msg, automatic);
    
    const panel = document.getElementById('wanderer-panel');
    if (panel) panel.style.display = 'none';
    
	wanderer.state = "walkingOut";
	gameState.events.isWandererPresent = false;
    wandererCanvasElement = null;
}

function drawWanderer(time) {
    if (!gameState.events.isWandererPresent && wanderer.state !== "walkingOut") return;

    // gerak masuk
    if (wanderer.state === "idle" && gameState.events.isWandererPresent) wanderer.state = "walkingIn";
    if (wanderer.state === "walkingIn" && wanderer.x < wanderer.targetX) wanderer.x += wanderer.speed;
    if (wanderer.state === "walkingIn" && wanderer.x >= wanderer.targetX) wanderer.state = "waiting";

    // gerak keluar
    if (wanderer.state === "walkingOut" && wanderer.x > -100) wanderer.x -= wanderer.speed * 1.4;
    if (wanderer.state === "walkingOut" && wanderer.x <= -100) wanderer.state = "idle";

    // gambar pengembara
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(wanderer.x, wanderer.y - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // tanda tanya kalau nunggu
    if (wanderer.state === "waiting") {
        const bob = Math.sin(time / 200) * 4;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px Arial";
        ctx.textAlign = "center";
        ctx.fillText("?", wanderer.x, wanderer.y - 35 + bob);
    }
}

function drawWandererAppearance() {}
window.initWandererSystem = initWandererSystem;
window.spawnWanderer = spawnWanderer;
window.acceptWanderer = acceptWanderer;
window.rejectWanderer = rejectWanderer;
window.drawWanderer = drawWanderer;