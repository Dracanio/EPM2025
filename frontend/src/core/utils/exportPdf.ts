import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Downloads all pages of the poster as a PDF.
 * @param containerClass The class name identifying the poster pages in the print view.
 * @param filename
 * @param pageWidthMm
 * @param pageHeightMm
 */
export async function downloadPdf(
  containerClass: string = 'poster-print-page',
  filename: string = 'poster.pdf',
  pageWidthMm: number = 210,
  pageHeightMm: number = 297
) {
  // We need to capture ALL elements with this class
  const elements = Array.from(document.getElementsByClassName(containerClass)) as HTMLElement[];
  
  if (elements.length === 0) {
    console.error(`No elements found with class ${containerClass}`);
    alert('Export failed: No pages found to export.');
    return;
  }

  try {
    const safeWidth = Number.isFinite(pageWidthMm) ? Math.max(10, pageWidthMm) : 210;
    const safeHeight = Number.isFinite(pageHeightMm) ? Math.max(10, pageHeightMm) : 297;

    // Initialize PDF
    let pdf: jsPDF | null = null;

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!element) continue;

        // Capture
        const canvas = await html2canvas(element, {
            scale: 4,
            useCORS: true,
            logging: false,
            allowTaint: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');

        // Create PDF on first page
        if (!pdf) {
            pdf = new jsPDF({
              unit: 'mm',
              format: [safeWidth, safeHeight]
            });
        } else {
            pdf.addPage([safeWidth, safeHeight]);
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    if (pdf) {
        pdf.save(filename);
    }

  } catch (error) {
    console.error('Export failed:', error);
    alert('PDF Export failed. See console for details.');
  }
}
