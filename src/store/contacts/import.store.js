import { prisma } from "@/lib/prisma";

/**
 * Create Import Job
 */
export const createImportStore = async (data) => {
  return prisma.contactImport.create({
    data,
  });
};

/**
 * Update Import Job
 */
export const updateImportStore = async (
  id,
  data
) => {
  return prisma.contactImport.update({
    where: {
      id,
    },
    data,
  });
};

/**
 * Save Import Errors
 */
export const createImportErrorsStore =
  async (errors) => {

    if (!errors.length) return;

    return prisma.contactImportError.createMany({
      data: errors,
    });

  };

/**
 * Get Import
 */
export const getImportStore = async (id) => {

  return prisma.contactImport.findUnique({

    where: {
      id,
    },

    include: {

      errors: true,

      contacts: true,

    },

  });

};

/**
 * List Imports
 */
export const listImportsStore =
  async ({
    page,
    limit,
  }) => {

    const skip =
      (page - 1) * limit;

    const [imports, total] =
      await prisma.$transaction([

        prisma.contactImport.findMany({

          skip,

          take: limit,

          orderBy: {

            createdAt: "desc",

          },

        }),

        prisma.contactImport.count(),

      ]);

    return {

      imports,

      total,

    };

  };