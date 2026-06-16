import { prisma } from "@/lib/prisma";

export const createDistrictService = async (data) => {
    const state = await prisma.state.findUnique({
        where: {
            id: data.stateId,
        },
    });

    if (!state) {
        throw new Error("STATE_NOT_FOUND");
    }

    const existingDistrict =
        await prisma.district.findFirst({
            where: {
                name: {
                    equals: data.name,
                    mode: "insensitive",
                },
                stateId: data.stateId,
            },
        });

    if (existingDistrict) {
        throw new Error("DISTRICT_ALREADY_EXISTS");
    }

    const district = await prisma.district.create({
        data: {
            name: data.name.trim(),
            stateId: data.stateId,
        },
        include: {
            state: true,
        },
    });

    return district;
};

export const getDistrictsService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const stateId = query.stateId?.trim();

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
        ...(stateId && {
            stateId,
        }),
    };

    const [districts, total] =
        await prisma.$transaction([
            prisma.district.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    state: true,
                },
            }),

            prisma.district.count({
                where,
            }),
        ]);

    return {
        data: districts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext:
                page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    };
};

export const getDistrictByIdService = async (id) => {
    const district = await prisma.district.findUnique({
        where: {
            id,
        },
        include: {
            state: true,
            blocks: true,
            nacs: true,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    return district;
};

export const updateDistrictService = async (
    id,
    data
) => {
    const district = await prisma.district.findUnique({
        where: {
            id,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    const state = await prisma.state.findUnique({
        where: {
            id: data.stateId,
        },
    });

    if (!state) {
        throw new Error("STATE_NOT_FOUND");
    }

    const duplicateDistrict =
        await prisma.district.findFirst({
            where: {
                id: {
                    not: id,
                },
                name: {
                    equals: data.name,
                    mode: "insensitive",
                },
                stateId: data.stateId,
            },
        });

    if (duplicateDistrict) {
        throw new Error("DISTRICT_ALREADY_EXISTS");
    }

    const updatedDistrict =
        await prisma.district.update({
            where: {
                id,
            },
            data: {
                name: data.name.trim(),
                stateId: data.stateId,
            },
            include: {
                state: true,
            },
        });

    return updatedDistrict;
};

export const deleteDistrictService = async (id) => {
    const district = await prisma.district.findUnique({
        where: {
            id,
        },
    });

    if (!district) {
        throw new Error("DISTRICT_NOT_FOUND");
    }

    const blockCount = await prisma.block.count({
        where: {
            districtId: id,
        },
    });

    const nacCount = await prisma.nAC.count({
        where: {
            districtId: id,
        },
    });

    if (blockCount > 0 || nacCount > 0) {
        throw new Error(
            "DISTRICT_HAS_BLOCKS_OR_NACS"
        );
    }

    await prisma.district.delete({
        where: {
            id,
        },
    });

    return true;
};