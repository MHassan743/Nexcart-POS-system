/**
 * Send WhatsApp Tax Invoice/Receipt to Customer Phone Number
 * @param {object} transaction - Transaction receipt object
 * @param {object} store - Current store information
 */
export const sendWhatsAppReceipt = (transaction, store) => {
  if (!transaction) return;

  const phoneRaw = transaction.customer?.phone || '';
  let phone = phoneRaw.replace(/[^0-9]/g, '');
  
  // Format local 03xx Pakistani numbers to 923xx international format
  if (phone.startsWith('0')) {
    phone = '92' + phone.slice(1);
  } else if (!phone.startsWith('92') && phone.length === 10) {
    phone = '92' + phone;
  }

  const storeName = store?.storeName || 'Nexcart Store';
  const currency = store?.currencySymbol || 'Rs.';

  let itemsList = transaction.items.map((item, idx) => 
    `${idx + 1}. *${item.name}* (x${item.quantity}) - ${currency}${(item.salePrice * item.quantity).toFixed(2)}`
  ).join('\n');

  const text = `🧾 *OFFICIAL TAX INVOICE*
🏢 *${storeName}*
----------------------------------
📄 *Invoice #:* ${transaction.invoiceNumber}
📅 *Date:* ${new Date(transaction.timestamp).toLocaleDateString()} ${new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
👤 *Customer:* ${transaction.customer?.name || 'Valued Customer'}
💳 *Payment Method:* ${transaction.paymentMethod}
----------------------------------
*ITEMS PURCHASED:*
${itemsList}
----------------------------------
💵 *Subtotal:* ${currency}${transaction.subtotal ? transaction.subtotal.toFixed(2) : transaction.grandTotal.toFixed(2)}
🏷️ *Discount:* ${currency}${(transaction.discountAmount || 0).toFixed(2)}
🏛️ *Tax:* ${currency}${(transaction.tax || 0).toFixed(2)}
💰 *GRAND TOTAL:* ${currency}${transaction.grandTotal.toFixed(2)}
----------------------------------
${transaction.remainingBalance > 0 ? `⚠️ *Remaining Khaata Debt:* ${currency}${transaction.remainingBalance.toFixed(2)}\n` : ''}
🙏 *Thank you for shopping with us!*
✨ *Powered by Nexcart POS System*`;

  const encodedText = encodeURIComponent(text);
  const waUrl = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
  window.open(waUrl, '_blank');
};
