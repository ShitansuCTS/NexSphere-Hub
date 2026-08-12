import { prisma } from "@/lib/prisma";

/**
 * Create Contact
 */
export const createContactStore = async (data) => {
  return prisma.contact.create({
    data,
    include: {
      block: true,
      nac: true,
      gp: true,
      village: true,
      ward: true,
      booth: true,
    },
  });
};

/**
 * Bulk Create
 */
export const createManyContactsStore = async (contacts) => {
  return prisma.contact.createMany({
    data: contacts,
    skipDuplicates: true,
  });
};

/**
 * Find Contact By Id
 */
export const getContactByIdStore = async (id) => {
  return prisma.contact.findUnique({
    where: { id },
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
      nac: {
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
        },
      },
    },
  });
};

/**
 * Find Contact By Mobile
 */
export const getContactByMobileStore = async (mobile) => {
  return prisma.contact.findFirst({
    where: {
      mobile,
    },
  });
};

/**
 * Update Contact
 */
export const updateContactStore = async (id, data) => {
  return prisma.contact.update({
    where: { id },
    data,
    include: {
      block: true,
      nac: true,
      gp: true,
      village: true,
      ward: true,
      booth: true,
    },
  });
};

/**
 * Update Contact Profile Picture
 */
export const updateContactProfilePictureStore = async (id, profilePicture) => {
  return prisma.contact.update({
    where: { id },
    data: { profilePicture },
    include: {
      block: true,
      nac: true,
      gp: true,
      village: true,
      ward: true,
      booth: true,
    },
  });
};

/**
 * Delete Contact
 */
export const deleteContactStore = async (id) => {
  return prisma.contact.delete({
    where: { id },
  });
};

/**
 * List Contacts
 */
import { buildContactWhere } from "@/store/contacts/contactFilters";

export const getContactsStore = async ({
  page = 1,
  limit = 10,
  search = "",
  stateId,
  districtId,
  blockId,
  nacId,
  gpId,
  villageId,
  wardId,
  boothId,
}) => {
  const skip = (page - 1) * limit;

  const where = buildContactWhere({
    search,
    stateId,
    districtId,
    blockId,
    nacId,
    gpId,
    villageId,
    wardId,
    boothId,
  });

  const [contacts, total] = await prisma.$transaction([
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        block: true,
        nac: true,
        gp: true,
        village: true,
        ward: true,
        booth: true,
      },
    }),

    prisma.contact.count({
      where,
    }),
  ]);

  return {
    contacts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Active Contacts
 */
export const getActiveContactsStore = async () => {
  return prisma.contact.findMany({
    where: {
      isActive: true,
    },
  });
};

/**
 * Bulk Delete
 */
export const bulkDeleteContactsStore = async (ids) => {
  return prisma.contact.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

/**
 * Count Contacts
 */
export const countContactsStore = async () => {
  return prisma.contact.count();
};