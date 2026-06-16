import { z } from "zod";

export const createNacSchema = z.object({
    name: z
        .string({
            required_error: "NAC name is required",
        })
        .trim()
        .min(2, "NAC name must be at least 2 characters")
        .max(100, "NAC name must be less than 100 characters"),

    districtId: z
        .string({
            required_error: "District is required",
        })
        .trim()
        .min(1, "District is required"),
});

export const updateNacSchema = z.object({
    name: z
        .string({
            required_error: "NAC name is required",
        })
        .trim()
        .min(2, "NAC name must be at least 2 characters")
        .max(100, "NAC name must be less than 100 characters"),

    districtId: z
        .string({
            required_error: "District is required",
        })
        .trim()
        .min(1, "District is required"),
});