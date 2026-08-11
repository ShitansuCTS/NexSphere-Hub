import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Only fields that belong to the Contact import.
    // Location fields are NOT part of the Excel file.
    const headers = [
      "name",
      "mobile",
      "alternateMobile",
      "email",
      "designation",
      "address",
    ];

    const sampleData = [
      {
        name: "John Doe",
        mobile: "9876543210",
        alternateMobile: "9123456780",
        email: "john.doe@example.com",
        designation: "Member",
        address: "123 Main Street",
      },
      {
        name: "Jane Smith",
        mobile: "9876543211",
        alternateMobile: "",
        email: "jane.smith@example.com",
        designation: "Volunteer",
        address: "456 Market Road",
      },
    ];

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(sampleData, {
      header: headers,
    });

    worksheet["!cols"] = [
      { wch: 30 }, // name
      { wch: 18 }, // mobile
      { wch: 20 }, // alternateMobile
      { wch: 32 }, // email
      { wch: 22 }, // designation
      { wch: 45 }, // address
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Contacts"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          'attachment; filename="contacts_import_template.xlsx"',

        "Content-Length": String(excelBuffer.length),

        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",

        Pragma: "no-cache",

        Expires: "0",
      },
    });
  } catch (error) {
    console.error(
      "Error generating contacts import template:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate contacts import template.",
      },
      {
        status: 500,
      }
    );
  }
}