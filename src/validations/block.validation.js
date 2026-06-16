import { z } from "zod";

export const createBlockSchema = z.object({
    name: z
        .string({
            required_error: "Block name is required",
        })
        .trim()
        .min(2, "Block name must be at least 2 characters")
        .max(100, "Block name must be less than 100 characters"),

    districtId: z
        .string({
            required_error: "District is required",
        })
        .trim()
        .min(1, "District is required"),
});

export const updateBlockSchema = z.object({
    name: z
        .string({
            required_error: "Block name is required",
        })
        .trim()
        .min(2, "Block name must be at least 2 characters")
        .max(100, "Block name must be less than 100 characters"),

    districtId: z
        .string({
            required_error: "District is required",
        })
        .trim()
        .min(1, "District is required"),
});