import OpenAI from "openai";
import { envs } from "../config";
import { ChatDto } from "../dtos";
import { VectorDocRepository } from "../repositories";
import { buildSystemPrompt } from "../utils";
import { basePrompt } from "../utils/baseSystemPrompt";

// ⬇️ Definimos el tipo de mensaje
type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class AsssistantService {
  // ⬇️ Creamos un mapa para guardar los hilos por usuario
  private userThreads = new Map<string, Message[]>();
  private openai = new OpenAI({ apiKey: envs.OPEN_IA_API_KEY });
  constructor(private readonly vectorDocRepository: VectorDocRepository) {}

  async getEmbedding(text: string): Promise<number[]> {
    const res = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return res.data[0].embedding;
  }

  cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  }

  async findRelevantDocs(query: string, topK = 3) {
    const queryEmbedding = await this.getEmbedding(query);
    const allDocs = await this.vectorDocRepository.find();

    const scored = allDocs.map((doc) => ({
      content: doc.content,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async userQuestion(chatInfo: ChatDto) {
    try {
      const { userId, question } = chatInfo;
      // 🔁 Buscamos si ya hay un hilo, si no, lo iniciamos con el systemPrompt
      const contextDocs = await this.findRelevantDocs(question);
      const contextText = contextDocs.map((d) => `• ${d.content}`).join("\n");

      const baseSystemPrompt = basePrompt;

      const dinamicSystemPrompt = buildSystemPrompt(contextText);

      let history = this.userThreads.get(userId);

      if (!history) {
        history = [{ role: "system", content: baseSystemPrompt }];
        this.userThreads.set(userId, history);
      }

      // ➕ Añadir nuevo mensaje del usuario
      history.push({
        role: "user",
        content: `Contexto relevante:\n${contextText}\n\n${question}`,
      });


      console.log("xxxxxxxxxxxxx",contextText)

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: history,
      });

      const llMResponse = response.choices[0].message.content ?? "";
      // ➕ Añadir respuesta de la IA al historial
      history.push({ role: "assistant", content: llMResponse });

      return llMResponse;
    } catch (error) {
      throw error;
    }
  }
}
