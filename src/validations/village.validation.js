import { z } from "zod";

export const createVillageSchema = z.object({
    name: z.string().min(1, "Village name is required"),
    gpId: z.string().min(1, "GP ID is required"),
});

export const updateVillageSchema = z.object({
    name: z.string().min(1, "Village name is required"),
    gpId: z.string().min(1, "GP ID is required"),
});