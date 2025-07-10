export interface ChatProps {
  userId: string;
  question: string;
}

export class ChatDto {
  readonly userId: string;
  readonly question: string;

  constructor(userId: string, question: string) {
    this.userId = userId;
    this.question = question;
  }

  static create({ userId, question }: ChatProps): [string?, ChatDto?] {
    // Validaciones del userId
    if (!userId) {
      return ["Falta el user id", undefined];
    }

    if (typeof userId !== "string") {
      return ["User id debe ser un string", undefined];
    }

    //Validaciones question

    if (!question) {
      return ["Falta el el mensaje", undefined];
    }
    if (typeof question !== "string") {
      return ["El mensaje debe ser un string", undefined];
    }

    return [undefined, new ChatDto(userId, question)];
  }
}
