import { prisma } from "@/lib/prisma";

const boothInclude = {
    ward: {
        include: {
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
        },
    },
};

export const createBoothService = async (data) => {
    const ward = await prisma.ward.findUnique({
        where: {
            id: data.wardId,
        },
    });

    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }

    const existingBooth = await prisma.booth.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            wardId: data.wardId,
        },
    });

    if (existingBooth) {
        throw new Error("BOOTH_ALREADY_EXISTS");
    }

    const booth = await prisma.booth.create({
        data: {
            name: data.name.trim(),
            wardId: data.wardId,
        },
        include: boothInclude,
    });

    return booth;
};

export const getBoothsService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const wardId = query.wardId?.trim();

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
        ...(wardId && {
            wardId,
        }),
    };

    const [booths, total] = await prisma.$transaction([
        prisma.booth.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: boothInclude,
        }),

        prisma.booth.count({
            where,
        }),
    ]);

    return {
        data: booths,
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

export const getBoothByIdService = async (id) => {
    const booth = await prisma.booth.findUnique({
        where: {
            id,
        },
        include: boothInclude,
    });

    if (!booth) {
        throw new Error("BOOTH_NOT_FOUND");
    }

    return booth;
};

export const updateBoothService = async (id, data) => {
    const booth = await prisma.booth.findUnique({
        where: {
            id,
        },
    });

    if (!booth) {
        throw new Error("BOOTH_NOT_FOUND");
    }

    const ward = await prisma.ward.findUnique({
        where: {
            id: data.wardId,
        },
    });

    if (!ward) {
        throw new Error("WARD_NOT_FOUND");
    }

    const duplicateBooth = await prisma.booth.findFirst({
        where: {
            id: {
                not: id,
            },
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            wardId: data.wardId,
        },
    });

    if (duplicateBooth) {
        throw new Error("BOOTH_ALREADY_EXISTS");
    }

    const updatedBooth = await prisma.booth.update({
        where: {
            id,
        },
        data: {
            name: data.name.trim(),
            wardId: data.wardId,
        },
        include: boothInclude,
    });

    return updatedBooth;
};

export const deleteBoothService = async (id) => {
    const booth = await prisma.booth.findUnique({
        where: {
            id,
        },
    });

    if (!booth) {
        throw new Error("BOOTH_NOT_FOUND");
    }

    const contactCount = await prisma.contact.count({
        where: {
            boothId: id,
        },
    });

    if (contactCount > 0) {
        throw new Error("BOOTH_HAS_CONTACTS");
    }

    await prisma.booth.delete({
        where: {
            id,
        },
    });

    return true;
};