import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DetailedReptile } from '@/app/api/reptiles/reptileDetails';
import { format } from 'date-fns';
import { EnrichedReptile } from '../ReptileList';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Color scheme
const COLORS = {
  primary: [39, 134, 94],      // #27865e - Green
  secondary: [80, 120, 160],   // Blue-gray
  accent: [230, 150, 40],      // Orange
  text: [50, 50, 50],          // Dark gray
  light: [245, 245, 245],      // Light gray
  border: [220, 220, 220]      // Medium gray
};

// ... existing code ...

const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize the image to smaller dimensions since it's just a logo
          const maxWidth = 100;
          const maxHeight = 100;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
              if (width > maxWidth) {
                  height *= maxWidth / width;
                  width = maxWidth;
              }
          } else {
              if (height > maxHeight) {
                  width *= maxHeight / height;
                  height = maxHeight;
              }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Enable image smoothing for better quality
          if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
          }
          
          // Convert to JPEG with lower quality to reduce size
          resolve(canvas.toDataURL('image/jpeg', 1));
      };
      img.onerror = reject;
      img.src = url;
  });
};

export const generateReptilePDF = async (reptile: DetailedReptile, sireDetails: EnrichedReptile, damDetails: EnrichedReptile) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Set default text color
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  try {
    // Use the absolute URL for Next.js public assets
    const base64Logo = await loadImage(window.location.origin + '/logo_light.png');
    
    // Add logo with fixed dimensions
    const logoWidth = 20;
    const logoHeight = 20;
    doc.addImage(base64Logo, 'PNG', 15, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo for PDF:', error);
    // Continue without logo
  }
  
  // Add accent line - thinner
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(0.3);
  doc.line(15, 32, doc.internal.pageSize.getWidth() - 15, 32);
  
  // Add main title
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('Clutchly', 40, 17);
  
  // Add subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text('Reptile Details Certificate', 40, 22);
  
  // Reset line width and color
  doc.setLineWidth(0.5);
  doc.setDrawColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
 
  // Reset text color
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  // Left and right columns for basic info
  const leftColumn = [];
  const rightColumn = [];
  
  // Basic info for left column
  leftColumn.push(['Name', reptile.name || 'Unknown']);
  leftColumn.push(['Species', reptile.species_name || 'Unknown']);
  leftColumn.push(['Morph', reptile.morph_name || 'Unknown']);
  leftColumn.push(['Sex', reptile.sex ? capitalize(reptile.sex) : 'Unknown']);
  leftColumn.push(['Weight', reptile.weight ? `${reptile.weight} g` : 'Unknown']);
  leftColumn.push(['Length', reptile.length ? `${reptile.length} cm` : 'Unknown']);
  
  // Basic info for right column
  rightColumn.push(['Status', reptile.status ? capitalize(reptile.status) : 'Unknown']);
  rightColumn.push(['Breeder', reptile.is_breeder ? 'Yes' : 'No']);
  rightColumn.push(['Hatched', reptile.hatch_date ? format(new Date(reptile.hatch_date), 'MMM dd, yyyy') : 'Unknown']);
  rightColumn.push(['Acquired', reptile.acquisition_date ? format(new Date(reptile.acquisition_date), 'MMM dd, yyyy') : 'Unknown']);
  
  // Section title with underline
  const sectionY = 40;
  drawSectionTitle(doc, 'Basic Information', 15, sectionY, 12);
  
  // Two-column layout for basic info
  const colWidth = (doc.internal.pageSize.getWidth() - 30) / 2 - 5;
  
  // Left column
  autoTable(doc, {
    startY: sectionY + 8,
    margin: { left: 15 },
    tableWidth: colWidth,
    head: [],
    body: leftColumn,
    theme: 'plain',
    styles: { 
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: colWidth - 35 }
    },
  });
  
  // Right column
  autoTable(doc, {
    startY: sectionY + 8,
    margin: { left: 15 + colWidth + 10 },
    tableWidth: colWidth,
    head: [],
    body: rightColumn,
    theme: 'plain',
    styles: { 
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: colWidth - 35 }
    },
  });
  
  // Genetic information
  const lastY = Math.max(
    doc.lastAutoTable.finalY + 8, 
    sectionY + leftColumn.length * 8 + 15
  );
  
  drawSectionTitle(doc, 'Genetic Information', 15, lastY, 12);
  
  // Visual traits
  const geneticData = [];
  
  if (reptile.visual_traits && reptile.visual_traits.length > 0) {
    geneticData.push(['Visual Traits', reptile.visual_traits.join(', ')]);
  } else {
    geneticData.push(['Visual Traits', 'None']);
  }
  
  // Het traits
  if (reptile.het_traits && reptile.het_traits.length > 0) {
    const hetTraitsFormatted = reptile.het_traits.map(
      trait => `${trait.trait} (${trait.percentage}%${trait.verified ? ', verified' : ''})`
    ).join(', ');
    geneticData.push(['Het Traits', hetTraitsFormatted]);
  } else {
    geneticData.push(['Het Traits', 'None']);
  }
  
  autoTable(doc, {
    startY: lastY + 8,
    head: [],
    body: geneticData,
    theme: 'plain',
    styles: { 
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' }
    },
  });
  
  // Lineage information
  const lineageLastY = doc.lastAutoTable.finalY + 12;
  drawSectionTitle(doc, 'Parents Information', 15, lineageLastY, 12);
  
  // Prepare dam and sire columns with proper formatting
  const damColumn = [];
  const sireColumn = [];
  
  // Dam information
  if (damDetails) {
    damColumn.push(['Name', damDetails.name || 'Unknown']);
    damColumn.push(['Morph', damDetails.morph_name || 'Unknown']);
    
    const visualTraits = damDetails.visual_traits && damDetails.visual_traits.length > 0 
      ? damDetails.visual_traits.join(', ') 
      : 'None';
    damColumn.push(['Visual Traits', visualTraits]);
    
    let hetTraits = 'None';
    if (damDetails.het_traits && damDetails.het_traits.length > 0) {
      hetTraits = damDetails.het_traits.map(
        trait => `${trait.trait} (${trait.percentage}%${trait.verified ? ', verified' : ''})`
      ).join(', ');
    }
    damColumn.push(['Het Traits', hetTraits]);
    
    damColumn.push(['Hatch Date', damDetails.hatch_date 
      ? format(new Date(damDetails.hatch_date), 'MMM dd, yyyy') 
      : 'Unknown']);
    
    damColumn.push(['Acquisition', damDetails.acquisition_date 
      ? format(new Date(damDetails.acquisition_date), 'MMM dd, yyyy') 
      : 'Unknown']);
  } else {
    damColumn.push(['Name', 'Unknown']);
    damColumn.push(['Morph', 'Unknown']);
    damColumn.push(['Visual Traits', 'Unknown']);
    damColumn.push(['Het Traits', 'Unknown']);
    damColumn.push(['Hatch Date', 'Unknown']);
    damColumn.push(['Acquisition', 'Unknown']);
  }

  // Sire information
  if (sireDetails) {
    sireColumn.push(['Name', sireDetails.name || 'Unknown']);
    sireColumn.push(['Morph', sireDetails.morph_name || 'Unknown']);
    
    const visualTraits = sireDetails.visual_traits && sireDetails.visual_traits.length > 0 
      ? sireDetails.visual_traits.join(', ') 
      : 'None';
    sireColumn.push(['Visual Traits', visualTraits]);
    
    let hetTraits = 'None';
    if (sireDetails.het_traits && sireDetails.het_traits.length > 0) {
      hetTraits = sireDetails.het_traits.map(
        trait => `${trait.trait} (${trait.percentage}%${trait.verified ? ', verified' : ''})`
      ).join(', ');
    }
    sireColumn.push(['Het Traits', hetTraits]);
    
    sireColumn.push(['Hatch Date', sireDetails.hatch_date 
      ? format(new Date(sireDetails.hatch_date), 'MMM dd, yyyy') 
      : 'Unknown']);
    
    sireColumn.push(['Acquisition', sireDetails.acquisition_date 
      ? format(new Date(sireDetails.acquisition_date), 'MMM dd, yyyy') 
      : 'Unknown']);
  } else {
    sireColumn.push(['Name', 'Unknown']);
    sireColumn.push(['Morph', 'Unknown']);
    sireColumn.push(['Visual Traits', 'Unknown']);
    sireColumn.push(['Het Traits', 'Unknown']);
    sireColumn.push(['Hatch Date', 'Unknown']);
    sireColumn.push(['Acquisition', 'Unknown']);
  }

  // Add headers for each column
  const columnWidth = (doc.internal.pageSize.getWidth() - 30) / 2 - 5;
  
  // Dam column with header
  autoTable(doc, {
    startY: lineageLastY + 8,
    margin: { left: 15 },
    tableWidth: columnWidth,
    head: [['Dam (Female)', '']],
    body: damColumn,
    theme: 'plain',
    styles: { 
      fontSize: 9,
      cellPadding: 2
    },
    headStyles: {
      textColor: [COLORS.text[0], COLORS.text[1], COLORS.text[2]],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: columnWidth - 35 }
    },
  });
  
  // Sire column with header
  autoTable(doc, {
    startY: lineageLastY + 8,
    margin: { left: 15 + columnWidth + 10 },
    tableWidth: columnWidth,
    head: [['Sire (Male)', '']],
    body: sireColumn,
    theme: 'plain',
    styles: { 
      fontSize: 9,
      cellPadding: 2
    },
    headStyles: {
      textColor: [COLORS.text[0], COLORS.text[1], COLORS.text[2]],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: columnWidth - 35 }
    },
  });


  
  // Health summary if available
  if (reptile.health_logs && reptile.health_logs.length > 0) {
    const healthLastY = doc.lastAutoTable.finalY + 12;
    drawSectionTitle(doc, 'Health Summary', 15, healthLastY, 12);
    
    // Last 3 health records
    const healthData = reptile.health_logs.slice(0, 3).map(log => {
      // Find category name if it exists
      const categoryName = log.category_id ? 'Health Issue' : 'General';
      
      // Format the log entry data
      return [
        format(new Date(log.date), 'MMM dd, yyyy'),
        categoryName,
        log.custom_type_label || '-',
        log.notes || '-'
      ];
    });
    
    autoTable(doc, {
      startY: healthLastY + 8,
      head: [['Date', 'Category', 'Type', 'Notes']],
      body: healthData,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: { 
        0: { cellWidth: 28 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 'auto' }
      },
    });
  }
  
  // Document footer with clean look
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Footer line - thinner
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 15, doc.internal.pageSize.getWidth() - 15, pageHeight - 15);
  
  // Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy')} • Clutchly Reptile Management System`, 
    doc.internal.pageSize.getWidth() / 2, pageHeight - 7, { align: 'center' });
  
  // Save the PDF with the reptile's name
  doc.save(`${reptile.name.replace(/\s+/g, '_')}_details.pdf`);
};

// Helper function to draw section titles with styling
function drawSectionTitle(doc: JsPDFWithAutoTable, title: string, x: number, y: number, fontSize: number = 14): void {
  // Section title
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(title, x, y);
  
  // Section underline - thinner
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(0.3);
  doc.line(x, y + 1, x + 40, y + 1);
  
  // Reset
  doc.setLineWidth(0.1);
  doc.setDrawColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
}

// Helper function to capitalize first letter of a string
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}