import { Request, Response } from "express";
import { VectorizeContentService } from "../services/vectorizeContent.service";

export class VectorizeContentController {
  constructor(
    private readonly vectorizeContentService: VectorizeContentService
  ) {}

  uploadPdf = async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;

      if (!file) return res.status(400).json({ message: "No file uploaded" });

      const result = await this.vectorizeContentService.vectorizePDF(file.path);

      res.json(result);
    } catch (error) {
      console.error(error);
    }
  };
}
