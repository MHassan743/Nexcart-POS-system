/**
 * printReceipt — Direct & Reliable DOM Print Utility.
 * Ensures the target element is mounted cleanly and triggers browser print dialog.
 * 
 * @param {string} elementId - ID of the container element to print
 * @param {string} title - Optional print document title
 */
export function printReceipt(elementId = 'printable-receipt', title = '') {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    console.warn(`printReceipt: #${elementId} not found`);
    window.print();
    return;
  }

  // Remove existing print mount if any
  const existing = document.getElementById('nexcart-print-mount');
  if (existing) {
    document.body.removeChild(existing);
  }

  // Create mount container directly under <body> for bulletproof fallback
  const mount = document.createElement('div');
  mount.id = 'nexcart-print-mount';
  mount.innerHTML = sourceEl.outerHTML;
  document.body.appendChild(mount);

  // Set document title temporarily for PDF print file name
  const originalTitle = document.title;
  if (title) document.title = title;

  // Trigger print after brief tick for DOM rendering
  setTimeout(() => {
    window.print();
    
    // Cleanup mount after print dialog closes
    const cleanup = () => {
      const el = document.getElementById('nexcart-print-mount');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
    };
    
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 2500);
  }, 50);
}
