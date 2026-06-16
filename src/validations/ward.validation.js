import { z } from "zod";

export const createWardSchema = z
  .object({
    name: z.string().min(1, "Ward name is required"),
    villageId: z.string().optional(),
    nacId: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.villageId && !data.nacId) ||
      (!data.villageId && data.nacId),
    {
      message: "Ward must belong to either Village or NAC",
    }
  );

export const updateWardSchema = createWardSchema;