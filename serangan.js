// serangan.js (VERSI PERBAIKAN GERAKAN GUARD & UI POSITION)
// Sistem penjaga (manual) + serangan malam acak
(function(){
  const RAID_CHANCE = 0.25;
  const RAID_SPAWN_X = -60;
  const RAID_MIN_Y_OFFSET = -40;
  const RAID_MAX_Y_OFFSET = 40;
  const RAID_SPEED = 0.8;
  const RAID_JITTER = 0.6;
  const GUARD_RADIUS = 36; // radius roaming guard dekat bonfire (siang+malam)
  const CHECK_INTERVAL_MS = 600;
  const LOG_PREFIX = '🛡️';

  let attackers = [];
  let lastHour = null;
  let lastDay = null;
  let hourCheckerId = null;

  function waitForGameReady(cb){
    if (typeof window.gameState !== 'undefined' && typeof window.visualWorkers !== 'undefined' && typeof window.BONFIRE_POS !== 'undefined' && typeof window.canvas !== 'undefined' && typeof window.moveWorkerStochastic === 'function') {
      return cb();
    }
    setTimeout(()=> waitForGameReady(cb), 150);
  }

  function gameLog(msg, isError=false){
    if (typeof window.gameLog === 'function') window.gameLog(msg, isError);
    else console.log((isError? 'ERROR:':'') + msg);
  }

  // --- UI Inject (guard controls). Insert BEFORE "Pekerja Bebas" paragraph so free-workers stays at bottom
  function injectGuardControls(){
    const container = document.getElementById('worker-controls-content');
    if (!container) return;
    if (document.getElementById('guard-control-row')) return;

    const row = document.createElement('div');
    row.id = 'guard-control-row';
    row.className = 'flex justify-between items-center mt-2';
    row.innerHTML = `
      <span class="text-sm">🛡️ Guard: <span id="guard-stat-short">0</span></span>
      <div>
        <button id="guard-dec-btn" class="bg-gray-500 hover:bg-gray-600 text-white rounded-l disabled:opacity-50 font-bold">-</button>
        <button id="guard-inc-btn" class="bg-red-600 hover:bg-red-700 text-white rounded-r disabled:opacity-50 font-bold">+</button>
      </div>
    `;

    // Find the "Pekerja Bebas" paragraph (contains #free-workers-stat-short) and insert BEFORE it
    const freeP = container.querySelector('p.mt-3') || container.querySelector('p');
    if (freeP && freeP.parentNode === container) container.insertBefore(row, freeP);
    else container.appendChild(row);

    document.getElementById('guard-inc-btn').addEventListener('click', ()=> modifyGuard(1));
    document.getElementById('guard-dec-btn').addEventListener('click', ()=> modifyGuard(-1));
  }

  function ensureGuardState(){
    if (!window.gameState) return;
    if (typeof window.gameState.workers === 'undefined') window.gameState.workers = {};
    if (typeof window.gameState.workers.guard === 'undefined') window.gameState.workers.guard = 0;
  }

  function modifyGuard(change){
    if (window.gameState.isGameOver) return;
    ensureGuardState();
    if (change > 0){
      if (window.gameState.freeWorkers <= 0) {
        gameLog('Tidak ada pekerja bebas untuk dijadikan Guard!', true);
        return;
      }
      window.gameState.workers.guard++;
      window.gameState.freeWorkers = Math.max(0, window.gameState.freeWorkers - 1);
      // convert a free visual worker to guard if exists
      const freeV = window.visualWorkers.find(w => w.type === 'freeWorker');
      if (freeV) {
        freeV.type = 'guard';
        freeV.isTargetedMoving = false;
        freeV.targetX = null; freeV.targetY = null;
      } else {
        window.visualWorkers.push({ x: window.BONFIRE_POS.x, y: window.BONFIRE_POS.y, targetX:null, targetY:null, isMoving:true, isTargetedMoving:false, type:'guard' });
      }
    } else {
      if (window.gameState.workers.guard <= 0) {
        gameLog('Tidak ada Guard untuk dikurangi.');
        return;
      }
      window.gameState.workers.guard--;
      window.gameState.freeWorkers++;
      const guardV = window.visualWorkers.find(w => w.type === 'guard');
      if (guardV) {
        guardV.type = 'freeWorker';
        guardV.isTargetedMoving = false;
        guardV.targetX = null; guardV.targetY = null;
      }
    }
    updateGuardUI();
    if (typeof window.syncVisualWorkers === 'function') window.syncVisualWorkers();
    if (typeof window.updateUI === 'function') window.updateUI();
  }

  function updateGuardUI(){
    const el = document.getElementById('guard-stat-short');
    if (el) el.textContent = (window.gameState && window.gameState.workers && window.gameState.workers.guard) ? window.gameState.workers.guard : 0;
  }

  function ensureWorkerColors(){
    if (typeof window.WORKER_COLORS === 'object') {
      window.WORKER_COLORS.guard = window.WORKER_COLORS.guard || '#ef4444';
    }
  }

  // override syncVisualWorkers to ensure guard is allocated and keep ordering
  function overrideSyncVisualWorkers(){
    if (typeof window.syncVisualWorkers !== 'function') return;
    window.syncVisualWorkers = function(){
      const requiredCount = window.gameState.population;
      if (window.visualWorkers.length !== requiredCount) {
        while (window.visualWorkers.length < requiredCount) {
          const randomAngle = Math.random() * Math.PI * 2;
          const randomRadius = Math.random() * (window.REST_RADIUS || 30);
          window.visualWorkers.push({ x: window.BONFIRE_POS.x + Math.cos(randomAngle) * randomRadius, y: (window.WORKER_START_Y || window.BONFIRE_POS.y + 40) + Math.sin(randomAngle) * randomRadius, targetX: null, targetY: null, isMoving: true, isTargetedMoving: false, type: 'freeWorker' });
        }
        while (window.visualWorkers.length > requiredCount) window.visualWorkers.pop();
      }
      let idx = 0;
      const counts = {
        gatherer: window.gameState.workers.gatherer || 0,
        hunter: window.gameState.workers.hunter || 0,
        guard: window.gameState.workers.guard || 0,
        freeWorker: window.gameState.freeWorkers || 0
      };
      ['gatherer','hunter','guard','freeWorker'].forEach(type => {
        for (let i=0;i<(counts[type]||0); i++){
          if (window.visualWorkers[idx]) window.visualWorkers[idx].type = type;
          idx++;
        }
      });
      for (; idx < window.visualWorkers.length; idx++){
        if (window.visualWorkers[idx]) window.visualWorkers[idx].type = 'freeWorker';
      }
      updateGuardUI();
    };
  }

  function overrideUpdateUI(){
    if (typeof window.updateUI !== 'function') return;
    const orig = window.updateUI;
    window.updateUI = function(){
      orig();
      updateGuardUI();
      const inc = document.getElementById('guard-inc-btn');
      const dec = document.getElementById('guard-dec-btn');
      if (inc) inc.disabled = !(window.gameState && window.gameState.freeWorkers > 0);
      if (dec) dec.disabled = !(window.gameState && window.gameState.workers && window.gameState.workers.guard > 0);
    };
  }

  // --- ATTACKER LOGIC (unchanged) ---
  function spawnAttackersIfChosen(){
    if (!window.gameState.time.isNight) return;
    if (Math.random() >= RAID_CHANCE) {
      gameLog(`${LOG_PREFIX} Malam ini tidak ada serangan.`);
      return;
    }
    const day = window.gameState.time.dayCount || 1;
    const cap = (day >= 6) ? 10 : 2;
    const count = Math.floor(Math.random() * cap) + 1;
    const cvs = window.canvas;
    const centerY = window.BONFIRE_POS ? window.BONFIRE_POS.y : (cvs ? cvs.height/2 : 200);
    for (let i=0;i<count;i++){
      const y = centerY + (Math.random()*(RAID_MAX_Y_OFFSET-RAID_MIN_Y_OFFSET) + RAID_MIN_Y_OFFSET);
      attackers.push({
        x: RAID_SPAWN_X - Math.random()*40,
        y: y + (Math.random()*20 - 10),
        targetX: null,
        targetY: null,
        alive: true,
        id: 'r'+Date.now()+'_'+i
      });
    }
    gameLog(`${LOG_PREFIX} Terjadi serangan! ${count} penyerang muncul dari hutan (jam 21:00).`);
  }

  function setAttackersTargets(){
    if (!attackers || attackers.length === 0) return;
    const guardVisuals = window.visualWorkers.filter(v => v.type === 'guard');
    attackers.forEach(a => {
      if (guardVisuals.length > 0){
        const target = guardVisuals[Math.floor(Math.random()*guardVisuals.length)];
        a.targetX = target.x + (Math.random()*30 - 15);
        a.targetY = target.y + (Math.random()*30 - 15);
      } else {
        a.targetX = window.BONFIRE_POS.x + (Math.random()*20 - 10);
        a.targetY = window.BONFIRE_POS.y + (Math.random()*20 - 10);
      }
    });
  }

  function moveAttackers(){
    attackers.forEach(a => {
      if (!a.alive) return;
      if (typeof a.targetX === 'undefined' || a.targetX === null) {
        a.targetX = window.BONFIRE_POS.x;
        a.targetY = window.BONFIRE_POS.y;
      }
      a.targetX += (Math.random()*RAID_JITTER - RAID_JITTER/2);
      a.targetY += (Math.random()*RAID_JITTER - RAID_JITTER/2);
      const dx = (a.targetX) - a.x;
      const dy = (a.targetY) - a.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      a.x += (dx/dist) * RAID_SPEED;
      a.y += (dy/dist) * RAID_SPEED;
      if (a.x < 0) a.x += 0.2;
    });
    const cvs = window.canvas;
    attackers = attackers.filter(a => (a.x > -200 && (!cvs || a.x < cvs.width + 200)));
  }

  function resolveBattle(){
    if (!attackers || attackers.length === 0) {
      gameLog(`${LOG_PREFIX} Tidak ada penyerang untuk diselesaikan.`);
      return;
    }
    const numAttackers = attackers.length;
    const numGuards = (window.gameState.workers.guard || 0);
    const powerGuards = numGuards * 5;
    const powerAttackers = numAttackers * 2;

    if (powerGuards >= powerAttackers) {
      window.gameState.resources.wood = (window.gameState.resources.wood || 0) + numAttackers;
      gameLog(`${LOG_PREFIX} Desa menang! Mendapat +${numAttackers} 🪵 kayu.`);
    } else {
      const steal = numAttackers * 2;
      const lost = Math.min(window.gameState.resources.wood || 0, steal);
      window.gameState.resources.wood = Math.max(0, (window.gameState.resources.wood || 0) - lost);
      gameLog(`${LOG_PREFIX} Desa kalah... Kehilangan ${lost} 🪵 kayu.`);
    }
    attackers = [];
    if (typeof window.updateUI === 'function') window.updateUI();
  }

  // Draw attackers & update guard behaviour using moveWorkerStochastic (from index.js)
  function drawAttackers(time){
    if (!window.ctx || !window.canvas) return;
    const ctx = window.ctx;
    attackers.forEach(a => {
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 6, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(a.x-6, a.y+5, 12, 2);
    });
    moveAttackers();
    updateGuardsBehavior();
  }

  // NEW: use the same stochastic walker as other workers for both day & night
  function updateGuardsBehavior(){
    if (!window.visualWorkers || !window.BONFIRE_POS) return;
    const guards = window.visualWorkers.filter(w => w.type === 'guard');
    const center = { x: window.BONFIRE_POS.x, y: window.WORKER_START_Y || (window.BONFIRE_POS.y + 40) };
    guards.forEach((g) => {
      // Reset targeted movement — rely on stochastic to produce natural walking
      g.isTargetedMoving = false;
      g.targetX = g.targetX || null;
      g.targetY = g.targetY || null;
      // call index's stochastic walker: moveWorkerStochastic(worker, center, radius, minDistance)
      // ensure function exists
      if (typeof window.moveWorkerStochastic === 'function') {
        // Use a moderate radius so they stay near bonfire and walk like other workers
        window.moveWorkerStochastic(g, center, GUARD_RADIUS, (window.MIN_DISTANCE_FROM_BONFIRE || 15));
      } else {
        // fallback: very gentle manual movement toward center
        const dx = center.x - g.x;
        const dy = center.y - g.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        if (dist > 1) { g.x += (dx/dist) * 0.3; g.y += (dy/dist) * 0.3; }
      }
    });
  }

  function startHourWatcher(){
    if (hourCheckerId) return;
    lastHour = window.gameState.time.hour;
    lastDay = window.gameState.time.dayCount;
    hourCheckerId = setInterval(()=>{
      const gs = window.gameState;
      if (!gs) return;
      const h = gs.time.hour;
      const d = gs.time.dayCount;
      if (h !== lastHour || d !== lastDay) {
        if (h === 21 && gs.time.isNight) {
          if (attackers.length === 0) {
            spawnAttackersIfChosen();
            setAttackersTargets();
          }
        }
        if (h === 23 && gs.time.isNight) {
          resolveBattle();
        }
      }
      lastHour = h;
      lastDay = d;
    }, CHECK_INTERVAL_MS);
  }

  function wrapDrawVillage(){
    if (typeof window.drawVillage !== 'function') return;
    const orig = window.drawVillage;
    window.drawVillage = function(time){
      try { orig(time); } catch(e){ console.error('drawVillage wrap original failed', e); }
      if (typeof window.drawAttackers === 'function') {
        try { window.drawAttackers(time); } catch(e){ console.error('drawAttackers error', e); }
      }
    };
  }

  function resetForRestart(){
    attackers = [];
    lastHour = null;
    lastDay = null;
    if (hourCheckerId) { clearInterval(hourCheckerId); hourCheckerId = null; }
    startHourWatcher();
  }
  window.resetAttackSystemForRestart = resetForRestart;

  waitForGameReady(()=> {
    ensureGuardState();
    injectGuardControls();
    ensureWorkerColors();
    overrideSyncVisualWorkers();
    overrideUpdateUI();
    window.drawAttackers = drawAttackers;
    wrapDrawVillage();
    startHourWatcher();
    updateGuardUI();
    gameLog(`${LOG_PREFIX} Sistem pertahanan & serangan diaktifkan.`);
  });

  window._attackSystem = {
    attackersRef: () => attackers,
    forceSpawn: function(n){
      attackers = [];
      const day = window.gameState.time.dayCount || 1;
      const cap = (day >= 6) ? 10 : 2;
      const nn = Math.min(n, cap);
      const centerY = window.BONFIRE_POS ? window.BONFIRE_POS.y : 200;
      for (let i=0;i<nn;i++){
        attackers.push({ x: RAID_SPAWN_X - Math.random()*40, y: centerY + (Math.random()*50-25), targetX:null, targetY:null, alive:true });
      }
      setAttackersTargets();
    },
    resolveNow: resolveBattle
  };

})();
