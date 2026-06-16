import { ZodError } from "zod";

import {
    createDistrictService,
    getDistrictsService,
    getDistrictByIdService,
    updateDistrictService,
    deleteDistrictService,
} from "@/services/district/district.service";

import {
    createDistrictSchema,
    updateDistrictSchema,
} from "@/validations/district.validation";

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

export const createDistrictController = async (body) => {
    try {
        const validatedData =
            createDistrictSchema.parse(body);

        const district =
            await createDistrictService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "District created successfully",
                data: district,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
        }

        if (error.message === "STATE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "State not found",
                },
            };
        }

        if (error.message === "DISTRICT_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "District already exists in this state",
                },
            };
        }

        throw error;
    }
};

export const getDistrictsController = async (query) => {
    const result = await getDistrictsService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "Districts fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };
};

export const getDistrictByIdController = async (id) => {
    try {
        const district =
            await getDistrictByIdService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "District fetched successfully",
                data: district,
            },
        };
    } catch (error) {
        if (error.message === "DISTRICT_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "District not found",
                },
            };
        }

        throw error;
    }
};

export const updateDistrictController = async (
    id,
    body
) => {
    try {
        const validatedData =
            updateDistrictSchema.parse(body);

        const district =
            await updateDistrictService(
                id,
                validatedData
            );

        return {
            status: 200,
            data: {
                success: true,
                message: "District updated successfully",
                data: district,
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

        if (error.message === "STATE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "State not found",
                },
            };
        }

        if (error.message === "DISTRICT_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "District already exists in this state",
                },
            };
        }

        throw error;
    }
};

export const deleteDistrictController = async (id) => {
    try {
        await deleteDistrictService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "District deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "DISTRICT_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "District not found",
                },
            };
        }

        if (error.message === "DISTRICT_HAS_BLOCKS_OR_NACS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete district because blocks or NACs are already linked with this district",
                },
            };
        }

        throw error;
    }
};