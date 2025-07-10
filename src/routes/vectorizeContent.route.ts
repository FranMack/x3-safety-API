import { Router } from "express";
import { AssistantController } from "../controllers";
import { VectorDocRepository } from "../repositories";
import { AsssistantService } from "../services/assistant.service";
import { upload } from "../middlewares/multer.middleware";
import { VectorizeContentService } from "../services/vectorizeContent.service";
import { VectorizeContentController } from "../controllers/vectorizeContent.controller";

export class VectorizeContentRoute {
  static routes(): Router {
    const router = Router();

    const repository = new VectorDocRepository();
    const service = new VectorizeContentService(repository);
    const controller = new VectorizeContentController(service);

    router.post("/upload",upload.single('file'), controller.uploadPdf);

    return router;
  }
}
