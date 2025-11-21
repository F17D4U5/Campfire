// storageHut.js
function drawStorageHuts(ctx, BONFIRE_POS, TILE_SIZE, gameState) {
    const storageCount = gameState.buildings.storageHut.count;
    const STORAGE_HUT_WIDTH = TILE_SIZE * 1.2; // 60
    const STORAGE_HUT_HEIGHT = 40;
    const STORAGE_ROOF_OVERHANG = 5;

    for (let i = 0; i < storageCount; i++) {
        const x = BONFIRE_POS.x - 80 - STORAGE_HUT_WIDTH - (i * (STORAGE_HUT_WIDTH + 20)); 
        const y = BONFIRE_POS.y - 20;

        // Dinding
        ctx.fillStyle = '#78716c';
        ctx.fillRect(x, y, STORAGE_HUT_WIDTH, STORAGE_HUT_HEIGHT);

        // Atap
        ctx.fillStyle = '#57534e';
        ctx.fillRect(x - STORAGE_ROOF_OVERHANG / 2, y - 10, STORAGE_HUT_WIDTH + STORAGE_ROOF_OVERHANG, 10);
        
        // Pintu
        const doorWidth = 15;
        const doorHeight = 25;
        const doorX = x + (STORAGE_HUT_WIDTH / 2) - (doorWidth / 2);
        const doorY = y + STORAGE_HUT_HEIGHT - doorHeight;
        ctx.fillStyle = '#402a1e';
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

        // Jendela
        const windowWidth = 8;
        const windowHeight = 8;
        const windowX = x + 10;
        const windowY = y + 10;
        ctx.fillStyle = '#2d333f';
        ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
    }
}

window.drawStorageHuts = drawStorageHuts;
