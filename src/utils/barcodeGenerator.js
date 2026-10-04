import JsBarcode from 'jsbarcode';

/**
 * Render barcode onto an SVG or HTML Canvas element
 * @param {HTMLElement} element - SVG or Canvas element reference
 * @param {string} value - Code/SKU/Barcode string
 * @param {object} options - Custom options (width, height, fontSize, etc.)
 */
export const generateBarcode = (element, value, options = {}) => {
  if (!element || !value) return;
  try {
    JsBarcode(element, value, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12,
      margin: 5,
      lineColor: '#000000',
      background: '#ffffff',
      ...options
    });
  } catch (err) {
    console.error('JsBarcode Generation Error:', err);
  }
};

/**
 * Print barcode label(s) for a product
 * @param {object} product - Product object
 * @param {number} copies - Number of barcode labels to print
 */
export const printBarcodeLabels = (product, copies = 1) => {
  const printWindow = window.open('', '_blank', 'width=400,height=500');
  if (!printWindow) return;

  const copiesArr = Array.from({ length: copies });
  
  let labelCardsHtml = copiesArr.map(() => `
    <div style="
      width: 50mm;
      height: 30mm;
      padding: 2mm;
      box-sizing: border-box;
      border: 1px dashed #ccc;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: sans-serif;
      background: white;
    ">
      <div style="font-size: 9px; font-weight: bold; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${product.name}
      </div>
      <svg id="barcode-svg-${Math.random().toString(36).substring(2, 7)}"></svg>
      <div style="font-size: 10px; font-weight: bold; color: #1e293b;">
        Rs. ${product.salePrice ? product.salePrice.toFixed(2) : '0.00'}
      </div>
    </div>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Barcode - ${product.name}</title>
        <style>
          @page { size: auto; margin: 5mm; }
          body { margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4mm; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        ${labelCardsHtml}
        <script>
          document.querySelectorAll('svg').forEach(function(svg) {
            JsBarcode(svg, "${product.barcode || product.sku}", {
              format: "CODE128",
              width: 1.5,
              height: 35,
              displayValue: true,
              fontSize: 10,
              margin: 2
            });
          });
          setTimeout(function() {
            window.print();
            window.close();
          }, 400);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
