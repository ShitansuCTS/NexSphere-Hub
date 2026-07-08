import { z } from "zod";

export const contactImportLocationSchema = z.object({
    locationType: z.enum(["rural", "urban"], {
        message: "Location type must be rural or urban",
    }),

    nacId: z.string().optional().nullable(),

    blockId: z.string().optional().nullable(),
    gpId: z.string().optional().nullable(),
    villageId: z.string().optional().nullable(),

    wardId: z.string().optional().nullable(),
    boothId: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.locationType === "urban" && !data.nacId) {
        ctx.addIssue({
            code: "custom",
            path: ["nacId"],
            message: "NAC is required for urban import",
        });
    }

    if (data.locationType === "rural" && !data.blockId) {
        ctx.addIssue({
            code: "custom",
            path: ["blockId"],
            message: "Block is required for rural import",
        });
    }
});



export const confirmContactImportSchema = z.object({
    rows: z
        .array(
            z.object({
                name: z.string().min(1, "Name is required"),
                mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

                alternateMobile: z.string().optional().nullable(),
                email: z.string().email("Invalid email").optional().nullable(),
                designation: z.string().optional().nullable(),
                address: z.string().optional().nullable(),

                nacId: z.string().optional().nullable(),
                blockId: z.string().optional().nullable(),
                gpId: z.string().optional().nullable(),
                villageId: z.string().optional().nullable(),
                wardId: z.string().optional().nullable(),
                boothId: z.string().optional().nullable(),
            })
        )
        .min(1, "At least one contact row is required"),
});