function resizeCanvas() {
    const canvas = document.getElementById("gameCanvas");
    const wrapper = document.getElementById("canvas-wrapper");

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // --- Tambahkan elemen peringatan jika belum ada ---
    let rotateNotice = document.getElementById("rotate-notice");
    if (!rotateNotice) {
        rotateNotice = document.createElement("div");
        rotateNotice.id = "rotate-notice";
        rotateNotice.style.position = "fixed";
        rotateNotice.style.top = "0";
        rotateNotice.style.left = "0";
        rotateNotice.style.width = "100vw";
        rotateNotice.style.height = "100vh";
        rotateNotice.style.background = "rgba(0,0,0,0.85)";
        rotateNotice.style.color = "white";
        rotateNotice.style.display = "none";
        rotateNotice.style.zIndex = "9999";
        rotateNotice.style.justifyContent = "center";
        rotateNotice.style.alignItems = "center";
        rotateNotice.style.textAlign = "center";
        rotateNotice.style.fontSize = "1.2rem";
        rotateNotice.style.padding = "20px";
        rotateNotice.innerHTML = "🔄 <br> Silakan putar perangkat ke mode <b>landscape</b> untuk pengalaman terbaik.";
        document.body.appendChild(rotateNotice);
    }

	if (isMobile) {
	    // 📱 Mode mobile fullscreen, tetap sesuai layar
	    canvas.width = window.innerWidth;
	    canvas.height = window.innerHeight;

	    wrapper.style.width = `${window.innerWidth}px`;
	    wrapper.style.height = `${window.innerHeight}px`;

	    document.body.style.margin = "0";
	    document.body.style.padding = "0";
	    document.body.style.overflow = "hidden";

	    // Tampilkan peringatan rotasi jika portrait
	    if (screenHeight > screenWidth) {
	        rotateNotice.style.display = "flex";
	    } else {
	        rotateNotice.style.display = "none";
	    }

	    // Tambahkan kelas mode mobile ke body
	    document.body.classList.add("mobile-layout");
	} else {
	    // 💻 Mode desktop
	    canvas.width = Math.min(wrapper.clientWidth, screenWidth - 20);
	    canvas.height = Math.min(wrapper.clientWidth * 0.6, screenHeight - 110);

	    document.body.classList.remove("mobile-layout");
	    document.body.style.overflow = "auto";
	}

    // Update posisi objek
    BONFIRE_POS = { x: canvas.width / 2, y: canvas.height / 2 + 50 };
    WORKER_START_Y = BONFIRE_POS.y + 40;

    if (typeof ctx !== "undefined" && ctx) {
        drawVillage(performance.now());
    }
}

// Jalankan ulang resize saat ukuran layar berubah atau orientasi berubah
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
document.addEventListener("DOMContentLoaded", resizeCanvas);
