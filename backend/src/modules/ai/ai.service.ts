import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';
import { LessonGeneratorService } from './lesson-generator.service';

@Injectable()
export class AiService {
  constructor(
    public readonly chatService: ChatService,
    public readonly lessonGeneratorService: LessonGeneratorService,
  ) {}
}
