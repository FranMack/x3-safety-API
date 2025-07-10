import fs from "fs";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import { envs } from "../config";
import { VectorDocRepository } from "../repositories";

export class VectorizeContentService {
  private openai = new OpenAI({ apiKey: envs.OPEN_IA_API_KEY });
  constructor(private readonly vectorDocRepository: VectorDocRepository) {}

  private chunkText(text: string, maxLength = 1000): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + maxLength, text.length);
      chunks.push(text.slice(start, end));
      start = end;
    }

    return chunks;
  }

  async vectorizePDF(filePath: string) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const chunks = this.chunkText(data.text);

    for (const chunk of chunks) {
      const embeddingRes = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      const embedding = embeddingRes.data[0].embedding;

      await this.vectorDocRepository.create({ content: chunk, embedding });
    }

    return { message: `${chunks.length} fragmentos guardados.` };
  }
}
