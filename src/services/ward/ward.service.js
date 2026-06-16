import { prisma } from "@/lib/prisma";

const wardInclude = {
    village: {
        include: {
            gp: {
                include: {
                    block: {
                        include: {
                            district: {
                                include: {
                                    state: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    nac: {
        include: {
            district: {
                include: {
                    state: true,
                },
            },
        },
    },
};

export const createWardService = async (data) => {
    if (data.villageId) {
        const village = await prisma.village.findUnique({
            where: { id: data.villageId },
        });

        if (!village) {
            throw new Error("VILLAGE_NOT_FOUND");
        }
    }

    if (data.nacId) {
        const nac = await prisma.nAC.findUnique({
            where: { id: data.nacId },
        });

        if (!nac) {
            throw new Error("NAC_NOT_FOUND");
        }
    }

    const existingWard = await prisma.ward.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            ...(data.villageId && {
                villageId: data.villageId,
            }),
            ...(data.nacId && {
                nacId: data.nacId,
            }),
        },
    });

    if (existingWard) {
        throw new Error("WARD_ALREADY_EXISTS");
    }

    const ward = await prisma.ward.create({
        data: {
            name: data.name.trim(),
            villageId: data.villageId || null,
            nacId: data.nacId || null,
        },
        include: wardInclude,
    });

    return ward;
};

export const getWardsService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const villageId = query.villageId?.trim();
    const nacId = query.nacId?.trim();

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
        ...(villageId && { villageId }),
        ...(nacId && { nacId }),
    };

    const [wards, total] = await prisma.$transaction([
        prisma.ward.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: wardInclude,
        }),

        prisma.ward.count({
            where,
        }),
    ]);

    return {
        data: wards,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    };
};

export const getWardByIdService = async (id) => {
    const ward = await prisma.ward.findUnique({
        where: { id },
        include: {
            ...wardInclude,
            booths: true,
        },
    });

    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }

    return ward;
};

export const updateWardService = async (id, data) => {
    const ward = await prisma.ward.findUnique({
        where: { id },
    });

    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }

    if (data.villageId) {
        const village = await prisma.village.findUnique({
            where: { id: data.villageId },
        });

        if (!village) {
            throw new Error("VILLAGE_NOT_FOUND");
        }
    }

    if (data.nacId) {
        const nac = await prisma.nAC.findUnique({
            where: { id: data.nacId },
        });

        if (!nac) {
            throw new Error("NAC_NOT_FOUND");
        }
    }

    const duplicateWard = await prisma.ward.findFirst({
        where: {
            id: {
                not: id,
            },
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            ...(data.villageId && {
                villageId: data.villageId,
            }),
            ...(data.nacId && {
                nacId: data.nacId,
            }),
        },
    });

    if (duplicateWard) {
        throw new Error("WARD_ALREADY_EXISTS");
    }

    const updatedWard = await prisma.ward.update({
        where: { id },
        data: {
            name: data.name.trim(),
            villageId: data.villageId || null,
            nacId: data.nacId || null,
        },
        include: wardInclude,
    });

    return updatedWard;
};

export const deleteWardService = async (id) => {
    const ward = await prisma.ward.findUnique({
        where: { id },
    });

    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }

    const boothCount = await prisma.booth.count({
        where: {
            wardId: id,
        },
    });

    if (boothCount > 0) {
        throw new Error("WARD_HAS_BOOTHS");
    }

    await prisma.ward.delete({
        where: { id },
    });

    return true;
};