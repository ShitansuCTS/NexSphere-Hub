import { ZodError } from "zod";

import {
    createWardService,
    getWardsService,
    getWardByIdService,
    updateWardService,
    deleteWardService,
} from "@/services/ward/ward.service";

import {
    createWardSchema,
    updateWardSchema,
} from "@/validations/ward.validation";

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

export const createWardController = async (body) => {
    try {
        const validatedData = createWardSchema.parse(body);

        const ward = await createWardService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "Ward created successfully",
                data: ward,
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

        if (error.message === "NAC_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "NAC not found",
                },
            };
        }

        if (error.message === "WARD_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Ward already exists",
                },
            };
        }

        throw error;
    }
};

export const getWardsController = async (query) => {
    const result = await getWardsService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "Wards fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };
};

export const getWardByIdController = async (id) => {
    try {
        const ward = await getWardByIdService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "Ward fetched successfully",
                data: ward,
            },
        };
    } catch (error) {
        if (error.message === "WARD_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Ward not found",
                },
            };
        }

        throw error;
    }
};

export const updateWardController = async (id, body) => {
    try {
        const validatedData = updateWardSchema.parse(body);

        const ward = await updateWardService(id, validatedData);

        return {
            status: 200,
            data: {
                success: true,
                message: "Ward updated successfully",
                data: ward,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
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

        if (error.message === "VILLAGE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Village not found",
                },
            };
        }

        if (error.message === "NAC_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "NAC not found",
                },
            };
        }

        if (error.message === "WARD_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Ward already exists",
                },
            };
        }

        throw error;
    }
};

export const deleteWardController = async (id) => {
    try {
        await deleteWardService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "Ward deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "WARD_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Ward not found",
                },
            };
        }

        if (error.message === "WARD_HAS_BOOTHS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete ward because booth records are linked with this ward",
                },
            };
        }

        if (error.message === "WARD_HAS_CONTACTS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete ward because contacts are linked with this ward",
                },
            };
        }

        throw error;
    }
};