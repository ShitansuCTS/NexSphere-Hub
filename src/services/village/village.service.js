import { prisma } from "@/lib/prisma";

export const createVillageService = async (data) => {
    const gp = await prisma.gP.findUnique({
        where: {
            id: data.gpId,
        },
    });

    if (!gp) {
        throw new Error("GP_NOT_FOUND");
    }

    const existingVillage = await prisma.village.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            gpId: data.gpId,
        },
    });

    if (existingVillage) {
        throw new Error("VILLAGE_ALREADY_EXISTS");
    }

    const village = await prisma.village.create({
        data: {
            name: data.name.trim(),
            gpId: data.gpId,
        },
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
    });

    return village;
};

export const getVillagesService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const gpId = query.gpId?.trim();

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
        ...(gpId && {
            gpId,
        }),
    };

    const [villages, total] = await prisma.$transaction([
        prisma.village.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
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
        }),

        prisma.village.count({
            where,
        }),
    ]);

    return {
        data: villages,
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

export const getVillageByIdService = async (id) => {
    const village = await prisma.village.findUnique({
        where: {
            id,
        },
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
            wards: true,
        },
    });

    if (!village) {
        throw new Error("VILLAGE_NOT_FOUND");
    }

    return village;
};

export const updateVillageService = async (id, data) => {
    const village = await prisma.village.findUnique({
        where: {
            id,
        },
    });

    if (!village) {
        throw new Error("VILLAGE_NOT_FOUND");
    }

    const gp = await prisma.gP.findUnique({
        where: {
            id: data.gpId,
        },
    });

    if (!gp) {
        throw new Error("GP_NOT_FOUND");
    }

    const duplicateVillage = await prisma.village.findFirst({
        where: {
            id: {
                not: id,
            },
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            gpId: data.gpId,
        },
    });

    if (duplicateVillage) {
        throw new Error("VILLAGE_ALREADY_EXISTS");
    }

    const updatedVillage = await prisma.village.update({
        where: {
            id,
        },
        data: {
            name: data.name.trim(),
            gpId: data.gpId,
        },
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
    });

    return updatedVillage;
};

export const deleteVillageService = async (id) => {
    const village = await prisma.village.findUnique({
        where: {
            id,
        },
    });

    if (!village) {
        throw new Error("VILLAGE_NOT_FOUND");
    }

    const wardCount = await prisma.ward.count({
        where: {
            villageId: id,
        },
    });

    if (wardCount > 0) {
        throw new Error("VILLAGE_HAS_WARDS");
    }

    await prisma.village.delete({
        where: {
            id,
        },
    });

    return true;
};