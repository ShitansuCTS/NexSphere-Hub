import { ZodError } from "zod";

import {
    createBoothService,
    getBoothsService,
    getBoothByIdService,
    updateBoothService,
    deleteBoothService,
} from "@/services/booth/booth.service";

import {
    createBoothSchema,
    updateBoothSchema,
} from "@/validations/booth.validation";

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

export const createBoothController = async (body) => {
    try {
        const validatedData = createBoothSchema.parse(body);

        const booth = await createBoothService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "Booth created successfully",
                data: booth,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) return handleZodError(error);

        if (error.message === "WARD_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Ward not found",
                },
            };
        }

        if (error.message === "BOOTH_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Booth already exists in this ward",
                },
            };
        }

        throw error;
    }
};

export const getBoothsController = async (query) => {
    const result = await getBoothsService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "Booths fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };
};

export const getBoothByIdController = async (id) => {
    try {
        const booth = await getBoothByIdService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "Booth fetched successfully",
                data: booth,
            },
        };
    } catch (error) {
        if (error.message === "BOOTH_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Booth not found",
                },
            };
        }

        throw error;
    }
};

export const updateBoothController = async (id, body) => {
    try {
        const validatedData = updateBoothSchema.parse(body);

        const booth = await updateBoothService(id, validatedData);

        return {
            status: 200,
            data: {
                success: true,
                message: "Booth updated successfully",
                data: booth,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) return handleZodError(error);

        if (error.message === "BOOTH_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Booth not found",
                },
            };
        }

        if (error.message === "WARD_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Ward not found",
                },
            };
        }

        if (error.message === "BOOTH_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Booth already exists in this ward",
                },
            };
        }

        throw error;
    }
};

export const deleteBoothController = async (id) => {
    try {
        await deleteBoothService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "Booth deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "BOOTH_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Booth not found",
                },
            };
        }

        if (error.message === "BOOTH_HAS_CONTACTS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete booth because contacts are linked with this booth",
                },
            };
        }

        throw error;
    }
};