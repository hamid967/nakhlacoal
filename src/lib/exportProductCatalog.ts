import jsPDF from 'jspdf';
import type { Product } from '@/data/products';

export function exportProductCatalog(product: Product, isAr: boolean) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Header band
  doc.setFillColor(10, 7, 5);
  doc.rect(0, 0, W, 110, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PALM CHARCOAL', 40, 55);
  doc.setFontSize(10);
  doc.setTextColor(230, 214, 168);
  doc.text('Premium Saudi Charcoal · فحم النخلة', 40, 78);
  doc.setFontSize(9);
  doc.text('alnakhlacoal.com  ·  +966 54 006 0095', 40, 96);

  // Product title
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(product.nameEn, 40, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(product.taglineEn, 40, 170);

  // Description
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const desc = doc.splitTextToSize(product.descEn, W - 80);
  doc.text(desc, 40, 200);

  // Specs table
  const specs: Array<[string, string]> = [
    ['Burn time', product.specs.burn],
    ['Ash', product.specs.ash],
    ['Fixed carbon', product.specs.carbon],
    ['Moisture', product.specs.moisture],
    ['Heat', product.specs.heat],
    ['Packaging', product.specs.packaging],
  ];

  let y = 260;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('Technical specifications', 40, y);
  y += 14;
  doc.setDrawColor(201, 168, 76);
  doc.line(40, y, W - 40, y);
  y += 18;

  doc.setFontSize(10);
  specs.forEach(([k, v], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 244, 232);
      doc.rect(40, y - 12, W - 80, 22, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(k, 52, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(v, W / 2, y + 3);
    y += 22;
  });

  // Features
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Key features', 40, y);
  y += 6;
  doc.setDrawColor(201, 168, 76);
  doc.line(40, y, W - 40, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  product.featuresEn.forEach((f) => {
    doc.setTextColor(201, 168, 76);
    doc.text('•', 46, y);
    doc.setTextColor(30, 30, 30);
    doc.text(f, 60, y);
    y += 16;
  });

  // Export info
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Export information', 40, y);
  y += 6;
  doc.line(40, y, W - 40, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const info = [
    'Origin: Kingdom of Saudi Arabia',
    'HS Code: 4402.90',
    'Container: 20 ft (18–22 tons) · 40 ft HC (24–26 tons)',
    'Payment: T/T · L/C at sight',
    'Incoterms: FOB Jeddah · CIF worldwide',
    'Lead time: 15–25 days from confirmed order',
    'Certifications: SASO, ISO 9001, MSDS available',
  ];
  info.forEach((line) => {
    doc.setTextColor(201, 168, 76);
    doc.text('›', 46, y);
    doc.setTextColor(30, 30, 30);
    doc.text(line, 60, y);
    y += 16;
  });

  // Footer
  doc.setFillColor(10, 7, 5);
  doc.rect(0, H - 60, W, 60, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFontSize(9);
  doc.text('© Palm Charcoal · Jeddah, Saudi Arabia', 40, H - 32);
  doc.setTextColor(180, 160, 110);
  doc.text('mab355@gmail.com  ·  wa.me/966540060095', 40, H - 18);

  void isAr;
  doc.save(`palm-charcoal-${product.slug}-catalog.pdf`);
}
