import mongoose from "mongoose";

//aplica patron singleton
export class MongoDataBase {
  private static instance: MongoDataBase;

  // Constructor privado para evitar instancias directas
  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new MongoDataBase();
    }

    return this.instance;
  }

  async connect(mongoUrl: string) {
    try {
      await mongoose.connect(mongoUrl);
      console.log("Mongo conected");
      return;
    } catch (error) {
      console.log(error);
    }
  }
}
