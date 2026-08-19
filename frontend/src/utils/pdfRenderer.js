import * as pdfjsLib from 'pdfjs-dist';

// Set worker URL for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Render a PDF file (ArrayBuffer, Uint8Array, Base64 or File URL) into a high-resolution PNG image Data URL
 * Clones ArrayBuffers on each call to prevent "detached ArrayBuffer" errors during password retries!
 */
export async function renderPdfToImageDataUrl(pdfSource, password = '') {
  try {
    let loadingTask;

    if (typeof pdfSource === 'string') {
      if (pdfSource.startsWith('data:application/pdf;base64,')) {
        const base64Data = pdfSource.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        loadingTask = pdfjsLib.getDocument({ data: bytes, password });
      } else {
        // Standard URL or file path - fetch buffer to ensure cloned array buffer
        const response = await fetch(pdfSource);
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer.slice(0));
        loadingTask = pdfjsLib.getDocument({ data: bytes, password });
      }
    } else if (pdfSource instanceof ArrayBuffer) {
      // Clone ArrayBuffer so it never detaches on retry!
      const clonedBuffer = pdfSource.slice(0);
      const bytes = new Uint8Array(clonedBuffer);
      loadingTask = pdfjsLib.getDocument({ data: bytes, password });
    } else if (pdfSource instanceof Uint8Array) {
      const bytes = pdfSource.slice(0);
      loadingTask = pdfjsLib.getDocument({ data: bytes, password });
    } else {
      return { success: false, error: 'Invalid PDF file format' };
    }

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1); // e-Aadhaar letter is on Page 1

    // Scale 3.0 for Ultra High Definition 300+ DPI sharpness
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    return {
      success: true,
      dataUrl: canvas.toDataURL('image/png', 1.0)
    };
  } catch (err) {
    const errMsg = err?.message || err?.reason || String(err);
    console.error('PDF Render Error:', errMsg);
    if (err?.name === 'PasswordException' || errMsg.includes('password') || err?.code === 1) {
      return {
        success: false,
        isPasswordRequired: true,
        error: 'e-Aadhaar PDF is password protected. Enter password (e.g. PINK1994) to unlock.'
      };
    }
    return {
      success: false,
      error: err.message || 'Failed to process PDF file'
    };
  }
}
