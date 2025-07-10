

export function buildSystemPrompt( contextText: string): string {
  return `

Usá el siguiente contexto para responder, si es relevante. Si no lo es, respondé normalmente.

Contexto:
${contextText.trim()}
  `.trim();
}