import { prisma } from "@/lib/prisma";

export const createNacService = async (data) => {
    const district = await prisma.district.findUnique({
        where: {
            id: data.districtId,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    const existingNac = await prisma.nAC.findFirst({
        where: {
            name: {
                equals: data.name,
                mode: "insensitive",
            },
            districtId: data.districtId,
        },
    });

    if (existingNac) {
        throw new Error("NAC_ALREADY_EXISTS");
    }

    return prisma.nAC.create({
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
};

export const getNacsService = async (query) => {
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
        ...(districtId && { districtId }),
    };

    const [nacs, total] = await prisma.$transaction([
        prisma.nAC.findMany({
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

        prisma.nAC.count({
            where,
        }),
    ]);

    return {
        data: nacs,
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

export const getNacByIdService = async (id) => {
    const nac = await prisma.nAC.findUnique({
        where: {
            id,
        },
        include: {
            district: {
                include: {
                    state: true,
                },
            },
            wards: true,
        },
    });

    if (!nac) {
        throw new Error("NAC_NOT_FOUND");
    }

    return nac;
};

export const updateNacService = async (id, data) => {
    const nac = await prisma.nAC.findUnique({
        where: {
            id,
        },
    });

    if (!nac) {
        throw new Error("NAC_NOT_FOUND");
    }

    const district = await prisma.district.findUnique({
        where: {
            id: data.districtId,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    const duplicateNac = await prisma.nAC.findFirst({
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

    if (duplicateNac) {
        throw new Error("NAC_ALREADY_EXISTS");
    }

    return prisma.nAC.update({
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
};

export const deleteNacService = async (id) => {
    const nac = await prisma.nAC.findUnique({
        where: {
            id,
        },
    });

    if (!nac) {
        throw new Error("NAC_NOT_FOUND");
    }

    const wardCount = await prisma.ward.count({
        where: {
            nacId: id,
        },
    });

    if (wardCount > 0) {
        throw new Error("NAC_HAS_WARDS");
    }

    await prisma.nAC.delete({
        where: {
            id,
        },
    });

    return true;
};