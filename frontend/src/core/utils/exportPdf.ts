import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Downloads all pages of the poster as a PDF.
 * @param containerClass The class name identifying the poster pages in the print view.
 * @param filename
 */
export async function downloadPdf(containerClass: string = 'poster-print-page', filename: string = 'poster.pdf') {
  // We need to capture ALL elements with this class
  const elements = Array.from(document.getElementsByClassName(containerClass)) as HTMLElement[];
  
  if (elements.length === 0) {
    console.error(`No elements found with class ${containerClass}`);
    alert('Export failed: No pages found to export.');
    return;
  }

  try {
    // Initialize PDF
    let pdf: jsPDF | null = null;
    
    // We assume all pages have same format for now, or we adapt per page.
    // Let's adapt per page.

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!element) continue;
        
        // Show the element temporarily if it's hidden (though print view should be accessible in DOM)
        // Note: html2canvas requires the element to be in the DOM and visible. 
        // Print elements may be hidden in screen mode.
        // We might need to force them visible or clone them?
        // Actually, if they are display:none, html2canvas renders nothing.
        // Strategy: Temporarily unhide the print container for export?
        
        // Capture
        const canvas = await html2canvas(element, {
            scale: 3, // Balance quality/performance
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const orientation = canvas.width > canvas.height ? 'l' : 'p';
        
        // Create PDF on first page
        if (!pdf) {
            pdf = new jsPDF(orientation, 'mm', 'a4');
        } else {
            pdf.addPage('a4', orientation);
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    if (pdf) {
        pdf.save(filename);
    }

  } catch (error) {
    console.error('Export failed:', error);
    alert('PDF Export failed. See console for details.');
  }
}
