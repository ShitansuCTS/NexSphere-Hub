import { z } from "zod";

export const createContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(100, "Maximum 100 characters"),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

  alternateMobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid alternate mobile")
    .optional()
    .nullable()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),

  designation: z.string().trim().optional().nullable().or(z.literal("")),

  address: z.string().trim().optional().nullable().or(z.literal("")),

  blockId: z.string().optional().nullable().or(z.literal("")),

  nacId: z.string().optional().nullable().or(z.literal("")),

  gpId: z.string().optional().nullable().or(z.literal("")),

  villageId: z.string().optional().nullable().or(z.literal("")),

  wardId: z.string().optional().nullable().or(z.literal("")),

  boothId: z.string().optional().nullable().or(z.literal("")),

  isActive: z.boolean().optional()
});

export const updateContactSchema = createContactSchema.partial();

export const validateCreateContact = (data) =>
  createContactSchema.safeParse(data);

export const validateUpdateContact = (data) =>
  updateContactSchema.safeParse(data);