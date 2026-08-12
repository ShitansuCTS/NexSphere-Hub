import { ZodError } from "zod";

import {
    createGPService,
    getGPsService,
    getGPByIdService,
    updateGPService,
    deleteGPService,
} from "@/services/gp/gp.service";

import {
    createGPSchema,
    updateGPSchema,
} from "@/validations/gp.validation";

const handleZodError = (error) => {
    return {
        status: 400,
        data: {
            success: false,
            message: "Validation failed",
            errors: error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            })),
        },
    };
};

export const createGPController = async (body) => {
    try {
        const validatedData = createGPSchema.parse(body);

        const gp = await createGPService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "GP created successfully",
                data: gp,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
        }

        if (error.message === "BLOCK_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Block not found",
                },
            };
        }

        if (error.message === "GP_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "GP already exists in this block",
                },
            };
        }

        throw error;
    }
};

export const getGPsController = async (query) => {
    const result = await getGPsService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "GPs fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };
};

export const getGPByIdController = async (id) => {
    try {
        const gp = await getGPByIdService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "GP fetched successfully",
                data: gp,
            },
        };
    } catch (error) {
        if (error.message === "GP_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "GP not found",
                },
            };
        }

        throw error;
    }
};

export const updateGPController = async (id, body) => {
    try {
        const validatedData = updateGPSchema.parse(body);

        const gp = await updateGPService(id, validatedData);

        return {
            status: 200,
            data: {
                success: true,
                message: "GP updated successfully",
                data: gp,
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

        if (error.message === "BLOCK_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Block not found",
                },
            };
        }

        if (error.message === "GP_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "GP already exists in this block",
                },
            };
        }

        throw error;
    }
};

export const deleteGPController = async (id) => {
    try {
        await deleteGPService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "GP deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "GP_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "GP not found",
                },
            };
        }

        if (error.message === "GP_HAS_VILLAGES") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete GP because village records are linked with this GP",
                },
            };
        }

        throw error;
    }
};