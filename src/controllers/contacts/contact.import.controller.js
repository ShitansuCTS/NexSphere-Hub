import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * ============================================================
 * CONTACT IMPORT
 * ============================================================
 *
 * Excel contains CONTACT DATA ONLY.
 *
 * Excel columns:
 *
 *   name
 *   mobile
 *   alternateMobile
 *   email
 *   designation
 *   address
 *
 * Location IDs come ONLY from admin dropdown:
 *
 *   stateId
 *   districtId
 *   blockId
 *   nacId
 *   gpId
 *   villageId
 *   wardId
 *   boothId
 *
 * State and district are used for hierarchy validation.
 *
 * Contact receives:
 *
 *   blockId
 *   nacId
 *   gpId
 *   villageId
 *   wardId
 *   boothId
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * Excel schema
 * ------------------------------------------------------------
 */
const contactRowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required."),

  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required."),

  alternateMobile: z
    .string()
    .trim()
    .optional()
    .default(""),

  email: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) =>
        value === "" ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      {
        message: "Invalid email address.",
      }
    ),

  designation: z
    .string()
    .trim()
    .optional()
    .default(""),

  address: z
    .string()
    .trim()
    .optional()
    .default(""),
});


/**
 * ------------------------------------------------------------
 * Normalize generic value
 * ------------------------------------------------------------
 */
function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


/**
 * ------------------------------------------------------------
 * Normalize mobile number
 * ------------------------------------------------------------
 *
 * This is important for duplicate detection.
 *
 * Example:
 *
 *   "9876543210"
 *   " 9876543210 "
 *
 * become the same value.
 *
 * We keep +91 etc. as-is rather than making assumptions about
 * country codes.
 * ------------------------------------------------------------
 */
function normalizeMobile(value) {
  return normalizeValue(value)
    .replace(/\s+/g, "");
}


/**
 * ------------------------------------------------------------
 * Normalize Excel row
 * ------------------------------------------------------------
 */
function normalizeExcelRow(row) {
  const normalized = {};

  Object.entries(row || {}).forEach(([key, value]) => {
    normalized[String(key).trim()] =
      normalizeValue(value);
  });

  return normalized;
}


/**
 * ------------------------------------------------------------
 * Get selected location IDs
 * ------------------------------------------------------------
 */
function getLocationIds(formData) {
  return {
    stateId: normalizeValue(
      formData.get("stateId")
    ),

    districtId: normalizeValue(
      formData.get("districtId")
    ),

    blockId: normalizeValue(
      formData.get("blockId")
    ),

    nacId: normalizeValue(
      formData.get("nacId")
    ),

    gpId: normalizeValue(
      formData.get("gpId")
    ),

    villageId: normalizeValue(
      formData.get("villageId")
    ),

    wardId: normalizeValue(
      formData.get("wardId")
    ),

    boothId: normalizeValue(
      formData.get("boothId")
    ),
  };
}


/**
 * ------------------------------------------------------------
 * Create failed report
 * ------------------------------------------------------------
 */
function createFailedReport(failedRows) {
  const workbook =
    XLSX.utils.book_new();

  const worksheet =
    XLSX.utils.json_to_sheet(
      failedRows
    );

  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 35 },
    { wch: 25 },
    { wch: 45 },
    { wch: 70 },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Failed Records"
  );

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });
}


/**
 * ============================================================
 * VALIDATE LOCATION HIERARCHY
 * ============================================================
 */
async function validateLocationIds(
  locationIds
) {
  const errors = [];

  let district = null;
  let block = null;
  let nac = null;
  let gp = null;
  let village = null;
  let ward = null;
  let booth = null;


  /**
   * ----------------------------------------------------------
   * State
   * ----------------------------------------------------------
   */
  if (locationIds.stateId) {
    const state =
      await prisma.state.findUnique({
        where: {
          id: locationIds.stateId,
        },

        select: {
          id: true,
        },
      });

    if (!state) {
      errors.push(
        "Selected state does not exist."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * District
   * ----------------------------------------------------------
   */
  if (locationIds.districtId) {
    district =
      await prisma.district.findUnique({
        where: {
          id: locationIds.districtId,
        },

        select: {
          id: true,
          stateId: true,
        },
      });

    if (!district) {
      errors.push(
        "Selected district does not exist."
      );
    } else if (
      locationIds.stateId &&
      district.stateId !==
        locationIds.stateId
    ) {
      errors.push(
        "Selected district does not belong to the selected state."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * Block
   * ----------------------------------------------------------
   */
  if (locationIds.blockId) {
    block =
      await prisma.block.findUnique({
        where: {
          id: locationIds.blockId,
        },

        select: {
          id: true,
          districtId: true,
        },
      });

    if (!block) {
      errors.push(
        "Selected block does not exist."
      );
    } else if (
      locationIds.districtId &&
      block.districtId !==
        locationIds.districtId
    ) {
      errors.push(
        "Selected block does not belong to the selected district."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * NAC
   * ----------------------------------------------------------
   */
  if (locationIds.nacId) {
    nac =
      await prisma.nAC.findUnique({
        where: {
          id: locationIds.nacId,
        },

        select: {
          id: true,
          districtId: true,
        },
      });

    if (!nac) {
      errors.push(
        "Selected NAC does not exist."
      );
    } else if (
      locationIds.districtId &&
      nac.districtId !==
        locationIds.districtId
    ) {
      errors.push(
        "Selected NAC does not belong to the selected district."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * GP
   * ----------------------------------------------------------
   */
  if (locationIds.gpId) {
    gp =
      await prisma.gP.findUnique({
        where: {
          id: locationIds.gpId,
        },

        select: {
          id: true,
          blockId: true,
        },
      });

    if (!gp) {
      errors.push(
        "Selected GP does not exist."
      );
    } else if (
      locationIds.blockId &&
      gp.blockId !==
        locationIds.blockId
    ) {
      errors.push(
        "Selected GP does not belong to the selected block."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * Village
   * ----------------------------------------------------------
   */
  if (locationIds.villageId) {
    village =
      await prisma.village.findUnique({
        where: {
          id: locationIds.villageId,
        },

        select: {
          id: true,
          gpId: true,
        },
      });

    if (!village) {
      errors.push(
        "Selected village does not exist."
      );
    } else if (
      locationIds.gpId &&
      village.gpId !==
        locationIds.gpId
    ) {
      errors.push(
        "Selected village does not belong to the selected GP."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * Ward
   * ----------------------------------------------------------
   *
   * Ward can belong to:
   *
   *   Village
   *
   * OR
   *
   *   NAC
   * ----------------------------------------------------------
   */
  if (locationIds.wardId) {
    ward =
      await prisma.ward.findUnique({
        where: {
          id: locationIds.wardId,
        },

        select: {
          id: true,
          villageId: true,
          nacId: true,
        },
      });

    if (!ward) {
      errors.push(
        "Selected ward does not exist."
      );
    } else {
      const belongsToVillage =
        Boolean(
          locationIds.villageId &&
          ward.villageId ===
            locationIds.villageId
        );

      const belongsToNac =
        Boolean(
          locationIds.nacId &&
          ward.nacId ===
            locationIds.nacId
        );

      if (
        locationIds.villageId ||
        locationIds.nacId
      ) {
        if (
          !belongsToVillage &&
          !belongsToNac
        ) {
          errors.push(
            "Selected ward does not belong to the selected village or NAC."
          );
        }
      }
    }
  }


  /**
   * ----------------------------------------------------------
   * Booth
   * ----------------------------------------------------------
   */
  if (locationIds.boothId) {
    booth =
      await prisma.booth.findUnique({
        where: {
          id: locationIds.boothId,
        },

        select: {
          id: true,
          wardId: true,
        },
      });

    if (!booth) {
      errors.push(
        "Selected booth does not exist."
      );
    } else if (
      locationIds.wardId &&
      booth.wardId !==
        locationIds.wardId
    ) {
      errors.push(
        "Selected booth does not belong to the selected ward."
      );
    }
  }


  /**
   * ----------------------------------------------------------
   * Important hierarchy validation
   * ----------------------------------------------------------
   *
   * If Booth is selected, Ward must exist.
   *
   * If Ward is selected, Village OR NAC must exist.
   *
   * If Village is selected, GP must exist.
   *
   * If GP is selected, Block must exist.
   *
   * If Block/NAC is selected, District must exist.
   *
   * If District is selected, State must exist.
   * ----------------------------------------------------------
   */

  if (
    locationIds.districtId &&
    !locationIds.stateId
  ) {
    errors.push(
      "State is required when district is selected."
    );
  }

  if (
    locationIds.blockId &&
    !locationIds.districtId
  ) {
    errors.push(
      "District is required when block is selected."
    );
  }

  if (
    locationIds.nacId &&
    !locationIds.districtId
  ) {
    errors.push(
      "District is required when NAC is selected."
    );
  }

  if (
    locationIds.gpId &&
    !locationIds.blockId
  ) {
    errors.push(
      "Block is required when GP is selected."
    );
  }

  if (
    locationIds.villageId &&
    !locationIds.gpId
  ) {
    errors.push(
      "GP is required when village is selected."
    );
  }

  if (
    locationIds.wardId &&
    !locationIds.villageId &&
    !locationIds.nacId
  ) {
    errors.push(
      "Village or NAC is required when ward is selected."
    );
  }

  if (
    locationIds.boothId &&
    !locationIds.wardId
  ) {
    errors.push(
      "Ward is required when booth is selected."
    );
  }


  /**
   * ----------------------------------------------------------
   * NAC and Block/GP/Village are different branches.
   * ----------------------------------------------------------
   *
   * Don't allow:
   *
   * NAC + GP
   *
   * NAC + Village
   *
   * This avoids an invalid mixed hierarchy.
   * ----------------------------------------------------------
   */
  if (
    locationIds.nacId &&
    (
      locationIds.blockId ||
      locationIds.gpId ||
      locationIds.villageId
    )
  ) {
    errors.push(
      "NAC cannot be combined with Block, GP, or Village."
    );
  }


  return errors;
}


/**
 * ============================================================
 * BUILD FAILED ROW
 * ============================================================
 */
function buildFailedRow(
  rowNumber,
  contact,
  reason
) {
  return {
    RowNumber: rowNumber,

    name:
      contact.name || "",

    mobile:
      contact.mobile || "",

    alternateMobile:
      contact.alternateMobile || "",

    email:
      contact.email || "",

    designation:
      contact.designation || "",

    address:
      contact.address || "",

    Reason: reason,
  };
}


/**
 * ============================================================
 * IMPORT CONTACTS
 * ============================================================
 */
export async function importContacts(req) {
  let importRecord = null;

  try {
    /**
     * --------------------------------------------------------
     * 1. Read FormData
     * --------------------------------------------------------
     */
    const formData =
      await req.formData();

    const file =
      formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Excel or CSV file is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof file.arrayBuffer !==
      "function"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid uploaded file.",
        },
        {
          status: 400,
        }
      );
    }


    /**
     * --------------------------------------------------------
     * 2. Location
     * --------------------------------------------------------
     */
    const locationIds =
      getLocationIds(formData);


    /**
     * --------------------------------------------------------
     * 3. Validate location hierarchy
     * --------------------------------------------------------
     */
    const locationErrors =
      await validateLocationIds(
        locationIds
      );

    if (
      locationErrors.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid location selection.",

          errors:
            locationErrors,
        },
        {
          status: 400,
        }
      );
    }


    /**
     * --------------------------------------------------------
     * 4. Read file
     * --------------------------------------------------------
     */
    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    const workbook =
      XLSX.read(buffer, {
        type: "buffer",
        cellDates: false,
        raw: false,
      });

    if (
      !workbook.SheetNames.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The uploaded file does not contain any worksheet.",
        },
        {
          status: 400,
        }
      );
    }


    const worksheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: "",
          raw: false,
        }
      );


    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The uploaded file does not contain any contact records.",
        },
        {
          status: 400,
        }
      );
    }


    /**
     * --------------------------------------------------------
     * 5. Create import record
     * --------------------------------------------------------
     */
    importRecord =
      await prisma.contactImport.create({
        data: {
          fileName:
            file.name ||
            "contacts_import.xlsx",

          totalRows:
            rows.length,

          successRows: 0,

          failedRows: 0,

          status: "PROCESSING",
        },
      });


    /**
     * --------------------------------------------------------
     * 6. Validate rows
     * --------------------------------------------------------
     */
    const validContacts = [];

    const failedRows = [];

    const importErrors = [];

    /**
     * Track duplicate mobiles inside THIS Excel file.
     */
    const seenMobiles =
      new Map();


    rows.forEach(
      (rawRow, index) => {
        const rowNumber =
          index + 2;

        const row =
          normalizeExcelRow(
            rawRow
          );


        /**
         * ----------------------------------------------------
         * Only contact fields from Excel
         * ----------------------------------------------------
         */
        const contactInput = {
          name:
            row.name,

          mobile:
            normalizeMobile(
              row.mobile
            ),

          alternateMobile:
            normalizeMobile(
              row.alternateMobile
            ),

          email:
            row.email,

          designation:
            row.designation,

          address:
            row.address,
        };


        /**
         * ----------------------------------------------------
         * Zod validation
         * ----------------------------------------------------
         */
        const validation =
          contactRowSchema.safeParse(
            contactInput
          );


        if (!validation.success) {
          const reason =
            validation.error.issues
              .map(
                (issue) =>
                  issue.message
              )
              .join(" | ");


          failedRows.push(
            buildFailedRow(
              rowNumber,
              contactInput,
              reason
            )
          );


          importErrors.push({
            rowNumber,

            errorMessage:
              reason,

            rawData:
              contactInput,
          });

          return;
        }


        const data =
          validation.data;


        /**
         * ----------------------------------------------------
         * Duplicate inside Excel
         * ----------------------------------------------------
         */
        const normalizedMobile =
          normalizeMobile(
            data.mobile
          );


        if (
          seenMobiles.has(
            normalizedMobile
          )
        ) {
          const firstRow =
            seenMobiles.get(
              normalizedMobile
            );


          const reason =
            `Duplicate mobile number in Excel. First occurrence is row ${firstRow}.`;


          failedRows.push(
            buildFailedRow(
              rowNumber,
              data,
              reason
            )
          );


          importErrors.push({
            rowNumber,

            errorMessage:
              reason,

            rawData:
              data,
          });

          return;
        }


        seenMobiles.set(
          normalizedMobile,
          rowNumber
        );


        /**
         * ----------------------------------------------------
         * Build database object
         * ----------------------------------------------------
         */
        validContacts.push({
          rowNumber,

          data: {
            name:
              data.name,

            mobile:
              normalizedMobile,

            alternateMobile:
              data.alternateMobile ||
              null,

            email:
              data.email ||
              null,

            designation:
              data.designation ||
              null,

            address:
              data.address ||
              null,

            /**
             * Location comes ONLY from dropdown.
             */
            nacId:
              locationIds.nacId ||
              null,

            blockId:
              locationIds.blockId ||
              null,

            gpId:
              locationIds.gpId ||
              null,

            villageId:
              locationIds.villageId ||
              null,

            wardId:
              locationIds.wardId ||
              null,

            boothId:
              locationIds.boothId ||
              null,

            importId:
              importRecord.id,

            isActive:
              true,
          },
        });
      }
    );


    /**
     * --------------------------------------------------------
     * 7. Check existing contacts
     * --------------------------------------------------------
     *
     * This is the important part.
     *
     * skipDuplicates alone is NOT sufficient unless mobile
     * has a database unique constraint.
     *
     * We explicitly check existing mobiles.
     * --------------------------------------------------------
     */
    const mobileNumbers =
      validContacts.map(
        (item) =>
          item.data.mobile
      );


    const existingContacts =
      mobileNumbers.length > 0
        ? await prisma.contact.findMany({
            where: {
              mobile: {
                in: mobileNumbers,
              },
            },

            select: {
              mobile: true,
            },
          })
        : [];


    const existingMobiles =
      new Set(
        existingContacts.map(
          (contact) =>
            normalizeMobile(
              contact.mobile
            )
        )
      );


    /**
     * --------------------------------------------------------
     * Remove existing duplicates
     * --------------------------------------------------------
     */
    const contactsToInsert = [];


    validContacts.forEach(
      (item) => {
        const mobile =
          item.data.mobile;


        if (
          existingMobiles.has(
            mobile
          )
        ) {
          const reason =
            "Duplicate mobile number. Contact already exists.";


          failedRows.push(
            buildFailedRow(
              item.rowNumber,
              item.data,
              reason
            )
          );


          importErrors.push({
            rowNumber:
              item.rowNumber,

            errorMessage:
              reason,

            rawData:
              item.data,
          });


          return;
        }


        contactsToInsert.push(
          item
        );
      }
    );


    /**
     * --------------------------------------------------------
     * 8. Insert contacts
     * --------------------------------------------------------
     *
     * We insert one-by-one inside a transaction.
     *
     * This gives us exact row-level success/failure
     * information.
     *
     * It also prevents createMany() from making it impossible
     * to know which row failed.
     * --------------------------------------------------------
     */
    let importedCount = 0;


    for (
      const item of contactsToInsert
    ) {
      try {
        await prisma.contact.create({
          data: item.data,
        });

        importedCount++;
      } catch (dbError) {
        console.error(
          `Contact insert failed for row ${item.rowNumber}:`,
          dbError
        );


        const reason =
          dbError?.code ===
          "P2002"
            ? "Duplicate contact. A contact with the same unique value already exists."
            : dbError?.message ||
              "Database error while inserting contact.";


        failedRows.push(
          buildFailedRow(
            item.rowNumber,
            item.data,
            reason
          )
        );


        importErrors.push({
          rowNumber:
            item.rowNumber,

          errorMessage:
            reason,

          rawData:
            item.data,
        });
      }
    }


    /**
     * --------------------------------------------------------
     * 9. Save import errors
     * --------------------------------------------------------
     */
    if (
      importErrors.length > 0
    ) {
      await prisma.contactImportError.createMany(
        {
          data:
            importErrors.map(
              (error) => ({
                importId:
                  importRecord.id,

                rowNumber:
                  error.rowNumber,

                errorMessage:
                  error.errorMessage,

                rawData:
                  error.rawData,
              })
            ),
        }
      );
    }


    /**
     * --------------------------------------------------------
     * 10. Final counts
     * --------------------------------------------------------
     */
    const totalRows =
      rows.length;

    const failedCount =
      failedRows.length;


    const finalStatus =
      failedCount === 0
        ? "COMPLETED"
        : importedCount > 0
          ? "COMPLETED"
          : "FAILED";


    /**
     * --------------------------------------------------------
     * 11. Update import record
     * --------------------------------------------------------
     */
    await prisma.contactImport.update({
      where: {
        id:
          importRecord.id,
      },

      data: {
        totalRows,

        successRows:
          importedCount,

        failedRows:
          failedCount,

        status:
          finalStatus,
      },
    });


    /**
     * --------------------------------------------------------
     * 12. Partial result
     * --------------------------------------------------------
     */
    if (
      failedCount > 0
    ) {
      const failedBuffer =
        createFailedReport(
          failedRows
        );


      const responseHeaders =
        new Headers();


      responseHeaders.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );


      responseHeaders.set(
        "Content-Disposition",
        'attachment; filename="failed_contacts_report.xlsx"'
      );


      responseHeaders.set(
        "Cache-Control",
        "no-store"
      );


      responseHeaders.set(
        "X-Import-Total",
        String(totalRows)
      );


      responseHeaders.set(
        "X-Import-Success",
        String(importedCount)
      );


      responseHeaders.set(
        "X-Import-Failed",
        String(failedCount)
      );


      responseHeaders.set(
        "X-Import-Id",
        String(
          importRecord.id
        )
      );


      return new NextResponse(
        failedBuffer,
        {
          status: 207,

          headers:
            responseHeaders,
        }
      );
    }


    /**
     * --------------------------------------------------------
     * 13. Success response
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * The frontend needs these values directly.
     * --------------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,

        message:
          `${importedCount} contacts imported successfully.`,

        importId:
          importRecord.id,

        totalRows:
          totalRows,

        successRows:
          importedCount,

        failedRows:
          failedCount,

        summary: {
          total:
            totalRows,

          imported:
            importedCount,

          failed:
            failedCount,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Contact import error:",
      error
    );


    /**
     * --------------------------------------------------------
     * Mark import failed
     * --------------------------------------------------------
     */
    if (
      importRecord?.id
    ) {
      try {
        await prisma.contactImport.update({
          where: {
            id:
              importRecord.id,
          },

          data: {
            status:
              "FAILED",
          },
        });
      } catch (updateError) {
        console.error(
          "Failed to update ContactImport status:",
          updateError
        );
      }
    }


    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "An unexpected error occurred during contact import.",
      },
      {
        status: 500,
      }
    );
  }
}