import {
  readExcelService,
} from "./readExcel.service";

import {
  validateRowsService,
} from "./validateRows.service";

import {
  loadLocationCache,
  resolveLocationService,
} from "./locationResolver.service";

import { prisma } from "@/lib/prisma";

import {
  createImportStore,
  updateImportStore,
  createImportErrorsStore,
} from "@/store/contacts/import.store";

import {
  createManyContactsStore,
} from "@/store/contacts/contact.store";

import {
  generateFailedExcelService,
} from "./failedExcel.service";

const normalize = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const LOCATION_LOOKUP = {
  stateId: { field: "State", list: "states" },
  districtId: { field: "District", list: "districts" },
  blockId: { field: "Block", list: "blocks" },
  nacId: { field: "NAC", list: "nacs" },
  gpId: { field: "GP", list: "gps" },
  villageId: { field: "Village", list: "villages" },
  wardId: { field: "Ward", list: "wards" },
  boothId: { field: "Booth", list: "booths" },
};

const buildSelectedLocation = (selectedLocation, cache) => {
  const normalized = { ...selectedLocation };

  if (normalized.boothId) {
    const booth = cache.booths.find((item) => item.id === normalized.boothId);
    if (booth) {
      normalized.wardId = booth.wardId;
    }
  }

  if (normalized.wardId) {
    const ward = cache.wards.find((item) => item.id === normalized.wardId);
    if (ward) {
      normalized.villageId = ward.villageId || normalized.villageId;
      normalized.nacId = ward.nacId || normalized.nacId;
    }
  }

  if (normalized.villageId) {
    const village = cache.villages.find((item) => item.id === normalized.villageId);
    if (village) {
      normalized.gpId = village.gpId || normalized.gpId;
    }
  }

  if (normalized.gpId) {
    const gp = cache.gps.find((item) => item.id === normalized.gpId);
    if (gp) {
      normalized.blockId = gp.blockId || normalized.blockId;
    }
  }

  if (normalized.blockId) {
    const block = cache.blocks.find((item) => item.id === normalized.blockId);
    if (block) {
      normalized.districtId = block.districtId || normalized.districtId;
    }
  }

  if (normalized.nacId) {
    const nac = cache.nacs.find((item) => item.id === normalized.nacId);
    if (nac) {
      normalized.districtId = nac.districtId || normalized.districtId;
    }
  }

  if (normalized.districtId) {
    const district = cache.districts.find((item) => item.id === normalized.districtId);
    if (district) {
      normalized.stateId = district.stateId || normalized.stateId;
    }
  }

  return normalized;
};

const applySelectedLocationDefaults = (row, cache, selectedLocation) => {
  const result = { ...row };

  Object.entries(LOCATION_LOOKUP).forEach(([locationId, config]) => {
    if (selectedLocation[locationId] && !normalize(result[config.field])) {
      const item = cache[config.list].find(
        (entity) => entity.id === selectedLocation[locationId]
      );
      if (item) {
        result[config.field] = item.name;
      }
    }
  });

  return result;
};

export const importContactsService = async (file, selectedLocation = {}) => {

  //------------------------------------
  // Read Excel
  //------------------------------------

  const rows = await readExcelService(file);

  //------------------------------------
  // Load Location Cache
  //------------------------------------

  const cache = await loadLocationCache();

  const normalizedSelectedLocation = buildSelectedLocation(selectedLocation, cache);

  const rowsWithDefaults = rows.map((row) =>
    applySelectedLocationDefaults(row, cache, normalizedSelectedLocation)
  );

  //------------------------------------
  // Validate Rows
  //------------------------------------

  const { validRows, failedRows } = validateRowsService(rowsWithDefaults, {
    selectedLocation: normalizedSelectedLocation,
  });

  //------------------------------------
  // Create Import Record
  //------------------------------------

  const importRecord = await createImportStore({
    fileName: file.name || "contacts-import.xlsx",
    totalRows: rows.length,
    successRows: 0,
    failedRows: failedRows.length,
    status: "PROCESSING",
  });

  const contacts = [];
  const importErrors = [];

  //------------------------------------
  // Resolve Locations and queue contacts
  //------------------------------------

  for (const row of validRows) {
    const location = resolveLocationService(
      row,
      cache,
      normalizedSelectedLocation
    );

    if (!location.success) {
      const errorMessage = location.error;
      failedRows.push({
        ...row,
        errors: errorMessage,
      });
      importErrors.push({
        importId: importRecord.id,
        rowNumber: row.rowNumber,
        errorMessage,
        rawData: row,
      });
      continue;
    }

    //----------------------------------
    // Duplicate Mobile in Database
    //----------------------------------

    const exists = await prisma.contact.findFirst({
      where: {
        mobile: row.mobile,
      },
    });

    if (exists) {
      const errorMessage = "Mobile already exists";
      failedRows.push({
        ...row,
        errors: errorMessage,
      });
      importErrors.push({
        importId: importRecord.id,
        rowNumber: row.rowNumber,
        errorMessage,
        rawData: row,
      });
      continue;
    }

    //----------------------------------
    // Ready for Insert
    //----------------------------------

    contacts.push({
      name: normalize(row.name),
      mobile: normalize(row.mobile),
      alternateMobile: normalize(row.alternateMobile) || null,
      email: normalize(row.email) || null,
      designation: normalize(row.designation) || null,
      address: normalize(row.address) || null,
      isActive: true,
      importId: importRecord.id,
      ...location.ids,
    });
  }

  //------------------------------------
  // Bulk Insert
  //------------------------------------

  let insertedCount = 0;

  if (contacts.length) {
    const result = await createManyContactsStore(contacts);
    insertedCount = result?.count ?? contacts.length;
  }

  //------------------------------------
  // Persist Errors
  //------------------------------------

  if (failedRows.length) {
    const uniqueErrors = failedRows.map((row) => ({
      importId: importRecord.id,
      rowNumber: row.rowNumber,
      errorMessage: row.errors,
      rawData: row,
    }));

    await createImportErrorsStore(uniqueErrors);
  }

  //------------------------------------
  // Generate Failed Excel
  //------------------------------------

  let failedExcel = null;
  let failedFileName = null;

  if (failedRows.length) {
    const buffer = await generateFailedExcelService(failedRows);
    failedExcel = Buffer.from(buffer).toString("base64");
    failedFileName = `failed-contacts-${importRecord.id}.xlsx`;
  }

  //------------------------------------
  // Update Import Record
  //------------------------------------

  await updateImportStore(importRecord.id, {
    successRows: insertedCount,
    failedRows: failedRows.length,
    failedFile: failedFileName,
    status: failedRows.length > 0 ? "FAILED" : "COMPLETED",
  });

  //------------------------------------
  // Response
  //------------------------------------

  return {
    importId: importRecord.id,
    total: rows.length,
    success: insertedCount,
    failed: failedRows.length,
    failedRows,
    failedExcel,
    failedFileName,
  };
};