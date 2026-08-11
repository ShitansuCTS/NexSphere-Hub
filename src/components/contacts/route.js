import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Columns expected in the bulk contact import Excel file.
    // Location fields use names instead of database IDs.
    const headers = [
      'name',
      'mobile',
      'alternateMobile',
      'email',
      'designation',
      'address',
      'stateName',
      'districtName',
      'blockName',
      'nacName',
      'gpName',
      'villageName',
      'wardName',
      'boothName',
    ];

    // Sample data to demonstrate the expected format.
    const sampleData = [
      {
        name: 'John Doe',
        mobile: '9876543210',
        alternateMobile: '9123456780',
        email: 'john.doe@example.com',
        designation: 'Manager',
        address: '123 Main Street',
        stateName: 'California',
        districtName: 'Los Angeles',
        blockName: 'Block A',
        nacName: '',
        gpName: 'GP East',
        villageName: 'Someville',
        wardName: 'Ward 5',
        boothName: 'Booth 101',
      },
      {
        name: 'Jane Smith',
        mobile: '9123456789',
        alternateMobile: '',
        email: 'jane.smith@example.com',
        designation: 'Member',
        address: '456 Oak Street',
        stateName: 'California',
        districtName: 'Los Angeles',
        blockName: 'Block A',
        nacName: '',
        gpName: 'GP East',
        villageName: 'Someville',
        wardName: 'Ward 5',
        boothName: 'Booth 102',
      },
    ];

    // Create a new workbook.
    const workbook = XLSX.utils.book_new();

    // Create worksheet using the exact headers.
    const worksheet = XLSX.utils.json_to_sheet(sampleData, {
      header: headers,
    });

    // Add worksheet to workbook.
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // Set column widths for better readability.
    worksheet['!cols'] = [
      { wch: 22 }, // name
      { wch: 15 }, // mobile
      { wch: 18 }, // alternateMobile
      { wch: 30 }, // email
      { wch: 20 }, // designation
      { wch: 35 }, // address
      { wch: 20 }, // stateName
      { wch: 22 }, // districtName
      { wch: 20 }, // blockName
      { wch: 20 }, // nacName
      { wch: 20 }, // gpName
      { wch: 22 }, // villageName
      { wch: 18 }, // wardName
      { wch: 18 }, // boothName
    ];

    // Generate XLSX buffer.
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    // Return downloadable Excel file.
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="contacts_import_template.xlsx"',
        'Content-Length': String(excelBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating contact import template:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate contact import template.',
      },
      {
        status: 500,
      }
    );
  }
}