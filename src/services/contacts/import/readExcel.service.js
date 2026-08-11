import * as XLSX from "xlsx";

/**
 * Read Excel File
 *
 * @param {File} file
 * @returns {Array}
 */
export const readExcelService = async (file) => {
  if (!file) {
    throw new Error("Excel file is required.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
  });

  if (!rows.length) {
    throw new Error("Excel file is empty.");
  }

  return rows;
};