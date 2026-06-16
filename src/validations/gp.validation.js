import { z } from "zod";

export const createGPSchema = z.object({
    name: z.string().min(1, "GP name is required"),
    blockId: z.string().min(1, "Block ID is required"),
});

export const updateGPSchema = z.object({
    name: z.string().min(1, "GP name is required"),
    blockId: z.string().min(1, "Block ID is required"),
});