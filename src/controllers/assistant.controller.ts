import { Request, Response } from "express";
import { ChatDto } from "../dtos";
import { CustomError, handleError } from "../errors";
import { AsssistantService } from "../services/assistant.service";

export class AssistantController {
  constructor(private readonly assistantService: AsssistantService) {}

  userQuestion = async (req: Request, res: Response) => {
    try {
      const [error, chatInfo] = ChatDto.create(req.body);

      if (error) {
        throw CustomError.badRequest(error);
      }

      const aswer = await this.assistantService.userQuestion(chatInfo!);

      res.status(200).json(aswer);
    } catch (error) {
      console.log(error);
      handleError(error, res);
    }
  };
}
