import { Router } from "express";
import { AssistantController } from "../controllers";
import { VectorDocRepository } from "../repositories";
import { AsssistantService } from "../services/assistant.service";

export class AssistanRoute {
  static routes(): Router {
    const router = Router();

    const repository = new VectorDocRepository();
    const service = new AsssistantService(repository);
    const controller = new AssistantController(service);

    router.post("/chat", controller.userQuestion);

    return router;
  }
}
