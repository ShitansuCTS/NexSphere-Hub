export function buildContactWhere(filters = {}) {
    const {
        search,
        stateId,
        districtId,
        blockId,
        nacId,
        gpId,
        villageId,
        wardId,
        boothId,
    } = filters;

    const and = [];
    const term = search?.trim();

    if (term) {
        and.push({
            OR: [
                { name: { contains: term, mode: "insensitive" } },
                { mobile: { contains: term } },
                { email: { contains: term, mode: "insensitive" } },
                { designation: { contains: term, mode: "insensitive" } },
            ],
        });
    }

    if (boothId) {
        and.push({ boothId });
    } else if (wardId) {
        and.push({ wardId });
    } else if (villageId) {
        and.push({ villageId });
    } else if (gpId) {
        and.push({ gpId });
    } else if (blockId) {
        and.push({ blockId });
    } else if (nacId) {
        and.push({ nacId });
    } else if (districtId) {
        and.push({
            OR: [
                { block: { districtId } },
                { nac: { districtId } },
                { gp: { block: { districtId } } },
                { village: { gp: { block: { districtId } } } },
                {
                    ward: {
                        OR: [
                            { village: { gp: { block: { districtId } } } },
                            { nac: { districtId } },
                        ],
                    },
                },
                {
                    booth: {
                        ward: {
                            OR: [
                                { village: { gp: { block: { districtId } } } },
                                { nac: { districtId } },
                            ],
                        },
                    },
                },
            ],
        });
    } else if (stateId) {
        and.push({
            OR: [
                { block: { district: { stateId } } },
                { nac: { district: { stateId } } },
                { gp: { block: { district: { stateId } } } },
                { village: { gp: { block: { district: { stateId } } } } },
                {
                    ward: {
                        OR: [
                            { village: { gp: { block: { district: { stateId } } } } },
                            { nac: { district: { stateId } } },
                        ],
                    },
                },
                {
                    booth: {
                        ward: {
                            OR: [
                                { village: { gp: { block: { district: { stateId } } } } },
                                { nac: { district: { stateId } } },
                            ],
                        },
                    },
                },
            ],
        });
    }

    if (!and.length) {
        return {};
    }

    return { AND: and };
}
