const MOBILE_REGEX = /^[6-9]\d{9}$/;

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

/**
 * Normalize string
 */
const normalize = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * Validate Excel Rows
 */
export const validateRowsService = (rows, options = {}) => {
  const { selectedLocation = {} } = options;

  const validRows = [];
  const failedRows = [];

  const mobileSet = new Set();

  rows.forEach((row, index) => {
    const errors = [];

    const data = {
      state: normalize(row.State),
      district: normalize(row.District),
      block: normalize(row.Block),
      nac: normalize(row.NAC),
      gp: normalize(row.GP),
      village: normalize(row.Village),
      ward: normalize(row.Ward),
      booth: normalize(row.Booth),

      name: normalize(row.Name),
      mobile: normalize(row.Mobile),

      alternateMobile: normalize(row["Alternate Mobile"]),
      email: normalize(row.Email),
      designation: normalize(row.Designation),
      address: normalize(row.Address),
    };

    //----------------------------------
    // Required Fields
    //----------------------------------

    if (!data.name)
      errors.push("Name is required");

    if (!data.mobile)
      errors.push("Mobile is required");

    if (!data.state && !selectedLocation.stateId)
      errors.push("State is required");

    if (!data.district && !selectedLocation.districtId)
      errors.push("District is required");

    //----------------------------------
    // Either Block OR NAC
    //----------------------------------

    if (
      !data.block &&
      !data.nac &&
      !selectedLocation.blockId &&
      !selectedLocation.nacId
    ) {
      errors.push("Block or NAC is required");
    }

    //----------------------------------
    // Block Flow
    //----------------------------------

    if (data.block || selectedLocation.blockId) {
      if (!data.gp && !selectedLocation.gpId)
        errors.push("GP is required");

      if (!data.village && !selectedLocation.villageId)
        errors.push("Village is required");
    }

    //----------------------------------
    // Ward
    //----------------------------------

    if (!data.ward && !selectedLocation.wardId)
      errors.push("Ward is required");

    //----------------------------------
    // Booth
    //----------------------------------

    if (!data.booth && !selectedLocation.boothId)
      errors.push("Booth is required");

    //----------------------------------
    // Mobile
    //----------------------------------

    if (data.mobile && !MOBILE_REGEX.test(data.mobile)) {
      errors.push("Invalid mobile");
    }

    //----------------------------------
    // Alternate Mobile
    //----------------------------------

    if (
      data.alternateMobile &&
      !MOBILE_REGEX.test(data.alternateMobile)
    ) {
      errors.push("Invalid alternate mobile");
    }

    //----------------------------------
    // Email
    //----------------------------------

    if (
      data.email &&
      !EMAIL_REGEX.test(data.email)
    ) {
      errors.push("Invalid email");
    }

    //----------------------------------
    // Duplicate Inside Excel
    //----------------------------------

    if (mobileSet.has(data.mobile)) {
      errors.push("Duplicate mobile in Excel");
    }

    mobileSet.add(data.mobile);

    //----------------------------------
    // Final
    //----------------------------------

    if (errors.length) {
      failedRows.push({
        rowNumber: index + 2,
        ...data,
        errors: errors.join(", "),
      });
    } else {
      validRows.push({
        rowNumber: index + 2,
        ...data,
      });
    }
  });

  return {
    validRows,
    failedRows,
  };
};