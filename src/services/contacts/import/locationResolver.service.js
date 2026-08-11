import { prisma } from "@/lib/prisma";

/**
 * Normalize text
 */
const normalize = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/**
 * Load all locations once
 */
export const loadLocationCache = async () => {
  const [
    states,
    districts,
    blocks,
    nacs,
    gps,
    villages,
    wards,
    booths,
  ] = await Promise.all([
    prisma.state.findMany(),
    prisma.district.findMany(),
    prisma.block.findMany(),
    prisma.nAC.findMany(),
    prisma.gP.findMany(),
    prisma.village.findMany(),
    prisma.ward.findMany(),
    prisma.booth.findMany(),
  ]);

  return {
    states,
    districts,
    blocks,
    nacs,
    gps,
    villages,
    wards,
    booths,
  };
};

const findByNameOrId = (list, value, parentId, parentKey = "id") => {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return null;

  return list.find((item) => {
    const hasParent = parentId ? item[parentKey] === parentId : true;
    return (
      hasParent &&
      (normalize(item.name) === normalizedValue ||
        normalize(item.id) === normalizedValue)
    );
  });
};

const getById = (list, id) => {
  if (!id) return null;
  return list.find((item) => item.id === id) || null;
};

/**
 * Resolve one row
 */
export const resolveLocationService = (
  row,
  cache,
  selectedLocation = {}
) => {
  //-----------------------------------
  // State
  //-----------------------------------

  const state =
    getById(cache.states, selectedLocation.stateId) ||
    findByNameOrId(cache.states, row.state);

  if (!state) {
    return {
      success: false,
      error: "State not found",
    };
  }

  //-----------------------------------
  // District
  //-----------------------------------

  const district =
    getById(cache.districts, selectedLocation.districtId) ||
    findByNameOrId(cache.districts, row.district, state.id, "stateId");

  if (!district) {
    return {
      success: false,
      error: "District not found",
    };
  }

  const block =
    getById(cache.blocks, selectedLocation.blockId) ||
    findByNameOrId(cache.blocks, row.block, district.id, "districtId");

  const nac =
    getById(cache.nacs, selectedLocation.nacId) ||
    findByNameOrId(cache.nacs, row.nac, district.id, "districtId");

  if (!block && !nac) {
    return {
      success: false,
      error: "Block or NAC not found",
    };
  }

  if (block) {
    const gp =
      getById(cache.gps, selectedLocation.gpId) ||
      findByNameOrId(cache.gps, row.gp, block.id, "blockId");

    if (!gp) {
      return {
        success: false,
        error: "GP not found",
      };
    }

    const village =
      getById(cache.villages, selectedLocation.villageId) ||
      findByNameOrId(cache.villages, row.village, gp.id, "gpId");

    if (!village) {
      return {
        success: false,
        error: "Village not found",
      };
    }

    const ward =
      getById(cache.wards, selectedLocation.wardId) ||
      cache.wards.find(
        (item) =>
          item.villageId === village.id &&
          (normalize(item.name) === normalize(row.ward) ||
            normalize(item.id) === normalize(row.ward))
      );

    if (!ward) {
      return {
        success: false,
        error: "Ward not found",
      };
    }

    const booth =
      getById(cache.booths, selectedLocation.boothId) ||
      findByNameOrId(cache.booths, row.booth, ward.id, "wardId");

    if (!booth) {
      return {
        success: false,
        error: "Booth not found",
      };
    }

    return {
      success: true,
      ids: {
        stateId: state.id,
        districtId: district.id,
        blockId: block.id,
        gpId: gp.id,
        villageId: village.id,
        wardId: ward.id,
        boothId: booth.id,
      },
    };
  }

  //-----------------------------------
  // NAC Flow
  //-----------------------------------

  const ward =
    getById(cache.wards, selectedLocation.wardId) ||
    cache.wards.find(
      (item) =>
        item.nacId === nac.id &&
        (normalize(item.name) === normalize(row.ward) ||
          normalize(item.id) === normalize(row.ward))
    );

  if (!ward) {
    return {
      success: false,
      error: "Ward not found",
    };
  }

  const booth =
    getById(cache.booths, selectedLocation.boothId) ||
    findByNameOrId(cache.booths, row.booth, ward.id, "wardId");

  if (!booth) {
    return {
      success: false,
      error: "Booth not found",
    };
  }

  return {
    success: true,
    ids: {
      stateId: state.id,
      districtId: district.id,
      nacId: nac.id,
      wardId: ward.id,
      boothId: booth.id,
    },
  };
};