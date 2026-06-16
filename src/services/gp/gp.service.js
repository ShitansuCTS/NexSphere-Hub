import { prisma } from "@/lib/prisma";

export const createGPService = async (data) => {
    const block = await prisma.block.findUnique({
        where: {
            id: data.blockId,
        },
    });

    if (!block) {
        throw new Error("BLOCK_NOT_FOUND");
    }

    const existingGP = await prisma.gP.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            blockId: data.blockId,
        },
    });

    if (existingGP) {
        throw new Error("GP_ALREADY_EXISTS");
    }

    const gp = await prisma.gP.create({
        data: {
            name: data.name.trim(),
            blockId: data.blockId,
        },
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
    });

    return gp;
};

export const getGPsService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const blockId = query.blockId?.trim();

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
        ...(blockId && {
            blockId,
        }),
    };

    const [gps, total] = await prisma.$transaction([
        prisma.gP.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
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
        }),

        prisma.gP.count({
            where,
        }),
    ]);

    return {
        data: gps,
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

export const getGPByIdService = async (id) => {
    const gp = await prisma.gP.findUnique({
        where: {
            id,
        },
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
            villages: true,
        },
    });

    if (!gp) {
        throw new Error("GP_NOT_FOUND");
    }

    return gp;
};

export const updateGPService = async (id, data) => {
    const gp = await prisma.gP.findUnique({
        where: {
            id,
        },
    });

    if (!gp) {
        throw new Error("GP_NOT_FOUND");
    }

    const block = await prisma.block.findUnique({
        where: {
            id: data.blockId,
        },
    });

    if (!block) {
        throw new Error("BLOCK_NOT_FOUND");
    }

    const duplicateGP = await prisma.gP.findFirst({
        where: {
            id: {
                not: id,
            },
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            blockId: data.blockId,
        },
    });

    if (duplicateGP) {
        throw new Error("GP_ALREADY_EXISTS");
    }

    const updatedGP = await prisma.gP.update({
        where: {
            id,
        },
        data: {
            name: data.name.trim(),
            blockId: data.blockId,
        },
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
    });

    return updatedGP;
};

export const deleteGPService = async (id) => {
    const gp = await prisma.gP.findUnique({
        where: {
            id,
        },
    });

    if (!gp) {
        throw new Error("GP_NOT_FOUND");
    }

    const villageCount = await prisma.village.count({
        where: {
            gpId: id,
        },
    });

    if (villageCount > 0) {
        throw new Error("GP_HAS_VILLAGES");
    }

    await prisma.gP.delete({
        where: {
            id,
        },
    });

    return true;
};