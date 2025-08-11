import { Router } from "express";
import { VectorizeContentController } from "../controllers/vectorizeContent.controller";
import { upload } from "../middlewares/multer.middleware";
import { VectorDocRepository } from "../repositories";
import { VectorizeContentService } from "../services/vectorizeContent.service";

export class VectorizeContentRoute {
  static routes(): Router {
    const router = Router();

    const repository = new VectorDocRepository();
    const service = new VectorizeContentService(repository);
    const controller = new VectorizeContentController(service);

    router.post("/upload", upload.single("file"), controller.uploadPdf);

    return router;
  }
}
