import { z } from "zod";

export const createBoothSchema = z.object({
  name: z.string().min(1, "Booth name is required"),
  wardId: z.string().min(1, "Ward ID is required"),
});

export const updateBoothSchema = z.object({
  name: z.string().min(1, "Booth name is required"),
  wardId: z.string().min(1, "Ward ID is required"),
});