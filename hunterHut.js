// hunterHut.js
// Fungsi ini tidak dieksekusi langsung — dipanggil dari drawBuildings()
function drawHunterHuts(ctx, BONFIRE_POS, gameState) {
    const hutCount = gameState.buildings.hunterHut.count;
    const HUT_WIDTH = 50;
    const HUT_HEIGHT = 30;
    const ROOF_HEIGHT = 20;
    
    for (let i = 0; i < hutCount; i++) {
        const x = BONFIRE_POS.x + 80 + (i * (HUT_WIDTH + 20));
        const y = BONFIRE_POS.y - 20;

        // 1. Atap
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x - 5, y); 
        ctx.lineTo(x + HUT_WIDTH + 5, y); 
        ctx.lineTo(x + HUT_WIDTH / 2, y - ROOF_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // 2. Dinding Belakang (terlihat di dalam rongga)
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 5, y, HUT_WIDTH - 10, HUT_HEIGHT); 

        // 3. Gantungan Daging (horizontal bars)
        ctx.strokeStyle = '#a9a9a9';
        ctx.lineWidth = 2;
        for (let j = 0; j < 3; j++) {
            const barY = y + 5 + (j * 8);
            ctx.beginPath();
            ctx.moveTo(x + 7, barY);
            ctx.lineTo(x + HUT_WIDTH - 7, barY);
            ctx.stroke();
        }

        // 4. Tiang Penyangga Depan
        ctx.fillStyle = '#A0522D'; // Coklat kayu
        ctx.fillRect(x + 2, y, 5, HUT_HEIGHT + 5); 
        ctx.fillRect(x + HUT_WIDTH - 7, y, 5, HUT_HEIGHT + 5); 
    }
}

// expose sebagai global agar dipanggil (opsional)
window.drawHunterHuts = drawHunterHuts;
