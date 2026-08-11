import ExcelJS from "exceljs";

export const generateFailedExcelService = async (failedRows) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Failed Contacts");

  worksheet.columns = [
    { header: "Row Number", key: "rowNumber", width: 12 },
    { header: "State", key: "state", width: 20 },
    { header: "District", key: "district", width: 20 },
    { header: "Block", key: "block", width: 20 },
    { header: "NAC", key: "nac", width: 20 },
    { header: "GP", key: "gp", width: 20 },
    { header: "Village", key: "village", width: 20 },
    { header: "Ward", key: "ward", width: 15 },
    { header: "Booth", key: "booth", width: 15 },
    { header: "Name", key: "name", width: 25 },
    { header: "Mobile", key: "mobile", width: 20 },
    { header: "Alternate Mobile", key: "alternateMobile", width: 20 },
    { header: "Email", key: "email", width: 25 },
    { header: "Designation", key: "designation", width: 20 },
    { header: "Address", key: "address", width: 30 },
    { header: "Error", key: "errors", width: 50 },
  ];

  failedRows.forEach((row) => {
    worksheet.addRow(row);
  });

  worksheet.getRow(1).font = {
    bold: true,
  };

  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FFF4CCCC",
    },
  };

  return workbook.xlsx.writeBuffer();
};