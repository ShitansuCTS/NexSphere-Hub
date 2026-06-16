import { z } from "zod";

export const createStateSchema = z.object({
    name: z
        .string({
            required_error: "State name is required",
        })
        .trim()
        .min(2, "State name must be at least 2 characters")
        .max(100, "State name must be less than 100 characters"),
});

export const updateStateSchema = z.object({
    name: z
        .string({
            required_error: "State name is required",
        })
        .trim()
        .min(2, "State name must be at least 2 characters")
        .max(100, "State name must be less than 100 characters"),
});