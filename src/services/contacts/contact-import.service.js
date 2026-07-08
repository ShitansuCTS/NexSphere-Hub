import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { confirmContactImportSchema } from "@/validations/contact-import.validation";

import { contactImportLocationSchema } from "@/validations/contact-import.validation";

const requiredColumns = ["name", "mobile"];

export const previewContactImportService = async (formData) => {
    const file = formData.get("file");

    if (!file) {
        throw new Error("Excel file is required");
    }

    const locationData = {
        locationType: formData.get("locationType"),
        nacId: formData.get("nacId") || null,
        blockId: formData.get("blockId") || null,
        gpId: formData.get("gpId") || null,
        villageId: formData.get("villageId") || null,
        wardId: formData.get("wardId") || null,
        boothId: formData.get("boothId") || null,
    };

    const validatedLocation =
        contactImportLocationSchema.parse(locationData);

    const buffer = Buffer.from(await file.arrayBuffer());

    const workbook = XLSX.read(buffer, {
        type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error("Excel sheet not found");
    }

    const rows = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        {
            defval: "",
        }
    );

    if (!rows.length) {
        throw new Error("Excel file is empty");
    }

    const columns = Object.keys(rows[0]).map((col) =>
        col.trim()
    );

    const missingColumns = requiredColumns.filter(
        (col) => !columns.includes(col)
    );

    if (missingColumns.length) {
        throw new Error(
            `Missing required columns: ${missingColumns.join(", ")}`
        );
    }

    const seenMobiles = new Set();

    const excelMobiles = rows
        .map((row) => String(row.mobile || "").trim())
        .filter(Boolean);

    const existingContacts = await prisma.contact.findMany({
        where: {
            mobile: {
                in: excelMobiles,
            },
            isActive: true,
        },
        select: {
            mobile: true,
        },
    });

    const existingMobileSet = new Set(
        existingContacts.map((item) => item.mobile)
    );

    const validRows = [];
    const errorRows = [];

    rows.forEach((row, index) => {
        const rowNumber = index + 2;

        const name = String(row.name || "").trim();
        const mobile = String(row.mobile || "").trim();

        const errors = [];

        if (!name) {
            errors.push("Name is required");
        }

        if (!mobile) {
            errors.push("Mobile is required");
        }

        if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
            errors.push("Invalid mobile number");
        }

        if (seenMobiles.has(mobile)) {
            errors.push("Duplicate mobile in Excel");
        }

        if (existingMobileSet.has(mobile)) {
            errors.push("Mobile already exists");
        }

        seenMobiles.add(mobile);

        const cleanRow = {
            rowNumber,
            name,
            mobile,
            alternateMobile: String(row.alternateMobile || "").trim() || null,
            email: String(row.email || "").trim() || null,
            designation: String(row.designation || "").trim() || null,
            address: String(row.address || "").trim() || null,

            nacId: validatedLocation.nacId,
            blockId: validatedLocation.blockId,
            gpId: validatedLocation.gpId,
            villageId: validatedLocation.villageId,
            wardId: validatedLocation.wardId,
            boothId: validatedLocation.boothId,
        };

        if (errors.length) {
            errorRows.push({
                ...cleanRow,
                errors,
            });
        } else {
            validRows.push(cleanRow);
        }
    });

    const importBatch = await prisma.contactImportBatch.create({
        data: {
            totalRows: rows.length,
            validCount: validRows.length,
            errorCount: errorRows.length,
            validRows,
            errorRows,
            status: "PENDING",
        },
    });

    return {
        previewId: importBatch.id,
        totalRows: rows.length,
        validCount: validRows.length,
        errorCount: errorRows.length,
        errorRows,
    };
};



export const confirmContactImportService = async (body) => {
    const { previewId } = body;

    if (!previewId) {
        throw new Error("Preview ID is required");
    }

    const batch = await prisma.contactImportBatch.findUnique({
        where: {
            id: previewId,
        },
    });

    if (!batch) {
        throw new Error("IMPORT_BATCH_NOT_FOUND");
    }

    if (batch.status !== "PENDING") {
        throw new Error("IMPORT_ALREADY_PROCESSED");
    }

    const validRows = batch.validRows || [];

    const validatedData =
        confirmContactImportSchema.parse({
            rows: validRows,
        });

    await prisma.contact.createMany({
        data: validatedData.rows.map((row) => ({
            name: row.name,
            mobile: row.mobile,
            alternateMobile: row.alternateMobile || null,
            email: row.email || null,
            designation: row.designation || null,
            address: row.address || null,

            nacId: row.nacId || null,
            blockId: row.blockId || null,
            gpId: row.gpId || null,
            villageId: row.villageId || null,
            wardId: row.wardId || null,
            boothId: row.boothId || null,
        })),
        skipDuplicates: true,
    });

    await prisma.contactImportBatch.update({
        where: {
            id: previewId,
        },
        data: {
            status: "COMPLETED",
        },
    });

    return {
        previewId,
        importedCount: validatedData.rows.length,
        status: "COMPLETED",
    };
};