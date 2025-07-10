import { envs } from "./config";
import { MongoDataBase } from "./data";
import { AppRoutes } from "./routes/routes";
import { Server } from "./server";

(() => {
  main();
})();

function main() {
  const server = new Server({ port: envs.PORT, routes: AppRoutes.routes() });
  server.start();
  const mongoDb = MongoDataBase.getInstance();
  mongoDb.connect(envs.MONGODB_URL);
  //require("./presentation/crone-jobs/alarm.crone.job");
}
//