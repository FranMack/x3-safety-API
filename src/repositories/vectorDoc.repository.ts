import { VectorDoc } from "../data";
import { VectorDocProps } from "../interfaces/vectorDoc.interface";

export class VectorDocRepository {
  async find(): Promise<VectorDocProps[]> {
    return await VectorDoc.find();
  }

  async create(data: VectorDocProps) {
    return await VectorDoc.create(data);
  }
}
