import { z } from "zod";

export const createDistrictSchema = z.object({
    name: z
        .string({
            required_error: "District name is required",
        })
        .trim()
        .min(
            2,
            "District name must be at least 2 characters"
        )
        .max(
            100,
            "District name must be less than 100 characters"
        ),


    stateId: z
        .string({
            required_error: "State is required",
        })
        .trim()
        .min(1, "State is required"),


});

export const updateDistrictSchema = z.object({
    name: z
        .string({
            required_error: "District name is required",
        })
        .trim()
        .min(
            2,
            "District name must be at least 2 characters"
        )
        .max(
            100,
            "District name must be less than 100 characters"
        ),


    stateId: z
        .string({
            required_error: "State is required",
        })
        .trim()
        .min(1, "State is required"),


});
