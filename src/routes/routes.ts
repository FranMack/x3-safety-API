import express, { Router } from "express";
import { AssistanRoute } from "./assistant.route";
import { VectorizeContentRoute } from "./vectorizeContent.route";

export class AppRoutes {
  static routes(): Router {
    const router = express.Router();

    //routes

    router.use("/assistant", AssistanRoute.routes());
     router.use("/content", VectorizeContentRoute.routes());

    return router;
  }
}
