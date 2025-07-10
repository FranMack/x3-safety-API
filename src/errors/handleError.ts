import { Response } from "express";
import { CustomError } from "./customErrors";

export function handleError(error: unknown, res: Response) {
  console.log(error);
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof Error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
  return;
}
