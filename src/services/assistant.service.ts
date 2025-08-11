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

type UserThreadData = {
  history: Message[];
  lastActivity: number; // timestamp en ms
};

export class AssistantService {
  // ⬇️ Creamos un mapa para guardar los hilos por usuario
  private userThreads = new Map<string, UserThreadData>();
  private openai = new OpenAI({ apiKey: envs.OPEN_IA_API_KEY });

 constructor(private readonly vectorDocRepository: VectorDocRepository) {
  this.startCleanup();
}

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

    const topDocs = scored
      .filter((d) => d.score > 0.75) // umbral ajustable
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return topDocs;
  }

  async userQuestion(chatInfo: ChatDto) {
    try {
      const { userId, question } = chatInfo;
      // 🔁 Buscamos si ya hay un hilo, si no, lo iniciamos con el systemPrompt
      const contextDocs = await this.findRelevantDocs(question);
      const contextText = contextDocs.map((d) => `• ${d.content}`).join("\n");

      const baseSystemPrompt = basePrompt;

      //const dinamicSystemPrompt = buildSystemPrompt(contextText);


      let threadData = this.userThreads.get(userId);

      if (!threadData) {
        threadData = {
          history: [{ role: "system", content: baseSystemPrompt }],
          lastActivity: Date.now(),
        };
        this.userThreads.set(userId, threadData);
      }

      threadData.history.push({
        role: "user",
        content: `Contexto relevante:\n${contextText}\n\n${question}`,
      });

      threadData.lastActivity = Date.now();

      if (threadData.history.length > 20) {
        threadData.history = [
          threadData.history[0],
          ...threadData.history.slice(-18),
        ];
        threadData = {
          history: threadData.history,
          lastActivity: Date.now(),
        };
        this.userThreads.set(userId, threadData);
      }

      console.log("=================>", userId);
      console.log("xxxxxxxxxxxxx", contextText);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: threadData.history,
      });

      const llMResponse = response.choices[0].message.content ?? "";
      // ➕ Añadir respuesta de la IA al historial
      threadData.history.push({ role: "assistant", content: llMResponse });
       this.userThreads.set(userId, threadData);

      return llMResponse;
    } catch (error) {
      throw error;
    }
  }

  private startCleanup(intervalMs = 60_000, maxIdleMs = 10 * 60_000) {
  setInterval(() => {
    const now = Date.now();
    for (const [userId, { lastActivity }] of this.userThreads.entries()) {
      if (now - lastActivity > maxIdleMs) {
        this.userThreads.delete(userId);
        console.log(`🗑️ Conversación con ${userId} eliminada por inactividad.`);
      }
    }
  }, intervalMs);
}
}
