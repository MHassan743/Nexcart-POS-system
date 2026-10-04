/**
 * printReceipt — Clean & Reliable Isolated Receipt Printer Utility.
 * Renders HTML inside a clean, hidden iframe to avoid printing the dark UI app or generating blank pages.
 */

export function printFormattedContent(htmlBodyContent, title = 'Nexcart Receipt') {
  // Remove previous print frame if present
  const oldFrame = document.getElementById('nexcart-print-frame');
  if (oldFrame) {
    oldFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'nexcart-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>

        <style>
          @page {
            size: auto;
            margin: 5mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 10px;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            font-size: 12px;
            line-height: 1.3;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .header h2 {
            font-size: 16px;
            font-weight: bold;
          }
          .header p {
            font-size: 10px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
          }
          .details-table td {
            padding: 3px 0;
            vertical-align: top;
          }
          .bold { font-weight: bold; }
          .right { text-align: right; }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 5px;
          }
        </style>
      </head>
      <body>
        ${htmlBodyContent}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  }, 250);
}

// Helper for Warranty & Repair Job Cards
export function printJobCardReceipt(job, store) {
  const currency = store?.currencySymbol || '₨';
  const html = `
    <div class="header">
      <h2>${store?.name || store?.storeName || 'Nexcart Store'}</h2>
      <p>${store?.address || ''}</p>
      <p>Tel: ${store?.phone || ''}</p>
      <p style="margin-top:4px; font-weight:bold;">*** REPAIR JOB CARD SLIP ***</p>
    </div>

    <table class="details-table">
      <tr><td class="bold">Job ID:</td><td class="right bold">${job.id}</td></tr>
      <tr><td>Date:</td><td class="right">${new Date(job.createdAt || Date.now()).toLocaleDateString()}</td></tr>
      <tr><td class="bold">Customer:</td><td class="right bold">${job.customerName}</td></tr>
      <tr><td>Phone:</td><td class="right">${job.customerPhone}</td></tr>
    </table>

    <div class="divider"></div>

    <table class="details-table">
      <tr><td class="bold">Device:</td><td class="right bold">${job.deviceModel}</td></tr>
      <tr><td>IMEI/SN:</td><td class="right">${job.imei || 'N/A'}</td></tr>
      <tr><td class="bold">Issue:</td><td class="right">${job.issue}</td></tr>
      <tr><td>Status:</td><td class="right bold">${job.status}</td></tr>
    </table>

    <div class="divider"></div>

    <table class="details-table">
      <tr><td>Est. Cost:</td><td class="right bold">${currency}${Number(job.estimatedCost || 0).toFixed(2)}</td></tr>
      <tr><td>Advance Paid:</td><td class="right bold">${currency}${Number(job.advancePaid || 0).toFixed(2)}</td></tr>
      <tr><td class="bold">Bal Due:</td><td class="right bold">${currency}${(Number(job.estimatedCost || 0) - Number(job.advancePaid || 0)).toFixed(2)}</td></tr>
    </table>

    <div class="footer">
      <p>Thank you for trusting our repair services!</p>
      <p>Please present this slip at device pickup.</p>
    </div>
  `;

  printFormattedContent(html, `JobCard_${job.id}`);
}

// Helper for Custom Orders & Production Booking
export function printCustomOrderReceipt(ord, store) {
  const currency = store?.currencySymbol || '₨';
  const html = `
    <div class="header">
      <h2>${store?.name || store?.storeName || 'Nexcart Store'}</h2>
      <p>${store?.address || ''}</p>
      <p>Tel: ${store?.phone || ''}</p>
      <p style="margin-top:4px; font-weight:bold;">*** CUSTOM ORDER BOOKING ***</p>
    </div>

    <table class="details-table">
      <tr><td class="bold">Order ID:</td><td class="right bold">${ord.id}</td></tr>
      <tr><td>Booking Date:</td><td class="right">${new Date(ord.createdAt || Date.now()).toLocaleDateString()}</td></tr>
      <tr><td class="bold">Due Date:</td><td class="right bold">${ord.deliveryDate}</td></tr>
      <tr><td class="bold">Customer:</td><td class="right bold">${ord.customerName}</td></tr>
      <tr><td>Phone:</td><td class="right">${ord.customerPhone}</td></tr>
    </table>

    <div class="divider"></div>

    <table class="details-table">
      <tr><td class="bold">Category:</td><td class="right bold">${ord.orderType}</td></tr>
      <tr><td class="bold">Specs:</td><td class="right">${ord.details}</td></tr>
      <tr><td>Status:</td><td class="right bold">${ord.status}</td></tr>
    </table>

    <div class="divider"></div>

    <table class="details-table">
      <tr><td>Total Price:</td><td class="right bold">${currency}${Number(ord.totalAmount || 0).toFixed(2)}</td></tr>
      <tr><td>Advance Paid:</td><td class="right bold">${currency}${Number(ord.advancePaid || 0).toFixed(2)}</td></tr>
      <tr><td class="bold">Remaining Bal:</td><td class="right bold">${currency}${Number(ord.remainingBalance || 0).toFixed(2)}</td></tr>
    </table>

    <div class="footer">
      <p>Thank you for your custom order!</p>
      <p>Please keep this deposit receipt safe.</p>
    </div>
  `;

  printFormattedContent(html, `Order_${ord.id}`);
}

// Legacy print fallback wrapper
export function printReceipt(elementId = 'printable-receipt', title = '') {
  const sourceEl = document.getElementById(elementId);
  if (sourceEl) {
    printFormattedContent(sourceEl.innerHTML, title);
  } else {
    // Default thermal layout fallback if elementId is not found
    printFormattedContent(`<div class="header"><h2>Nexcart POS</h2><p>Document: ${title}</p></div>`, title);
  }
}
