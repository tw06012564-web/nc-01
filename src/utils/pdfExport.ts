import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports DOM elements containing stickers to a downloadable PDF file
 * @param elementIds Array of DOM element IDs to capture as pages
 * @param filename Name of the PDF file to download
 * @param mode 'thermal-80x50' | 'a4'
 */
export async function downloadStickersPDF(
  elementIds: string[],
  filename: string = 'stickers.pdf',
  mode: 'thermal-80x50' | 'a4' = 'thermal-80x50'
): Promise<void> {
  if (elementIds.length === 0) return;

  if (mode === 'thermal-80x50') {
    // 80mm x 50mm landscape sticker
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [80, 50],
      compress: true
    });

    for (let i = 0; i < elementIds.length; i++) {
      const el = document.getElementById(elementIds[i]);
      if (!el) continue;

      if (i > 0) {
        pdf.addPage([80, 50], 'landscape');
      }

      const canvas = await html2canvas(el, {
        scale: 3, // High DPI for crisp printing
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 80, 50, undefined, 'FAST');
    }

    pdf.save(filename);
  } else {
    // A4 sheet mode (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // 2 columns, 5 rows = 10 stickers per page
    const colWidth = 85;
    const rowHeight = 52;
    const marginLeft = 15;
    const marginTop = 15;
    const gapX = 10;
    const gapY = 4;
    const stickersPerPage = 10;

    for (let i = 0; i < elementIds.length; i++) {
      const el = document.getElementById(elementIds[i]);
      if (!el) continue;

      const pageIndex = Math.floor(i / stickersPerPage);
      const indexInPage = i % stickersPerPage;

      if (indexInPage === 0 && pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const col = indexInPage % 2;
      const row = Math.floor(indexInPage / 2);

      const posX = marginLeft + col * (colWidth + gapX);
      const posY = marginTop + row * (rowHeight + gapY);

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', posX, posY, colWidth, rowHeight, undefined, 'FAST');
    }

    pdf.save(filename);
  }
}
