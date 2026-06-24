import { prisma } from "@/lib/prisma";

const contactInclude = {
    nac: {
        include: {
            district: {
                include: {
                    state: true,
                },
            },
        },
    },
    block: {
        include: {
            district: {
                include: {
                    state: true,
                },
            },
        },
    },
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
    booth: {
        include: {
            ward: true,
        },
    },
};

export const createContactService = async (data) => {
    if (data.nacId) {
        const nac = await prisma.nAC.findUnique({
            where: { id: data.nacId },
        });

        if (!nac) {
            throw new Error("NAC_NOT_FOUND");
        }
    }

    if (data.blockId) {
        const block = await prisma.block.findUnique({
            where: { id: data.blockId },
        });

        if (!block) {
            throw new Error("BLOCK_NOT_FOUND");
        }
    }

    if (data.gpId) {
        const gp = await prisma.gP.findUnique({
            where: { id: data.gpId },
        });

        if (!gp) {
            throw new Error("GP_NOT_FOUND");
        }
    }

    if (data.villageId) {
        const village = await prisma.village.findUnique({
            where: { id: data.villageId },
        });

        if (!village) {
            throw new Error("VILLAGE_NOT_FOUND");
        }
    }

    if (data.wardId) {
        const ward = await prisma.ward.findUnique({
            where: { id: data.wardId },
        });

        if (!ward) {
            throw new Error("WARD_NOT_FOUND");
        }
    }

    if (data.boothId) {
        const booth = await prisma.booth.findUnique({
            where: { id: data.boothId },
        });

        if (!booth) {
            throw new Error("BOOTH_NOT_FOUND");
        }
    }

    const existingContact = await prisma.contact.findFirst({
        where: {
            mobile: data.mobile,
            ...(data.wardId && {
                wardId: data.wardId,
            }),
            ...(data.boothId && {
                boothId: data.boothId,
            }),
        },
    });

    if (existingContact) {
        throw new Error("CONTACT_ALREADY_EXISTS");
    }

    const contact = await prisma.contact.create({
        data: {
            name: data.name.trim(),
            mobile: data.mobile.trim(),
            alternateMobile: data.alternateMobile || null,
            email: data.email || null,
            designation: data.designation || null,
            address: data.address || null,

            nacId: data.nacId || null,
            blockId: data.blockId || null,
            gpId: data.gpId || null,
            villageId: data.villageId || null,
            wardId: data.wardId || null,
            boothId: data.boothId || null,
        },
        include: contactInclude,
    });

    return contact;
};

export const getContactsService = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();
    const nacId = query.nacId?.trim();
    const blockId = query.blockId?.trim();
    const gpId = query.gpId?.trim();
    const villageId = query.villageId?.trim();
    const wardId = query.wardId?.trim();
    const boothId = query.boothId?.trim();

    const where = {
        isActive: true,

        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    mobile: {
                        contains: search,
                    },
                },
                {
                    designation: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        }),

        ...(nacId && { nacId }),
        ...(blockId && { blockId }),
        ...(gpId && { gpId }),
        ...(villageId && { villageId }),
        ...(wardId && { wardId }),
        ...(boothId && { boothId }),
    };

    const [contacts, total] = await prisma.$transaction([
        prisma.contact.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: contactInclude,
        }),

        prisma.contact.count({
            where,
        }),
    ]);

    return {
        data: contacts,
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

export const getContactByIdService = async (id) => {
    const contact = await prisma.contact.findUnique({
        where: { id },
        include: contactInclude,
    });

    if (!contact || !contact.isActive) {
        throw new Error("CONTACT_NOT_FOUND");
    }

    return contact;
};

export const updateContactService = async (id, data) => {
    const contact = await prisma.contact.findUnique({
        where: { id },
    });

    if (!contact || !contact.isActive) {
        throw new Error("CONTACT_NOT_FOUND");
    }

    if (data.nacId) {
        const nac = await prisma.nAC.findUnique({
            where: { id: data.nacId },
        });

        if (!nac) {
            throw new Error("NAC_NOT_FOUND");
        }
    }

    if (data.blockId) {
        const block = await prisma.block.findUnique({
            where: { id: data.blockId },
        });

        if (!block) {
            throw new Error("BLOCK_NOT_FOUND");
        }
    }

    if (data.gpId) {
        const gp = await prisma.gP.findUnique({
            where: { id: data.gpId },
        });

        if (!gp) {
            throw new Error("GP_NOT_FOUND");
        }
    }

    if (data.villageId) {
        const village = await prisma.village.findUnique({
            where: { id: data.villageId },
        });

        if (!village) {
            throw new Error("VILLAGE_NOT_FOUND");
        }
    }

    if (data.wardId) {
        const ward = await prisma.ward.findUnique({
            where: { id: data.wardId },
        });

        if (!ward) {
            throw new Error("WARD_NOT_FOUND");
        }
    }

    if (data.boothId) {
        const booth = await prisma.booth.findUnique({
            where: { id: data.boothId },
        });

        if (!booth) {
            throw new Error("BOOTH_NOT_FOUND");
        }
    }

    const duplicateContact = await prisma.contact.findFirst({
        where: {
            id: {
                not: id,
            },
            mobile: data.mobile,
            ...(data.wardId && {
                wardId: data.wardId,
            }),
            ...(data.boothId && {
                boothId: data.boothId,
            }),
        },
    });

    if (duplicateContact) {
        throw new Error("CONTACT_ALREADY_EXISTS");
    }

    const updatedContact = await prisma.contact.update({
        where: { id },
        data: {
            name: data.name?.trim(),
            mobile: data.mobile?.trim(),
            alternateMobile: data.alternateMobile || null,
            email: data.email || null,
            designation: data.designation || null,
            address: data.address || null,

            nacId: data.nacId || null,
            blockId: data.blockId || null,
            gpId: data.gpId || null,
            villageId: data.villageId || null,
            wardId: data.wardId || null,
            boothId: data.boothId || null,
        },
        include: contactInclude,
    });

    return updatedContact;
};

export const deleteContactService = async (id) => {
    const contact = await prisma.contact.findUnique({
        where: { id },
    });

    if (!contact || !contact.isActive) {
        throw new Error("CONTACT_NOT_FOUND");
    }

    await prisma.contact.update({
        where: { id },
        data: {
            isActive: false,
        },
    });

    return true;
};