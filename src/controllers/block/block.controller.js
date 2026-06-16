import { ZodError } from "zod";

import {
    createBlockService,
    getBlocksService,
    getBlockByIdService,
    updateBlockService,
    deleteBlockService,
} from "@/services/block/block.service";

import {
    createBlockSchema,
    updateBlockSchema,
} from "@/validations/block.validation";

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

export const createBlockController = async (body) => {
    try {
        const validatedData =
            createBlockSchema.parse(body);


        const block =
            await createBlockService(validatedData);

        return {
            status: 201,
            data: {
                success: true,
                message: "Block created successfully",
                data: block,
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

        if (error.message === "BLOCK_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message:
                        "Block already exists in this district",
                },
            };
        }

        throw error;
    }


};

export const getBlocksController = async (query) => {
    const result = await getBlocksService(query);


    return {
        status: 200,
        data: {
            success: true,
            message: "Blocks fetched successfully",
            data: result.data,
            pagination: result.pagination,
        },
    };


};

export const getBlockByIdController = async (id) => {
    try {
        const block =
            await getBlockByIdService(id);


        return {
            status: 200,
            data: {
                success: true,
                message: "Block fetched successfully",
                data: block,
            },
        };
    } catch (error) {
        if (error.message === "BLOCK_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Block not found",
                },
            };
        }

        throw error;
    }


};

export const updateBlockController = async (
    id,
    body
) => {
    try {
        const validatedData =
            updateBlockSchema.parse(body);


        const block =
            await updateBlockService(
                id,
                validatedData
            );

        return {
            status: 200,
            data: {
                success: true,
                message: "Block updated successfully",
                data: block,
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

        if (error.message === "DISTRICT_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "District not found",
                },
            };
        }

        if (error.message === "BLOCK_ALREADY_EXISTS") {
            return {
                status: 409,
                data: {
                    success: false,
                    message:
                        "Block already exists in this district",
                },
            };
        }

        throw error;
    }


};

export const deleteBlockController = async (id) => {
    try {
        await deleteBlockService(id);


        return {
            status: 200,
            data: {
                success: true,
                message: "Block deleted successfully",
            },
        };
    } catch (error) {
        if (error.message === "BLOCK_NOT_FOUND") {
            return {
                status: 404,
                data: {
                    success: false,
                    message: "Block not found",
                },
            };
        }

        if (error.message === "BLOCK_HAS_GPS") {
            return {
                status: 400,
                data: {
                    success: false,
                    message:
                        "Cannot delete block because GP records are linked with this block",
                },
            };
        }

        throw error;
    }


};
