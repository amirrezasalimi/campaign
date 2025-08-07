import { z } from "zod";

// Utility to validate currency values
export const zCurrency = z
  .union([z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")), z.number()])
  .transform((val) => (typeof val === "string" ? Number(val) : val))
  .refine(
    (val) => typeof val === "number" && val >= 0.0001 && val <= 999999999,
    {
      message: "Number must be between 0.0001 and 999999999",
    }
  );
