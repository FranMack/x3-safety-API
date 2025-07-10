import mongoose, { Schema } from "mongoose";

const vectorDocSchema: Schema = new Schema({
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
});

export const VectorDoc = mongoose.model("VectorDoc", vectorDocSchema);
