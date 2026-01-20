import { z, ZodSchema } from "zod";
import { NextRequest } from "next/server";
import { badRequest } from "./errors";

export async function validateBody<T extends ZodSchema>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw badRequest("Validation failed", error.errors);
    }
    throw badRequest("Invalid request body");
  }
}

export function validateQuery<T extends ZodSchema>(
  url: URL,
  schema: T
): z.infer<T> {
  try {
    const searchParams = Object.fromEntries(url.searchParams.entries());
    return schema.parse(searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw badRequest("Invalid query parameters", error.errors);
    }
    throw badRequest("Invalid query parameters");
  }
}

export function validateParams<T extends ZodSchema>(
  params: unknown,
  schema: T
): z.infer<T> {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw badRequest("Invalid route parameters", error.errors);
    }
    throw badRequest("Invalid route parameters");
  }
}
