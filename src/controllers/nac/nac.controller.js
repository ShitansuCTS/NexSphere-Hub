import { ZodError } from "zod";

import {
    createNacService,
    getNacsService,
    getNacByIdService,
    updateNacService,
    deleteNacService,
} from "@/services/nac/nac.service";

import {
    createNacSchema,
    updateNacSchema,
} from "@/validations/nac.validation";

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

export const createNacController = async (body) => {
    try {
        const validatedData =
            createNacSchema.parse(body);


        const nac =
            await createNacService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "NAC created successfully",
                data: nac,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
        }

        if (error.message === "DISTRICT_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "District not found",
                },
            };
        }

        if (error.message === "NAC_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message:
                        "NAC already exists in this district",
                },
            };
        }

        throw error;
    }


};

export const getNacsController = async (query) => {
    const result = await getNacsService(query);


    return {
        status: 200,
        data: {
            success: true,
            message: "NACs fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };


};

export const getNacByIdController = async (id) => {
    try {
        const nac =
            await getNacByIdService(id);


        return {
            status: 200,
            data: {
                success: true,
                message: "NAC fetched successfully",
                data: nac,
            },
        };
    } catch (error) {
        if (error.message === "NAC_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "NAC not found",
                },
            };
        }

        throw error;
    }


};

export const updateNacController = async (
    id,
    body
) => {
    try {
        const validatedData =
            updateNacSchema.parse(body);


        const nac =
            await updateNacService(
                id,
                validatedData
            );

        return {
            status: 200,
            data: {
                success: true,
                message: "NAC updated successfully",
                data: nac,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
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

        if (error.message === "DISTRICT_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "District not found",
                },
            };
        }

        if (error.message === "NAC_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message:
                        "NAC already exists in this district",
                },
            };
        }

        throw error;
    }


};

export const deleteNacController = async (id) => {
    try {
        await deleteNacService(id);


        return {
            status: 200,
            data: {
                success: true,
                message: "NAC deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "NAC_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "NAC not found",
                },
            };
        }

        if (error.message === "NAC_HAS_WARDS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete NAC because wards are linked with this NAC",
                },
            };
        }

        throw error;
    }


};
