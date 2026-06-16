import { prisma } from "@/lib/prisma";

export const createBlockService = async (data) => {
    const district = await prisma.district.findUnique({
        where: {
            id: data.districtId,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    const existingBlock = await prisma.block.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            districtId: data.districtId,
        },
    });

    if (existingBlock) {
        throw new Error("BLOCK_ALREADY_EXISTS");
    }

    const block = await prisma.block.create({
        data: {
            name: data.name.trim(),
            districtId: data.districtId,
        },
        include: {
            district: {
                include: {
                    state: true,
                },
            },
        },
    });

    return block;
};

export const getBlocksService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const districtId = query.districtId?.trim();

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
        ...(districtId && {
            districtId,
        }),
    };

    const [blocks, total] = await prisma.$transaction([
        prisma.block.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                district: {
                    include: {
                        state: true,
                    },
                },
            },
        }),

        prisma.block.count({
            where,
        }),
    ]);

    return {
        data: blocks,
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

export const getBlockByIdService = async (id) => {
    const block = await prisma.block.findUnique({
        where: {
            id,
        },
        include: {
            district: {
                include: {
                    state: true,
                },
            },
            gps: true,
        },
    });

    if (!block) {
        throw new Error("BLOCK_NOT_FOUND");
    }

    return block;
};

export const updateBlockService = async (id, data) => {
    const block = await prisma.block.findUnique({
        where: {
            id,
        },
    });

    if (!block) {
        throw new Error("BLOCK_NOT_FOUND");
    }

    const district = await prisma.district.findUnique({
        where: {
            id: data.districtId,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    const duplicateBlock = await prisma.block.findFirst({
        where: {
            id: {
                not: id,
            },
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            districtId: data.districtId,
        },
    });

    if (duplicateBlock) {
        throw new Error("BLOCK_ALREADY_EXISTS");
    }

    const updatedBlock = await prisma.block.update({
        where: {
            id,
        },
        data: {
            name: data.name.trim(),
            districtId: data.districtId,
        },
        include: {
            district: {
                include: {
                    state: true,
                },
            },
        },
    });

    return updatedBlock;
};

export const deleteBlockService = async (id) => {
    const block = await prisma.block.findUnique({
        where: {
            id,
        },
    });

    if (!block) {
        throw new Error("BLOCK_NOT_FOUND");
    }

    const gpCount = await prisma.gP.count({
        where: {
            blockId: id,
        },
    });

    if (gpCount > 0) {
        throw new Error("BLOCK_HAS_GPS");
    }

    await prisma.block.delete({
        where: {
            id,
        },
    });

    return true;
};