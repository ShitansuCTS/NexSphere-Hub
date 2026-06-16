import { ZodError } from "zod";

import {
    createVillageService,
    getVillagesService,
    getVillageByIdService,
    updateVillageService,
    deleteVillageService,
} from "@/services/village/village.service";

import {
    createVillageSchema,
    updateVillageSchema,
} from "@/validations/village.validation";

const handleZodError = (error) => {
    return {
        status: 400,
        data: {
            success: false,
            message: "Validation failed",
            errors: error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            })),
        },
    };
};

export const createVillageController = async (body) => {
    try {
        const validatedData = createVillageSchema.parse(body);

        const village = await createVillageService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "Village created successfully",
                data: village,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
        }

        if (error.message === "GP_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "GP not found",
                },
            };
        }

        if (error.message === "VILLAGE_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Village already exists in this GP",
                },
            };
        }

        throw error;
    }
};

export const getVillagesController = async (query) => {
    const result = await getVillagesService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "Villages fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };
};

export const getVillageByIdController = async (id) => {
    try {
        const village = await getVillageByIdService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "Village fetched successfully",
                data: village,
            },
        };
    } catch (error) {
        if (error.message === "VILLAGE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Village not found",
                },
            };
        }

        throw error;
    }
};

export const updateVillageController = async (id, body) => {
    try {
        const validatedData = updateVillageSchema.parse(body);

        const village = await updateVillageService(id, validatedData);

        return {
            status: 200,
            data: {
                success: true,
                message: "Village updated successfully",
                data: village,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
        }

        if (error.message === "VILLAGE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Village not found",
                },
            };
        }

        if (error.message === "GP_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "GP not found",
                },
            };
        }

        if (error.message === "VILLAGE_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Village already exists in this GP",
                },
            };
        }

        throw error;
    }
};

export const deleteVillageController = async (id) => {
    try {
        await deleteVillageService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "Village deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "VILLAGE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Village not found",
                },
            };
        }

        if (error.message === "VILLAGE_HAS_WARDS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete village because ward records are linked with this village",
                },
            };
        }

        throw error;
    }
};