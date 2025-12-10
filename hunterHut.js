document.addEventListener('DOMContentLoaded', () => {
    if (typeof gameState === 'undefined') return;

    gameState.buildings.hunterHut.huts = gameState.buildings.hunterHut.huts || [];

    window.drawHunterHuts = (ctx, BONFIRE_POS, gameState) => {
        const huts = gameState.buildings.hunterHut.huts;
        const W = 50, H = 30, R = 20;
        huts.forEach((hut, i) => {
            const x = BONFIRE_POS.x + 80 + i*70;
            const y = BONFIRE_POS.y - 20;
            hut.bounds = {x:x-5, y:y-R, width:W+10, height:H+R};

            ctx.fillStyle = '#8B4513';
            ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+W+5,y); ctx.lineTo(x+W/2,y-R); ctx.closePath(); ctx.fill();

            ctx.fillStyle = '#654321';
            ctx.fillRect(x+5,y,W-10,H);

            ctx.strokeStyle = '#a9a9a9'; ctx.lineWidth = 2;
            for(let j=0;j<3;j++){ const by=y+5+j*8; ctx.beginPath(); ctx.moveTo(x+7,by); ctx.lineTo(x+W-7,by); ctx.stroke(); }

            ctx.fillStyle = '#A0522D';
            ctx.fillRect(x+2,y,5,H+5); ctx.fillRect(x+W-7,y,5,H+5);

            ctx.fillStyle = 'white'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
            ctx.fillText(`Lv.${hut.level}`, x+W/2, y-R/2+5);
        });
    };

    window.buildHunterHut = () => {
        if (gameState.resources.wood < 20) return gameLog('Kayu tidak cukup!', true);
        gameState.resources.wood -= 20;
        gameState.buildings.hunterHut.count++;
        gameState.buildings.hunterHut.huts.push({level:1, maxWorkers:1});
        gameLog('Hunter Hut dibangun!');
        syncHunterCapacity();
        updateUI();
    };

    window.syncHunterCapacity = () => {
        const total = gameState.buildings.hunterHut.huts.reduce((a,h)=>a+h.maxWorkers,0);
        const el = document.getElementById('max-hunter-stat-short');
        if(el) el.textContent = total;
    };

    if (!document.getElementById('hut-upgrade-panel')) {
        const p = document.createElement('div');
        p.id = 'hut-upgrade-panel';
        p.className = 'absolute bg-slate-800 border-2 border-amber-600 rounded-lg p-5 z-50 text-white hidden shadow-2xl';
        p.style = 'top:50%;left:50%;transform:translate(-50%,-50%);width:340px;';
        p.innerHTML = `
            <h3 class="text-xl font-bold mb-3 text-amber-400">Upgrade Hunter Hut</h3>
            <p class="mb-2">Level: <span id="cl">1</span> → <strong><span id="nl">2</span></strong></p>
            <p class="mb-4">Pemburu: <span id="cc">1</span> → <strong><span id="nc">2</span></strong></p>
            <button id="ub" class="bg-orange-600 hover:bg-orange-700 w-full py-2 rounded font-bold">
                UPGRADE — <span id="cw">50</span> Kayu + <span id="cf">20</span> Makanan
            </button>
            <button onclick="this.parentElement.classList.add('hidden')" class="mt-3 text-xs underline w-full">Tutup</button>`;
        document.getElementById('canvas-wrapper').appendChild(p);
    }

    window.openHutUpgradePanel = i => {
        const h = gameState.buildings.hunterHut.huts[i];
        const nl = h.level + 1;
        const wood = 30 + h.level*5;
        const food = 5 + h.level*5;
        document.getElementById('cl').textContent = h.level;
        document.getElementById('nl').textContent = nl;
        document.getElementById('cc').textContent = h.maxWorkers;
        document.getElementById('nc').textContent = h.maxWorkers+1;
        document.getElementById('cw').textContent = wood;
        document.getElementById('cf').textContent = food;
        document.getElementById('ub').onclick = () => {
            if (gameState.resources.wood >= wood && gameState.resources.food >= food) {
                gameState.resources.wood -= wood;
                gameState.resources.food -= food;
                h.level++; h.maxWorkers++;
                gameLog(`Hunter Hut Lv.${h.level}!`);
                syncHunterCapacity(); updateUI();
                openHutUpgradePanel(i);
            } else gameLog('Sumber daya tidak cukup!', true);
        };
        document.getElementById('hut-upgrade-panel').classList.remove('hidden');
    };

    const oldClick = window.handleCanvasClick || (() => {});
    window.handleCanvasClick = e => {
        oldClick(e);
        if (!canvas) return;
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const my = e.clientY - r.top;
        gameState.buildings.hunterHut.huts.forEach((h,i) => {
            if (h.bounds && mx >= h.bounds.x && mx <= h.bounds.x + h.bounds.width && 
                my >= h.bounds.y && my <= h.bounds.y + h.bounds.height) {
                openHutUpgradePanel(i);
            }
        });
    };

    syncHunterCapacity();
});