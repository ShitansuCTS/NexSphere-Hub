import { prisma } from "@/lib/prisma";

export const createStateService = async (data) => {
    const existingState =
        await prisma.state.findFirst({
            where: {
                name: {
                    equals: data.name,
                    mode: "insensitive",
                },
            },
        });

    if (existingState) {
        throw new Error("STATE_ALREADY_EXISTS");
    }

    const state = await prisma.state.create({
        data: {
            name: data.name.trim(),
        },
    });

    return state;
};

export const getStatesService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where = search
        ? {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }
        : {};

    const [states, total] =
        await prisma.$transaction([
            prisma.state.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),

            prisma.state.count({
                where,
            }),
        ]);

    return {
        data: states,
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

export const getStateByIdService = async (id) => {
    const state = await prisma.state.findUnique({
        where: {
            id,
        },
    });

    if (!state) {
        throw new Error("STATE_NOT_FOUND");
    }

    return state;
};

export const updateStateService = async (
    id,
    data
) => {
    const existingState =
        await prisma.state.findUnique({
            where: {
                id,
            },
        });

    if (!existingState) {
        throw new Error("STATE_NOT_FOUND");
    }

    const duplicateState =
        await prisma.state.findFirst({
            where: {
                id: {
                    not: id,
                },
                name: {
                    equals: data.name,
                    mode: "insensitive",
                },
            },
        });

    if (duplicateState) {
        throw new Error("STATE_ALREADY_EXISTS");
    }

    const updatedState =
        await prisma.state.update({
            where: {
                id,
            },
            data: {
                name: data.name.trim(),
            },
        });

    return updatedState;
};

export const deleteStateService = async (id) => {
    const state = await prisma.state.findUnique({
        where: {
            id,
        },
    });

    if (!state) {
        throw new Error("STATE_NOT_FOUND");
    }

    const districtCount =
        await prisma.district.count({
            where: {
                stateId: id,
            },
        });

    if (districtCount > 0) {
        throw new Error("STATE_HAS_DISTRICTS");
    }

    await prisma.state.delete({
        where: {
            id,
        },
    });

    return true;
};