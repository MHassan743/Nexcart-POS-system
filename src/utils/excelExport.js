import * as XLSX from 'xlsx';

/**
 * Export any array of objects to an Excel (.xlsx) file
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Desired file name without extension
 * @param {string} sheetName - Sheet tab name
 */
export const exportToExcel = (data, fileName = 'Nexcart_Export', sheetName = 'Data') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Excel Export Error:', err);
    alert('Failed to generate Excel file.');
  }
};

/**
 * Parse an uploaded Excel/CSV file into JSON array
 * @param {File} file - Uploaded File object
 * @returns {Promise<Array>} Promise resolving to array of row objects
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
