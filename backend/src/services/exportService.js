'use strict';

const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const logger = require('../config/logger');

// ─── Helpers ─────────────────────────────────────────────

/**
 * Strip markdown syntax to plain text for PDF rendering.
 * Keeps content readable without a full markdown parser.
 */
function stripMarkdown(text = '') {
  return text
    .replace(/#{1,6}\s*/g, '')       // headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1')     // italic
    .replace(/`(.+?)`/g, '$1')       // inline code
    .replace(/^\s*[-*+]\s+/gm, '• ') // unordered list
    .replace(/^\s*\d+\.\s+/gm, '')   // ordered list numbers
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/\n{3,}/g, '\n\n')      // excess blank lines
    .trim();
}

/**
 * Split markdown into an array of { type, text } blocks for DOCX.
 */
function parseMarkdownBlocks(markdown = '') {
  const lines = markdown.split('\n');
  const blocks = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      blocks.push({ type: 'spacer' });
      continue;
    }
    const h1 = line.match(/^#\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    const bullet = line.match(/^\s*[-*+]\s+(.+)/);
    const numbered = line.match(/^\s*\d+\.\s+(.+)/);

    if (h1)      blocks.push({ type: 'h1', text: h1[1] });
    else if (h2) blocks.push({ type: 'h2', text: h2[1] });
    else if (h3) blocks.push({ type: 'h3', text: h3[1] });
    else if (bullet)  blocks.push({ type: 'bullet', text: bullet[1] });
    else if (numbered) blocks.push({ type: 'numbered', text: numbered[1] });
    else blocks.push({ type: 'body', text: stripMarkdown(line) });
  }
  return blocks;
}

// ─── PDF Export ───────────────────────────────────────────

/**
 * Stream a PDF of the report into the Express response.
 * @param {object} report  - Prisma Report record
 * @param {object} res     - Express response (writable stream)
 */
async function exportToPdf(report, res) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 60, size: 'A4' });

      doc.on('error', (err) => {
        logger.error({ err }, 'PDF stream error');
        reject(err);
      });

      doc.pipe(res);

      const businessName = report.business?.businessName ?? 'Business Report';
      const version      = report.version ?? 1;
      const generatedAt  = new Date(report.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      // ── Cover page ──
      doc
        .fontSize(28).font('Helvetica-Bold')
        .text('AI Business Master Report', { align: 'center' })
        .moveDown(0.5)
        .fontSize(18).font('Helvetica')
        .text(businessName, { align: 'center' })
        .moveDown(0.3)
        .fontSize(11).fillColor('#666666')
        .text(`Version ${version}  •  Generated ${generatedAt}`, { align: 'center' })
        .fillColor('#000000')
        .moveDown(2);

      doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke('#cccccc').moveDown(1.5);

      // ── Disclaimer banner ──
      doc
        .fontSize(9).fillColor('#555555').font('Helvetica-Oblique')
        .text(
          'DISCLAIMER: This report is AI-generated for informational purposes only. ' +
          'It does not constitute financial, legal, or tax advice. ' +
          'Always consult a qualified Chartered Accountant, lawyer, or bank advisor before making business decisions.',
          { align: 'justify' }
        )
        .fillColor('#000000').font('Helvetica')
        .moveDown(1.5);

      // ── Body from markdown ──
      const markdown = report.reportMarkdown ?? '';
      const blocks   = parseMarkdownBlocks(markdown);

      for (const block of blocks) {
        switch (block.type) {
          case 'h1':
            doc.addPage()
               .fontSize(20).font('Helvetica-Bold').fillColor('#1a1a2e')
               .text(block.text).fillColor('#000000').moveDown(0.5);
            doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke('#3a86ff').moveDown(0.8);
            break;
          case 'h2':
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a1a2e')
               .text(block.text).fillColor('#000000').moveDown(0.4);
            break;
          case 'h3':
            doc.fontSize(12).font('Helvetica-Bold')
               .text(block.text).font('Helvetica').moveDown(0.3);
            break;
          case 'bullet':
            doc.fontSize(10).font('Helvetica')
               .text(`• ${block.text}`, { indent: 15 }).moveDown(0.15);
            break;
          case 'numbered':
            doc.fontSize(10).font('Helvetica')
               .text(block.text, { indent: 15 }).moveDown(0.15);
            break;
          case 'spacer':
            doc.moveDown(0.4);
            break;
          default:
            doc.fontSize(10).font('Helvetica')
               .text(block.text, { align: 'justify' }).moveDown(0.2);
        }
      }

      // ── Footer on all pages ──
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#888888')
           .text(`Page ${i + 1} of ${totalPages}  •  AI Business Assistant  •  Confidential`,
             60, doc.page.height - 40, { align: 'center', width: doc.page.width - 120 });
      }

      doc.end();
      doc.on('finish', resolve);
    } catch (err) {
      logger.error({ err }, 'exportToPdf fatal error');
      reject(err);
    }
  });
}

// ─── DOCX Export ─────────────────────────────────────────

/**
 * Build a DOCX buffer for the report.
 * @param {object} report  - Prisma Report record
 * @returns {Promise<Buffer>}
 */
async function exportToDocx(report) {
  const businessName = report.business?.businessName ?? 'Business Report';
  const version      = report.version ?? 1;
  const generatedAt  = new Date(report.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const markdown = report.reportMarkdown ?? '';
  const blocks   = parseMarkdownBlocks(markdown);

  const children = [];

  // ── Cover ──
  children.push(
    new Paragraph({
      text: 'AI Business Master Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: businessName, bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Version ${version}  •  Generated ${generatedAt}`, color: '888888', size: 20 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'DISCLAIMER: This report is AI-generated for informational purposes only. It does not constitute financial, legal, or tax advice. Always consult a qualified professional before making business decisions.',
          italics: true,
          color: '555555',
          size: 18,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  );

  // ── Body ──
  for (const block of blocks) {
    switch (block.type) {
      case 'h1':
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_1 }));
        break;
      case 'h2':
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 }));
        break;
      case 'h3':
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_3 }));
        break;
      case 'bullet':
        children.push(new Paragraph({ text: block.text, bullet: { level: 0 } }));
        break;
      case 'numbered':
        children.push(new Paragraph({ text: block.text, numbering: { reference: 'default-numbering', level: 0 } }));
        break;
      case 'spacer':
        children.push(new Paragraph({ text: '' }));
        break;
      default:
        children.push(new Paragraph({ children: [new TextRun({ text: block.text })] }));
    }
  }

  const docx = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: 'decimal',
          text: '%1.',
          alignment: AlignmentType.LEFT,
        }],
      }],
    },
    sections: [{
      properties: {},
      children,
    }],
  });

  return Packer.toBuffer(docx);
}

module.exports = { exportToPdf, exportToDocx };
