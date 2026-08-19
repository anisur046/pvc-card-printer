/**
 * High-Resolution e-Aadhaar Card Renderer & Auto-Cropper
 * Matches official UIDAI e-Aadhaar layout pixel-for-pixel (Front & Back)
 */

export function cropImageCanvas(imageSrc, sxP, syP, swP, shP, paddingPx = 4) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const sx = Math.max(0, (img.width * sxP) / 100);
      const sy = Math.max(0, (img.height * syP) / 100);
      const sw = Math.min(img.width - sx, (img.width * swP) / 100);
      const sh = Math.min(img.height - sy, (img.height * shP) / 100);

      // Strict CR80 PVC Card Dimensions: 1800 x 1135 @ 300+ DPI (Aspect ratio: 85.6mm / 53.98mm = 1.58577)
      const targetW = 1800;
      const targetH = 1135;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // White Card Base Fill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);

      if (sw <= 0 || sh <= 0) {
        resolve(canvas.toDataURL('image/png', 1.0));
        return;
      }

      // Minimal edge margin to maximize card size on CR80 canvas
      const padX = paddingPx;
      const padY = Math.round(paddingPx * (targetH / targetW));

      const renderW = targetW - (padX * 2);
      const renderH = targetH - (padY * 2);

      // Draw cropped source filling CR80 PVC canvas perfectly
      ctx.drawImage(img, sx, sy, sw, sh, padX, padY, renderW, renderH);
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = () => resolve(null);
    img.src = imageSrc;
  });
}

/**
 * Auto-crop an e-Aadhaar PDF or document image into exact Front & Back card sides
 */
export async function cropAadhaarSides(imageSrc) {
  if (!imageSrc) return { frontImage: null, backImage: null };

  // Full e-Aadhaar PDF cut-out bounds (Preserves full left rotated text, right disclaimer box, and bottom red bar on Front)
  const frontBounds = { sx: 2.4, sy: 70.2, sw: 45.8, sh: 28.0 };
  const backBounds = { sx: 51.8, sy: 70.2, sw: 45.8, sh: 28.0 };

  const frontImage = await cropImageCanvas(imageSrc, frontBounds.sx, frontBounds.sy, frontBounds.sw, frontBounds.sh, 6);
  const backImage = await cropImageCanvas(imageSrc, backBounds.sx, backBounds.sy, backBounds.sw, backBounds.sh, 6);

  return { frontImage, backImage };
}

// Vector/SVG Helpers for Canvas Drawing
function drawEmblem(ctx, x, y, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#000000';
  // Ashoka Lions Capital Pedestal Silhouette
  ctx.fillRect(35, 110, 50, 8);
  ctx.fillRect(25, 118, 70, 10);

  // Wheel (Chakra)
  ctx.beginPath();
  ctx.arc(60, 100, 10, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  // Lions Silhouette
  ctx.beginPath();
  ctx.moveTo(40, 110);
  ctx.lineTo(35, 80);
  ctx.lineTo(25, 60);
  ctx.lineTo(30, 40);
  ctx.lineTo(45, 20);
  ctx.lineTo(60, 15);
  ctx.lineTo(75, 20);
  ctx.lineTo(90, 40);
  ctx.lineTo(95, 60);
  ctx.lineTo(85, 80);
  ctx.lineTo(80, 110);
  ctx.closePath();
  ctx.fill();

  // Crown & Details
  ctx.beginPath();
  ctx.arc(60, 25, 12, 0, Math.PI * 2);
  ctx.fill();

  // Satyameva Jayate text at base
  ctx.font = 'bold 10px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('सत्यमेव जयते', 60, 136);

  ctx.restore();
}

function drawAadhaarLogo(ctx, x, y, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Sun halo rays
  ctx.fillStyle = '#ea580c';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    ctx.save();
    ctx.translate(50, 45);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-4, -40);
    ctx.lineTo(4, -40);
    ctx.lineTo(0, -52);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Fingerprint Arches (Orange / Yellow)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  for (let r = 12; r <= 36; r += 7) {
    ctx.beginPath();
    ctx.arc(50, 48, r, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
  }

  // Bengali text below: আধার
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 26px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('আধার', 50, 105);

  ctx.restore();
}

function drawHeaderBrushstroke(ctx, width, height) {
  // Green artistic brush flourish matching UIDAI e-Aadhaar banner
  ctx.save();
  const grad = ctx.createLinearGradient(350, 0, 1450, 0);
  grad.addColorStop(0, '#10b981');
  grad.addColorStop(0.2, '#059669');
  grad.addColorStop(0.5, '#f8fafc');
  grad.addColorStop(0.8, '#059669');
  grad.addColorStop(1, '#10b981');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(350, 35);
  ctx.bezierCurveTo(550, 15, 1250, 15, 1450, 35);
  ctx.bezierCurveTo(1480, 70, 1480, 90, 1450, 115);
  ctx.bezierCurveTo(1250, 135, 550, 135, 350, 115);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWomanPortrait(ctx, x, y, width, height, isGrayscale = false) {
  ctx.save();

  // Background
  ctx.fillStyle = isGrayscale ? '#e2e8f0' : '#475569';
  ctx.fillRect(x, y, width, height);

  // Studio lighting background gradient
  const bgGrad = ctx.createRadialGradient(
    x + width / 2, y + height / 2, 10,
    x + width / 2, y + height / 2, width
  );
  if (isGrayscale) {
    bgGrad.addColorStop(0, '#94a3b8');
    bgGrad.addColorStop(1, '#334155');
  } else {
    bgGrad.addColorStop(0, '#78716c');
    bgGrad.addColorStop(1, '#1c1917');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(x, y, width, height);

  // Clothing / Sari
  ctx.fillStyle = isGrayscale ? '#1e293b' : '#991b1b';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height + 20, width * 0.55, height * 0.45, 0, Math.PI, 0);
  ctx.fill();

  // Sari Pattern / Zari Border
  if (!isGrayscale) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + height);
    ctx.lineTo(x + width * 0.4, y + height * 0.65);
    ctx.lineTo(x + width - 20, y + height);
    ctx.stroke();
  }

  // Face Oval
  const faceCenterX = x + width / 2;
  const faceCenterY = y + height * 0.45;
  const faceRadiusX = width * 0.26;
  const faceRadiusY = height * 0.30;

  ctx.fillStyle = isGrayscale ? '#cbd5e1' : '#d97706'; // Warm skin tone
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair (Dark)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY - 15, faceRadiusX + 8, faceRadiusY + 12, 0, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Hair Bun / Parting
  ctx.beginPath();
  ctx.arc(faceCenterX, faceCenterY - faceRadiusY + 5, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(faceCenterX - faceRadiusX * 0.4, faceCenterY - 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(faceCenterX + faceRadiusX * 0.4, faceCenterY - 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(faceCenterX - faceRadiusX * 0.4, faceCenterY - 15, 12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.arc(faceCenterX + faceRadiusX * 0.4, faceCenterY - 15, 12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Red Bindi (Indian Woman Traditional Bindi)
  if (!isGrayscale) {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(faceCenterX, faceCenterY - 18, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose & Mouth
  ctx.strokeStyle = isGrayscale ? '#475569' : '#b45309';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(faceCenterX, faceCenterY - 2);
  ctx.lineTo(faceCenterX + 2, faceCenterY + 12);
  ctx.lineTo(faceCenterX - 5, faceCenterY + 16);
  ctx.stroke();

  ctx.fillStyle = isGrayscale ? '#475569' : '#991b1b';
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY + 28, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Border Frame
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);

  ctx.restore();
}

function drawManPortrait(ctx, x, y, width, height, isGrayscale = false) {
  ctx.save();

  // Studio lighting background gradient
  const bgGrad = ctx.createRadialGradient(
    x + width / 2, y + height / 2, 10,
    x + width / 2, y + height / 2, width
  );
  if (isGrayscale) {
    bgGrad.addColorStop(0, '#94a3b8');
    bgGrad.addColorStop(1, '#334155');
  } else {
    bgGrad.addColorStop(0, '#64748b');
    bgGrad.addColorStop(1, '#0f172a');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(x, y, width, height);

  // Shoulders / Shirt
  ctx.fillStyle = isGrayscale ? '#1e293b' : '#1e3a8a';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height + 30, width * 0.55, height * 0.45, 0, Math.PI, 0);
  ctx.fill();

  // Shirt Collar
  ctx.fillStyle = isGrayscale ? '#f8fafc' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + width * 0.35, y + height * 0.72);
  ctx.lineTo(x + width * 0.5, y + height * 0.9);
  ctx.lineTo(x + width * 0.65, y + height * 0.72);
  ctx.closePath();
  ctx.fill();

  // Face Oval
  const faceCenterX = x + width / 2;
  const faceCenterY = y + height * 0.44;
  const faceRadiusX = width * 0.26;
  const faceRadiusY = height * 0.31;

  ctx.fillStyle = isGrayscale ? '#cbd5e1' : '#d97706'; // Warm skin tone
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY - 15, faceRadiusX + 5, faceRadiusY * 0.7, 0, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(faceCenterX - faceRadiusX * 0.4, faceCenterY - 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(faceCenterX + faceRadiusX * 0.4, faceCenterY - 5, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(faceCenterX - faceRadiusX * 0.4, faceCenterY - 15, 14, Math.PI * 1.1, Math.PI * 1.9);
  ctx.arc(faceCenterX + faceRadiusX * 0.4, faceCenterY - 15, 14, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Nose & Mouth
  ctx.strokeStyle = isGrayscale ? '#475569' : '#b45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(faceCenterX, faceCenterY - 2);
  ctx.lineTo(faceCenterX + 2, faceCenterY + 12);
  ctx.lineTo(faceCenterX - 5, faceCenterY + 16);
  ctx.stroke();

  ctx.fillStyle = isGrayscale ? '#475569' : '#991b1b';
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY + 28, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Border Frame
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);

  ctx.restore();
}

function drawQRCodeMatrix(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, size, size);

  ctx.fillStyle = '#000000';

  // Seeded deterministic matrix pattern mimicking UIDAI digital QR code
  const modules = 33;
  const cellSize = size / modules;

  // Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  const drawFinder = (fx, fy) => {
    ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
  };

  drawFinder(x, y);
  drawFinder(x + (modules - 7) * cellSize, y);
  drawFinder(x, y + (modules - 7) * cellSize);

  // Random-looking but crisp matrix dots inside QR
  let seed = 12345;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder pattern zones
      if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8)) {
        continue;
      }
      if (rng() > 0.45) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
      }
    }
  }

  ctx.restore();
}

/**
 * Generate Exact Front Side Aadhaar Card PNG Data URL matching User Screenshot
 */
export function generateExactDemoFrontCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 1800;
  canvas.height = 1135;
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // White Base Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1800, 1135);

  // Subtle Guilloche Security Background Pattern
  ctx.save();
  ctx.strokeStyle = 'rgba(251, 146, 60, 0.08)';
  ctx.lineWidth = 1;
  for (let i = -500; i < 2300; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 300, 400, i - 200, 800, i + 100, 1135);
    ctx.stroke();
  }
  ctx.restore();

  // Top Header Brushstroke Flourish
  drawHeaderBrushstroke(ctx, 1800, 1135);

  // National Emblem of India (Left Top)
  drawEmblem(ctx, 40, 15, 0.85);

  // Header Title Text (Center)
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 56px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ভারত সরকার', 900, 68);
  ctx.font = 'bold 50px "Inter", sans-serif';
  ctx.fillText('Government of India', 900, 122);

  // Aadhaar Sun Fingerprint Logo (Right Top)
  drawAadhaarLogo(ctx, 1620, 10, 0.9);

  // Left Margin Rotated Text: "Aadhaar no. issued: 19/10/2016"
  ctx.save();
  ctx.translate(42, 680);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 32px "Inter", sans-serif';
  ctx.fillText('Aadhaar no. issued: 19/10/2016', 0, 0);
  ctx.restore();

  // Main Man Portrait Photo (Anisur Sk)
  drawManPortrait(ctx, 110, 175, 430, 520, false);

  // User Details Text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 56px "Inter", sans-serif';
  ctx.fillText('আনিসুর সেখ', 590, 245);

  ctx.font = 'bold 50px "Inter", sans-serif';
  ctx.fillText('Anisur Sk', 590, 325);

  ctx.font = 'bold 46px "Inter", sans-serif';
  ctx.fillText('জন্মতারিখ/DOB: 28/07/1995', 590, 405);
  ctx.fillText('পুরুষ/ MALE', 590, 485);

  // Red Border Disclaimer Box (Matching Reference Screenshot)
  ctx.save();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(590, 550, 1110, 290);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 26px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('আধার পরিচয়ের প্রমাণ, নাগরিকত্ব বা জন্মতিথির নয়। এটি', 605, 590);
  ctx.fillText('শুধুমাত্র যাচাইকরণের (অনলাইন প্রমাণীকরণ বা কিউআর কোড/', 605, 630);
  ctx.fillText('অফলাইন এক্সএমএল স্ক্যানিং) সঙ্গে ব্যবহার করা উচিত ।', 605, 670);

  ctx.font = 'bold 26px "Inter", sans-serif';
  ctx.fillText('Aadhaar is proof of identity, not of citizenship', 605, 720);
  ctx.fillText('or date of birth. It should be used with verification (online', 605, 760);
  ctx.fillText('authentication, or scanning of QR code / offline XML).', 605, 800);
  ctx.restore();

  // 12-Digit Bold Aadhaar Number
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 84px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('8625 9797 4443', 900, 930);

  // Bottom Red Divider Line
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(30, 965);
  ctx.lineTo(1770, 965);
  ctx.stroke();

  // Footer Slogan with Red 'আধার' Word (Matching Screenshot)
  ctx.textAlign = 'center';
  ctx.font = 'bold 54px "Inter", sans-serif';
  ctx.fillStyle = '#000000';
  ctx.fillText('আমার ', 680, 1055);

  ctx.fillStyle = '#dc2626'; // Red text for 'আধার'
  ctx.fillText('আধার', 900, 1055);

  ctx.fillStyle = '#000000';
  ctx.fillText(' , আমার পরিচয়', 1140, 1055);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Generate Exact Back Side Aadhaar Card PNG Data URL matching User Screenshot
 */
export function generateExactDemoBackCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 1800;
  canvas.height = 1135;
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // White Base Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1800, 1135);

  // Subtle Security Background Pattern
  ctx.save();
  ctx.strokeStyle = 'rgba(251, 146, 60, 0.08)';
  ctx.lineWidth = 1;
  for (let i = -500; i < 2300; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 300, 400, i - 200, 800, i + 100, 1135);
    ctx.stroke();
  }
  ctx.restore();

  // Top Header Brushstroke Flourish
  drawHeaderBrushstroke(ctx, 1800, 1135);

  // National Emblem of India (Left Top)
  drawEmblem(ctx, 40, 15, 0.85);

  // Header Title Text (Center)
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 50px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ভারতীয় বিশিষ্ট পরিচয় প্রাধিকারণ', 900, 68);
  ctx.font = 'bold 44px "Inter", sans-serif';
  ctx.fillText('Unique Identification Authority of India', 900, 122);

  // Aadhaar Sun Fingerprint Logo (Right Top)
  drawAadhaarLogo(ctx, 1620, 10, 0.9);

  // Left Margin Rotated Text: "Details as on: 18/08/2026"
  ctx.save();
  ctx.translate(42, 680);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 32px "Inter", sans-serif';
  ctx.fillText('Details as on: 18/08/2026', 0, 0);
  ctx.restore();

  // Address Section (Left Column with generous padding to prevent text cut-off)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';

  // Bengali Address
  ctx.font = 'bold 42px "Inter", sans-serif';
  ctx.fillText('ঠিকানা:', 100, 220);
  ctx.font = 'bold 34px "Inter", sans-serif';
  ctx.fillText('এস/ও: জাহেদ সেখ, উস্তিয়া, মুক্তিনগর, উস্টা, মুক্তিনগর,', 100, 280);
  ctx.fillText('মুর্শিদাবাদ,', 100, 335);
  ctx.fillText('পশ্চিম বঙ্গ - 742102', 100, 390);

  // English Address
  ctx.font = 'bold 42px "Inter", sans-serif';
  ctx.fillText('Address:', 100, 480);
  ctx.font = 'bold 34px "Inter", sans-serif';
  ctx.fillText('S/O: Jahed Sk, USTIA, MUKTINAGAR, Usta, PO:', 100, 540);
  ctx.fillText('Muktinagar, DIST: Murshidabad,', 100, 595);
  ctx.fillText('West Bengal - 742102', 100, 650);

  // Crisp QR Code (Right Column)
  drawQRCodeMatrix(ctx, 1180, 180, 540);

  // 12-Digit Bold Aadhaar Number & VID
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 82px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('8625 9797 4443', 900, 810);

  ctx.font = 'bold 46px "Inter", sans-serif';
  ctx.fillText('VID : 9115 3443 8217 9801', 900, 875);

  // Bottom Red Divider Line
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(30, 925);
  ctx.lineTo(1770, 925);
  ctx.stroke();

  // Footer Helpline Row (Matching Screenshot Icons & Links)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 42px "Inter", sans-serif';

  // Item 1: Phone
  ctx.fillText('☎  1947', 160, 1020);

  // Item 2: Mail
  ctx.fillText('✉  help@uidai.gov.in', 650, 1020);

  // Item 3: Website
  ctx.fillText('🌐  www.uidai.gov.in', 1280, 1020);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Render Preset CR80 PVC Template to High-Res Data URL
 */
export function renderPresetTemplateToDataUrl(tmpl, side = 'front') {
  return new Promise((resolve) => {
    const scale = 4;
    const width = Math.round(337.5 * scale);
    const height = Math.round(212.5 * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (tmpl.gradient && tmpl.gradient.includes('linear-gradient')) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (tmpl.id === 'student-vibrant') {
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#4f46e5');
      } else if (tmpl.id === 'vip-executive') {
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#1f2937');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = tmpl.accentColor || '#0f172a';
    }
    ctx.fillRect(0, 0, width, height);

    const elements = side === 'front' ? tmpl.frontElements : (tmpl.backElements || []);

    if (!elements || elements.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20 * scale, 30 * scale, (337.5 - 40) * scale, 40 * scale);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${10 * scale}px "Inter", sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText('TERMS & CONDITIONS / AUTHORIZED SIGNATURE', 20 * scale, 85 * scale);
      
      ctx.font = `500 ${8 * scale}px "Inter", sans-serif`;
      ctx.fillText(`This card is the property of ${tmpl.title || 'the issuer'}.`, 20 * scale, 110 * scale);
      ctx.fillText('If found, please return immediately to security or nearest office.', 20 * scale, 125 * scale);

      ctx.fillStyle = tmpl.accentColor || '#38bdf8';
      ctx.fillRect(20 * scale, 160 * scale, 120 * scale, 4 * scale);

      resolve(canvas.toDataURL('image/png', 1.0));
      return;
    }

    const imagePromises = [];

    elements.forEach(el => {
      if (el.type === 'shape') {
        ctx.fillStyle = el.fill || tmpl.accentColor || '#ffffff';
        ctx.fillRect(el.x * scale, el.y * scale, el.width * scale, el.height * scale);
      } else if (el.type === 'text') {
        ctx.fillStyle = el.color || '#ffffff';
        const weight = el.fontWeight || '400';
        const fontSize = (el.fontSize || 12) * scale;
        ctx.font = `${weight} ${fontSize}px "Inter", system-ui, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(el.content, el.x * scale, el.y * scale);
      } else if (el.type === 'barcode') {
        const bx = el.x * scale;
        const by = el.y * scale;
        const bw = el.width * scale;
        const bh = el.height * scale;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#000000';
        let currX = bx + 10;
        const val = el.value || '12345678';
        for (let i = 0; i < val.length; i++) {
          const charCode = val.charCodeAt(i);
          const barW = (charCode % 3) + 2;
          ctx.fillRect(currX, by + 6, barW * scale * 0.7, bh - 24);
          currX += (barW + 2) * scale * 0.7;
        }
        ctx.font = `bold ${9 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(val, bx + bw / 2, by + bh - 4);
        ctx.textAlign = 'left';
      } else if (el.type === 'qr') {
        const qx = el.x * scale;
        const qy = el.y * scale;
        const qw = el.width * scale;
        const qh = el.height * scale;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qx, qy, qw, qh);
        ctx.fillStyle = '#000000';
        
        const drawFinder = (x, y, s) => {
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + s * 0.15, y + s * 0.15, s * 0.7, s * 0.7);
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4);
        };
        const findS = qw * 0.28;
        drawFinder(qx + 4, qy + 4, findS);
        drawFinder(qx + qw - findS - 4, qy + 4, findS);
        drawFinder(qx + 4, qy + qh - findS - 4, findS);

        const str = el.value || 'QR';
        const gridSize = 12;
        const cellW = (qw - 8) / gridSize;
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            if ((r < 4 && c < 4) || (r < 4 && c > 7) || (r > 7 && c < 4)) continue;
            if ((str.charCodeAt((r * gridSize + c) % str.length) + r + c) % 2 === 0) {
              ctx.fillRect(qx + 4 + c * cellW, qy + 4 + r * cellW, cellW - 0.5, cellW - 0.5);
            }
          }
        }
      } else if (el.type === 'image') {
        const ix = el.x * scale;
        const iy = el.y * scale;
        const iw = el.width * scale;
        const ih = el.height * scale;
        const radius = (el.borderRadius || 0) * scale;

        const imgP = new Promise((resImg) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            ctx.save();
            if (radius > 0) {
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(ix, iy, iw, ih, radius);
              } else {
                ctx.rect(ix, iy, iw, ih);
              }
              ctx.clip();
            }
            ctx.drawImage(img, ix, iy, iw, ih);
            ctx.restore();
            resImg();
          };
          img.onerror = () => {
            ctx.save();
            ctx.fillStyle = '#334155';
            ctx.fillRect(ix, iy, iw, ih);
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.arc(ix + iw / 2, iy + ih * 0.4, iw * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ix + iw / 2, iy + ih * 1.1, iw * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            resImg();
          };
          img.src = el.src;
        });
        imagePromises.push(imgP);
      }
    });

    Promise.all(imagePromises).then(() => {
      resolve(canvas.toDataURL('image/png', 1.0));
    });
  });
}
