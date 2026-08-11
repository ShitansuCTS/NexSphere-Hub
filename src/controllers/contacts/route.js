import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const headers = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'stateName',
      'districtName',
      'blockName',
      'nacName',
      'gpName',
      'villageName',
      'wardName',
      'boothName',
    ];

    const sampleData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        stateName: 'California',
        districtName: 'Los Angeles',
        blockName: 'Block A',
        nacName: 'NAC 1',
        gpName: 'GP East',
        villageName: 'Someville',
        wardName: 'Ward 5',
        boothName: 'Booth 101',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '9876543210',
        stateName: 'New York',
        districtName: '',
        blockName: '',
        nacName: '',
        gpName: '',
        villageName: '',
        wardName: '',
        boothName: '',
      },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet with exact headers
    const worksheet = XLSX.utils.json_to_sheet(sampleData, {
      header: headers,
    });

    // Add worksheet
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // Generate XLSX as Uint8Array
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    // Return file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="contacts_template_method_2.xlsx"',
        'Content-Length': excelBuffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating import template:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate template.',
      },
      {
        status: 500,
      }
    );
  }
}