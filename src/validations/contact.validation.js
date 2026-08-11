import { z } from "zod";

export const createContactSchema = z.object({
    name: z
        .string({
            required_error: "Contact name is required",
        })
        .trim()
        .min(2, "Contact name must be at least 2 characters")
        .max(100, "Contact name must be less than 100 characters"),

    mobile: z
        .string({
            required_error: "Mobile number is required",
        })
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

    alternateMobile: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid alternate mobile number")
        .optional()
        .or(z.literal("")),

    email: z
        .string()
        .trim()
        .email("Enter a valid email address")
        .optional()
        .or(z.literal("")),

    designation: z
        .string()
        .trim()
        .max(100, "Designation must be less than 100 characters")
        .optional()
        .or(z.literal("")),

    address: z
        .string()
        .trim()
        .max(500, "Address must be less than 500 characters")
        .optional()
        .or(z.literal("")),

    wardId: z
        .string({
            required_error: "Ward is required",
        })
        .trim()
        .min(1, "Ward is required"),
    boothId: z
        .string({
            required_error: "Booth is required",
        })
        .trim()
        .min(1, "Booth is required"),

    nacId: z.string().trim().optional().or(z.literal("")),
    blockId: z.string().trim().optional().or(z.literal("")),
    gpId: z.string().trim().optional().or(z.literal("")),
    villageId: z.string().trim().optional().or(z.literal("")),
});

export const updateContactSchema = createContactSchema.partial();

export const validateCreateContact = (data) => createContactSchema.safeParse(data);
export const validateUpdateContact = (data) => updateContactSchema.safeParse(data);