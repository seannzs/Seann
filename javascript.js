// ================= TAB NAVIGATION =================
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${tabId}`).classList.add('active');

    const activeContainer = document.querySelector('.container.active');
    if (activeContainer) {
        gsap.to(activeContainer, { opacity: 0, y: 10, duration: 0.15, onComplete: () => {
            activeContainer.classList.remove('active');
            activeContainer.style.display = 'none';
            showTargetTab(tabId);
        }});
    } else {
        showTargetTab(tabId);
    }
}

function showTargetTab(tabId) {
    const nextContainer = document.getElementById(`tab-${tabId}`);
    nextContainer.style.display = 'block';
    nextContainer.classList.add('active');
    gsap.fromTo(nextContainer, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
    if(tabId === 'ssrp-gen') drawSsrp();
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div>${type === 'success' ? '⚡' : '⚠️'}</div> <div>${message}</div>`;
    container.appendChild(toast);
    gsap.to(toast, { translateX: '0%', duration: 0.3, ease: "power2.out" });
    setTimeout(() => { gsap.to(toast, { opacity: 0, x: 20, duration: 0.2, onComplete: () => toast.remove() }); }, 3500);
}

// ================= REAL AI CHARACTER STORY ENGINE =================
async function generateStoryWithAnim() {
    const fullName = document.getElementById('charName').value.trim();
    const place = document.getElementById('birthPlace').value.trim();
    const dateInput = document.getElementById('birthDate').value;
    const infoTambahan = document.getElementById('promptTambahan').value.trim();

    if(!fullName || !place || !dateInput) {
        showNotification("Mohon isi semua data wajib!", "error");
        return;
    }

    const dateObj = new Date(dateInput);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formatCSDate = `${day}/${month}/${year}`;

    const btn = document.getElementById('btnGenCS');
    const loadingArea = document.getElementById('loadingAreaCS');
    const outputContainer = document.getElementById('outputContainerCS');

    // State Loading Aktif
    btn.disabled = true;
    loadingArea.style.display = 'block';
    gsap.fromTo(loadingArea, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    outputContainer.style.display = 'none';

    const promptAI = `Kamu adalah AI pembuat Character Story profesional untuk forum GTA SAMP JGRP. Buatlah cerita panjang sebanyak 3 paragraf (minimal 350 kata total), ketik dengan rapi, dan berikan awalan 5 spasi/indentasi di setiap awal paragraf. Karakter ini bernama ${fullName.replace('_', ' ')} yang lahir di ${place} pada tanggal ${day}/${month}/${year}. Detail latar belakang tambahan: ${infoTambahan || 'tidak ada'}. Dilarang merespon dalam bentuk struktur objek JSON, keluarkan langsung teks ceritanya saja secara polos tanpa markdown tebal.`;

    try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptAI)}?model=openai&system=${encodeURIComponent("Keluarkan respon dalam bentuk teks cerita langsung murni bahasa indonesia, dilarang membungkus dengan JSON.")}`);
        if (!response.ok) throw new Error("Koneksi API Gagal.");
        
        let rawData = await response.text();
        let cleanedStory = rawData.replace(/^["'`]|["'`]$/g, '').trim();

        const finalOutput = `Character: ${fullName}\nOrigin: ${place}\nStory Character Born: ${formatCSDate}\n\n${cleanedStory}`;

        document.getElementById('outputCS').innerText = finalOutput;
        
        loadingArea.style.display = 'none';
        outputContainer.style.display = 'block';
        gsap.fromTo(outputContainer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 });
        showNotification("Character Story sukses dibuat!", "success");
    } catch (error) {
        showNotification("Error: " + error.message, "error");
        loadingArea.style.display = 'none';
    } finally {
        btn.disabled = false;
    }
}

// ================= SSRP CANVAS ENGINE =================
const canvas = document.getElementById('ssrpCanvas');
const ctx = canvas.getContext('2d');

let loadedImg = null;
let textX = 40;
let textY = 60;
let selectedColor = '#ffffff';

function loadSsrpImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            loadedImg = img;
            canvas.width = img.width;
            canvas.height = img.height;
            textX = Math.round(img.width * 0.03);
            textY = Math.round(img.height * 0.06);
            drawSsrp();
            showNotification("Gambar berhasil dimuat!", "success");
        }
        img.src = event.target.result;
    }
    if(e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
}

function setSsrpColor(color, element) {
    selectedColor = color;
    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
    element.classList.add('active');
    drawSsrp();
}

function moveText(direction) {
    const speed = 12; 
    if(direction === 'up') textY -= speed;
    if(direction === 'down') textY += speed;
    if(direction === 'left') textX -= speed;
    if(direction === 'right') textX += speed;
    drawSsrp();
}

function drawSsrp() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (loadedImg) {
        ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#0c101f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 255, 240, 0.4)";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Silakan Lampirkan Screenshot Polosan Terlebih Dahulu", canvas.width / 2, canvas.height / 2);
        return;
    }

    const textValue = document.getElementById('ssrpText').value || "";
    const size = document.getElementById('ssrpFontSize').value || 26;
    
    ctx.font = `bold ${size}px Arial, Tahoma`;
    ctx.textAlign = "left";

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(textValue, textX, textY);

    ctx.fillStyle = selectedColor;
    ctx.fillText(textValue, textX, textY);
}

function downloadSsrpImg() {
    if(!loadedImg) {
        showNotification("Unggah gambar terlebih dahulu!", "error");
        return;
    }
    const link = document.createElement('a');
    link.download = 'nexus_ssrp_export.png';
    link.href = canvas.toDataURL();
    link.click();
    showNotification("Gambar SSRP siap pakai tersimpan!", "success");
}

function copyText(elementId) {
    const el = document.getElementById(elementId);
    navigator.clipboard.writeText(el.innerText).then(() => {
        showNotification("Berhasil disalin!", "success");
    }).catch(() => {
        showNotification("Gagal menyalin teks.", "error");
    });
}
