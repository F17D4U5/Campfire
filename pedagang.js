// trader.js
function initializeTraderSystem() {
    gameState.trader = {
        isPresent: false,
        arrivalHour: 8,
        leaveHour: 16
    };
}

function updateTraderLogic() {
    const hour = gameState.time.hour;

    // Pedagang tiba
    if (!gameState.trader.isPresent && !gameState.time.isNight && hour === gameState.trader.arrivalHour) {
        gameState.trader.isPresent = true;
        document.getElementById("trader-panel").style.display = "block";
        gameLog("🧑‍🌾 Seorang pedagang tiba di desa!");
    }

    // Pedagang pergi
    if (gameState.trader.isPresent && hour === gameState.trader.leaveHour) {
        gameState.trader.isPresent = false;
        document.getElementById("trader-panel").style.display = "none";
        gameLog("Pedagang telah pergi.");
    }
}

function trade(resourceGive, resourceReceive) {
    const giveAmount = 10;
    let receiveAmount = 6;

    if (gameState.traderUpgrade === 1) receiveAmount = 7;
    else if (gameState.traderUpgrade === 2) receiveAmount = 8;

    if (gameState.resources[resourceGive] < giveAmount) {
        gameLog(`Tidak cukup ${resourceGive}!`, true);
        return;
    }

    gameState.resources[resourceGive] -= giveAmount;
    gameState.resources[resourceReceive] += receiveAmount;

    gameLog(`✅ Barter: ${giveAmount} ${resourceGive} → ${receiveAmount} ${resourceReceive}`);
    updateUI();
}

function updateTraderButtonsText() {
    let receiveAmount = 6;
    if (gameState.traderUpgrade === 1) receiveAmount = 7;
    else if (gameState.traderUpgrade === 2) receiveAmount = 8;

    const woodToFoodBtn = document.querySelector('#trader-panel button:nth-child(1)');
    const foodToWoodBtn = document.querySelector('#trader-panel button:nth-child(2)');

    if (woodToFoodBtn) {
        woodToFoodBtn.textContent = `Tukar 10 🪵 → ${receiveAmount} 🥩`;
    }
    if (foodToWoodBtn) {
        foodToWoodBtn.textContent = `Tukar 10 🥩 → ${receiveAmount} 🪵`;
    }
}