const fs = require("fs");
const PDFDocument = require("pdfkit");

exports.generateInvoicePDF = (order, filePath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text("Invoice");
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Total: $${order.total}`);
  doc.end();
};