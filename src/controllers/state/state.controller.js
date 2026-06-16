import { ZodError } from "zod";

import {
    createStateService,
    getStatesService,
    getStateByIdService,
    updateStateService,
    deleteStateService,
} from "@/services/state/state.service";

import {
    createStateSchema,
    updateStateSchema,
} from "@/validations/state.validation";

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

export const createStateController = async (body) => {
    try {
        const validatedData =
            createStateSchema.parse(body);

        const state =
            await createStateService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "State created successfully",
                data: state,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error);
        }

        if (error.message === "STATE_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "State already exists",
                },
            };
        }

        throw error;
    }
};

export const getStatesController = async (query) => {
    const result = await getStatesService(query);

    return {
        status: 200,
        data: {
            success: true,
            message: "States fetched successfully",
            ...result,
        },
    };
};

export const getStateByIdController = async (id) => {
    try {
        const state = await getStateByIdService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "State fetched successfully",
                data: state,
            },
        };
    } catch (error) {
        if (error.message === "STATE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "State not found",
                },
            };
        }

        throw error;
    }
};

export const updateStateController = async (id, body) => {
    try {
        const validatedData =
            updateStateSchema.parse(body);

        const state =
            await updateStateService(id, validatedData);

        return {
            status: 200,
            data: {
                success: true,
                message: "State updated successfully",
                data: state,
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

        if (error.message === "STATE_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "State already exists",
                },
            };
        }

        throw error;
    }
};

export const deleteStateController = async (id) => {
    try {
        await deleteStateService(id);

        return {
            status: 200,
            data: {
                success: true,
                message: "State deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "STATE_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "State not found",
                },
            };
        }

        if (error.message === "STATE_HAS_DISTRICTS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete state because districts are already linked with this state",
                },
            };
        }

        throw error;
    }
};