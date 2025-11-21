let forestBuffer = null;
(function(){
  const CONFIG = {
    widthFraction: 0.16,    // seberapa lebar area hutan di sisi kiri
    layerOpacity: 1.0,
    rowDensity: 1.3         // 1.0 = default, 2.0 = dua kali lebih banyak pohon vertikal
  };

  // --- Gambar satu pohon dengan bayangan ---
  function drawTree(ctx, x, y, scale) {
    const shadowOffsetX = 4 * scale;
    const shadowOffsetY = 5 * scale;
    const shadowBlur = 5 * scale;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;

    const trunkH = 20 * scale;
    const trunkW = 6 * scale;
    ctx.fillStyle = 'rgba(45,30,18,0.95)';
    ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);

    const baseY = y - trunkH;
    ctx.beginPath();
    ctx.arc(x, baseY, 15 * scale, 0, Math.PI * 2);
    ctx.arc(x - 10 * scale, baseY + 5 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.arc(x + 10 * scale, baseY + 5 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(18,80,18,0.9)';
    ctx.fill();
    ctx.restore();

    // Highlight lembut
    ctx.beginPath();
    ctx.arc(x - 6 * scale, baseY - 2 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(60,170,60,0.1)';
    ctx.fill();
  }

  // --- Gambar keseluruhan hutan ---
 function drawForestOverlay(ctx, canvas) {
  const width = Math.floor(canvas.width * CONFIG.widthFraction);
  const height = canvas.height;

  // --- Buat buffer sekali ---
  if (!forestBuffer) {
    forestBuffer = document.createElement('canvas');
    forestBuffer.width = width;
    forestBuffer.height = height;
    const fctx = forestBuffer.getContext('2d');

    const cols = Math.floor(width / 30);
    const rows = Math.floor((height / 50) * CONFIG.rowDensity);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c / cols) * width + 8;
        const y = (r / rows) * height + 40;
        const scale = 1.3;
        drawTree(fctx, x, y, scale);
      }
    }
  }

  // --- Tempel buffer ke frame utama ---
  ctx.drawImage(forestBuffer, 0, 0);
}

  // --- Ekspor fungsi & API global ---
  window.drawForestOverlay = drawForestOverlay;
  window.hutan = {
    setRowDensity(v) {
      CONFIG.rowDensity = Math.max(0.2, Math.min(5, v)); // batasi agar tidak terlalu gila
    },
    setWidthFraction(v) {
      CONFIG.widthFraction = Math.max(0, Math.min(1, v));
    },
    setOpacity(v) {
      CONFIG.layerOpacity = Math.max(0, Math.min(1, v));
    }
  };
})();
